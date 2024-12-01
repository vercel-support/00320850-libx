import Spotify from './../assets/icons/Spotify';
import './../css/Index.css';
import './../css/global.css';

function Index() {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectURI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  const scopes = ['playlist-read-private', 'user-library-read'];

  const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectURI)}&scope=${scopes.join('%20')}`;

  return (
    <div className="app-container">
      <div className="content-box">
        <h1>Save your music!</h1>
        <p>
          I built a tool that lets you save your Spotify playlists—because
          losing your carefully curated music is a nightmare no one should face.
          Now, whether you’re switching platforms or recovering from a digital
          disaster, your playlists are always safe and sound.
        </p>
        <h3>Login with:</h3>
        <div className="login-section">
          <button
            onClick={() => {
              window.location.href = authUrl;
            }}
            className="login-button"
          >
            <span>
              <Spotify />
            </span>
            <p>Spotify</p>
          </button>
        </div>
        <div className="socials">
          <div className="coffee-button">
            <a href="https://www.buymeacoffee.com/rashad.wiki">
              <img
                style={{ width: 150 }}
                src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=rashad.wiki&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff"
                alt="Buy me a coffee"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
