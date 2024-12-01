import os
import sys
import logging
from urllib.parse import urlparse
from io import BytesIO
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
import boto3
from flask import (
    Flask,
    request,
    redirect,
    session,
    send_file,
    Response,
    send_from_directory,
)
from http import HTTPStatus
from flask_cors import CORS, cross_origin
from flask_session import Session
from typing import *

from .types import *

load_dotenv()

T = TypeVar("T")

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger(__name__)


def extract_domain(url: str) -> str:
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}"


# Spotify config
spotify_client_id = os.environ["SPOTIFY_CLIENT_ID"]
spotify_client_secret = os.environ["SPOTIFY_CLIENT_SECRET"]
spotify_redirect_uri = os.environ["SPOTIFY_REDIRECT_URI"]
spotify_scope = [
    "playlist-read-private",
    "user-library-read",
]

# Cloudfare R2 config
r2_bucket_name = os.environ["R2_BUCKET_NAME"]
r2_access_key_id = os.environ["R2_ACCESS_KEY_ID"]
r2_account_id = os.environ["R2_ACCOUNT_ID"]
r2_secret_access_key = os.environ["R2_SECRET_ACCESS_KEY"]
r2_endpoint_url = f"https://{r2_account_id}.r2.cloudflarestorage.com"
r2_operation_timeout = 3600

app = Flask(__name__, static_folder="../www/libx/dist", static_url_path="")
app.secret_key = os.urandom(32)
port = os.environ.get("PORT", 5000)
env = os.environ.get("ENV", "development")

spotify = SpotifyOAuth(
    client_id=spotify_client_id,
    client_secret=spotify_client_secret,
    redirect_uri=spotify_redirect_uri,
    scope=spotify_scope,
)

boto = boto3.client(
    "s3",
    endpoint_url=r2_endpoint_url,
    aws_access_key_id=r2_access_key_id,
    aws_secret_access_key=r2_secret_access_key,
)


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.errorhandler(404)
def fallback(_e: Exception):
    return send_from_directory(app.static_folder, "index.html")


@app.route("/<path:path>")
def serve_arbitrary(path: str):
    try:
        return send_from_directory(app.static_folder, path)
    except:
        return send_from_directory(app.static_folder, "index.html")


@app.route("/api/upload", methods=["POST"])
@cross_origin(supports_credentials=True)
def upload_file():
    file_key = request.args.get("key")
    file_data = request.get_data(as_text=True)

    boto.put_object(
        Bucket=r2_bucket_name,
        Key=file_key,
        Body=file_data,
        ContentType="text/csv",
    )

    body = json.dumps({"message": "File uploaded successfully"})
    return Response(body, status=HTTPStatus.OK, mimetype="application/json")


@app.route("/api/download/<filename>", methods=["GET"])
@cross_origin(supports_credentials=True)
def download_from_r2(filename: str):
    try:
        response = boto.get_object(Bucket=r2_bucket_name, Key=filename)
        file_content = response["Body"].read()

        return send_file(
            BytesIO(file_content),
            as_attachment=True,
            download_name=filename,
            mimetype="text/csv",
        )
    except boto.exceptions.NoSuchKey:
        body = json.dumps({"error": "Resource not found"})
        return Response(body, status=HTTPStatus.NOT_FOUND, mimetype="text/csv")
    except Exception as e:
        body = json.dumps({"error": str(e)})
        return Response(
            body,
            status=HTTPStatus.INTERNAL_SERVER_ERROR,
            mimetype="application/json",
        )


@app.route("/api/spotify/callback")
@cross_origin(supports_credentials=True)
def spotify_callback():
    code = request.args.get("code")
    token_info = spotify.get_access_token(code)
    session["token_info"] = token_info
    access_token = token_info["access_token"]
    domain = extract_domain(spotify_redirect_uri)
    return redirect(f"{domain}/x?t={access_token}")


@app.route("/api/spotify/playlists")
@cross_origin(supports_credentials=True)
def get_playlists():
    access_token = request.args.get("t")
    if not access_token:
        response = {
            "error": "Unauthorized",
            "message": "Session expired or invalid",
        }
        return app.response_class(
            response=json.dumps(response),
            status=HTTPStatus.UNAUTHORIZED,
            mimetype="text/csv",
        )

    client = Spotify(auth=access_token)

    playlists = SpotifyPlaylists.from_object(client.current_user_playlists())
    for playlist in playlists:
        if playlist is not None:
            playlist.tracks = Tracks.from_object(
                client.playlist_tracks(playlist.id)
            )

    csv_content = playlists.to_csv()

    return Response(
        csv_content,
        status=HTTPStatus.OK,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=playlists.csv"},
    )


if __name__ == "__main__":

    app.config["SESSION_TYPE"] = "filesystem"
    app.config["SESSION_PERMANENT"] = False
    app.config["SESSION_COOKIE_NAME"] = "spotify-login-session"
    app.config["SESSION_COOKIE_DOMAIN"] = "localhost"
    app.config["SESSION_COOKIE_SAMESITE"] = "None"
    app.config["SESSION_COOKIE_SECURE"] = True

    Session(app)
    CORS(
        app,
        resources={r"/*": {"origins": ["*"]}},
        supports_credentials=True,
    )

    debug = env == "development"
    app.run(debug=debug, port=port)
