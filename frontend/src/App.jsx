import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react'
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import MyPlans from './MyPlans';
import Plan from './Plan';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Home />
    },
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/signup',
      element: <Signup />
    },
    {
      path: '/my-plans',
      element: <MyPlans />
    },
    {
      path: '/plan',
      element: <Plan />
    },

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

