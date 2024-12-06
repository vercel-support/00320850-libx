import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BackgroundImg from '../components/BackgroundImg';
import Content from '../components/Content';
import ExportService from '../services/Export';
import ActionBtn from '../components/ActionBtn';

const Export = () => {
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('t') as string;
  const [exporting, setExporting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const url = new URL(import.meta.env.VITE_SPOTIFY_REDIRECT_URI);
  const srvc = new ExportService(url, accessToken)
    .onDownloading(setDownloading)
    .onExporting(setExporting);

  if (!accessToken) {
    window.location.href = '/404';
    return;
  }

  const actionBtn = () => {
    if (srvc.exportIsEmpty()) {
      return (
        <ActionBtn
        loading={exporting}
        onClick={srvc.getLibraryExport()}
        title="Export"
      />

      );
    }
    return (
      <ActionBtn
      loading={downloading}
      onClick={srvc.downloadFile()}
      title="Download"
    />
    );
  };

  return (
    <BackgroundImg>
      <Content>{actionBtn()}</Content>
    </BackgroundImg>
  );
};

export default Export;
