import json
from dataclasses import dataclass
from typing import *

T = TypeVar("T")


@dataclass
class ExternalURLs:
    spotify: str

    @classmethod
    def from_object(cls: Type[T], obj: Dict[str, Any]) -> T:
        return cls(**obj)

    def to_json(self) -> str:
        return json.dumps(
            self, default=lambda o: o.__dict__, sort_keys=True, indent=4
        )


@dataclass
class Image:
    height: Optional[int]
    url: str
    width: Optional[int]

    @classmethod
    def from_object(cls: Type[T], obj: Dict[str, Any]) -> T:
        return cls(**obj)

    def to_json(self) -> str:
        return json.dumps(
            self, default=lambda o: o.__dict__, sort_keys=True, indent=4
        )


@dataclass
class Owner:
    display_name: str
    external_urls: ExternalURLs
    href: str
    id: str
    type: str
    uri: str

    @classmethod
    def from_object(cls: Type[T], obj: Dict[str, Any]) -> T:
        obj["external_urls"] = ExternalURLs.from_object(obj["external_urls"])
        return cls(**obj)

    def to_json(self) -> str:
        return json.dumps(
            self, default=lambda o: o.__dict__, sort_keys=True, indent=4
        )


@dataclass
class Tracks:
    href: str
    total: int

    @classmethod
    def from_object(cls: Type[T], obj: Dict[str, Any]) -> T:
        return cls(**obj)

    def to_json(self) -> str:
        return json.dumps(
            self, default=lambda o: o.__dict__, sort_keys=True, indent=4
        )


@dataclass
class TrackItem:
    name: str
    artists: List[str]
    album: str
    uri: str

    @classmethod
    def from_object(cls: Type[T], obj: Dict[str, Any]) -> T:
        return cls(
            name=obj["name"],
            artists=[artist["name"] for artist in obj["artists"]],
            album=obj["album"]["name"],
            uri=obj["uri"],
        )


@dataclass
class Tracks:
    href: str
    total: int
    items: Optional[List[TrackItem]] = None

    @classmethod
    def from_object(cls: Type[T], obj: Dict[str, Any]) -> T:
        items = [
            TrackItem.from_object(item["track"])
            for item in obj.get("items", [])
        ]
        return cls(href=obj["href"], total=obj["total"], items=items)

    def to_json(self) -> str:
        return json.dumps(
            self, default=lambda o: o.__dict__, sort_keys=True, indent=4
        )


@dataclass
class PlaylistItem:
    collaborative: bool
    description: str
    external_urls: ExternalURLs
    href: str
    id: str
    images: List[Image]
    name: str
    owner: Owner
    primary_color: Optional[str]
    public: bool
    snapshot_id: str
    tracks: Tracks
    type: str
    uri: str

    @classmethod
    def from_object(cls: Type[T], obj: Dict[str, Any]) -> T:
        obj["external_urls"] = ExternalURLs.from_object(obj["external_urls"])
        obj["images"] = [
            Image.from_object(image) for image in obj.get("images", [])
        ]
        obj["owner"] = Owner.from_object(obj["owner"])
        obj["tracks"] = Tracks.from_object(obj["tracks"])
        return cls(**obj)

    def to_json(self) -> str:
        return json.dumps(
            self, default=lambda o: o.__dict__, sort_keys=True, indent=4
        )


@dataclass
class SpotifyPlaylists:
    href: str
    limit: int
    next: Optional[str]
    offset: int
    previous: Optional[str]
    total: int
    items: List[Optional[PlaylistItem]]
    tracks: Optional[Tracks] = None

    def __iter__(self):
        return iter(self.items)

    @classmethod
    def from_object(cls: Type[T], obj: Dict[str, Any]) -> T:
        items = [
            PlaylistItem.from_object(item) if item is not None else None
            for item in obj.get("items", [])
        ]
        return cls(
            href=obj["href"],
            limit=obj["limit"],
            next=obj.get("next"),
            offset=obj["offset"],
            previous=obj.get("previous"),
            total=obj["total"],
            items=items,
        )

    def to_json(self) -> dict:
        return self.__dict__


@dataclass
class ExternalURL:
    spotify: Optional[str]

    @classmethod
    def from_object(obj: Dict[str, Any]) -> "ExternalURL":
        return ExternalURL(**obj)

    def to_json(self) -> str:
        return json.dumps(
            self, default=lambda o: o.__dict__, sort_keys=True, indent=4
        )


