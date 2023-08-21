import React, { Component } from "react";

export default class nfts extends Component {

  constructor(props) {
    super(props);

    this.state = {

      minCompra: 32000,
      minventa: 32000,
      deposito: "Loading...",
      wallet: "Loading...",
      valueBRUT: "",
      valueUSDT: "",
      value: "",
      cantidad: 0,
      tiempo: 0,
      enBrutus: 0,
      tokensEmitidos: 0,
      enPool: 0,
      solicitado: 0,
      data: [],
      precioBRST: "#.###",
      solicitudes: 0,
      temporalidad: "day",
      cantidadDatos: 30,
      dias: "Loading..."

    };


    this.handleChange = this.handleChange.bind(this);
    this.handleChange2 = this.handleChange2.bind(this);

    this.handleChangeBRUT = this.handleChangeBRUT.bind(this);
    this.handleChangeUSDT = this.handleChangeUSDT.bind(this);


  }

  handleChange(e) {
    let evento = e.target.value;
    this.grafico(500, evento, this.state.cantidadDatos);
    this.setState({ temporalidad: evento });
  }

  handleChange2(e) {
    let evento = parseInt(e.target.value);
    this.grafico(500, this.state.temporalidad, evento);
    this.setState({ cantidadDatos: evento });
  }


  handleChangeBRUT(event) {
    let dato = event.target.value;
    let oper = dato * this.state.precioBRST;
    oper = parseInt(oper * 1e6) / 1e6;
    this.setState({
      valueBRUT: dato,
      valueUSDT: oper
    });
  }

  handleChangeUSDT(event) {
    let dato = event.target.value;
    let oper = dato / this.state.precioBRST
    oper = parseInt(oper * 1e6) / 1e6;
    this.setState({
      valueUSDT: event.target.value,
      valueBRUT: oper,
    });
  }

  render() {

    return (
      <>

        <div className="row mx-0 ">
          <div className="col-lg-12">
            <h1>BRUTUS ENERGY BOT</h1>
          </div>

          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <div className="row justify-content-center">
                  <div className="col-4">
                    <a href="https://t.me/BRUTUS_ENERGY" style={{ color: "white" }}>
                      <img className="img-fluid pe-3 pb-4" align="left" src="assets/img/breb.png" alt="brutus energy bot" />
                      <h4 className="text-white" align="center">
                        @BRUTUS_ENERGY
                        <img src="images/telegram.png" width="50px" alt="telegram logo" />
                      </h4>
                    </a>
                  </div>

                  <div className="col-8">
                    <p className="text-content">The team that won a prize at the Tron hackathon is back with an improved version. Discover the innovative "Brutus Energy bot. This revolutionary bot offers you the opportunity to rent energy and bandwidth at the best price on the market. With flexible 1-hour trades and non-blocking orders, you can take full advantage of Tron's staking 2.0.
                      <br /><br />
                      Outstanding benefits:
                      <br /><br />
                      Lease power and bandwidth at the best price in the market.
                      Trade flexibly in 1-hour periods to suit your needs.
                      Place orders without blocking, maintaining full control of your resources.
                      Renew your orders and get additional discounts to maximize your profits.
                      <br /><br /> <br />
                      Join our bot on Telegram and discover an efficient and cost-effective way to rent energy and bandwidth with the powerful "Brutus Energy".
                    </p>


                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="col-lg-12">
            <div className="form-head mb-sm-5 mb-3 d-flex flex-wrap align-items-center">
              <h2 className="font-w600 title mb-2 me-auto ">Rental Dashboard</h2>
              <div className="weather-btn mb-2">
                <span className="me-3 font-w600 text-white"><i className="bi bi-lightning-charge"></i>150000000</span>
                <select className="form-control style-1 default-select  me-3 ">
                  <option className="text-dark">Energy</option>
                </select>

                <span className="me-3 font-w600 text-white"><i className="bi bi-wifi"></i>10000</span>
                <select className="form-control style-1 default-select  me-3 ">
                  <option className="text-dark">Bandwidth</option>
                </select>
              </div>

            </div>
          </div>

          <div className="col-xl-6 col-xxl-12">
            <div className="card">
              <div className="card-header d-sm-flex d-block pb-0 border-0">
                <div>
                  <h4 className="fs-20 text-black">Resources</h4>

                </div>

              </div>
              <div className="card-body">
                <div className="basic-form">
                  <form className="form-wrapper">
                    <div className="form-group">
                      <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                          <span className="input-group-text" style={{ cursor: "pointer" }} onClick={() => this.llenarBRST()} >Wallet: {this.state.balanceBRUT}</span>
                        </div>
                        <input type="number" className="form-control" id="amountBRUT" placeholder={this.props.accountAddress} />
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                          <span className="input-group-text" style={{ cursor: "pointer" }} onClick={() => this.llenarBRST()} >Amount: {this.state.balanceBRUT}</span>
                        </div>
                        <input type="number" className="form-control" id="amountBRUT" onChange={this.handleChangeBRUT} placeholder={100000} min={this.state.minventa} max={this.state.balanceBRUT} value={this.state.valueBRUT} />
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                          <span className="input-group-text " style={{ cursor: "pointer" }} onClick={() => this.llenarUSDT()} >Period: {this.state.balanceUSDT}</span>
                        </div>
                        <input type="number" className="form-control" id="amountUSDT" onChange={this.handleChangeUSDT} placeholder={100000} min={this.state.minCompra} max={this.state.balanceUSDT} value={this.state.valueUSDT} />
                        <div class="form-check mx-2">

                          <label class="form-check-label">
                            Hours
                          </label>
                          <input class="form-check-input" type="checkbox" />

                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                          <span className="input-group-text " style={{ cursor: "pointer" }} onClick={() => this.llenarUSDT()} >Total: {this.state.balanceUSDT}</span>
                        </div>
                        <input readOnly type="number" className="form-control" id="amountUSDT" onChange={this.handleChangeUSDT} placeholder={100000} min={this.state.minCompra} max={this.state.balanceUSDT} value={this.state.valueUSDT} /><button className="btn  btn-success text-white mb-2" onClick={() => this.compra()}>
                          BUY &nbsp; <i class="bi bi-bag"></i>
                        </button>
                      </div>
                    </div>
                    <div className="row mt-4 align-items-center">
                      <div className="col-sm-6 mb-3">
                        <p className="mb-0 fs-14">We recommend keeping ~100 TRX or <a href="?ebot">energy</a> to trade</p>
                      </div>
                      <div className="col-sm-6 text-sm-right text-start">


                        <p className="mb-0 fs-12">To withdraw the TRX from the SR we have </p>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                          <span className="input-group-text " style={{ cursor: "pointer" }} onClick={() => this.llenarUSDT()} >Hash to confirm order: {this.state.balanceUSDT}</span>
                        </div>
                        <input type="number" className="form-control" id="amountUSDT" onChange={this.handleChangeUSDT} placeholder={100000} min={this.state.minCompra} max={this.state.balanceUSDT} value={this.state.valueUSDT} />
                        <button className="btn btn-primary text-white mb-2" onClick={() => this.compra()}>
                          Confirm &nbsp;
                          <i class="bi bi-check-square"></i>
                        </button>
                      </div>
                    </div>
                  </form>
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
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
