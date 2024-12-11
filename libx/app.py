import os
import sys
import json
import csv
import io
import base64
import logging
from io import BytesIO
from dotenv import load_dotenv
import boto3
from typing import *
from flask import (
    Flask,
    request,
    redirect,
    send_file,
    Response,
    send_from_directory,
)
from http import HTTPStatus
from flask_cors import CORS, cross_origin
import httpx

load_dotenv()

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger(__name__)


spotify_client_id = os.environ["SPOTIFY_CLIENT_ID"]
spotify_client_secret = os.environ["SPOTIFY_CLIENT_SECRET"]
spotify_redirect_uri = os.environ["SPOTIFY_REDIRECT_URI"]
spotify_scope = [
    "playlist-read-private",
    "user-library-read",
]
spotify_api_base_url = "https://api.spotify.com/v1"

r2_bucket_name = os.environ["R2_BUCKET_NAME"]
r2_access_key_id = os.environ["R2_ACCESS_KEY_ID"]
r2_account_id = os.environ["R2_ACCOUNT_ID"]
r2_secret_access_key = os.environ["R2_SECRET_ACCESS_KEY"]
r2_endpoint_url = f"https://{r2_account_id}.r2.cloudflarestorage.com"
r2_operation_timeout = 3600

app = Flask(__name__, static_folder="../www/libx/dist", static_url_path="")
app.secret_key = os.urandom(32)

boto = boto3.client(
    "s3",
    endpoint_url=r2_endpoint_url,
    aws_access_key_id=r2_access_key_id,
    aws_secret_access_key=r2_secret_access_key,
)


def get_spotify_token(code: str) -> dict:
    spotify_token_url = "https://accounts.spotify.com/api/token"
    try:
        client_credentials = f"{spotify_client_id}:{spotify_client_secret}"
        encoded_credentials = base64.b64encode(
            client_credentials.encode()
        ).decode()

        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": spotify_redirect_uri,
        }

        response = httpx.post(spotify_token_url, headers=headers, data=data)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching Spotify token: {e}")
        raise


def get_spotify_playlists(access_token: str) -> list:
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = httpx.get(
            f"{spotify_api_base_url}/me/playlists", headers=headers
        )
        response.raise_for_status()
        return response.json()["items"]
    except Exception as e:
        logger.error(f"Error fetching Spotify playlists: {e}")
        raise


def get_saved_tracks(access_token: str) -> list:
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        saved_tracks = []
        url = f"{spotify_api_base_url}/me/tracks"
        while url:
            response = httpx.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            saved_tracks.extend(data["items"])
            url = data.get("next")
        return saved_tracks
    except Exception as e:
        logger.error(f"Error fetching saved tracks: {e}")
        raise


def get_saved_albums(access_token: str) -> list:
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        saved_albums = []
        url = f"{spotify_api_base_url}/me/albums"
        while url:
            response = httpx.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            saved_albums.extend(data["items"])
            url = data.get("next")
        return saved_albums
    except Exception as e:
        logger.error(f"Error fetching saved albums: {e}")
        raise


def get_playlist_tracks(access_token: str, playlist_id: str) -> list:
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = httpx.get(
            f"{spotify_api_base_url}/playlists/{playlist_id}/tracks",
            headers=headers,
        )
        response.raise_for_status()
        return response.json()["items"]
    except Exception as e:
        logger.error(f"Error fetching playlist tracks: {e}")
        raise


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.errorhandler(404)
def fallback(e: Exception):
    return send_from_directory(app.static_folder, "index.html")


@app.route("/<path:path>")
def serve_arbitrary(path: str):
    try:
        return send_from_directory(app.static_folder, path)
    except:
        return send_from_directory(app.static_folder, "index.html")


