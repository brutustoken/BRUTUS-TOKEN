import React, { Component } from "react";
const BigNumber = require('bignumber.js');


function delay(s) { return new Promise(res => setTimeout(res, s * 1000)); }

function getRandomInt(max) { return Math.floor(Math.random() * max); }

const amountsE = [
  { amount: 32000, text: "32K" },
  { amount: 100000, text: "100K" },
  { amount: 160000, text: "160K" },
  { amount: 1000000, text: "1M" },
  { amount: 3000000, text: "3M" }
]

const amountB = [
  { amount: 1000, text: "1k" },
  { amount: 2000, text: "2k" },
  { amount: 5000, text: "5k" },
  { amount: 10000, text: "10k" },
  { amount: 50000, text: "50k" }
]

export default class EnergyRental extends Component {

  constructor(props) {
    super(props);

    this.state = {

      deposito: "Loading...",
      wallet: "Loading...",
      precio: "",
      wallet_orden: "",
      recurso: "energy",
      cantidad: 32000,
      periodo: 1,
      temporalidad: "h",
      available_bandwidth: 0,
      available_energy: 0,
      total_bandwidth_pool: 0,
      total_energy_pool: 0,
      titulo: "Titulo",
      body: "Cuerpo del mensaje",
      amounts: amountsE,
      energyOn: false,

    };

    this.handleChangeEnergy = this.handleChangeEnergy.bind(this);
    this.handleChangeBand = this.handleChangeBand.bind(this);
    this.handleChangePeriodo = this.handleChangePeriodo.bind(this);

    this.recursos = this.recursos.bind(this);

    this.handleChangeWallet = this.handleChangeWallet.bind(this);
    this.calcularRecurso = this.calcularRecurso.bind(this);

    this.preCompra = this.preCompra.bind(this);
    this.compra = this.compra.bind(this);

  }

  componentDidMount() {
    document.title = "B.F | E-Bot"
    document.getElementById("tittle").innerText = this.props.i18n.t("ebot.tittle")
    this.recursos()

    setTimeout(() => {
      this.calcularRecurso(this.state.cantidad, this.state.periodo + this.state.temporalidad)
    }, 3 * 1000)

  }

  handleChangeWallet(event) {
    let dato = event.target.value;
    this.setState({
      wallet_orden: dato
    });
  }

  handleChangePeriodo(event) {
    let dato = (event.target.value).toLowerCase();
    let tmp = "d"

    if (dato.split("h").length > 1 || dato.split("hora").length > 1) {
      tmp = "h"
    }

    this.setState({
      periodo: parseInt(dato),
      temporalidad: tmp
    });

    this.calcularRecurso(this.state.cantidad, parseInt(dato) + tmp)

  }

