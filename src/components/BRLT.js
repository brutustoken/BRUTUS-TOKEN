import React, { Component } from "react";
import abi_SUNSAWPv2 from "../abi/sunswapV2.json";

import cons from "../cons.js";

const BigNumber = require('bignumber.js');

let sunswapRouter = "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax" // suwap V2


export default class nfts extends Component {

  constructor(props) {
    super(props);

    this.state = {
      deposito: "Loading...",
      wallet: this.props.accountAddress,
      balanceBRUT: 0,
      precioBRUT: 0,
      mc: 0,
      mb: 0,
      totalNFT: "Loading...",
      premio: "Loading...",
      LastWiner: "Loading...",
      proximoSorteo: "Loading...",
      modalTitulo: "",
      modalBody: "",
      contarSegundos: 10e25,
      restanteSegundos: 10e25,
      porcentaje: 100,

      comprarBRLT: 1,
      precioUnidad: 100,
      total: 100,
      moneda: "trx",

      tikets: [],

    };

    this.estado = this.estado.bind(this);
    this.consultarPrecio = this.consultarPrecio.bind(this);

    this.preCompra = this.preCompra.bind(this);
    this.compra = this.compra.bind(this);


    this.sunSwap = this.sunSwap.bind(this);
    this.sorteo = this.sorteo.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeSelect = this.handleChangeSelect.bind(this);


  }

