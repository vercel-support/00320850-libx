import Spotify from './../assets/icons/Spotify';

function Index() {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectURI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  const scopes = ['playlist-read-private', 'user-library-read'];

  const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectURI)}&scope=${scopes.join('%20')}`;

  return (
    <div
      style={{
        border: '1px solid red',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'black',
      }}
    >
      <div
        style={{
          border: '1px solid blue',
          flexDirection: 'column',
          width: 500,
          height: 500,
          display: 'flex',
          alignItems: 'center',
          color: 'white',
        }}
      >
        <h1>Save your music!</h1>
        <p style={{ textAlign: 'center' }}>
          I built a tool that lets you save your Spotify playlists—because
          losing your carefully curated music is a nightmare no one should face.
          Now, whether you’re switching platforms or recovering from a digital
          disaster, your playlists are always safe and sound.
        </p>
        <h3>Login with:</h3>
        <button
          onClick={() => {
            window.location.href = authUrl;
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid white',
            cursor: 'pointer',
            backgroundColor: 'black',
            borderRadius: 10,
            gap: '8px',
            height: 50,
            width: 200,
          }}
        >
          <span>
            <Spotify fill="#1DB954" height="1.2em" width="1.2em" />
          </span>
          <p style={{ color: 'white' }}>Spotify</p>
        </button>
        <div style={{ border: '1px solid red' }}>
          <a href="https://www.buymeacoffee.com/rashad.wiki">
            <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=rashad.wiki&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Index;
