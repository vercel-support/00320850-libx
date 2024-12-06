import { ChakraProvider } from '@chakra-ui/react';
import { defaultSystem } from '@chakra-ui/react';
import Router from './router';

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <Router />
    </ChakraProvider>
  );
}

export default App;
