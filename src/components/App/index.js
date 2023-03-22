import React, { Component } from "react";
import {  BrowserRouter,  Routes,  Route } from "react-router-dom";
import cons from "../../cons.js";

import Inicio from "../Inicio";

import Home from "../BRUT";
import Staking from "../BRST";
import Nft from "../BRGY";
import LOTERIA from "../LOTERIA";
import TronLinkGuide from "../TronLinkGuide";


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accountAddress:"T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb",
      tronWeb: {
        installed: false,
        loggedIn: false,
        web3: null
      },
      contrato: {
        BRUT_USDT: null,
        BRUT: null,
        MBOX: null,
        loteria: null,
        BRLT: null,
        USDT: null,
        BRGY: null
        
      }
    };

    this.conectar = this.conectar.bind(this);
  }

  async componentDidMount() {

    setInterval(() => {
      this.conectar();
    }, 3 * 1000);

  }

  async conectar() {

    var {tronWeb, wallet, contrato} = this.state;
    var conexion = 0;


    if ( typeof window.tronWeb !== 'undefined' && typeof window.tronLink !== 'undefined' ) {

      tronWeb['installed'] = true;

      try {
        conexion = (await window.tronLink.request({ method: 'tron_requestAccounts' })).code;
      } catch(e) {
        conexion = 0
      }

      if(conexion === 200){
        tronWeb['loggedIn'] = true;
        wallet = window.tronLink.tronWeb.defaultAddress.base58

      }else{
        tronWeb['loggedIn'] = false;
        wallet = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb";

      }

      tronWeb['web3'] = window.tronWeb;

      try {
        var BRUT_USDT = await window.tronWeb.contract().at(cons.SC);
        var BRUT =  await window.tronWeb.contract().at(cons.SC2);
        var MBOX =  await window.tronWeb.contract().at(cons.SC3);
        var USDT = await window.tronWeb.contract().at(cons.USDT);
        var BRGY = await window.tronWeb.contract().at(cons.BRGY)
        var loteria = null//await window.tronWeb.contract().at(cons.SC4);
        var BRLT = null// await window.tronWeb.contract().at(cons.BRLT);
        var contrato = { BRUT_USDT, BRUT, MBOX, loteria, BRLT, BRGY, USDT }
      } catch(e) {

        console.log(e)
        contrato = {
          BRUT_USDT: null,
          BRUT: null,
          MBOX: null,
          loteria: null,
          BRLT: null,
          USDT: null,
          BRGY: null
          
        }
      }

      console.log("entro")


      this.setState({
        accountAddress: wallet,
        tronWeb: tronWeb,
        contrato: contrato

      });


    } else {

      console.log("se salio")


      tronWeb['installed'] = false;
      tronWeb['loggedIn'] = false;

      this.setState({
        tronWeb: tronWeb

      });
    }

    var inicio = wallet.substr(0,4);
    var fin = wallet.substr(-4);

    var texto = wallet; //inicio+"..."+fin;

    document.getElementById("login").innerHTML = '<a href="https://tronscan.io/#/address/'+wallet+'" className="logibtn gradient-btn">'+texto+'</a>';



  }

  /*
  render() {


    var getString = "";
    var loc = document.location.href;
    //console.log(loc);
    if (loc.indexOf('?') > 0) {

      getString = loc.split('?')[1];
      getString = getString.split('#')[0];

    }

    switch (getString) {
      case "staking":
      case "brst":
      case "BRST":
        if (!this.state.tronWeb.installed) return (
          <>
            <StakingBaner />
            <div className="container">
              <TronLinkGuide installed={this.state.tronWeb.installed} url={"/?" + getString} />
            </div>
          </>
        );

        if (!this.state.tronWeb.loggedIn) return (
          <>
            <StakingBaner />
            <div className="container">
              <TronLinkGuide installed={this.state.tronWeb.installed} url={"/?" + getString} />
            </div>
          </>
        );

        return (
          <>
            <StakingBaner getString={getString} />
            <Staking />
          </>
        );

      case "brut":
      case "BRUT":
      case "token":
      case "TOKEN":

        if (!this.state.tronWeb.installed) return (
          <>
            <HomeBaner />
            <div className="container">
              <TronLinkGuide url={"/?" + getString} />
            </div>
          </>
        );

        if (!this.state.tronWeb.loggedIn) return (
          <>
            <HomeBaner />
            <div className="container">
              <TronLinkGuide installed url={"/?" + getString} />
            </div>
          </>
        );

        return (
          <>
            <HomeBaner getString={getString} />
            <Home accountAddress={this.state.accountAddress} />
          </>
        );

      case "brgy":
      case "BRGY":
      case "nft":
      case "NFT":
        if (!this.state.tronWeb.installed) return (
          <>
            <NftBaner />
            <div className="container">
              <TronLinkGuide url={"/?" + getString} />
            </div>
          </>
        );

        if (!this.state.tronWeb.loggedIn) return (
          <>
            <NftBaner />
            <div className="container">
              <TronLinkGuide installed url={"/?" + getString} />
            </div>
          </>
        );

        return (
          <>
            <NftBaner getString={getString} />
            <Nft accountAddress={this.state.accountAddress} />
          </>
        );

      case "loteria":
      case "rifa":
      case "sorteo":
        if (!this.state.tronWeb.installed) return (
          <>
            <LOTERIABaner />
            <div className="container">
              <TronLinkGuide url={"/?" + getString} />
            </div>
          </>
        );

        if (!this.state.tronWeb.loggedIn) return (
          <>
            <LOTERIABaner />
            <div className="container">
              <TronLinkGuide installed url={"/?" + getString} />
            </div>
          </>
        );

        return (
          <>
            <LOTERIABaner getString={getString} />
            <LOTERIA accountAddress={this.state.accountAddress} contrato={this.state.contrato} />
          </>
        );

      case "faq":
      case "FAQ":
      case "preguntasfrecuentes": return (
        <>
          <FAQ />
        </>
      );


      default:

        return (<><Inicio /></>);

    }



  }
*/

  render(){

    if (!this.state.tronWeb.installed) return (

        <div className="container">
          <TronLinkGuide installed={this.state.tronWeb.installed}  />
        </div>
    );

    if (!this.state.tronWeb.loggedIn) return (

        <div className="container">
          <TronLinkGuide installed={this.state.tronWeb.installed}  />
        </div>
    );

    return(
      <BrowserRouter>
        <Routes>
          <Route index element={<Inicio accountAddress={this.state.accountAddress} contrato={this.state.contrato}/>} />
          <Route exact path="/" element={<Inicio accountAddress={this.state.accountAddress} contrato={this.state.contrato} />} />
          <Route path="/brut" element={<Home accountAddress={this.state.accountAddress} />} />
          <Route path="/brst" element={<Staking accountAddress={this.state.accountAddress} />} />
          <Route path="/brgy" element={<Nft accountAddress={this.state.accountAddress} />}  />
          <Route path="/brlt" element={<LOTERIA accountAddress={this.state.accountAddress} />} />

        </Routes>

      </BrowserRouter>
    )
  }
  


}
export default App;

// {tWeb()}
