import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Button, Flex, Heading, Text, Spinner } from '@chakra-ui/react';
import IconCheckmarkCircleOutlineIcon from '../assets/CheckmarkCircleOutlineIcon';
import { AnyError } from '../global';

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
    return <IconCheckmarkCircleOutlineIcon />;
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      bg="black"
      color="white"
      border="1px solid black"
      borderRadius="10px"
      h="50px"
      w={['150px', '200px']}
      display="flex"
      alignItems="center"
      justifyContent="center"
      _hover={{ bg: 'gray.700' }}
      gap={2}
    >
      {isLoading && <Spinner size="sm" color="white" />}
      {getLabel()}
    </Button>
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

  const uploadFile = useCallback(
    async (data: string | null, filename: string) => {
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
    },
    []
  );

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
        alert(
          `Failed to upload file: (${response.status}) ${response.statusText}`
        );
        return;
      }

      const blob = await response.blob();
      const uri = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = uri;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(uri);

      setDownloaded(true);
    } finally {
      setDownloading(false);
    }
  }, []);

  const handleFileUploadAndDownload = useCallback(
    async (filename: string, data: string | null) => {
      try {
        await uploadFile(data, filename);
        await downloadFile(filename);
      } catch (e: AnyError) {
        alert(`Error downloading file: ${e.toString()}`);
        return;
      }
    },
    [uploadFile, downloadFile]
  );

  const infoHeading = () => {
    if (downloaded) {
      return (
        <>
          <Heading as="h2" size="lg" mb={4} textAlign="center">
            Your library export has been downloaded!
          </Heading>
          <Text textAlign="center">
            Click the button below to generate a new export.
          </Text>
        </>
      );
    }
    if (data) {
      return (
        <>
          <Heading as="h2" size="lg" mb={4} textAlign="center">
            Your library export is ready!
          </Heading>
          <Text textAlign="center">
            Click the button below to download your data.
          </Text>
        </>
      );
    }

    return (
      <>
        <Heading as="h2" size="lg" mb={4} textAlign="center">
          Generate your library export
        </Heading>
        <Text textAlign="center">
          This will generate an export for your entire Spotify library.
        </Text>
      </>
    );
  };

  return (
    <Box
      w="100vw"
      h="100vh"
      bg="black"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      border="1px solid red"
    >
      <Flex
        flexDirection="column"
        w={['90%', '500px']}
        h={['auto', '500px']}
        alignItems="center"
        color="white"
        border="1px solid blue"
        p={4}
      >
        {infoHeading()}
        <ActionButton
          exporting={exporting}
          downloading={downloading}
          downloaded={downloaded}
          data={data}
          onExport={getLibraryExport}
          onDownload={() =>
            handleFileUploadAndDownload('spotify-data.csv', data)
          }
        />
      </Flex>
    </Box>
  );
};

export default Export;
