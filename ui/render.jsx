import React from 'react';
import {renderToString} from 'react-dom/server';
import App from './App.jsx';
export {researchText} from './App.jsx';
export const render=data=>renderToString(<App data={data}/>);
