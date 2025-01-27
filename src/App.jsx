import React, { Component } from "react";
import Cookies from 'universal-cookie';

import utils from "./utils/index.jsx";
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';

import abi_PROXY from "./assets/abi/Proxy";
import abi_POOLBRST from "./assets/abi/PoolBRSTv4";
import abi_SimpleSwap from "./assets/abi/SimpleSwapV2";
import abi_LOTERIA from "./assets/abi/Lottery";

import Alert from "./components/Alert.jsx";

import Home from "./pages/Home.jsx";

import Brut from "./components/BRUT.jsx";
import Brst from "./components/BRST-Proxy.jsx";
import Nft from "./components/BRGY.jsx";
import LOTERIA from "./components/BRLT.jsx";
import EBOT from "./components/EBOT.jsx";
import PRO from "./components/PRO.jsx";
import API from "./components/API.jsx";

import i18next from 'i18next';
import lng from "./locales/langs.js"

const striptags = require('striptags');


let lenguaje = navigator.language || navigator.userLanguage

i18next.init({
  fallbackLng: 'en',
  lng: lenguaje, // if you're using a language detector, do not define the lng option
  debug: false,
  resources: lng

});

let lgSelector = "en";

const tronWeb = {}

const adapter = new TronLinkAdapter();

const adressDefault = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"

const imgLoading = <img src="images/cargando.gif" height="20px" alt="loading..." />

const cookies = new Cookies(null, { path: '/', maxAge: 60 * 60 * 24 * 30 });

let theme = cookies.get('theme') || "light";
document.documentElement.setAttribute("data-theme-version", theme);

let tryes = 2
function setDarkTheme() {

  if (theme === "light") {
    theme = "dark";
  } else {
    theme = "light";
  }

  document.documentElement.setAttribute("data-theme-version", theme);
  cookies.set('theme', theme);

}

