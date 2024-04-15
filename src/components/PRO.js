import React, { Component } from "react";
import cons from "../cons.js";
import TronWeb from "tronweb";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

var moment = require('moment-timezone');
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
      paymentPoints: 0,
      voteSR: "",
      newVoteSR: "",
      proEnergyTotal: 0,
      proEnergy: 0,
      proBand: 0,
      proBandTotal: 0,
      noregist: [],
      historic: [],
      dataHistoric: [],
      alturaGrafico: "0px",
      tiempo: ""

    };

    this.estado = this.estado.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setPaymentHour = this.setPaymentHour.bind(this);
    this.setMaxDays = this.setMaxDays.bind(this);
    this.setFreez = this.setFreez.bind(this);
    this.setWalletSr = this.setWalletSr.bind(this);

    this.grafico = this.grafico.bind(this);

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

      case "voteSR":

        this.setState({
          newVoteSR: elemento.value
        })

        break;

      default:
        break;
    }

    this.estado()

  }

  async grafico(external_data) {

    if (this.root) {
      this.root.dispose();
    }
    const root = am5.Root.new("chartdiv");
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        layout: root.verticalLayout
      })
    );

    // Define data
    let data = [{
      date: new Date(1712953610 * 1000),
      amount: 1000,
      coin: "trx"
    }, {
      date: new Date(1712780810 * 1000),
      amount: 1300,
      coin: "trx"
    }, {
      date: new Date(1712694410 * 1000),
      amount: 1200,
      coin: "trx"
    },
    {
      date: new Date(1712694410 * 1000),
      amount: 250,
      coin: "brst"
    }, {
      date: new Date(1712521610 * 1000),
      amount: 200,
      coin: "brst"
    }, {
      date: new Date(1712435210 * 1000),
      amount: 500,
      coin: "brst"
    }];

    data = external_data

    // Create Y-axis
    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {}),
        categoryField: "date"
      })
    );
    xAxis.data.setAll(data);

    // Create series

    let series1 = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "TRX",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "amount",
        categoryXField: "date",
        fill: am5.color(0x7135ff),
        stroke: am5.color(0x7135ff)
      })
    );
    series1.data.setAll(data);


    // Create series
    /*
    let series2 = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Payed in BRST",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "date"
      })
    );
    series2.data.setAll(data);
*/

    // Add legend
    /*
    let legend = chart.children.push(am5.Legend.new(root, {}));
    legend.data.setAll(chart.series.values);
    */

    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {}));

    this.root = root;
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

  async setWalletSr(wallet) {

    try {
      let body = { wallet: this.props.accountAddress, sr: wallet }
      await fetch(cons.apiProviders + "set/sr", {
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



    this.setState({
      tiempo: moment.tz.guess(true)
    })

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

      this.setState({
        provider: true,
      })

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

      let naranja = new BigNumber((info.ratio_e - info.ratio_e_pool) * 100).dp(3).toNumber()

      if (naranja >= 0) {
        naranja = "+" + naranja
      }

      if (info.freez) {
        info.freez = (info.freez).toLowerCase()

      }

      if (info.freez === "no") {
        info.freez = "Off"

      }


      var cuenta = await this.props.tronWeb.trx.getAccountResources(this.props.accountAddress);


      var providerEnergy = 0
      var providerEnergyTotal = 0

      var providerBand = 0
      var providerBandTotal = 0


      if (cuenta.EnergyLimit) {
        providerEnergy = cuenta.EnergyLimit
        providerEnergyTotal = cuenta.EnergyLimit
      }

      if (cuenta.EnergyUsed) {
        providerEnergy -= cuenta.EnergyUsed
      }

      if (cuenta.freeNetLimit) {
        providerBandTotal = cuenta.freeNetLimit
      }

      if (cuenta.NetLimit) {
        providerBandTotal += cuenta.NetLimit
      }

      providerBand = providerBandTotal

      if (cuenta.freeNetUsed) {
        providerBand -= cuenta.freeNetUsed

      }

      if (cuenta.NetUsed) {
        providerBand -= cuenta.NetUsed
      }

      //console.log(info)

      this.setState({
        rent: info.activo,
        elegible: info.elegible,
        sellband: info.sellband,
        bandover: info.bandover,
        burn: info.burn,
        autofreeze: info.freez,
        payhour: info.payhour,
        payment: info.payment,
        paymentPoints: info.payout_ratio * 100,
        maxdays: info.maxdays,
        payhere: info.payhere,
        payoutRatio: info.payout_ratio,
        ratioEnergy: new BigNumber(info.ratio_e * 100).dp(3).toString(10),
        ratioEnergyPool: new BigNumber(info.ratio_e_pool * 100).dp(3).toString(10),
        cNaranja: naranja,
        voteSR: info.srVote,
        proEnergy: providerEnergy,
        proEnergyTotal: providerEnergyTotal,

        proBand: providerBand,
        proBandTotal: providerBandTotal,

      })

      let historic = {}
      try {

        historic = await fetch(url + "historic_payments", {
          method: "POST",
          headers: {
            'token-api': process.env.REACT_APP_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ wallet: this.props.accountAddress })

        }
        )
          .then((r) => {
            return r.json();
          })
          .then((r) => {
            return r.data;
          })


      } catch (error) {
        console.log(error.toString())
      }

      let dataHistoric = []

      historic = historic.toReversed().map((item, index) => {

        dataHistoric.unshift({ date: new Date(item.date * 1000), amount: new BigNumber(item.amount).shiftedBy(-6).dp(3).toNumber(), coin: item.coin })

        return (
          <div key={index}>
            {moment.utc(item.date * 1000).tz(this.state.tiempo).format("lll")} {"->"} {(new BigNumber(item.amount).shiftedBy(-6).dp(3).toNumber()).toLocaleString('en-US')} {item.coin}
          </div>
        )
      })


      this.setState({
        historic: historic,
        dataHistoric: dataHistoric
      })

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

      let listWallets = []


      const ordenesActivas = ongoins.map((item, index) => {

        listWallets.push(item.customer)

        let lock = "unlock"

        if (((item.order_type).toLowerCase()).includes("wol")) {
          lock = "unlock"
        } else {
          lock = "lock"
        }

        if (((item.order_type).toLowerCase()).includes("hour")) {
          item.order_type = "HOUR"

        }

        if (((item.order_type).toLowerCase()).includes("day")) {
          item.order_type = "DAY"

        }

        if (((item.order_type).toLowerCase()).includes("minutes")) {
          item.order_type = "MINUTES"

        }

        return (
          <tr key={index}>
            <td>{(item.amount).toLocaleString('en-US')} {item.resource} / {item.order_type} <i className={"bi bi-" + lock + "-fill"}></i></td>
            <td>{item.customer}<br />
              {moment.utc(item.confirm * 1000).tz(this.state.tiempo).format("lll")}{" -> "}{moment.utc(item.unfreeze * 1000).tz(this.state.tiempo).format("lll")}<br />

            </td>
            <td>{item.payout} TRX</td>
          </tr>
        )
      });


      const delegationInfo = await this.props.tronWeb.trx.getDelegatedResourceAccountIndexV2(this.props.accountAddress)

      //console.log(delegationInfo)

      let delegatedExternal = []

      if (delegationInfo.toAccounts) {

        for (let index = 0; index < delegationInfo.toAccounts.length; index++) {
          delegationInfo.toAccounts[index] = this.props.tronWeb.address.fromHex(delegationInfo.toAccounts[index])

          if (listWallets.indexOf(delegationInfo.toAccounts[index]) === -1) {
            let info = await this.props.tronWeb.trx.getDelegatedResourceV2(this.props.accountAddress, delegationInfo.toAccounts[index])

            //console.log(info.delegatedResource)

            for (let index2 = 0; index2 < info.delegatedResource.length; index2++) {

              let order = {
                wallet: delegationInfo.toAccounts[index],
                resource: "ENERGY",
                trx: 0,
                sun: "0",
                expire: "--/--/-- 00:00 --"
              }

              if (info.delegatedResource[index2].frozen_balance_for_energy) {

                order.trx = info.delegatedResource[index2].frozen_balance_for_energy / 10 ** 6
                order.sun = info.delegatedResource[index2].frozen_balance_for_energy
                if (info.delegatedResource[index2].expire_time_for_energy) {
                  order.expire = new Date(info.delegatedResource[index2].expire_time_for_energy)
                  order.expire = moment.utc(order.expire).tz(this.state.tiempo).format("lll")
                }
              } else {
                order.trx = info.delegatedResource[index2].frozen_balance_for_bandwidth / 10 ** 6
                order.sun = info.delegatedResource[index2].frozen_balance_for_bandwidth
                if (info.delegatedResource[index2].expire_time_for_bandwidth) {
                  order.expire = new Date(info.delegatedResource[index2].expire_time_for_bandwidth)
                  order.expire = moment.utc(order.expire).tz(this.state.tiempo).format("lll")

                }


                order.resource = "BANDWIDTH"
              }


              delegatedExternal.push(order)


            }

          }

        }

      }

      const ordenesNoregistradas = delegatedExternal.map((item, index) => {


        let amount = item.sun;
        let receiverAddress = item.wallet
        let resource = item.resource
        let ownerAddress = this.props.accountAddress

        return (
          <tr key={index}>
            <td className="text-end">
              <div className="dropdown custom-dropdown mb-0">
                <div className="btn sharp btn-primary tp-btn" data-bs-toggle="dropdown">
                  <i className="bi bi-three-dots-vertical"></i>
                </div>
                <div className="dropdown-menu dropdown-menu-end">
                  <a className="dropdown-item text-info" href="https://tronscan.org/#/wallet/resources" >View on TronScan</a>

                  <button className="dropdown-item text-danger" onClick={async () => {
                    let transaction = await this.props.tronWeb.transactionBuilder.undelegateResource(amount, receiverAddress, resource, ownerAddress);
                    transaction = await this.props.tronWeb.trx.sign(transaction)
                    transaction = await this.props.tronWeb.trx.sendRawTransaction(transaction)

                    this.setState({
                      ModalTitulo: "Result: " + transaction.result,
                      ModalBody: <a href={"https://tronscan.org/#/transaction/" + transaction.txid}>see result in TronScan</a>
                    })

                    window.$("#alert").modal("show");

                  }}>Reclaim Resource</button>
                </div>
              </div>
            </td>
            <td>{item.resource} </td>
            <td>{(item.trx).toLocaleString('en-US')} </td>

            <td>{item.wallet}<br />
              {item.expire}
            </td>

          </tr>
        )



      })




      this.setState({
        ongoins: ordenesActivas,
        noregist: ordenesNoregistradas,
      })
    } else {
      this.setState({
        provider: false
      })
    }

  }



  render() {

    if (this.state.provider) {


      let estatus = <button className="btn btn-outline-danger btn-block" style={{ cursor: "default", maxHeight: "36.55px", fontSize: "12px" }}><i className="bi bi-sign-stop-fill"></i> Stopped</button>

      if (this.state.rent) {

        estatus = <button className="btn btn-outline-info btn-block" style={{ cursor: "default", maxHeight: "36.55px", fontSize: "12px" }}><i className="bi bi-arrow-clockwise"></i> Recharging</button>

        if (this.state.elegible) {
          estatus = <button className="btn btn-outline-success btn-block" style={{ cursor: "default", maxHeight: "36.55px", fontSize: "12px" }}><i className="bi bi-check-circle-fill"></i> Active</button>
        }

      }


      let campoFreeze = <></>

      if (this.state.autofreeze !== "Off") {

        campoFreeze = <div className="container">
          <div className="row">
            <div className="col-11">
              <input type="text" className="form-control" id="voteSR" placeholder={this.state.voteSR} onChange={this.handleChange} disabled={false} />
            </div>
            <div className="col-1">
              <i className="bi bi-question-circle-fill" title="You can set by which super representative wallet the automatic votes will be made" onClick={() => {

                this.setState({
                  ModalTitulo: "Info",
                  ModalBody: "You can set by which super representative wallet the automatic votes will be made"
                })

                window.$("#alert").modal("show");
              }}></i>
            </div>
          </div>
        </div>


        if (this.state.voteSR !== "" && TronWeb.isAddress(this.state.newVoteSR) && this.state.voteSR !== this.state.newVoteSR) {

          campoFreeze = (<>
            {campoFreeze}
            <button className="btn btn-outline-secondary" type="button" onClick={() => {
              this.setWalletSr(this.state.newVoteSR)
            }}>Update Wallet to Vote</button>

          </>)

        }







      }

      let historial = this.state.historic;

      if (this.state.alturaGrafico !== "0px") {
        historial = <></>
      }

      return (<>

        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-lg-8 col-sm-12">
                  <div className="card exchange">
                    <div className="card-header d-block">


                      <div className="container-fluid">
                        <div className="row">
                          <div className="col-lg-12 col-sm-12 mb-2">
                            <h2 className="heading">Status </h2>

                          </div>
                          <div className="col-lg-4 col-sm-12 mb-2">
                            <h2 className="heading">{estatus} </h2>
                          </div>
                          <div className="col-lg-4 col-sm-12 mb-2">
                            <h2 className="heading"><button type="button" className="btn btn-outline-warning btn-block" style={{ cursor: "default", maxHeight: "36.55px", fontSize: "12px" }}><img height="15px" src="images/naranja.png" alt="" /> {this.state.ratioEnergy} /  {this.state.ratioEnergyPool} </button></h2>
                          </div>
                          <div className="col-lg-4 col-sm-12 mb-2">
                            <h2 className="heading"><button className="btn btn-outline-secondary btn-block" style={{ cursor: "default", maxHeight: "36.55px", fontSize: "12px" }}> <span role="img" aria-label="$">💲</span> Payout %{this.state.paymentPoints} </button></h2>

                          </div>
                          <div className="col-lg-6 col-sm-12 mb-2">
                            Energy ({(this.state.proEnergy).toLocaleString('en-US')}/{(this.state.proEnergyTotal).toLocaleString("en-us")}) <img height="15px" src="images/energy.png" alt="" />
                            <div className="progress" style={{ margin: "5px", backgroundColor: "lightgray" }}>
                              <div className="progress-bar bg-warning" role="progressbar" style={{ "width": ((this.state.proEnergy / this.state.proEnergyTotal) * 100) + "%" }}
                                aria-valuenow={(this.state.proEnergy / this.state.proEnergyTotal) * 100} aria-valuemin="0" aria-valuemax="100">
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-6 col-sm-12 mb-2">
                            Bandwidth ({(this.state.proBand).toLocaleString("en-us")}/{(this.state.proBandTotal).toLocaleString("en-us")}) 🌐
                            <div className="progress" style={{ margin: "5px", backgroundColor: "lightgray" }}>
                              <div className="progress-bar bg-info" role="progressbar" style={{ "width": ((this.state.proBand / this.state.proBandTotal) * 100) + "%" }}
                                aria-valuenow={(this.state.proBand / this.state.proBandTotal) * 100} aria-valuemin="0" aria-valuemax="100">
                              </div>
                            </div>
                          </div>



                          <div className="col-lg-3 col-sm-6 form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="rent" checked={this.state.rent} onChange={this.handleChange} />
                            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Rent <i className="bi bi-question-circle-fill" title="Pause/Resume the bot" onClick={() => {

                              this.setState({
                                ModalTitulo: "Info",
                                ModalBody: "Pause/Resume the bot"
                              })

                              window.$("#alert").modal("show");
                            }}></i></label>
                          </div>
                          <div className="col-lg-3 col-sm-6 form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="burn" checked={this.state.burn} onChange={this.handleChange} />
                            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Burn <i className="bi bi-question-circle-fill" title="Allow TRX burn to accept new orders when you run out of bandwidth" onClick={() => {

                              this.setState({
                                ModalTitulo: "Info",
                                ModalBody: "Allow TRX burn to accept new orders when you run out of bandwidth"
                              })

                              window.$("#alert").modal("show");
                            }}></i></label>
                          </div>
                          <div className="col-lg-6 col-sm-12 form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="band" checked={this.state.sellband} onChange={this.handleChange} />
                            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Sell Band over: {(this.state.bandover).toLocaleString("en-us")} <i className="bi bi-question-circle-fill" title="Sell your staked bandwidth over the amount you establish" onClick={() => {

                              this.setState({
                                ModalTitulo: "Info",
                                ModalBody: "Sell your staked bandwidth over the amount you establish"
                              })

                              window.$("#alert").modal("show");
                            }}></i></label>
                          </div>


                        </div>

                        <div className="row mt-3">

                          <div className="col-lg-6 col-md-12 mb-2">
                            <button type="button" className="btn btn-primary dropdown-toggle " style={{ width: "90%" }} data-bs-toggle="dropdown" id="menu1" >Payment hour: {this.state.payhour} GMT</button> {"  "} <i className="bi bi-question-circle-fill" title="Set the time you want to receive your daily payments" onClick={() => {

                              this.setState({
                                ModalTitulo: "Info",
                                ModalBody: "Set the time you want to receive your daily payments"
                              })

                              window.$("#alert").modal("show");
                            }}></i>
                            <div className="dropdown-menu" aria-labelledby="menu1">
                              <button className="dropdown-item" onClick={() => this.setPaymentHour("130")}>1:30 GMT</button>
                              <button className="dropdown-item" onClick={() => this.setPaymentHour("930")}>9:30 GMT</button>
                              <button className="dropdown-item" onClick={() => this.setPaymentHour("1730")}>17:30 GMT</button>
                            </div>
                          </div>

                          <div className="col-lg-6 col-md-12 mb-2">
                            <button type="button" className="btn btn-primary dropdown-toggle" style={{ width: "90%" }} data-bs-toggle="dropdown" id="menu2">Max Days: {this.state.maxdays}</button> <i className="bi bi-question-circle-fill" title="Establish the max. duration of the orders you want to accept" onClick={() => {

                              this.setState({
                                ModalTitulo: "Info",
                                ModalBody: "Establish the max. duration of the orders you want to accept"
                              })

                              window.$("#alert").modal("show");
                            }}></i>
                            <div className="dropdown-menu" aria-labelledby="menu2">
                              <button className="dropdown-item" onClick={() => this.setMaxDays('1h')}>1h</button>
                              <button className="dropdown-item" onClick={() => this.setMaxDays(3)} >3 days</button>
                              <button className="dropdown-item" onClick={() => this.setMaxDays(7)}>7 days</button>
                              <button className="dropdown-item" onClick={() => this.setMaxDays(14)}>14 days</button>
                            </div>
                          </div>


                          <div className="col-lg-12 col-sm-12 mb-2">
                            <button type="button" className="btn btn-primary dropdown-toggle" style={{ width: "95.33%" }} data-bs-toggle="dropdown" id="menu" >Autofreeze: {this.state.autofreeze}</button> {"  "} <i className="bi bi-question-circle-fill" title="Let the bot freeze the remaining TRX in your wallet (leaving 100 TRX unfrozen)" onClick={() => {

                              this.setState({
                                ModalTitulo: "Info",
                                ModalBody: "Let the bot freeze the remaining TRX in your wallet (leaving 100 TRX unfrozen)"
                              })

                              window.$("#alert").modal("show");
                            }}></i>
                            <div className="dropdown-menu" aria-labelledby="menu">
                              <button className="dropdown-item" onClick={() => this.setFreez("no")}>Off</button>
                              <button className="dropdown-item" onClick={() => this.setFreez("bandwidth")}>Bandwidth</button>
                              <button className="dropdown-item" onClick={() => this.setFreez("energy")}>Energy</button>
                            </div>
                          </div>

                          <div className="col-lg-12 col-sm-12 mb-2">
                            {campoFreeze}
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
                      <div className="count-num mt-1">{(this.state.payment).toLocaleString("en-US")} TRX</div>
                      <div className="mt-1">that will be paid here <u>{this.state.payhere}</u></div>
                      <div className="mb-3" id="chartdiv" style={{ height: this.state.alturaGrafico, backgroundColor: "white" }}></div>
                      <button className="btn btn-success" onClick={() => { if (this.state.alturaGrafico === "0px") { this.setState({ alturaGrafico: "400px" }); this.grafico(this.state.dataHistoric) } else { this.setState({ alturaGrafico: "0px" }); this.root.dispose(); } }}>Graphic (Open / Close)</button>
                      {historial}

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
                      <div className="table-responsive recentOrderTable overflow-scroll" style={{ height: "350px" }}>
                        <table className="table verticle-middle table-responsive-md " >
                          <thead>
                            <tr>
                              <th scope="col">Resource / Period</th>
                              <th scope="col">Buyer / Time</th>
                              <th scope="col">Payout</th>
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
                      <h4 className="card-title">Other delegations ({this.state.noregist.length})</h4>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive recentOrderTable overflow-scroll" style={{ height: "350px" }}>
                        <table className="table verticle-middle table-responsive-md">
                          <thead>
                            <tr>
                              <th scope="col"></th>

                              <th scope="col">Resource</th>
                              <th scope="col">TRX</th>
                              <th scope="col">Wallet / Expire Time</th>
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
        </div >

        <div className="modal fade" id="alert">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{this.state.ModalTitulo}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal">
                </button>
              </div>
              <div className="modal-body">
                <p>{this.state.ModalBody}</p>
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
                <div className="col-12">
                  <div className="card exchange">
                    <div className="card-header d-block">
                      <h2 className="heading">Status</h2>

                      <p>you are not a supplier, if you want to become one read the following <a className="btn btn-primary" href="https://brutus.finance/brutusprovider.html">article</a></p>


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
