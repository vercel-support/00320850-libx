import { useCallback } from 'react';
import { Null } from '../global';

type Setter = any;

class Export {
  private url: URL;
  private accessToken: string;
  private setDownloading: Null<Setter>;
  private setExporting: Null<Setter>;
  private data: Null<string>;
  private downloadURI: Null<string>;

  constructor(url: URL, accessToken: string) {
    this.url = url;
    this.accessToken = accessToken;
    this.setDownloading = null;
    this.setExporting = null;
    this.data = null;
    this.downloadURI = null;
  }

  onDownloading = useCallback((func: Setter): Export => {
    this.setDownloading = func;
    return this;
  }, []);

  onExporting = useCallback((func: Setter): Export => {
    this.setExporting = func;
    return this;
  }, []);

  getLibraryExport = useCallback(async () => {
    this.setExporting(true);
    try {
      const response = await fetch(
        `https://${this.url.host}/api/spotify/playlists?t=${this.accessToken}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'text/csv',
          },
        }
      );
      const result = await response.text();
      this.data = result;
    } catch (error) {
      console.error('Error fetching library export:', error);
    } finally {
      this.setExporting(false);
    }
  }, []);

  uploadFile = useCallback(async (filename: string) => {
    const response = await fetch(
      `https://${this.url.host}/api/upload?key=${encodeURIComponent(filename)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/csv',
        },
        body: this.data,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to upload file: (${response.status}) ${response.statusText}`
      );
    }
    console.log('File uploaded successfully');
  }, []);

  downloadFile = useCallback(async () => {
    // TODO: Use some UUID here.
    const filename = `spotify-123.csv`;
    await this.uploadFile(filename);

    this.setDownloading(true);
    try {
      const response = await fetch(
        `https://${this.url.host}/api/download/${filename}`,
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
      this.downloadURI = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = this.downloadURI;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(this.downloadURI);
    } finally {
      this.setDownloading(false);
    }
  }, []);

  exportIsEmpty = () => {
    // Download can still be "" if it fails
    return !this.data;
  };

  downloadIsEmpty = () => {
    return this.downloadURI === null;
  };
}

export default Export;
