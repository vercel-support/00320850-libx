import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { v4 } from 'uuid';
import { Action } from '../store';

function useDownload() {
  const dispatch = useDispatch();
  const url = new URL(import.meta.env.VITE_SPOTIFY_REDIRECT_URI);

  const downloadFile = useCallback(
    async (accessToken: string) => {
      dispatch({
        type: Action.SET_DOWNLOAD_LOADING,
        payload: true,
      });

      const filename = `libx-export-${v4()}.csv`;

      try {
        const response = await fetch(
          `https://${url.host}/api/spotify/download/${filename}?t=${accessToken}`,
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
      } catch (e: any) {
        dispatch({
          type: Action.SET_DOWNLOAD_ERROR,
          payload: `Failed to download file: ${e.toString()}`,
        });
      } finally {
        dispatch({
          type: Action.SET_DOWNLOAD_LOADING,
          payload: false,
        });

        window.location.href = '/';
      }
    },
    [dispatch, url.host]
  );

  return {
    downloadFile,
  };
}

export { useDownload };
