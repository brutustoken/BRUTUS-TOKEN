import React, { Component } from "react";

import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink';

import abi_PROXY from "./assets/abi/Proxy";
import abi_POOLBRST from "./assets/abi/PoolBRSTv4";
import abi_SimpleSwap from "./assets/abi/SimpleSwapV2";
import abi_LOTERIA from "./assets/abi/Lottery";
import cons from "./cons.js";

import Inicio from "./components/Inicio.js";

import Home from "./components/BRUT.js";
import StakingV2 from "./components/BRST-Proxy.jsx";
import Nft from "./components/BRGY/index.js";
import LOTERIA from "./components/BRLT.jsx";
import EBOT from "./components/EBOT.js";
import PRO from "./components/PRO.js";
import API from "./components/API.js";


import i18next from 'i18next';
import lng from "./locales/langs.js"
import utils from "./utils/index.jsx";

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
      walletConect: "Conect Wallet"
    };

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

    /*
    window.addEventListener('message', (e) => {

      if (e.data.message && (e.data.message.action === "accountsChanged" || e.data.message.action === "setAccount")) {
        if (e.data.message.data.address) {
          //this.conectar(true);
        }
      }
    })
      */

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

    var interval = setInterval(() => {

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

      //console.log(await window.tronLink.request({method: 'tron_requestAccounts'}))

      await adapter.connect()
        .catch((e) => {
          console.log(e.toString())
          alert(e.toString())

          //this.setState({ walletConect: e.toString() })
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

  async loadContracts() {
    let tronlink = this.state.tronlink;

    let  web3Contracts = await utils.getTronweb(this.state.accountAddress);

    let contrato = {};

    let url = window.location.href;
    if (url.indexOf("/?") >= 0) url = (url.split("/?"))[1];
    if (url.indexOf("&") >= 0) url = (url.split("&"))[0];
    if (url === window.location.href || url === "utm_source=tronlink") url = ""

    if (cons.BRUT !== "" && (url === "" || url === "brut")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress,1);
      contrato.BRUT = await web3Contracts.contract().at(cons.BRUT);
    }
    if (cons.USDT !== "" && (url === "brut")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress,1);
      contrato.USDT = await web3Contracts.contract().at(cons.USDT);

    }
    if (cons.SC !== "" && (url === "brut")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress,1);
      contrato.BRUT_USDT = await web3Contracts.contract().at(cons.SC);

    }

    if (cons.SC2 !== "" && (url === "brst")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress);
      contrato.BRST_TRX = await web3Contracts.contract().at(cons.SC2);

    }
    if (cons.ProxySC2 !== "" && (url === "" || url === "brst")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress);
      contrato.Proxy = await web3Contracts.contract(abi_PROXY, cons.ProxySC2);

      web3Contracts = await utils.getTronweb(this.state.accountAddress);
      contrato.BRST_TRX_Proxy = await web3Contracts.contract(abi_POOLBRST, cons.ProxySC2);

    }

    if (cons.ProxySC3 !== "" && (url === "" || url === "brst")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress);
      contrato.Proxy_fast = await web3Contracts.contract(abi_PROXY, cons.ProxySC3);

      web3Contracts = await utils.getTronweb(this.state.accountAddress);
      contrato.BRST_TRX_Proxy_fast = await web3Contracts.contract(abi_SimpleSwap, cons.ProxySC3);

    }

    if (cons.BRST !== "" && (url === "" || url === "brst")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress);
      contrato.BRST = await web3Contracts.contract().at(cons.BRST);

    }

    if (cons.BRGY !== "" && (url === "" || url === "brgy")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress);
      contrato.BRGY = await web3Contracts.contract().at(cons.BRGY);

    }
    if (cons.SC3 !== "" && (url === "brgy")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress);
      contrato.MBOX = await web3Contracts.contract().at(cons.SC3);

    }

    if (cons.BRLT !== "" && (url === "" || url === "brlt")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress,2);
      contrato.BRLT = await web3Contracts.contract().at(cons.BRLT);

    }
    if (cons.SC4 !== "" && (url === "brlt")) {
      web3Contracts = await utils.getTronweb(this.state.accountAddress,2);
      contrato.ProxyLoteria = await web3Contracts.contract(abi_PROXY, cons.SC4);

      web3Contracts = await utils.getTronweb(this.state.accountAddress,2);
      contrato.loteria = await web3Contracts.contract(abi_LOTERIA, cons.SC4);

    }

    tronlink['contratosReady'] = true;

    this.setState({
      tronlink: tronlink,
      contrato: contrato,
      conexion: true
    })

  }

  render() {

    if (!this.state.tronlink.contratosReady) return (

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

    let url = window.location.href;

    if (url.indexOf("/?") >= 0) url = (url.split("/?"))[1];
    if (url.indexOf("&") >= 0) url = (url.split("&"))[0];

    switch (url) {

      case "brut":
        return <Home accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} ready={this.state.tronlink['contratosReady']} i18n={i18next} />

      case "brst":
        return <StakingV2 accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} ready={this.state.tronlink['contratosReady']} i18n={i18next} />

      case "brgy":
        return <Nft accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} ready={this.state.tronlink['contratosReady']} i18n={i18next} />

      case "brlt":
        return <LOTERIA accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} ready={this.state.tronlink['contratosReady']} i18n={i18next} />

      case "ebot":
        return <EBOT accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} ready={this.state.tronlink['contratosReady']} i18n={i18next} />

      case "pro":
        return <PRO accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} tronlink={this.state.tronlink} ready={this.state.tronlink['contratosReady']} i18n={i18next} />

      case "api":
        return <API accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} tronlink={this.state.tronlink} ready={this.state.tronlink['contratosReady']} i18n={i18next} />
  
      default:
        return <Inicio accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} ready={this.state.tronlink['contratosReady']} i18n={i18next} />

    }

  }

}

export default App;