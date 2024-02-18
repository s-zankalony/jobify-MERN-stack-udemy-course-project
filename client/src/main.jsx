/** @format */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { ToastContainer } from 'react-toastify';

fetch('/api/v1/test')
  .then((res) => res.json())
  .then((data) => console.log(data));

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <App />
    <ToastContainer position="top-center" />
  </>
);
