import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
// import Breath from './App2';
// import Breath from './BreathApp';
// import Breath from './AppPerformance';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BreathMachineProvider } from './context/breathMachineContext';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