  handleChangeEnergy(event) {
    let dato = event.target.value;
    this.setState({
      cantidad: parseInt(dato)
    });
    this.calcularRecurso(parseInt(dato), this.state.periodo + this.state.temporalidad)
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

    let energyOn = false;

    try {

      energyOn = await fetch("https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL)
        .then((r) => {
          //console.log(r); 
          return r.json();
        })

      energyOn = energyOn.available

    } catch (error) {
      console.log(error.toString())
    }

    let consulta = false

    var url = "https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL + "available"

    try {
      consulta = await fetch(url)
        .then((r) => r.json())


    } catch (error) {
      console.log(error.toString())

    }

    var band = 0
    var energi = 0

    //console.log(consulta)

    if (this.state.periodo === 1 && this.state.temporalidad === "h") {
      band = consulta.av_band[0].available
      energi = consulta.av_energy[0].available
    } else {

      for (let index = 0; index < consulta.av_band.length; index++) {
        if (this.state.periodo <= consulta.av_band[index].period) {
          band = consulta.av_band[index].available
          break;
        }

      }

      for (let index = 0; index < consulta.av_energy.length; index++) {
        if (this.state.periodo <= consulta.av_energy[index].period) {
          energi = consulta.av_energy[index].available
          break;
        }

      }
    }

    if (this.state.recurso === "energy") {
      if (energi < consulta.total_energy_pool * 0.01) {
        energyOn = false;
        this.setState({
          titulo: this.props.i18n.t("ebot.alert.soldOut", { returnObjects: true })[0],
          body: this.props.i18n.t("ebot.alert.soldOut", { returnObjects: true })[1],
        })

        window.$("#mensaje-ebot").modal("show");
      }
    } else {
      if (band < consulta.total_bandwidth_pool * 0.01) {
        energyOn = false;
        this.setState({
          titulo: this.props.i18n.t("ebot.alert.soldOut", { returnObjects: true })[0],
          body: this.props.i18n.t("ebot.alert.soldOut", { returnObjects: true })[1],
        })

        window.$("#mensaje-ebot").modal("show");
      }
    }

    this.setState({
      available_bandwidth: band,
      available_energy: energi,
      total_bandwidth_pool: consulta.total_bandwidth_pool,
      total_energy_pool: consulta.total_energy_pool,
      energyOn: energyOn
    });
  }

  async calcularRecurso(amount, time) {

    this.recursos();

    var ok = true;

    var url = "https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL + "prices"

    time = time.split("d")

    if (time.length >= 2) {

      if (parseInt(time[0]) < 1 || parseInt(time[0]) > 14) {
        this.setState({
          titulo: this.props.i18n.t("ebot.alert.eRange", { returnObjects: true })[0],
          body: this.props.i18n.t("ebot.alert.eRange", { returnObjects: true })[1]
        })

        ok = false;

        window.$("#mensaje-ebot").modal("show");
      }
    } else {

      if (parseInt(time[0]) !== 1) {
        this.setState({
          titulo: this.props.i18n.t("ebot.alert.eRange", { returnObjects: true })[0],
          body: this.props.i18n.t("ebot.alert.eRange2"),
          periodo: "1"
        })

        ok = false;

        window.$("#mensaje-ebot").modal("show");
      }

    }


    time = time[0]

    var paso = false

    if (this.state.recurso === "bandwidth") {
      if (parseInt(amount) >= 1000) {
        paso = true
      }

    } else {
      if (parseInt(amount) >= 32000) {
        paso = true
      }
    }


    if (parseInt(time) > 0 && ok && paso) {
      var body = { "resource": this.state.recurso, "amount": amount, "duration": time }

      this.setState({
        precio: this.props.i18n.t("calculating") + "..."
      })

      var consulta2 = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }).then((r) => r.json())

      //console.log(consulta2)

      var precio = consulta2.price * 1
      precio = parseInt(precio * 10 ** 6) / 10 ** 6

      this.setState({
        precio: precio
      })

      return precio
    } else {
      this.setState({
        precio: 0
      })

      return 0
    }
  }

  async preCompra() {

    console.log(new BigNumber(await this.props.tronWeb.trx.getBalance()).shiftedBy(-6).toNumber())
    console.log(parseFloat(this.state.precio))


    if (parseFloat(this.state.precio) > new BigNumber(await this.props.tronWeb.trx.getBalance()).shiftedBy(-6).toNumber()) {
      this.setState({
        titulo: this.props.i18n.t("ebot.alert.noFounds", { returnObjects: true })[0],
        body: (<span>{this.props.i18n.t("ebot.alert.noFounds", { returnObjects: true })[1]}
        </span>)
      })

      window.$("#mensaje-ebot").modal("show");
      return;
    }

    if (!this.state.energyOn) {
      this.setState({
        titulo: this.props.i18n.t("ebot.alert.eResource", { returnObjects: true })[0],
        body: (<span>{this.props.i18n.t("ebot.alert.eResource", { returnObjects: true })[1]}
        </span>)
      })

      window.$("#mensaje-ebot").modal("show");
      return;
    }

    await this.calcularRecurso(this.state.cantidad, this.state.periodo + this.state.temporalidad)

    if (this.state.wallet_orden === "" || !this.props.tronWeb.isAddress(this.state.wallet_orden)) {
      this.setState({
        wallet_orden: this.props.accountAddress
      })
    }

    if (this.state.wallet_orden === "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb") {
      this.setState({
        titulo: this.props.i18n.t("ebot.alert.eTronlink", { returnObjects: true })[0],
        body: (<span>
          {this.props.i18n.t("ebot.alert.eTronlink", { returnObjects: true })[1]}
          <br />
          <button className="btn btn-danger" data-bs-dismiss="modal">Ok</button>
        </span>)
      })

      window.$("#mensaje-ebot").modal("show");
      return;
    }

    this.setState({
      titulo: <>Confirm order information</>,
      body: (<span>
        <b>Buy: </b> {this.state.cantidad + " " + this.state.recurso + " " + this.state.periodo + this.state.temporalidad}<br></br>
        <b>For: </b> {this.state.precio + " TRX"}<br></br>
        <b>To: </b> {this.state.wallet_orden}<br></br>
        <br /><br />
        <button type="button" className="btn btn-danger" onClick={() => { window.$("#mensaje-ebot").modal("hide") }}>Cancel</button>
        {" "}
        <button type="button" className="btn btn-success" onClick={() => { this.compra() }}>Confirm</button>
      </span>)
    })

    window.$("#mensaje-ebot").modal("show");


  }

  async compra() {

    const imgLoading = <img src="images/cargando.gif" height="20px" alt="loading..." />
    await this.calcularRecurso(this.state.cantidad, this.state.periodo + this.state.temporalidad)

    if (this.state.wallet_orden === "" || !this.props.tronWeb.isAddress(this.state.wallet_orden)) {
      this.setState({
        wallet_orden: this.props.accountAddress
      })
    }

    this.setState({
      titulo: <>Confirm transaction {imgLoading}</>,
      body: <>Please confirm the transaction from your wallet </>
    })

    window.$("#mensaje-ebot").modal("show");

    var hash = await this.props.tronWeb.trx.sendTransaction(process.env.REACT_APP_WALLET_API, this.props.tronWeb.toSun(this.state.precio))
      .catch((e) => {
        console.log(e)
        return ["e", e];
      })

    if (hash[0] === "e") {
      this.setState({
        titulo: "Transaction failed",
        body: <>{hash[1].toString()}
          <br /><br />
          <button type="button" className="btn btn-danger" onClick={() => { window.$("#mensaje-ebot").modal("hide") }}>Close</button>
        </>
      })

      window.$("#mensaje-ebot").modal("show");
      return;
    }

    this.setState({
      titulo: <>Waiting for the blockchain {imgLoading}</>,
      body: "We are waiting for the blockchain to process and confirm your transfer. This can take from 3 seconds to 1 minute"
    })

    window.$("#mensaje-ebot").modal("show");

    await delay(3);

    var envio = hash.transaction.raw_data.contract[0].parameter.value

    this.setState({
      titulo: <>we are verifying {imgLoading}</>,
      body: "We are verifying that the amounts and the address to which the funds were sent are the correct address, please do not close or exit the website as this may affect this process."
    })

    window.$("#mensaje-ebot").modal("show");

    if (hash.result && envio.amount + "" === this.props.tronWeb.toSun(this.state.precio) && this.props.tronWeb.address.fromHex(envio.to_address) === process.env.REACT_APP_WALLET_API) {

      hash = await this.props.tronWeb.trx.getTransaction(hash.txid);

      if (hash.ret[0].contractRet === "SUCCESS") {

        var recurso = this.state.recurso

        this.setState({
          titulo: <>we are allocating your {recurso} {imgLoading}</>,
          body: "Please do not close or leave the page as this will cause an error in the " + recurso + " allocation."
        })

        window.$("#mensaje-ebot").modal("show");



        if (recurso === "bandwidth") {
          recurso = "band"
        }

        var url = "https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL + recurso

        var time = this.state.periodo

        if (this.state.temporalidad === "h") {
          time = this.state.periodo + this.state.temporalidad
        }

        var body = {
          "id_api": process.env.REACT_APP_USER_ID,
          "wallet": this.state.wallet_orden,
          "amount": this.state.cantidad,
          "time": time,
          "user_id": "fromWeb" + getRandomInt(999)
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

        //console.log(consulta2)

        if (consulta2.response === 1) {

          this.setState({
            titulo: "Completed successfully",
            body: <><p>Energy rental completed successfully. </p><button type="button" data-bs-dismiss="modal" className="btn btn-success">Thank you!</button></>
          })

          window.$("#mensaje-ebot").modal("show");

        } else {

          this.setState({
            titulo: "Contact support",
            body: "Please contact support for: " + hash.txID + " | " + consulta2.msg
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

  render() {
    const amounts = this.state.amounts;
    const amountButtons = amounts.map(amounts => <button key={"Amb-" + amounts.text} id="ra1" type="button" className="btn btn-primary"
      style={{ margin: "auto" }} onClick={() => { document.getElementById("amount").value = amounts.amount; this.handleChangeEnergy({ target: { value: amounts.amount } }) }}>{amounts.text}</button>)

    let texto = <>Bandwidth Pool: {(this.state.available_bandwidth).toLocaleString('en-US')}</>
    let porcentaje = this.state.available_bandwidth * 100 / this.state.total_bandwidth_pool

    if (this.state.recurso === "energy") {
      texto = <>Energy Pool: {(this.state.available_energy).toLocaleString('en-US')}</>
      porcentaje = this.state.available_energy * 100 / this.state.total_energy_pool
    }


    let medidor = (<><p className="font-14">{texto}</p>
      <div className="progress" style={{ margin: "5px" }}>
        <div className="progress-bar" role="progressbar" style={{ "width": porcentaje + "%" }}
          aria-valuenow={porcentaje} aria-valuemin="0" aria-valuemax="100">
        </div>
      </div></>)


    return (<>

      <div className="row ">

        <div className="col-md-12 text-center">
          <h1>{this.props.i18n.t("ebot.subTittle")}</h1>
        </div>

        <div className="col-lg-6 col-sm-12">
          <div className="contact-box">
            <div className="card">
              <div className="card-body">
                <div className="mb-4">
                  <div className="row">
                    <div className="col-6">
                      <h4>Rental {this.state.recurso}</h4>
                    </div>
                    <div className="col-6">
                      <div className="d-flex justify-content-sm-end">
                        <div className="btn-group" role="group">
                          <button id="btnGroupDrop1" type="button"
                            className="btn btn-primary dropdown-toggle"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            Resource
                          </button>
                          <ul className="dropdown-menu" aria-labelledby="btnGroupDrop1">
                            <li><button className="dropdown-item" onClick={() => { this.setState({ recurso: "energy", amounts: amountsE }) }}>Energy</button></li>
                            <li><button className="dropdown-item" onClick={() => {
                              this.setState({
                                recurso: "bandwidth",
                                amounts: amountB
                              });
                            }}>Bandwidth</button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>


                    <form className="dzForm" method="" action="">
                      <div className="dzFormMsg"></div>
                      <input type="hidden" className="form-control" name="dzToDo" value="Contact" />
                      {medidor}

                      <div className="col-12 mb-3 d-flex justify-content-center align-items-center">
                        <p style={{ "marginTop": "auto", "marginRight": "10px" }} className="font-14">Amount</p>
                        <input style={{ "textAlign": "end" }} id="amount" name="dzLastName" type="text" onChange={this.handleChangeEnergy} className="form-control mb-1" placeholder="32000" />

                      </div>

                      <div className="col-xl-12 mb-3 mb-md-4">
                        <div className="d-flex justify-content-xl-center">
                          {amountButtons}
                        </div>
                      </div>
                      <div className="col-12 mb-3 d-flex justify-content-center align-items-center">
                        <p style={{ "marginTop": "auto", "marginRight": "10px" }} className="font-14">Duration</p>

                        <input style={{ "textAlign": "end" }} id="periodo" required type="text" className="form-control mb-1" onChange={this.handleChangePeriodo} placeholder={"Default: 1h (one hour)"} defaultValue="1h" />

                      </div>
                      <div className="col-12 ">
                        <div className="d-flex justify-content-xl-center">
                          <button type="button" className="btn btn-primary"
                            style={{ margin: "auto" }} onClick={() => { document.getElementById("periodo").value = "1h"; this.handleChangePeriodo({ target: { value: "1h" } }) }}>1h</button>
                          <button type="button" className="btn btn-primary"
                            style={{ margin: "auto" }} onClick={() => { document.getElementById("periodo").value = "1d"; this.handleChangePeriodo({ target: { value: "1d" } }) }}>1d</button>
                          <button type="button" className="btn btn-primary"
                            style={{ margin: "auto" }} onClick={() => { document.getElementById("periodo").value = "3d"; this.handleChangePeriodo({ target: { value: "3d" } }) }}>3d</button>
                          <button type="button" className="btn btn-primary"
                            style={{ margin: "auto" }} onClick={() => { document.getElementById("periodo").value = "7d"; this.handleChangePeriodo({ target: { value: "7d" } }) }}>7d</button>
                          <button type="button" className="btn btn-primary"
                            style={{ margin: "auto" }} onClick={() => { document.getElementById("periodo").value = "14d"; this.handleChangePeriodo({ target: { value: "14d" } }) }}>14d</button>
                        </div>
                      </div>

                      <div className="col-12 mt-5 mb-3 justify-content-center align-items-center">

                        <button name="submit" type="button" value="Submit"
                          className="btn btn-secondary"
                          style={{ width: "100%", height: "40px" }} onClick={() => this.preCompra()}> Complete Purchase - Total: {this.state.precio} TRX
                        </button>

                      </div>

                      <div className="col-xl-12 mb-3 mb-md-4">
                        <p className="font-14">Send resources for another wallet</p>

                        <input name="dzFirstName" required type="text"
                          className="form-control" placeholder={this.props.accountAddress} onChange={this.handleChangeWallet} />
                      </div>

                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 pt-4 mt-5 col-sm-12 m-b30">
          <div className="info-box text-center">
            <img src="images/ebot.png" width="170px" className="figure-img img-fluid rounded" alt="resource rental energy" />

            <div className="info">
              <p className="font-20">In Brutus Energy Bot, we've developed a DApp for a faster and secure resource rental experience on the Tron network. Innovatively simplifying the process, we ensure efficient management at competitive prices. Explore further through our <a href="https://t.me/BRUTUS_energy_bot">Telegram bot</a> or API for added accessibility. For additional information, reach out to us at <a href="mailto:support@brutus.finance">support@brutus.finance</a></p>
            </div>

            <div className="widget widget_about">
              <div className="widget widget_getintuch">
              </div>
            </div>
            <div className="social-box dz-social-icon style-3">
            </div>
          </div>
        </div>

      </div >

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

    </>);
  }
}