@dataclass
class Artist:
    external_urls: Optional[ExternalURL]
    href: Optional[str]
    id: Optional[str]
    name: Optional[str]
    type: Optional[str]
    uri: Optional[str]

    @classmethod
    def from_object(obj: Dict[str, Any]) -> "Artist":
        obj["external_urls"] = ExternalURL.from_object(obj["external_urls"])
        return Artist(**obj)

    def to_json(self) -> str:
        return json.dumps(
            self, default=lambda o: o.__dict__, sort_keys=True, indent=4
        )


@dataclass
class Album:
    available_markets: List[str]
    type: Optional[str]
    album_type: Optional[str]
    href: Optional[str]
    id: Optional[str]
    images: List[Image]
    name: Optional[str]
    release_date: Optional[str]
    release_date_precision: Optional[str]
    uri: Optional[str]
    artists: List[Artist]
    external_urls: Optional[ExternalURL]
    total_tracks: Optional[int]

    @classmethod
    def from_object(obj: Dict[str, Any]) -> "Album":
        obj["artists"] = [
            Artist.from_object(artist) for artist in obj["artists"]
        ]
        obj["images"] = [Image.from_object(image) for image in obj["images"]]
        obj["external_urls"] = ExternalURL.from_object(obj["external_urls"])
        return Album(**obj)

    def to_json(self) -> str:
        return json.dumps(
            self, default=lambda o: o.__dict__, sort_keys=True, indent=4
        )


@dataclass
class Track:
    preview_url: Optional[str]
    available_markets: List[str]
    explicit: Optional[bool]
    type: Optional[str]
    episode: Optional[bool]
    track: Optional[bool]
    album: Optional[Album]
    artists: List[Artist]
    disc_number: Optional[int]
    track_number: Optional[int]
    duration_ms: Optional[int]
    external_ids: Optional[dict]
    external_urls: Optional[ExternalURL]
    href: Optional[str]
    id: Optional[str]
    name: Optional[str]
    popularity: Optional[int]
    uri: Optional[str]
    is_local: Optional[bool]

    def get_artists(self) -> str:
        return " ".join([artist.name.lower() for artist in self.artists])

    @classmethod
    def from_object(obj: Dict[str, Any]) -> "Track":
        obj["album"] = Album.from_object(obj["album"])
        obj["artists"] = [
            Artist.from_object(artist) for artist in obj["artists"]
        ]
        return Track(**obj)

    @property
    def terms(self) -> List[str]:
        items = (
            self.album.name.lower()
            + " "
            + self.name.lower()
            + " "
            + self.get_artists()
        )
        return list(filter(lambda x: x.strip() != "", items.split(" ")))

    def to_json(self) -> str:
        data = json.dumps(
            self, default=lambda o: o.__dict__, sort_keys=True, indent=4
        )
        data["terms"] = self.terms
        return json.dumps(data)


@dataclass
class VideoThumbnail:
    url: Optional[str]

    @classmethod
    def from_object(obj: Dict[str, Any]) -> "VideoThumbnail":
        return VideoThumbnail(**obj)

    def to_json(self) -> str:
        return json.dumps(
            self, default=lambda o: o.__dict__, sort_keys=True, indent=4
        )


@dataclass
class AddedBy:
    external_urls: Optional[ExternalURL]
    href: Optional[str]
    id: Optional[str]
    type: Optional[str]
    uri: Optional[str]

    @classmethod
    def from_object(obj: Dict[str, Any]) -> "AddedBy":
        obj["external_urls"] = ExternalURL.from_object(obj["external_urls"])
        return AddedBy(**obj)

    def to_json(self) -> str:
        return json.dumps(
            self, default=lambda o: o.__dict__, sort_keys=True, indent=4
        )


@dataclass
class PlaylistTrack:
    added_at: Optional[str]
    added_by: Optional[AddedBy]
    is_local: Optional[bool]
    primary_color: Optional[str]
    track: Optional[Track]
    video_thumbnail: Optional[VideoThumbnail]

    @classmethod
    def from_object(obj: Dict[str, Any]) -> "PlaylistTrack":
        obj["added_by"] = AddedBy.from_object(obj["added_by"])
        obj["track"] = Track.from_object(obj["track"])
        obj["video_thumbnail"] = VideoThumbnail.from_object(
            obj["video_thumbnail"]
        )
        return PlaylistTrack(**obj)

    def to_json(self) -> str:
        return json.dumps(
            self, default=lambda o: o.__dict__, sort_keys=True, indent=4
        )
