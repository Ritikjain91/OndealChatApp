import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import Login from "./components/Login/Login";
import Signup from "./components/SignUp/Signup";
import './App.css';


import ErrorPage from './components/ErrorPage/ErrorPage'; 
import Chat from './components/ChatPage/Chat';
import Frontpage from './components/FrontPage/Frontpage';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/chat' element={<Chat/>}  />
      <Route path="/" element={<Frontpage />} errorElement={<ErrorPage />} />
      <Route path="/login" element={<Login />} errorElement={<ErrorPage />} />
      <Route path="/signup" element={<Signup />} errorElement={<ErrorPage />} />
      <Route path="*" element={<ErrorPage />} />
    </>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
