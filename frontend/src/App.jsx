import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import MyPlans from './Plans';
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
    },
    {
      path: '/myplans',
      element: <MyPlans/>
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

