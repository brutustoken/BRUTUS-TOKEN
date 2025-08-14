import React, { Component } from "react";
import { withTranslation } from 'react-i18next';

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import utils from "../utils";

const BigNumber = require('bignumber.js');
BigNumber.config({ DECIMAL_PLACES: 6, ROUNDING_MODE: BigNumber.ROUND_HALF_DOWN });

const imgLoading = <img src="images/cargando.gif" height="20px" alt="loading..." ></img>

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

const optionsHours = [
  {
    label: "Last 6 ",
    value: "6",
  },
  {
    label: "Last 12 ",
    value: "12",
  },
  {
    label: "Last 24 ",
    value: "24",
  },
  {
    label: "Last 48 ",
    value: "48",
  },
  {
    label: "Last 72 ",
    value: "72",
  },
  {
    label: "All ",
    value: "0",
  },
];

let earnings = []
let iniciado = 0;
let nextUpdate = 0
let intervalId = null

class Staking extends Component {
  constructor(props) {
    super(props);

    const { t } = this.props;

    this.state = {

      minCompra: 1,
      minventa: 1,
      deposito: t("loading") + "...",
      valueBRST: "",
      valueTRX: "",
      cantidad: 0,
      tiempo: 0,
      enBrutus: 0,
      tokensEmitidos: 0,
      enPool: 0,
      solicitado: 0,
      data: [],
      solicitudes: 0,
      solicitudesV3: 0,
      temporalidad: t("day"),
      cantidadDatos: 30,
      dias: t("loading") + "...",
      days: [{ days: 30, amount: 0, time: 0, APY: 0 }, { days: 90, amount: 0, time: 0, APY: 0 }, { days: 180, amount: 0, time: 0, APY: 0 }, { days: 360, amount: 0, time: 0, APY: 0 }],
      varBrut: 0,
      precioBrst: 0,
      varBrst: 0,
      misBRST: 0,
      dataBRST: [],
      contractEnergy: 0,
      userEnergy: 0,
      ModalTitulo: "",
      ModalBody: "",
      tiempoPromediado: 30,
      promE7to1day: 0,
      resultCalc: 0,
      diasCalc: 360,
      brutCalc: 1000,
      balanceBRST: 0,
      balanceTRX: 0,
      balanceUSDT: new BigNumber(0),
      balanceUSDD: new BigNumber(0),
      globDepositos: [],
      eenergy: 62000,
      energyOn: false,
      total_required: 0,
      isOwner: false,
      isAdmin: false,
      interesCompuesto: 0,
      crecimientoPorcentual: 0,
      precioUSDT: new BigNumber(0),
      precioUSDD: new BigNumber(0),
      retiroRapido: new BigNumber(0),
      penalty: 0,
      from: "trx",
      to: "brst",
      par: "trx_brst",
      selector: "trx",
      rapida: true,
      valueFrom: new BigNumber(0),
      valueTo: new BigNumber(0),

    };


    this.subeobaja = this.subeobaja.bind(this);
    this.textoE = this.textoE.bind(this);
    this.consultaPrecio = this.consultaPrecio.bind(this);
    this.grafico = this.grafico.bind(this);

    this.compra = this.compra.bind(this);

    this.venta = this.venta.bind(this);

    this.estado = this.estado.bind(this);
    this.preClaim = this.preClaim.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleChange2 = this.handleChange2.bind(this);

    this.handleChangeDias = this.handleChangeDias.bind(this);
    this.handleChangeCalc = this.handleChangeCalc.bind(this);

    this.llenarBRST = this.llenarBRST.bind(this);
    this.llenarTRX = this.llenarTRX.bind(this);

    this.rentEnergy = this.rentEnergy.bind(this);

    this.handleCurrencyChangeFrom = this.handleCurrencyChangeFrom.bind(this);
    this.handleCurrencyChangeTo = this.handleCurrencyChangeTo.bind(this);

    this.calcExchange = this.calcExchange.bind(this);
    this.exchangeTokens = this.exchangeTokens.bind(this);
    this.suawpTokenFromTRX = this.suawpTokenFromTRX.bind(this);

    this.calculoEnergy = this.calculoEnergy.bind(this);

    this.preExchange = this.preExchange.bind(this);

    this.costEnergy = this.costEnergy.bind(this);

  }

  componentDidMount() {

    const { t } = this.props;
    //document.title = "BRST | Brutus.Finance"
    document.getElementById("tittle").innerText = t("brst.tittle")
    intervalId = setInterval(() => {

      if (Date.now() >= nextUpdate) {

        if (!this.props.contrato.ready) {
          nextUpdate = Date.now() + 3 * 1000;
        } else {
          nextUpdate = Date.now() + 60 * 1000;
        }
        this.estado();
      }

    }, 3 * 1000);

  }

  componentWillUnmount() {
    if (this.root) {
      this.root.dispose();
    }
    clearInterval(intervalId)

  }

  handleCurrencyChangeFrom = (event) => {
    let { to } = this.state
    const selectedCurrency = event.target.value;
    if (selectedCurrency === "usdt") to = "brst"
    if (selectedCurrency === "usdd") to = "brst"

    if (selectedCurrency === to) {
      if (selectedCurrency === "trx") {
        to = "brst"
      } else {
        to = "trx"
      }
    }
    document.getElementById('currencySelectTo').value = to
    this.setState({
      from: selectedCurrency,
      to,
      par: selectedCurrency + "_" + to
    }); // Guarda la moneda seleccionada en el estado
    this.calcExchange(false, selectedCurrency + "_" + to)

  };

  handleCurrencyChangeTo = (event) => {
    let { from } = this.state
    const selectedCurrency = event.target.value;

    if (selectedCurrency === "trx") from = "brst"
    if (selectedCurrency === "brst") from = "trx"

    document.getElementById('currencySelectFrom').value = from

    this.setState({
      from,
      to: selectedCurrency,
      par: from + "_" + selectedCurrency
    }); // Guarda la cantidad ingresada en el estado
    this.calcExchange(true, selectedCurrency + "_" + from)
  };

  handleChange(e) {
    let evento = e.target.value;
    this.grafico(500, evento, this.state.cantidadDatos, document.getElementById("selector").value);
    this.setState({ temporalidad: evento });
  }

