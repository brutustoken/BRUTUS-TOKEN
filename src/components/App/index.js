import React, { Component } from "react";
import cons from "../../cons.js";

import Inicio from "../Inicio";

import TronLinkGuide from "../TronLinkGuide";
import Construccion from "../construccion.js";

import Home from "../BRUT";
import Staking from "../BRST";
import Nft from "../BRGY";
import LOTERIA from "../LOTERIA";
import EBOT from "../EBOT";


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
        BRGY: null,
        BRST: null,
        BRST_TRX: null,
        BRST_TRX_V4:null
        
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

      if(window.tronWeb.ready || window.tronLink.ready){

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

        //window.tronWeb.setHeader({"TRON-PRO-API-KEY": 'your api key'});

        if(this.state.contrato.BRST == null){

          window.tronWeb.setHeader(cons.TAK)

          contrato = {};

          if(cons.SC !== ""){
            contrato.BRUT_USDT = await window.tronWeb.contract().at(cons.SC);
          }
          if(cons.USDT !== ""){
            contrato.USDT = await window.tronWeb.contract().at(cons.USDT);
          }
          if(cons.BRUT !== ""){
            contrato.BRUT =  await window.tronWeb.contract().at(cons.BRUT);
          }
          
          if(cons.SC2 !== ""){
            contrato.BRST_TRX = await window.tronWeb.contract().at(cons.SC2);
          }

          if(cons.ProxySC2 !== ""){
            contrato.BRST_TRX_V4 = await window.tronWeb.contract().at(cons.ProxySC2);

            let w = await contrato.BRST_TRX_V4.implementation().call()
            let implem = await window.tronWeb.contract().at(w)

            contrato.BRST_TRX_V4 = null;
            contrato.BRST_TRX_V4 = await window.tronWeb.contract(implem.abi,cons.ProxySC2)

            //console.log(await contrato.BRST_TRX_V4.setDias(17).send())
            
           
            console.log(await contrato.BRST_TRX_V4.TIEMPO().call())

          }

          if(cons.BRST !== ""){
            contrato.BRST = await window.tronWeb.contract().at(cons.BRST);
          }
          
          if(cons.BRGY !== ""){
            contrato.BRGY = await window.tronWeb.contract().at(cons.BRGY);
          }
          if(cons.SC3 !== ""){
            contrato.MBOX =  await window.tronWeb.contract().at(cons.SC3);
          }

          if(cons.BRLT !== ""){
            contrato.BRLT = await window.tronWeb.contract().at(cons.BRLT);
          }
          if(cons.SC4 !== ""){
            contrato.loteria = await window.tronWeb.contract().at(cons.SC4);
          }


          this.setState({
            contrato: contrato
  
          });

        }
        
        
        this.setState({
          accountAddress: wallet,
          tronWeb: tronWeb,

        });
      }else{

        this.setState({
          tronWeb: tronWeb,

        });

      }


    } else {

      console.log("se salio")

      tronWeb['installed'] = false;
      tronWeb['loggedIn'] = false;

      this.setState({
        tronWeb: tronWeb

      });
    }

    /*var inicio = wallet.substr(0,4);
    var fin = wallet.substr(-4);*/

    var texto = wallet; //inicio+"..."+fin;

    document.getElementById("login").innerHTML = '<a href="https://tronscan.io/#/address/'+wallet+'" className="logibtn gradient-btn">'+texto+'</a>';


  }

  render(){

    if ( !this.state.tronWeb.loggedIn || !this.state.tronWeb.installed ) return (

        <div className="container">
          <TronLinkGuide installed={this.state.tronWeb.installed}  />
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

      case window.location.href:
        return <Inicio accountAddress={this.state.accountAddress} contrato={this.state.contrato}/>
    
      default:
        return <Inicio accountAddress={this.state.accountAddress} contrato={this.state.contrato}/>
    }

  }
  
}
export default App;