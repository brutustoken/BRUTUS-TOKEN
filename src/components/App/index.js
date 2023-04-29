import React, { Component } from "react";
import { IntlProvider, FormattedMessage } from 'react-intl';
import cons from "../../cons.js";

import Inicio from "../Inicio";

import Home from "../BRUT";
import Staking from "../BRST";
import Nft from "../BRGY";
//import LOTERIA from "../LOTERIA";
import TronLinkGuide from "../TronLinkGuide";

import idiomaEsCo from "../../lang/es-CO.json";
import idiomaEnUs from "../../lang/en-US.json";

function selectLang(idioma) {

  var lang = "";
  const array = [
    { label: "es-co", data: idiomaEsCo, active: true },
    { label: "en-us", data: idiomaEnUs, active: true }
  ]

  let texto = array.find(element => element.label === idioma.toLowerCase())
  let enLista = false;

  if (texto === undefined || !texto.active) {
    texto = array[0];
    enLista = false;
  } else {
    enLista = true;
  }

  console.log(idioma)

  if (idioma === 'es-co') {
    lang = "";
  } else {
    lang = "&lang=" + texto.label;

  }

  return [texto.data, enLista, lang];

}


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accountAddress: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb",
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
      },
      idioma: 'es-co',
      pagina: "",
      lang: ""
    };

    this.conectar = this.conectar.bind(this);
  }



  async componentDidMount() {



    setInterval(() => {
      this.conectar();
    }, 3 * 1000);

  }

  async conectar() {

    var { tronWeb, wallet, contrato } = this.state;
    var conexion = 0;

    if (typeof window.tronWeb !== 'undefined' && typeof window.tronLink !== 'undefined') {

      tronWeb['installed'] = true;

      if (window.tronWeb.ready || window.tronLink.ready) {

        try {
          conexion = (await window.tronLink.request({ method: 'tron_requestAccounts' })).code;
        } catch (e) {
          conexion = 0
        }

        if (conexion === 200) {
          tronWeb['loggedIn'] = true;
          wallet = window.tronLink.tronWeb.defaultAddress.base58

        } else {
          tronWeb['loggedIn'] = false;
          wallet = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb";

        }

        tronWeb['web3'] = window.tronWeb;
        //var tronWeb = window.tronWeb;
        //tronWeb = tronWeb.setHeader({"TRON-PRO-API-KEY": 'your api key'});

        if (this.state.contrato.MBOX == null) {

          window.tronWeb.setHeader({ "TRON-PRO-API-KEY": 'b0e8c09f-a9c8-4b77-8363-3cde81365fac' })

          var USDT = await window.tronWeb.contract().at(cons.USDT)
          var BRUT = await window.tronWeb.contract().at(cons.BRUT)
          var BRUT_USDT = await window.tronWeb.contract().at(cons.SC)
          var BRST = await window.tronWeb.contract().at(cons.BRST)
          var BRST_TRX = await window.tronWeb.contract().at(cons.SC2)
          var BRGY = await window.tronWeb.contract().at(cons.BRGY)
          var MBOX = await window.tronWeb.contract().at(cons.SC3)
          var BRLT = null// await window.tronWeb.contract().at(cons.BRLT);
          var loteria = null//await window.tronWeb.contract().at(cons.SC4);
          contrato = { USDT, BRUT, BRUT_USDT, BRST, BRST_TRX, BRGY, MBOX, BRLT, loteria }


          this.setState({
            contrato: contrato

          });

        }


        this.setState({
          accountAddress: wallet,
          tronWeb: tronWeb,

        });
      } else {

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

    //document.getElementById("login").innerHTML = '<a href="https://tronscan.io/#/address/' + wallet + '" className="logibtn gradient-btn">' + texto + '</a>';

    this.setState({
      wallet: wallet
    })

  }

  renderSwitch(pagina) {
    switch (pagina) {
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
        return <Nft accountAddress={this.state.accountAddress} contrato={this.state.contrato} />

      /*
      case "brlt":
      case "suerte":
      case "loteria":
        return <LOTERIA accountAddress={this.state.accountAddress} contrato={this.state.contrato} />*/


      default:
        return <Inicio accountAddress={this.state.accountAddress} contrato={this.state.contrato} idioma={this.state.idioma} textos={this.state.textos} lang={this.state.lang} />
    }
  }

  render() {
    let url = window.location.href;
    let pagina = this.state;
    pagina = pagina + "";
    let idioma = 'es-co';

    if (url.indexOf("/?") >= 0) pagina = (url.split("/?"))[1];
    if (pagina.indexOf("&") >= 0) pagina = (pagina.split("&"))[0];

    if (url.indexOf("lang=") >= 0) idioma = (url.split("lang="))[1];
    if (idioma.indexOf("&") >= 0) idioma = (idioma.split("&"))[0];

    if (idioma !== this.state.idioma && selectLang(idioma)[1]) {
      this.setState({
        idioma: idioma,
        textos: selectLang(idioma)[0],
        lang: selectLang(idioma)[2],
      })
    }

    if (!this.state.tronWeb.loggedIn || !this.state.tronWeb.installed) return (

      <div className="container">
        <TronLinkGuide installed={this.state.tronWeb.installed} idioma={this.state.idioma} textos={this.state.textos} />
      </div>
    );

    return (
      <IntlProvider messages={this.state.textos} locale={this.state.idioma} defaultLocale="es-co">

        <div className="offcanvas offcanvas-start bg-dark text-white" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel" style={{width:"280px"}} >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasExampleLabel"><FormattedMessage id="navegacion.titulo" defaultMessage="Menú principal" /></h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body text-white">
            <ul >
              <li><button className="btn btn-primary mb-2"  style={{ cursor: "pointer" }} onClick={() => {
                this.setState({ pagina: "" })
              }}>
                <i className="bi bi-bank"></i>&nbsp;
                <span className="nav-text"><FormattedMessage id="navegacion.inicio" defaultMessage="Vista General" /></span>
              </button>
              </li>
              <li><button className="btn btn-primary mb-2"  style={{ cursor: "pointer" }} onClick={() => {
                this.setState({ pagina: "brut" })
              }}>
                <i className="bi bi-graph-up-arrow"></i>&nbsp;
                <span className="nav-text">Brutus Token</span>
              </button>
              </li>
              <li><button className="btn btn-primary mb-2"  style={{ cursor: "pointer" }} onClick={() => {
                this.setState({ pagina: "brst" })
              }}>
                <i className="bi bi-hdd-rack"></i>&nbsp;
                <span className="nav-text">Brutus Tron Staking</span>
              </button></li>
              <li><button className="btn btn-primary mb-2"  style={{ cursor: "pointer" }} onClick={() => {
                this.setState({ pagina: "brgy" })
              }}>
                <i className="bi bi-images"></i>&nbsp;
                <span className="nav-text"><FormattedMessage id="navegacion.galeria" defaultMessage="Galería" /> NFT</span>
              </button>
              </li>
              <li>
                <a className="btn btn-primary mb-2"  href="https://t.me/BRUTUS_ENERGY" >
                  <i className="bi bi-lightning-charge"></i>&nbsp;
                  <span className="nav-text">Energy BOT</span>
                </a>
              </li>
              <li><button className="btn btn-primary mb-2"  style={{ cursor: "pointer" }} onClick={() => {
                this.setState({ pagina: "" })
              }}>
                <i className="bi bi-coin"></i>&nbsp;
                <span className="nav-text">Brutus Lottery</span>
              </button>
              </li>

            </ul>

            <div className="copyright">
              <p><strong>Brutus Finance</strong> © <script> document.write(new Date(Date.now()).getFullYear())</script></p>
              <p className="fs-12"><FormattedMessage id="navegacion.footer" defaultMessage="Hecho con ❤ por Brutus Team" /></p>
            </div>
            <div className="dropdown mt-3">
              <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                Idioma
              </button>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="?lang=es-co">Español</a></li>
                <li><a className="dropdown-item" href="?lang=en-us">Englis</a></li>
                <li><a className="dropdown-item" href="?lang=pr-br">Portuguese</a></li>
              </ul>
            </div>
          </div>
        </div>


        <div className="nav-header">
          <a href="https://brutus.finance" target="_blank" className="brand-logo" rel="noopener noreferrer">
            <img className="logo-abbr" height="40px" width="40px" src="images/Brutus.svg" alt="" />
            <img className="brand-title" src="images/logo-text-white.png" alt="" />
          </a>

          <div className="nav-control">
            <div className="hamburger" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample">
              <span className="line"></span><span className="line"></span><span className="line"></span>
            </div>
          </div>

        </div>

        <div className="header">
          <div className="header-content">
            <nav className="navbar navbar-expand">
              <div className="collapse navbar-collapse justify-content-between">

                <ul className="navbar-nav header-right main-notification">

                  <li className="nav-item dropdown notification_dropdown d-sm-flex d-none">
                    <a className="nav-link  ai-icon" href="#" role="button"
                      data-bs-toggle="dropdown">
                      <svg width="24" height="24" viewBox="0 0 28 28" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M23.625 6.12506H22.75V2.62506C22.75 2.47268 22.7102 2.32295 22.6345 2.19068C22.5589 2.05841 22.45 1.94819 22.3186 1.87093C22.1873 1.79367 22.0381 1.75205 21.8857 1.75019C21.7333 1.74832 21.5831 1.78629 21.4499 1.86031L14 5.99915L6.55007 1.86031C6.41688 1.78629 6.26667 1.74832 6.11431 1.75019C5.96194 1.75205 5.8127 1.79367 5.68136 1.87093C5.55002 1.94819 5.44113 2.05841 5.36547 2.19068C5.28981 2.32295 5.25001 2.47268 5.25 2.62506V6.12506H4.375C3.67904 6.12582 3.01181 6.40263 2.51969 6.89475C2.02757 7.38687 1.75076 8.0541 1.75 8.75006V11.3751C1.75076 12.071 2.02757 12.7383 2.51969 13.2304C3.01181 13.7225 3.67904 13.9993 4.375 14.0001H5.25V23.6251C5.25076 24.321 5.52757 24.9882 6.01969 25.4804C6.51181 25.9725 7.17904 26.2493 7.875 26.2501H20.125C20.821 26.2493 21.4882 25.9725 21.9803 25.4804C22.4724 24.9882 22.7492 24.321 22.75 23.6251V14.0001H23.625C24.321 13.9993 24.9882 13.7225 25.4803 13.2304C25.9724 12.7383 26.2492 12.071 26.25 11.3751V8.75006C26.2492 8.0541 25.9724 7.38687 25.4803 6.89475C24.9882 6.40263 24.321 6.12582 23.625 6.12506ZM21 6.12506H17.3769L21 4.11256V6.12506ZM7 4.11256L10.6231 6.12506H7V4.11256ZM7 23.6251V14.0001H13.125V24.5001H7.875C7.64303 24.4998 7.42064 24.4075 7.25661 24.2434C7.09258 24.0794 7.0003 23.857 7 23.6251ZM21 23.6251C20.9997 23.857 20.9074 24.0794 20.7434 24.2434C20.5794 24.4075 20.357 24.4998 20.125 24.5001H14.875V14.0001H21V23.6251ZM24.5 11.3751C24.4997 11.607 24.4074 11.8294 24.2434 11.9934C24.0794 12.1575 23.857 12.2498 23.625 12.2501H4.375C4.14303 12.2498 3.92064 12.1575 3.75661 11.9934C3.59258 11.8294 3.5003 11.607 3.5 11.3751V8.75006C3.5003 8.51809 3.59258 8.2957 3.75661 8.13167C3.92064 7.96764 4.14303 7.87536 4.375 7.87506H23.625C23.857 7.87536 24.0794 7.96764 24.2434 8.13167C24.4074 8.2957 24.4997 8.51809 24.5 8.75006V11.3751Z"
                          fill="#EB8153" />
                      </svg>
                    </a>
                  </li>
                  <li className="nav-item dropdown header-profile">
                    <a className="nav-link" href={"https://tronscan.io/#/address/" + this.state.wallet} >
                      <img src="images/profile/pic1.png" width="20" alt="" />
                      <div className="header-info">
                        <span>TronLik Wallet</span>
                        <small>{this.state.wallet}</small>
                      </div>
                    </a>
                  </li>
                </ul>

              </div>
            </nav>
          </div>
        </div>

        <div className="container-fluid" style={{marginTop: "85px"}}>
          {this.renderSwitch(this.state.pagina)}
        </div>


        <div className="footer">
          <div className="copyright">
            <p>Copyright © <a href="http://brutustoken.com/" target="_blank"> Brutus Token </a> 2023</p>
            <p>Rv. 28/04/2023 11:00pm</p>
          </div>
        </div>

      </IntlProvider>
    )



  }

}
export default App;

// {tWeb()}
