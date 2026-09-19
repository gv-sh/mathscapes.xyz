import React from 'react';
import {hydrateRoot} from 'react-dom/client';
import App from './App.jsx';
import './site.css';
const data=JSON.parse(document.getElementById('home-data').textContent);
hydrateRoot(document.getElementById('home-root'),<App data={data}/>);
