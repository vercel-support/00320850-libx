import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import IconCheckmarkCircleOutline from '../assets/CheckmarkCircleOutline';
import './../css/Export.css';
import './../css/global.css';

type ActionButtonProps = {
  exporting: boolean;
  downloading: boolean;
  downloaded: boolean;
  data: string | null;
  onExport: () => Promise<void>;
  onDownload: () => Promise<void>;
};

const ActionButton = ({
  exporting,
  downloading,
  downloaded,
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

  if (downloaded) {
    return <IconCheckmarkCircleOutline />;
  }

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
  const [downloaded, setDownloaded] = useState(false);
  const [data, setData] = useState<string | null>(null);

  const getLibraryExport = useCallback(async () => {
    setExporting(true);
    try {
      const response = await fetch(
        `https://${url.host}/api/spotify/playlists?t=${accessToken}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'text/csv',
          },
        }
      );
      const result = await response.text();
      setData(result);
    } catch (error) {
      console.error('Error fetching library export:', error);
    } finally {
      setExporting(false);
    }
  }, [accessToken, url]);

  const uploadFile = useCallback(async (data: string, filename: string) => {
    const response = await fetch(
      `https://${url.host}/api/upload?key=${encodeURIComponent(filename)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/csv',
        },
        body: data,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to upload file: (${response.status}) ${response.statusText}`
      );
    }
    console.log('File uploaded successfully');
  }, []);

  const downloadFile = useCallback(async (filename: string) => {
    setDownloading(true);
    try {
      const response = await fetch(
        `https://${url.host}/api/download/${filename}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'text/csv',
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to upload file: (${response.status}) ${response.statusText}`
        );
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
      setDownloaded(true);
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
        console.error('Error downloading file:', error);
      }
    },
    [uploadFile, downloadFile]
  );

  const infoHeading = () => {
    if (downloaded) {
      return (
        <>
          <h2>Your library export has been downloaded!</h2>
          <p>Click the button below to generate a new export.</p>
        </>
      );
    }
    if (data) {
      return (
        <>
          <h2>Your library export is ready!</h2>
          <p>Click the button below to download your data.</p>
        </>
      );
    }

    return (
      <>
        <h2>Generate your library export</h2>
        <p>This will generate an export for your entire Spotify library.</p>
      </>
    );
  };

  return (
    <div className="app-container">
      <div className="content-box">
        {infoHeading()}
        <ActionButton
          exporting={exporting}
          downloading={downloading}
          downloaded={downloaded}
          data={data}
          onExport={getLibraryExport}
          // TODO: Use UUID for filename
          onDownload={() =>
            handleFileUploadAndDownload('spotify-data.csv', data)
          }
        />
      </div>
    </div>
  );
};

export default Export;
