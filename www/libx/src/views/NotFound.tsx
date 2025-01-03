import { Heading } from '@chakra-ui/react';
import BackgroundImg from '../components/BackgroundImg';
import Content from '../components/Content';

function NotFound() {
  return (
    <BackgroundImg mediaURL="/assets/img/bg.webp">
      <Content>
        <Heading as="h1">Not Found</Heading>
      </Content>
    </BackgroundImg>
  );
}

export default NotFound;
