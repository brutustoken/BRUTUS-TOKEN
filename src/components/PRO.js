import React, { Component } from "react";
import cons from "../cons.js";
const BigNumber = require('bignumber.js');

//function delay(s) { return new Promise(res => setTimeout(res, s * 1000)); }

export default class ProviderPanel extends Component {

  constructor(props) {
    super(props);

    this.state = {

      provider: false,
      rent: false,
      elegible: false,
      sellband: false,
      bandover: "Loading...",
      burn: false,
      autofreeze: "off",
      paymenthour: "Loading...",
      maxdays: "Loading...",
      ongoins: [],
      nexpayment: "Loading...",
      payoutRatio: 0,
      ratioEnergy: 0,
      ratioEnergyPool: 0,

    };

    this.estado = this.estado.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setPaymentHour = this.setPaymentHour.bind(this);
    this.setMaxDays = this.setMaxDays.bind(this);
    this.setFreez = this.setFreez.bind(this);

  }

  componentDidMount() {
    document.title = "B.F | Provider Panel"
    document.getElementById("tittle").innerText = this.props.i18n.t("Provider Panel")

    setTimeout(() => {
      this.estado()
    }, 3 * 1000)

    setInterval(() => {
      this.estado()
    }, 10 * 1000)

  }


  async handleChange(event) {

    let elemento = event.target

    //console.log(elemento.id)

    switch (elemento.id) {
      case "rent":

        if (elemento.value !== this.state.rent) {
          //alert("diferentes: " + this.state.rent) //hace cambio

          let activate = 1
          if (this.state.rent) {
            activate = 0
          }
          // activar renta


          try {
            let body = { wallet: this.props.accountAddress, active: activate }
            fetch(cons.apiProviders + "set/active", {
              method: "POST",
              headers: {
                'token-api': process.env.REACT_APP_TOKEN,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(body)
            })


          } catch (error) {
            console.log(error.toString())
          }

          let value = false
          if (elemento.value === "true") {
            value = true
          }

          this.setState({
            rent: value
          })
        }


        break;

      case "band":

        if (elemento.value !== this.state.sellband) {
          //alert("diferentes: " + this.state.rent) //hace cambio

          let over = 0
          let activate = "0"
          if (!this.state.sellband) {
            activate = "1"
            over = parseInt(prompt("sell band over, leave ", this.state.bandover))

            console.log(over)
            let body = { wallet: this.props.accountAddress, sellbandover: over }

            fetch(cons.apiProviders + "set/sellbandover", {
              method: "POST",
              headers: {
                'token-api': process.env.REACT_APP_TOKEN,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(body)
            })

          }
          // activar renta

          try {
            let body = { wallet: this.props.accountAddress, sellband: activate }
            fetch(cons.apiProviders + "set/sellband", {
              method: "POST",
              headers: {
                'token-api': process.env.REACT_APP_TOKEN,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(body)
            })


          } catch (error) {
            console.log(error.toString())
          }

          let value = false
          if (elemento.value === "true") {
            value = true
          }

          this.setState({
            sellband: value
          })
        }


        break;

      case "burn":

        if (elemento.value !== this.state.burn) {
          //alert("diferentes: " + this.state.rent) //hace cambio

          let activate = "1"
          if (this.state.burn) {
            activate = "0"
          }
          // activar renta


          try {
            let body = { wallet: this.props.accountAddress, burn: activate }
            fetch(cons.apiProviders + "set/burn", {
              method: "POST",
              headers: {
                'token-api': process.env.REACT_APP_TOKEN,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(body)
            })


          } catch (error) {
            console.log(error.toString())
          }

          console.log(elemento.value)

          let value = false
          if (elemento.value === "true") {
            value = true
          }


          this.setState({
            burn: value
          })
        }


        break;


      default:
        break;
    }

    this.estado()

  }

  async setFreez(data) {
    try {
      let body = { wallet: this.props.accountAddress, autofreeze: data }
      await fetch(cons.apiProviders + "set/autofreeze", {
        method: "POST",
        headers: {
          'token-api': process.env.REACT_APP_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })


    } catch (error) {
      console.log(error.toString())
    }

    this.estado()

  }

  async setPaymentHour(hour) {

    try {
      let body = { wallet: this.props.accountAddress, paymenthour: hour }
      await fetch(cons.apiProviders + "set/paymenthour", {
        method: "POST",
        headers: {
          'token-api': process.env.REACT_APP_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })


    } catch (error) {
      console.log(error.toString())
    }

    this.estado()

  }

  async setMaxDays(days) {

    try {
      let body = { wallet: this.props.accountAddress, maxdays: days }
      await fetch(cons.apiProviders + "set/maxdays", {
        method: "POST",
        headers: {
          'token-api': process.env.REACT_APP_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })


    } catch (error) {
      console.log(error.toString())
    }

    this.estado()

  }

  async estado() {

    var url = cons.apiProviders;

    let provider = { result: false };

    try {
      provider = await fetch(url + "provider?wallet=" + this.props.accountAddress)
        .then((r) => {
          return r.json();
        })


    } catch (error) {
      console.log(error.toString())
    }



    if (provider.result) {

      let info = {}

      try {

        info = await fetch(url + "status?wallet=" + this.props.accountAddress)
          .then((r) => {
            return r.json();
          })
          .then((r) => {
            return r.data;
          })


      } catch (error) {
        console.log(error.toString())
      }

      let ongoins = []

      try {

        let body = { wallet: this.props.accountAddress }

        ongoins = await fetch(url + "ongoingdeals", {
          method: "POST",
          headers: {
            'token-api': process.env.REACT_APP_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        })
          .then((r) => {
            return r.json();
          })
          .then((r) => {
            return r.ongoing_deals;
          })



      } catch (error) {

      }

      console.log(info)

      //console.log(ongoins)

      const ordenesActivas = ongoins.map((item, index) => {

        let lock = "unlock"

        //console.log(((item.order_type).toLowerCase()).includes("day"))
        //console.log((item.order_type).toLowerCase())


        if (((item.order_type).toLowerCase()).includes("day")) {

          if (((item.order_type).toLowerCase()).includes("wol")) {
            lock = "unlock"
          } else {
            lock = "lock"
          }

          item.order_type = "DAY"


        } else {

          if (((item.order_type).toLowerCase()).includes("wol")) {
            lock = "unlock"
          } else {
            lock = "lock"
          }

        }



        return (
          <tr key={index}>
            <td>{(item.amount).toLocaleString('en-US')} {item.resource} / {item.order_type}</td>
            <td>{item.customer}<br />
              {item.confirm}{" -> "}{item.unfreeze}
            </td>
            <td>{item.payout} TRX</td>
            <td className="text-end">
              <div className="dropdown custom-dropdown mb-0">
                <i className={"bi bi-" + lock + "-fill"}></i>
              </div>
            </td>
          </tr>
        )
      });


      const ordenesNoregistradas = ongoins.map((item, index) => (
        <tr key={index}>
          <td>{(item.amount).toLocaleString('en-US')} {item.resource} / {item.order_type}</td>
          <td>{item.customer}<br />
            {item.confirm}{" -> "}{item.unfreeze}
          </td>
          <td>{item.payout} TRX</td>
          <td className="text-end">
            <div className="dropdown custom-dropdown mb-0">
              <div className="btn sharp btn-primary tp-btn" data-bs-toggle="dropdown">
                <i className="bi bi-three-dots-vertical"></i>
              </div>
              <div className="dropdown-menu dropdown-menu-end">
                <button className="dropdown-item text-info" >View on TronScan</button>

                <button className="dropdown-item text-danger" >Terminate Delegation</button>
              </div>
            </div>
          </td>
        </tr>
      ));



      let naranja = new BigNumber((info.ratio_e - info.ratio_e_pool) * 100).dp(3).toNumber()

      if (naranja >= 0) {
        naranja = "+" + naranja
      }

      info.freez = (info.freez).toLowerCase()

      if (info.freez === "no") {
        info.freez = "Off"

      }


      this.setState({
        provider: true,
        rent: info.activo,
        elegible: info.elegible,
        sellband: info.sellband,
        bandover: info.bandover,
        burn: info.burn,
        autofreeze: info.freez,
        payhour: info.payhour,
        payment: info.payment,
        maxdays: info.maxdays,
        ongoins: ordenesActivas,
        noregist: ordenesNoregistradas,
        payhere: info.payhere,
        payoutRatio: info.payout_ratio,
        ratioEnergy: new BigNumber(info.ratio_e * 100).dp(3).toString(10),
        ratioEnergyPool: new BigNumber(info.ratio_e_pool * 100).dp(3).toString(10),
        cNaranja: naranja

      })
    } else {
      this.setState({
        provider: false
      })
    }

  }



  render() {





    if (this.state.provider) {


      let estatus = <button className="btn btn-outline-danger" style={{ cursor: "default" }}>Stopped</button>

      if (this.state.rent) {

        estatus = <button className="btn btn-outline-info" style={{ cursor: "default" }}>Recharging</button>

        if (this.state.elegible) {
          estatus = <button className="btn btn-outline-success" style={{ cursor: "default" }}>Active</button>
        }

      }

      return (<>

        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-lg-8 col-sm-12">
                  <div className="card exchange">
                    <div className="card-header d-block">
                      <h2 className="heading">Status {estatus} <button type="button" className="btn btn-outline-warning"><img height="15px" src="images/naranja.png" alt="" /> {this.state.cNaranja} </button></h2>

                      <div className="container-fluid">
                        <div className="row">
                          <div className="col-lg-6 col-sm-6 form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="rent" checked={this.state.rent} onChange={this.handleChange} />
                            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Rent <i className="bi bi-question-circle-fill" title=""></i></label>
                          </div>
                          <div className="col-lg-6 col-sm-6 form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="burn" checked={this.state.burn} onChange={this.handleChange} />
                            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Burn <i className="bi bi-question-circle-fill" title=""></i></label>
                          </div>
                          <div className="col-lg-12 col-sm-12 form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="band" checked={this.state.sellband} onChange={this.handleChange} />
                            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Sell Band over: {this.state.bandover} <i className="bi bi-question-circle-fill" title=""></i></label>
                          </div>


                        </div>

                        <div className="row">


                          <div className="col-lg-12 col-sm-12 mb-2">
                            <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" id="menu" >Autofreeze: {this.state.autofreeze}</button> {"  "} <i className="bi bi-question-circle-fill" title=""></i>
                            <div className="dropdown-menu" aria-labelledby="menu">
                              <button className="dropdown-item" onClick={() => this.setFreez("no")}>Off</button>
                              <button className="dropdown-item" onClick={() => this.setFreez("bandwidth")}>Bandwidth</button>
                              <button className="dropdown-item" onClick={() => this.setFreez("energy")}>Energy</button>
                            </div>
                          </div>



                          <div className="col-lg-12 col-sm-12 mb-2">
                            <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" id="menu2">Max Days: {this.state.maxdays}</button> <i className="bi bi-question-circle-fill" title=""></i>
                            <div className="dropdown-menu" aria-labelledby="menu2">
                              <button className="dropdown-item" onClick={() => this.setMaxDays('1h')}>1h</button>
                              <button className="dropdown-item" onClick={() => this.setMaxDays(3)} >3 days</button>
                              <button className="dropdown-item" onClick={() => this.setMaxDays(7)}>7 days</button>
                              <button className="dropdown-item" onClick={() => this.setMaxDays(14)}>14 days</button>
                            </div>
                          </div>

                          <div className="col-lg-12 col-sm-12">
                            <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" id="menu1" >Payment hour: {this.state.payhour}</button> {"  "} <i className="bi bi-question-circle-fill" title=""></i>
                            <div className="dropdown-menu" aria-labelledby="menu1">
                              <button className="dropdown-item" onClick={() => this.setPaymentHour("130")}>1:30 GMT</button>
                              <button className="dropdown-item" onClick={() => this.setPaymentHour("930")}>9:30 GMT</button>
                              <button className="dropdown-item" onClick={() => this.setPaymentHour("1730")}>17:30 GMT</button>
                            </div>
                          </div>


                        </div>
                      </div>



                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-sm-12">
                  <div className="card">
                    <div className="card-header border-0 pb-0">
                      <h2 className="heading mb-0 m-auto">Next Payment</h2>
                    </div>
                    <div className="card-body text-center pt-3">
                      <div className="mt-1">Hour {this.state.payhour} GMT</div>
                      <div className="count-num mt-1">{this.state.payment} TRX</div>
                      <div className="mt-1">that will be paid here <u>{this.state.payhere}</u></div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-12">
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h4 className="card-title">Ongoing deals ({this.state.ongoins.length})</h4>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive recentOrderTable">
                        <table className="table verticle-middle table-responsive-md">
                          <thead>
                            <tr>
                              <th scope="col">Resource / Period</th>
                              <th scope="col">Buyer / Time</th>
                              <th scope="col">Payout</th>
                              <th scope="col"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.ongoins}



                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h4 className="card-title">Others delegations </h4>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive recentOrderTable">
                        <table className="table verticle-middle table-responsive-md">
                          <thead>
                            <tr>
                              <th scope="col">Resource / Period</th>
                              <th scope="col">Buyer / Time</th>
                              <th scope="col">Payout</th>
                              <th scope="col"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.noregist}



                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="modal fade" id="alert">
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

      </>);
    } else {
      return (<>

        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-8">
                  <div className="card exchange">
                    <div className="card-header d-block">
                      <h2 className="heading">Status</h2>

                      <p>you are not a supplier, if you want to become one read the following <a href="https://brutus.finance/brutusprovider.html">article</a></p>


                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



      </>);
    }


  }
}
