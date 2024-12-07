import { ChakraProvider } from '@chakra-ui/react';
import { defaultSystem } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import store from './store';
import Router from './router';

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider value={defaultSystem}>
        <Router />
      </ChakraProvider>
    </Provider>
  );
}

export default App;
