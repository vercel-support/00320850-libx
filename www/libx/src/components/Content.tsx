import { Box, Flex } from '@chakra-ui/react';

function ContentContainer() {
  return (
    <>
      <Box
        w={['90%', '450px']}
        h="100%"
        bg="#075049"
        opacity="0.5"
        position="absolute"
        borderRadius={['25px', '25px']}
        boxShadow="lg"
        mt={['20%', '20%']}
      />
      <Flex
        flexDirection="column"
        w={['90%', '450px']}
        h="100%"
        alignItems="center"
        color="white"
        bg="transparent"
        position="relative"
        borderRadius={['25px', '25px']}
        p={4}
        pt={['10px', '100px']}
        mt={['20%', '20%']}
      ></Flex>
    </>
  );
}

export default ContentContainer;
