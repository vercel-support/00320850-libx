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
      }}
    >
      <div
        style={{
          border: '1px solid blue',
          width: 500,
          height: 500,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => {
            window.location.href = authUrl;
          }}
          style={{ border: '1px solid black' }}
        >
          Login with Spotify
        </button>
      </div>
    </div>
  );
}

export default Index;
