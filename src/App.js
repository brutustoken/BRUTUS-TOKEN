import React, { Component } from "react";

import TronWeb from "tronweb";
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink';

import abi_PROXY from "./abi/Proxy";
import abi_POOLBRST from "./abi/PoolBRSTv4";
import abi_LOTERIA from "./abi/Lottery";
import cons from "./cons.js";

import Inicio from "./components/Inicio.js";

//import TronLinkGuide from "./TronLinkGuide/index.js";

import Home from "./components/BRUT.js";
import StakingV2 from "./components/BRST-Proxy.js";
import Nft from "./components/BRGY/index.js";
import LOTERIA from "./components/BRLT.js";
import EBOT from "./components/EBOT.js";


import i18next from 'i18next';
import lng from "./locales/langs.js"

let lenguaje = navigator.language || navigator.userLanguage

i18next.init({
  fallbackLng: 'en',
  lng: lenguaje, // if you're using a language detector, do not define the lng option
  debug: true,
  resources: lng

});

let lgSelector = "en";

try {
  lgSelector = document.getElementById("selectLng").value
} catch (error) {

}

//console.log(lgSelector, i18nLenguaje)

if (lenguaje !== lgSelector) {
  i18next.changeLanguage(lgSelector);
}


const tronWeb = new TronWeb({
  fullHost: cons.RED
})

const adapter = new TronLinkAdapter();

