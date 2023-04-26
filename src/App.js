import { ConfigProvider } from 'antd';
import axios from 'axios';
import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
// import {io} from 'socket.io-client';
import socketIO from 'socket.io-client';
import { BASE_URL } from './constant';
import useAuth from './hooks/useAuth';
import {
  Home,
  Login,
  PageNotFound,
  ProjectDetail,
  Projects,
  Trash
} from './screens';

const socket = socketIO.connect(BASE_URL);
// const socket = socketIO.connect(`${BASE_URL}`);

const App = () => {
  const { accessToken } = useAuth();
  const PrivateRoutes = () => {
    const { accessToken } = useAuth();

    if (localStorage.getItem("accessToken") || accessToken) return <Outlet />
    return <Navigate to="/login" replace />;

  };

  axios.defaults.headers.common[
    'Authorization'
  ] = `Bearer ${localStorage.getItem('accessToken') || accessToken}`;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2C3333',
        },
      }}
    >
      <Routes>
        <Route path="/login" element={<Login socket={socket} />} />
        <Route element={<PrivateRoutes />}>
          <Route path="/" element={<Home socket={socket}/>}>
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:projectId/">
              <Route index element={<Navigate to="board" />} />
              <Route path=":source" element={<ProjectDetail socket={socket} />} />
            </Route>
            <Route path="/trash" element={<Trash />} />
          </Route>
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </ConfigProvider>
  );
};

export default App;
