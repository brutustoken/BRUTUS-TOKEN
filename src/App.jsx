import React, { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import Cookies from 'universal-cookie';
import { withTranslation } from 'react-i18next';
import striptags from 'striptags';

import utils from "./services/index.js";
import SEO from "./components/SEO.jsx";
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';

import abi_TOKEN from "./assets/abi/TRC20-USDT.json"
import abi_PROXY from "./assets/abi/Proxy";
import abi_POOLBRST from "./assets/abi/PoolBRSTv4";
import abi_BRST_USDT from "./assets/abi/Brst-Usdt.json"
import abi_SimpleSwap from "./assets/abi/SimpleSwapV2";
import abi_LOTERIA from "./assets/abi/Lottery";

import Alert from "./components/Alert.jsx";
import Home from "./pages/Home.jsx";
import Brut from "./pages/BRUT.jsx";
import Brst from "./pages/BRST-Proxy.jsx";
import Nft from "./pages/BRGY.jsx";
import LOTERIA from "./pages/BRLT.jsx";
import EBOT from "./pages/EBOT.jsx";
import PRO from "./pages/PRO.jsx";
import API from "./pages/API.jsx";
import { config } from "./config/env.js";

const addressDefault = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb";
const imgLoading = <img src="images/cargando.gif" height="20px" alt="loading..." />;

const cookies = new Cookies(null, { path: '/', maxAge: 60 * 60 * 24 * 30 });

// Initialize theme
let initialTheme = cookies.get('theme') || "light";
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute("data-theme-version", initialTheme);
}

// Theme toggle function
const setDarkTheme = () => {
  const currentTheme = cookies.get('theme') || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute("data-theme-version", newTheme);
  }
  cookies.set('theme', newTheme);
};



// Initialize adapter outside component to prevent recreation
let adapterInstance = null;
const getAdapter = () => {
  if (!adapterInstance && typeof window !== 'undefined') {
    adapterInstance = new TronLinkAdapter();
  }
  return adapterInstance;
};