function conectDirect() {
  adapter.connect()
    .then(() => { console.log("conectado") })
    .catch((e) => { console.log(e) })
}

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

      }
    };

    this.conectar = this.conectar.bind(this);
    this.intervalo = this.intervalo.bind(this);

  }

  async componentDidMount() {

    this.intervalo(3);

    window.addEventListener('message', (e) => {
      if (e.data.message && e.data.message.action) {
        //console.log(e.data.message.action)
      }

      if (e.data.message && e.data.message.action === "accountsChanged") {
        if (e.data.message.data.address) {
          this.conectar();
        }
      }
    })

  }

  async componentWillUnmount() {
    clearInterval(this.state.interval)
    this.setState({ interval: null })
  }

  intervalo(s) {
    var interval = setInterval(() => {
      //console.log("intervalo a la espera...")

      if (!this.state.tronlink.loggedIn || !window.tronLink.ready) {

        console.log("conectando...")
        this.conectar();
      }
    }, s * 1000);

    this.setState({ interval })

  }


  async conectar() {

    let tronlink = this.state.tronlink;
    let wallet = adressDefault;
    let web3Contracts = {};

    web3Contracts = tronWeb;
    web3Contracts.setAddress(adressDefault)


    if (typeof window.tronLink !== 'undefined') {

      tronlink['installed'] = true;

      if (window.tronLink.ready) {
        wallet = window.tronLink.tronWeb.defaultAddress.base58
        tronlink['loggedIn'] = true;
        web3Contracts = window.tronLink.tronWeb;

      } else {

        const res = await window.tronLink.request({ method: 'tron_requestAccounts' });

        if (res.code === 200) {
          wallet = window.tronLink.tronWeb.defaultAddress.base58
          tronlink['loggedIn'] = true;
          web3Contracts = window.tronLink.tronWeb;


        } else {
          wallet = adressDefault;
          tronlink['loggedIn'] = false;
          web3Contracts = tronWeb;
          web3Contracts.setAddress(adressDefault)

        }

      }

      this.setState({
        accountAddress: wallet,
        tronlink: tronlink,
        tronWeb: web3Contracts

      });


    } else {

      console.log("Please install Tronlink to use this Dapp")

      tronlink['installed'] = false;
      tronlink['loggedIn'] = false;

      this.setState({
        accountAddress: adressDefault,
        tronlink: tronlink

      });

    }

    if (tronlink['loggedIn']) {

      document.getElementById("login").innerHTML = '<a href="https://tronscan.io/#/address/' + wallet + '" className="logibtn gradient-btn">' + wallet + '</a>';
    } else {
      document.getElementById("login").innerHTML = '<span id="conectTL" class="btn btn-primary" style="cursor:pointer">Conect Wallet </span> <img src="images/TronLinkLogo.png" height="40px" alt="TronLink logo" />';
      document.getElementById("conectTL").onclick = () => { conectDirect() }
    }


    if (!tronlink['contratosReady']) {

      //web3Contracts.setHeader({"TRON-PRO-API-KEY": 'your api key'});
      web3Contracts.setHeader(cons.TAK)
      let contrato = {};

      let url = window.location.href;
      if (url.indexOf("/?") >= 0) url = (url.split("/?"))[1];
      if (url.indexOf("&") >= 0) url = (url.split("&"))[0];
      if (url === window.location.href || url === "utm_source=tronlink") url = ""

      if (cons.BRUT !== "" && (url === "" || url === "brut")) {
        contrato.BRUT = await web3Contracts.contract().at(cons.BRUT);
      }
      if (cons.USDT !== "" && (url === "brut")) {
        contrato.USDT = await web3Contracts.contract().at(cons.USDT);
      }
      if (cons.SC !== "" && (url === "brut")) {
        contrato.BRUT_USDT = await web3Contracts.contract().at(cons.SC);
      }

      if (cons.SC2 !== "" && (url === "brst")) {
        contrato.BRST_TRX = await web3Contracts.contract().at(cons.SC2);
      }
      if (cons.ProxySC2 !== "" && (url === "" || url === "brst")) {
        contrato.Proxy = await web3Contracts.contract(abi_PROXY, cons.ProxySC2);
        contrato.BRST_TRX_Proxy = await web3Contracts.contract(abi_POOLBRST, cons.ProxySC2);
      }
      if (cons.BRST !== "" && (url === "" || url === "brst")) {
        contrato.BRST = await web3Contracts.contract().at(cons.BRST);
      }

      if (cons.BRGY !== "" && (url === "" || url === "brgy")) {
        contrato.BRGY = await web3Contracts.contract().at(cons.BRGY);
      }
      if (cons.SC3 !== "" && (url === "brgy")) {
        contrato.MBOX = await web3Contracts.contract().at(cons.SC3);
      }

      if (cons.BRLT !== "" && (url === "" || url === "brlt")) {
        contrato.BRLT = await web3Contracts.contract().at(cons.BRLT);
      }
      if (cons.SC4 !== "" && (url === "brlt")) {
        contrato.ProxyLoteria = await web3Contracts.contract(abi_PROXY, cons.SC4);
        contrato.loteria = await web3Contracts.contract(abi_LOTERIA, cons.SC4);
      }

      tronlink['contratosReady'] = true;

      this.setState({
        tronlink: tronlink,
        contrato: contrato
      });

    }

  }

  render() {

    /*if ( !this.state.tronlink.loggedIn || !this.state.tronlink.installed ) {
      return (
      <TronLinkGuide installed={this.state.tronlink.installed}  />
      );
    }*/

    if (!this.state.tronlink.contratosReady) return (

      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="card">
              <div className='row' style={{ 'padding': '3em', 'decoration': 'none' }} >
                <div className='col-sm-8'>
                  <h1>Preparing application {imgLoading}</h1>
                  <p>
                    All smart contracts are being loaded so that the application works correctly, please wait a few moments
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

      case "ebot":
        return <EBOT accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} ready={this.state.tronlink['contratosReady']} i18n={i18next} />

      case "pro":
        return <Inicio accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} ready={this.state.tronlink['contratosReady']} i18n={i18next} />

      case "brlt":
        return <LOTERIA accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} ready={this.state.tronlink['contratosReady']} i18n={i18next} />

      default:
        return <Inicio accountAddress={this.state.accountAddress} contrato={this.state.contrato} tronWeb={this.state.tronWeb} ready={this.state.tronlink['contratosReady']} i18n={i18next} />

    }

  }

}

export default App;