  async componentDidMount() {

    setTimeout(async () => {
      this.estado();
    }, 3 * 1000);

    setInterval(() => {

      let restanteSegundos = parseInt(this.state.contarSegundos - (Date.now() / 1000))

      this.setState({
        restanteSegundos: restanteSegundos,
        porcentaje: 100 - (restanteSegundos / 1296000 * 100)
      })

    }, 1 * 1000)

    setInterval(async () => {
      this.estado();
    }, 60 * 1000);

    window.addEventListener('message', (e) => {

      if (e.data.message && e.data.message.action === "accountsChanged") {
        if (e.data.message.data.address) {
          this.estado();
        }
      }
    })
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

  async estado() {

    //await this.props.contrato.loteria.inicializar().send();

    //await this.props.contrato.loteria.update_addressPOOL("TH4xHxyecwZJJ5SXouUYJ3KW4zPw5BtNSE").send();

    /*var cosa = await this.props.contrato.loteria.toTRX("1000000").call()
    cosa = cosa[0].toNumber()
    console.log(cosa)
    window.alert(cosa);

    cosa = await this.props.contrato.loteria.toBRST(cosa.toString()).call()
    cosa = cosa[0].toNumber()
    console.log(cosa)
    window.alert(cosa);*/

    //let cosa = await this.props.contrato.loteria._premio().call()
    //console.log(cosa)

    //await this.props.contrato.ProxyLoteria.upgradeTo("TV5WezZcBPA3v3HJEkM47BBp29dYNmPdj4").send()


    var cantidad = 0
    if (this.props.accountAddress !== "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb") {
      cantidad = parseInt((await this.props.contrato.BRLT.balanceOf(this.props.accountAddress).call())._hex)
    }
    var totalNFT = parseInt((await this.props.contrato.BRLT.totalSupply().call())._hex)
    var premio = parseInt((await this.props.contrato.loteria.premio().call())[0]) / 10 ** 6
    var LastWiner = parseInt(await this.props.contrato.loteria.lastWiner().call())

    var proximoSorteo = parseInt(await this.props.contrato.loteria.proximaRonda().call())
    this.setState({ contarSegundos: proximoSorteo })
    var prosort = proximoSorteo;
    proximoSorteo = new Date(proximoSorteo * 1000)

    var minutos = proximoSorteo.getMinutes()

    if (minutos < 10) {
      minutos = "0" + minutos;
    }


    let contract_token = await this.props.tronWeb.contract().at("TRwptGFfX3fuffAMbWDDLJZAZFmP6bGfqL")
    let balanceDCT = await contract_token.balanceOf(this.props.accountAddress).call()
    let decimalesDCT = await contract_token.decimals().call()
    balanceDCT = new BigNumber(balanceDCT._hex).shiftedBy(-decimalesDCT).toNumber()


    contract_token = await this.props.tronWeb.contract().at("TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t")
    let decimales = await contract_token.decimals().call()
    let balanceUSDT = await contract_token.balanceOf(this.props.accountAddress).call()
    balanceUSDT = new BigNumber(balanceUSDT._hex).shiftedBy(-decimales).dp(6).toNumber()


    this.setState({
      balanceDCT: balanceDCT,
      decimalesDCT: decimalesDCT,
      balanceUSDT: balanceUSDT,
      mc: cantidad,
      totalNFT: totalNFT,
      premio: premio,
      LastWiner: LastWiner,
      proximoSorteo: "Day " + proximoSorteo.getDate() + " | " + proximoSorteo.getHours() + ":" + minutos + "Hrs",
      prosort: prosort,
    });


    let myTikets = parseInt((await this.props.contrato.BRLT.balanceOf(this.props.accountAddress).call())._hex)

    /*
    let inputs = [
      {type: 'address', value: this.props.tronWeb.address.toHex("TKSpw8UXhJYL2DGdBNPZjBfw3iRrVFAxBr")},
      //{ type: 'uint256', value: amount }
    ]

    let funcion = "update_addressFAST(address)"
    const options = {}
    let trigger = await this.props.tronWeb.transactionBuilder.triggerSmartContract(this.props.tronWeb.address.toHex(this.props.contrato.loteria.address), funcion, options, inputs, this.props.tronWeb.address.toHex(this.props.accountAddress))
    let transaction = await this.props.tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
    transaction = await window.tronLink.tronWeb.trx.sign(transaction)
    .catch((e) => { console.log(e)})
    transaction = await this.props.tronWeb.trx.sendRawTransaction(transaction)
    .catch((e) => { console.log(e)})

    console.log(transaction)

    */

    let tikets = []

    for (let index = 0; index < myTikets; index++) {

      let globalId = parseInt((await this.props.contrato.BRLT.tokenOfOwnerByIndex(this.props.accountAddress, index).call())._hex)

      let URI = await this.props.contrato.BRLT.tokenURI(globalId).call()
      let metadata = JSON.parse( await (await fetch(cons.proxy+URI)).text());

      //console.log(metadata)

      tikets[index]=(

        <div className="col" key={"tiket-lottery-"+globalId}>
        <div className="card">
          <div className="card-body">
            <div className="new-arrival-product">
              <div className="new-arrivals-img-contnent">
                <img src={metadata.image} alt={metadata.name +" # "+metadata.number} width="100%" className="img-thumbnail"></img>
              </div>
              <div className="new-arrival-content text-center mt-3">
                <h4>Tiket #{globalId}
                  
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
        )
      
    }

    this.setState({
      tikets: tikets
    })

  }

  async preCompra() {

    if (this.state.moneda !== "trx") {
      await this.sunSwap(this.state.moneda);
    }


    this.compra()

  }


  async compra() {


    var feelimit = 200 * 10 ** 6;

    if (this.state.comprarBRLT > 1) feelimit = 1000 * 10 ** 6;
    if (this.state.comprarBRLT > 20) feelimit = 2000 * 10 ** 6;

    let inputs = [
      { type: 'address', value: this.props.tronWeb.address.toHex(this.props.accountAddress) },
      { type: 'uint256', value: this.state.comprarBRLT }
    ]

    let funcion = "buyLoteria(address,uint256)"
    const options = { callValue: new BigNumber(this.state.total).shiftedBy(6).dp(0).toString(10), feelimit: feelimit }
    let trigger = await this.props.tronWeb.transactionBuilder.triggerSmartContract(this.props.tronWeb.address.toHex(this.props.contrato.loteria.address), funcion, options, inputs, this.props.tronWeb.address.toHex(this.props.accountAddress))
    let transaction = await this.props.tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
    transaction = await window.tronLink.tronWeb.trx.sign(transaction)
      .catch((e) => {

        this.setState({
          ModalTitulo: "Error",
          ModalBody: e.toString()
        })

        window.$("#alerta").modal("show");
      })
    transaction = await this.props.tronWeb.trx.sendRawTransaction(transaction)
      .then(() => {
        this.setState({
          modalTitulo: "Purchased lottery ticket",
          modalBody: "Thank you for collaborating with the activation of the giveaway"
        })
        window.$("#alerta").modal("show");
        this.estado();
      })

    console.log(transaction.txid)

    //await this.props.contrato.BRST_TRX_Proxy.esperaRetiro(amount).send();

    /*
        this.props.contrato.loteria.buyLoteria(this.props.accountAddress, this.state.comprarBRLT).send({ callValue: new BigNumber(this.state.total).shiftedBy(6).dp(0).toString(10), feeLimit: feelimit })
          .then(() => {
            this.setState({
              modalTitulo: "Purchased lottery ticket",
              modalBody: "Thank you for collaborating with the activation of the giveaway"
            })
            window.$("#alerta").modal("show");
            this.estado();
    
          })
          .catch(() => {
            this.setState({
              modalTitulo: "Failed transaction",
              modalBody: "Please try again later remember to check that you have enough resources"
            })
            window.$("#alerta").modal("show");
          })
    */

    this.estado();
  }

  async sorteo() {

    //await this.props.contrato.BRST_TRX_Proxy.setDisponible("2000000000").send()
    let premio = await this.props.contrato.loteria._premio().call()
    console.log(premio)

    var salida = await this.props.contrato.BRST_TRX_Proxy.TRON_PAY_BALANCE_WHITE().call()
    console.log(salida)

    if (Date.now() >= (this.state.prosort * 1000) && salida >= premio) {
      this.props.contrato.loteria.sorteo().send()//.send({shouldPollResponse:true})
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
    precio = parseInt(precio._hex) / 10 ** 6;

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

      case "dct":

        token = "TRwptGFfX3fuffAMbWDDLJZAZFmP6bGfqL"
        swapContract = "TKscYLLy6Mn9Bz6MbemmZsM6dbpUVYvXNo"
        trxAddress = "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR"

        break;

      default:
        break;
    }

    // cantidades que costará

    let contract_base_token = await this.props.tronWeb.contract().at(token)
    let amount_base_token = await contract_base_token.balanceOf(swapContract).call()
    amount_base_token = parseInt(amount_base_token._hex)
    amount_base_token = new BigNumber(amount_base_token).shiftedBy(-1 * (await contract_base_token.decimals().call()))

    let contract_result_token = await this.props.tronWeb.contract().at(trxAddress)
    let amount_result_token = await contract_result_token.balanceOf(swapContract).call()
    amount_result_token = parseInt(amount_result_token._hex)
    amount_result_token = new BigNumber(amount_result_token).shiftedBy(-1 * (await contract_result_token.decimals().call()))


    let price = new BigNumber(amount_base_token).dividedBy(amount_result_token)


    price = price.times(this.state.comprarBRLT).times(this.state.precioUnidad)

    console.log(price.toString(10))


    alert("will spend approximately ~ " + price.toString(10) + " (" + await contract_base_token.name().call() + ") -> " + await contract_base_token.name().call())


    let contrato = await this.props.tronWeb.contract(abi_SUNSAWPv2, sunswapRouter)///esquema de funciones desde TWetT85bP8PqoPLzorQrCyyGdCEG3MoQAk

    let aprove = await contract_base_token.allowance(this.props.accountAddress, sunswapRouter).call()


    if (aprove._hex) aprove = parseInt(aprove._hex)

    if (aprove <= 0) {
      await contract_base_token.approve(sunswapRouter, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send()
    }

    var cantidadTrx = parseInt(this.state.comprarBRLT * this.state.precioUnidad * 10 ** 6)

    var tokenMax = new BigNumber(this.state.balanceDCT).shiftedBy((this.state.decimalesDCT)).toString(10)

    let intercam = await contrato["4a25d94a"](cantidadTrx, tokenMax, [this.props.tronWeb.address.toHex(token), this.props.tronWeb.address.toHex(trxAddress)], this.props.accountAddress, (parseInt(Date.now() / 1000)) + 100).send()

    console.log(intercam)


  }

  render() {

    return (
      <>

        <div className="row">
          <div className="col-xl-12">
            <div className="card">
              <div className="card-body pb-2">
                <div className="row">
                  <div className="col-xl-12">
                    <img src="images/banner-brutuslottery.jpg" width="100%" alt="" style={{ borderRadius: "4px" }} />
                  </div>
                </div>
                <div className="row">
                  <div className="col-xl-12">
                    <hr></hr>
                    <div className="text-center mt-3 row align-items-center justify-content-center">
                      <div className="col-xl-1 my-3">
                        <input type="number" className="form-control " name="value" placeholder="1" onChange={this.handleChange} defaultValue={1} min={1} step={1} />

                      </div>
                      <div className=" col-xl-1 my-3">
                        <div className="equalto text-rigth">
                          =
                        </div>
                      </div>
                      <div className="col-sm-2 my-3">
                        <b>{this.state.total + " "}TRX</b>
                      </div>
                      <div className="col-xl-3 my-3">
                        <button className="btn btn-primary " onClick={() => this.preCompra()} >Purchase {this.state.comprarBRLT} BRLT wiht {"->"}</button>

                      </div>
                      <div className="col-xl-2 my-3">
                        <select style={{ cursor: "pointer" }} className="default-select exchange-select form-control" name="state" onChange={this.handleChangeSelect} defaultValue={this.state.moneda}>
                          <option value="trx">TRX</option>
                          <option value="usdt">USDT</option>
                          <option value="dct">DCT</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-12">
            <div className="row">
              <div className="col-md-12">
                <div className="card overflow-hidden">
                  <div className="card-body py-0">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="me-3">
                        <h2 className=" count-num mb-0">Next round in {this.state.restanteSegundos} seconds</h2>
                      </div>
                      <div id="ticketSold"></div>
                    </div>
                    <div className="progress mb-2" style={{ "height": "10px" }}>
                      <div className="progress-bar bg-warning progress-animated" style={{ "width": this.state.porcentaje + "%", "height": "10px" }} role="progressbar">
                      </div>
                    </div>
                    <p>{this.state.proximoSorteo}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card overflow-hidden">
                  <div className="card-body py-4 pt-4">
                    <div className="d-flex align-items-center justify-content-between" style={{ cursor: "pointer" }} onClick={() => {
                      window.open("https://apenft.io/#/collection/TBCp8r6xdZ34w7Gm3Le5pAjPpA3hVvFZFU", '_blank')
                    }}>

                      <h4 className="fs-18 font-w400">NFT Sold</h4>
                      <div className="d-flex align-items-center">
                        <h2 className="count-num">{this.state.totalNFT}</h2>
                      </div>
                    </div>
                    <div id="totalInvoices"></div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card overflow-hidden">
                  <div className="card-body py-4 pt-4">
                    <div className="d-flex align-items-center justify-content-between" style={{ cursor: "pointer" }} onClick={() => {
                      window.open("https://apenft.io/#/asset/TBCp8r6xdZ34w7Gm3Le5pAjPpA3hVvFZFU/" + this.state.LastWiner, '_blank')
                    }}>

                      <h4 className="fs-18 font-w400">Last Winner</h4>
                      <div className="d-flex align-items-center">
                        <h2 className="count-num" >#{this.state.LastWiner}</h2>
                      </div>

                    </div>
                    <div id="paidinvoices"></div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card overflow-hidden">
                  <div className="card-body py-4 pt-4">
                    <div className="d-flex align-items-center justify-content-between">
                      <h4 className="fs-18 font-w400">Award</h4>
                      <div className="d-flex align-items-center">
                        <h2 className="count-num">{this.state.premio} TRX</h2>
                        <span className="fs-16 font-w500 text-success ps-2"><i className="bi bi-caret-up-fill pe-2"></i></span>
                      </div>
                    </div>
                    <div id="barChart"></div>
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

                    <h2 className="heading">Your Tikets</h2>
                    <p>
                    the probability of winning is based on how many tickets you have, the more tickets you have, the greater the probability of winning.
                      <br /><br />

                    </p>

                  </div>
                </div>
              </div>
              <div className="col-xl-12">
                <div className="col-xl-3 col-lg-6 col-sm-6" key={"robbrutN"}>
                 {this.state.tikets}
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
                      <br /><br />

                    </p>

                    <h4>What We Offer:</h4><br />
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
                    <p>
                      <br /><br />
                      Join Brutus Lottery and experience the thrill of the unique, where every NFT unlocks endless opportunities.
                    </p>

                    <p className="text-center" >
                      <a href="https://brutus.finance/docs/Terms-and-Conditions-Brutus-Lottery.pdf">{"--> "}Read all Terms and Conditions {" <--"}</a>
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
                  <b>Lottery:</b> <a target="_blank" rel="noopener noreferrer" href={"https://tronscan.org/#/contract/"+this.props.contrato.loteria.address+"/code"}>{this.props.contrato.loteria.address}</a>
                  <br />
                  <b>NFT:</b> <a target="_blank" rel="noopener noreferrer" href={"https://tronscan.org/#/contract/"+this.props.tronWeb.address.fromHex(this.props.contrato.BRLT.address)+"/code"}>{this.props.tronWeb.address.fromHex(this.props.contrato.BRLT.address)}</a>
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

      </>
    );
  }
}
