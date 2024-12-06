import { Box } from '@chakra-ui/react';

function BackgroundImg() {
  return (
    <Box
      w="100vw"
      h="100vh"
      bg="gray.800"
      bgImage="url('/assets/img/bg.webp')"
      bgAttachment="fixed"
      bgSize="cover"
      bgPos="center"
      display="flex"
      justifyContent="center"
      alignItems="center"
    ></Box>
  );
}

export default BackgroundImg;
