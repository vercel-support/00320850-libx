import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Spinner, Heading, Flex, Text } from '@chakra-ui/react';
import { State, Action } from '../store';
import BackgroundImg from '../components/BackgroundImg';
import Content from '../components/Content';
import { useExport } from '../services/Export';

const Export = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('t') as string;

  const exportLoading = useSelector((state: State) => state.export.loading);
  const downloadLoading = useSelector((state: State) => state.download.loading);
  const uploadingLoading = useSelector((state: State) => state.upload.loading);
  const title = useSelector((state: State) => state.content.title);
  const subtitle = useSelector((state: State) => state.content.subtitle);

  const { getLibraryExport, downloadFile, exportIsEmpty } = useExport();

  const anyLoading = exportLoading || downloadLoading || uploadingLoading;

  if (!accessToken) {
    window.location.href = '/404';
    return;
  }

  useEffect(() => {
    dispatch({
      type: Action.SET_CONTENT_TITLE,
      payload: 'Export your music!',
    });

    dispatch({
      type: Action.SET_CONTENT_SUBTITLE,
      payload: 'We will export your Spotify library to a CSV file.',
    });
  }, []);

  const onClick = exportIsEmpty()
    ? () => getLibraryExport(accessToken)
    : () => downloadFile();

  const btnTitle = exportIsEmpty() ? 'Export' : 'Download';

  return (
    <BackgroundImg mediaURL="/assets/img/bg.webp">
      <Content>
        <Flex w="100%" flexDirection="column" justifyContent="center">
          <Heading as="h1" size="lg" mb={4} textAlign="center">
            {title}
          </Heading>
          <Text textAlign="center" mb={4}>
            {subtitle}
          </Text>
        </Flex>
        <Flex
          flexDirection="column"
          alignItems="center"
          border="1px solid"
          h={[200, 200]}
          w={'100%'}
          mb={2}
        >
          <Button
            onClick={onClick}
            bg="black"
            color="white"
            borderRadius="10px"
            h="50px"
            w={['150px', '200px']}
            display="flex"
            alignItems="center"
            justifyContent="center"
            _hover={{ bg: 'gray.700' }}
            gap={2}
          >
            {anyLoading && <Spinner />} {btnTitle}
          </Button>
        </Flex>
      </Content>
    </BackgroundImg>
  );
};

export default Export;
