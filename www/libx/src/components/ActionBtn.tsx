import { Button, Spinner } from '@chakra-ui/react';

// TODO: Redux eventually
type ActionBtnProps = {
  loading: boolean;
  title: string;
  onClick: any;
};

const ActionBtn = ({ loading, title, onClick }: ActionBtnProps) => {
  const label = (): string => {
    if (loading) {
      return `${title}ing...`;
    }
    return title;
  };

  return (
    <Button
      onClick={onClick}
      disabled={loading}
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
      {loading && <Spinner size="sm" color="white" />}
      {label()}
    </Button>
  );
};

export default ActionBtn;
