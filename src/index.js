import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from "./js/registerServiceWorker";


import './styles/style.css';
import {App} from "./js/App";

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
registerServiceWorker();
