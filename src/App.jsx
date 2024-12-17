import React, { Component } from "react";

import utils from "./utils/index.jsx";

import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink';

import abi_PROXY from "./assets/abi/Proxy";
import abi_POOLBRST from "./assets/abi/PoolBRSTv4";
import abi_SimpleSwap from "./assets/abi/SimpleSwapV2";
import abi_LOTERIA from "./assets/abi/Lottery";

import Alert from "./components/Alert.jsx";

import Home from "./components/Inicio.jsx";

import Brut from "./components/BRUT.jsx";
import Brst from "./components/BRST-Proxy.jsx";
import Nft from "./components/BRGY";
import LOTERIA from "./components/BRLT.jsx";
import EBOT from "./components/EBOT.jsx";
import PRO from "./components/PRO.jsx";
import API from "./components/API.js";


import i18next from 'i18next';
import lng from "./locales/langs.js"

let lenguaje = navigator.language || navigator.userLanguage

i18next.init({
  fallbackLng: 'en',
  lng: lenguaje, // if you're using a language detector, do not define the lng option
  debug: false,
  resources: lng

});

let lgSelector = "en";

try {
  lgSelector = document.getElementById("selectLng").value
} catch (error) {
  console.log(error)

}


if (lenguaje !== lgSelector) {
  i18next.changeLanguage(lgSelector);
}


const tronWeb = {}

const adapter = new TronLinkAdapter();

const adressDefault = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"

