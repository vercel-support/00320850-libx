import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ToastContainer } from 'react-toastify';
import { Provider } from 'react-redux';
import store from './store';
import Router from './router';

import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider value={defaultSystem}>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Router />
      </ChakraProvider>
    </Provider>
  );
}

export default App;
