import React, { Component } from "react";
import utils from "../utils";

const BigNumber = require('bignumber.js');


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
      precio: "****",
      wallet_orden: "",
      recurso: "energy",
      cantidad: 32000,
      montoMin: 32000,
      minPrice: '1.92',
      periodo: 5,
      temporalidad: "m",
      available_bandwidth: 0,
      available_energy: 0,
      total_bandwidth_pool: 0,
      total_energy_pool: 0,
      titulo: "Titulo",
      body: "Cuerpo del mensaje",
      amounts: amountsE,
      energyOn: false,
      fromUrl: true,

      unitEnergyPrice: new BigNumber(1),

    };

    this.handleChangePeriodo = this.handleChangePeriodo.bind(this);
    this.handleChangeWallet = this.handleChangeWallet.bind(this);

    this.estado = this.estado.bind(this);

    this.recursos = this.recursos.bind(this);
    this.calcularRecurso = this.calcularRecurso.bind(this);

    this.preCompra = this.preCompra.bind(this);
    this.compra = this.compra.bind(this);

  }

  async componentDidMount() {
    document.title = "B.F | E-Bot"
    document.getElementById("tittle").innerText = this.props.i18n.t("ebot.tittle")
 
    setTimeout(() => {
      this.estado()
    }, 1 * 1000)

    setInterval(() => {
      this.estado()

    }, 60 * 1000)

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

    if (dato.split("m").length > 1 || dato.split("min").length > 1) {
      tmp = "m"
    }

    this.setState({
      periodo: parseInt(dato),
      temporalidad: tmp
    });

    this.calcularRecurso()

  }

  async estado(){

    let {recurso, cantidad, fromUrl} = this.state

    let montoMin = 32000
    if (recurso === "bandwidth") {
      montoMin = 1000
    } 

    this.setState({ montoMin })

    if(cantidad < montoMin){
      this.setState({ cantidad:montoMin })
    }

    await this.recursos()

    let loc = document.location.href;
    if (loc.indexOf('?ebot=buy') > 0 && fromUrl) {
      let getString = loc.split('?')[1];
      let GET = getString.split('&');
      let get = {};
      let tmp;

      for (var i = 0, l = GET.length; i < l; i++) {
        tmp = GET[i].split('=');
        get[tmp[0]] = unescape(decodeURI(tmp[1]));
      }


      if (get['ebot'] === 'buy') {
        tmp = get['buy'];
        let cantidad = parseInt(get['amount'])
        let recurso = get['resource']

        if(recurso === "band"||recurso === "bandwidth"){
          recurso = "bandwidth"
        }else{
          recurso = "energy"
        }

        await this.setState({
          cantidad,
          recurso,
          temporalidad: 'm',
          periodo: '5',
          fromUrl: false
        })

        document.getElementById("amount").value = cantidad

        this.preCompra()
      } 



    }else{
      await this.calcularRecurso()

    }


  }

  async recursos() {

    let {recurso, energyOn} = this.state

    let band = 0
    let energi = 0
    let consulta = false
    const URL = "https://cors.brutusservices.com/"+process.env.REACT_APP_BOT_URL

    try {

      consulta = await fetch( URL)
        .then((r) => {
          return r.json();
        })

      energyOn = consulta.available

      consulta = await fetch(URL+ "available")
        .then((r) => r.json())

    } catch (error) {
      console.log(error.toString())
    }

  
    if (this.state.temporalidad.indexOf("m") >= 0 || this.state.temporalidad.indexOf("h") >= 0 ) {
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

    if (recurso === "energy") {
      if (energi < consulta.total_energy_pool * 0.005) {
        energyOn = false;
        this.setState({
          titulo: this.props.i18n.t("ebot.alert.soldOut", { returnObjects: true })[0],
          body: this.props.i18n.t("ebot.alert.soldOut", { returnObjects: true })[1],
        })

        window.$("#mensaje-ebot").modal("show");
      }
    } else {
      if (band < consulta.total_bandwidth_pool * 0.005) {
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
      energyOn
    });

    return energyOn
  }

  async calcularRecurso() {

    let { periodo , temporalidad , recurso, montoMin, minPrice} = this.state

    let precio = this.props.i18n.t("calculating") + "..."

    let cantidad = document.getElementById("amount").value
    cantidad = parseInt(cantidad)
    if (parseInt(cantidad) <= montoMin || isNaN(cantidad)) {
      cantidad = montoMin
      precio = minPrice
    }

    this.setState({
      precio: precio
    })

    let time = periodo + temporalidad
    let ok = true;
    let url = "https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL + "prices"

    await this.recursos();

    if (time.indexOf("d") >= 0) {

      if (parseInt(time[0]) < 1 || parseInt(time[0]) > 14) {
        this.setState({
          titulo: this.props.i18n.t("ebot.alert.eRange", { returnObjects: true })[0],
          body: this.props.i18n.t("ebot.alert.eRange", { returnObjects: true })[1]
        })

        ok = false;

        window.$("#mensaje-ebot").modal("show");
      }

      time = time.split("d")[0]

    }

    if(time.indexOf("h") >= 0) {

      if (parseInt(time[0]) !== 1) {
        this.setState({
          titulo: this.props.i18n.t("ebot.alert.eRange", { returnObjects: true })[0],
          body: this.props.i18n.t("ebot.alert.eRange2"),
          periodo: "1"
        })

        ok = false;

        window.$("#mensaje-ebot").modal("show");
      }

      time = "1h"

    }

    if(time.indexOf("m") >= 0) {

      if (parseInt(time[0]) !== 5) {
        this.setState({
          titulo: this.props.i18n.t("ebot.alert.eRange", { returnObjects: true })[0],
          body: this.props.i18n.t("ebot.alert.eRange2"),
          periodo: "5"
        })

        ok = false;

        window.$("#mensaje-ebot").modal("show");
      }

      time = "5min"

    }

    if (ok) {
      

      let body = { "resource": recurso, "amount": cantidad, "duration": time }

      console.log(body)

      let consulta = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      .then(async (r) => await r.json())
      .catch((e) => {
        return e.toString()
      })

      console.log(consulta)

      precio = consulta.price

      this.setState({unitEnergyPrice: new BigNumber(precio).dividedBy(cantidad)})

      if (parseInt(cantidad) <= montoMin) {
        this.setState({minPrice:precio})
      }

    } else {
      precio = "Input error"

    }

    this.setState({
      precio: precio
    })

    return precio
  }

  async preCompra() {

    await this.recursos();

    let {wallet_orden, cantidad, periodo, temporalidad, recurso, energyOn, available_energy, available_bandwidth} = this.state
    let {accountAddress, tronWeb, i18n} = this.props

    if (!energyOn) {
      this.setState({
        titulo: i18n.t("ebot.alert.eResource", { returnObjects: true })[0],
        body: (<span>{i18n.t("ebot.alert.eResource", { returnObjects: true })[1]}
        </span>)
      })

      window.$("#mensaje-ebot").modal("show");
      return;
    }

    let pagas = await this.calcularRecurso()

    if (isNaN(pagas)) {
      this.setState({
        titulo: "Error",
        body: "error to calculating price of resource"
      })

      window.$("#mensaje-ebot").modal("show");
      return;
    }

    if (wallet_orden === "" || !tronWeb.isAddress(wallet_orden)) {
      this.setState({
        wallet_orden: accountAddress
      })
    }

    if (parseFloat(pagas) > new BigNumber(await tronWeb.trx.getBalance(accountAddress)).shiftedBy(-6).toNumber()) {
      this.setState({
        titulo: i18n.t("ebot.alert.noFounds", { returnObjects: true })[0],
        body: (<span>{i18n.t("ebot.alert.noFounds", { returnObjects: true })[1]}
        </span>)
      })

      window.$("#mensaje-ebot").modal("show");
      return;
    }

    

    if (wallet_orden === "" || !tronWeb.isAddress(wallet_orden)) {
      this.setState({
        wallet_orden: accountAddress
      })
    }

    if (wallet_orden === "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb") {
      this.setState({
        titulo: i18n.t("ebot.alert.eTronlink", { returnObjects: true })[0],
        body: (<span>
          {i18n.t("ebot.alert.eTronlink", { returnObjects: true })[1]}
          <br />
          <button className="btn btn-danger" data-bs-dismiss="modal">Ok</button>
        </span>)
      })

      window.$("#mensaje-ebot").modal("show");
      return;
    }


    if(recurso === "energy"){
      if(cantidad > available_energy){
        this.setState({
          titulo: "Error",
          body: "insufficient resources to cover this order try a lower value or try again later."
        })
  
        window.$("#mensaje-ebot").modal("show");
        return;
      }
    }else{
      if(cantidad > available_bandwidth){
        this.setState({
          titulo: "Error",
          body: "insufficient resources to cover this order try a lower value or try again later."
        })
  
        window.$("#mensaje-ebot").modal("show");
        return;
      }
    }

   

    this.setState({
      titulo: <>Confirm order information</>,
      body: (<span>
        <b>Buy: </b> {cantidad + " " + recurso + " " + periodo + temporalidad}<br></br>
        <b>For: </b> {pagas} TRX<br></br>
        <b>To: </b> {this.state.wallet_orden}<br></br>
        <br /><br />
        <button type="button" className="btn btn-danger" onClick={() => { window.$("#mensaje-ebot").modal("hide") }}>Cancel <i className="bi bi-x-circle"></i></button>
        {" "}
        <button type="button" className="btn btn-success" onClick={() => { this.compra(cantidad, periodo, temporalidad, recurso, wallet_orden, pagas) }}>Confirm <i className="bi bi-bag-check"></i></button>
      </span>)
    })

    window.$("#mensaje-ebot").modal("show");


  }

  async compra() {

    let {cantidad, periodo, temporalidad, recurso, wallet_orden, precio} = this.state

    const imgLoading = <img src="images/cargando.gif" height="20px" alt="loading..." />

    this.setState({
      titulo: <>Confirm transaction {imgLoading}</>,
      body: <>Please confirm the transaction from your wallet </>
    })

    window.$("#mensaje-ebot").modal("show");

    const unSignedTransaction = await this.props.tronWeb.transactionBuilder.sendTrx(process.env.REACT_APP_WALLET_API, this.props.tronWeb.toSun(precio), this.props.accountAddress);
    // using adapter to sign the transaction
    const signedTransaction = await window.tronWeb.trx.sign(unSignedTransaction)
      .catch((e) => {
        this.setState({
          ModalTitulo: "Transaction failed",
          ModalBody: <>{e.toString()}
            <br /><br />
            <button type="button" className="btn btn-danger" onClick={() => { window.$("#mensaje-brst").modal("hide") }}>Close</button>
          </>
        })

        window.$("#mensaje-brst").modal("show");
        return false;
      })

    if (!signedTransaction) { return false; }

    this.setState({
      titulo: <>Your order is being processed {imgLoading}</>,
      body: "Wait while one of our robots attends to your recharge, we try to be as fast as possible."
    })

    let consulta2 = await utils.renResource(wallet_orden,recurso,cantidad,periodo,temporalidad,precio,signedTransaction) ;

    if (consulta2.result) {

      this.setState({
        titulo: "Completed successfully",
        body: <>Energy rental completed successfully.<br /><br /> <button type="button" data-bs-dismiss="modal" className="btn btn-success">Thank you!</button></>
      })

      window.$("#mensaje-ebot").modal("show");

    } else {

      console.log(consulta2)

      this.setState({
        titulo: "Contact support",
        body: "Please contact support for: " + consulta2.hash + " | " + consulta2.msg
      })

      window.$("#mensaje-ebot").modal("show");

    }

  }

  render() {
    let {unitEnergyPrice, amounts, recurso} = this.state
    const amountButtons = amounts.map(amounts => <button key={"Amb-" + amounts.text} id="ra1" type="button" className="btn btn-primary"
      style={{ margin: "auto" }} onClick={() => { document.getElementById("amount").value = amounts.amount; this.setState({cantidad:amounts.amount}); this.estado()}}>{amounts.text}</button>)

    let texto = <>Bandwidth Pool: {(this.state.available_bandwidth).toLocaleString('en-US')}</>
    let porcentaje = this.state.available_bandwidth * 100 / this.state.total_bandwidth_pool

    if (recurso === "energy") {
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
                            <li onClick={async () => {
                              await this.setState({ 
                                cantidad: 32000,
                                recurso: "energy", 
                                amounts: amountsE 
                              });
                              document.getElementById("amount").value = 32000

                              await this.estado();

                            }}>
                              <button className="dropdown-item" >Energy</button>
                              </li>

                            <li onClick={async () => {
                              await this.setState({
                                cantidad: 1000,
                                recurso: "bandwidth",
                                amounts: amountB
                              });
                              document.getElementById("amount").value = 1000                              
                              await this.estado();

                            }}>
                              <button className="dropdown-item" >Bandwidth</button>
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
                        <input style={{ "textAlign": "end" }} id="amount" name="dzLastName" type="text" onChange={()=>this.calcularRecurso()} className="form-control mb-1" placeholder={this.state.montoMin} />

                      </div>

                      <div className="col-xl-12 mb-3 mb-md-4">
                        <div className="d-flex justify-content-xl-center">
                          {amountButtons}
                        </div>
                      </div>
                      <div className="col-12 mb-3 d-flex justify-content-center align-items-center">
                        <p style={{ "marginTop": "auto", "marginRight": "10px" }} className="font-14">Duration</p>

                        <input style={{ "textAlign": "end" }} id="periodo" required type="text" className="form-control mb-1" onChange={this.handleChangePeriodo} placeholder={"Default: 5m (five minutes)"} defaultValue="5min" />

                      </div>
                      <div className="col-12 ">
                        <div className="d-flex justify-content-xl-center">
                        <button type="button" className="btn btn-primary"
                            style={{ margin: "auto" }} onClick={() => { document.getElementById("periodo").value = "5m"; this.handleChangePeriodo({ target: { value: "5m" } }) }}>5m</button>
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
                          className="form-control" placeholder={this.props.accountAddress}  onChange={this.handleChangeWallet} />
                      </div>

                      <div className="col-xl-12 mb-3 mb-md-4">
                        <p className="font-14">UE: {unitEnergyPrice.toString(10)}</p>

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
              <p className="font-20">In Brutus Energy Bot, we've developed a DApp for a faster and secure resource rental experience on the Tron network. <br></br> <br></br> Innovatively simplifying the process, we ensure efficient management at competitive prices. Explore further through our <a href="https://t.me/BRUTUS_energy_bot">Telegram bot</a> or API for added accessibility. <br></br> <br></br>For additional information, reach out to us at <a href="mailto:support@brutus.finance">support@brutus.finance</a></p>
            </div>

            <div className="widget widget_about">
              <div className="widget widget_getintuch">
              </div>
            </div>
            <div className="social-box dz-social-icon style-3">
            </div>
          </div>
        </div>

        <div className="col-lg-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Smart Contracts </h4>
            </div>
            <div className="card-body">
              <p>
                <b>rental operator:</b> <a target="_blank" rel="noopener noreferrer" href={"https://tronscan.org/#/contract/"+process.env.REACT_APP_WALLET_API+"/code"}>{process.env.REACT_APP_WALLET_API}</a>
              </p>
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