  handleChange2(e) {
    let evento = parseInt(e.target.value);
    this.grafico(500, this.state.temporalidad, evento, document.getElementById("selector").value);
    this.setState({ cantidadDatos: evento });
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

  calcExchange(out = false, swap = "trx_brst") {
    let { precioBrst, precioUSDT, precioUSDD } = this.state
    let element = out ? "amountTo" : "amountFrom"

    let salida = new BigNumber(0)

    if (precioUSDT.toNumber() <= 0 || precioUSDD.toNumber() <= 0) return salida;

    let entrada = (document.getElementById(element).value).replace(/,/g, ".")
    entrada = new BigNumber(parseFloat(entrada))

    if (out) {
      this.setState({ valueTo: entrada })
    } else {
      this.setState({ valueFrom: entrada })
    }

    switch (swap) {
      case "usdt_brst":
        salida = entrada.div(precioUSDT)
        salida = salida.div(precioBrst)

        break;

      case "brst_usdt":
        salida = entrada.times(precioUSDT)
        salida = salida.times(precioBrst)
        break;

      case "usdd_brst":
        salida = entrada.div(precioUSDD)
        salida = salida.div(precioBrst)

        break;

      case "brst_usdd":
        salida = entrada.times(precioUSDD)
        salida = salida.times(precioBrst)

        break;

      case "brst_trx":
        salida = entrada.times(precioBrst)

        break;

      case "trx_brst":
        salida = entrada.div(precioBrst)

        break;

      default:
        break;
    }


    element = !out ? "amountTo" : "amountFrom"

    if (!isNaN(salida.toString(10))) {
      document.getElementById(element).value = salida.toString(10)
    }

    //console.log(swap, entrada.toString(10), salida.toString(10))

    if (!out) {
      this.setState({ valueTo: salida })
    } else {
      this.setState({ valueFrom: salida })
    }

    return salida

  }

  async estado() {

    let { tiempoPromediado, rapida } = this.state;
    const { contrato, accountAddress, tronWeb, t } = this.props;

    if (!contrato.ready) return;


    let precio = utils.normalizarNumero(await contrato.BRST_TRX_Proxy.RATE().call())

    this.setState({
      precioBrst: precio
    });

    contrato.BRST_TRX_Proxy.TRON_BALANCE().call()
      .then((enBrutus) => {
        this.setState({ enBrutus: utils.normalizarNumero(enBrutus) })
      })

    contrato.BRST_TRX_Proxy.TRON_PAY_BALANCE().call()
      .then((enPool) => {
        this.setState({ enPool: utils.normalizarNumero(enPool) })
      })

    contrato.BRST_TRX_Proxy.TRON_SOLICITADO().call()
      .then((solicitado) => {
        this.setState({ solicitado: utils.normalizarNumero(solicitado) })
      })

    contrato.BRST.totalSupply().call()
      .then((tokensEmitidos) => {
        this.setState({ tokensEmitidos: utils.normalizarNumero(tokensEmitidos) })
      })

    let misBRST = await contrato.BRST.balanceOf(accountAddress).call()
      .then((balanceBRST) => {
        balanceBRST = utils.normalizarNumero(balanceBRST)
        this.setState({
          balanceBRST: balanceBRST,
          misBRST: balanceBRST
        })
        return balanceBRST
      })

    contrato.USDT.balanceOf(accountAddress).call()
      .then((balanceUSDT) => {
        this.setState({ balanceUSDT: utils.normalizarNumero(balanceUSDT) })
      })

    contrato.USDD.balanceOf(accountAddress).call()
      .then((balanceUSDD) => {
        this.setState({ balanceUSDD: utils.normalizarNumero(balanceUSDD, 18) })
      })

    this.consultaPrecio();

    if (iniciado === 0) {
      this.grafico(1000, "day", 90, "trx");
      iniciado++;
    }


    if (parseInt(this.state.resultCalc) === 1000) {
      this.handleChangeCalc({ target: { value: misBRST } })
    }

    if (parseInt(document.getElementById("hold").value) === 0) {
      document.getElementById("hold").value = misBRST

    }

    //let balance = await tronWeb.trx.getBalance() / 10 ** 6;
    let balance = await tronWeb.trx.getUnconfirmedBalance(accountAddress)
      .catch(async (e) => {
        console.log(e.toString())
        return await tronWeb.trx.getBalance(accountAddress)
      })

    balance = balance / 10 ** 6;
    this.setState({
      balanceTRX: balance,
    })

    let cuenta = await tronWeb.trx.getAccountResources(accountAddress)
      .catch((e) => {
        console.log(e.toString())
        return {};
      })

    let penalty = (parseInt(await contrato.BRST_TRX_Proxy_fast.descuentoRapido().call()) / parseInt(await contrato.BRST_TRX_Proxy_fast.precision().call())) * 100
    this.setState({ penalty })
    let loteria = utils.normalizarNumero((await contrato.loteria._premio().call())[0])
    let retiroRapido = parseInt(await contrato.BRST_TRX_Proxy_fast.balance_token_1().call())
    retiroRapido = new BigNumber(retiroRapido).shiftedBy(-6).minus(loteria)
    if (retiroRapido < 0) retiroRapido = new BigNumber(0)
    this.setState({ retiroRapido })

    let userEnergy = 0

    if (cuenta.EnergyLimit) {
      userEnergy = cuenta.EnergyLimit
    }

    if (cuenta.EnergyUsed) {
      userEnergy -= cuenta.EnergyUsed
    }
    this.setState({ userEnergy })

    let eenergy = 65000;

    if (balance >= 1) {
      eenergy = (await this.calculoEnergy(rapida)).dp(0).toNumber()
    }

    this.setState({ eenergy })

    let useTrx = (await this.costEnergy(eenergy)).toString(10)
    this.setState({ useTrx })

    fetch(process.env.REACT_APP_API_URL + "api/v1/chartdata/brst?temporalidad=day&limite=" + tiempoPromediado)
      .then(async (r) => (await r.json()).Data)
      .then((consulta) => {
        if (consulta.length > 0) {

          let promE7to1day = consulta.reduce((acc, item) => acc + item.value, 0);
          promE7to1day = new BigNumber(promE7to1day / consulta.length).toNumber();

          let crecimientoPorcentual = this.state.varBrst;

          if (consulta.length >= 2) {
            const valorInicial = consulta[consulta.length - 1].value; // Primer valor del rango
            const valorFinal = consulta[0].value; // Ultimo valor del rango

            crecimientoPorcentual = ((valorFinal - valorInicial) / valorInicial) * 100;
            crecimientoPorcentual = crecimientoPorcentual / consulta.length;
          }

          let interesCompuesto = (1 + crecimientoPorcentual / 100) ** tiempoPromediado;

          this.setState({
            promE7to1day,
            crecimientoPorcentual,
            interesCompuesto,
          })
        }

      })
      .catch((e) => { return false })


    fetch(process.env.REACT_APP_API_URL + "api/v1/chartdata/brst?temporalidad=day&limite=361")
      .then(async (r) => (await r.json()).Data)
      .then((consultaData) => {
        if (consultaData.length > 0) {

          earnings = [];

          let dias = [1, 15, 30, 90, 180, 360]

          for (let index = 0; index < dias.length; index++) {

            earnings.push({
              dias: dias[index],
              trx: (misBRST * consultaData[0].value) - (misBRST * consultaData[dias[index]].value),
              diario: ((misBRST * consultaData[0].value) - (misBRST * consultaData[dias[index]].value)) / dias[index]
            })

          }

          this.setState({
            dataBRST: consultaData
          })
        }
      })
      .catch((e) => {
        console.error(e)
        return []
      })

    contrato.BRST_TRX_Proxy.MIN_DEPOSIT().call()
      .then((minCompra) => {
        this.setState({ minCompra: utils.normalizarNumero(minCompra) })
      })

    contrato.BRST.allowance(accountAddress, contrato.BRST_TRX_Proxy.address).call()
      .then((depositoBRUT) => {
        this.setState({ depositoBRUT: utils.normalizarNumero(depositoBRUT) })
      })

    fetch("https://brutusservices.com/api/v1/precio/usdt")
      .then((r) => r.json())
      .then((r) => {
        this.setState({ precioUSDT: new BigNumber(r.Data.oneTron) })
      })
      .catch((e) => { console.log(e) })

    fetch("https://brutusservices.com/api/v1/precio/usdd")
      .then((r) => r.json())
      .then((r) => {
        this.setState({ precioUSDD: new BigNumber(r.Data.oneTron) })
      })
      .catch((e) => { console.log(e) })


    let deposito = await contrato.BRST_TRX_Proxy.todasSolicitudes(accountAddress).call();
    let myids = []

    for (let index = 0; index < deposito.length; index++) {
      myids.push(parseInt(deposito[index]));
    }

    let deposits = await contrato.BRST_TRX_Proxy.solicitudesPendientesGlobales().call();
    deposits = deposits[0];

    let globDepositos = [];

    let tiempo = parseInt(await contrato.BRST_TRX_Proxy.TIEMPO().call()) * 1000;

    let diasDeEspera = (tiempo / (86400 * 1000)).toPrecision(2)

    let adminsBrst = ["TWVVi4x2QNhRJyhqa7qrwM4aSXnXoUDDwY", "TWqsREyZUtPkBNrzSSCZ9tbzP3U5YUxppf", "TB7RTxBPY4eMvKjceXj8SWjVnZCrWr4XvF"]

    let balance_Pool = new BigNumber(await tronWeb.trx.getBalance(contrato.BRST_TRX_Proxy.address)).shiftedBy(-6)

    let total_required = new BigNumber(0)

    this.setState({
      espera: tiempo,
      solicitudes: globDepositos.length,
      dias: diasDeEspera,

    })


    let isOwner = accountAddress === tronWeb.address.fromHex((await contrato.BRST_TRX_Proxy.owner().call()))
    let isAdmin = false;

    if (adminsBrst.indexOf(accountAddress) >= 0) {
      isAdmin = true;
    }

    this.setState({ isOwner, isAdmin })

    for (let index = 0; index < deposits.length; index++) {

      let pen = await contrato.BRST_TRX_Proxy.verSolicitudPendiente(deposits[index]).call();
      pen = pen[0];
      let inicio = parseInt(pen.tiempo) * 1000

      let pv = new Date(inicio + tiempo)

      let diasrestantes = ((inicio + tiempo - Date.now()) / (86400 * 1000)).toPrecision(2)

      let boton = <b>login with an authorized account</b>

      let cantidadTrx = new BigNumber(parseInt(pen.brst)).times(parseInt(pen.precio)).shiftedBy(-6)
      total_required = total_required.plus(cantidadTrx.dp(0))

      if (myids.includes(parseInt(deposits[index])) && diasrestantes > 0) {
        boton = (
          <button className="btn btn-info ms-4 disabled" disabled aria-disabled="true" >
            {"Processing Unfreeze TRX "} <i className="bi bi-exclamation-circle"></i>
          </button>
        )
      }

      if ((myids.includes(parseInt(deposits[index])) && diasrestantes <= 0) || isOwner) {


        if (balance_Pool.toNumber() < cantidadTrx.shiftedBy(-6).dp(6).toNumber()) {

          boton = (
            <button className="btn btn-info ms-4 disabled" disabled aria-disabled="true" >
              {t("We continue to unfreeze TRX") + " "} <i className="bi bi-exclamation-circle"></i>
            </button>
          )

        } else {

          boton = (
            <button className="btn btn-primary ms-4" onClick={async () => {
              await this.preClaim(parseInt(deposits[index]));
              this.estado()
            }}>
              {t("claim") + " "} <i className="bi bi-award"></i>
            </button>
          )

        }

      }


      if (diasrestantes <= 0) {
        diasrestantes = 0
      }

      if (myids.includes(parseInt(deposits[index])) || isOwner || isAdmin) {
        let extraData = <></>

        if (isOwner || isAdmin) {
          extraData = <><b>Wallet: </b><a target="_blank" rel="noopener noreferrer" href={"https://tronscan.org/#/address/" + tronWeb.address.fromHex(pen.wallet)}>{tronWeb.address.fromHex(pen.wallet)}</a><br></br></>
        }

        globDepositos[index] = (

          <div className="row mt-4" id={"sale-" + parseInt(deposits[index])} key={"glob" + parseInt(deposits[index])}>
            <div className="col-12 mb-2">

              <h4 className="fs-20 text-black">{t("brst.sale", { number: parseInt(deposits[index]) })} {" -> "}{parseInt(pen.brst) / 10 ** 6} BRST</h4>

            </div>
            <div className="col-sm-6 mb-2">
              <p className="mb-0 fs-14">
                {extraData}
                <b>Total: </b>{cantidadTrx.shiftedBy(-6).dp(6).toString(10)} TRX<br></br>
                <b>{t("brst.price")}</b> {(parseInt(pen.precio) / 10 ** 6)} TRX<br></br>
                <b>{t("brst.available")}</b> {pv.toString()}
              </p>
            </div>
            <div className="col-sm-6 mb-2">
              <p className="mb-0 fs-14">{t("brst.unStaking", { days: diasrestantes })}{cantidadTrx.shiftedBy(-6).dp(6).toString(10)} TRX</p>
              <br></br>
              {boton}
            </div>
            <div className="col-12 mb-2">

              <hr></hr>
            </div>

          </div>
        )
      }
    }

    total_required = total_required.shiftedBy(-6).toString(10)

    let ownerPanel = (<><input type="text" id="wallet" placeholder="wallet to white list"></input> <button className="btn btn-warning" onClick={async () => {
      let inputs = [
        { type: 'address', value: tronWeb.address.toHex(document.getElementById('wallet')) },
        //{ type: 'uint256', value: 405 * 10 ** 6 }
      ]

      let funcion = "whiteList_add(address)"
      try {

        let trigger = await tronWeb.transactionBuilder.triggerSmartContract(tronWeb.address.toHex(contrato.BRST_TRX_Proxy_fast.address), funcion, {}, inputs, tronWeb.address.toHex(accountAddress))
        let transaction = await tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
        transaction = await window.tronLink.tronWeb.trx.sign(transaction)

        transaction = await tronWeb.trx.sendRawTransaction(transaction)

        console.log(transaction)
        alert("Transaction " + transaction.result + " hash: " + transaction.txid)

      } catch (error) {
        console.log(error)
        alert(error.toString())
      }

    }}>ADD</button><br></br>
      TRON_RR: {utils.normalizarNumero(await contrato.BRST_TRX_Proxy.TRON_RR().call())}
      <br></br>


    </>)

    if (isAdmin || isOwner) {
      globDepositos.push(<div key="admin-panel">
        {isOwner ? ownerPanel : <></>}
        Balance Pool: {balance_Pool.toString(10)}

      </div>)
    }

    this.setState({
      globDepositos,
      total_required

    })

    let energyOn = false;
    let energi = 0;

    energyOn = await fetch(process.env.REACT_APP_BOT_URL)
      .then((r) => r.json())
      .then((r) => r.available)
      .catch(() => false)

    if (energyOn) {
      let consulta = await fetch(process.env.REACT_APP_BOT_URL + "available")
        .then((r) => r.json())

      if (consulta.av_energy.length > 0) {
        energi = consulta.av_energy[0].available
      }

      if (energi < consulta.total_energy_pool * 0.01) {
        energyOn = false;
      } else {
        energyOn = true;
      }
    }


    this.setState({
      energyOn,
    })

  }

  async preClaim(id) {

    let { userEnergy, energyOn } = this.state
    const { tronWeb, contrato, accountAddress, t } = this.props
    let eenergy = 0;

    let inputs = [
      { type: 'uint256', value: id }
    ]
    let funcion = "retirar(uint256)"
    const options = {}
    var transaccion = await tronWeb.transactionBuilder.triggerConstantContract(tronWeb.address.toHex(contrato.BRST_TRX_Proxy.address), funcion, options, inputs, tronWeb.address.toHex(accountAddress))
      .catch(() => { return {} })

    if (transaccion.energy_used) {
      eenergy += transaccion.energy_used;
    } else {
      eenergy += 80000;
    }

    if (eenergy > userEnergy && energyOn) {

      let requerido = eenergy - userEnergy

      if (requerido < 32000) {
        requerido = 32000;
      } else {
        requerido += 1000;
      }

      let body = { "resource": "energy", "amount": requerido, "duration": "5min" }
      let consultaPrecio = await fetch(process.env.REACT_APP_BOT_URL + "prices", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }).then((r) => r.json())

      let precio = new BigNumber(consultaPrecio.price).dp(6)

      let textoModal = t("brst.alert.energy", { returnObjects: true })

      this.setState({
        ModalTitulo: textoModal[0],
        ModalBody: <>{textoModal[1]} <b>{eenergy} {textoModal[2]}</b>{textoModal[3]}<b>{userEnergy} {textoModal[2]}</b> {textoModal[4]} <b>{requerido} {textoModal[2]}</b>{textoModal[5]}<b>{precio.toString(10)} TRX</b>{textoModal[6]}
          <br ></br><br ></br>
          <button type="button" className="btn btn-success" onClick={async () => {
            if (await this.rentEnergy(requerido)) {

              let inputs = [
                //{type: 'address', value: tronWeb.address.toHex("TTknL2PmKRSTgS8S3oKEayuNbznTobycvA")},
                { type: 'uint256', value: id }
              ]

              let funcion = "retirar(uint256)"
              const options = {}
              let trigger = await tronWeb.transactionBuilder.triggerSmartContract(tronWeb.address.toHex(contrato.BRST_TRX_Proxy.address), funcion, options, inputs, tronWeb.address.toHex(accountAddress))
              let transaction = await tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
              transaction = await window.tronLink.tronWeb.trx.sign(transaction)
                .catch((e) => {

                  this.setState({
                    ModalTitulo: "Error",
                    ModalBody: e.toString()
                  })

                  window.$("#mensaje-brst").modal("show");
                })
              transaction = await tronWeb.trx.sendRawTransaction(transaction)
                .then(() => {
                  this.setState({
                    ModalTitulo: "Result",
                    ModalBody: <>Retiro is Done {transaction.txid}
                      <br ></br><br ></br>
                      <button type="button" className="btn btn-success" onClick={() => { window.$("#mensaje-brst").modal("hide") }}>{t("accept")}</button>
                    </>
                  })

                  window.$("#mensaje-brst").modal("show");
                })



            }
          }}>{textoModal[7]}</button>

        </>
      })

      window.$("#mensaje-brst").modal("show");
    } else {

      let inputs = [
        //{type: 'address', value: tronWeb.address.toHex("TTknL2PmKRSTgS8S3oKEayuNbznTobycvA")},
        { type: 'uint256', value: id }
      ]

      let funcion = "retirar(uint256)"
      const options = {}
      let trigger = await tronWeb.transactionBuilder.triggerSmartContract(tronWeb.address.toHex(contrato.BRST_TRX_Proxy.address), funcion, options, inputs, tronWeb.address.toHex(accountAddress))
      let transaction = await tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
      transaction = await window.tronLink.tronWeb.trx.sign(transaction)
        .catch((e) => {

          this.setState({
            ModalTitulo: "Error",
            ModalBody: e.toString()
          })

          window.$("#mensaje-brst").modal("show");
        })
      transaction = await tronWeb.trx.sendRawTransaction(transaction)
        .then(() => {
          this.setState({
            ModalTitulo: "Result",
            ModalBody: <>Retiro is Done {transaction.txid}
              <br ></br><br ></br>
              <button type="button" className="btn btn-success" onClick={() => { window.$("#mensaje-brst").modal("hide") }}>{t("accept")}</button>
            </>
          })

          window.$("#mensaje-brst").modal("show");
        })

    }
  }

