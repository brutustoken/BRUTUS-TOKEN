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
      modalBody: ""

    };

    this.estado = this.estado.bind(this);
    this.consultarPrecio = this.consultarPrecio.bind(this);
    this.compra = this.compra.bind(this);

    
    this.sunSwap = this.sunSwap.bind(this);
    this.sorteo = this.sorteo.bind(this);

  }

  async componentDidMount() {

    setTimeout(async () => {
      this.estado();
    }, 3 * 1000);

    setInterval(async () => {
      this.estado();
    }, 60 * 1000);

    window.addEventListener('message', (e) => {

      if (e.data.message && e.data.message.action === "accountsChanged") {
        if(e.data.message.data.address){
          this.estado();
        }
      }
    })
  };

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



    var cantidad = parseInt((await this.props.contrato.BRLT.balanceOf(this.props.accountAddress).call())._hex)
    var totalNFT = parseInt((await this.props.contrato.BRLT.totalSupply().call())._hex)
    var premio = parseInt((await this.props.contrato.loteria.premio().call())[0]) / 10 ** 6
    var LastWiner = parseInt(await this.props.contrato.loteria.lastWiner().call())

    var proximoSorteo = parseInt(await this.props.contrato.loteria.proximaRonda().call())
    var prosort = proximoSorteo;
    proximoSorteo = new Date(proximoSorteo*1000)

    var price = (await this.props.contrato.loteria.allValueNFTs(this.props.accountAddress).call())[0]
    price = new BigNumber(price._hex).shiftedBy(-6)
    
    this.setState({
      mc: cantidad,
      totalNFT: totalNFT,
      premio: premio,
      LastWiner: LastWiner,
      proximoSorteo: proximoSorteo.toString(),
      prosort: prosort,
      price: price.toNumber()
    });

  }

  async compra() {

    this.props.contrato.loteria.buyLoteria(this.props.accountAddress, 1).send({ callValue: 100000000 })
    .then(()=>{
      this.setState({
        modalTitulo: "Purchased lottery ticket",
        modalBody: "Thank you for collaborating with the activation of the giveaway"
      })
      window.$("#alerta").modal("show");
      this.estado();

    })
    .catch(()=>{
      this.setState({
        modalTitulo: "Failed transaction",
        modalBody: "Please try again later remember to check that you have enough resources"
      })
      window.$("#alerta").modal("show");
    })


    this.estado();
  }

  async sorteo() {

    if(Date.now() >= (this.state.prosort*1000)){
      this.props.contrato.loteria.sorteo().send()//.send({shouldPollResponse:true})
      .then(async(r)=>{
        console.log(r)
        await this.estado()
        this.setState({
          modalTitulo: "Good luck",
          modalBody: "Thank you for collaborating with the activation of the giveaway"
        })
        window.$("#alerta").modal("show");
      })
      .catch((e)=>{
        console.log(e)
        this.setState({
          modalTitulo: "Bad luck",
          modalBody: "something has not gone well, thank you for trying to collaborate, it will be on a next occasion "
        })
        window.$("#alerta").modal("show");
      })
    }else{
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

  

  async sunSwap(){
    let token = "TRwptGFfX3fuffAMbWDDLJZAZFmP6bGfqL"
    let swapContract = "TKscYLLy6Mn9Bz6MbemmZsM6dbpUVYvXNo"
    let contrato = await this.props.tronWeb.contract(abi_SUNSAWPv2 , swapContract)///esquema de funciones desde TWetT85bP8PqoPLzorQrCyyGdCEG3MoQAk

    let contract_token = await this.props.tronWeb.contract().at(token)
    let aprove = await contract_token.allowance(this.props.accountAddress,"TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax").call()
    

    if(aprove._hex)aprove = parseInt(aprove._hex)

    if(aprove <= 0){
      await contract_token.approve("TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax","115792089237316195423570985008687907853269984665640564039457584007913129639935").send()
    }

    var cantidadTrx = 101000000

    cantidadTrx = parseInt(cantidadTrx)

    var splitage = 0.0005

    splitage = cantidadTrx-(cantidadTrx*splitage)

    splitage = parseInt(splitage)

    let intercam = await contrato["4a25d94a"](cantidadTrx,splitage,["0xaf3f2254a9c6a3c143c10cbe15eb9eb75c553f45","0x891cdb91d149f23B1a45D9c5Ca78a88d0cB44C18"],this.props.accountAddress,(parseInt(Date.now()/1000))+300).send()

    console.log(intercam)
  }

  render() {

    return (
      <>
        <div className="row mx-0">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-xl-3 col-lg-6  col-md-6 col-xxl-5 ">

                    <div className="tab-content">
                      <div role="tabpanel" className="tab-pane fade show active" id="first">
                        <img className="img-fluid" src="https://nft.brutus.finance/loteria/image.gif" alt="brutus lottery" />
                      </div>

                    </div>
                    
                  </div>
                  <div className="col-xl-9 col-lg-6  col-md-6 col-xxl-7 col-sm-12">
                    <div className="product-detail-content">
                      <div className="new-arrival-content pr">
                        <h2>Brutus Lottery (BRLT)</h2>

                        <div className="d-table mb-2">
                          <p className="price float-start d-block">Award: {this.state.premio} TRX </p>
                        </div>
                        <p>Next draw: <span className="item">{this.state.proximoSorteo} </span> <button onClick={()=>this.sorteo()} className="btn btn-success">Make a raffle</button><br />
                          Last winner: <span className="item"> NFT # {this.state.LastWiner} </span>
                        </p>
                        <p>Features:&nbsp;&nbsp;
                          <span className="badge badge-success light" style={{ cursor: "pointer" }} data-bs-toggle="modal" data-bs-target="#reviewModal">Insurance</span>{" "}
                          <span className="badge badge-success light">Random</span>{" "}
                          <span className="badge badge-success light">Smartcontract</span>
                        </p>
                        <p className="text-content">Participate in Brutus Lottery, the exciting lottery where your participation is guaranteed and prizes are generated from staking and renting energy on TRX for 15 days! Purchase an NFT and get as many tickets as you want to increase your chances of winning - join now and try your luck!</p>
                        <div className="d-flex align-items-end flex-wrap mt-4">

                          <div className="shopping-cart  mb-2 me-3">
                            <button className="btn btn-secondary me-1" onClick={() => this.compra()}><i
                              className="fa fa-shopping-basket me-2"></i>Buy Ticket 100 TRX
                            </button>
                            <select defaultValue="trx" name="select">
                              <option value="value1">TRX</option>
                              <option value="value2">USDT</option>
                              <option value="value3">DCT</option>
                            </select>
                          </div>
                        </div>

                      
                          <h4 className="my-1">My Tickets: {this.state.mc} BRLT</h4>
                          <h4 className="my-1">My probability: {(this.state.mc / this.state.totalNFT * 100).toFixed(2)}%</h4>

                          <h4 className="my-1">My pending price : {this.state.price} TRX</h4>
                          <div className="shopping-cart  my-1 me-3">
                            <button className="btn btn-warning" onClick={async () => {

                              await this.props.contrato.BRLT.reclamarPremio(this.props.accountAddress).send()
                              .then(() => { window.alert("Award is sended to your wallet ") })
                              .catch(() => { window.alert("Error when claiming") })

                              

                            }}>Claim</button>

                          </div>
                        

                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="modal fade" id="reviewModal">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">You never lose!</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal">
                  </button>
                </div>
                <div className="modal-body">
                  <p> you do not lose because the trx you enter goes on to produce profits with other products such as BRST once we have profits the random drawing is generated by contract and the profits generated are delivered to the Lottery NFT holder.</p>

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
