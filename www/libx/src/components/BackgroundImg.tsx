import { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';

interface BackgroundImgProps {
  children: ReactNode;
  mediaURL: string;
}

function BackgroundImg({ children, mediaURL }: BackgroundImgProps) {
  return (
    <Box
      w="100vw"
      h="100vh"
      bg="gray.800"
      bgImage={`url('${mediaURL}')`}
      bgAttachment="fixed"
      bgSize="cover"
      bgPos="center"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      {children}
    </Box>
  );
}

export default BackgroundImg;
