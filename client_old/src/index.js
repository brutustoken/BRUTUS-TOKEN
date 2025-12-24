import React from "react";
import { createRoot } from 'react-dom/client';
import App from "./App.jsx";
import './i18n';

import { Buffer } from "buffer";
window.Buffer = Buffer;

import TronWeb from 'tronweb';
const { Transaction } = TronWeb;

const root = createRoot(document.getElementById('root')); 

root.render(<App />);








