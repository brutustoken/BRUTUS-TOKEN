import React, { Component } from "react";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const BigNumber = require('bignumber.js');

function delay(s) { return new Promise(res => setTimeout(res, s * 1000)); }

const options = [
  {
    label: "Hours",
    value: "hour",
  },
  {
    label: "Days",
    value: "day",
  }
];

/*

  {
    label: "Semanal",
    value: "week",
  },
  {
    label: "Mensual",
    value: "month",
  }
*/
const options2 = [
  {
    label: "Last 7 ",
    value: "7",
  },
  {
    label: "Last 30 ",
    value: "30",
  },
  {
    label: "Last 90 ",
    value: "90",
  },
  {
    label: "Last 180 ",
    value: "180",
  },
  {
    label: "All ",
    value: "0",
  },
];


export default class Staking extends Component {
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
      enPool: 0,
      solicitado: 0,
      data: [],
      precioBRST: "#.###",
      solicitudes: 0,
      temporalidad: "day",
      cantidadDatos: 30,
      dias: "Loading...",
      precioBrut: 0,
      varBrut: 0,
      precioBrst: 0,
      varBrst: 0,
      BRGY: 0,
      BRLT: 0,
      misBRUT: 0,
      misBRST: 0,
      misBRGY: 0,
      misBRLT: 0,
      dataBRST: [],
      contractEnergy: 0,
      titulo: "",
      body: "",
      tiempoPromediado: 3,
      promE7to1day: 0,
      resultCalc: 0,
      diasCalc: 1,
      brutCalc: 1000,
      balanceBRUT: 0,
      balanceTRX: 0


    };


    this.subeobaja = this.subeobaja.bind(this);
    this.textoE = this.textoE.bind(this);
    this.consultaPrecio = this.consultaPrecio.bind(this);
    this.grafico = this.grafico.bind(this);

    this.compra = this.compra.bind(this);
    this.venta = this.venta.bind(this);
    this.sell = this.sell.bind(this);
    this.estado = this.estado.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleChange2 = this.handleChange2.bind(this);

    this.handleChangeBRUT = this.handleChangeBRUT.bind(this);
    this.handleChangeUSDT = this.handleChangeUSDT.bind(this);

    this.handleChangeDias = this.handleChangeDias.bind(this);
    this.handleChangeCalc = this.handleChangeCalc.bind(this);

    this.llenarBRST = this.llenarBRST.bind(this);
    this.llenarUSDT = this.llenarUSDT.bind(this);

    this.consultarPrecio = this.consultarPrecio.bind(this);

  }

  componentDidMount() {
    document.title = "B.F | BRST"
    this.grafico(1000, "day", 90);

    setTimeout(() => {

      this.consultarPrecio();
      this.estado();
      this.consultaPrecio();

    }, 3 * 1000);

    setInterval(() => {
      this.consultarPrecio();
      this.estado();
    }, 30 * 1000);
  }

  componentWillUnmount() {
    if (this.root) {
      this.root.dispose();
    }
  }

  subeobaja(valor) {
    var imgNPositivo = (<svg width="29" height="22" viewBox="0 0 29 22" fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d2)">
        <path d="M5 16C5.91797 14.9157 8.89728 11.7277 10.5 10L16.5 13L23.5 4"
          stroke="#2BC155" strokeWidth="2" strokeLinecap="round" />
      </g>
      <defs>
        <filter id="filter0_d2" x="-3.05176e-05" y="-6.10352e-05" width="28.5001"
          height="22.0001" filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix type="matrix"
            values="0 0 0 0 0.172549 0 0 0 0 0.72549 0 0 0 0 0.337255 0 0 0 0.61 0" />
          <feBlend mode="normal" in2="BackgroundImageFix"
            result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow"
            result="shape" />
        </filter>
      </defs>
    </svg>);
    var imgNegativo = (<svg width="29" height="22" viewBox="0 0 29 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d)">
        <path d="M5 4C5.91797 5.08433 8.89728 8.27228 10.5 10L16.5 7L23.5 16" stroke="#FF2E2E" strokeWidth="2" strokeLinecap="round" />
      </g>
      <defs>
        <filter id="filter0_d" x="0" y="0" width="28.5001" height="22.0001" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.180392 0 0 0 0 0.180392 0 0 0 0.61 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>);

    var resultado = imgNPositivo;

    if (valor < 0) {
      resultado = imgNegativo
    }

    return resultado;
  }

  textoE(valor) {

    var resultado = "success";

    if (valor < 0) {
      resultado = "danger"
    }

    return resultado;

  }

  consultaPrecio() {

    fetch(process.env.REACT_APP_API_URL + 'api/v1/precio/brst')
      .then(r => { return r.json(); })
      .then(data => {

        this.setState({
          precioBrst: data.Data.trx,
          varBrst: data.Data.v24h
        })

      })
      .catch(err => {console.log(err);});

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

  handleChangeDias(event) {
    let dato = event.target.value;

    let oper = ((this.state.brutCalc * this.state.precioBrst * ((this.state.promE7to1day) / 100))).toFixed(6)
    oper = oper * parseInt(dato)
    this.setState({
      diasCalc: parseInt(dato),
      resultCalc: oper
    });
  }

  handleChangeCalc(event) {
    let dato = event.target.value;
    let oper = ((dato * this.state.precioBrst * ((this.state.promE7to1day) / 100))).toFixed(6)
    oper = oper * parseInt(this.state.diasCalc)

    this.setState({
      brutCalc: dato,
      resultCalc: oper
    });
  }

  llenarBRST() {
    document.getElementById('amountBRUT').value = this.state.balanceBRUT;
    let oper = this.state.balanceBRUT * this.state.precioBRST;
    oper = parseInt(oper * 1e6) / 1e6;
    this.setState({
      valueBRUT: this.state.balanceBRUT,
      valueUSDT: oper
    });

  }

  llenarUSDT() {
    document.getElementById('amountUSDT').value = this.state.balanceTRX;
    let oper = this.state.balanceTRX / this.state.precioBRST
    oper = parseInt(oper * 1e6) / 1e6;
    this.setState({
      valueUSDT: this.state.balanceTRX,
      valueBRUT: oper,
    });
  }

  async consultarPrecio() {

    var precio = await this.props.contrato.BRST_TRX_Proxy.RATE().call();
    precio = precio.toNumber() / 1e6;

    this.setState({
      precioBRST: precio
    });

    return precio;

  };

  async estado() {
   /*
    let inputs = [
      //{type: 'address', value: window.tronWeb.address.toHex(this.props.accountAddress)}
    ]

    let funcion = "TIEMPO()"
    const eenergy = await window.tronWeb.transactionBuilder.estimateEnergy(window.tronWeb.address.toHex("TMzxRLeBwfhm8miqm5v2qPw3P8rVZUa3x6"), funcion,{}, inputs, window.tronWeb.address.toHex(this.props.accountAddress));

    console.log(eenergy)*/

    var misBRST = await this.props.contrato.BRST.balanceOf(this.props.accountAddress).call()
    .then((result) => { return result.toNumber() / 1e6 })
    .catch((e)=>{console.error(e);return 0})

    var accountAddress = this.props.accountAddress;

    //var balance = await window.tronWeb.trx.getBalance() / 10 ** 6;
    var balance = await window.tronWeb.trx.getUnconfirmedBalance()/10**6;

    var origin = await window.tronWeb.trx.getContract(this.props.contrato.BRST_TRX_Proxy.address)

    var cuenta = await window.tronWeb.trx.getAccountResources(origin.origin_address)

    var contractEnergy = cuenta.EnergyLimit - cuenta.EnergyUsed

    var useTrx = parseInt(contractEnergy / 65000)
    if (useTrx >= 1) {
      useTrx = 1
    } else {
      useTrx = 21
    }

    let consulta = await fetch(process.env.REACT_APP_API_URL + "api/v1/chartdata/brst?temporalidad=hour&limite=72")
    consulta = (await consulta.json()).Data

    var promE7to1day = (((consulta[0].value - consulta[71].value) / (consulta[71].value) ) * 100) / this.state.tiempoPromediado

    this.setState({
      useTrx: useTrx,
      contractEnergy: contractEnergy,
      balanceTRX: balance,
      misBRST: misBRST,
      dataBRST: consulta,
      promE7to1day: promE7to1day
    })

    var MIN_DEPOSIT = await this.props.contrato.BRST_TRX_Proxy.MIN_DEPOSIT().call();
    MIN_DEPOSIT = parseInt(MIN_DEPOSIT._hex) / 10 ** 6;

    var aprovadoBRUT = await this.props.contrato.BRST.allowance(accountAddress, this.props.contrato.BRST_TRX_Proxy.address).call();
    aprovadoBRUT = parseInt(aprovadoBRUT._hex);

    var balanceBRUT = await this.props.contrato.BRST.balanceOf(accountAddress).call();
    balanceBRUT = parseInt(balanceBRUT._hex) / 10 ** 6;

    if (aprovadoBRUT > 0) {
      aprovadoBRUT = "Sell ";
    } else {
      aprovadoBRUT = "Approve Exchange";
      this.setState({
        valueBRUT: ""
      })
    }

    var precioBRST = await this.consultarPrecio();

    var deposito = await this.props.contrato.BRST_TRX_Proxy.todasSolicitudes(accountAddress).call();
    var myids = []

    for (let index = 0; index < deposito.length; index++) {
      myids.push(parseInt(deposito[index]._hex));
      
    }

    console.log(myids)

    console.log("INDEX: "+await this.props.contrato.BRST_TRX_Proxy.index().call())

    var deposits = await this.props.contrato.BRST_TRX_Proxy.solicitudesPendientesGlobales().call();
    console.log(deposits)

    deposits = deposits[0];
    console.log(deposits)
    var globDepositos = [];

    var tiempo = parseInt((await this.props.contrato.BRST_TRX_Proxy.TIEMPO().call())._hex) * 1000;

    var diasDeEspera = (tiempo / (86400 * 1000)).toPrecision(2)
    
    for (let index = 0; index < deposits.length; index++) {

      let pen = await this.props.contrato.BRST_TRX_Proxy.verSolicitudPendiente(parseInt(deposits[index]._hex)).call();
      pen = pen[0];
      //console.log(pen)
      let inicio = parseInt(pen.tiempo._hex)* 1000
      
      let pv = new Date(inicio+tiempo)

      let diasrestantes = ((inicio + tiempo - Date.now()) / (86400 * 1000)).toPrecision(2)

      var boton = <></>
      var boton2 = <><p className="mb-0 fs-14 text-white">Order in UnStaking process for the next 14 days, once this period is over, return and claim the corresponding TRX</p></>;

      let cantidadTrx = new BigNumber(parseInt(pen.brst._hex)).times(parseInt(pen.precio._hex)).shiftedBy(-6)// cambiar abig number
      if (this.props.accountAddress === window.tronWeb.address.fromHex((await this.props.contrato.BRST_TRX_Proxy.owner().call()))) {

        boton2 = <button className="btn  btn-success text-white mb-2" onClick={async () => {
          if (this.state.balanceTRX * 1 >= cantidadTrx.toNumber()) {
            await this.props.contrato.BRST_TRX_Proxy.completarSolicitud(parseInt(deposits[index]._hex)).send({ callValue: cantidadTrx.toString(10) });
            this.consultarPrecio();
            this.estado();
            this.setState({
              titulo: "Status",
              body: "Order completed!"
            })

            window.$("#mensaje-brst").modal("show");
          } else {
            this.setState({
              titulo: "Error",
              body: "Insufficient balance to fulfill this order"
            })

            window.$("#mensaje-brst").modal("show");
          }

        }}>
          Complete order {" "} <i className="bi bi-check-lg"></i>
        </button>

      }

      if (myids.includes(parseInt(deposits[index]._hex)) && diasrestantes < 17 && diasrestantes > 0) {
        boton = (
          <button className="btn btn-warning ms-4 mb-2 disabled" aria-disabled="true" >
            Claim {" "} <i className="bi bi-exclamation-circle"></i>
          </button>
        )
      }

      if (myids.includes(parseInt(deposits[index]._hex)) && diasrestantes <= 0  || true) {

        //console.log(myids.indexOf(parseInt(deposits[index]._hex)))
        boton = (
          <button className="btn btn-primary ms-4 mb-2" aria-disabled="true" onClick={async () => {
            await this.props.contrato.BRST_TRX_Proxy.retirar(parseInt(deposits[index]._hex)).send();
            this.estado()
          }}>
            Claim {" "} <i className="bi bi-award"></i>
          </button>
        )
      }

      if (diasrestantes <= 0) {
        diasrestantes = 0
      }

      if(myids.includes(parseInt(deposits[index]._hex)) || this.props.accountAddress === window.tronWeb.address.fromHex((await this.props.contrato.BRST_TRX_Proxy.owner().call()))){
        globDepositos[index] = (

          <div className="row mt-4 align-items-center" id={"sale-"+parseInt(deposits[index]._hex)} key={"glob" + parseInt(deposits[index]._hex)}>
            <div className="col-sm-6 mb-3">
              <p className="mb-0 fs-14">Sale N° {parseInt(deposits[index]._hex)} | {diasrestantes} Days left</p>
              <h4 className="fs-20 text-black">{parseInt(pen.brst._hex) / 10 ** 6} BRST X {(parseInt(pen.brst._hex) / 10 ** 6) * (parseInt(pen.precio._hex)/10**6)} TRX</h4>
              <p className="mb-0 fs-14">Price by unit: {(parseInt(pen.precio._hex)/10**6)} TRX</p>
            </div>
            <div className="col-sm-6 mb-1">
  
              {boton2}
              {boton}
            </div>
            <div className="col-12 mb-3">
              <p className="mb-0 fs-14">Available on: {pv.toString()}</p>
              <hr></hr>
            </div>
  
          </div>
        )
      }

      

    }

    var enBrutus = await this.props.contrato.BRST_TRX_Proxy.TRON_BALANCE().call();
    var enPool = await this.props.contrato.BRST_TRX_Proxy.TRON_PAY_BALANCE().call();
    var solicitado = await this.props.contrato.BRST_TRX_Proxy.TRON_SOLICITADO().call();
    var tokensEmitidos = await this.props.contrato.BRST.totalSupply().call();

    this.setState({
      minCompra: MIN_DEPOSIT,
      globDepositos: globDepositos,
      depositoBRUT: aprovadoBRUT,
      balanceBRUT: balanceBRUT,
      balanceTRX: balance,
      wallet: accountAddress,
      precioBRST: precioBRST,
      espera: tiempo,
      enBrutus: enBrutus.toNumber() / 1e6,
      tokensEmitidos: tokensEmitidos.toNumber() / 1e6,
      enPool: enPool.toNumber() / 1e6,
      solicitado: solicitado.toNumber() / 1e6,
      solicitudes: globDepositos.length,
      dias: diasDeEspera
    });

    if(parseInt(this.state.resultCalc) === 0){
      document.getElementById("hold").value = misBRST
      this.handleChangeCalc({target:{value:misBRST}})
    }

  }

  async compra() {

    const { minCompra } = this.state;

    var amount = document.getElementById("amountUSDT").value;
    amount = parseFloat(amount);
    amount = parseInt(amount * 10 ** 6);

    var balance = await window.tronWeb.trx.getBalance();

    if (balance >= amount) {
      if (amount >= minCompra) {

        await this.props.contrato.BRST_TRX_Proxy.staking().send({ callValue: amount })
        .then(()=>{
          this.setState({
            titulo: "Done!",
            body: <>Your TRX automatic staking has started
            <br /><br/>
            <button type="button" className="btn btn-success" onClick={()=>{window.$("#mensaje-brst").modal("hide")}}>Accept</button>
            </>
          })
  
          window.$("#mensaje-brst").modal("show");
        })
        .catch(()=>{

          this.setState({
            titulo: "non-effective transaction",
            body: "The transaction has failed, you have connection problems or you have taken too long to sign, this has made the transaction unsuccessful, try again"
          })
  
          window.$("#mensaje-brst").modal("show");

        })
        
        document.getElementById("amountUSDT").value = "";


      } else {
        document.getElementById("amountUSDT").value = minCompra;
        this.setState({
          titulo: "Error",
          body: "Please enter an amount greater than " + minCompra + " TRX"
        })

        window.$("#mensaje-brst").modal("show");


      }

    } else {

      document.getElementById("amountUSDT").value = "";
      this.setState({
        titulo: "Error",
        body: "You do not have enough funds in your account you place at least " + minCompra + " TRX"
      })

      window.$("#mensaje-brst").modal("show");



    }


    this.llenarUSDT();
    await delay(5);
    this.estado();


  };

  async sell() {

    this.setState({
      titulo: "Select Your Method",
      body: <>We now have two withdrawal methods:<br/>
      <button type="button" className="btn btn-warning" onClick={()=>{this.venta(true)}}>Fast Withdrawal</button><br/>
        you can request up to {2000} TRX for instant withdrawal with a 5% penalty on what you are going to withdraw and you will receive the funds instantly in your wallet.
      <br/><br/><br/>
      <button type="button" className="btn btn-success" onClick={()=>{this.venta(false)}}>Regular Withdrawal</button><br/>
       you can make a withdrawal request that you can claim from the contract in its entirety in 17 days.
      </>
    })

    window.$("#mensaje-brst").modal("show");
  
  }

  async venta(rapida) {

    const { minventa } = this.state;

    var amount = document.getElementById("amountBRUT").value;
    amount = parseFloat(amount);
    amount = parseInt(amount * 10 ** 6);

    var accountAddress = this.props.accountAddress;

    var aprovado = await this.props.contrato.BRST.allowance(accountAddress, this.props.contrato.BRST_TRX_Proxy.address).call();
    aprovado = parseInt(aprovado._hex);

    if (aprovado <= amount) {
      await this.props.contrato.BRST.approve(this.props.contrato.BRST_TRX_Proxy.address, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send();
      aprovado = await this.props.contrato.BRST.allowance(accountAddress, this.props.contrato.BRST_TRX_Proxy.address).call();
    }

    if (aprovado >= amount) {

      if (amount >= minventa && true) {

        document.getElementById("amountBRUT").value = "";

        if (rapida) {
          await this.props.contrato.BRST_TRX_Proxy.instaRetiro(amount).send();
         
        }else{
          await this.props.contrato.BRST_TRX_Proxy.esperaRetiro(amount).send();
        }

      } else {
        this.setState({
          titulo: "Info",
          body: `Enter a value greater than ${minventa} BRST`
        })

        window.$("#mensaje-brst").modal("show");

        document.getElementById("amountBRUT").value = minventa;
      }


    } else {

      if (amount > aprovado) {
        if (aprovado <= 0) {
          document.getElementById("amountBRUT").value = minventa;
          this.setState({
            titulo: "Info",
            body: "You do not have enough aproved funds in your account you place at least " + minventa + " BRST"
          })

          window.$("#mensaje-brst").modal("show");
        } else {
          document.getElementById("amountBRUT").value = minventa;
          this.setState({
            titulo: "Info",
            body: "You must leave 21 TRX free in your account to make the transaction"
          })

          window.$("#mensaje-brst").modal("show");
        }



      } else {

        document.getElementById("amountBRUT").value = minventa;
        this.setState({
          titulo: "Info",
          body: "You must leave 21 TRX free in your account to make the transaction"
        })

        window.$("#mensaje-brst").modal("show");

      }

    }


    this.llenarBRST();

    this.estado();


  };

  async retiro() {

    if (Date.now() >= this.state.tiempo && this.state.tiempo - this.state.espera !== 0) {
      await this.props.contrato.BRST_TRX_Proxy.retirar().send();
    } else {
      this.setState({
        titulo: "Info",
        body: "It's not time to retire yet"
      })

      window.$("#mensaje-brst").modal("show");
    }

    this.estado();

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

      let consulta = await fetch(process.env.REACT_APP_API_URL + "api/v1/chartdata/brst?temporalidad=" + temporalidad + "&limite=" + count)
      consulta = (await consulta.json()).Data

      let data = []
      for (var i = consulta.length - 1; i >= 0; --i) {
        data.push(generateData(consulta[i]));
      }

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
        height: 40
      })
    );

    let sbDateAxis = scrollbar.chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: temporalidad, count: 1 },
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

    // Generate and set data  
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

    minCompra = "Min. " + minCompra + " TRX";
    minventa = "Min. " + minventa + " BRST";

    return (<>

      <div className="row">
        <div className="col-xl-12">
          <div className="tab-content" id="nav-tabContent">
            <div className="tab-pane fade show active" id="nav-bitcoin" role="tabpanel" aria-labelledby="nav-bitcoin-tab">
              <div className="row">
                <div className="col-xl-9 col-xxl-9 wow fadeInLeft" data-wow-delay="0.2s">
                  <div className="card coin-content">
                    <div className="card-header border-0 flex-wrap">
                      <div className="mb-2">
                        <h4 className="heading m-0">BRST Chart</h4>
                        <span className="fs-16">Brutus Tron Staking </span>
                      </div>
                      <div className="dropdown bootstrap-select">
                        <select className="image-select default-select dashboard-select" aria-label="Default" tabIndex="0">
                          <option >TRX (Tron)</option>
                          <option >USD (Dollar)</option>
                        </select>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                          <div className="price-content">
                            <span className="fs-18 d-block mb-2">Price</span>
                            <h4 className="fs-20 font-w600">{this.state.precioBRST} TRX</h4>
                          </div>
                          <div className="price-content">
                            <span className="fs-14 d-block mb-2">24h% change</span>
                            <h4 className="font-w600 text-success">{(this.state.varBrst).toFixed(4)}<i className="fa-solid fa-caret-up ms-1 text-success"></i></h4>
                          </div>
                          <div className="price-content">
                            <span className="fs-14 d-block mb-2">Circulating</span>
                            <h4 className="font-w600">{(this.state.tokensEmitidos * 1).toFixed(2)} BRST</h4>
                          </div>
                          <div className="price-content">
                            <span className="fs-14 d-block mb-2">Endorsement</span>
                            <h4 className="font-w600">{(this.state.enBrutus * 1).toFixed(2)} TRX</h4>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3" id="chartdiv" style={{ height: "400px", backgroundColor: "white" }}></div>


                      <select className="btn-secondary style-1 default-select" value={this.state.cantidadDatos} onChange={this.handleChange2}>
                        {options2.map((option) => (
                          <option key={option.label.toString()} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {" | "}
                      <select className="btn-secondary style-1 default-select" value={this.state.temporalidad} onChange={this.handleChange}>
                        {options.map((option) => (
                          <option key={option.label.toString()} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-xxl-3 col-sm-6 wow fadeInRight" data-wow-delay="0.3s">
                  <div className="card  digital-cash">

                    <div className="card-body ">
                      <div className="text-center">
                        <div className="media d-block">
                          <img src="images/brst.png" width="100%" alt="brutus tron staking" />
                          <div className="media-content">
                            <h4 className="mt-0 mt-md-4 fs-20 font-w700 text-black mb-0">Automated Staking</h4>
                            <span className="font-w600 text-black">Brutus</span>
                            <span className="my-4 fs-16 font-w600 d-block">1 BRST = {this.state.precioBrst} TRX</span>
                            <p className="text-start">BRST is a token in the tron network, which allows its holders to generate returns in TRX thanks to staking, energy rental, an additional 10% of what is generated by all Brutus Energy Bot providers and automatic compound interest. All this makes profits grow exponentially, fully automated.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer p-2 border-0">
                      <a href="https://brutus.finance/brutusblog.html" className="btn btn-link text-primary">Read more</a>
                    </div>
                  </div>
                </div>
                <div className="col-xl-6 col-sm-6 wow fadeInUp" data-wow-delay="0.4s">
                  <div className="card quick-trade">
                    <div className="card-header pb-0 border-0 flex-wrap">
                      <div>
                        <h4 className="heading mb-0">Quick Trade</h4>
                        <p className="mb-0 fs-14">Contract energy: {(this.state.contractEnergy).toLocaleString('en-US')} for ~ {parseInt(this.state.contractEnergy / 65000)} free transactions</p>
                      </div>
                    </div>
                    <div className="card-body pb-0">
                      <div className="basic-form">
                        <form className="form-wrapper trade-form">
                          <div className="input-group mb-3 ">
                            <span className="input-group-text">BRST</span>
                            <input className="form-control form-control text-end" type="number" id="amountBRUT" onChange={this.handleChangeBRUT} placeholder={minventa} min={this.state.minventa} max={this.state.balanceBRUT} value={this.state.valueBRUT} step={0.5} />
                          </div>
                          <div className="input-group mb-3 ">
                            <span className="input-group-text">TRX</span>
                            <input className="form-control form-control text-end" type="number" id="amountUSDT" onChange={this.handleChangeUSDT} placeholder={minCompra} min={this.state.minCompra} max={this.state.balanceTRX} value={this.state.valueUSDT} />
                          </div>
                        </form>
                      </div>
                    </div>
                    <div className="card-footer border-0">
                      <div className="row">
                        
                        <div className="col-6">
                          <button className="btn d-flex  btn-danger justify-content-between w-100" onClick={() => this.sell()}>
                            SELL
                            <img src="/images/svg/up.svg" style={{transform: "rotate(180deg)"}} height="16px" alt="" />
                          </button>
                        </div>

                        <div className="col-6">
                          <button className="btn d-flex  btn-success justify-content-between w-100" onClick={() => this.compra()}>
                            BUY
                            <img src="/images/svg/up.svg" height="16px" alt=""/>
                          </button>
                        </div>
                      </div>
                      <div className="d-flex mt-3 align-items-center">
                        <div className="form-check custom-checkbox me-3">
                          <label className="form-check-label fs-14 font-w400" htmlFor="customCheckBox1">We recommend keeping ~ {this.state.useTrx} TRX for transactions.</label>
                        </div>
                        <p className="mb-0"></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-6 col-sm-12 wow fadeInUp" data-wow-delay="0.6s">
                  <div className="card price-list">
                    <div className="card-header border-0 pb-2">
                      <div className="chart-title">
                        <h4 className="text-warning mb-0">My Assets</h4>
                      </div>
                    </div>
                    <div className="card-body p-3 py-0">
                      <div className="table-responsive">
                        <table className="table text-center bg-warning-hover order-tbl">
                          <thead>
                            <tr>
                              <th className="text-left">Token</th>
                              <th className="text-center">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ cursor: "pointer" }} onClick={() => { this.handleChangeBRUT({ target: { value: this.state.balanceBRUT } }) }}>
                              <td className="text-left">BRST</td>
                              <td>{this.state.balanceBRUT}</td>
                            </tr>
                            <tr style={{ cursor: "pointer" }} onClick={() => { this.handleChangeUSDT({ target: { value: this.state.balanceTRX } }) }}>
                              <td className="text-left">TRX</td>
                              <td>{this.state.balanceTRX}</td>
                            </tr>

                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="card-footer text-center py-3 border-0">
                      <a href="/" className="btn-link text-black">Show more <i className="fa fa-caret-right"></i></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>




      <div className="row mx-0">

        <div className="col-lg-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title" style={{cursor:"pointer"}} onClick={()=>{document.getElementById("hold").value = this.state.balanceBRUT;this.handleChangeCalc({target:{value:this.state.balanceBRUT}})}}>My Staking: {(this.state.misBRST * this.state.precioBrst).toFixed(3)} TRX = {this.state.misBRST} BRST</h4>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover table-responsive-sm">
                  <thead>
                    <tr>
                      <th>Days</th>
                      <th>You Hold</th>
                      <th>Status</th>
                      <th>Estimated income</th>
                      <th>Growth rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th><input type="number" id="days" defaultValue={1} onChange={this.handleChangeDias}/></th>
                      <td><input type="number" id="hold" defaultValue={0} onChange={this.handleChangeCalc}/> BRST</td>
                      <td><span className="badge badge-primary light">calculated</span>
                      </td>
                      <td>{(this.state.resultCalc).toFixed(6)} TRX</td>
                      <td className="color-primary">{(this.state.promE7to1day).toFixed(4)} % Daily </td>
                    </tr>
                    <tr>
                      <th>30</th>
                      <td>{this.state.misBRST} BRST</td>
                      <td><span className="badge badge-success">likely</span>
                      </td>
                      <td>{((this.state.misBRST * this.state.precioBrst * ((this.state.varBrst * 30) / 100))).toFixed(6)} TRX</td>
                      <td className="color-success">{(this.state.varBrst * 30).toFixed(4)} % Monthly</td>
                    </tr>
                    <tr>
                      <th>365</th>
                      <td>{this.state.misBRST} BRST</td>
                      <td><span className="badge badge-danger light">Estimated</span>
                      </td>
                      <td className="text-danger">{((this.state.misBRST * this.state.precioBrst * ((this.state.varBrst * 365) / 100))).toFixed(6)} TRX</td>
                      <td className="text-danger">{(this.state.varBrst * 365).toFixed(4)} % Yearly</td>
                    </tr>
                  </tbody>
                </table>
                <p>This calculator uses the average of the last {this.state.tiempoPromediado} days of earnings to generate an estimate that is closest to reality, since earnings can fluctuate from one day to the next and are not fixed but variable.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-header d-sm-flex d-block pb-0 border-0">
              <div>
                <h4 className="fs-20 text-black">Requests in process ({this.state.solicitudes}) {"   "}
                  <button className="btn  btn-success text-white" onClick={async () => await this.estado()}>
                    Update {" "} <i className="bi bi-arrow-repeat"></i>
                  </button></h4>
                <p className="mb-0 fs-12">Come back when time is up and claim your TRX</p>
              </div>

            </div>
            <div className="card-body">

              {this.state.globDepositos}

            </div>
          </div>
        </div>

      </div>

      <div className="modal fade" id="mensaje-brst">
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
  }
}
