import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function Index() {
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('t');
  const [exporting, setExporting] = useState(false);
  const [data, setData] = useState(null);

  const getLibraryExport = useCallback(async () => {
    setExporting(true);
    const res = await fetch(
      `https://8eb5ebeb72cb.ngrok.app/api/spotify/playlists?t=${accessToken}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const data = await res.json();
    setData(data);
    setExporting(false);
  }, [accessToken]);

  const downloadExport = useCallback(() => {
    // TODO: Finish
  }, []);

  return (
    <>
      <div
        style={{
          border: '1px solid red',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
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
          {exporting ? (
            <div
              style={{
                border: '1px solid green',
                width: 500,
                height: 500,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <p>Loading...</p>
            </div>
          ) : data ? (
            <button
              onClick={downloadExport}
              style={{ border: '1px solid black' }}
            >
              Download Data
            </button>
          ) : (
            <button
              onClick={getLibraryExport}
              style={{ border: '1px solid black' }}
            >
              Export Data
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default Index;
