import React, { Component } from "react";

function delay(s) { return new Promise(res => setTimeout(res, s * 1000)); }

function getRandomInt(max) {return Math.floor(Math.random() * max);}

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
      amounts: [
        { amount: 32000, text: "32k" },
        { amount: 100000, text: "100k" },
        { amount: 160000, text: "160k" },
        { amount: 1000000, text: "1M" },
        { amount: 3000000, text: "3M" }
      ],

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
    let dato = event.target.value;
    let tmp = "d"

    if (dato.split("h").length > 1 || dato.split("H").length > 1 || dato.split("hora").length > 1 || dato.split("Hora").length > 1) {
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
    var url = "https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL + "available"
    var consulta = await fetch(url)
    consulta = (await consulta.json())

    var band = 0
    var energi = 0

    if (this.state.periodo > 3 && this.state.temporalidad === "d") {
      band = consulta["BANDWIDTH_-_Rental_duration_more_than_3_days"]
      energi = consulta["ENERGY_-_Rental_duration_more_than_3_days"]
    } else {
      band = consulta["BANDWIDTH_-_Rental_duration_less_or_equal_to_3_days"]
      energi = consulta["ENERGY_-_Rental_duration_less_or_equal_to_3_days"]
    }


    this.setState({
      available_bandwidth: band,
      available_energy: energi,
      total_bandwidth_pool: consulta.total_bandwidth_pool,
      total_energy_pool: consulta.total_energy_pool
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
          titulo: "Error Range",
          body: "Please enter a range of values between 1 hour and 14 days"
        })

        ok = false;

        window.$("#mensaje-ebot").modal("show");
      }
    } else {

      if (parseInt(time[0]) !== 1) {
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
        precio: "Calculating..."
      })

      var consulta2 = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      consulta2 = (await consulta2.json())
      console.log(consulta2)

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
    await this.calcularRecurso(this.state.cantidad, this.state.periodo + this.state.temporalidad)

    if (this.state.wallet_orden === "" || !window.tronWeb.isAddress(this.state.wallet_orden)) {
      this.setState({
        wallet_orden: this.props.accountAddress
      })
    }

    this.setState({
      titulo: <>Confirm order information</>,
      body: (<span>
        <b>Buy: </b> {this.state.cantidad + " "+this.state.recurso+" " + this.state.periodo + this.state.temporalidad}<br></br>
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

    if (this.state.wallet_orden === "" || !window.tronWeb.isAddress(this.state.wallet_orden)) {
      this.setState({
        wallet_orden: this.props.accountAddress
      })
    }

    this.setState({
      titulo: <>Confirm transaction {imgLoading}</>,
      body: <>Please confirm the transaction from your wallet </>
    })

    window.$("#mensaje-ebot").modal("show");

    var hash = await window.tronWeb.trx.sendTransaction(process.env.REACT_APP_WALLET_API, window.tronWeb.toSun(this.state.precio))
    .catch((e)=>{
      console.log(e)
      return ["e",e];
    })

    if(hash[0] === "e"){
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

    if (hash.result && envio.amount + "" === window.tronWeb.toSun(this.state.precio) && window.tronWeb.address.fromHex(envio.to_address) === process.env.REACT_APP_WALLET_API) {

      hash = await window.tronWeb.trx.getTransaction(hash.txid);
      
      if (hash.ret[0].contractRet === "SUCCESS" ) {

        var recurso = this.state.recurso

        this.setState({
          titulo: <>we are allocating your {recurso} {imgLoading}</>,
          body: "Please do not close or leave the page as this will cause an error in the "+recurso+" allocation."
        })
    
        window.$("#mensaje-ebot").modal("show");

        

        if(recurso === "bandwidth" ){
          recurso = "band"
        }

        var url = "https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL + recurso

        var time = this.state.periodo 

        if(this.state.temporalidad === "h"){
          time = this.state.periodo + this.state.temporalidad
        }

        var body = {
          "id_api": process.env.REACT_APP_USER_ID,
          "wallet": this.state.wallet_orden,
          "amount": this.state.cantidad,
          "time": time,
          "user_id": "fromWeb"+getRandomInt(999)
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

        console.log(consulta2)

        if (consulta2.response === 1) {

          this.setState({
            titulo: "Completed successfully",
            body: <><p>Energy rental completed successfully. </p><button type="button" data-bs-dismiss="modal" className="btn btn-success">Thank you!</button></>
          })

          window.$("#mensaje-ebot").modal("show");

        } else {

          this.setState({
            titulo: "Contact support",
            body: "Please contact support for: " + hash.txID + " | "+consulta2.msg
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

    let medidor = (<><p className="font-14">Bandwidth: {(this.state.available_bandwidth).toLocaleString('en-US')}</p>
    <div className="progress" style={{ margin: "5px" }}>
      <div className="progress-bar" role="progressbar" style={{ "width": (this.state.available_bandwidth * 100 / this.state.total_bandwidth_pool) + "%" }}
        aria-valuenow={(this.state.available_bandwidth * 100 / this.state.total_bandwidth_pool)} aria-valuemin="0" aria-valuemax="100">
      </div>
    </div></>)

    if(this.state.recurso === "energy"){
      medidor = (<><p className="font-14">Energy: {(this.state.available_energy).toLocaleString('en-US')}</p>
      <div className="progress" style={{ margin: "5px" }}>
        <div className="progress-bar" role="progressbar" style={{ "width": (this.state.available_energy * 100 / this.state.total_energy_pool) + "%" }}
          aria-valuenow={(this.state.available_energy * 100 / this.state.total_energy_pool)} aria-valuemin="0" aria-valuemax="100">
        </div>
      </div></>)
    }

    return (<>

      <div className="row ">
        <div className="col-lg-6 col-sm-12 m-b30">
          <div className="info-box text-center">
            <img src="images/ebot.png" width="170px" className="figure-img img-fluid rounded" alt="resource rental energy" />

            <div className="info">
              <h1>Brutus Resources rental </h1>
              <p className="font-20">In Brutus Energy Bot, we've developed a DApp that provides you
                with a faster, more convenient, and secure experience. This DApp represents an
                innovative third way to access Brutus's resources on the Tron network. Our
                application is designed to simplify the energy rental process, ensuring
                efficient resource management at competitive prices.</p>
            </div>

            <div className="widget widget_about">
              <div className="widget widget_getintuch">
              </div>
            </div>
            <div className="social-box dz-social-icon style-3">
            </div>
          </div>
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
                            <li><button className="dropdown-item" onClick={() => { this.setState({ recurso: "energy" }) }}>Energy</button></li>
                            <li><button className="dropdown-item" onClick={() => {
                              this.setState({
                                recurso: "bandwidth",
                                amounts: [
                                  { amount: 1000, text: "1k" },
                                  { amount: 2000, text: "2k" },
                                  { amount: 5000, text: "5k" },
                                  { amount: 10000, text: "10k" },
                                  { amount: 50000, text: "50k" }
                                ]
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
                      
                      <p className="font-14">Resource amount</p>
                      <div className="col-xl-12 mb-3 mb-md-4">
                        <input id="amount" name="dzLastName" type="text" onChange={this.handleChangeEnergy} className="form-control mb-1" placeholder="32000" />
                        <div className="d-flex justify-content-xl-center">
                          {amountButtons}
                        </div>
                      </div>
                      <p className="font-14">Duration</p>
                      <div className="col-xl-12 mb-3 mb-md-4">
                        <input id="periodo" required type="text" className="form-control mb-1" onChange={this.handleChangePeriodo} placeholder={"Default: 1h (one hour)"} defaultValue="1h" />
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
                      
                      <div className="col-12 mb-3 d-flex justify-content-center align-items-center">
                        <p style={{ width: "33%",color:"black" }} className="font-14">Price</p>
                        
                        <input style={{ width: "67%" }}  name="dzPhoneNumber" placeholder={"Calculating..."} value={this.state.precio} type="text" className="form-control" readOnly />
                        
                        <div className="d-flex justify-content-xl-center">
                          <button name="submit" type="button" value="Submit"
                          className="btn btn-secondary"
                          style={{ margin: "10px", width: "200px", height: "45px" }} onClick={() => this.preCompra()}>Buy Now
                          </button>
                        </div>
                      </div>
                      
                      <p className="font-14">Send resources for another wallet</p>
                      <div className="col-xl-12 mb-3 mb-md-4">
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
