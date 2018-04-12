import React from 'react';
import './action';
import ReactDOM from 'react-dom';
import '../../frame/core/netcore';
import 'jquery';
import App from './components';
window.onload = (e) => {
    let app = document.createElement('div');
    document.body.appendChild(app);
    ReactDOM.render(<App/>, app);
};
