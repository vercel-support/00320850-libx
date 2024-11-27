import os
import sys
import logging
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
import boto3
from flask import Flask, request, redirect, session, jsonify
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
spotify_client_id = os.environ["SPOTIFY_CLIENT_ID"]
spotify_client_secret = os.environ["SPOTIFY_CLIENT_SECRET"]
redirect_uri = os.environ["SPOTIFY_REDIRECT_URI"]
scope = [
    "playlist-read-private",
    "user-library-read",
]
bucket_name = os.environ["R2_BUCKET_NAME"]
endpoint_url = os.environ["R2_ENDPOINT_URL"]
access_key_id = os.environ["R2_ACCESS_KEY_ID"]
secret_access_key = os.environ["R2_SECRET_ACCESS_KEY"]


app = Flask(__name__)
app.secret_key = os.urandom(32)

spotify = SpotifyOAuth(
    client_id=spotify_client_id,
    client_secret=spotify_client_secret,
    redirect_uri=redirect_uri,
    scope=scope,
)

s3 = boto3.client(
    "s3",
    endpoint_url=endpoint_url,
    aws_access_key_id=access_key_id,
    aws_secret_access_key=secret_access_key,
)


# TODO: Finish
@app.route("/api/get-presigned-url", methods=["POST"])
def get_presigned_url():
    data = request.json
    filename = data.get("filename", "export.json")

    upload_url = s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": bucket_name,
            "Key": filename,
            "ContentType": "application/json",
        },
        ExpiresIn=3600,
    )

    download_url = s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": bucket_name, "Key": filename},
        ExpiresIn=3600,
    )

    return jsonify({"uploadURL": upload_url, "downloadURLs": download_url})


@app.route("/api/spotify/callback")
@cross_origin(origin="*", supports_credentials=True)
def spotify_callback():
    session.clear()
    code = request.args.get("code")
    token_info = spotify.get_access_token(code)
    session["token_info"] = token_info
    access_token = token_info["access_token"]
    return redirect(f"http://localhost:5173/x?t={access_token}")


@app.route("/api/spotify/playlists")
@cross_origin(origin="*", supports_credentials=True)
def get_playlists():
    access_token = request.args.get("t")
    if not access_token:
        response = {
            "error": "Unauthorized",
            "message": "Session expired or invalid",
        }
        return app.response_class(
            response=json.dumps(response),
            status=401,
            mimetype="application/json",
        )

    # access_token = token_info["access_token"]
    client = Spotify(auth=access_token)

    playlists = SpotifyPlaylists.from_object(client.current_user_playlists())
    for playlist in playlists:
        if playlist is not None:
            tracks = Tracks.from_object(client.playlist_tracks(playlist.id))
            playlist.tracks = tracks

    return playlists.to_json()


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

    app.run(debug=True, port=8000)
