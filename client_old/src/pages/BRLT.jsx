import React, { Component } from "react";
import { withTranslation } from 'react-i18next';

import abi_SUNSAWPv2 from "../assets/abi/sunswapV2.json";
import utils from "../utils";

const BigNumber = require('bignumber.js');

let sunswapRouter = "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax" // suwap V2
let intervalId = [];

class NFTs extends Component {

  constructor(props) {
    super(props);

    this.state = {
      deposito: "Loading...",
      wallet: this.props.accountAddress,
      balanceBRUT: 0,
      precioBRUT: 0,
      mc: 0,
      mb: 0,
      totalNFT: 1,
      premio: "Loading...",
      LastWiner: "Loading...",
      proximoSorteo: "Loading...",
      modalTitulo: "",
      modalBody: "",
      contarSegundos: 10e25,
      restanteSegundos: 10e25,
      porcentaje: 0,

      comprarBRLT: 1,
      precioUnidad: 100,
      total: 100,
      moneda: "trx",

      tikets: [],

      days: "",
      hours: "00",
      minutes: "00",
      seconds: "00",

      deadline: 1,

      onSale: <>Loading NFT FOR SALE</>,

      imagenSeleccionada: null,
      mostrarModalImagen: false,
      zoom: 0.5,

    };

    this.estado = this.estado.bind(this);
    this.consultarPrecio = this.consultarPrecio.bind(this);

    this.preCompra = this.preCompra.bind(this);
    this.compra = this.compra.bind(this);


    this.sunSwap = this.sunSwap.bind(this);
    this.sorteo = this.sorteo.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeSelect = this.handleChangeSelect.bind(this);

    this.updateCountdown = this.updateCountdown.bind(this);

    this.abrirModalImagen = this.abrirModalImagen.bind(this);
    this.cerrarModalImagen = this.cerrarModalImagen.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.compartirImagen = this.compartirImagen.bind(this);
    this.descargarImagen = this.descargarImagen.bind(this);



  }

  async componentDidMount() {

    setTimeout(async () => {
      this.estado();
    }, 3 * 1000)

    intervalId.push(setInterval(() => this.updateCountdown(), 1000))

    intervalId.push(setInterval(() => {

      let restanteSegundos = parseInt(this.state.contarSegundos - (Date.now() / 1000))

      this.setState({
        restanteSegundos: restanteSegundos,
        porcentaje: (restanteSegundos / 1296000 * 100)
      })

    }, 1 * 1000))

    intervalId.push(setInterval(async () => {
      if (this.props.contrato.ready) {
        clearInterval(intervalId[2])
        intervalId.push(setInterval(() => this.estado(), 60 * 1000))
      }
      this.estado();
    }, 6 * 1000))


  };

  componentWillUnmount() {

    for (let index = 0; index < intervalId.length; index++) {
      clearInterval(intervalId[index])

    }

  }

  abrirModalImagen = (imagen) => {
    this.setState({
      imagenSeleccionada: imagen,
      mostrarModalImagen: true,
      zoom: 0.5,
    });
  };

  cerrarModalImagen = () => {
    this.setState({
      mostrarModalImagen: false,
      imagenSeleccionada: null,
      zoom: 0.5,
    });
  };

  zoomIn = () => {
    this.setState(prevState => ({ zoom: prevState.zoom + 0.1 }));
  };

  zoomOut = () => {
    this.setState(prevState => ({ zoom: Math.max(0.1, prevState.zoom - 0.1) }));
  };

  compartirImagen = () => {
    if (navigator.share) {
      navigator.share({
        title: 'NFT Image',
        url: this.state.imagenSeleccionada,
      });
    } else {
      navigator.clipboard.writeText(this.state.imagenSeleccionada);
      alert('Enlace copiado al portapapeles');
    }
  };

  descargarImagen = () => {
    const link = document.createElement('a');
    link.href = this.state.imagenSeleccionada;
    link.download = 'nft-image.png';
    link.click();
  };

