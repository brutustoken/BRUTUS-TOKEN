import React, { Component } from "react";

function delay(s) { return new Promise(res => setTimeout(res, s * 1000)); }

export default class EnergyRental extends Component {

  constructor(props) {
    super(props);

    this.state = {

      minCompra: 32000,
      deposito: "Loading...",
      wallet: "Loading...",
      precio: "",
      wallet_orden: "",
      cantidad: 32000,
      periodo: 1,
      temporalidad: "h",
      available_bandwidth: 0,
      available_energy: 0,
      total_bandwidth_pool: 0,
      total_energy_pool: 0,
      titulo: "Titulo",
      body: "Cuerpo del mensaje"

    };

    this.handleChangeEnergy = this.handleChangeEnergy.bind(this);
    this.handleChangeBand = this.handleChangeBand.bind(this);
    this.handleChangePeriodo = this.handleChangePeriodo.bind(this);

    this.recursos = this.recursos.bind(this);

    this.handleChangeWallet = this.handleChangeWallet.bind(this);
    this.calcularRecurso = this.calcularRecurso.bind(this);

    this.compra = this.compra.bind(this);

  }

  componentDidMount() {
    this.recursos()
  }

  handleChangeWallet(event) {
    let dato = event.target.value;
    this.setState({
      wallet_orden: dato
    });
  }

  handleChangePeriodo(event) {
    let dato = event.target.value;
    this.setState({
      periodo: dato
    });
  }

  handleChangeEnergy(event) {
    let dato = event.target.value;
    this.setState({
      cantidad: dato
    });
  }

  handleChangeBand(event) {
    let dato = event.target.value;
    let oper = dato / this.state.precioBRST
    oper = parseInt(oper * 1e6) / 1e6;
    this.setState({
      valueUSDT: event.target.value,
      valueBRUT: oper,
    });
  }

  async recursos() {
    var url = "https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL + "available"
    var consulta = await fetch(url)
    consulta = (await consulta.json())

    /*
    url = "https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL + "prices"

    var body = { "resource": "energy", "amount": 32000, "duration": "1h" }

    var consulta2 = await fetch(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    consulta2 = (await consulta2.json())

    //console.log(consulta2)
*/

console.log(consulta)
    this.setState({
      available_bandwidth: consulta["BANDWIDTH_-_Rental_duration_more_than_3_days"],
      available_energy: consulta["ENERGY_-_Rental_duration_more_than_3_days"],
      total_bandwidth_pool: consulta.total_bandwidth_pool,
      total_energy_pool: consulta.total_energy_pool
    });
  }

  async calcularRecurso(amount, time) {

    var ok = true;

    var url = "https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL + "prices"

    time = time.split("d")

    if(time.length >= 2){

      if(parseInt(time[0]) < 1 || parseInt(time[0]) > 14){
        this.setState({
          titulo: "Error Range",
          body: "Please enter a range of values between 1 and 14 days"
        })

        ok = false;
  
        window.$("#mensaje-ebot").modal("show");
      }
    }else{

      if(parseInt(time[0]) !== 1){
        this.setState({
          titulo: "Error Range",
          body: "It is only available for 1 hour operations",
          periodo: "1"
        })

        ok = false;
  
        window.$("#mensaje-ebot").modal("show");
      }

    }


    time = time[0]

    if(parseInt(time) > 0 && ok ){
      var body = { "resource": "energy", "amount": amount, "duration": time }

      var consulta2 = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      consulta2 = (await consulta2.json())

      var precio = consulta2.price * 1.1
      precio = parseInt(precio*10**6)/10**6

      this.setState({
        precio: precio
      })

      return precio
    }else{
      this.setState({
        precio: 0
      })

      return 0
    }
  }

