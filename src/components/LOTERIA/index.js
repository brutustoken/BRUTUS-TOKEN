import React, { Component } from "react";

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

    this.setState({
      mc: cantidad
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
                        <h2>Brutus Lottery</h2>
                        <div className="comment-review star-rating">
                          <ul>
                            <li><i className="fa fa-star"></i></li>
                            <li><i className="fa fa-star"></i></li>
                            <li><i className="fa fa-star"></i></li>
                            <li><i className="fa fa-star"></i></li>
                            <li><i className="fa fa-star"></i></li>

                          </ul>
                          <span className="review-text">(Full star) / </span><a className="product-review" href="#reviewModal" data-bs-toggle="modal" data-bs-target="#reviewModal">Por qué?</a>
                        </div>
                        <div className="d-table mb-2">
                          <p className="price float-start d-block">100 TRX</p>
                        </div>
                        <p>Tiempo de sorteo: <span className="item"> Cada 15 dias </span>
                        </p>
                        <p>Caracteristicas:&nbsp;&nbsp;
                          <span className="badge badge-success light">Seguro</span>{" "}
                          <span className="badge badge-success light">Refondeable</span>{" "}
                          <span className="badge badge-success light">Aleatorio</span>{" "}
                          <span className="badge badge-success light">Smartcontract</span>
                        </p>
                        <p className="text-content">¡Participa en Brutus Lottery, la emocionante lotería en la que tu participación está garantizada y los premios se generan a partir del staking y alquiler de energía en TRX durante 15 días! Adquiere un NFT y obtén todos los boletos que quieras para aumentar tus posibilidades de ganar. ¡Únete ahora y prueba tu suerte!</p>
                        <div className="d-flex align-items-end flex-wrap mt-4">
                         
                          <div className="shopping-cart  mb-2 me-3">
                            <button className="btn btn-secondary" onClick={() => this.compra(false)}><i
                              className="fa fa-shopping-basket me-2"></i>Mintear Boleto</button>
                          </div>
                        </div>

                        <div className="d-flex align-items-end flex-wrap mt-4">
                          <div className="filtaring-area mb-2 me-3">
                            <div className="">
                              <h4 className="m-b-15">Boletos</h4>
                            </div>
                          </div>
                          <div className="col-2 px-0  mb-2 me-3" >
                            <input type="number" name="num" className="form-control input-btn input-number" style={{cursor: "not-allowed"}} value={this.state.mc} readOnly />

                          </div>
                          <div className="shopping-cart  mb-2 me-3">
                            <button className="btn btn-warning" onClick={async () => {

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

          <div className="modal fade" id="reviewModal">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">¡Nunca pierdes!</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal">
                  </button>
                </div>
                <div className="modal-body">
                  <p> no pierdes por que el trx que ingresas pasa a producir ganancias con otros productos como BRST una vez tenemos utilidades se genera el sorteo aletorio por contrato y las utilidades generadas son entregadas a el poseedor del NFT de la Loteria</p>
                            
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="modal fade" id="regalo">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">¡Sopresa!</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal">
                  </button>
                </div>
                <div className="modal-body">
                  <p> Nos colaboras ayudando a que la loteria funcione y te retribuiremos con una pequeña recompensa, recomendamos que tengas ENERGIA y ANCHO DE BANDA para que no consumas TRX y sea realmente beneficioso.</p>
                  <button className="btn btn-secondary" onClick={async()=>{await this.props.contrato.loteria.sorteo(false).send(); alert("¡Gracias por ayudar!")}} data-bs-dismiss="modal">Ayudar</button>
                </div>
              </div>
            </div>
          </div>
      </>
    );
  }
}