const App = ({ i18n, t }) => {
  const [state, setState] = useState({
    ruta: "",
    accountAddress: addressDefault,
    tronlink: {
      installed: false,
      loggedIn: false,
      viewer: true, // Start in viewer mode with default wallet
      adapter: {}
    },
    tronWeb: {},
    contrato: {
      ready: false,
      BRUT_USDT: null,
      BRUT: null,
      MBOX: null,
      loteria: null,
      BRLT: null,
      USDT: null,
      USDD: null,
      BRGY: null,
      BRST: null,
      BRST_TRX: null,
      BRST_TRX_Proxy: null,
      BRST_TRX_Proxy_fast: null,
    },
    conexion: false,
    msj: {},
    tronWebReady: false,
  });

  const intervalRef = useRef(null);
  const nextUpdateRef = useRef(0);
  const mountedRef = useRef(true);
  const autoConnectAttemptedRef = useRef(false);
  const isConnectingRef = useRef(false);

  // Route handler
  const route = useCallback(() => {
    let url = window.location.href;

    if (url.indexOf("/?") >= 0) {
      url = (url.split("/?"))[1];
      if (url.indexOf("#") >= 0) url = (url.split("#"))[0];
      if (url.indexOf("&") >= 0) url = (url.split("&"))[0];
      if (url.indexOf("=") >= 0) url = (url.split("="))[0];
      if (url === window.location.origin + "/" || url === "utum_source") url = "";
      url = `/#/${url}`;
      window.location.replace(url);
      return "";
    }

    if (url.indexOf("/#/") >= 0) url = (url.split("/#/"))[1];
    if (url.indexOf("?") >= 0) url = (url.split("?"))[0];
    if (url.indexOf("&") >= 0) url = (url.split("&"))[0];
    if (url.indexOf("=") >= 0) url = (url.split("="))[0];
    if (url === window.location.origin + "/" || url === "utum_source") url = "";

    return url;
  }, []);

  // Language selector
  const seleccionarIdioma = useCallback(() => {
    try {
      const selectElement = document.getElementById("selectLng");
      if (selectElement) {
        const lgSelector = selectElement.value;
        if (i18n.resolvedLanguage !== lgSelector) {
          i18n.changeLanguage(lgSelector);
        }
      }
    } catch (error) {
      console.log("Language selection error:", error);
    }
  }, [i18n]);

  // Connect wallet
  const conectar = useCallback(async (isAutoConnect = false) => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      console.log("Connection already in progress, skipping...");
      return false;
    }

    const adapter = getAdapter();

    // If already connected, just update state
    if (adapter.connected) {
      if (mountedRef.current) {
        await estado();
      }
      return true;
    }

    // Don't attempt connection if not available
    if (!adapter || adapter.readyState === 'NotFound') {
      console.log("TronLink adapter not found");
      return false;
    }

    if (!state.conexion) {
      isConnectingRef.current = true;
      setState(prev => ({ ...prev, conexion: true }));

      try {
        await adapter.connect();
        if (adapter.connected && mountedRef.current) {
          await estado();
          return true;
        }
      } catch (e) {
        console.log("Connection error:", e.toString());
        // Only show error message for manual connections
        if (!isAutoConnect && mountedRef.current) {
          setState(prev => ({
            ...prev,
            msj: { title: "Wallet connection error", message: e.toString() }
          }));
        }
      } finally {
        if (mountedRef.current) {
          setState(prev => ({ ...prev, conexion: false }));
          isConnectingRef.current = false;
        }
      }
    }

    return adapter.connected;
  }, [state.conexion]);

  // Update wallet state
  const estado = useCallback(async () => {
    const adapter = getAdapter();
    let tronlink = { ...state.tronlink };
    let accountAddress = state.accountAddress;

    // Check adapter state
    if (adapter.readyState === 'NotFound') {
      return;
    }

    if (adapter.address) {
      tronlink.installed = true;
      tronlink.loggedIn = true;
      tronlink.viewer = false; // User connected their own wallet
      tronlink.adapter = adapter;
      accountAddress = adapter.address;
    } else {
      // Keep viewer mode with default wallet
      tronlink.viewer = true;
      accountAddress = addressDefault;
    }

    // Update UI
    const loginElement = document.getElementById("login");
    if (loginElement) {
      if (accountAddress !== addressDefault && tronlink.loggedIn) {
        // User's connected wallet
        const viewWallet = accountAddress.substring(0, 6) + "***" + accountAddress.substring(accountAddress.length - 6);
        loginElement.innerHTML = `<span class="btn gradient-btn" title="${striptags(accountAddress)}">${striptags(viewWallet)}</span>`;
      } else {
        // Viewer mode or not connected
        loginElement.innerHTML = '<span id="conectTL" class="btn btn-primary" style="cursor:pointer" title="Connect your wallet to perform transactions">Connect Wallet</span> <img src="images/TronLinkLogo.png" height="40px" alt="TronLink logo" />';
        const conectBtn = document.getElementById("conectTL");
        if (conectBtn) {
          conectBtn.onclick = () => conectar(false);
        }
      }
    }

    if (mountedRef.current) {
      const tronWebInstance = await utils.getTronweb(accountAddress);
      setState(prev => ({
        ...prev,
        accountAddress,
        tronlink,
        tronWeb: tronWebInstance
      }));

      // Load contracts after state update
      loadContracts(accountAddress);
    }
  }, [state.tronlink, state.accountAddress, conectar]);

  // Load contracts
  const loadContracts = useCallback(async (accountAddress) => {
    if (!mountedRef.current) return;

    let contrato = { ...state.contrato };
    let web3Contracts = await utils.getTronweb(accountAddress);

    try {
      // Load BRUT contract
      if (contrato.BRUT === null && config.BRUT !== "") {
        web3Contracts = await utils.getTronweb(accountAddress);

        contrato.BRUT = web3Contracts.contract(abi_TOKEN, config.BRUT);
      }

      // Load USDT/USDD contracts
      if (contrato.USDT === null && config.USDT !== "") {
        web3Contracts = await utils.getTronweb(accountAddress);

        contrato.USDT = web3Contracts.contract(abi_TOKEN, config.USDT);
        web3Contracts = await utils.getTronweb(accountAddress);

        contrato.USDD = web3Contracts.contract(abi_TOKEN, config.USDD);
      }

      // Load BRUT_USDT contract
      if (contrato.BRUT_USDT === null && config.SC !== "") {
        web3Contracts = await utils.getTronweb(accountAddress);
        contrato.BRUT_USDT = web3Contracts.contract(abi_BRST_USDT, config.SC);
      }

      // Load BRST_TRX contract
      if (contrato.BRST_TRX === null && config.SC2 !== "") {
        web3Contracts = await utils.getTronweb(accountAddress);
        contrato.BRST_TRX = await web3Contracts.contract().at(config.SC2);
      }

      // Load BRST_TRX_Proxy contract
      if (contrato.BRST_TRX_Proxy === null && config.ProxySC2 !== "") {
        web3Contracts = await utils.getTronweb(accountAddress);
        contrato.Proxy = web3Contracts.contract(abi_PROXY, config.ProxySC2);
        web3Contracts = await utils.getTronweb(accountAddress);
        contrato.BRST_TRX_Proxy = web3Contracts.contract(abi_POOLBRST, config.ProxySC2);
      }

      // Load BRST_TRX_Proxy_fast contract
      if (contrato.BRST_TRX_Proxy_fast === null && config.ProxySC3 !== "") {

        web3Contracts = await utils.getTronweb(accountAddress);
        contrato.Proxy_fast = web3Contracts.contract(abi_PROXY, config.ProxySC3);

        web3Contracts = await utils.getTronweb(accountAddress);
        contrato.BRST_TRX_Proxy_fast = web3Contracts.contract(abi_SimpleSwap, config.ProxySC3);
      }

      // Load BRST contract
      if (contrato.BRST === null && config.BRST !== "") {
        web3Contracts = await utils.getTronweb(accountAddress);
        contrato.BRST = web3Contracts.contract(abi_TOKEN, config.BRST);
      }

      // Load BRGY contract
      if (contrato.BRGY === null && config.BRGY !== "") {
        web3Contracts = await utils.getTronweb(accountAddress);
        contrato.BRGY = await web3Contracts.contract().at(config.BRGY);
      }

      // Load MBOX contract
      if (contrato.MBOX === null && config.SC3 !== "") {
        web3Contracts = await utils.getTronweb(accountAddress);
        contrato.MBOX = await web3Contracts.contract().at(config.SC3);
      }

      // Load BRLT contract
      if (contrato.BRLT === null && config.BRLT !== "") {
        web3Contracts = await utils.getTronweb(accountAddress, 2);
        contrato.BRLT = await web3Contracts.contract().at(config.BRLT);
      }

      // Load Lottery contract
      if (contrato.loteria === null && config.SC4 !== "") {
        web3Contracts = await utils.getTronweb(accountAddress, 2);
        contrato.ProxyLoteria = web3Contracts.contract(abi_PROXY, config.SC4);

        web3Contracts = await utils.getTronweb(accountAddress);
        contrato.loteria = web3Contracts.contract(abi_LOTERIA, config.SC4);
      }

      contrato.ready = true;

      if (mountedRef.current) {
        setState(prev => ({ ...prev, contrato }));
      }
    } catch (error) {
      console.error("Error loading contracts:", error);
    }
  }, [state.contrato]);

  // Initialize on mount
  useEffect(() => {
    mountedRef.current = true;

    const initialize = async () => {
      // Wait for TronWeb to be available
      const tronWebInstance = await utils.getTronweb(addressDefault);

      if (!mountedRef.current) return;

      setState(prev => ({ ...prev, tronWebReady: true }));

      // Set theme
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute("data-theme-version", initialTheme);
      }

      // Load contracts with default wallet for viewer mode
      console.log("Loading contracts in viewer mode with default wallet...");
      await loadContracts(addressDefault);

      // Setup login button initially
      const loginElement = document.getElementById("login");
      if (loginElement) {
        loginElement.innerHTML = '<span id="conectTL" class="btn btn-primary" style="cursor:pointer" title="Connect your wallet to perform transactions">Connect Wallet</span><img src="images/TronLinkLogo.png" height="40px" alt="TronLink logo" />';
        const conectBtn = document.getElementById("conectTL");
        if (conectBtn) {
          conectBtn.onclick = () => conectar(false);
        }
      }

      // Check if adapter is available and ready
      const adapter = getAdapter();
      if (adapter && adapter.readyState !== 'NotFound') {
        // Single auto-connect attempt after ensuring TronWeb is ready
        if (!autoConnectAttemptedRef.current && tronWebInstance) {
          autoConnectAttemptedRef.current = true;

          // Wait a bit to ensure everything is loaded
          setTimeout(async () => {
            if (mountedRef.current && !adapter.connected) {
              console.log("Attempting auto-connect...");
              const connected = await conectar(true);
              if (!connected) {
                console.log("Auto-connect failed, staying in viewer mode");
              }
            }
          }, 3000);
        }
      }

      // Setup interval for updates
      intervalRef.current = setInterval(() => {
        if (!mountedRef.current) return;

        const currentRoute = route();
        setState(prev => ({ ...prev, ruta: currentRoute }));

        seleccionarIdioma();

        // Periodic state check (not connection attempt)
        if (Date.now() >= nextUpdateRef.current) {
          nextUpdateRef.current = Date.now() + 60 * 1000;

          // Update estado regardless of connection status
          const adapter = getAdapter();
          if (adapter && adapter.connected) {
            estado();
          }
        }
      }, 3000);
    };

    initialize();

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency array - only run once on mount

  // Render component based on route
  const renderContent = () => {
    const { tronlink, contrato, accountAddress, tronWeb, ruta } = state;

    // Show loading if TronWeb not ready or contracts not loaded
    // Allow viewer mode to proceed even without wallet connection
    if (!state.tronWebReady || !contrato.ready) {
      return (
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="card">
                <div className='row' style={{ padding: '3em', decoration: 'none' }}>
                  <div className='col-sm-8'>
                    <h1>{t("preLoad", { returnObjects: true })?.[0] || "Loading"}{imgLoading}</h1>
                    <p>{t("preLoad", { returnObjects: true })?.[1] || "Please wait while we load the application..."}</p>
                    {tronlink.viewer && <p style={{ fontSize: '0.9em', opacity: 0.8, marginTop: '1em' }}>Loading in viewer mode - Connect your wallet to perform transactions</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Pass viewer mode status to all pages
    const pageProps = {
      accountAddress,
      contrato,
      tronWeb,
      tronlink,
      isViewerMode: tronlink.viewer && accountAddress === addressDefault
    };

    // Route to appropriate page
    switch (ruta) {
      case "brut":
        return <Brut {...pageProps} />;

      case "brst":
        return <Brst {...pageProps} />;

      case "brgy":
        return <Nft {...pageProps} />;

      case "brlt":
        return <LOTERIA {...pageProps} />;

      case "rent":
      case "ebot":
        return (
          <>
            <SEO
              title="Brutus | Decentralized Energy & Bandwidth Rental Platform"
              description="Brutus is a decentralized platform for renting energy and bandwidth on the Tron network. We offer a user-friendly interface and competitive prices for all your resource rental needs."
            />
            <EBOT {...pageProps} />
          </>
        );

      case "pro":
        return <PRO {...pageProps} />;

      case "api":
        return <API {...pageProps} />;

      case "portfolio":
      case "wallet":
        return <Home {...pageProps} />;

      default:
        return (
          <>
            <SEO
              title="Brutus | Decentralized Energy & Bandwidth Rental Platform"
              description="Brutus is a decentralized platform for renting energy and bandwidth on the Tron network. We offer a user-friendly interface and competitive prices for all your resource rental needs."
            />
            <EBOT {...pageProps} />
          </>
        );
    }
  };

  const { ruta, msj } = state;

  return (
    <>
      <Helmet>
        <title>{ruta.length > 1 ? ruta.toUpperCase() + " | " : ""}Brutus.Finance</title>
        <meta property="og:title" content={(ruta.length > 1 ? ruta.toUpperCase() + " | " : "") + "Brutus.Finance"} />
        <meta property="og:description" content="Alquila energia, haz staking de trx y obten los mejores rendimientos del mercado" />
        <meta property="og:image" content={"/images/og/brutus-" + ruta + ".jpg"} />
        <meta property="og:url" content={"/#/" + ruta} />
      </Helmet>

      {renderContent()}
      <Alert {...msj} />

      <button id="theme-switch" onClick={setDarkTheme}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
          <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
          <path d="M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Z" />
        </svg>
      </button>
    </>
  );
};

const AppWithTranslation = withTranslation()(App);

export default AppWithTranslation;