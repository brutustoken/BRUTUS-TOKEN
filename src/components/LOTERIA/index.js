import React, { Component } from "react";
import cons from "../../cons.js";

export default class nfts extends Component {

  constructor(props) {
    super(props);

    this.state = {
      deposito: "Cargando...",
      wallet: this.props.accountAddress,
      balanceBRUT: 0,
      precioBRUT: 0,
      mc: 0,
      mb: 0,

    };

    this.estado = this.estado.bind(this);
    this.consultarPrecio = this.consultarPrecio.bind(this);
    this.compra = this.compra.bind(this);

  }

  async componentDidMount() {

    //setTimeout(() => { this.estado() }, 3 * 1000);
  };

  async compra(isBRST) {

    await this.props.contrato.loteria.buyLoteria(isBRST, this.props.accountAddress).send({ callValue: 100000000 });

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

    var robots = [];
    var cantidad = parseInt((await this.props.contrato.BRLT.balanceOf(this.props.accountAddress).call())._hex)

    //console.log(cantidad)

    for (let index = 0; index < cantidad; index++) {

      var ID = await this.props.contrato.BRLT.tokenOfOwnerByIndex(this.props.accountAddress, index).call();
      ID = parseInt(ID._hex);

      var URI = await this.props.contrato.BRLT.tokenURI(ID).call();

      var metadata = JSON.parse(await (await fetch(cons.proxy + URI)).text());

      robots[index] = {
        id: ID,
        uri: URI,
        metadata: metadata
      };

    }

    var imagerobots = [];

    for (let index = 0; index < robots.length; index++) {

      imagerobots[index] = (
        <div className="col-lg-3 p-2" key={"robbrutN" + index}>
          <div className="card">
            <h5 >
              <strong>#{robots[index].id} {robots[index].metadata.name}</strong><br /><br />
            </h5>
            <img src={robots[index].metadata.image} alt={robots[index].metadata.name} className="img-thumbnail"></img>
            <br></br>

          </div>

        </div>
      )
    }

    this.setState({
      robots: robots,
      imagerobots: imagerobots
    });

  }

