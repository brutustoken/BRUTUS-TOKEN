import React, { Component } from "react";
import abi_SUNSAWPv2 from "../abi/sunswapV2.json";

const BigNumber = require('bignumber.js');

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
      totalNFT: 1,
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
      moneda: "trx"

    };

    this.estado = this.estado.bind(this);
    this.consultarPrecio = this.consultarPrecio.bind(this);
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
    if(isNaN(value) ||value < 1)value=1;
    this.setState({ 
      comprarBRLT: value ,
      total: value * this.state.precioUnidad
    });
  }

  handleChangeSelect(e){
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
    var price = 0
    if(this.props.accountAddress !== "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"){
      cantidad = parseInt((await this.props.contrato.BRLT.balanceOf(this.props.accountAddress).call())._hex)
      price = (await this.props.contrato.loteria.allValueNFTs(this.props.accountAddress).call())[0]
      price = new BigNumber(price._hex).shiftedBy(-6).toNumber()
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

    this.setState({
      mc: cantidad,
      totalNFT: totalNFT,
      premio: premio,
      LastWiner: LastWiner,
      proximoSorteo: "Day " + proximoSorteo.getDate() + " | " + proximoSorteo.getHours() + ":" + minutos + "Hrs",
      prosort: prosort,
      price: price,
    });

  }


  async compra() {

    this.props.contrato.loteria.buyLoteria(this.props.accountAddress, this.state.comprarBRLT).send({ callValue: new BigNumber(this.state.total).shiftedBy(6).dp(0).toString(10) })
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



  async sunSwap() {
    let token = "TRwptGFfX3fuffAMbWDDLJZAZFmP6bGfqL"
    let swapContract = "TKscYLLy6Mn9Bz6MbemmZsM6dbpUVYvXNo"
    let contrato = await this.props.tronWeb.contract(abi_SUNSAWPv2, swapContract)///esquema de funciones desde TWetT85bP8PqoPLzorQrCyyGdCEG3MoQAk

    let contract_token = await this.props.tronWeb.contract().at(token)
    let aprove = await contract_token.allowance(this.props.accountAddress, "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax").call()


    if (aprove._hex) aprove = parseInt(aprove._hex)

    if (aprove <= 0) {
      await contract_token.approve("TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax", "115792089237316195423570985008687907853269984665640564039457584007913129639935").send()
    }

    var cantidadTrx = 101000000

    cantidadTrx = parseInt(cantidadTrx)

    var splitage = 0.0005

    splitage = cantidadTrx - (cantidadTrx * splitage)

    splitage = parseInt(splitage)

    let intercam = await contrato["4a25d94a"](cantidadTrx, splitage, ["0xaf3f2254a9c6a3c143c10cbe15eb9eb75c553f45", "0x891cdb91d149f23B1a45D9c5Ca78a88d0cB44C18"], this.props.accountAddress, (parseInt(Date.now() / 1000)) + 300).send()

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
                  <div className="col-xl-3">
                    <img src="images/brutuslotteysinfondo.png" width="200px" alt=""/>
                  </div>
                  <div className="col-xl-6">
                    <h1 className="text-center no-border font-w600 fs-60">Brutus Lottery <br /><span className="text-warning">One</span> NFT <span className="text-primary">Unlimited </span> Possibilities<br /> </h1>
                    <h4 className="text-center ">Your ticket to endless draws, a new chance to win every fortnight!</h4>
                
                  </div>

                  <div className="col-xl-3">
                    <img src="images/brutuslotteysinfondo.png" width="200px" alt=""/>
                  </div>
                </div>
                <div className="row">
                  <div className="col-xl-12">
                    <hr></hr>
                    <div className="text-center mt-3 row justify-content-center">
                      <div className="col-xl-1 ">
                        <div className="row">
                          <div className="col-xl-12">
                            <input type="number" className="form-control mb-3" name="value" placeholder="1" onChange={this.handleChange} defaultValue={1} min={1} step={1} />
                          </div>

                        </div>
                      </div>
                      <div className=" col-xl-1 ">
                        <div className="equalto text-rigth">
                          =
                        </div>
                      </div>
                      <div className="col-xl-3">
                        <div className="row">
                        <div className="col-xl-6">
                            <input type="number" className="form-control mb-3" name="value" placeholder="100 TRX" value={this.state.total} readOnly />
                          </div>
                        <div className="col-xl-6">
                            <select style={{cursor: "pointer"}} className="default-select exchange-select form-control" name="state" onChange={this.handleChangeSelect} defaultValue={this.state.moneda}>
                              <option value="trx">TRX</option>
                              <option value="usdt">USDT</option>
                              <option value="dct">DCT</option>
                            </select>
                          </div>
                          
                        </div>
                      </div>
                      <div className="col-xl-3 ">
                        <div className="">
                          <button className="btn btn-primary mx-auto" onClick={() => this.compra()} >Purchase {this.state.comprarBRLT} BRLT</button>
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
                    <div className="d-flex align-items-center justify-content-between">
                      <h4 className="fs-18 font-w400">NFT Sold</h4>
                      <div className="d-flex align-items-center">
                        <h2 className="count-num">{this.state.totalNFT}</h2>
                        <span className="fs-16 font-w500 text-success ps-2"><i className="bi bi-caret-up-fill pe-2"></i></span>
                      </div>
                    </div>
                    <div id="totalInvoices"></div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card overflow-hidden">
                  <div className="card-body py-4 pt-4">
                    <div className="d-flex align-items-center justify-content-between">
                      <h4 className="fs-18 font-w400">Last Winner</h4>
                      <div className="d-flex align-items-center">
                        <h2 className="count-num">#{this.state.LastWiner}</h2>
                        <span className="fs-16 font-w500 text-danger ps-2"><i className="bi bi-caret-down-fill pe-2"></i></span>
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

                  <h2 className="heading">Welcome to Brutus Lottery</h2>


                  <p>
                    Where the thrill of acquiring unique NFTs meets the chance to win substantial prizes. Discover a collection of 9999 exclusive NFTs, each representing a digital masterpiece priced at 100 TRX. Engage in bi-weekly automated draws, with 80% of the proceeds going to the winner and 20% to the Brutus Lottery team.
                    <br /><br />
                    <b>What We Offer:</b><br />

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

                    <b>How to Participate:</b>

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
                    <br /><br />
                    Join Brutus Lottery and experience the thrill of the unique, where every NFT unlocks endless opportunities.
                  </p>

                  <p className="text-center">
                    <a href="https://brutus.finance/docs/Terms-and-Conditions-Brutus-Lottery.pdf">{"--> "}Read all Terms and Conditions {" <--"}</a>
                  </p>
                </div>
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