const imgLoading = <img src="images/cargando.gif" height="20px" alt="loading..." />

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accountAddress: adressDefault,
      tronlink: {
        installed: false,
        loggedIn: false,
        contratosReady: false,
        adapter: {}
      },
      tronWeb: tronWeb,
      contrato: {
        BRUT_USDT: null,
        BRUT: null,
        MBOX: null,
        loteria: null,
        BRLT: null,
        USDT: null,
        BRGY: null,
        BRST: null,
        BRST_TRX: null,
        BRST_TRX_Proxy: null

      },
      conexion: false,
      walletConect: "Conect Wallet",
      msj: {},
    };

    this.route = this.route.bind(this);
    this.conectar = this.conectar.bind(this);
    this.intervalo = this.intervalo.bind(this);
    this.loadContracts = this.loadContracts.bind(this);

  }

  async componentDidMount() {

    document.getElementById("login").innerHTML = '<span id="conectTL" class="btn btn-primary" style="cursor:pointer" title="' + this.state.walletConect + '"> Conect Wallet </span> <img src="images/TronLinkLogo.png" height="40px" alt="TronLink logo" />';
    document.getElementById("conectTL").onclick = () => { this.conectar(true); }

    this.intervalo(3);

    setTimeout(() => {
      this.conectar(true);
    }, 3 * 1000)

  }

  async componentWillUnmount() {
    clearInterval(this.state.interval)
    this.setState({ interval: null })
  }

  intervalo(s) {
    if (this.state.interval !== null) {
      clearInterval(this.state.interval)
      this.setState({ interval: null })
    }

    let interval = setInterval(() => {

      let lgSelector = "en";

      try {
        lgSelector = document.getElementById("selectLng").value
      } catch (error) {

      }

      let lenguaje = i18next.resolvedLanguage

      if (lenguaje !== lgSelector) {
        i18next.changeLanguage(lgSelector);
      }

      if (!this.state.conexion) {
        //this.conectar(false);
      }

    }, s * 1000);

    this.setState({ interval })

  }


  async conectar(cambio) {
    let tronlink = this.state.tronlink;
    let wallet = adressDefault;
    let web3Contracts = await utils.getTronweb(this.state.accountAddress);


    if (!this.state.conexion && cambio) {

      this.setState({ conexion: true })

      await adapter.connect()
        .catch((e) => {
          console.log(e.toString())
          this.setState({msj: {title: "Wallet connection error", message: e.toString()}})

        })

      //console.log(adapter)

      if (adapter.address) {
        tronlink['installed'] = true;
        tronlink['loggedIn'] = true;
        tronlink['adapter'] = adapter;
        wallet = adapter.address

      }

    }

    if (wallet !== adressDefault) {

      let vierWallet = wallet.substring(0, 6) + "***" + wallet.substring(wallet.length - 6, wallet.length)

      document.getElementById("login").innerHTML = '<span class="btn gradient-btn" title="' + wallet + '" >' + vierWallet + '</span>';
      //document.getElementById("login").innerHTML = '<div class="dropdown"><button class="btn  gradient-btn dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + wallet + '</button><div class="dropdown-menu" aria-labelledby="dropdownMenuButton"><a href="https://tronscan.io/#/address/' + wallet + '" class="dropdown-item">View on TronScan</a><a class="dropdown-item" href="#">Log Out </a></div></div>'

    } else {
      document.getElementById("login").innerHTML = '<span id="conectTL" class="btn btn-primary" style="cursor:pointer" title="' + this.state.walletConect + '"> Conect Wallet </span> <img src="images/TronLinkLogo.png" height="40px" alt="TronLink logo" />';
      document.getElementById("conectTL").onclick = () => { this.conectar(true); }
    }

    this.setState({
      accountAddress: wallet,
      tronlink: tronlink,
      web3Contracts: web3Contracts,

    });

    if (!tronlink['contratosReady'] || cambio) {
      this.loadContracts()
    }

    this.setState({
      conexion: false,
      tronWeb: await utils.getTronweb(this.state.accountAddress)
    })

  }

  route(){
    let url = window.location.href;
    if (url.indexOf("/?") >= 0) url = (url.split("/?"))[1];
    if (url.indexOf("#") >= 0) url = (url.split("#"))[0];
    if (url.indexOf("&") >= 0) url = (url.split("&"))[0];
    if (url.indexOf("=") >= 0) url = (url.split("="))[0];

    if(url === window.location.origin+"/")url = ""
    return url
  }

  async loadContracts() {
    let tronlink = this.state.tronlink;

    let  web3Contracts = await utils.getTronweb(this.state.accountAddress);
    let contrato = {};
    let url = this.route()

    if (utils.BRUT !== "" && (url === "" || url === "brut")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress,1);
      contrato.BRUT = await web3Contracts.contract().at(utils.BRUT);
    }
    if (utils.USDT !== "" && (url === "brut")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress,1);
      contrato.USDT = await web3Contracts.contract().at(utils.USDT);

    }
    if (utils.SC !== "" && (url === "brut")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress,1);
      contrato.BRUT_USDT = await web3Contracts.contract().at(utils.SC);

    }

    if (utils.SC2 !== "" && (url === "brst")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress);
      contrato.BRST_TRX = await web3Contracts.contract().at(utils.SC2);

    }
    if (utils.ProxySC2 !== "" && (url === "" || url === "brst")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress);
      contrato.Proxy = await web3Contracts.contract(abi_PROXY, utils.ProxySC2);

      web3Contracts = await utils.getTronweb(this.state.accountAddress);
      contrato.BRST_TRX_Proxy = await web3Contracts.contract(abi_POOLBRST, utils.ProxySC2);

    }

    if (utils.ProxySC3 !== "" && (url === "" || url === "brst")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress);
      contrato.Proxy_fast = await web3Contracts.contract(abi_PROXY, utils.ProxySC3);

      web3Contracts = await utils.getTronweb(this.state.accountAddress);
      contrato.BRST_TRX_Proxy_fast = await web3Contracts.contract(abi_SimpleSwap, utils.ProxySC3);

    }

    if (utils.BRST !== "" && (url === "" || url === "brst")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress);
      contrato.BRST = await web3Contracts.contract().at(utils.BRST);

    }

    if (utils.BRGY !== "" && (url === "" || url === "brgy")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress);
      contrato.BRGY = await web3Contracts.contract().at(utils.BRGY);

    }
    if (utils.SC3 !== "" && (url === "brgy")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress);
      contrato.MBOX = await web3Contracts.contract().at(utils.SC3);

    }

    if (utils.BRLT !== "" && (url === "" || url === "brlt")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress,2);
      contrato.BRLT = await web3Contracts.contract().at(utils.BRLT);

    }
    if (utils.SC4 !== "" && (url === "brlt" || url === "brst")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress,2);
      contrato.ProxyLoteria = await web3Contracts.contract(abi_PROXY, utils.SC4);

      web3Contracts = await utils.getTronweb(this.state.accountAddress,2);
      contrato.loteria = await web3Contracts.contract(abi_LOTERIA, utils.SC4);

    }

    tronlink['contratosReady'] = true;

    this.setState({
      tronlink: tronlink,
      contrato: contrato,
      conexion: true
    })

  }

  render() {

    let {tronlink} = this.state

    let Retorno = <></>

    if (!tronlink.contratosReady) Retorno = (

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

    let url = this.route()

    switch (url) {

      case "brut":
        Retorno = <Brut accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} ready={this.state.tronlink['contratosReady']} i18n={i18next} />
        break;
      case "brst":
        Retorno = <Brst accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} ready={this.state.tronlink['contratosReady']} i18n={i18next} />
        break;
      case "brgy":
        Retorno = <Nft accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} ready={this.state.tronlink['contratosReady']} i18n={i18next} />
        break;
      case "brlt":
        Retorno = <LOTERIA accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} ready={this.state.tronlink['contratosReady']} i18n={i18next} />
        break;
      case "ebot":
        Retorno = <EBOT accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} ready={this.state.tronlink['contratosReady']} i18n={i18next} />
        break;
      case "pro":
        Retorno = <PRO accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} tronlink={this.state.tronlink} ready={this.state.tronlink['contratosReady']} i18n={i18next} />
        break;
      case "api":
        Retorno = <API accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} tronlink={this.state.tronlink} ready={this.state.tronlink['contratosReady']} i18n={i18next} />
        break;
      default:
        Retorno = <Home accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} ready={this.state.tronlink['contratosReady']} i18n={i18next} />
        break;
    }

    return <>{Retorno}<Alert {...this.state.msj}/></>

  }

}

export default App;