  render() {

    return (
      <>
        <div class="row mx-0">
          <div class="col-lg-12">
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col-xl-3 col-lg-6  col-md-6 col-xxl-5 ">

                    <div class="tab-content">
                      <div role="tabpanel" class="tab-pane fade show active" id="first">
                        <img class="img-fluid" src="https://nft.brutus.finance/loteria/image.gif" alt="brutus lottery" />
                      </div>
                      <div role="tabpanel" class="tab-pane fade" id="second">
                        <img class="img-fluid" src="images/product/2.jpg" alt="" />
                      </div>
                      <div role="tabpanel" class="tab-pane fade" id="third">
                        <img class="img-fluid" src="images/product/3.jpg" alt="" />
                      </div>
                      <div role="tabpanel" class="tab-pane fade" id="for">
                        <img class="img-fluid" src="images/product/4.jpg" alt="" />
                      </div>
                    </div>
                    <div class="tab-slide-content new-arrival-product mb-4 mb-xl-0">

                      <ul class="nav slide-item-list mt-3" role="tablist">
                        <li role="presentation" class="show">
                          <a href="#first" role="tab" data-bs-toggle="tab">
                            <img class="img-fluid" src="images/tab/1.jpg" alt="" width="50" />
                          </a>
                        </li>
                        <li role="presentation">
                          <a href="#second" role="tab" data-bs-toggle="tab"><img class="img-fluid" src="images/tab/2.jpg" alt="" width="50" /></a>
                        </li>
                        <li role="presentation">
                          <a href="#third" role="tab" data-bs-toggle="tab"><img class="img-fluid" src="images/tab/3.jpg" alt="" width="50" /></a>
                        </li>
                        <li role="presentation">
                          <a href="#for" role="tab" data-bs-toggle="tab"><img class="img-fluid" src="images/tab/4.jpg" alt="" width="50" /></a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="col-xl-9 col-lg-6  col-md-6 col-xxl-7 col-sm-12">
                    <div class="product-detail-content">
                      <div class="new-arrival-content pr">
                        <h2>Brutus Lottery</h2>
                        <div class="comment-review star-rating">
                          <ul>
                            <li><i class="fa fa-star"></i></li>
                            <li><i class="fa fa-star"></i></li>
                            <li><i class="fa fa-star"></i></li>
                            <li><i class="fa fa-star"></i></li>
                            <li><i class="fa fa-star"></i></li>

                          </ul>
                          <span class="review-text">(Full star) / </span><a class="product-review" href="#reviewModal" data-bs-toggle="modal" data-bs-target="#reviewModal">Por qué?</a>
                        </div>
                        <div class="d-table mb-2">
                          <p class="price float-start d-block">100 TRX</p>
                        </div>
                        <p>Tiempo de sorteo: <span class="item"> Cada 15 dias </span>
                        </p>
                        <p>Caracteristicas:&nbsp;&nbsp;
                          <span class="badge badge-success light">Seguro</span>{" "}
                          <span class="badge badge-success light">Refondeable</span>{" "}
                          <span class="badge badge-success light">Aleatorio</span>{" "}
                          <span class="badge badge-success light">Smartcontract</span>
                        </p>
                        <p class="text-content">¡Participa en Brutus Lottery, la emocionante lotería en la que tu participación está garantizada y los premios se generan a partir del staking y alquiler de energía en TRX durante 15 días! Adquiere un NFT y obtén todos los boletos que quieras para aumentar tus posibilidades de ganar. ¡Únete ahora y prueba tu suerte!</p>
                        <div class="d-flex align-items-end flex-wrap mt-4">
                          <div class="filtaring-area mb-2 me-3">
                            <div class="size-filter">
                              <h4 class="m-b-15">Cantidad</h4>
                            </div>
                          </div>
                          <div class="col-2 px-0  mb-2 me-3">
                            <input type="number" name="num" class="form-control input-btn input-number" value="1" />
                          </div>
                          <div class="shopping-cart  mb-2 me-3">
                            <button class="btn btn-secondary" onClick={() => this.compra(false)}><i
                              class="fa fa-shopping-basket me-2"></i>Mintear Boleto</button>
                          </div>
                        </div>

                        <div class="d-flex align-items-end flex-wrap mt-4">
                          <div class="filtaring-area mb-2 me-3">
                            <div class="">
                              <h4 class="m-b-15">Boletos</h4>
                            </div>
                          </div>
                          <div class="col-2 px-0  mb-2 me-3" >
                            <input type="number" name="num" class="form-control input-btn input-number" style={{cursor: "not-allowed"}} value={this.state.mc} readOnly />


                          </div>
                          <div class="shopping-cart  mb-2 me-3">
                            <button class="btn btn-warning" onClick={async () => {

                              if (false) {

                                window.alert("por favor espera a la fecha anunciada para reclamar tu NFT")

                              } else {

                                await this.props.contrato.BRLT.claimNFT().send()
                                  .then(() => { window.alert("NFT's enviados a tu wallet") })
                                  .catch(() => { window.alert("Error al reclamar") })

                              }

                            }}>Reclamar {this.state.mb} TRX ganados</button>

                          </div>
                        </div>


                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div class="modal fade" id="reviewModal">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">¡Nunca pierdes!</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal">
                  </button>
                </div>
                <div class="modal-body">
                  <p> no pierdes por que el trx que ingresas pasa a producir ganancias con otros productos como BRST una vez tenemos utilidades se genera el sorteo aletorio por contrato y las utilidades generadas son entregadas a el poseedor del NFT de la Loteria</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="convert-area" id="convert">
          <div className="container">
            <div className="convert-wrap">
              <div className="row justify-content-center align-items-center flex-column pb-30">
                <h1 className="text-white text-center">JUEGAS Y NUNCA ¡PIERDES!</h1>
              </div>
              <div className="row justify-content-center align-items-start">

                <div className="col-lg-12 cols">
                  <div className="container text-center">

                    <div className="card">
                      <div className="row">

                        <div className="col-lg-12">
                          <img
                            className="img-fluid"
                            src="https://nft.brutus.finance/loteria/image.gif"
                            alt="brutus loteria"
                          />
                          <h2>Comprar Tickets BRLT</h2>
                          <button className="btn btn-success" style={{ "cursor": "pointer" }} >100 TRX</button> <br />ó<br />
                          <button className="btn btn-success" style={{ "cursor": "pointer" }} onClick={() => this.compra(true)}>### BRST</button>


                          <br></br><br></br>



                          <br></br>

                          <button className="btn btn-warning" style={{ "cursor": "pointer" }} onClick={async () => {

                            if (false) {

                              window.alert("por favor espera a la fecha anunciada para reclamar tu NFT")

                            } else {

                              await this.props.contrato.BRLT.claimNFT().send()
                                .then(() => { window.alert("NFT's enviados a tu wallet") })
                                .catch(() => { window.alert("Error al reclamar") })

                            }

                          }}>Reclamar {this.state.mb} TRX ganados</button>
                        </div>

                      </div>

                    </div>


                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section className="convert-area pt-5" id="convert">
          <div className="container">
            <div className="convert-wrap">
              <div className="row justify-content-center align-items-center flex-column pb-30">
                <h1 className="text-white  text-center">Mis Tickets Brutus loteria (BRLT)</h1>
              </div>
              <div className="row justify-content-center align-items-start">

                <div className="col-lg-12 cols">
                  <div className=" container text-center">
                    <div className="row">

                      <div className="col-lg-12 p-2">
                        <div className="card">
                          <br /><br />

                          <h5 >
                            wallet:<br />
                            <strong>{this.props.accountAddress}</strong><br /><br />
                          </h5>


                        </div>

                      </div>

                    </div>

                    <div className="row">

                      {this.state.imagerobots}

                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
}
