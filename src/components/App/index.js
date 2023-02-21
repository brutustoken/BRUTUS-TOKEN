import React, { Component } from "react";

import Inicio from "../Inicio";

import Home from "../BRUT";
import HomeBaner from "../BRUT/HomeBaner";
import Staking from "../BRST";
import StakingBaner from "../BRST/StakingBaner";
import Nft from "../BRGY";
import NftBaner from "../BRGY/nftBaner";
import LOTERIA from "../LOTERIA";
import LOTERIABaner from "../LOTERIA/nftBaner";
import TronLinkGuide from "../TronLinkGuide";


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accountAddress: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb",
      tronWeb: {
        address: "Cargando...",
        installed: false,
        loggedIn: false,
        web3: null
      }
    };

    this.conectar = this.conectar.bind(this);
  }

  async componentDidMount() {
    
    setInterval(async() => {
      await this.conectar();
    }, 7*1000);
      
  }

  async conectar(){

    if ( typeof window.tronLink !== 'undefined' && typeof window.tronWeb !== 'undefined' && document.location.href.indexOf('?')>0 ) { 

      var tronWeb = this.state.tronWeb;

      tronWeb['installed'] = true;
      tronWeb['web3'] = window.tronLink.tronWeb;

    
      this.setState({

        tronWeb: tronWeb
    
      });

      window.tronLink.request({method: 'tron_requestAccounts'})
      .then(()=>{

      
        window.tronWeb.trx.getAccount()
        .then((account)=>{
          tronWeb['loggedIn'] = true;

          this.setState({
            tronWeb: tronWeb,
            accountAddress: window.tronWeb.address.fromHex(account.address)
        
          });

        }).catch(()=>{
          tronWeb['loggedIn'] = false;
          this.setState({

            tronWeb: tronWeb
        
          });

        })
        
          
      }).catch(()=>{

          tronWeb['installed'] = false;
          tronWeb['loggedIn'] = false;

          this.setState({

            tronWeb: tronWeb
        
          });

      })



      
    }
  }

  render() {


    var getString = "";
    var loc = document.location.href;
    //console.log(loc);
    if(loc.indexOf('?')>0){
              
      getString = loc.split('?')[1];
      getString = getString.split('#')[0];

    }

    switch (getString) {
      case "staking": 
      case "brst":
      case "BRST": 
        if (!this.state.tronWeb.installed) return (
          <>
            <StakingBaner/>
            <div className="container">
              <TronLinkGuide  url={"/?"+getString}/>
            </div>
          </>
          );
    
        if (!this.state.tronWeb.loggedIn) return (
          <>
            <StakingBaner/>
            <div className="container">
              <TronLinkGuide installed url={"/?"+getString}/>
            </div>
          </>
          );
    
        return (
          <>
            <StakingBaner getString={getString}/>
            <Staking />
          </>
        );
      

      case "brut":
      case "BRUT":
      case "token":
      case "TOKEN":
   
        if (!this.state.tronWeb.installed) return (
          <>
            <HomeBaner/>
            <div className="container">
              <TronLinkGuide url={"/?"+getString}/>
            </div>
          </>
          );
    
        if (!this.state.tronWeb.loggedIn) return (
          <>
            <HomeBaner/>
            <div className="container">
              <TronLinkGuide installed url={"/?"+getString}/>
            </div>
          </>
          );
    
        return (
          <>
            <HomeBaner getString={getString}/>
            <Home accountAddress={this.state.accountAddress}/>
          </>
        );

      case "brgy":
      case "BRGY":
      case "nft":
      case "NFT":
          if (!this.state.tronWeb.installed) return (
            <>
              <NftBaner/>
              <div className="container">
                <TronLinkGuide url={"/?"+getString}/>
              </div>
            </>
            );
      
          if (!this.state.tronWeb.loggedIn) return (
            <>
              <NftBaner/>
              <div className="container">
                <TronLinkGuide installed url={"/?"+getString}/>
              </div>
            </>
            );
      
          return (
            <>
              <NftBaner getString={getString}/>
              <Nft accountAddress={this.state.accountAddress} />
            </>
          );


      case "loteria":
      case "rifa":
      case "sorteo":
                if (!this.state.tronWeb.installed) return (
                  <>
                    <LOTERIABaner/>
                    <div className="container">
                      <TronLinkGuide url={"/?"+getString}/>
                    </div>
                  </>
                  );
            
                if (!this.state.tronWeb.loggedIn) return (
                  <>
                    <LOTERIABaner/>
                    <div className="container">
                      <TronLinkGuide installed url={"/?"+getString}/>
                    </div>
                  </>
                  );
            
                return (
                  <>
                    <LOTERIABaner getString={getString}/>
                    <LOTERIA accountAddress={this.state.accountAddress} />
                  </>
                );
      
    
      default:  

        return (<><Inicio /></>);
      
    }


    
  }

  
}
export default App;

// {tWeb()}
