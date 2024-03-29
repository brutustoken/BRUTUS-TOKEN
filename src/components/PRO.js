import React, { Component } from "react";
import cons from "../cons.js";
const BigNumber = require('bignumber.js');

function delay(s) { return new Promise(res => setTimeout(res, s * 1000)); }

export default class ProviderPanel extends Component {

  constructor(props) {
    super(props);

    this.state = {

      provider: false,
      rent: false,
      sellband: false,
      bandover: "Loading...",
      burn: false,
      autofreeze: false,
      paymenthour: "Loading...",
      maxdays: "Loading...",
      ongoins: [],
      nexpayment: "Loading..."


    };

    this.estado = this.estado.bind(this);
    this.handleChange = this.handleChange.bind(this);

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

      console.log(ongoins)

      const ordenesActivas = ongoins.map((item, index) => (
        <tr key={index}>
          <td>{item.amount} {item.resource} / {item.order_type}</td>
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
                <button className="dropdown-item text-danger" >Cancel</button>
              </div>
            </div>
          </td>
        </tr>
      ));




      this.setState({
        provider: true,
        rent: info.activo,
        sellband: info.sellband,
        bandover: info.bandover,
        burn: info.burn,
        autofreeze: false,
        payhour: info.payhour,
        payment: info.payment,
        maxdays: info.maxdays,
        ongoins: ordenesActivas,
        payhere: info.payhere,
      })
    } else {
      this.setState({
        provider: false
      })
    }

  }



  render() {





    if (this.state.provider) {



      return (<>

        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-8">
                  <div className="card exchange">
                    <div className="card-header d-block">
                      <h2 className="heading">Status</h2>

                      <div className="container-fluid">
                        <div className="row">
                          <div className="col-lg-6 col-sm-6 form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="rent" checked={this.state.rent} onChange={this.handleChange} />
                            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Rent</label>
                          </div>
                          <div className="col-lg-6 col-sm-6 form-check form-switch" title={this.state.bandover}>
                            <input className="form-check-input" type="checkbox" id="band" checked={this.state.sellband} onChange={this.handleChange} />
                            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Sell Band</label>
                          </div>

                          <div className="col-lg-6 col-sm-6 form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="burn" checked={this.state.burn} onChange={this.handleChange} />
                            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Burn</label>
                          </div>

                          <div className="col-lg-6 col-sm-6 form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="autofreeze" checked={this.state.autofreeze} onChange={this.handleChange} />
                            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Autofreeze</label>
                          </div>


                        </div>
                      </div>
                      <br />

                      <div className="dropdown">
                        <button type="button" className="btn btn-primary mb-1 dropdown-toggle" data-bs-toggle="dropdown" id="menu1" >Payment hour: {this.state.payhour}</button> {"  "}
                        <div className="dropdown-menu" aria-labelledby="menu1">
                          <button className="dropdown-item" >9:30 GMT</button>
                          <button className="dropdown-item" >17:30 Gmt</button>
                          <button className="dropdown-item" >1:30 Gmt</button>
                        </div>
                      </div>
                      <div className="dropdown">

                        <button type="button" className="btn btn-primary mb-1 dropdown-toggle" data-bs-toggle="dropdown" id="menu2">Max Days: {this.state.maxdays}</button>
                        <div className="dropdown-menu" aria-labelledby="menu2">
                          <button className="dropdown-item" >1h</button>
                          <button className="dropdown-item" >3 days</button>
                          <button className="dropdown-item" >7 days</button>
                          <button className="dropdown-item" >14 days</button>
                        </div>
                      </div>


                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card">
                    <div className="card-header border-0 pb-0">
                      <h2 className="heading mb-0 m-auto">Next Payment</h2>
                    </div>
                    <div className="card-body text-center pt-3">
                      <div className="mt-1">Hour {this.state.payhour} GMT</div>
                      <div className="count-num mt-1">{this.state.payment} TRX</div>
                      <div className="mt-1">sended to {this.state.payhere}</div>

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
                      <h4 className="card-title">Ongoing deals</h4>
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