let nextUpdate = 0
let intervalId = null

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ruta: "",
      accountAddress: adressDefault,
      tronlink: {
        installed: false,
        loggedIn: false,
        viewer: false,
        adapter: {}
      },
      tronWeb: tronWeb,
      contrato: {
        ready: false,
        BRUT_USDT: null,
        BRUT: null,
        MBOX: null,
        loteria: null,
        BRLT: null,
        USDT: null,
        BRGY: null,
        BRST: null,
        BRST_TRX: null,
        BRST_TRX_Proxy: null,
        BRST_TRX_Proxy_fast: null,

      },
      conexion: false,
      walletConect: "Conect Wallet",
      msj: {},
    };

    this.conectar = this.conectar.bind(this);
    this.estado = this.estado.bind(this);

    this.route = this.route.bind(this);
    this.loadContracts = this.loadContracts.bind(this);
    this.selecionarIdioma = this.selecionarIdioma.bind(this);

  }

  async componentDidMount() {

    document.documentElement.setAttribute("data-theme-version", theme);

    let { walletConect } = this.state;

    document.getElementById("login").innerHTML = '<span id="conectTL" class="btn btn-primary" style="cursor:pointer" title="' + striptags(walletConect) + '"> Conect Wallet </span> <img src="images/TronLinkLogo.png" height="40px" alt="TronLink logo" />';
    document.getElementById("conectTL").onclick = () => { this.conectar(true); }

    intervalId = setInterval(() => {
      this.route();
      this.selecionarIdioma();
      if (Date.now() >= nextUpdate) {

        if (this.state.tronlink.installed && !this.state.tronlink.loggedIn) {
          nextUpdate = Date.now() + 3 * 1000;
        } else {
          nextUpdate = Date.now() + 60 * 1000;
        }
        this.estado(true);
      }

    }, 3 * 1000);

  }

  async componentWillUnmount() {
    clearInterval(intervalId)
  }


  async selecionarIdioma() {
    try {
      lgSelector = document.getElementById("selectLng").value
    } catch (error) {
      console.log(error)
    }

    if (i18next.resolvedLanguage !== lgSelector) {
      i18next.changeLanguage(lgSelector);
    }

  }


  async conectar(billetera) {

    if (!this.state.conexion && !adapter.connected && tryes > 0) {
      this.setState({ conexion: true })

      await adapter.connect()
        .catch((e) => {
          console.log(e.toString())
          this.setState({ msj: { title: "Wallet connection error", message: e.toString() } })
          tryes--;

        })

      if (adapter.connected) this.estado();

      this.setState({ conexion: false })


    }

    return adapter.connected;


  }

  async estado() {

    let { tronlink, accountAddress, walletConect } = this.state;

    if (window.tronWeb) {
      tronlink['installed'] = true;
    }

    if (!adapter.address) {
      await this.conectar(true)
    }

    if (adapter.address) {
      tronlink['loggedIn'] = true;
      tronlink['adapter'] = adapter;
      accountAddress = adapter.address

    }

    if (accountAddress !== adressDefault) {
      let vierWallet = accountAddress.substring(0, 6) + "***" + accountAddress.substring(accountAddress.length - 6, accountAddress.length)
      document.getElementById("login").innerHTML = '<span class="btn gradient-btn" title="' + striptags(accountAddress) + '" >' + striptags(vierWallet) + '</span>';

    } else {
      document.getElementById("login").innerHTML = '<span id="conectTL" class="btn btn-primary" style="cursor:pointer" title="' + striptags(walletConect) + '"> Conect Wallet </span> <img src="images/TronLinkLogo.png" height="40px" alt="TronLink logo" />';
      document.getElementById("conectTL").onclick = () => { this.conectar(true); }
    }

    this.setState({
      accountAddress,
      tronlink: tronlink,
      tronWeb: await utils.getTronweb(accountAddress)

    });

    this.loadContracts()


  }

  route() {
    let url = window.location.href;
    if (url.indexOf("/?") >= 0) {
      url = (url.split("/?"))[1];
      if (url.indexOf("#") >= 0) url = (url.split("#"))[0];
      if (url.indexOf("&") >= 0) url = (url.split("&"))[0];
      if (url.indexOf("=") >= 0) url = (url.split("="))[0];
      if (url === window.location.origin + "/" || url === "utum_source") url = ""
      url = `/#/${url}`
      window.location.replace(url);
    }

    if (url.indexOf("/#/") >= 0) url = (url.split("/#/"))[1];
    if (url.indexOf("?") >= 0) url = (url.split("?"))[0];
    if (url.indexOf("&") >= 0) url = (url.split("&"))[0];
    if (url.indexOf("=") >= 0) url = (url.split("="))[0];
    if (url === window.location.origin + "/" || url === "utum_source") url = ""

    this.setState({ ruta: url })
    return url
  }

  async loadContracts() {
    let { accountAddress, contrato } = this.state;

    let web3Contracts = await utils.getTronweb(accountAddress);

    if (contrato.BRUT === null && utils.BRUT !== "") {
      web3Contracts = await utils.getTronweb(accountAddress, 1);
      contrato.BRUT = await web3Contracts.contract().at(utils.BRUT);
    }

    if (contrato.USDT === null && utils.USDT !== "") {
      web3Contracts = await utils.getTronweb(accountAddress, 1);
      contrato.USDT = await web3Contracts.contract().at(utils.USDT);
    }

    if (contrato.BRUT_USDT === null && utils.SC !== "") {
      web3Contracts = await utils.getTronweb(accountAddress, 1);
      contrato.BRUT_USDT = await web3Contracts.contract().at(utils.SC);
    }

    if (contrato.BRST_TRX === null && utils.SC2 !== "") {
      web3Contracts = await utils.getTronweb(accountAddress);
      contrato.BRST_TRX = await web3Contracts.contract().at(utils.SC2);
    }

    if (contrato.BRST_TRX_Proxy === null && utils.ProxySC2 !== "") {
      web3Contracts = await utils.getTronweb(accountAddress);
      contrato.Proxy = web3Contracts.contract(abi_PROXY, utils.ProxySC2);

      web3Contracts = await utils.getTronweb(accountAddress);
      contrato.BRST_TRX_Proxy = web3Contracts.contract(abi_POOLBRST, utils.ProxySC2);
    }

    if (contrato.BRST_TRX_Proxy_fast === null && utils.ProxySC3 !== "") {
      web3Contracts = await utils.getTronweb(accountAddress);
      contrato.Proxy_fast = web3Contracts.contract(abi_PROXY, utils.ProxySC3);

      web3Contracts = await utils.getTronweb(accountAddress);
      contrato.BRST_TRX_Proxy_fast = web3Contracts.contract(abi_SimpleSwap, utils.ProxySC3);
    }

    if (contrato.BRST === null && utils.BRST !== "") {
      web3Contracts = await utils.getTronweb(accountAddress);
      contrato.BRST = await web3Contracts.contract().at(utils.BRST);
    }

    if (contrato.BRGY === null && utils.BRGY !== "") {
      web3Contracts = await utils.getTronweb(accountAddress);
      contrato.BRGY = await web3Contracts.contract().at(utils.BRGY);
    }

    if (contrato.MBOX === null && utils.SC3 !== "") {
      web3Contracts = await utils.getTronweb(accountAddress);
      contrato.MBOX = await web3Contracts.contract().at(utils.SC3);
    }

    if (contrato.BRLT === null && utils.BRLT !== "") {
      web3Contracts = await utils.getTronweb(accountAddress, 2);
      contrato.BRLT = await web3Contracts.contract().at(utils.BRLT);
    }

    if (contrato.loteria === null && utils.SC4 !== "") {
      web3Contracts = await utils.getTronweb(accountAddress, 2);
      contrato.ProxyLoteria = web3Contracts.contract(abi_PROXY, utils.SC4);

      web3Contracts = await utils.getTronweb(accountAddress, 2);
      contrato.loteria = web3Contracts.contract(abi_LOTERIA, utils.SC4);
    }

    contrato.ready = true;

    this.setState({
      contrato: contrato,
    })

    return contrato

  }

  render() {

    let { tronlink, contrato, accountAddress, tronWeb, msj, ruta } = this.state

    let Retorno = <></>

    if (window.tronLink === undefined) {
      tronlink.loggedIn = true
    }

    if (!contrato.ready && !tronlink.loggedIn) {
      Retorno = (
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="card">
                <div className='row' style={{ 'padding': '3em', 'decoration': 'none' }} >
                  <div className='col-sm-8'>
                    <h1>{i18next.t("preLoad", { returnObjects: true })[0]}{imgLoading}</h1>
                    <p>
                      {i18next.t("preLoad", { returnObjects: true })[1]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {

      let url = ruta

      switch (url) {

        case "brut":
          Retorno = <Brut accountAddress={accountAddress} contrato={contrato} tronWeb={tronWeb} i18n={i18next} />
          break;
        case "brst":
          Retorno = <Brst accountAddress={accountAddress} contrato={contrato} tronWeb={tronWeb} i18n={i18next} />
          break;
        case "brgy":
          Retorno = <Nft accountAddress={accountAddress} contrato={contrato} tronWeb={tronWeb} i18n={i18next} />
          break;
        case "brlt":
          Retorno = <LOTERIA accountAddress={accountAddress} contrato={contrato} tronWeb={tronWeb} i18n={i18next} />
          break;
        case "ebot":
          Retorno = <EBOT accountAddress={accountAddress} contrato={contrato} tronWeb={tronWeb} i18n={i18next} />
          break;
        case "pro":
          Retorno = <PRO accountAddress={accountAddress} contrato={contrato} tronWeb={tronWeb} tronlink={tronlink} i18n={i18next} />
          break;
        case "api":
          Retorno = <API accountAddress={accountAddress} contrato={contrato} tronWeb={tronWeb} tronlink={tronlink} i18n={i18next} />
          break;
        default:
          Retorno = <Home accountAddress={accountAddress} contrato={contrato} tronWeb={tronWeb} i18n={i18next} />
          break;
      }

    }

    return (<>
      {Retorno}
      <Alert {...msj} />
      <button id="theme-switch" onClick={() => { setDarkTheme() }}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z" /></svg>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Z" /></svg>
      </button>
    </>)

  }

}

export default App;