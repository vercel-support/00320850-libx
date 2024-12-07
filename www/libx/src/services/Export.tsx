import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { v4 } from 'uuid';
import { Action, State } from '../store';
import { AnyError } from '../global';

function useExport() {
  const dispatch = useDispatch();
  const data = useSelector((state: State) => state.export.data);
  const downloadURI = useSelector((state: State) => state.download.downloadURI);
  const url = new URL(import.meta.env.VITE_SPOTIFY_REDIRECT_URI);

  const getLibraryExport = useCallback(async (accessToken: string) => {
    dispatch({
      type: Action.SET_EXPORT_LOADING,
      payload: true,
    });
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
      dispatch({
        type: Action.SET_EXPORT_DATA,
        payload: result,
      });

      dispatch({
        type: Action.SET_CONTENT_TITLE,
        payload: 'Download your music!',
      });

      dispatch({
        type: Action.SET_CONTENT_SUBTITLE,
        payload:
          'Your music has been exported. Click the button below to download it.',
      });
    } catch (error) {
      console.error('Error fetching library export:', error);
      dispatch({
        type: Action.SET_EXPORT_ERROR,
        payload: error,
      });
    } finally {
      dispatch({
        type: Action.SET_EXPORT_LOADING,
        pyaload: false,
      });
    }
  }, []);

  const uploadFile = useCallback(async (filename: string) => {
    dispatch({
      type: Action.SET_UPLOAD_LOADING,
      payload: true,
    });
    try {
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
        dispatch({
          type: Action.SET_UPLOAD_ERROR,
          payload: new Error(
            `Failed to upload file: (${response.status}) ${response.statusText}`
          ),
        });
        return;
      }

      dispatch({
        type: Action.SET_UPLOAD_COMPLETE,
        payload: true,
      });
    } catch (e: AnyError) {
      console.error('Error uploading file:', e);
      dispatch({
        type: Action.SET_UPLOAD_ERROR,
        payload: e,
      });
    } finally {
      dispatch({
        type: Action.SET_UPLOAD_LOADING,
        payload: false,
      });
    }
  }, []);

  const downloadFile = useCallback(async () => {
    dispatch({
      type: Action.SET_DOWNLOAD_LOADING,
      payload: true,
    });

    const filename = `libx-export-${v4()}.csv`;
    await uploadFile(filename);

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
        dispatch({
          type: Action.SET_DOWNLOAD_ERROR,
          payload: new Error(
            `Failed to download file: (${response.status}) ${response.statusText}`
          ),
        });
        return;
      }

      const blob = await response.blob();
      const uri = window.URL.createObjectURL(blob);

      dispatch({
        type: Action.SET_DOWNLOAD_URI,
        payload: uri,
      });
      const link = document.createElement('a');
      link.href = uri;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(uri);
    } finally {
      dispatch({
        type: Action.SET_DOWNLOAD_LOADING,
        payload: false,
      });

      window.location.href = '/';
    }
  }, []);

  const exportIsEmpty = () => {
    return data === null;
  };

  const downloadIsEmpty = () => {
    return downloadURI === null;
  };

  return {
    getLibraryExport,
    downloadFile,
    exportIsEmpty,
    downloadIsEmpty,
  };
}

export { useExport };
