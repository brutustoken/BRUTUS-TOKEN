import React, { Component } from "react";

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
      LastWiner: "Loading..."

    };

    this.estado = this.estado.bind(this);
    this.consultarPrecio = this.consultarPrecio.bind(this);
    this.compra = this.compra.bind(this);

  }

  async componentDidMount() {

    setTimeout(async() => { 
      await this.estado();
    }, 3 * 1000);
  };

  async compra(isBRST) {

    await this.props.contrato.loteria.buyLoteria(isBRST, this.props.accountAddress, 1).send({ callValue: 100000000 });

    alert("Boleto comprado!");

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

  async estado() {

    var cantidad = parseInt((await this.props.contrato.BRLT.balanceOf(this.props.accountAddress).call())._hex)
    var totalNFT = parseInt((await this.props.contrato.BRLT.totalSupply().call())._hex)
    var premio = parseInt((await this.props.contrato.loteria.premio().call())._hex)/ 10 ** 6
    var LastWiner = parseInt(await this.props.contrato.loteria.lastWiner().call())


    this.setState({
      mc: cantidad,
      totalNFT: totalNFT,
      premio: premio,
      LastWiner: LastWiner
    });

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
                    <div className="tab-slide-content new-arrival-product mb-4 mb-xl-0">

                      <ul className="nav slide-item-list mt-3" role="tablist">
                        <li role="presentation" className="show">
                          <a href="#first" role="tab" data-bs-toggle="tab">
                            <img className="img-fluid" src="images/tab/1.jpg" alt="" width="50" />
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-xl-9 col-lg-6  col-md-6 col-xxl-7 col-sm-12">
                    <div className="product-detail-content">
                      <div className="new-arrival-content pr">
                        <h2>Brutus Lottery (BRLT)</h2>
                       
                        <div className="d-table mb-2">
                          <p className="price float-start d-block">Award: {this.state.premio} TRX</p>
                        </div>
                        <p>Next draw: <span className="item"> in 15 days </span> <br />
                          Last winner: <span className="item"> NFT # {this.state.LastWiner} </span>
                        </p>
                        <p>Features:&nbsp;&nbsp;
                          <span className="badge badge-success light" style={{cursor: "pointer"}} data-bs-toggle="modal" data-bs-target="#reviewModal">Insurance</span>{" "}
                          <span className="badge badge-success light">Refundable</span>{" "}
                          <span className="badge badge-success light">Random</span>{" "}
                          <span className="badge badge-success light">Smartcontract</span>
                        </p>
                        <p className="text-content">Participate in Brutus Lottery, the exciting lottery where your participation is guaranteed and prizes are generated from staking and renting energy on TRX for 15 days! Purchase an NFT and get as many tickets as you want to increase your chances of winning - join now and try your luck!</p>
                        <div className="d-flex align-items-end flex-wrap mt-4">
                         
                          <div className="shopping-cart  mb-2 me-3">
                            <button className="btn btn-secondary" onClick={() => this.compra(false)}><i
                              className="fa fa-shopping-basket me-2"></i>Buy Ticket 100 TRX</button>
                          </div>
                        </div>

                        <p>
                        <h4 className="my-1">My Tickets: {this.state.mc} BRLT</h4>
                        <h4 className="my-1">My probability: {(this.state.mc/this.state.totalNFT *100).toFixed(2)}%</h4>

                          <h4 className="my-1">I have earned: {this.state.mb} TRX</h4>
                          <div className="shopping-cart  my-1 me-3">
                            <button className="btn btn-warning" onClick={async () => {

                              var claim = prompt("Set number of NFT want you claim our value","0")

                              claim = parseInt(claim)

                              if (parseInt(claim) <= 0 || isNaN(claim)) {

                                window.alert("please enter a valid number to make a claim")

                              } else {

                                await this.props.contrato.BRLT.reclamarValueNFT(claim).send()
                                  .then(() => { window.alert("Profits sent to the NFT wallet owner") })
                                  .catch(() => { window.alert("Error when claiming") })

                              }

                            }}>Claim</button>

                          </div>
                        </p>

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

        <div className="modal fade" id="regalo">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Surprise!</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal">
                  </button>
                </div>
                <div className="modal-body">
                  <p> You collaborate helping us to make the lottery work and we will give you a small reward, we recommend that you have ENERGY and BANDWIDTH so that you do not consume TRX and it is really beneficial.</p>
                  <button className="btn btn-secondary" onClick={async()=>{let win = await this.props.contrato.loteria.sorteo(false).send(); console.log(win); alert("Thanks for your help! (#"+win+")"); this.estado()}} data-bs-dismiss="modal">Ayudar</button>
                </div>
              </div>
            </div>
          </div>
      </>
    );
  }
}
