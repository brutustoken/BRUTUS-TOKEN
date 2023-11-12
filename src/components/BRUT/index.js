import React, { Component } from "react";

import cons from "../../cons.js";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const options = [
  {
    label: "Hours",
    value: "hour",
  },
  {
    label: "Daily",
    value: "day",
  },
  {
    label: "Weekly",
    value: "week",
  },
  {
    label: "Monthly",
    value: "month",
  },
];

const options2 = [
  {
    label: "Last 7 days",
    value: "7",
  },
  {
    label: "Last 30 days",
    value: "30",
  },
  {
    label: "Last 90 days",
    value: "90",
  },
  {
    label: "Last 180 days",
    value: "180",
  },
  {
    label: "All data",
    value: "0",
  },
];

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {

      minCompra: 10,
      minventa: 1,
      deposito: "Loading...",
      wallet: "Loading...",
      valueBRUT: "",
      valueUSDT: "",
      value: "",
      cantidad: 0,
      tiempo: 0,
      enBrutus: 0,
      tokensEmitidos: 0,
      totalCirculando: 0,
      enPool: 0,
      solicitado: 0,
      data: [],
      temporalidad: "day",
      cantidadDatos: 30,
      cambio24h: 0,

    };

    this.grafico = this.grafico.bind(this);

    this.compra = this.compra.bind(this);
    this.venta = this.venta.bind(this);

    this.estado = this.estado.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleChange2 = this.handleChange2.bind(this);

    this.handleChangeBRUT = this.handleChangeBRUT.bind(this);
    this.handleChangeUSDT = this.handleChangeUSDT.bind(this);
    this.consultarPrecio = this.consultarPrecio.bind(this);

  }

  componentDidMount() {
    document.title = "B.F | BRUT"
    this.grafico(1000, "day", 30);
    this.consultarPrecio();

    setTimeout(() => {
      this.estado();

    }, 3 * 1000);

    /*
    setInterval(() => {
      this.root.dispose();
      this.grafico(0);
    }, 60 * 1000);
    */
  }

  handleChange(e) {
    let evento = e.target.value;
    this.grafico(500, evento, this.state.cantidadDatos);
    this.setState({ temporalidad: evento });
  }

  handleChange2(e) {
    let evento = e.target.value;
    this.grafico(500, this.state.temporalidad, evento);
    this.setState({ cantidadDatos: evento });
  }

  async handleChangeBRUT(event) {
    this.consultarPrecio();
    await this.setState({ valueBRUT: event.target.value });

    this.setState({ valueUSDT: parseFloat((this.state.valueBRUT * this.state.precioBRUT).toPrecision(8)) });

  }

  async handleChangeUSDT(event) {
    this.consultarPrecio();

    await this.setState({ valueUSDT: event.target.value });

    this.setState({ valueBRUT: parseFloat((this.state.valueUSDT / this.state.precioBRUT).toPrecision(8)) });


  }

  async consultarPrecio() {

    var proxyUrl = cons.proxy;
    var apiUrl = cons.PRICE;

    var response;
    var cambio = 0;

    let precio;
    try {
      response = await fetch(proxyUrl + apiUrl).then((res) => { return res.json() }).catch(error => { console.error(error) })
      precio = response.Data.usd;
      cambio = response.Data.v24h

    } catch (err) {
      console.log(err);
      precio = this.state.precioBRUT;
      cambio = this.state.cambio24h

    }


    let market = 0;
    let tokens = 0;

    try {
      response = await fetch(proxyUrl + cons.market_brut).then((res) => { return res.json() }).catch(error => { console.error(error) })
      market = response.marketcap.usdt;
      console.log(response)
      tokens = response.circulatingSupply;

    } catch (err) {
      console.log(err);
      market = this.state.enBrutus;
      tokens = this.state.tokensEmitidos

    }

    this.setState({
      cambio24h: cambio,
      precioBRUT: precio,
      enBrutus: market,
      tokensEmitidos: tokens

    })

    //console.log(response)

    return response;

  };

  async estado() {

    var accountAddress = this.props.accountAddress;

    var aprovadoUSDT = await this.props.contrato.USDT.allowance(accountAddress, this.props.contrato.BRUT_USDT.address).call();
    if (aprovadoUSDT.remaining) {
      aprovadoUSDT = parseInt(aprovadoUSDT.remaining._hex);
    } else {
      aprovadoUSDT = parseInt(aprovadoUSDT._hex);
    }

    var balanceUSDT = await this.props.contrato.USDT.balanceOf(accountAddress).call();
    balanceUSDT = parseInt(balanceUSDT._hex) / 10 ** 6;

    if (aprovadoUSDT > 0) {
      aprovadoUSDT = "Buy ";
    } else {
      aprovadoUSDT = "Approve Purchases";
      this.setState({
        valueUSDT: ""
      })
    }

    var aprovadoBRUT = await this.props.contrato.BRUT.allowance(accountAddress, this.props.contrato.BRUT_USDT.address).call();
    if (aprovadoBRUT.remaining) {
      aprovadoBRUT = parseInt(aprovadoBRUT.remaining._hex);
    } else {
      aprovadoBRUT = parseInt(aprovadoBRUT._hex);
    }

    var balanceBRUT = await this.props.contrato.BRUT.balanceOf(accountAddress).call();
    balanceBRUT = parseInt(balanceBRUT._hex) / 10 ** 6;

    if (aprovadoBRUT > 0) {
      aprovadoBRUT = "Sell ";
    } else {
      aprovadoBRUT = "Approve Sales";
      this.setState({
        valueBRUT: ""
      })
    }

    var supplyBRUT = await this.props.contrato.BRUT.totalSupply().call();
    supplyBRUT = supplyBRUT.toNumber() / 1e6;

    this.setState({
      depositoUSDT: aprovadoUSDT,
      depositoBRUT: aprovadoBRUT,
      balanceBRUT: balanceBRUT,
      balanceUSDT: balanceUSDT,
      wallet: accountAddress,
      totalCirculando: supplyBRUT
    });

  }


  async compra() {


    const { minCompra } = this.state;

    var amount = document.getElementById("amountUSDT").value;
    amount = parseFloat(amount);
    amount = parseInt(amount * 10 ** 6);

    var accountAddress = this.props.accountAddress;

    var aprovado = await this.props.contrato.USDT.allowance(accountAddress, this.props.contrato.BRUT_USDT.address).call();
    if (aprovado.remaining) {
      aprovado = parseInt(aprovado.remaining._hex);
    } else {
      aprovado = parseInt(aprovado._hex);
    }

    if (aprovado >= amount) {


      if (amount >= minCompra) {

        document.getElementById("amountUSDT").value = "";

        await this.props.contrato.BRUT_USDT.comprar(amount).send();

      } else {
        window.alert("Enter an amount greater than " + minCompra + " USDT");
        document.getElementById("amountUSDT").value = minCompra;
      }



    } else {

      if (aprovado <= 0) {
        await this.props.contrato.USDT.approve(this.props.contrato.USDT, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send();
      }

      if (amount > aprovado) {
        if (aprovado <= 0) {
          document.getElementById("amountUSDT").value = minCompra;
          window.alert("Not enough USDT");
        } else {
          document.getElementById("amountUSDT").value = minCompra;
          window.alert("invalid value");
        }



      } else {

        document.getElementById("amountUSDT").value = amount;
        window.alert("invalid value");

      }
    }


  };

  async venta() {


    const { minventa } = this.state;

    var amount = document.getElementById("amountBRUT").value;
    amount = parseFloat(amount);
    amount = parseInt(amount * 10 ** 6);

    var accountAddress = this.props.accountAddress;

    var aprovado = await this.props.contrato.BRUT.allowance(accountAddress, this.props.contrato.BRUT_USDT.address).call();
    if (aprovado.remaining) {
      aprovado = parseInt(aprovado.remaining._hex);
    } else {
      aprovado = parseInt(aprovado._hex);
    }

    if (aprovado >= amount) {


      if (amount >= minventa) {

        document.getElementById("amountBRUT").value = "";

        await this.props.contrato.BRUT_USDT.vender(amount).send();

      } else {
        window.alert("place an amount greater than $10 USDT");
        document.getElementById("amountBRUT").value = 10;
      }



    } else {


      if (aprovado <= 0) {
        await this.props.contrato.BRUT.approve(this.props.contrato.BRUT_USDT.address, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send();
      }

      if (amount > aprovado) {
        if (aprovado <= 0) {
          document.getElementById("amountBRUT").value = minventa;
          window.alert("the minimum requirements to sell are " + minventa + " BRUT");
        } else {
          document.getElementById("amountBRUT").value = minventa;
          window.alert("invalid value");
        }



      } else {

        document.getElementById("amountBRUT").value = minventa;
        window.alert("valor inválido");

      }

    }


  };

  async grafico(time, temporalidad, cantidad) {
    if (this.root) {
      this.root.dispose();
    }

    const root = am5.Root.new("chartdiv");

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true
      })
    );

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);

    // Generate random data
    let value = 0;
    let previousValue = value;
    let downColor = root.interfaceColors.get("negative");
    let upColor = root.interfaceColors.get("positive");
    let color;
    let previousColor;
    let previousDataObj;

    function generateData(data) {
      value = data.value;

      if (value >= previousValue) {
        color = upColor;
      } else {
        color = downColor;
      }
      previousValue = value;

      let dataObj = { date: data.date, value: value, color: color }; // color will be used for tooltip background

      // only if changed
      if (color !== previousColor) {
        if (!previousDataObj) {
          previousDataObj = dataObj;
        }
        previousDataObj.strokeSettings = { stroke: color };
      }

      previousDataObj = dataObj;
      previousColor = color;

      return dataObj;
    }

    async function generateDatas(count) {
      let consulta = (await (await fetch(process.env.REACT_APP_API_URL + "api/v1/chartdata/brut?dias=" + count)).json()).Data
      let data = []

      console.log(consulta)
      for (var i = consulta.length - 1; i >= 0; --i) {
        data.push(generateData(consulta[i]));
      }
      console.log(data)


      return data;
    }

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: temporalidad, count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {}),
        tooltip: am5.Tooltip.new(root, {})
      })
    );

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    let series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "Series",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date"
      })
    );

    series.strokes.template.set("templateField", "strokeSettings");

    let tooltip = series.set("tooltip", am5.Tooltip.new(root, {
      labelText: "{valueY}"
    }));

    // this is added in ored adapter to be triggered each time position changes
    tooltip.on("pointTo", function () {
      let background = tooltip.get("background");
      background.set("fill", background.get("fill"));
    });

    // tooltip bacground takes color from data item
    tooltip.get("background").adapters.add("fill", function (fill) {
      if (tooltip.dataItem) {
        return tooltip.dataItem.dataContext.color;
      }
      return fill;
    });

    // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    //scrollbar.parent = chart.bottomAxesContainer;
    let scrollbar = chart.set(
      "scrollbarX",
      am5xy.XYChartScrollbar.new(root, {
        orientation: "horizontal",
        height: 30
      })
    );

    let sbDateAxis = scrollbar.chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: {
          timeUnit: temporalidad,
          count: 1
        },
        renderer: am5xy.AxisRendererX.new(root, {})
      })
    );

    let sbValueAxis = scrollbar.chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    let sbSeries = scrollbar.chart.series.push(
      am5xy.LineSeries.new(root, {
        valueYField: "value",
        valueXField: "date",
        xAxis: sbDateAxis,
        yAxis: sbValueAxis,

      })
    );

    // Generate and set data  | 
    let data = await generateDatas(cantidad);
    series.data.setAll(data);
    sbSeries.data.setAll(data);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/


    series.appear(time);
    chart.appear(time, time / 10);

    this.root = root;
  }

  render() {

    var { minCompra, minventa } = this.state;

    minCompra = "Min. " + minCompra + " USDT";
    minventa = "Min. " + minventa + " BRUT";

    return (<>

      <div class="row">
        <div class="col-xl-12">
          <div class="tab-content" id="nav-tabContent">
            <div class="tab-pane fade show active" id="nav-bitcoin" role="tabpanel" aria-labelledby="nav-bitcoin-tab">
              <div class="row">
                <div class="col-xl-9 col-xxl-9 wow fadeInLeft" data-wow-delay="0.2s">
                  <div class="card coin-content">
                    <div class="card-header border-0 flex-wrap">
                      <div class="mb-2">
                        <h4 class="heading m-0">BRUT Chart</h4>
                        <span class="fs-16">Brutus Algorithmic Trading Robot </span>
                      </div>
                      <div class="dropdown bootstrap-select">
                        <select class="image-select default-select dashboard-select" aria-label="Default" tabindex="0">
                          <option selected="">USD ($ US Dollar)</option>
                        </select>
                      </div>
                    </div>
                    <div class="card-body">
                      <div class="d-flex align-items-center justify-content-between flex-wrap">
                        <div class="d-flex align-items-center justify-content-between flex-wrap">
                          <div class="price-content">
                            <span class="fs-18 d-block mb-2">Price</span>
                            <h4 class="fs-20 font-w600">${this.state.precioBRUT}</h4>
                          </div>
                          <div class="price-content">
                            <span class="fs-14 d-block mb-2">24h% change</span>
                            <h4 class="font-w600 text-success">{this.state.cambio24h}<i class="fa-solid fa-caret-up ms-1 text-success"></i></h4>
                          </div>
                          <div class="price-content">
                            <span class="fs-14 d-block mb-2">Circulating</span>
                            <h4 class="font-w600">{(this.state.tokensEmitidos * 1).toFixed(2)}</h4>
                          </div>
                          <div class="price-content">
                            <span class="fs-14 d-block mb-2">Market Cap</span>
                            <h4 class="font-w600">${(this.state.enBrutus * 1).toFixed(2)}</h4>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3" id="chartdiv" style={{ height: "400px", backgroundColor: "white" }}></div>
                      <select className="btn-secondary style-1 default-select" value={this.state.temporalidad} onChange={this.handleChange}>
                        {options.map((option) => (
                          <option key={option.label.toString()} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {" | "}
                      <select className="btn-secondary style-1 default-select" value={this.state.cantidadDatos} onChange={this.handleChange2}>
                        {options2.map((option) => (
                          <option key={option.label.toString()} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div class="col-xl-3 col-xxl-3 col-sm-6 wow fadeInRight" data-wow-delay="0.3s">
                  <div class="card  digital-cash">
                    
                    <div class="card-body ">
                      <div class="text-center">
                        <div class="media d-block">
                          <img src="images/brut.png" width="100%" alt="brutus token" />
                          <div class="media-content">
                            <h4 class="mt-0 mt-md-4 fs-20 font-w700 text-black mb-0">Automated Trading</h4>
                            <span class="font-w600 text-black">Brutus</span>
                            <span class="my-4 fs-16 font-w600 d-block">1 BRUT = {this.state.precioBRUT} USD</span>
                            <p class="text-start">The Brutus Token is a Tron-based token whose value is backed by an automated trading strategy that uses backtesting and capital management to maximize profits and minimize losses. The value of the Brutus Token is pegged to USDT, so its value remains stable in USD terms.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="card-footer p-2 border-0">
                      <a href="https://brutus.finance/brutusblog.html" class="btn btn-link text-primary">Read more</a>
                    </div>
                  </div>
                </div>
                <div class="col-xl-6 col-sm-6 wow fadeInUp" data-wow-delay="0.4s">
                  <div class="card quick-trade">
                    <div class="card-header pb-0 border-0 flex-wrap">
                      <div>
                        <h4 class="heading mb-0">Quick Trade</h4>
                        <p class="mb-0 fs-14">without fees</p>
                      </div>
                    </div>
                    <div class="card-body pb-0">
                      <div class="basic-form">
                        <form class="form-wrapper trade-form">
                          <div class="input-group mb-3 ">
                            <span class="input-group-text">BRUT</span>
                            <input class="form-control form-control text-end" type="number" id="amountBRUT" onChange={this.handleChangeBRUT} placeholder={minventa} min={this.state.minventa} max={this.state.balanceBRUT} value={this.state.valueBRUT} step={0.5} />
                          </div>
                          <div class="input-group mb-3 ">
                            <span class="input-group-text">USDT</span>
                            <input class="form-control form-control text-end" type="number" id="amountUSDT" onChange={this.handleChangeUSDT} placeholder={minCompra} min={this.state.minCompra} max={this.state.balanceUSDT} value={this.state.valueUSDT} />
                          </div>
                        </form>
                      </div>
                    </div>
                    <div class="card-footer border-0">
                      <div class="row">
                        <div class="col-6">
                          <button class="btn d-flex  btn-success justify-content-between w-100" onClick={() => this.compra()}>
                            BUY
                            <svg class="ms-4 scale5" width="16" height="16" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5.35182 13.4965L5.35182 13.4965L5.33512 6.58823C5.33508 6.5844 5.3351 6.58084 5.33514 6.57759M5.35182 13.4965L5.83514 6.58306L5.33514 6.58221C5.33517 6.56908 5.33572 6.55882 5.33597 6.5545L5.33606 6.55298C5.33585 6.55628 5.33533 6.56514 5.33516 6.57648C5.33515 6.57684 5.33514 6.57721 5.33514 6.57759M5.35182 13.4965C5.35375 14.2903 5.99878 14.9324 6.79278 14.9305C7.58669 14.9287 8.22874 14.2836 8.22686 13.4897L8.22686 13.4896L8.21853 10.0609M5.35182 13.4965L8.21853 10.0609M5.33514 6.57759C5.33752 5.789 5.97736 5.14667 6.76872 5.14454C6.77041 5.14452 6.77217 5.14451 6.77397 5.14451L6.77603 5.1445L6.79319 5.14456L13.687 5.16121L13.6858 5.66121L13.687 5.16121C14.4807 5.16314 15.123 5.80809 15.1211 6.6022C15.1192 7.3961 14.4741 8.03814 13.6802 8.03626L13.6802 8.03626L10.2515 8.02798L23.4341 21.2106C23.9955 21.772 23.9955 22.6821 23.4341 23.2435C22.8727 23.8049 21.9625 23.8049 21.4011 23.2435L8.21853 10.0609M5.33514 6.57759C5.33513 6.57959 5.33514 6.58159 5.33514 6.5836L8.21853 10.0609M6.77407 5.14454C6.77472 5.14454 6.77537 5.14454 6.77603 5.14454L6.77407 5.14454Z" fill="white" stroke="white"></path>
                            </svg>
                          </button>
                        </div>
                        <div class="col-6">
                          <button class="btn d-flex  btn-danger justify-content-between w-100" onClick={() => this.venta()}>
                            SELL
                            <svg class="ms-4 scale3" width="16" height="16" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16.9638 11.5104L16.9721 14.9391L3.78954 1.7565C3.22815 1.19511 2.31799 1.19511 1.75661 1.7565C1.19522 2.31789 1.19522 3.22805 1.75661 3.78943L14.9392 16.972L11.5105 16.9637L11.5105 16.9637C10.7166 16.9619 10.0715 17.6039 10.0696 18.3978C10.0677 19.1919 10.7099 19.8369 11.5036 19.8388L11.5049 19.3388L11.5036 19.8388L18.3976 19.8554L18.4146 19.8555L18.4159 19.8555C18.418 19.8555 18.42 19.8555 18.422 19.8555C19.2131 19.8533 19.8528 19.2114 19.8555 18.4231C19.8556 18.4196 19.8556 18.4158 19.8556 18.4117L19.8389 11.5035L19.8389 11.5035C19.8369 10.7097 19.1919 10.0676 18.3979 10.0695C17.604 10.0713 16.9619 10.7164 16.9638 11.5103L16.9638 11.5104Z" fill="white" stroke="white"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div class="d-flex mt-3 align-items-center">
                        <div class="form-check custom-checkbox me-3">
                          <label class="form-check-label fs-14 font-w400" for="customCheckBox1">We recommend keeping ~ 21 TRX for transactions.</label>
                        </div>
                        <p class="mb-0"></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-xl-6 col-sm-12 wow fadeInUp" data-wow-delay="0.6s">
                  <div class="card price-list">
                    <div class="card-header border-0 pb-2">
                      <div class="chart-title">
                        <h4 class="text-warning mb-0">My Assets</h4>
                      </div>
                    </div>
                    <div class="card-body p-3 py-0">
                      <div class="table-responsive">
                        <table class="table text-center bg-warning-hover order-tbl">
                          <thead>
                            <tr>
                              <th class="text-left">Token</th>
                              <th class="text-center">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{cursor:"pointer"}} onClick={()=>{ this.handleChangeBRUT({target:{value:this.state.balanceBRUT}})}}>
                              <td class="text-left">BRUT</td>
                              <td>{this.state.balanceBRUT}</td>
                            </tr>
                            <tr style={{cursor:"pointer"}} onClick={()=>{ this.handleChangeUSDT({target:{value:this.state.balanceUSDT}})}}>
                              <td class="text-left">USDT</td>
                              <td>{this.state.balanceUSDT}</td>
                            </tr>
                            
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div class="card-footer text-center py-3 border-0">
                      <a href="/" class="btn-link text-black">Show more <i class="fa fa-caret-right"></i></a>
                    </div>
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
