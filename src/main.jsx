import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import WatchTowerApp from './pages/WatchTowerApp.jsx';
import { getSiteFromHostname } from './sites.js';
import './index.css';

// A single Vercel project serves every domain, so the application is chosen
// once at the entry point, before any routing runs. A product domain is the
// product entry point and never renders the Enmero site first.
const SITE_ROOTS = {
  enmero: App,
  watchtower: WatchTowerApp
};

const SiteRoot = SITE_ROOTS[getSiteFromHostname(window.location.hostname)] || App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SiteRoot />
  </React.StrictMode>
);
