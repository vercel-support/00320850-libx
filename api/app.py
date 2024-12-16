import os
import sys
import json
import asyncio
import csv
import io
import base64
import logging
from typing import *
from io import BytesIO
from dotenv import load_dotenv
import boto3
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


def safeget(d: dict, key: str, default: Optional[Any] = None) -> Any:
    return d[key] if isinstance(d, dict) and key in d else default


def get_spotify_token(code: str) -> dict:
    spotify_token_url = "https://accounts.spotify.com/api/token"
    try:
        credentials = f"{spotify_client_id}:{spotify_client_secret}"
        credentials = base64.b64encode(credentials.encode()).decode()

        headers = {
            "Authorization": f"Basic {credentials}",
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


async def fetch_url(client, url, headers):
    try:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching URL {url}: {e}")
        return None


async def get_spotify_playlists(access_token: str) -> list:
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {access_token}"}
        data = await fetch_url(
            client,
            f"{spotify_api_base_url}/me/playlists?fields=items(name,owner(display_name),uri,id)",
            headers,
        )
        return data.get("items", []) if data else []


async def get_saved_tracks(access_token: str) -> list:
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {access_token}"}
        saved_tracks = []
        url = f"{spotify_api_base_url}/me/tracks"
        while url:
            data = await fetch_url(client, url, headers)
            if not data:
                break
            saved_tracks.extend(data["items"])
            url = data.get("next")
        return saved_tracks


async def get_saved_albums(access_token: str) -> list:
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {access_token}"}
        saved_albums = []
        url = f"{spotify_api_base_url}/me/albums"
        while url:
            data = await fetch_url(client, url, headers)
            if not data:
                break
            saved_albums.extend(data["items"])
            url = data.get("next")
        return saved_albums


async def get_playlist_tracks(access_token: str, playlist_id: str) -> list:
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {access_token}"}
            url = f"{spotify_api_base_url}/playlists/{playlist_id}/tracks"
            tracks = []
            while url:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                data = response.json()
                tracks.extend(data.get("items", []))
                url = data.get("next")
            return tracks
    except Exception as e:
        logger.error(f"Error fetching playlist tracks for {playlist_id}: {e}")
        return []


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


async def fetch_playlists_and_tracks(access_token: str):
    try:
        playlists = await get_spotify_playlists(access_token)

        async def fetch_tracks(playlist):
            playlist_id = playlist.get("id")
            list_tracks = await get_playlist_tracks(access_token, playlist_id)
            return playlist, list_tracks

        results = await asyncio.gather(
            *(fetch_tracks(playlist) for playlist in playlists),
            return_exceptions=True,
        )

        playlist_tracks = []
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Error fetching tracks: {result}")
                continue
            playlist, tracks = result
            playlist_tracks.append((playlist, tracks))
        return playlist_tracks

    except Exception as e:
        logger.error(f"Error fetching playlists and tracks: {e}")
        return []


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

        async def process_and_upload():

            async def gather_data():
                pt = await fetch_playlists_and_tracks(access_token)
                t = await get_saved_tracks(access_token)
                a = await get_saved_albums(access_token)
                return pt, t, a

            playlists_and_tracks, saved_tracks, saved_albums = (
                await gather_data()
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

            rows = []

            for playlist, tracklist in playlists_and_tracks:
                if not playlist or not tracklist:
                    continue

                playlist_name = safeget(playlist, "name", "Unknown")
                owner = safeget(
                    safeget(playlist, "owner", {}), "display_name", "Unknown"
                )
                playlist_uri = safeget(playlist, "uri", "Unknown")

                for track_item in tracklist:
                    if not track_item:
                        continue
                    track = safeget(track_item, "track", {})
                    track_name = safeget(track, "name", "Unknown")
                    artists = "+ ".join(
                        filter(
                            None,
                            (
                                safeget(artist, "name")
                                for artist in safeget(track, "artists", [])
                            ),
                        )
                    )
                    album = safeget(
                        safeget(track, "album", {}), "name", "Unknown"
                    )
                    track_uri = safeget(track, "uri", "Unknown")

                    rows.append(
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

            for track_item in saved_tracks:
                if not track_item:
                    continue
                track = safeget(track_item, "track", {})
                track_name = safeget(track, "name", "Unknown")
                artists = "+ ".join(
                    filter(
                        None,
                        (
                            safeget(artist, "name")
                            for artist in safeget(track, "artists", [])
                        ),
                    )
                )
                album = safeget(safeget(track, "album", {}), "name", "Unknown")
                track_uri = safeget(track, "uri", "Unknown")

                rows.append(
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

            for album_item in saved_albums:
                if not album_item:
                    continue
                album = safeget(album_item, "album", {})
                album_name = safeget(album, "name", "Unknown")
                album_artist = "+ ".join(
                    filter(
                        None,
                        (
                            safeget(artist, "name")
                            for artist in safeget(album, "artists", [])
                        ),
                    )
                )
                album_uri = safeget(album, "uri", "Unknown")

                for track in safeget(safeget(album, "tracks", {}), "items", []):
                    if not track:
                        continue

                    track_name = safeget(track, "name", "Unknown")
                    artists = "+ ".join(
                        filter(
                            None,
                            (
                                safeget(artist, "name")
                                for artist in safeget(track, "artists", [])
                            ),
                        )
                    )
                    track_uri = safeget(track, "uri", "Unknown")

                    rows.append(
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

            writer.writerow(headers)
            writer.writerows(rows)
            data = buff.getvalue()

            boto.put_object(
                Bucket=r2_bucket_name,
                Key=filename,
                Body=data,
                ContentType="text/csv",
            )

            return data

        content = asyncio.run(process_and_upload())

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
