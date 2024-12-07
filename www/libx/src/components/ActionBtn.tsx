import { Button } from '@chakra-ui/react';

type ActionBtnProps = {
  title: string;
  onClick: any;
};

const ActionBtn = ({ title, onClick }: ActionBtnProps) => {

  return (
    <Button
      onClick={onClick}
      bg="black"
      color="white"
      border="1px solid black"
      borderRadius="10px"
      h="50px"
      w={['150px', '200px']}
      display="flex"
      alignItems="center"
      justifyContent="center"
      _hover={{ bg: 'gray.700' }}
      gap={2}
    >
      {title}
    </Button>
  );
};

export default ActionBtn;
