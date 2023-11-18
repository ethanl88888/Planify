import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import { ChakraProvider } from '@chakra-ui/react'

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Home/>
    },
    {
      path: '/login',
      element: <Login/>
    },
    {
      path: '/signup',
      element: <Signup/>
    }
    // {
    //   path: '/plan/:id',
    //   element: <Plan/>
    // },
  ]);

  return (
    <>
      <ChakraProvider>
        <RouterProvider router={router} />
      </ChakraProvider>
    </>
  );
}

export default App;