  handleChange(e) {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) value = 1;
    this.setState({
      comprarBRLT: value,
      total: value * this.state.precioUnidad
    });
  }

  handleChangeSelect(e) {
    let value = e.target.value;
    this.setState({
      moneda: value
    });
  }

  updateCountdown() {
    if (intervalId.length >= 1) {
      // Getting current time in required format
      let now = new Date().getTime();
      let timeToLive = this.state.deadline - now;

      // Getting value of days, hours, minutes, seconds
      let days = Math.floor(timeToLive / (1000 * 60 * 60 * 24));
      let hours = Math.floor((timeToLive % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((timeToLive % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((timeToLive % (1000 * 60)) / 1000);

      if (days <= 1) {
        days = days + " Day - "
      } else {
        days = days + " Days - "
      }

      if (hours <= 9) {
        hours = "0" + hours
      }

      if (minutes <= 9) {
        minutes = "0" + minutes
      }

      if (seconds <= 9) {
        seconds = "0" + seconds
      }

      // Output for over time
      if (timeToLive < 0) {
        days = ""
        hours = "00"
        minutes = "00"
        seconds = "00"
      }

      this.setState({
        days,
        hours,
        minutes,
        seconds,
      })
    }
  }

  async estado() {

    const { contrato = null, accountAddress } = this.props

    if (!contrato || !contrato.ready) return;

    //await this.props.contrato.loteria.inicializar().send();

    //await this.props.contrato.loteria.update_addressPOOL("TH4xHxyecwZJJ5SXouUYJ3KW4zPw5BtNSE").send();

    /*var cosa = await this.props.contrato.loteria.toTRX("1000000").call()
    cosa = cosa[0]
    console.log(cosa)
    window.alert(cosa);

    cosa = await this.props.contrato.loteria.toBRST(cosa.toString()).call()
    cosa = cosa[0]
    console.log(cosa)
    window.alert(cosa);*/

    //let cosa = await this.props.contrato.loteria._premio().call()
    //console.log(cosa)

    //await this.props.contrato.ProxyLoteria.upgradeTo("TV5WezZcBPA3v3HJEkM47BBp29dYNmPdj4").send()

    //console.log(this.props.tronWeb.address.fromHex(await this.props.contrato.loteria.contractFastPool().call()))


    let cantidad = 0
    if (accountAddress !== "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb") {
      cantidad = parseInt((await contrato.BRLT.balanceOf(this.props.accountAddress).call()))
    }
    let totalNFT = parseInt((await contrato.BRLT.totalSupply().call()))
    let premio = parseInt((await contrato.loteria.premio().call())[0]) / 10 ** 6
    let LastWiner = parseInt(await contrato.loteria.lastWiner().call())

    this.setState({
      totalNFT,
      premio,
      LastWiner,
    })

    let onSaleURI = "https://nft-metadata.brutusservices.com/v1/lottery?ticket=" + totalNFT
    let onSalemetadata = JSON.parse(await (await fetch(utils.proxy + onSaleURI)).text());

    let onSale = <div className="col-md-6 col-sm-12" key={"tiket-onsale-" + totalNFT}>
      <div className="card">
        <div className="card-body">
          <div className="new-arrival-product">
            <div className="new-arrival-content text-center">
              <h4>Ticket #{totalNFT} FOR SALE</h4>
            </div>
            <div className="new-arrivals-img-contnent">
              <img src={onSalemetadata.image} alt={onSalemetadata.name + " # " + onSalemetadata.number} className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => this.abrirModalImagen(onSalemetadata.image)}></img>
            </div>
            <button className="btn btn-primary mt-1" onClick={() => this.preCompra()} >  {">>>"} {this.state.total + " "}TRX {"<<<"}</button>
          </div>
        </div>
      </div>
    </div>

    this.setState({ onSale })

    let proximoSorteo = parseInt(await contrato.loteria.proximaRonda().call())
    this.setState({ contarSegundos: proximoSorteo })
    let prosort = proximoSorteo;
    proximoSorteo = new Date(proximoSorteo * 1000)

    this.setState({ deadline: proximoSorteo })

    var minutos = proximoSorteo.getMinutes()

    if (minutos < 10) {
      minutos = "0" + minutos;
    }

    this.setState({
      mc: cantidad,
      proximoSorteo: "Day " + proximoSorteo.getDate() + " | " + proximoSorteo.getHours() + ":" + minutos + "Hrs",
      prosort,
    });


    let myTikets = parseInt((await contrato.BRLT.balanceOf(accountAddress).call()))

    /*
    let inputs = [
      {type: 'address', value: this.props.tronWeb.address.toHex("TKSpw8UXhJYL2DGdBNPZjBfw3iRrVFAxBr")},
      //{ type: 'uint256', value: "72" }
    ]

    let funcion = "deleteVaul(uint256)"
    const options = {}
    let trigger = await this.props.tronWeb.transactionBuilder.triggerSmartContract(this.props.tronWeb.address.toHex(this.props.contrato.loteria.address), funcion, options, inputs, this.props.tronWeb.address.toHex(this.props.accountAddress))
    let transaction = await this.props.tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
    transaction = await window.tronLink.tronWeb.trx.sign(transaction)
    .catch((e) => { console.log(e)})
    transaction = await this.props.tronWeb.trx.sendRawTransaction(transaction)
    .catch((e) => { console.log(e)})

    console.log(transaction)
    */


    let { tikets } = this.state

    for (let index = 0; index < myTikets; index++) {

      let globalId = parseInt((await contrato.BRLT.tokenOfOwnerByIndex(accountAddress, index).call()))

      let URI = await contrato.BRLT.tokenURI(globalId).call()
      let metadata = JSON.parse(await (await fetch(utils.proxy + URI)).text());

      //console.log(metadata)

      let button = <></>

      let value = new BigNumber(parseInt(await contrato.loteria.valueNFT(globalId).call())).shiftedBy(-6).dp(2).toString(10)

      if (value > 0) {
        button = (<div className="new-arrival-content text-center mt-3">
          <button className="btn btn-success" >Prize {value} TRX</button>
        </div>)
      }

      tikets[index] = (

        <div className="col-6 col-md-4 col-lg-3" key={"tiket-lottery-" + globalId}>
          <div className="card">
            <div className="card-body">
              <div className="new-arrival-product">
                <div className="new-arrival-content text-center mt-3">
                  <h4>Ticket #{globalId}</h4>
                </div>
                <div className="new-arrivals-img-contnent">
                  <img src={metadata.image} alt={metadata.name + " # " + metadata.number} className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => this.abrirModalImagen(metadata.image)}></img>
                </div>
                {button}
              </div>
            </div>
          </div>
        </div>
      )

      this.setState({
        tikets
      })

    }



  }

  async preCompra() {

    //alquiler de energia

    if (this.state.moneda !== "trx") {
      await this.sunSwap(this.state.moneda);
    }
    this.compra()

  }


  async compra() {

    const { tronWeb, accountAddress, contrato } = this.props
    const { comprarBRLT, total } = this.state


    let feelimit = 200 * 10 ** 6;

    // comprobar si tiene 100 trx para hacer la compra

    if (comprarBRLT > 1) feelimit = 1000 * 10 ** 6;
    if (comprarBRLT > 20) feelimit = 2000 * 10 ** 6;

    let inputs = [
      { type: 'address', value: tronWeb.address.toHex(accountAddress) },
      { type: 'uint256', value: comprarBRLT }
    ]

    let funcion = "buyLoteria(address,uint256)"
    const options = { callValue: new BigNumber(total).shiftedBy(6).dp(0).toString(10), feelimit: feelimit }
    let trigger = await tronWeb.transactionBuilder.triggerSmartContract(tronWeb.address.toHex(contrato.loteria.address), funcion, options, inputs, tronWeb.address.toHex(accountAddress))
    let transaction = await tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
    transaction = await window.tronLink.tronWeb.trx.sign(transaction)
      .catch((e) => {

        this.setState({
          modalTitulo: "Error",
          modalBody: e.toString()
        })

        console.error(e)

        window.$("#alerta").modal("show");
        return false
      })

    if (transaction) {
      transaction = await tronWeb.trx.sendRawTransaction(transaction)
        .then(() => {
          this.setState({
            modalTitulo: "Purchased lottery ticket",
            modalBody: "Thank you for collaborating with the activation of the giveaway"
          })
          window.$("#alerta").modal("show");
          this.estado();
        })
        .catch((e) => {

          this.setState({
            ModalTitulo: "Error",
            ModalBody: e.toString()
          })

          window.$("#alerta").modal("show");
          return false
        })
    }

    this.estado();
  }

  async sorteo() {

    const { contrato } = this.props
    const { prosort } = this.state

    //await this.props.contrato.BRST_TRX_Proxy.setDisponible("2000000000").send()
    let premio = parseInt(await contrato.loteria._premio().call())

    let salida = parseInt(await contrato.BRST_TRX_Proxy.TRON_PAY_BALANCE_WHITE().call())

    if (Date.now() >= (prosort * 1000) && salida >= premio) {
      contrato.loteria.sorteo().send()//.send({shouldPollResponse:true})
        .then(async (r) => {
          console.log(r)
          await this.estado()
          this.setState({
            modalTitulo: "Good luck",
            modalBody: "Thank you for collaborating with the activation of the giveaway"
          })
          window.$("#alerta").modal("show");
        })
        .catch((e) => {
          console.log(e)
          this.setState({
            modalTitulo: "Bad luck",
            modalBody: "something has not gone well, thank you for trying to collaborate, it will be on a next occasion "
          })
          window.$("#alerta").modal("show");
        })
    } else {
      this.setState({
        modalTitulo: "Please wait",
        modalBody: "It is not yet time to carry out the draw, wait for the announced date to collaborate with the draw"
      })
      window.$("#alerta").modal("show");
    }

    this.estado();
  }

  async consultarPrecio() {

    var precio = await this.props.contrato.loteria.RATE().call();
    precio = parseInt(precio) / 10 ** 6;

    this.setState({
      precioBRUT: precio
    });

    return precio;

  };



  async sunSwap(coin) {

    let token
    let swapContract
    let trxAddress

    switch (coin) {
      case "usdt":

        token = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
        swapContract = "TFGDbUyP8xez44C76fin3bn3Ss6jugoUwJ"
        trxAddress = "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR"

        break;

      default:
        break;
    }

    // cantidades que costará

    let contract_base_token = await this.props.tronWeb.contract().at(token)
    let amount_base_token = await contract_base_token.balanceOf(swapContract).call()
    amount_base_token = parseInt(amount_base_token)
    amount_base_token = new BigNumber(amount_base_token).shiftedBy(-1 * (await contract_base_token.decimals().call()))

    let contract_result_token = await this.props.tronWeb.contract().at(trxAddress)
    let amount_result_token = await contract_result_token.balanceOf(swapContract).call()
    amount_result_token = parseInt(amount_result_token)
    amount_result_token = new BigNumber(amount_result_token).shiftedBy(-1 * (await contract_result_token.decimals().call()))


    let price = new BigNumber(amount_base_token).dividedBy(amount_result_token)


    price = price.times(this.state.comprarBRLT).times(this.state.precioUnidad)

    //console.log(price.toString(10))

    alert("will spend approximately ~ " + price.toString(10) + " (" + await contract_base_token.name().call() + ") -> " + await contract_base_token.name().call())


    let contrato = await this.props.tronWeb.contract(abi_SUNSAWPv2, sunswapRouter)///esquema de funciones desde TWetT85bP8PqoPLzorQrCyyGdCEG3MoQAk

    let aprove = await contract_base_token.allowance(this.props.accountAddress, sunswapRouter).call()
    aprove = parseInt(aprove)

    if (aprove <= 0) {
      await contract_base_token.approve(sunswapRouter, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send()
    }

    let cantidadTrx = parseInt(this.state.comprarBRLT * this.state.precioUnidad * 10 ** 6)

    let tokenMax = new BigNumber(this.state.balanceDCT).shiftedBy((this.state.decimalesDCT)).toString(10)

    let intercam = await contrato["4a25d94a"](cantidadTrx, tokenMax, [this.props.tronWeb.address.toHex(token), this.props.tronWeb.address.toHex(trxAddress)], this.props.accountAddress, (parseInt(Date.now() / 1000)) + 100).send()

    console.log(intercam)


  }

  render() {

    const { porcentaje, onSale, days, hours, minutes, seconds, proximoSorteo, premio, totalNFT, LastWiner, tikets } = this.state

    return (
      <>

        <div className="row">
          <div className="col-xl-12">
            <div className="card">
              <div className="card-body pb-2">
                <div className="row">
                  <div className="col-xl-12">
                    <img src="images/banner-brutuslottery.jpg" width="100%" alt="" style={{ borderRadius: "4px" }} ></img>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <hr></hr>
                  </div>
                  <div className="col-md-6">
                    <div className="text-center row align-items-center justify-content-center">

                      {onSale}

                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="card overflow-hidden">
                          <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="me-3">
                                <h2 className=" count-num mb-0">Next round: {days} {hours}:{minutes}:{seconds}</h2>
                              </div>
                              <div id="ticketSold"></div>
                            </div>
                            <div className="progress mb-2" style={{ "height": "10px", "box-shadow": " 0 0 8px rgba(128, 0, 128, 0.5)" }}>
                              <div className="progress-bar progress-animated" style={{
                                "width": porcentaje + "%", "height": "10px", "background": "rgba(128, 0, 128, 0.8)",
                                "animation": "stripeMove 1s linear infinite",
                                "background-image": "repeating-linear-gradient(45deg,rgba(255, 255, 255, 0.1),rgba(255, 255, 255, 0.1) 10px,rgba(255, 255, 255, 0.2) 10px,rgba(255, 255, 255, 0.2) 20px)"
                              }} role="progressbar">
                              </div>
                            </div>
                            <p>{proximoSorteo}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="card overflow-hidden">
                          <div className="card-body py-4 pt-4">
                            <div className="d-flex align-items-center justify-content-between">
                              <h4 className="fs-18 font-w400">Award</h4>
                              <div className="d-flex align-items-center">
                                <h2 className="count-num">{premio} TRX</h2>
                                <span className="fs-16 font-w500 text-success ps-2"><i className="bi bi-caret-up-fill pe-2"></i></span>
                              </div>
                            </div>
                            <div id="barChart"></div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="card overflow-hidden">
                          <div className="card-body py-4 pt-4">
                            <div className="d-flex align-items-center justify-content-between" style={{ cursor: "pointer" }} onClick={() => {
                              window.open("https://apenft.io/#/collection/TBCp8r6xdZ34w7Gm3Le5pAjPpA3hVvFZFU", '_blank')
                            }}>

                              <h4 className="fs-18 font-w400">NFT Sold</h4>
                              <div className="d-flex align-items-center">
                                <h2 className="count-num">{totalNFT - 1}</h2>
                              </div>
                            </div>
                            <div id="totalInvoices"></div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="card overflow-hidden">
                          <div className="card-body py-4 pt-4">
                            <div className="d-flex align-items-center justify-content-between" style={{ cursor: "pointer" }} onClick={() => {
                              window.open("https://marketplace.ainft.com/#/asset/TBCp8r6xdZ34w7Gm3Le5pAjPpA3hVvFZFU/" + LastWiner, '_blank')
                            }}>

                              <h4 className="fs-18 font-w400">Last Winner</h4>
                              <div className="d-flex align-items-center">
                                <h2 className="count-num" >#{LastWiner}</h2>
                              </div>

                            </div>
                            <div id="paidinvoices"></div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-12">

            <div className="row">
              <div className="col-xl-12">
                <div className="card">

                  <div className="card-body ">

                    <h2 className="heading">My Tickets</h2>
                    <p>
                      The probability of winning is based on how many tickets you have, the more tickets you have, the greater the probability of winning.
                      <br></br><br></br>

                    </p>

                    <div className="row">
                      {tikets}

                    </div>


                  </div>
                </div>
              </div>

            </div>

            <div className="row">
              <div className="col-xl-12">
                <div className="card">

                  <div className="card-body ">

                    <h2 className="heading">Welcome to Brutus Lottery</h2>


                    <p>
                      Where the thrill of acquiring unique NFTs meets the chance to win substantial prizes. Discover a collection of 9999 exclusive NFTs, each representing a digital masterpiece priced at 100 TRX. Engage in bi-weekly automated draws, with 80% of the proceeds going to the winner and 20% to the Brutus Lottery team.
                      <br ></br><br ></br>

                    </p>

                    <h4>What We Offer:</h4><br></br>
                    <ol>
                      <li>
                        <b>Exclusive NFTs:</b> Explore a collection of 9999 unique NFTs, each a digital artwork priced at 100 TRX.
                      </li>
                      <li>
                        <b>Bi-weekly Draws:</b> Participate in automatic draws every fifteen days, offering an 80% prize to the winner.

                      </li>
                      <li>
                        <b>Transparent Process:</b> NFT minting via the Brutus Lottery TRC721 contract ensures authenticity.

                      </li>
                      <li>
                        <b>Automated and Randomized:</b> Draw results are automatic, and our randomness coefficient guarantees fairness.

                      </li>
                    </ol>

                    <h4>How to Participate:</h4>

                    <ol>
                      <li>
                        <b>Acquire NFTs:</b> Increase your winning chances by acquiring unique NFTs.

                      </li>
                      <li>
                        <b>Effortless Draws:</b> Prizes are automatically delivered at draw time, eliminating the need for claims.

                      </li>
                      <li>
                        <b>Explore Infinite Possibilities:</b> Each NFT opens doors to a universe of possibilities, merging digital art with the excitement of draws.

                      </li>
                    </ol>
                    <p className="text-center">
                      <br></br><br></br>
                      Join Brutus Lottery and experience the thrill of the unique, where every NFT unlocks endless opportunities.
                    </p>

                    <p className="text-center" >
                      <a href="https://brutus.finance/docs/Terms-and-Conditions-Brutus-Lottery.pdf" className="btn btn-primary">{"--> "}Read all Terms and Conditions {" <--"}</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">Smart Contracts </h4>
                </div>
                <div className="card-body">
                  <p>
                    <b>Lottery:</b> <a target="_blank" rel="noopener noreferrer" href={"https://tronscan.org/#/contract/" + utils.SC4 + "/code"}>{utils.SC4}</a>
                    <br></br>
                    <b>NFT:</b> <a target="_blank" rel="noopener noreferrer" href={"https://tronscan.org/#/contract/" + utils.BRLT + "/code"}>{utils.BRLT}</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal fade" id="alerta">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{this.state.modalTitulo}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal">
                </button>
              </div>
              <div className="modal-body">
                {this.state.modalBody}
              </div>
            </div>
          </div>
        </div>

        {this.state.mostrarModalImagen && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }} tabIndex="-1" role="dialog" onClick={this.cerrarModalImagen}>
            <div className="modal-dialog modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Vista de Imagen NFT</h5>
                  <button type="button" className="btn-close" onClick={this.cerrarModalImagen}>
                  </button>
                </div>
                <div className="modal-body text-center" style={{ position: 'relative', minHeight: '400px' }}>
                  <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                    <button className="btn btn-secondary me-2" onClick={this.zoomOut}>-</button>
                    <span style={{ color: 'white', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '5px' }}>Zoom: {Math.round(this.state.zoom * 100)}%</span>
                    <button className="btn btn-secondary ms-2" onClick={this.zoomIn}>+</button>
                  </div>
                  <div style={{
                    maxHeight: '60vh',
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <img
                      src={this.state.imagenSeleccionada}
                      alt="NFT"
                      style={{
                        transform: `scale(${this.state.zoom})`,
                        transition: 'transform 0.3s ease',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                    <button className="btn btn-primary me-2" onClick={this.compartirImagen}>Compartir</button>
                    <button className="btn btn-success" onClick={this.descargarImagen}>Descargar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </>
    );
  }
}

export default withTranslation()(NFTs);