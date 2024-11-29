import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type ActionButtonProps = {
  exporting: boolean;
  downloading: boolean;
  data: JSON | null;
  onExport: () => Promise<void>;
  onDownload: () => Promise<void>;
};

const ActionButton = ({
  exporting,
  downloading,
  data,
  onExport,
  onDownload,
}: ActionButtonProps) => {
  const isLoading = exporting || downloading;

  const getLabel = () => {
    if (isLoading) return 'Loading...';
    return data ? 'Download Data' : 'Export Data';
  };

  const handleClick = async () => {
    if (data) {
      await onDownload();
    } else {
      await onExport();
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{ border: '1px solid black' }}
      disabled={isLoading}
    >
      {getLabel()}
    </button>
  );
};

const Export = () => {
  const url = new URL(import.meta.env.VITE_SPOTIFY_REDIRECT_URI);
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('t');
  const [exporting, setExporting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState(null);

  const getLibraryExport = useCallback(async () => {
    setExporting(true);
    try {
      const response = await fetch(
        `https://${url.host}/api/spotify/playlists?t=${accessToken}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching library export:', error);
    } finally {
      setExporting(false);
    }
  }, [accessToken, url]);

  const uploadFile = useCallback(async (data: JSON, filename: string) => {
    const response = await fetch(`https://${url.host}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: JSON.stringify(data),
        key: filename,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to backend');
    }
    console.log('File uploaded successfully via backend');
  }, []);

  const downloadFile = useCallback(async (filename: string) => {
    setDownloading(true);
    try {
      const response = await fetch(
        `https://${url.host}/api/download/${filename}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload file to backend');
      }

      // Create a blob and trigger a download
      const blob = await response.blob();
      const uri = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = uri;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(uri);

      if (!response.ok) {
        throw new Error('Failed to download file.');
      }

      const fileData = await response.json();
      console.log('Downloaded file:', fileData);
    } finally {
      setDownloading(false);
    }
  }, []);

  const handleFileUploadAndDownload = useCallback(
    async (filename: string, data: any) => {
      try {
        await uploadFile(data, filename);
        await downloadFile(filename);
      } catch (error) {
        console.error('Error handling process:', error);
      }
    },
    [uploadFile, downloadFile]
  );

  return (
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
        <ActionButton
          exporting={exporting}
          downloading={downloading}
          data={data}
          onExport={getLibraryExport}
          onDownload={() =>
            handleFileUploadAndDownload('spotify-data.json', data)
          }
        />
      </div>
    </div>
  );
};

export default Export;
