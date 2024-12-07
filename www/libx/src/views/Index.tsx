import { useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Link,
  Image,
} from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { State, Action } from '../store';
import BackgroundImg from '../components/BackgroundImg';
import Content from '../components/Content';
import SpotifyIcon from '../components/icons/SpotifyIcon';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = ['playlist-read-private', 'user-library-read'];
const AUTH_URL = `https://accounts.spotify.com/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPES.join('%20')}`;

function Index() {
  const dispatch = useDispatch();

  const title = useSelector((state: State) => state.content.title);
  const subtitle = useSelector((state: State) => state.content.subtitle);

  useEffect(() => {
    dispatch({
      type: Action.SET_CONTENT_TITLE,
      payload: 'Save your music!',
    });

    dispatch({
      type: Action.SET_CONTENT_SUBTITLE,
      payload: 'libx allows you to export your entire Spotify library.',
    });
  }, []);

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
        <Flex flexDirection={['column']} w={'100%'}>
          <Flex
            flexDirection="column"
            alignItems="center"
            border="1px solid"
            h={[200, 200]}
            w={'100%'}
            mb={2}
          >
            <Button
              onClick={() => {
                window.location.href = AUTH_URL;
              }}
              bg="black"
              color="white"
              borderRadius="10px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={2}
              h="50px"
              w={['150px', '200px']}
              _hover={{ bg: 'gray.700' }}
            >
              <SpotifyIcon />
              <Text>Spotify</Text>
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
              <Link href="https://www.buymeacoffee.com/rashad.wiki">
                <Image
                  src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=rashad.wiki&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff"
                  alt="Buy me a coffee"
                  w={['150px', '150px']}
                  _hover={{ opacity: 0.7 }}
                />
              </Link>
            </Box>
          </Flex>
        </Flex>
      </Content>
    </BackgroundImg>
  );
}

export default Index;
