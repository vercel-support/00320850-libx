import { useSearchParams } from 'react-router-dom';
import BackgroundImg from '../components/BackgroundImg';
import Content from '../components/Content';
import { useExport } from '../services/Export';
import ActionBtn from '../components/ActionBtn';

const Export = () => {
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('t') as string;
  const { downloadFile } = useExport();

  if (!accessToken) {
    window.location.href = '/404';
    return;
  }

  return (
    <BackgroundImg mediaURL="/assets/img/bg.webp">
      <Content>
        <ActionBtn onClick={downloadFile()} title="Download" />
      </Content>
    </BackgroundImg>
  );
};

export default Export;