  async compra() {
    await this.calcularRecurso(this.state.cantidad, this.state.periodo + this.state.temporalidad)
    if (this.state.wallet_orden === "" || !window.tronWeb.isAddress(this.state.wallet_orden)) {
      this.setState({
        wallet_orden: this.props.accountAddress
      })
    }
    var si = window.confirm("really buy " + this.state.cantidad + " Energy " + this.state.periodo + this.state.temporalidad + " for " + this.state.precio + " TRX to " + this.state.wallet_orden + ", please sing the next transacction")

    if (si) {

      this.setState({
        titulo: "Confirm transaction",
        body: "Please confirm the transaction from your wallet"
      })

      window.$("#mensaje-ebot").modal("show");

      var hash = await window.tronWeb.trx.sendTransaction("TMY1d5zzuBfTBzzVFVNEt5EnPuLMripk26", window.tronWeb.toSun(this.state.precio));

      this.setState({
        titulo: "Waiting for the blockchain",
        body: "We are waiting for the blockchain to process and confirm your transfer. This can take from 3 seconds to 1 minute."
      })

      window.$("#mensaje-ebot").modal("show");

      await delay(3);

      var envio = hash.transaction.raw_data.contract[0].parameter.value

      this.setState({
        titulo: "we are verifying",
        body: "We are verifying that the amounts and the address to which the funds were sent are the correct address, please do not close or exit the website as this may affect this process."
      })

      window.$("#mensaje-ebot").modal("show");

      if (hash.result && envio.amount + "" === window.tronWeb.toSun(this.state.precio) && window.tronWeb.address.fromHex(envio.to_address) === "TMY1d5zzuBfTBzzVFVNEt5EnPuLMripk26") {

        hash = await window.tronWeb.trx.getTransaction(hash.txid);
        console.log(hash)
        if (hash.ret[0].contractRet === "SUCCESS") {

          var url = "https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL + "energy"

          var body = {
            "id_api": process.env.REACT_APP_USER_ID,
            "wallet": this.state.wallet_orden,
            "amount": this.state.cantidad,
            "time": this.state.periodo + this.state.temporalidad,
            "user_id": "1999"
          }

          var consulta2 = await fetch(url, {
            method: "POST",
            headers: {
              'token-api': process.env.REACT_APP_TOKEN,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          })
          consulta2 = (await consulta2.json())

          if (consulta2) {

            this.setState({
              titulo: "Completed successfully",
              body: "Energy rental completed successfully. Thank you!"
            })

            window.$("#mensaje-ebot").modal("show");

          } else {

            this.setState({
              titulo: "Contact support",
              body: "Please contact support for: Error AP-0032 # " + hash.txid
            })

            window.$("#mensaje-ebot").modal("show");

          }



        } else {
          this.setState({
            titulo: "Contact support",
            body: "Please contact support for: Error SUC-808831"
          })

          window.$("#mensaje-ebot").modal("show");
        }


      } else {
        this.setState({
          titulo: "Contact support",
          body: "Please contact support for: Error NN-0001"
        })

        window.$("#mensaje-ebot").modal("show");
      }
    }
  }

  render() {

    return (
      <>

        <div className="row mx-0 ">
          <div className="col-lg-12">
            <div className="form-head mb-sm-5 mb-3 d-flex flex-wrap align-items-center">
              <h1 className="font-w600 title mb-2 me-auto ">Rental Dashboard</h1>

            </div>
          </div>

          <div className="col-xl-6 col-xxl-12">

            <div className="card">

              <div className="row m-4">

                <div className="col-md-6 col-sm-12">
                  <div className="">
                    <h3 className="text-white">{(this.state.available_energy).toLocaleString('en-US')} <i className="bi bi-lightning-charge"></i> Energy</h3>
                  </div>
                  <div className="progress">
                    <div className="progress-bar bg-info" style={{ "width": (this.state.available_energy*100/this.state.total_energy_pool)+"%" }}></div>
                  </div>
                </div>
                <div className="col-md-6 col-sm-12">
                  <div className="">
                    <h3 className="text-white">{(this.state.available_bandwidth).toLocaleString('en-US')} <i className="bi bi-wifi"></i> Bandwitdh</h3>
                  </div>
                  <div className="progress">
                    <div className="progress-bar bg-warning" style={{ "width": (this.state.available_bandwidth*100/this.state.total_bandwidth_pool)+"%" }}></div>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="basic-form">
                  <form className="form-wrapper">
                    <div className="form-group">
                      <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                          <span className="input-group-text" style={{ cursor: "pointer" }}>Wallet:</span>
                        </div>
                        <input type="text" className="form-control" id="wallet_orden" onChange={this.handleChangeWallet} placeholder={this.props.accountAddress} value={this.state.wallet_orden} />
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                          <span className="input-group-text" style={{ cursor: "pointer" }} >Amount:</span>
                        </div>
                        <input type="number" className="form-control" id="amount_resource" onChange={this.handleChangeEnergy} placeholder={this.state.minCompra} min={this.state.minCompra} max={this.state.available_energy} />
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                          <span className="input-group-text " style={{ cursor: "pointer" }} >Period: </span>
                        </div>
                        <input type="number" className="form-control" id="period" onChange={this.handleChangePeriodo} placeholder={"Default: 1 (hour)"} />
                        <div className="form-check mx-2">

                          <label className="form-check-label">
                            Days
                          </label>
                          <input className="form-check-input" type="checkbox" onChange={() => {
                            if (this.state.temporalidad === "h") {
                              this.setState({ temporalidad: "d" })
                            } else {
                              this.setState({ temporalidad: "h" })
                            }
                          }} />

                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                          <span className="input-group-text " style={{ cursor: "pointer" }} >Total TRX:</span>
                        </div>
                        <input readOnly type="number" className="form-control" id="amountUSDT" placeholder={"Calculating..."} value={this.state.precio} />

                      </div>
                    </div>
                    <div className="form-group">
                      <div className="input-group input-group-lg">

                        <div className="btn  btn-warning text-white mb-2" onClick={() => this.calcularRecurso(this.state.cantidad, this.state.periodo + this.state.temporalidad)}>
                          Calculate &nbsp; <i className="bi bi-sun"></i>
                        </div>
                        <div className="btn  btn-success text-white mb-2" onClick={() => this.compra()}>
                          BUY &nbsp; <i className="bi bi-bag"></i>
                        </div>
                      </div>
                    </div>
                    <div className="row mt-4 align-items-center">
                      <div className="col-sm-6 mb-3">
                        <p className="mb-0 fs-14">We recommend keeping ~10 TRX or <a href="?ebot">energy</a> to trade</p>
                      </div>
                    </div>

                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-12">
            <h2>Brutus Energy Bot</h2>
          </div>

          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <div className="row justify-content-center">
                  <div className="col-md-4 col-sm-12">
                    <div className="row">
                      <div className="col-12">
                        <a href="https://t.me/BRUTUS_ENERGY_BOT" style={{ color: "white" }}>
                          <img className="img-fluid pe-3 pb-4" align="left" src="assets/img/breb.png" alt="brutus energy bot" />
                        </a>
                      </div>
                      <div className="col-12">
                        <a href="https://t.me/BRUTUS_ENERGY_BOT" style={{ color: "white" }}>
                          <h4 className="text-white" align="center">
                            @BRUTUS_ENERGY_BOT
                            <img src="images/telegram.png" width="50px" alt="telegram logo" />
                          </h4>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-8 col-sm-12">
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

        </div>

        <div className="modal fade" id="mensaje-ebot">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{this.state.titulo}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal">
                </button>
              </div>
              <div className="modal-body">
                <p>{this.state.body}</p>
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

      </>
    );
  }
}
