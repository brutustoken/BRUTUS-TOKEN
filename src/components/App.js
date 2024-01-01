import React, { Component } from "react";

import abi_PROXY from "../abi/Proxy";
import abi_POOLBRST from "../abi/PoolBRSTv4";
import abi_LOTERIA from "../abi/Lottery";
import cons from "../cons.js";

import Inicio from "./Inicio.js";

import TronLinkGuide from "./TronLinkGuide/index.js";
import Construccion from "./construccion.js";

import Home from "./BRUT.js";
import Staking from "./BRST.js";
import StakingV2 from "./BRST-Proxy.js";
import Nft from "./BRGY/index.js";
import LOTERIA from "./BRLT.js";
import EBOT from "./EBOT.js";


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accountAddress:"T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb",
      tronWeb: {
        installed: false,
        loggedIn: false,
        contratosReady: false,
        web3: null
      },
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
        BRST_TRX_Proxy:null
        
      }
    };

    this.conectar = this.conectar.bind(this);
    this.intervalo = this.intervalo.bind(this);

  }

  async componentDidMount() {

    this.intervalo();

    window.addEventListener('message', (e) => {

      if (e.data.message && e.data.message.action === "accountsChanged") {
        if(e.data.message.data.address){
          this.conectar("evento");
        }
      }

     
    })

  }

  intervalo(){
    var interval = setInterval(() => {
      if(!this.state.tronWeb.loggedIn){
        this.conectar("intervalo");
      }else{
        clearInterval(this.state.interval)
        this.setState({interval: null})
      }
    }, 3 * 1000);

    this.setState({interval})

  }

  async conectar(from) {

    console.log("EJECUCION: "+from)

    let tronWeb = this.state.tronWeb;
    let wallet = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb";

    if ( typeof window.tronLink !== 'undefined' ) {

      tronWeb['installed'] = true;

      if(window.tronLink.ready){
        wallet = window.tronLink.tronWeb.defaultAddress.base58
        tronWeb['web3'] = window.tronLink.tronWeb;
        tronWeb['loggedIn'] = true;
      }else{

        const res = await window.tronLink.request({ method: 'tron_requestAccounts' });
  
        if(res.code === 200){
          tronWeb['web3'] = window.tronLink.tronWeb;
          wallet = window.tronLink.tronWeb.defaultAddress.base58
          tronWeb['loggedIn'] = true;

        }else{
          wallet = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb";
          tronWeb['loggedIn'] = false;

        }

      }

      this.setState({
        accountAddress: wallet,
        tronWeb: tronWeb,

      });


    } else {

      console.log("Please install Tronlink to use this Dapp")

      tronWeb['installed'] = false;
      tronWeb['loggedIn'] = false;

      this.setState({
        accountAddress: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb",
        tronWeb: tronWeb

      });

    }

    if(tronWeb['loggedIn']){

      document.getElementById("login").innerHTML = '<a href="https://tronscan.io/#/address/'+wallet+'" className="logibtn gradient-btn">'+wallet+'</a>';

      if(!tronWeb['contratosReady']){

        let web3Contracts = tronWeb['web3'];
        //web3Contracts.setHeader({"TRON-PRO-API-KEY": 'your api key'});

        web3Contracts.setHeader(cons.TAK)

        let contrato = {};

        if(cons.SC !== ""){
          contrato.BRUT_USDT = await web3Contracts.contract().at(cons.SC);
        }
        if(cons.USDT !== ""){
          contrato.USDT = await web3Contracts.contract().at(cons.USDT);
        }
        if(cons.BRUT !== ""){
          contrato.BRUT =  await web3Contracts.contract().at(cons.BRUT);
        }
        
        if(cons.SC2 !== ""){
          contrato.BRST_TRX = await web3Contracts.contract().at(cons.SC2);
        }

        if(cons.ProxySC2 !== ""){
          contrato.Proxy = await web3Contracts.contract(abi_PROXY,cons.ProxySC2);
          contrato.BRST_TRX_Proxy = await web3Contracts.contract(abi_POOLBRST,cons.ProxySC2);

        }

        if(cons.BRST !== ""){
          contrato.BRST = await web3Contracts.contract().at(cons.BRST);
        }
        
        if(cons.BRGY !== ""){
          contrato.BRGY = await web3Contracts.contract().at(cons.BRGY);
        }
        if(cons.SC3 !== ""){
          contrato.MBOX =  await web3Contracts.contract().at(cons.SC3);
        }

        if(cons.BRLT !== ""){
          contrato.BRLT = await web3Contracts.contract().at(cons.BRLT);
        }
        if(cons.SC4 !== ""){
          contrato.loteria = await web3Contracts.contract(abi_LOTERIA,cons.SC4);
        }

        tronWeb['contratosReady'] = true;

        this.setState({
          tronWeb: tronWeb,
          contrato: contrato
        });

      }
    }


  }

  render(){

    if ( !this.state.tronWeb.loggedIn || !this.state.tronWeb.installed ) return (
      <div className="container">
        <TronLinkGuide installed={this.state.tronWeb.installed}  />
      </div>
    );

    if ( !this.state.tronWeb.contratosReady ) return (

      <div className="container">
        <div className='row' style={{ 'padding': '3em', 'decoration': 'none' }} >
          <div className='col-sm-8'>
              <h1>Preparing application</h1>
              <p>
                All smart contracts are being loaded so that the application works correctly, please wait a few moments
              </p>
          </div>
        </div>
      </div>
    );

    let url = window.location.href;

    if(url.indexOf("/?") >= 0 )url = (url.split("/?"))[1];
    if(url.indexOf("&") >= 0 )url = (url.split("&"))[0];

    switch (url) {
      case "usd":
      case "usdt":
      case "token":
      case "brut":
        return <Home accountAddress={this.state.accountAddress} contrato={this.state.contrato} />

      case "trx":
      case "tron":
      case "brst":
        return <StakingV2 accountAddress={this.state.accountAddress} contrato={this.state.contrato} />

      case "brst_old":
        return <Staking accountAddress={this.state.accountAddress} contrato={this.state.contrato} />

      case "nft":
      case "brgy":
        return <Nft accountAddress={this.state.accountAddress}  contrato={this.state.contrato} />

      case "ebot":
      case "EBOT":
      case "bot":
      case "energia":
      case "anchodebanda":
      case "energy":
      case "bandwidth":
        return <EBOT accountAddress={this.state.accountAddress} contrato={this.state.contrato} />
      
      case "pro":
        return <Construccion/>

      case "brlt":
      case "suerte":
      case "loteria":
        //return <Construccion/>
        return <LOTERIA accountAddress={this.state.accountAddress} contrato={this.state.contrato} />

      default:
        return <Inicio accountAddress={this.state.accountAddress} contrato={this.state.contrato}/>
    }



  }
  
}

export default App;