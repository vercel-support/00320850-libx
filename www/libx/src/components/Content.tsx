import { ReactNode } from 'react';
import { Box, Flex } from '@chakra-ui/react';

type ContentContainerProps = {
  children: ReactNode;
};

function ContentContainer({ children }: ContentContainerProps) {
  return (
    <>
      <Box
        w={['90%', 450]}
        h={['90%', 300]}
        bg="#075049"
        opacity="0.5"
        position="absolute"
        borderRadius={[25, 75]}
        boxShadow="lg"
      />
      <Flex
        flexDirection="column"
        w={['90%', 450]}
        h={['90%', 300]}
        alignItems="center"
        color="white"
        bg="transparent"
        position="relative"
        borderRadius={25}
        p={4}
        pt={[10, 50]}
      >
        {children}
      </Flex>
    </>
  );
}

export default ContentContainer;