@app.route("/api/spotify/download/<filename>", methods=["GET"])
@cross_origin(supports_credentials=True)
def download_spotify_library(filename: str):
    try:
        access_token = request.args.get("t")
        if not access_token:
            response = {
                "error": "Unauthorized",
                "message": "Session expired or invalid",
            }
            return app.response_class(
                response=json.dumps(response),
                status=HTTPStatus.UNAUTHORIZED,
                mimetype="application/json",
            )

        buff = io.StringIO()
        writer = csv.writer(buff)
        headers = [
            "Type",
            "Playlist Name / Album Name",
            "Owner / Album Artist",
            "Playlist URI / Album URI",
            "Track Name",
            "Artists",
            "Album",
            "Track URI",
        ]
        writer.writerow(headers)

        playlists = get_spotify_playlists(access_token)
        for playlist in playlists:
            if not playlist:
                continue

            playlist_name = playlist.get("name", "Unknown")
            owner = playlist.get("owner", {}).get("display_name", "Unknown")
            playlist_uri = playlist.get("uri", "Unknown")

            tracks = get_playlist_tracks(access_token, playlist["id"])

            for track_item in tracks:
                track = track_item.get("track", {})
                track_name = track.get("name", "Unknown")
                artists = ", ".join(
                    artist["name"] for artist in track.get("artists", [])
                )
                album = track.get("album", {}).get("name", "Unknown")
                track_uri = track.get("uri", "Unknown")

                writer.writerow(
                    [
                        "Playlist",
                        playlist_name,
                        owner,
                        playlist_uri,
                        track_name,
                        artists,
                        album,
                        track_uri,
                    ]
                )

        saved_tracks = get_saved_tracks(access_token)
        for track_item in saved_tracks:
            track = track_item.get("track", {})
            track_name = track.get("name", "Unknown")
            artists = ", ".join(
                artist["name"] for artist in track.get("artists", [])
            )
            album = track.get("album", {}).get("name", "Unknown")
            track_uri = track.get("uri", "Unknown")

            writer.writerow(
                [
                    "Saved Track",
                    "",
                    "",
                    "",
                    track_name,
                    artists,
                    album,
                    track_uri,
                ]
            )

        saved_albums = get_saved_albums(access_token)
        for album_item in saved_albums:
            album = album_item.get("album", {})
            album_name = album.get("name", "Unknown")
            album_artist = ", ".join(
                artist["name"] for artist in album.get("artists", [])
            )
            album_uri = album.get("uri", "Unknown")

            for track in album.get("tracks", {}).get("items", []):
                track_name = track.get("name", "Unknown")
                artists = ", ".join(
                    artist["name"] for artist in track.get("artists", [])
                )
                track_uri = track.get("uri", "Unknown")

                writer.writerow(
                    [
                        "Saved Album",
                        album_name,
                        album_artist,
                        album_uri,
                        track_name,
                        artists,
                        album_name,
                        track_uri,
                    ]
                )

        content = buff.getvalue()

        boto.put_object(
            Bucket=r2_bucket_name,
            Key=filename,
            Body=content,
            ContentType="text/csv",
        )

        return send_file(
            BytesIO(content.encode("utf-8")),
            as_attachment=True,
            download_name=filename,
            mimetype="text/csv",
        )
    except boto.exceptions.NoSuchKey:
        logger.error(f"Resource not found: {filename}")
        body = json.dumps({"error": "Resource not found"})
        return Response(
            body, status=HTTPStatus.NOT_FOUND, mimetype="application/json"
        )
    except Exception as e:
        logger.error(f"Error downloading Spotify library: {e}")
        body = json.dumps({"error": str(e)})
        return Response(
            body,
            status=HTTPStatus.INTERNAL_SERVER_ERROR,
            mimetype="application/json",
        )


@app.route("/api/spotify/callback")
@cross_origin(supports_credentials=True)
def spotify_callback():
    # Apparently Spotify is using Implicit Grant Flow?
    return redirect("/")


if __name__ == "__main__":

    app.config["SESSION_TYPE"] = "filesystem"
    app.config["SESSION_PERMANENT"] = True
    app.config["SESSION_COOKIE_NAME"] = "spotify-login-session"
    app.config["SESSION_COOKIE_SAMESITE"] = "None"
    app.config["SESSION_COOKIE_SECURE"] = True

    CORS(
        app,
        resources={r"/*": {"origins": ["*"]}},
        supports_credentials=True,
    )

    debug = os.environ.get("ENV", "development") == "development"
    app.run(debug=debug)
