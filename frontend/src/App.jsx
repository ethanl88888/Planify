import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';

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
      <RouterProvider router={router} />
    </>
  );
}

export default App;

