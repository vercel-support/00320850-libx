import { useEffect } from 'react';
import { Box, Button, Flex, Text, Spinner } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { State, Action } from '../store';
import BackgroundImg from '../components/BackgroundImg';
import Content from '../components/Content';
import SpotifyIcon from '../components/icons/SpotifyIcon';
import MusicTapeIcon from '../components/icons/MusicTapeIcon';
import { useDownload } from '../services/Download';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = ['playlist-read-private', 'user-library-read'];
const AUTH_URL = `https://accounts.spotify.com/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPES.join('%20')}`;

function Index() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { downloadFile } = useDownload();
  const accessToken = searchParams.get('t') as string;

  const subtitle = useSelector((state: State) => state.content.subtitle);
  const loading = useSelector((state: State) => state.download.loading);

  const onClick = () => {
    if (!accessToken) {
      window.location.href = AUTH_URL;
    }
    if (accessToken) {
      downloadFile(accessToken);
    }
  };

  const btnTitle = () => {
    return accessToken ? 'Download' : 'Login';
  };

  useEffect(() => {
    dispatch({
      type: Action.SET_CONTENT_SUBTITLE,
      payload: 'Download your Spotify library.',
    });
  }, [dispatch]);

  return (
    <BackgroundImg mediaURL="/assets/img/bg.webp">
      <Content>
        <Flex w="80%" flexDirection="column" alignItems="center">
          <MusicTapeIcon height="3em" width="3em" />
          <Text textAlign="center" mb={4} mt={2}>
            {subtitle}
          </Text>
        </Flex>
        <Flex flexDirection={['column']} w={'80%'} alignItems={'center'}>
          <Flex flexDirection="column" alignItems="center" w={'100%'} mb={2}>
            <Button
              onClick={onClick}
              bg="black"
              color="white"
              borderRadius={100}
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={2}
              h={50}
              w={[150, '100%']}
              _hover={{ bg: 'gray.700' }}
            >
              {loading && <Spinner />}
              {!loading && (
                <>
                  {' '}
                  <SpotifyIcon />
                  <Text>{btnTitle()}</Text>
                </>
              )}
            </Button>
          </Flex>
          <Flex
            gap={2}
            flexDirection="row"
            w="100%"
            justifyContent="center"
            mt={4}
          >
            <Box>
              {/* <Link href="https://www.buymeacoffee.com/rashad.wiki">
                <Image
                  src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=rashad.wiki&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff"
                  alt="Buy me a coffee"
                  w={['150', '150']}
                  _hover={{ opacity: 0.7 }}
                />
              </Link> */}
            </Box>
          </Flex>
        </Flex>
      </Content>
    </BackgroundImg>
  );
}

export default Index;