  subeobaja(valor) {
    var imgNPositivo = (<svg width="29" height="22" viewBox="0 0 29 22" fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d2)">
        <path d="M5 16C5.91797 14.9157 8.89728 11.7277 10.5 10L16.5 13L23.5 4"
          stroke="#2BC155" strokeWidth="2" strokeLinecap="round" ></path>
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
        <path d="M5 4C5.91797 5.08433 8.89728 8.27228 10.5 10L16.5 7L23.5 16" stroke="#FF2E2E" strokeWidth="2" strokeLinecap="round" ></path>
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

  async consultaPrecio() {

    return await fetch(process.env.REACT_APP_API_URL + 'api/v1/precio/brst')
      .then(async (r) => (await r.json()).Data)
      .then(r => {

        this.setState({
          varBrst: r.v24h
        })

        return r

      })
      .catch(err => { console.log(err); return 0; });

  }

  llenarBRST() {
    document.getElementById('amountTo').value = this.state.balanceBRST;
    //this.handleChangeBRST({ target: { value: this.state.balanceBRST } })

  }

  llenarTRX() {
    document.getElementById('amountFrom').value = this.state.balanceTRX;
    //this.handleChangeTRX({ target: { value: this.state.balanceTRX } })

  }

  async calculoEnergy(rapida = false) {
    let from = document.getElementById('currencySelectFrom').value
    let to = document.getElementById('currencySelectTo').value

    let { userEnergy } = this.state
    const { tronWeb, accountAddress, contrato } = this.props

    function tokenSelector(name) {

      let address = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"

      switch (name) {
        case "usdt":
          address = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
          break;

        case "usdd":
          address = "TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz"
          break;

        default:
          address = false
          break;
      }

      return address

    }

    let energyRequired = new BigNumber(0)

    let token = tokenSelector(from)

    if (token) {

      let sunswapRouter = "TCFNp179Lg46D16zKoumd4Poa2WFFdtqYj" // V3

      const options2 = {
        method: 'POST',
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({ value: sunswapRouter, visible: true })
      };

      let energyFactor = await fetch('https://api.trongrid.io/wallet/getcontract', options2)
        .then(res => res.json())
        .catch(err => { console.error(err); return {} });

      if (energyFactor.consume_user_resource_percent) {
        energyFactor = energyFactor.consume_user_resource_percent / 100
      } else {
        energyFactor = 1
      }

      let contract_base_token = tronWeb.contract(utils.TOKEN_ABI, token)
      let decimals_base = parseInt(await contract_base_token.decimals().call())

      let aprove = await contract_base_token.allowance(accountAddress, sunswapRouter).call()
      if (aprove.remaining) aprove = aprove.remaining
      aprove = parseInt(aprove)


      if (aprove <= 1 * 1e6) {

        let inputs = [
          { type: 'address', value: tronWeb.address.toHex(sunswapRouter) },
          { type: 'uint256', value: "115792089237316195423570985008687907853269984665640564039457584007913129639935" },
        ]

        let funcion = "approve(address,uint256)"
        const options = {}
        let trigger = await tronWeb.transactionBuilder.triggerConstantContract(tronWeb.address.toHex(token), funcion, options, inputs, tronWeb.address.toHex(accountAddress))
          .catch(() => { return {} })

        if (trigger.energy_used) {
          //console.log("aprovacion ", trigger.energy_used)
          energyRequired = energyRequired.plus(trigger.energy_used)
        }
      }


      let monto = new BigNumber(1).shiftedBy(decimals_base).dp(0).toString(10)

      let consulta = await fetch("https://rot.endjgfsv.link/swap/router?fromToken=" + token + "&toToken=T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb&amountIn=" + monto + "&typeList=SUNSWAP_V3,SUNSWAP_V2,WTRX")
        .then((r) => r.json())
        .then((r) => r.data[0])

      function distributeTokens(totalTokens, versions) {
        let result = new Array(versions.length).fill(0); // Inicializamos el array con ceros
        let remainingTokens = totalTokens;

        // Asignamos 1 token a cada elemento si hay suficientes tokens disponibles
        for (let i = 0; i < versions.length && remainingTokens > 0; i++) {
          result[i] = 1;
          remainingTokens--;
        }

        // Distribuimos los tokens restantes de forma balanceada
        let index = 0;
        while (remainingTokens > 0) {
          result[index]++;
          remainingTokens--;
          index = (index + 1) % versions.length; // Ciclar en el array
        }

        return result;
      }

      let inputs = [
        { type: 'address[]', value: consulta.tokens },
        { type: 'string[]', value: consulta.poolVersions },
        { type: 'uint256[]', value: distributeTokens(consulta.tokens.length, consulta.poolVersions) },
        { type: 'uint24[]', value: consulta.poolFees },
        {
          type: '(uint256,uint256,address,uint256)',
          value: [
            new BigNumber(consulta.amountIn).shiftedBy(decimals_base).dp(0).toString(10),
            new BigNumber(consulta.amountOut).times(0.995).shiftedBy(6).dp(0).toString(10),
            (tronWeb.address.toHex(accountAddress)).replace(/41/g, "0x"),
            ((parseInt(Date.now() / 1000)) + 100).toString(10)
          ]
        }

      ]

      let funcion = "swapExactInput(address[],string[],uint256[],uint24[],(uint256,uint256,address,uint256))"
      const options = { feeLimit: 10000 * 1e6, callValue: 0 }
      let trigger = await tronWeb.transactionBuilder.triggerConstantContract(tronWeb.address.toHex(sunswapRouter), funcion, options, inputs, tronWeb.address.toHex(accountAddress))
        .catch(() => { return {} })

      if (trigger.energy_used) {
        //console.log("swap ", trigger.energy_used * energyFactor)
        energyRequired = energyRequired.plus(trigger.energy_used * energyFactor)
      }

    }


    if (to === "brst") {

      let inputs = []

      let funcion = "staking()"
      const options = { callValue: 1 * 1e6 }
      let trigger = await tronWeb.transactionBuilder.triggerConstantContract(tronWeb.address.toHex(contrato.BRST_TRX_Proxy.address), funcion, options, inputs, tronWeb.address.toHex(accountAddress))
        .catch(() => { return {} })

      if (trigger.energy_used) {
        //console.log("staking ", trigger.energy_used)
        energyRequired = energyRequired.plus(trigger.energy_used);
      }


    } else {

      let inputs = [
        { type: 'uint256', value: "1000000" }
      ]

      let AddressContract = contrato.BRST_TRX_Proxy.address

      if (rapida) {
        AddressContract = contrato.BRST_TRX_Proxy_fast.address
      }

      let funcion = "esperaRetiro(uint256)"
      if (rapida) {
        funcion = "sell_token_2(uint256)"
      }
      const options = {}
      let trigger = await tronWeb.transactionBuilder.triggerConstantContract(tronWeb.address.toHex(AddressContract), funcion, options, inputs, tronWeb.address.toHex(accountAddress))
        .catch(() => { return {} })

      if (trigger.energy_used) {

        console.log("retiro ", trigger.energy_used, trigger)
        energyRequired = energyRequired.plus(trigger.energy_used);
      }

    }

    energyRequired = energyRequired.plus(1000)
    console.log("necesary ", energyRequired.toString(10))

    energyRequired = energyRequired.minus(userEnergy)
    console.log("requerido ", energyRequired.toString(10))

    if (energyRequired.toNumber() <= 0) {
      energyRequired = new BigNumber(0)
    } else {
      if (energyRequired.toNumber() < 32000) energyRequired = new BigNumber(32000);

    }

    console.log("send ", energyRequired.toString(10))

    return energyRequired

  }

  async costEnergy(cantidad) {

    cantidad = new BigNumber(cantidad).dp(0)

    if (cantidad.toNumber() === 0) return new BigNumber(0);

    let consulta = await fetch(process.env.REACT_APP_BOT_URL + "prices", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "resource": "energy", "amount": cantidad.toString(10), "duration": "5min" })
    }).then((r) => r.json())
      .catch((e) => {
        console.log(e)
        return false;
      })

    if (!consulta) return false;

    let useTrx = new BigNumber(consulta.price).dp(6)

    this.setState({ useTrx: useTrx.toString(10) })

    return useTrx

  }

  async rentEnergy(cantidad) {

    if (!BigNumber.isBigNumber(cantidad)) {
      cantidad = new BigNumber(cantidad)
    }

    cantidad = cantidad.dp(0).toNumber()

    const { tronWeb, accountAddress, t } = this.props
    let { energyOn } = this.state

    if (!energyOn) return false;

    if (cantidad <= 0) return true;
    if (cantidad < 32000) cantidad = 32000

    this.setState({
      ModalTitulo: <>Transaction Alert {imgLoading}</>,
      ModalBody: <>
        sign the following transaction if you agree to pay for the energy lease.
      </>
    })

    window.$("#mensaje-brst").modal("show");

    let retorno = false;

    let precio = await this.costEnergy(cantidad)

    if (!precio) return false;

    const unSignedTransaction = await tronWeb.transactionBuilder.sendTrx(process.env.REACT_APP_WALLET_API, tronWeb.toSun(precio), accountAddress);
    // using adapter to sign the transaction
    const signedTransaction = await window.tronWeb.trx.sign(unSignedTransaction)
      .catch((e) => {
        this.setState({
          ModalTitulo: "Transaction failed",
          ModalBody: <>{e.toString()}
            <br></br><br></br>
            <button type="button" className="btn btn-danger" onClick={() => { window.$("#mensaje-brst").modal("hide") }}>Close</button>
          </>
        })

        window.$("#mensaje-brst").modal("show");
        return false;
      })
    // broadcast the transaction

    if (!signedTransaction) { return false; }

    this.setState({
      ModalTitulo: <>Processing your order {imgLoading}</>,
      ModalBody: <>
        One of our robots is going to pick up your energy to deliver it to you as soon as possible, this will not take long please wait.
      </>
    })

    window.$("#mensaje-brst").modal("show");

    let consulta2 = await utils.rentResource(accountAddress, "energy", cantidad, "5", "min", precio, signedTransaction);

    if (consulta2.result) {

      this.setState({
        ModalTitulo: t("brst.alert.done", { returnObjects: true })[0],
        ModalBody: <>{t("brst.alert.done", { returnObjects: true })[1]}<br></br><button type="button" data-bs-dismiss="modal" className="btn btn-success">{t("brst.alert.done", { returnObjects: true })[2]}</button></>
      })

      window.$("#mensaje-brst").modal("show");

      retorno = true

    } else {

      this.setState({
        ModalTitulo: t("brst.alert.error", { returnObjects: true })[0],
        ModalBody: t("brst.alert.error", { returnObjects: true, hash: consulta2.hash, msg: consulta2.msg })[1]
      })

      window.$("#mensaje-brst").modal("show");

    }

    return retorno

  }

  async preExchange(rapida = false) {

    let { userEnergy } = this.state

    let eenergy = (await this.calculoEnergy(rapida)).dp(0)
    let precio = await this.costEnergy(eenergy)

    console.log(eenergy.toString(10))

    if (eenergy.toNumber() > 0) {

      this.setState({
        ModalTitulo: "Energy Notice",
        ModalBody: <>
          This operation requires <b>{eenergy.plus(userEnergy).dp(0).toNumber().toLocaleString('en-US')} energy</b><br></br><br></br>

          you have <b>{userEnergy.toLocaleString('en-US')} energy</b><br></br>
          Rent <b>{eenergy.toNumber().toLocaleString('en-US')} energy</b> for <b>{precio.toString(10)} TRX</b>
          <br ></br><br ></br>
          <button type="button" className="btn btn-success" onClick={async () => {
            if (await this.rentEnergy(eenergy)) {
              this.exchangeTokens(rapida)
            }
          }}>Rent Energy </button>

          <button type="button" className="btn btn-danger" onClick={async () => {

            this.exchangeTokens(rapida)
          }}>Proceed without renting energy </button>


        </>
      })

      window.$("#mensaje-brst").modal("show");

    } else {
      this.exchangeTokens(rapida)

    }


  }

  async exchangeTokens(rapida = false) {
    let from = document.getElementById('currencySelectFrom').value
    let to = document.getElementById('currencySelectTo').value

    switch (from + "_" + to) {

      case "usdt_brst":
        this.suawpTokenFromTRX(0)
        break;

      case "usdd_brst":
        this.suawpTokenFromTRX(1)

        break;

      case "brst_trx":
        this.venta(rapida)
        break;

      default:
        // TRX -> BRST
        this.compra()
        break;
    }
  }

  async suawpTokenFromTRX(select = 0) {

    const { tronWeb, accountAddress, t } = this.props
    let { precioUSDT, precioUSDD } = this.state

    // TOKEN => TRX
    let token = select === 0 ? "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" : "TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz" //USDT : USDD

    let currentPrice = select === 0 ? precioUSDT : precioUSDD

    let sunswapRouter = "TCFNp179Lg46D16zKoumd4Poa2WFFdtqYj" // V3

    let contrato = tronWeb.contract(utils.SUNSWAPV3_ABI, sunswapRouter)
    //console.log(contrato)

    let contract_base_token = tronWeb.contract(utils.TOKEN_ABI, token)
    let decimals_base = parseInt(await contract_base_token.decimals().call())

    let balance_usdt = new BigNumber(parseInt(await contract_base_token.balanceOf(accountAddress).call())).shiftedBy(-decimals_base)

    let monto = document.getElementById("amountFrom").value;
    monto = monto.replace(/,/g, ".")
    monto = new BigNumber(monto)

    if (balance_usdt.dp(2).toNumber() < 1 || monto.toNumber() > balance_usdt.toNumber()) {
      this.setState({
        ModalTitulo: "ALERT",
        ModalBody: (<>
          Sorry, you don't have enough {await contract_base_token.name().call()} to complete this operation.
        </>)
      })

      window.$("#mensaje-brst").modal("show");

      return "false";

    }

    let aprove = await contract_base_token.allowance(accountAddress, sunswapRouter).call()
    if (aprove.remaining) aprove = aprove.remaining
    aprove = parseInt(aprove)
    //console.log(aprove)
    if (aprove <= balance_usdt.toNumber()) {

      this.setState({
        ModalTitulo: <>Token Alert {imgLoading}</>,
        ModalBody: (<>Approve unlimited future exchanges</>)
      })

      window.$("#mensaje-brst").modal("show");

      let inputs = [
        { type: 'address', value: tronWeb.address.toHex(sunswapRouter) },
        { type: 'uint256', value: "115792089237316195423570985008687907853269984665640564039457584007913129639935" },
      ]

      let funcion = "approve(address,uint256)"
      const options = {}
      let trigger = await tronWeb.transactionBuilder.triggerSmartContract(tronWeb.address.toHex(contract_base_token.address), funcion, options, inputs, tronWeb.address.toHex(accountAddress))

      let transaction = await tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);

      transaction = await window.tronLink.tronWeb.trx.sign(transaction)
        .catch((e) => {

          this.setState({
            ModalTitulo: t("brst.alert.nonEfective", { returnObjects: true })[0],
            ModalBody: t("brst.alert.nonEfective", { returnObjects: true })[1] + " | " + e.toString()
          })

          window.$("#mensaje-brst").modal("show");
          return false
        })
      if (!transaction) return;
      transaction = await tronWeb.trx.sendRawTransaction(transaction)
        .then(() => {
          this.setState({
            ModalTitulo: <>Token Alert {imgLoading}</>,
            ModalBody: <>Approval done, continue the process</>
          })

          window.$("#mensaje-brst").modal("show");
          return true;
        }).catch((e) => {

          this.setState({
            ModalTitulo: <>Error{imgLoading}</>,
            ModalBody: <>{e.toString()}</>
          })

          window.$("#mensaje-brst").modal("show");

          return false;
        })
      if (!transaction) return;


    }

    let consulta = await fetch("https://rot.endjgfsv.link/swap/router?fromToken=" + token + "&toToken=T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb&amountIn=" + monto.shiftedBy(decimals_base).dp(0).toString(10) + "&typeList=SUNSWAP_V3,SUNSWAP_V2,WTRX")
      .then((r) => r.json())
      .then((r) => r.data[0])

    function distributeTokens(totalTokens, versions) {
      let result = new Array(versions.length).fill(0); // Inicializamos el array con ceros
      let remainingTokens = totalTokens;

      // Asignamos 1 token a cada elemento si hay suficientes tokens disponibles
      for (let i = 0; i < versions.length && remainingTokens > 0; i++) {
        result[i] = 1;
        remainingTokens--;
      }

      // Distribuimos los tokens restantes de forma balanceada
      let index = 0;
      while (remainingTokens > 0) {
        result[index]++;
        remainingTokens--;
        index = (index + 1) % versions.length; // Ciclar en el array
      }

      return result;
    }

    let inputs = [
      { type: 'address[]', value: consulta.tokens },
      { type: 'string[]', value: consulta.poolVersions },
      { type: 'uint256[]', value: distributeTokens(consulta.tokens.length, consulta.poolVersions) },
      { type: 'uint24[]', value: consulta.poolFees },
      {
        type: '(uint256,uint256,address,uint256)',
        value: [
          new BigNumber(consulta.amountIn).shiftedBy(decimals_base).dp(0).toString(10),
          new BigNumber(consulta.amountOut).times(0.995).shiftedBy(6).dp(0).toString(10),
          (tronWeb.address.toHex(accountAddress)).replace(/41/g, "0x"),
          ((parseInt(Date.now() / 1000)) + 100).toString(10)
        ]
      }

    ]

    let funcion = "swapExactInput(address[],string[],uint256[],uint24[],(uint256,uint256,address,uint256))"
    const options = { feeLimit: 10000 * 1e6, callValue: 0 }
    let trigger = await tronWeb.transactionBuilder.triggerSmartContract(tronWeb.address.toHex(contrato.address), funcion, options, inputs, tronWeb.address.toHex(accountAddress))
    let transaction = await tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);

    transaction = await window.tronLink.tronWeb.trx.sign(transaction)
      .catch((e) => {

        this.setState({
          ModalTitulo: t("brst.alert.nonEfective", { returnObjects: true })[0],
          ModalBody: t("brst.alert.nonEfective", { returnObjects: true })[1] + " | " + e.toString()
        })

        window.$("#mensaje-brst").modal("show");
        return false
      })
    if (!transaction) return;
    transaction = await tronWeb.trx.sendRawTransaction(transaction)
      .then(() => {
        this.setState({
          ModalTitulo: <>Swap Alert {imgLoading}</>,
          ModalBody: <>Swap done, continue the process</>
        })

        window.$("#mensaje-brst").modal("show");
      })

    await utils.delay(3)

    this.compra(monto.div(currentPrice))
  }

  async compra(amount = new BigNumber(0)) {
    const { tronWeb, contrato, accountAddress, t } = this.props

    if (amount.toNumber() <= 0) {
      amount = parseFloat(document.getElementById("amountFrom").value);
      amount = new BigNumber(amount)

    }

    amount = amount.shiftedBy(6).dp(0).toNumber()

    if (amount <= 0) {

      this.setState({
        ModalTitulo: t("brst.alert.errorInput", { returnObjects: true })[0],
        ModalBody: <>{t("brst.alert.errorInput", { returnObjects: true })[1]}
          <br></br><br ></br>
          <button type="button" className="btn btn-danger" onClick={() => { window.$("#mensaje-brst").modal("hide") }}>{t("close")}</button>
        </>

      })

      return;
    }

    const { minCompra } = this.state;

    let balance = await tronWeb.trx.getUnconfirmedBalance();

    if (balance >= amount) {
      if (amount >= minCompra) {

        let inputs = [
          //{type: 'address', value: tronWeb.address.toHex("TTknL2PmKRSTgS8S3oKEayuNbznTobycvA")},
          //{type: 'uint256', value: '1000000'}
        ]

        let funcion = "staking()"
        const options = { callValue: amount }
        let trigger = await tronWeb.transactionBuilder.triggerSmartContract(tronWeb.address.toHex(contrato.BRST_TRX_Proxy.address), funcion, options, inputs, tronWeb.address.toHex(accountAddress))
        let transaction = await tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
        transaction = await window.tronLink.tronWeb.trx.sign(transaction)
          .catch((e) => {

            this.setState({
              ModalTitulo: t("brst.alert.nonEfective", { returnObjects: true })[0],
              ModalBody: t("brst.alert.nonEfective", { returnObjects: true })[1] + " | " + e.toString()
            })

            window.$("#mensaje-brst").modal("show");
            return false
          })
        if (!transaction) return;
        transaction = await tronWeb.trx.sendRawTransaction(transaction)
          .then(() => {
            this.setState({
              ModalTitulo: t("brst.alert.compra", { returnObjects: true })[0],
              ModalBody: <>{t("brst.alert.compra", { returnObjects: true })[1]}
                <br ></br><br ></br>
                <button type="button" className="btn btn-success" onClick={() => { window.$("#mensaje-brst").modal("hide") }}>{t("accept")}</button>
              </>
            })

            window.$("#mensaje-brst").modal("show");
          })


      } else {
        document.getElementById("amountFrom").value = minCompra;
        this.setState({
          ModalTitulo: t("error"),
          ModalBody: t("brst.alert.errGreater", { returnObjects: true, min: minCompra })[0]
        })

        window.$("#mensaje-brst").modal("show");

      }

    } else {

      document.getElementById("amountFrom").value = "";
      this.setState({
        ModalTitulo: t("error"),
        ModalBody: t("brst.alert.errFunds", { returnObjects: true, min: minCompra })[0]
      })

      window.$("#mensaje-brst").modal("show");

    }

    await utils.delay(5);
    this.estado();


  };

  async venta(rapida) {

    const { t } = this.props
    const { minventa } = this.state;

    let amount = document.getElementById("amountFrom").value;
    amount = amount.replace(/,/g, ".")
    amount = new BigNumber(amount).shiftedBy(6)

    let { accountAddress, contrato, tronWeb } = this.props;

    let AddressContract = tronWeb.address.toHex(contrato.BRST_TRX_Proxy.address)
    if (rapida) {
      AddressContract = tronWeb.address.toHex(contrato.BRST_TRX_Proxy_fast.address);
    }

    let aprovado = await contrato.BRST.allowance(accountAddress, AddressContract).call();
    aprovado = parseInt(aprovado);

    if (aprovado <= amount.toNumber()) {

      this.setState({
        ModalTitulo: <>BRST Aproval</>,
        ModalBody: <>sign the following transaction to confirm Token Aproval</>
      })

      window.$("#mensaje-brst").modal("show");

      let inputs = [
        { type: 'address', value: AddressContract },
        { type: 'uint256', value: "115792089237316195423570985008687907853269984665640564039457584007913129639935" }
      ]

      let funcion = "approve(address,uint256)"
      const options = {}
      let trigger = await tronWeb.transactionBuilder.triggerSmartContract(tronWeb.address.toHex(contrato.BRST.address), funcion, options, inputs, tronWeb.address.toHex(accountAddress))
      let transaction = await tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
      transaction = await window.tronLink.tronWeb.trx.sign(transaction)
        .catch((e) => {

          this.setState({
            ModalTitulo: "Error",
            ModalBody: e.toString()
          })

          window.$("#mensaje-brst").modal("show");
        })
      transaction = await tronWeb.trx.sendRawTransaction(transaction)
        .then(() => {
          this.setState({
            ModalTitulo: <>Result</>,
            ModalBody: <>BRST Aproval is Done {transaction.txid}</>
          })

          window.$("#mensaje-brst").modal("show");
        })

      aprovado = await contrato.BRST.allowance(accountAddress, AddressContract).call();
      aprovado = parseInt(aprovado);

    }

    if (aprovado >= amount.toNumber()) {

      if (amount.toNumber() >= minventa && true) {

        this.setState({
          ModalTitulo: <>Withdrawal process {imgLoading}</>,
          ModalBody: <>
            sign the following transaction to confirm your withdrawal.
          </>
        })

        window.$("#mensaje-brst").modal("show");

        let inputs = [
          { type: 'uint256', value: amount.toString(10) }
        ]

        let funcion = "esperaRetiro(uint256)"
        if (rapida) {
          funcion = "sell_token_2(uint256)"
        }
        const options = {}
        let trigger = await tronWeb.transactionBuilder.triggerSmartContract(AddressContract, funcion, options, inputs, tronWeb.address.toHex(accountAddress))
        let transaction = await tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
        transaction = await window.tronLink.tronWeb.trx.sign(transaction)
          .catch((e) => {

            this.setState({
              ModalTitulo: "Error",
              ModalBody: e.toString()
            })

            window.$("#mensaje-brst").modal("show");
          })
        transaction = await tronWeb.trx.sendRawTransaction(transaction)
          .then(() => {
            this.setState({
              ModalTitulo: "Operation result",
              ModalBody: <>Your withdrawal was successfully processed <a href={"https://tronscan.org/#/transaction/" + transaction.txid} rel="noreferrer noopener" target="_blank" >{transaction.txid}</a>
                <br ></br><br ></br>
                <button type="button" className="btn btn-success" onClick={() => { window.$("#mensaje-brst").modal("hide") }}>{t("accept")}</button>
              </>
            })

            window.$("#mensaje-brst").modal("show");
          })


        if (!rapida) {
          document.getElementById("request-brst").scrollIntoView();
        }


      } else {
        this.setState({
          ModalTitulo: "Info",
          ModalBody: `Enter a value greater than ${minventa} BRST`
        })

        window.$("#mensaje-brst").modal("show");

        document.getElementById("amountFrom").value = minventa;
      }


    } else {

      if (amount > aprovado) {
        if (aprovado <= 0) {
          this.setState({
            ModalTitulo: "Info",
            ModalBody: "You do not have enough aproved funds in your account you place at least " + minventa + " BRST"
          })

          window.$("#mensaje-brst").modal("show");
        } else {
          this.setState({
            ModalTitulo: "Info",
            ModalBody: "You must leave 21 TRX free in your account to make the transaction"
          })

          window.$("#mensaje-brst").modal("show");
        }

      } else {

        this.setState({
          ModalTitulo: "Info",
          ModalBody: "You must leave 21 TRX free in your account to make the transaction"
        })

        window.$("#mensaje-brst").modal("show");

      }

      document.getElementById("amountFrom").value = minventa;


    }

    this.estado();


  };


  async grafico(time, temporalidad, cantidad, selector) {

    let { precioBrst, precioUSDT, precioUSDD } = this.state

    if (!document.getElementById('chartdiv-brst')) return;

    if (this.root) {
      this.root.dispose();
    }

    const root = am5.Root.new("chartdiv-brst");
    root._logo.dispose();
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
    let downColor = root.interfaceColors.get("negative");
    let upColor = root.interfaceColors.get("positive");

    let previousValue = 0;
    let previousColor;
    let previousDataObj;

    function generateData(data, alt) {
      let value = data.value
      if (alt) {
        let encontrado = data.valor_alt.find((obj) => obj.coin === alt)

        if (encontrado) {
          value = encontrado.valor
        } else {
          value = 0
        }
      }

      let color = downColor;

      if (value >= previousValue) {
        color = upColor;
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

    let lastPrice = precioBrst

    switch (selector) {
      case "usdt":
        lastPrice = lastPrice * precioUSDT
        break;

      case "usdd":
        lastPrice = lastPrice * precioUSDD
        break;

      default:
        selector = false
        break;
    }
    let lastData = { date: Date.now(), value: lastPrice };

    //console.log(lastData)

    async function generateDatas(count) {

      let consulta = await fetch(process.env.REACT_APP_API_URL + "api/v1/chartdata/brst?temporalidad=" + temporalidad + "&limite=" + count)
        .then(async (r) => (await r.json()).Data)
        .catch(() => { return false })

      if (consulta) {
        previousValue = 0;
        previousColor = "";
        previousDataObj = "";
        let data = []
        for (var i = consulta.length - 1; i >= 0; --i) {
          data.push(generateData(consulta[i], selector));
        }

        data.push(lastData)


        return data;
      } else {
        return false;
      }

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
    if (data) {
      series.data.setAll(data);
      sbSeries.data.setAll(data);
    }

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/


    series.appear(time);
    chart.appear(time, time / 10);

    this.root = root;
  }

  render() {

    const { contrato, t } = this.props
    let { from, to, valueFrom, precioBrst, minCompra, minventa, days, diasCalc, temporalidad, tiempoPromediado, isOwner, isAdmin, globDepositos, crecimientoPorcentual, userEnergy, rapida, penalty, retiroRapido, dias, balanceUSDT, balanceUSDD, balanceBRST, balanceTRX, valueTo } = this.state;

    minCompra = "Min. " + minCompra + " " + from.toUpperCase();
    minventa = "Min. " + minventa + " " + to.toUpperCase();

    let opciones;

    if (temporalidad === "hour") {
      opciones = optionsHours
    } else {
      opciones = options2
    }

    let retiradas = <></>

    if (from + "_" + to === "brst_trx") {
      retiradas = (<div className="row mb-3">
        <div className="col-12 text-center">
          <input type="checkbox" checked={rapida} readOnly onClick={() => { this.setState({ rapida: !rapida }) }} style={{ cursor: "pointer" }}></input> <b>Quick:</b> request up to <b>{retiroRapido.dp(1).toString(10)} TRX</b> with a <b>{penalty}% fee.</b><br></br>
          <input type="checkbox" checked={!rapida} readOnly onClick={() => { this.setState({ rapida: !rapida }) }} style={{ cursor: "pointer" }}></input> <b>Regular:</b> request the <b>total</b> with a <b>{dias} days</b> waiting period.
        </div>
      </div>)
    }

    let swapButton =
      <button className="btn btn-success" style={{ width: "100%" }} onClick={() => this.preExchange(rapida)}>
        Swap {(this.state.from).toUpperCase() + " -> " + (this.state.to).toUpperCase()}
      </button>

    if (to === "trx" && rapida && retiroRapido.toNumber() < valueTo.toNumber()) {
      swapButton = <button className="btn btn-warning" style={{ width: "100%" }} >
        Enter a lower amount or change to regular withdrawal
      </button>
    }

    if (valueFrom.toNumber() < 1) {
      swapButton = <button className="btn btn-warning" style={{ width: "100%" }} >
        The minimum to operate is {1} {from.toUpperCase()}
      </button>
    }

    let balance = balanceTRX
    switch (from) {
      case "usdt":
        balance = balanceUSDT
        break;
      case "usdd":
        balance = balanceUSDD
        break;
      case "brst":
        balance = balanceBRST
        break;

      default:
        break;
    }

    if (valueFrom.toNumber() > balance) {
      swapButton = <button className="btn btn-danger" style={{ width: "100%" }} >
        Not enough {from.toUpperCase()} top up to proceed
      </button>
    }

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
                        <h4 className="heading m-0">{t("tokenChart", { token: "BRST" })}</h4>
                        <span className="fs-16">Brutus Tron Staking </span>
                      </div>
                      <div className="dropdown bootstrap-select">

                        <select className="image-select default-select dashboard-select" id="selector" aria-label="Default" tabIndex="0" style={{ background: "rgb(3 0 8 / 20%)" }} onInput={(r) => {

                          this.grafico(500, this.state.temporalidad, this.state.cantidadDatos, document.getElementById("selector").value);
                        }}>
                          <option value="trx">TRX (Tron)</option>
                          <option value="usdd">USDD (Decentralized USD)</option>
                          <option value="usdt">USD₮ (Tether)</option>
                        </select>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                          <div className="price-content">
                            <span className="fs-18 d-block mb-2">{t("price")}</span>
                            <h4 className="fs-20 font-w600">{this.state.precioBrst} TRX</h4>
                          </div>
                          <div className="price-content">
                            <span className="fs-14 d-block mb-2">24h% change</span>
                            <h4 className="font-w600 text-success">{(this.state.varBrst).toFixed(4)}<i className="fa-solid fa-caret-up ms-1 text-success"></i></h4>
                          </div>
                          <div className="price-content">
                            <span className="fs-14 d-block mb-2">{t("circulating")}</span>
                            <h4 className="font-w600">{(this.state.tokensEmitidos * 1).toFixed(2)} BRST</h4>
                          </div>
                          <div className="price-content">
                            <span className="fs-14 d-block mb-2">{t("endorse")}</span>
                            <h4 className="font-w600">{(this.state.enBrutus * 1).toFixed(2)} TRX</h4>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3" id="chartdiv-brst" style={{ height: "400px", backgroundColor: "white" }}></div>


                      <select className="btn-secondary style-1 default-select" style={{ backgroundColor: 'white' }} value={this.state.cantidadDatos} onChange={this.handleChange2}>
                        {opciones.map((option) => (
                          <option key={option.label.toString()} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {" | "}
                      <select className="btn-secondary style-1 default-select" style={{ backgroundColor: 'white' }} value={this.state.temporalidad} onChange={this.handleChange}>
                        {options.map((option) => (
                          <option key={option.label.toString()} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>


                <div className="col-xl-3 col-xxl-3 col-sm-6 wow fadeInRight" data-wow-delay="0.3s">
                  <div className="card digital-cash">
                    <div className="card-body">
                      <div className="text-center">
                        <div className="media d-block">
                          <img
                            onClick={() => {

                              const {tronWeb, accountAddress} = this.props
                              this.setState({
                                ModalTitulo: t("brst.alert.donate", { returnObjects: true })[0],
                                ModalBody: (
                                  <>

                                    TRX:
                                    <input type="number" id="trxD" className="form-control mb-3" placeholder="Amount"></input>
                                    <button
                                      type="button"
                                      className="btn btn-success w-100 mb-3"
                                      onClick={async () => {
                                        let donacion = document.getElementById('trxD').value;
                                        donacion = new BigNumber(donacion).shiftedBy(6).dp(0);

                                        let inputs = [
                                          //{type: 'address', value: tronWeb.address.toHex("TTknL2PmKRSTgS8S3oKEayuNbznTobycvA")},
                                          //{type: 'uint256', value: '1000000'}
                                        ]

                                        let funcion = "donate()"
                                        const options = { callValue: donacion }
                                        let trigger = await tronWeb.transactionBuilder.triggerSmartContract(tronWeb.address.toHex(contrato.BRST_TRX_Proxy.address), funcion, options, inputs, tronWeb.address.toHex(accountAddress))
                                        let transaction = await tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
                                        transaction = await window.tronLink.tronWeb.trx.sign(transaction)
                                          .catch((e) => {

                                            this.setState({
                                              ModalTitulo: t("brst.alert.nonEfective", { returnObjects: true })[0],
                                              ModalBody: t("brst.alert.nonEfective", { returnObjects: true })[1] + " | " + e.toString()
                                            })

                                            window.$("#mensaje-brst").modal("show");
                                            return false
                                          })
                                        if (!transaction) return;
                                        transaction = await tronWeb.trx.sendRawTransaction(transaction)
                                          .then(() => {
                                            this.setState({
                                              ModalTitulo: t("brst.alert.compra", { returnObjects: true })[0],
                                              ModalBody: <>{t("brst.alert.compra", { returnObjects: true })[1]}
                                                <br ></br><br ></br>
                                                <button type="button" className="btn btn-success" onClick={() => { window.$("#mensaje-brst").modal("hide") }}>{t("accept")}</button>
                                              </>
                                            })

                                            window.$("#mensaje-brst").modal("show");
                                          })



                                      }}
                                    >
                                      {t("brst.alert.donate", { returnObjects: true })[3]}
                                    </button>
                                    BRST
                                    <input type="number" id="brstD" className="form-control mb-3" placeholder="Amount"></input>
                                    <button
                                      type="button"
                                      className="btn btn-success w-100 mb-3"
                                      onClick={async() => {
                                        let donacion = document.getElementById('brstD').value;
                                        donacion = new BigNumber(donacion).shiftedBy(6).dp(0);


                                        let inputs = [
                                          //{type: 'address', value: tronWeb.address.toHex("TTknL2PmKRSTgS8S3oKEayuNbznTobycvA")},
                                          {type: 'uint256', value: donacion}
                                        ]

                                        let funcion = "donate(uint256)"
                                        const options = { }
                                        let trigger = await tronWeb.transactionBuilder.triggerSmartContract(tronWeb.address.toHex(contrato.BRST_TRX_Proxy.address), funcion, options, inputs, tronWeb.address.toHex(accountAddress))
                                        let transaction = await tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
                                        transaction = await window.tronLink.tronWeb.trx.sign(transaction)
                                          .catch((e) => {

                                            this.setState({
                                              ModalTitulo: t("brst.alert.nonEfective", { returnObjects: true })[0],
                                              ModalBody: t("brst.alert.nonEfective", { returnObjects: true })[1] + " | " + e.toString()
                                            })

                                            window.$("#mensaje-brst").modal("show");
                                            return false
                                          })
                                        if (!transaction) return;
                                        transaction = await tronWeb.trx.sendRawTransaction(transaction)
                                          .then(() => {
                                            this.setState({
                                              ModalTitulo: t("brst.alert.compra", { returnObjects: true })[0],
                                              ModalBody: <>{t("brst.alert.compra", { returnObjects: true })[1]}
                                                <br ></br><br ></br>
                                                <button type="button" className="btn btn-success" onClick={() => { window.$("#mensaje-brst").modal("hide") }}>{t("accept")}</button>
                                              </>
                                            })

                                            window.$("#mensaje-brst").modal("show");
                                          })



                                        contrato.BRST_TRX_Proxy['donate(uint256)'](donacion.toString(10)).send()
                                          .then(() => {
                                            this.setState({
                                              ModalTitulo: t("brst.alert.donate", { returnObjects: true })[1],
                                              ModalBody: t("brst.alert.donate", { returnObjects: true })[2]
                                            });
                                            window.$("#mensaje-brst").modal("show");
                                            this.estado();
                                          });
                                      }}
                                    >
                                      {t("brst.alert.donate", { returnObjects: true })[3]}
                                    </button>
                                  </>
                                )
                              });
                              window.$("#mensaje-brst").modal("show");
                            }}
                            src="images/brst.png"
                            width="100%"
                            alt="brutus tron staking"
                          />
                          <div className="media-content">
                            <h4 className="mt-0 mt-md-4 fs-20 font-w700 text-black mb-0">{t("brst.aStaking")}</h4>
                            <span className="font-w600 text-black">Brutus</span>
                            <span className="my-4 fs-16 font-w600 d-block">1 BRST = {this.state.precioBrst} TRX</span>
                            <p className="text-start">{t("brst.description")}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer p-2 border-0">
                      <a href="https://brutus.finance/brutusblog.html" className="btn btn-link text-primary">{t("brst.button.readM")}</a>
                    </div>
                  </div>
                </div>


                <div className="col-xl-6 col-sm-6 wow fadeInUp" data-wow-delay="0.4s">


                  <div className="card quick-trade">
                    <div className="card-header pb-0 border-0 flex-wrap">
                      <div>
                        <h4 className="heading mb-0">{t("brst.exchange")} V4.1</h4>
                      </div>
                    </div>
                    <div className="container">
                      <div className="row">

                        <div className="col-12 pb-2">From</div>
                        <div className="col-2 ">
                          <img height="42px" src={"/images/token/" + this.state.from + ".png"} alt="tron logo" />
                        </div>
                        <div className="col-3" style={{ paddingLeft: "0px", paddingRight: "0px" }}>
                          <select
                            style={{ color: "white", backgroundColor: "var(--primary)", cursor: "pointer", borderRadius: "0.625rem 0 0 0.625rem" }}
                            className="form-select"
                            id="currencySelectFrom"
                            onChange={this.handleCurrencyChangeFrom} // Manejador para cambios en la selección
                          >
                            <option value="trx">TRX </option>
                            <option value="usdt">USDT </option>
                            <option value="usdd">USDD </option>
                            <option value="brst">BRST </option>

                          </select>
                        </div>
                        <div className="col-7" style={{ paddingLeft: "0px" }}>
                          <input className="form-control form-control text-end" style={{ borderRadius: "0 0.625rem 0.625rem 0" }} type="number" id="amountFrom" onInput={() => this.calcExchange(false, this.state.from + "_" + this.state.to)} placeholder={minCompra} min={this.state.minCompra} step={0.1} ></input>

                        </div>
                      </div>

                      <hr></hr>

                      <div className="row">
                        <div className="col-12 pb-2">To</div>
                        <div className="col-2">
                          <img height="42px" src={"/images/token/" + this.state.to + ".png"} alt="brst logo" />
                        </div>
                        <div className="col-3" style={{ paddingLeft: "0px", paddingRight: "0px" }}>
                          <select
                            style={{ color: "white", backgroundColor: "var(--primary)", cursor: "pointer", borderRadius: "0.625rem 0 0 0.625rem" }}
                            className="form-select"
                            id="currencySelectTo"
                            onChange={this.handleCurrencyChangeTo} // Manejador para cambios en la selección
                          >
                            <option value="brst">BRST </option>
                            <option value="trx">TRX </option>

                          </select>
                        </div>

                        <div className="col-7" style={{ paddingLeft: "0px" }}>

                          <input className="form-control form-control text-end" style={{ borderRadius: "0 0.625rem 0.625rem 0" }} type="number" id="amountTo" onInput={() => this.calcExchange(true, this.state.to + "_" + this.state.from)} placeholder={minventa} min={this.state.minventa} step={0.0001} ></input>

                        </div>
                      </div>



                    </div>
                    <div className="card-footer border-0">
                      {retiradas}
                      <div className="row">

                        <div className="col-12 text-center">
                          {swapButton}

                        </div>
                      </div>
                      <div className="d-flex mt-2" style={{ justifyContent: "space-between" }}>
                        <p className="mb-0 fs-14">{t("brst.energy", { e1: (userEnergy).toLocaleString('en-US') })}</p>
                        <p className="mb-0 fs-14">Fee ~ {this.state.useTrx} TRX</p>


                      </div>
                    </div>
                  </div>


                </div>
                <div className="col-xl-6 col-sm-12 wow fadeInUp" data-wow-delay="0.6s">
                  <div className="card price-list">
                    <div className="card-header border-0 pb-2">
                      <div className="chart-title">
                        <h4 className=" mb-0" style={{ color: "var(--primary)" }}>{t("mya")}</h4>
                      </div>
                    </div>
                    <div className="card-body p-3 py-0">
                      <div className="table-responsive">
                        <table className="table text-center bg-warning-hover order-tbl">
                          <thead>
                            <tr>
                              <th className="text-left">{t("token")}</th>
                              <th className="text-center">{t("amount")}</th>
                              <th className="text-center">{t("value")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ cursor: "pointer" }} onClick={() => { this.llenarBRST() }}>
                              <td className="text-left">BRST</td>
                              <td>{this.state.balanceBRST}</td>
                              <td>{new BigNumber(this.state.balanceBRST * this.state.precioBrst * this.state.precioUSDD).dp(2).toNumber().toLocaleString("en-US")} USDD</td>

                            </tr>
                            <tr style={{ cursor: "pointer" }} onClick={() => { this.llenarTRX() }}>
                              <td className="text-left">TRX</td>
                              <td>{this.state.balanceTRX}</td>
                              <td>{new BigNumber(this.state.balanceTRX * this.state.precioUSDD).dp(2).toNumber().toLocaleString("en-US")} USDD</td>

                            </tr>
                            <tr style={{ cursor: "pointer" }} onClick={() => { this.llenarTRX() }}>
                              <td className="text-left">USDT</td>
                              <td>{this.state.balanceUSDT.toLocaleString("en-US")}</td>
                              <td>--.--</td>

                            </tr>
                            <tr style={{ cursor: "pointer" }} onClick={() => { this.llenarTRX() }}>
                              <td className="text-left">USDD</td>
                              <td>{this.state.balanceUSDD.toLocaleString("en-US")}</td>
                              <td>--.--</td>

                            </tr>

                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="card-footer text-center py-3 border-0">
                      <a href="/" className="btn-link text-black">{t("showM")}<i className="fa fa-caret-right"></i></a>
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
              <h4 className="card-title">Your last earnings staking </h4>
              <h6 className="card-subtitle">{this.state.misBRST} BRST = {(this.state.misBRST * this.state.precioBrst).toFixed(3)} TRX</h6>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover table-responsive-sm">
                  <thead>
                    <tr>
                      <th>{t("day")}</th>
                      <th>{t("earned")}</th>
                      <th>{t("brst.dailyG")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.map((objeto) => (
                      <tr key={objeto.dias.toString()}>
                        <th>{t("brst.daysAgo", { days: objeto.dias })}</th>
                        <td>{(objeto.trx).toFixed(6)} TRX</td>
                        <td className="color-primary">{(objeto.diario).toFixed(6)} TRX/{t("day")} </td>
                      </tr>))}

                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12" id="request-brst">
          <div className="card">
            <div className="card-header d-sm-flex d-block pb-0 border-0">
              <div>
                <h4 className="fs-20 text-black">{t("brst.request", { returnObjects: true, number: isOwner || isAdmin ? globDepositos.length - 1 : globDepositos.length })[0]}
                  <button className="btn  btn-success text-white" onClick={() => this.estado()}>
                    {t("brst.request", { returnObjects: true })[1]} <i className="bi bi-arrow-repeat"></i>
                  </button></h4>
                <p className="mb-0 fs-12">{t("brst.request", { returnObjects: true })[2]}</p>
              </div>

            </div>
            <div className="card-body">
              {globDepositos}
            </div>

          </div>
        </div>

        <div className="col-lg-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">{t("brst.estimate")} <br></br> APR {(crecimientoPorcentual * 360).toFixed(3)} %</h4><br></br>

              <h6 className="card-subtitle" style={{ cursor: "pointer" }} onClick={() => { document.getElementById("hold").value = this.state.balanceBRST; this.handleChangeCalc({ target: { value: this.state.balanceBRST } }) }}>
                {t("brst.mystaking")}{this.state.misBRST} BRST = {(this.state.misBRST * this.state.precioBrst).toFixed(3)} TRX
              </h6>
            </div>
            <div className="card-body">

              <b>Days Average: </b>
              <input type="number" id="daysProm" defaultValue={tiempoPromediado} placeholder={tiempoPromediado + " days"} min={1} step={1} onInput={async () => {
                let daysProm = parseInt(document.getElementById('daysProm').value);
                await this.setState({ tiempoPromediado: isNaN(daysProm) ? 1 : daysProm });
                this.estado();
              }} ></input>

              <div className="table-responsive overflow-scroll" style={{ marginTop: "30px", height: "420px", border: "2px solid rgba(207, 207, 207, 0.97)", borderRadius: "10px" }}>

                <table className="table table-hover table-responsive-sm">

                  <tbody>
                    <tr>
                      <th>
                        Days Hold<br></br>
                        <input type="number" id="days" defaultValue={diasCalc} onInput={this.handleChangeDias} ></input><br></br><br></br>
                        <button className="btn btn-primary" onClick={() => { days = days.unshift({ days: diasCalc, amount: parseFloat((document.getElementById('hold').value).replace(/,/g, ".")), time: Date.now(), APY: crecimientoPorcentual }) }}>Calculate</button>

                      </th>
                      <th>
                        Your BRST<br></br>
                        <input type="number" id="hold" defaultValue={0} onInput={this.handleChangeCalc} ></input>
                      </th>

                    </tr>
                  </tbody>
                </table>
                <table className="table table-hover table-responsive-sm">
                  <thead>
                    <tr>
                      <th>{t("day", { count: 10 })}</th>
                      <th>{t("brst.hold")}</th>
                      <th>{t("brst.estimateIn")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((obj) => {

                      obj.amount = parseFloat(obj.amount);
                      obj.amount = isNaN(obj.amount) || obj.amount <= 0 ? this.state.misBRST : obj.amount;
                      obj.days = isNaN(obj.days) ? 1 : obj.days;
                      obj.time = isNaN(obj.time) ? Date.now() : obj.time;

                      return (
                        <tr key={"prospect-days-" + obj.days + "-" + obj.amount + "-" + obj.time}>
                          <th>{obj.days}</th>
                          <td>{obj.amount} BRST<br>
                          </br>{(obj.amount * precioBrst).toFixed(3)} TRX</td>
                          <td>{((obj.amount * precioBrst * ((crecimientoPorcentual * obj.days) / 100))).toFixed(6)} TRX</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
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
                <b>Token:</b> <a target="_blank" rel="noopener noreferrer" href={"https://tronscan.org/#/contract/" + utils.BRST + "/code"}>{utils.BRST}</a>
                <br ></br>
                <b>Regular withdrawals:</b> <a target="_blank" rel="noopener noreferrer" href={"https://tronscan.org/#/contract/" + utils.ProxySC2 + "/code"}>{utils.ProxySC2}</a>
                <br ></br>
                <b>Fast withdrawals:</b> <a target="_blank" rel="noopener noreferrer" href={"https://tronscan.org/#/contract/" + utils.ProxySC3 + "/code"}>{utils.ProxySC3}</a>
              </p>
            </div>
          </div>
        </div>

      </div>

      <div className="modal fade" id="mensaje-brst">
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
  }
}

export default withTranslation()(Staking);
