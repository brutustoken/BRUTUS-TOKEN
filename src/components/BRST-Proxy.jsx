import React, { Component } from "react";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import utils from "../utils";

const BigNumber = require('bignumber.js');
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

export default class Staking extends Component {
  constructor(props) {
    super(props);

    this.state = {

      minCompra: 1,
      minventa: 1,
      deposito: props.i18n.t("loading") + "...",
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
      temporalidad: props.i18n.t("day"),
      cantidadDatos: 30,
      dias: props.i18n.t("loading") + "...",
      varBrut: 0,
      precioBrst: 0,
      varBrst: 0,
      misBRST: 0,
      dataBRST: [],
      contractEnergy: 0,
      ModalTitulo: "",
      ModalBody: "",
      tiempoPromediado: 3,
      promE7to1day: 0,
      resultCalc: 0,
      diasCalc: 1,
      brutCalc: 1000,
      balanceBRST: 0,
      balanceTRX: 0,
      globDepositos: [],
      eenergy: 62000,
      energyOn: false,
      conexion: false,
      total_required: 0

    };


    this.subeobaja = this.subeobaja.bind(this);
    this.textoE = this.textoE.bind(this);
    this.consultaPrecio = this.consultaPrecio.bind(this);
    this.grafico = this.grafico.bind(this);

    this.preCompra = this.preCompra.bind(this);
    this.compra = this.compra.bind(this);

    this.preVenta = this.preVenta.bind(this);
    this.venta = this.venta.bind(this);
    this.sell = this.sell.bind(this);

    this.estado = this.estado.bind(this);
    this.preClaim = this.preClaim.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleChange2 = this.handleChange2.bind(this);

    this.handleChangeBRST = this.handleChangeBRST.bind(this);
    this.handleChangeTRX = this.handleChangeTRX.bind(this);

    this.handleChangeDias = this.handleChangeDias.bind(this);
    this.handleChangeCalc = this.handleChangeCalc.bind(this);

    this.llenarBRST = this.llenarBRST.bind(this);
    this.llenarTRX = this.llenarTRX.bind(this);

    this.rentEnergy = this.rentEnergy.bind(this);

  }

  componentDidMount() {

    document.title = "BRST | Brutus.Finance"
    document.getElementById("tittle").innerText = this.props.i18n.t("brst.tittle")

    setTimeout(() => {
      this.estado();

    }, 4 * 1000);

    setInterval(() => {
      this.estado();
    }, 60 * 1000);

  }

  componentWillUnmount() {
    if (this.root) {
      this.root.dispose();
    }
  }

  async estado() {

    if(!this.props.contrato.ready) return;

    //console.log((await this.props.contrato.BRST_TRX_Proxy.totalDisponible().call()).toNumber())
    //console.log((await this.props.contrato.BRST_TRX_Proxy.TRON_PAY_BALANCE_WHITE().call()).toNumber())
    //console.log((await this.props.contrato.BRST_TRX_Proxy.TRON_PAY_BALANCE_FAST().call()).toNumber())

    let precio = await this.props.contrato.BRST_TRX_Proxy.RATE().call();
    precio = new BigNumber(precio.toNumber()).shiftedBy(-6).toNumber();

    this.setState({
      precioBrst: precio
    });

    let enBrutus = await this.props.contrato.BRST_TRX_Proxy.TRON_BALANCE().call();
    let enPool = await this.props.contrato.BRST_TRX_Proxy.TRON_PAY_BALANCE().call();
    let solicitado = await this.props.contrato.BRST_TRX_Proxy.TRON_SOLICITADO().call();
    let tokensEmitidos = await this.props.contrato.BRST.totalSupply().call();


    this.setState({

      enBrutus: enBrutus.toNumber() / 1e6,
      enPool: enPool.toNumber() / 1e6,
      solicitado: solicitado.toNumber() / 1e6,
      tokensEmitidos: tokensEmitidos.toNumber() / 1e6,

    });

    if (!this.state.conexion) {

      this.setState({
        conexion: true
      })

      this.consultaPrecio();

      if (iniciado === 0) {
        this.grafico(1000, "day", 90, precio);
        iniciado++;
      }


      let misBRST = await this.props.contrato.BRST.balanceOf(this.props.accountAddress).call()
        .then((result) => { return result.toNumber() / 1e6 })
        .catch(() => { ; return 0 })

      document.getElementById("hold").value = misBRST

      this.setState({
        misBRST: misBRST
      })

      //let balance = await this.props.tronWeb.trx.getBalance() / 10 ** 6;
      let balance = await this.props.tronWeb.trx.getUnconfirmedBalance(this.props.accountAddress) / 10 ** 6;
      let cuenta = await this.props.tronWeb.trx.getAccountResources(this.props.accountAddress);

      await utils.delay(1)
      let contractEnergy = 0

      if (cuenta.EnergyLimit) {
        contractEnergy = cuenta.EnergyLimit
      }

      if (cuenta.EnergyUsed) {
        contractEnergy -= cuenta.EnergyUsed
      }

      let eenergy = {};

      if (balance >= 1) {
        let inputs = [
          //{type: 'address', value: this.props.tronWeb.address.toHex("TTknL2PmKRSTgS8S3oKEayuNbznTobycvA")},
          //{type: 'uint256', value: '1000000'}
        ]

        let funcion = "staking()"
        const options = { callValue: '1000000' }
        eenergy = await this.props.tronWeb.transactionBuilder.triggerConstantContract(this.props.tronWeb.address.toHex(this.props.contrato.BRST_TRX_Proxy.address), funcion, options, inputs, this.props.tronWeb.address.toHex(this.props.accountAddress))
          .catch(() => { return {} })
      }

      if (eenergy.energy_used) {
        eenergy = eenergy.energy_used
      } else {
        eenergy = 65000
      }

      let useTrx = parseInt(contractEnergy / eenergy)
      if (useTrx >= 1) {
        useTrx = 1
      } else {
        useTrx = "20 ~ 40"
      }


      let consulta = await fetch(process.env.REACT_APP_API_URL + "api/v1/chartdata/brst?temporalidad=hour&limite=72")
        .then(async (r) => (await r.json()).Data)
        .catch((e) => { return false })

      //console.log(consulta)

      if (consulta) {
        let promE7to1day = (((consulta[0].value - consulta[71].value) / (consulta[71].value)) * 100) / this.state.tiempoPromediado
        this.setState({
          promE7to1day
        })
      }

      let consultaData = await fetch(process.env.REACT_APP_API_URL + "api/v1/chartdata/brst?temporalidad=day&limite=360")
        .then(async (r) => (await r.json()).Data)
        .catch((e) => { return false })

      if (consultaData) {

        earnings = [];

        let dias = [1, 15, 30, 90, 180, 360]

        for (let index = 0; index < dias.length; index++) {
          earnings.push({
            dias: dias[index],
            trx: (misBRST * this.state.precioBrst) - (misBRST * consultaData[dias[index] - 1].value),
            diario: ((misBRST * this.state.precioBrst) - (misBRST * consultaData[dias[index] - 1].value)) / dias[index]
          })

        }

        this.setState({
          dataBRST: consultaData
        })
      }

      this.setState({
        useTrx: useTrx,
        contractEnergy: contractEnergy,
        balanceTRX: balance,
      })

      let MIN_DEPOSIT = await this.props.contrato.BRST_TRX_Proxy.MIN_DEPOSIT().call();

      MIN_DEPOSIT = parseInt(MIN_DEPOSIT._hex) / 10 ** 6;

      let aprovadoBRUT = await this.props.contrato.BRST.allowance(this.props.accountAddress, this.props.contrato.BRST_TRX_Proxy.address).call();
      aprovadoBRUT = parseInt(aprovadoBRUT._hex);

      await utils.delay(1)

      let balanceBRST = await this.props.contrato.BRST.balanceOf(this.props.accountAddress).call();
      balanceBRST = parseInt(balanceBRST._hex) / 10 ** 6;

      let deposito = await this.props.contrato.BRST_TRX_Proxy.todasSolicitudes(this.props.accountAddress).call();
      let myids = []

      for (let index = 0; index < deposito.length; index++) {
        myids.push(parseInt(deposito[index]._hex));

      }

      let deposits = await this.props.contrato.BRST_TRX_Proxy.solicitudesPendientesGlobales().call();
      deposits = deposits[0];

      let globDepositos = [];

      let tiempo = parseInt((await this.props.contrato.BRST_TRX_Proxy.TIEMPO().call())._hex) * 1000;

      let diasDeEspera = (tiempo / (86400 * 1000)).toPrecision(2)

      let adminsBrst = ["TWVVi4x2QNhRJyhqa7qrwM4aSXnXoUDDwY", "TWqsREyZUtPkBNrzSSCZ9tbzP3U5YUxppf", "TB7RTxBPY4eMvKjceXj8SWjVnZCrWr4XvF"]

      let balance_Pool = new BigNumber(await this.props.tronWeb.trx.getBalance(this.props.contrato.BRST_TRX_Proxy.address)).shiftedBy(-6)

      let total_required = new BigNumber(0)

      this.setState({
        minCompra: MIN_DEPOSIT,
        depositoBRUT: aprovadoBRUT,
        balanceBRST: balanceBRST,
        balanceTRX: balance,
        espera: tiempo,
        solicitudes: globDepositos.length,
        dias: diasDeEspera,
        eenergy: eenergy,
      })

      //console.log(this.props.tronWeb.address.fromHex((await this.props.contrato.BRST_TRX_Proxy.owner().call())))

      let isOwner = this.props.accountAddress === this.props.tronWeb.address.fromHex((await this.props.contrato.BRST_TRX_Proxy.owner().call()))
      let isAdmin = false;

      if (adminsBrst.indexOf(this.props.accountAddress) >= 0) {
        isAdmin = true;
      }


      for (let index = 0; index < deposits.length; index++) {

        let pen = await this.props.contrato.BRST_TRX_Proxy.verSolicitudPendiente(parseInt(deposits[index]._hex)).call();
        pen = pen[0];
        //console.log(pen)
        let inicio = parseInt(pen.tiempo._hex) * 1000

        let pv = new Date(inicio + tiempo)

        let diasrestantes = ((inicio + tiempo - Date.now()) / (86400 * 1000)).toPrecision(2)

        let boton = <b>login with an authorized account</b>

        let cantidadTrx = new BigNumber(parseInt(pen.brst._hex)).times(parseInt(pen.precio._hex)).shiftedBy(-6)
        total_required = total_required.plus(cantidadTrx.dp(0))

        if (myids.includes(parseInt(deposits[index]._hex)) && diasrestantes > 0) {
          boton = (
            <button className="btn btn-info ms-4 disabled" disabled aria-disabled="true" >
              {"Processing Unfreeze TRX "} <i className="bi bi-exclamation-circle"></i>
            </button>
          )
        }
        //console.log(balance_Pool.toNumber(), cantidadTrx.shiftedBy(-6).dp(6).toNumber())

        if ((myids.includes(parseInt(deposits[index]._hex)) && diasrestantes <= 0) || isOwner) {


          if (balance_Pool.toNumber() < cantidadTrx.shiftedBy(-6).dp(6).toNumber()) {

            boton = (
              <button className="btn btn-info ms-4 disabled" disabled aria-disabled="true" >
                {this.props.i18n.t("We continue to unfreeze TRX") + " "} <i className="bi bi-exclamation-circle"></i>
              </button>
            )

          } else {

            boton = (
              <button className="btn btn-primary ms-4" onClick={async () => {
                await this.preClaim(parseInt(deposits[index]._hex));
                this.estado()
              }}>
                {this.props.i18n.t("claim") + " "} <i className="bi bi-award"></i>
              </button>
            )

          }

        }


        if (diasrestantes <= 0) {
          diasrestantes = 0
        }

        if (myids.includes(parseInt(deposits[index]._hex)) || isOwner || isAdmin) {
          let extraData = <></>

          if (isOwner || isAdmin) {
            extraData = <><b>Wallet: </b><a target="_blank" rel="noopener noreferrer" href={"https://tronscan.org/#/address/" + this.props.tronWeb.address.fromHex(pen.wallet)}>{this.props.tronWeb.address.fromHex(pen.wallet)}</a><br></br></>
          }

          globDepositos[index] = (

            <div className="row mt-4" id={"sale-" + parseInt(deposits[index]._hex)} key={"glob" + parseInt(deposits[index]._hex)}>
              <div className="col-12 mb-2">

                <h4 className="fs-20 text-black">{this.props.i18n.t("brst.sale", { number: parseInt(deposits[index]._hex) })} {" -> "}{parseInt(pen.brst._hex) / 10 ** 6} BRST</h4>

              </div>
              <div className="col-sm-6 mb-2">
                <p className="mb-0 fs-14">
                  {extraData}
                  <b>Total: </b>{cantidadTrx.shiftedBy(-6).dp(6).toString(10)} TRX<br></br>
                  <b>{this.props.i18n.t("brst.price")}</b> {(parseInt(pen.precio._hex) / 10 ** 6)} TRX<br></br>
                  <b>{this.props.i18n.t("brst.available")}</b> {pv.toString()}
                </p>
              </div>
              <div className="col-sm-6 mb-2">
                <p className="mb-0 fs-14">{this.props.i18n.t("brst.unStaking", { days: diasrestantes })}{cantidadTrx.shiftedBy(-6).dp(6).toString(10)} TRX</p>
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

      /**
       * 
       * <input type="text" id="wallet"/> <button className="btn btn-warning" onClick={async()=>{
            let inputs = [
              {type: 'address', value: this.props.tronWeb.address.toHex(document.getElementById('wallet'))},
              //{ type: 'uint256', value: 405 * 10 ** 6 }
            ]

            let funcion = "whiteList_add(address)"
            try {

              let trigger = await this.props.tronWeb.transactionBuilder.triggerSmartContract(this.props.tronWeb.address.toHex(this.props.contrato.BRST_TRX_Proxy_fast.address), funcion, {}, inputs, this.props.tronWeb.address.toHex(this.props.accountAddress))
              let transaction = await this.props.tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
              transaction = await window.tronLink.tronWeb.trx.sign(transaction)

              transaction = await this.props.tronWeb.trx.sendRawTransaction(transaction)

              console.log(transaction)
              alert("Transaction "+transaction.result+" hash: "+transaction.txid)
              
            } catch (error) {
              console.log(error)
              alert(error.toString())
            }
            
          }}>AW</button><br></br>

        **/
      if(isAdmin || isOwner){
        globDepositos.push(<div key="admin-panel">
          
          Balance Pool: {balance_Pool.toString(10)}
        </div>)
      }


      this.setState({
        globDepositos: globDepositos,
        total_required: total_required

      })

      if (parseInt(this.state.resultCalc) === 0) {
        this.handleChangeCalc({ target: { value: misBRST } })
      }

      let energyOn = false;

      try {

        energyOn = await fetch("https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL)
          .then((r) => r.json())

        energyOn = energyOn.available

        let consulta = await fetch("https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL + "available")
          .then((r) => r.json())

        let energi = consulta.av_energy[0].available

        if (energi < consulta.total_energy_pool * 0.01) {
          energyOn = false;
        } else {
          energyOn = true;
        }


      } catch (error) {
        console.log(error.toString())
        energyOn = false;
      }

      this.setState({
        energyOn,
        conexion: false
      })

    }


  }

  async preClaim(id) {

    var eenergy = 0;

    let inputs = [
      { type: 'uint256', value: id }
    ]
    let funcion = "retirar(uint256)"
    const options = {}
    var transaccion = await this.props.tronWeb.transactionBuilder.triggerConstantContract(this.props.tronWeb.address.toHex(this.props.contrato.BRST_TRX_Proxy.address), funcion, options, inputs, this.props.tronWeb.address.toHex(this.props.accountAddress))
      .catch(() => { return {} })

    if (transaccion.energy_used) {
      eenergy += transaccion.energy_used;
    } else {
      eenergy += 80000;
    }

    if (eenergy > this.state.contractEnergy && this.state.energyOn) {

      let requerido = eenergy - this.state.contractEnergy

      if (requerido < 32000) {
        requerido = 32000;
      } else {
        requerido += 1000;
      }

      let body = { "resource": "energy", "amount": requerido, "duration": "5min" }
      let consultaPrecio = await fetch("https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL + "prices", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }).then((r) => r.json())

      let precio = new BigNumber(consultaPrecio.price).dp(6)

      //console.log(precio)

      let textoModal = this.props.i18n.t("brst.alert.energy", { returnObjects: true })

      this.setState({
        ModalTitulo: textoModal[0],
        ModalBody: <>{textoModal[1]} <b>{eenergy} {textoModal[2]}</b>{textoModal[3]}<b>{this.state.contractEnergy} {textoModal[2]}</b> {textoModal[4]} <b>{requerido} {textoModal[2]}</b>{textoModal[5]}<b>{precio.toString(10)} TRX</b>{textoModal[6]}
          <br ></br><br ></br>
          <button type="button" className="btn btn-success" onClick={async () => {
            if (await this.rentEnergy(requerido)) {

              let inputs = [
                //{type: 'address', value: this.props.tronWeb.address.toHex("TTknL2PmKRSTgS8S3oKEayuNbznTobycvA")},
                { type: 'uint256', value: id }
              ]

              let funcion = "retirar(uint256)"
              const options = {}
              let trigger = await this.props.tronWeb.transactionBuilder.triggerSmartContract(this.props.tronWeb.address.toHex(this.props.contrato.BRST_TRX_Proxy.address), funcion, options, inputs, this.props.tronWeb.address.toHex(this.props.accountAddress))
              let transaction = await this.props.tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
              transaction = await window.tronLink.tronWeb.trx.sign(transaction)
                .catch((e) => {

                  this.setState({
                    ModalTitulo: "Error",
                    ModalBody: e.toString()
                  })

                  window.$("#mensaje-brst").modal("show");
                })
              transaction = await this.props.tronWeb.trx.sendRawTransaction(transaction)
                .then(() => {
                  this.setState({
                    ModalTitulo: "Result",
                    ModalBody: <>Retiro is Done {transaction.txid}
                      <br ></br><br ></br>
                      <button type="button" className="btn btn-success" onClick={() => { window.$("#mensaje-brst").modal("hide") }}>{this.props.i18n.t("accept")}</button>
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
        //{type: 'address', value: this.props.tronWeb.address.toHex("TTknL2PmKRSTgS8S3oKEayuNbznTobycvA")},
        { type: 'uint256', value: id }
      ]

      let funcion = "retirar(uint256)"
      const options = {}
      let trigger = await this.props.tronWeb.transactionBuilder.triggerSmartContract(this.props.tronWeb.address.toHex(this.props.contrato.BRST_TRX_Proxy.address), funcion, options, inputs, this.props.tronWeb.address.toHex(this.props.accountAddress))
      let transaction = await this.props.tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
      transaction = await window.tronLink.tronWeb.trx.sign(transaction)
        .catch((e) => {

          this.setState({
            ModalTitulo: "Error",
            ModalBody: e.toString()
          })

          window.$("#mensaje-brst").modal("show");
        })
      transaction = await this.props.tronWeb.trx.sendRawTransaction(transaction)
        .then(() => {
          this.setState({
            ModalTitulo: "Result",
            ModalBody: <>Retiro is Done {transaction.txid}
              <br ></br><br ></br>
              <button type="button" className="btn btn-success" onClick={() => { window.$("#mensaje-brst").modal("hide") }}>{this.props.i18n.t("accept")}</button>
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

  handleChange(e) {
    let evento = e.target.value;
    this.grafico(500, evento, this.state.cantidadDatos, this.state.precioBrst);
    this.setState({ temporalidad: evento });
  }

  handleChange2(e) {
    let evento = parseInt(e.target.value);
    this.grafico(500, this.state.temporalidad, evento, this.state.precioBrst);
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

  //calculo del exchange 

  handleChangeBRST(event) {
    let dato = event.target.value;
    dato = parseFloat(("" + dato).replace(/,/g, "."))
    let oper = dato * this.state.precioBrst;
    oper = parseInt(oper * 1e6) / 1e6;
    this.setState({
      valueBRST: dato,
      valueTRX: oper
    });
    document.getElementById('amountTRX').value = oper;
  }

  handleChangeTRX(event) {
    let dato = event.target.value;
    dato = parseFloat(dato.replace(/,/g, "."))
    let oper = dato / this.state.precioBrst
    oper = parseInt(oper * 1e6) / 1e6;
    this.setState({
      valueTRX: dato,
      valueBRST: oper,
    });
    document.getElementById('amountBRST').value = oper;

  }

  llenarBRST() {
    document.getElementById('amountBRST').value = this.state.balanceBRST;
    this.handleChangeBRST({ target: { value: this.state.balanceBRST } })

  }

  llenarTRX() {
    document.getElementById('amountTRX').value = this.state.balanceTRX;
    this.handleChangeTRX({ target: { value: this.state.balanceTRX } })

  }

  async rentEnergy(cantidad) {

    let retorno = false;


    let body = { "resource": "energy", "amount": cantidad, "duration": "5min" }
    let precios = await fetch("https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL + "prices", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then((r) => r.json())

    let precio = new BigNumber(precios.price).dp(6).toNumber()

    this.setState({
      ModalTitulo: <>{this.props.i18n.t("brst.alert.renergy", { returnObjects: true })[0]}{imgLoading}</>,
      ModalBody: <>{this.props.i18n.t("brst.alert.renergy", { returnObjects: true })[1]} </>
    })

    window.$("#mensaje-brst").modal("show");

    const unSignedTransaction = await this.props.tronWeb.transactionBuilder.sendTrx(process.env.REACT_APP_WALLET_API, this.props.tronWeb.toSun(precio), this.props.accountAddress);
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

    let consulta2 = await utils.rentResource(this.props.accountAddress, "energy", cantidad, "5", "min", precio, signedTransaction);

    if (consulta2.result) {

      this.setState({
        ModalTitulo: this.props.i18n.t("brst.alert.done", { returnObjects: true })[0],
        ModalBody: <>{this.props.i18n.t("brst.alert.done", { returnObjects: true })[1]}<br></br><button type="button" data-bs-dismiss="modal" className="btn btn-success">{this.props.i18n.t("brst.alert.done", { returnObjects: true })[2]}</button></>
      })

      window.$("#mensaje-brst").modal("show");

      retorno = true

    } else {

      this.setState({
        ModalTitulo: this.props.i18n.t("brst.alert.error", { returnObjects: true })[0],
        ModalBody: this.props.i18n.t("brst.alert.error", { returnObjects: true, hash: consulta2.hash, msg: consulta2.msg })[1]
      })

      window.$("#mensaje-brst").modal("show");

    }

    return retorno

  }



  async preCompra() {

    var amount = document.getElementById("amountTRX").value;
    amount = parseInt(parseFloat(amount) * 10 ** 6);

    if (amount <= 0) {

      this.setState({
        ModalTitulo: this.props.i18n.t("brst.alert.errorInput", { returnObjects: true })[0],
        ModalBody: <>{this.props.i18n.t("brst.alert.errorInput", { returnObjects: true })[1]}
          <br></br><br ></br>
          <button type="button" className="btn btn-danger" onClick={() => { window.$("#mensaje-brst").modal("hide") }}>{this.props.i18n.t("close")}</button>
        </>

      })

      return;
    }

    var eenergy = {};

    let inputs = [
      //{type: 'address', value: this.props.tronWeb.address.toHex("TTknL2PmKRSTgS8S3oKEayuNbznTobycvA")},
      //{type: 'uint256', value: '1000000'}
    ]

    let funcion = "staking()"
    const options = { callValue: amount }
    eenergy = await this.props.tronWeb.transactionBuilder.triggerConstantContract(this.props.tronWeb.address.toHex(this.props.contrato.BRST_TRX_Proxy.address), funcion, options, inputs, this.props.tronWeb.address.toHex(this.props.accountAddress))
      .catch(() => { return {} })


    if (eenergy.energy_used) {
      eenergy = eenergy.energy_used;
    } else {
      eenergy = 80000;
    }

    if (eenergy > this.state.contractEnergy && this.state.energyOn) {

      var requerido = eenergy - this.state.contractEnergy

      if (requerido < 32000) {
        requerido = 32000;
      } else {
        requerido += 1000;
      }

      var body = { "resource": "energy", "amount": requerido, "duration": "5min" }
      var consultaPrecio = await fetch("https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL + "prices", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }).then((r) => r.json())

      var precio = new BigNumber(consultaPrecio.price).dp(6)

      let alerta = this.props.i18n.t("brst.alert.energyNotice", { returnObjects: true })

      this.setState({
        ModalTitulo: alerta[0],
        ModalBody: <>{alerta[1]}<b>{eenergy} {alerta[2]}</b>, {alerta[3]}<b>{this.state.contractEnergy} {alerta[2]} </b>{alerta[4]} <b>{requerido} {alerta[2]}</b>{alerta[5]} <b>{precio.toString(10)} TRX</b> {alerta[6]}
          <br ></br><br ></br>
          <button type="button" className="btn btn-success" onClick={async () => {
            if (await this.rentEnergy(requerido)) {
              this.compra()
            }
          }}>{this.props.i18n.t("rentE")}</button>
        </>
      })

      window.$("#mensaje-brst").modal("show");
    } else {
      this.compra()
    }
  }

  async compra() {

    const { minCompra } = this.state;

    var amount = document.getElementById("amountTRX").value;
    amount = parseInt(parseFloat(amount) * 10 ** 6);

    var balance = await this.props.tronWeb.trx.getUnconfirmedBalance();

    if (balance >= amount) {
      if (amount >= minCompra) {

        let inputs = [
          //{type: 'address', value: this.props.tronWeb.address.toHex("TTknL2PmKRSTgS8S3oKEayuNbznTobycvA")},
          //{type: 'uint256', value: '1000000'}
        ]

        let funcion = "staking()"
        const options = { callValue: amount }
        let trigger = await this.props.tronWeb.transactionBuilder.triggerSmartContract(this.props.tronWeb.address.toHex(this.props.contrato.BRST_TRX_Proxy.address), funcion, options, inputs, this.props.tronWeb.address.toHex(this.props.accountAddress))
        let transaction = await this.props.tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
        transaction = await window.tronLink.tronWeb.trx.sign(transaction)
          .catch((e) => {

            this.setState({
              ModalTitulo: this.props.i18n.t("brst.alert.nonEfective", { returnObjects: true })[0],
              ModalBody: this.props.i18n.t("brst.alert.nonEfective", { returnObjects: true })[1] + " | " + e.toString()
            })

            window.$("#mensaje-brst").modal("show");
          })
        console.log(transaction)
        transaction = await this.props.tronWeb.trx.sendRawTransaction(transaction)
          .then(() => {
            this.setState({
              ModalTitulo: this.props.i18n.t("brst.alert.compra", { returnObjects: true })[0],
              ModalBody: <>{this.props.i18n.t("brst.alert.compra", { returnObjects: true })[1]}
                <br ></br><br ></br>
                <button type="button" className="btn btn-success" onClick={() => { window.$("#mensaje-brst").modal("hide") }}>{this.props.i18n.t("accept")}</button>
              </>
            })

            window.$("#mensaje-brst").modal("show");
          })

        document.getElementById("amountTRX").value = "";


      } else {
        document.getElementById("amountTRX").value = minCompra;
        this.setState({
          ModalTitulo: this.props.i18n.t("error"),
          ModalBody: this.props.i18n.t("brst.alert.errGreater", { returnObjects: true, min: minCompra })[0]
        })

        window.$("#mensaje-brst").modal("show");

      }

    } else {

      document.getElementById("amountTRX").value = "";
      this.setState({
        ModalTitulo: this.props.i18n.t("error"),
        ModalBody: this.props.i18n.t("brst.alert.errFunds", { returnObjects: true, min: minCompra })[0]
      })

      window.$("#mensaje-brst").modal("show");

    }

    await utils.delay(5);
    this.estado();


  };

  async sell() {

    let amount = document.getElementById("amountTRX").value;
    let amountNorm = new BigNumber(amount)

    let penalty = (await this.props.contrato.BRST_TRX_Proxy_fast.descuentoRapido().call()).toNumber()
    let presicion = (await this.props.contrato.BRST_TRX_Proxy_fast.precision().call()).toNumber()

    penalty = (penalty / presicion) * 100

    amount = new BigNumber(amount).multipliedBy(presicion - penalty).div(presicion);

    let loteria = (await this.props.contrato.loteria._premio().call())[0].toNumber()
    loteria = new BigNumber(loteria).shiftedBy(-6)

    let retiroRapido = (await this.props.contrato.BRST_TRX_Proxy_fast.balance_token_1().call()).toNumber()
    retiroRapido = new BigNumber(retiroRapido).shiftedBy(-6).minus(loteria)

    //console.log(amount.toNumber(), retiroRapido.toNumber(), loteria.toNumber())
    let primerBoton = <></>

    if (amount.toNumber() > retiroRapido.toNumber()) {
      primerBoton = (<>
        <button type="button" id="fastw" className="btn btn-secondary" disabled >Fast Withdrawal {amount.toNumber()} TRX</button><br ></br>
        you can request up to {retiroRapido.toNumber()} TRX for instant withdrawal with a {penalty}% penalty on what you are going to withdraw and you will receive the funds instantly in your wallet.
        <br ></br><br ></br>

      </>)
    } else {
      primerBoton = (<>
        <button type="button" id="fastw" className="btn btn-warning" onClick={() => { this.preVenta(true) }}>Fast Withdrawal {amount.toNumber()} TRX</button><br ></br>
        you can request up to {retiroRapido.toNumber()} TRX for instant withdrawal with a {penalty}% penalty on what you are going to withdraw and you will receive the funds instantly in your wallet.
        <br ></br><br ></br>

      </>)
    }

    this.setState({
      ModalTitulo: "Select Your Method",
      ModalBody: <>We now have two withdrawal methods:<br ></br>
        {primerBoton}
        <button type="button" className="btn btn-success" onClick={() => { this.preVenta(false) }}>Regular Withdrawal {amountNorm.toNumber()} TRX</button><br ></br>
        you can make a withdrawal request that you can claim from the contract in its entirety in 17 days.
      </>
    })

    window.$("#mensaje-brst").modal("show");

  }

  async preVenta(rapida) {

    var eenergy = 0;

    var amount = document.getElementById("amountBRST").value;
    amount = parseInt(parseFloat(amount) * 10 ** 6);

    var accountAddress = this.props.accountAddress;

    var aprovado = await this.props.contrato.BRST.allowance(accountAddress, this.props.contrato.BRST_TRX_Proxy.address).call();
    aprovado = parseInt(aprovado._hex);

    if (aprovado === 0) {

      let inputs1 = [
        { type: 'address', value: this.props.tronWeb.address.toHex(this.props.contrato.BRST_TRX_Proxy.address) },
        { type: 'uint256', value: '115792089237316195423570985008687907853269984665640564039457584007913129639935' }
      ]

      let funcion1 = "approve(address,uint256)"
      const options1 = { callValue: amount }
      var transaccion1 = await this.props.tronWeb.transactionBuilder.triggerConstantContract(this.props.tronWeb.address.toHex(this.props.contrato.BRST.address), funcion1, options1, inputs1, this.props.tronWeb.address.toHex(this.props.accountAddress))
        .catch(() => { return {} })

      if (transaccion1.energy_used) {
        eenergy += transaccion1.energy_used;
      } else {
        eenergy += 32000
      }

    }

    let inputs = [
      { type: 'uint256', value: amount }

    ]
    let funcion = "esperaRetiro(uint256)"
    let contrato = this.props.tronWeb.address.toHex(this.props.contrato.BRST_TRX_Proxy.address);

    if (rapida) {
      funcion = "sell_token_2(uint256)"
      contrato = this.props.tronWeb.address.toHex(this.props.contrato.BRST_TRX_Proxy_fast.address);

    }

    const options = {}
    var transaccion = await this.props.tronWeb.transactionBuilder.triggerConstantContract(contrato, funcion, options, inputs, this.props.tronWeb.address.toHex(this.props.accountAddress))
      .catch(() => { return {} })


    if (transaccion.energy_used) {
      eenergy += transaccion.energy_used;
    } else {
      eenergy += 80000;
    }

    if (eenergy > this.state.contractEnergy && this.state.energyOn) {

      let requerido = eenergy - this.state.contractEnergy

      if (requerido < 32000) {
        requerido = 32000;
      } else {
        requerido += 1000;
      }

      let body = { "resource": "energy", "amount": requerido, "duration": "5min" }
      let consultaPrecio = await fetch("https://cors.brutusservices.com/" + process.env.REACT_APP_BOT_URL + "prices", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }).then((r) => r.json())

      let precio = new BigNumber(consultaPrecio.price).dp(6)

      //console.log(precio)

      this.setState({
        ModalTitulo: "Energy Notice",
        ModalBody: <>This operation usually requires <b>{eenergy} energy</b>, and you have <b>{this.state.contractEnergy} energy</b> and need at least <b>{requerido} energy</b>, rent them for <b>{precio.toString(10)} TRX</b> to perform this operation.
          <br ></br><br ></br>
          <button type="button" className="btn btn-success" onClick={async () => {
            if (await this.rentEnergy(requerido)) {
              this.venta(rapida)
            }
          }}>Rent Energy</button>
        </>
      })

      window.$("#mensaje-brst").modal("show");
    } else {
      this.venta(rapida)
    }
  }

  async venta(rapida) {

    const { minventa } = this.state;

    let amount = document.getElementById("amountBRST").value;
    amount = parseFloat(amount);
    amount = parseInt(amount * 10 ** 6);

    let accountAddress = this.props.accountAddress;

    let contrato = this.props.tronWeb.address.toHex(this.props.contrato.BRST_TRX_Proxy.address)

    if (rapida) {
      contrato = this.props.tronWeb.address.toHex(this.props.contrato.BRST_TRX_Proxy_fast.address);
    }

    let aprovado = await this.props.contrato.BRST.allowance(accountAddress, contrato).call();

    aprovado = parseInt(aprovado._hex);

    if (aprovado <= amount) {

      let inputs = [
        { type: 'address', value: contrato },
        { type: 'uint256', value: "115792089237316195423570985008687907853269984665640564039457584007913129639935" }
      ]

      let funcion = "approve(address,uint256)"
      const options = {}
      let trigger = await this.props.tronWeb.transactionBuilder.triggerSmartContract(this.props.tronWeb.address.toHex(this.props.contrato.BRST.address), funcion, options, inputs, this.props.tronWeb.address.toHex(this.props.accountAddress))
      let transaction = await this.props.tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
      transaction = await window.tronLink.tronWeb.trx.sign(transaction)
        .catch((e) => {

          this.setState({
            ModalTitulo: "Error",
            ModalBody: e.toString()
          })

          window.$("#mensaje-brst").modal("show");
        })
      transaction = await this.props.tronWeb.trx.sendRawTransaction(transaction)
        .then(() => {
          this.setState({
            ModalTitulo: <>Result</>,
            ModalBody: <>BRST Aproval is Done {transaction.txid}</>
          })

          window.$("#mensaje-brst").modal("show");
        })

      //await this.props.contrato.BRST.approve(this.props.contrato.BRST_TRX_Proxy.address, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send();

      aprovado = await this.props.contrato.BRST.allowance(accountAddress, contrato).call();
    }

    if (aprovado >= amount) {

      if (amount >= minventa && true) {

        document.getElementById("amountBRST").value = "";

        if (rapida) {
          this.setState({
            ModalTitulo: "You select fast withdrawal",
            ModalBody: <>
              The request has been successfully processed! Your funds are on their way. Thank you for choosing our speedy service.
            </>
          })

          window.$("#mensaje-brst").modal("show");

          let inputs = [
            //{type: 'address', value: this.props.tronWeb.address.toHex("TTknL2PmKRSTgS8S3oKEayuNbznTobycvA")},
            { type: 'uint256', value: amount }
          ]

          let funcion = "instaRetiro(uint256)"
          if (rapida) {
            funcion = "sell_token_2(uint256)"
          }
          const options = {}
          let trigger = await this.props.tronWeb.transactionBuilder.triggerSmartContract(contrato, funcion, options, inputs, this.props.tronWeb.address.toHex(this.props.accountAddress))
          let transaction = await this.props.tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
          transaction = await window.tronLink.tronWeb.trx.sign(transaction)
            .catch((e) => {

              this.setState({
                ModalTitulo: "Error",
                ModalBody: e.toString()
              })

              window.$("#mensaje-brst").modal("show");
            })
          transaction = await this.props.tronWeb.trx.sendRawTransaction(transaction)
            .then(() => {
              this.setState({
                ModalTitulo: "Result",
                ModalBody: <>Your fast withdrawal was successfully processed {transaction.txid}
                  <br ></br><br ></br>
                  <button type="button" className="btn btn-success" onClick={() => { window.$("#mensaje-brst").modal("hide") }}>{this.props.i18n.t("accept")}</button>
                </>
              })

              window.$("#mensaje-brst").modal("show");
            })

          //await this.props.contrato.BRST_TRX_Proxy.instaRetiro(amount).send();

        } else {
          let inputs = [
            //{type: 'address', value: this.props.tronWeb.address.toHex("TTknL2PmKRSTgS8S3oKEayuNbznTobycvA")},
            { type: 'uint256', value: amount }
          ]

          let funcion = "esperaRetiro(uint256)"
          const options = {}
          let trigger = await this.props.tronWeb.transactionBuilder.triggerSmartContract(this.props.tronWeb.address.toHex(this.props.contrato.BRST_TRX_Proxy.address), funcion, options, inputs, this.props.tronWeb.address.toHex(this.props.accountAddress))
          let transaction = await this.props.tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
          transaction = await window.tronLink.tronWeb.trx.sign(transaction)
            .catch((e) => {

              this.setState({
                ModalTitulo: "Error",
                ModalBody: e.toString()
              })

              window.$("#mensaje-brst").modal("show");
            })
          transaction = await this.props.tronWeb.trx.sendRawTransaction(transaction)
            .then(() => {
              this.setState({
                ModalTitulo: "Result",
                ModalBody: <>Normal retiro Done {transaction.txid}
                  <br ></br><br ></br>
                  <button type="button" className="btn btn-success" onClick={() => { window.$("#mensaje-brst").modal("hide") }}>{this.props.i18n.t("accept")}</button>
                </>
              })

              window.$("#mensaje-brst").modal("show");
            })
          //await this.props.contrato.BRST_TRX_Proxy.esperaRetiro(amount).send();

          window.$("#mensaje-brst").modal("hide");
          document.getElementById("request-brst").scrollIntoView();
        }

      } else {
        this.setState({
          ModalTitulo: "Info",
          ModalBody: `Enter a value greater than ${minventa} BRST`
        })

        window.$("#mensaje-brst").modal("show");

        document.getElementById("amountBRST").value = minventa;
      }


    } else {

      if (amount > aprovado) {
        if (aprovado <= 0) {
          document.getElementById("amountBRST").value = minventa;
          this.setState({
            ModalTitulo: "Info",
            ModalBody: "You do not have enough aproved funds in your account you place at least " + minventa + " BRST"
          })

          window.$("#mensaje-brst").modal("show");
        } else {
          document.getElementById("amountBRST").value = minventa;
          this.setState({
            ModalTitulo: "Info",
            ModalBody: "You must leave 21 TRX free in your account to make the transaction"
          })

          window.$("#mensaje-brst").modal("show");
        }



      } else {

        document.getElementById("amountBRST").value = minventa;
        this.setState({
          ModalTitulo: "Info",
          ModalBody: "You must leave 21 TRX free in your account to make the transaction"
        })

        window.$("#mensaje-brst").modal("show");

      }

    }

    this.estado();


  };

  async retiro() {

    if (Date.now() >= this.state.tiempo && this.state.tiempo - this.state.espera !== 0) {
      await this.props.contrato.BRST_TRX_Proxy.retirar().send();

    } else {
      this.setState({
        ModalTitulo: "Info",
        ModalBody: "It's not time to retire yet"
      })

      window.$("#mensaje-brst").modal("show");
    }

    this.estado();

  };

  async grafico(time, temporalidad, cantidad, lastPrice) {

    if (this.root) {
      this.root.dispose();
    }

    const root = am5.Root.new("chartdiv");
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

    let previousValue;
    let previousColor;
    let previousDataObj;

    function generateData(data) {
      let value = data.value;
      let color;

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
          data.push(generateData(consulta[i]));
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

    let { minCompra, minventa } = this.state;

    minCompra = "Min. " + minCompra + " TRX";
    minventa = "Min. " + minventa + " BRST";

    let opciones;

    if (this.state.temporalidad === "hour") {
      opciones = optionsHours
    } else {
      opciones = options2
    }

    let days = [7,15,30,60,90,180,365]

    const ListProspect = days.map((day) => (<tr>
      <th>{day}</th>
      <td>{this.state.misBRST} BRST</td>
      <td><span className="badge badge-success">{this.props.i18n.t("brst.likely")}</span>
      </td>
      <td>{((this.state.misBRST * this.state.precioBrst * ((this.state.varBrst * day) / 100))).toFixed(6)} TRX</td>
      <td className="color-success">{(this.state.varBrst * day).toFixed(4)} % {this.props.i18n.t("brst.monthly")}</td>
    </tr>

    ))

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
                        <h4 className="heading m-0">{this.props.i18n.t("tokenChart", { token: "BRST" })}</h4>
                        <span className="fs-16">Brutus Tron Staking </span>
                      </div>
                      <div className="dropdown bootstrap-select">
                        <select className="image-select default-select dashboard-select" aria-label="Default" tabIndex="0">
                          <option >TRX (Tron)</option>
                          <option >USD ({this.props.i18n.t("dollar")})</option>
                        </select>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                          <div className="price-content">
                            <span className="fs-18 d-block mb-2">{this.props.i18n.t("price")}</span>
                            <h4 className="fs-20 font-w600">{this.state.precioBrst} TRX</h4>
                          </div>
                          <div className="price-content">
                            <span className="fs-14 d-block mb-2">24h% change</span>
                            <h4 className="font-w600 text-success">{(this.state.varBrst).toFixed(4)}<i className="fa-solid fa-caret-up ms-1 text-success"></i></h4>
                          </div>
                          <div className="price-content">
                            <span className="fs-14 d-block mb-2">{this.props.i18n.t("circulating")}</span>
                            <h4 className="font-w600">{(this.state.tokensEmitidos * 1).toFixed(2)} BRST</h4>
                          </div>
                          <div className="price-content">
                            <span className="fs-14 d-block mb-2">{this.props.i18n.t("endorse")}</span>
                            <h4 className="font-w600">{(this.state.enBrutus * 1).toFixed(2)} TRX</h4>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3" id="chartdiv" style={{ height: "400px", backgroundColor: "white" }}></div>


                      <select className="btn-secondary style-1 default-select" value={this.state.cantidadDatos} onChange={this.handleChange2}>
                        {opciones.map((option) => (
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
                          <img onClick={() => {
                            this.setState({
                              ModalTitulo: this.props.i18n.t("brst.alert.donate", { returnObjects: true })[0],
                              ModalBody: <>
                                <input type="number" id="trxD"></input> TRX
                                <br ></br>
                                <button type="button" className="btn btn-success" onClick={() => {
                                  let donacion = document.getElementById('trxD').value
                                  donacion = new BigNumber(donacion).shiftedBy(6).dp(0)
                                  this.props.contrato.BRST_TRX_Proxy['donate()']().send({ callValue: donacion })
                                    .then(() => {
                                      this.setState({
                                        ModalTitulo: this.props.i18n.t("brst.alert.donate", { returnObjects: true })[1],
                                        ModalBody: this.props.i18n.t("brst.alert.donate", { returnObjects: true })[2]
                                      })
                                      window.$("#mensaje-brst").modal("show");
                                      this.estado();
                                    })

                                }}>{this.props.i18n.t("brst.alert.donate", { returnObjects: true })[3]}</button>
                                <br ></br><br ></br>
                                <input type="number" id="brstD"></input> BRST
                                <br ></br>
                                <button type="button" className="btn btn-success" onClick={() => {
                                  let donacion = document.getElementById('brstD').value
                                  donacion = new BigNumber(donacion).shiftedBy(6).dp(0)
                                  this.props.contrato.BRST_TRX_Proxy['donate(uint256)'](donacion.toString(10)).send()
                                    .then(() => {
                                      this.setState({
                                        ModalTitulo: this.props.i18n.t("brst.alert.donate", { returnObjects: true })[1],
                                        ModalBody: this.props.i18n.t("brst.alert.donate", { returnObjects: true })[2]
                                      })
                                      window.$("#mensaje-brst").modal("show");
                                      this.estado();

                                    })


                                }}>{this.props.i18n.t("brst.alert.donate", { returnObjects: true })[3]}</button>

                              </>
                            })

                            window.$("#mensaje-brst").modal("show");

                          }} src="images/brst.png" width="100%" alt="brutus tron staking" ></img>
                          <div className="media-content">
                            <h4 className="mt-0 mt-md-4 fs-20 font-w700 text-black mb-0">{this.props.i18n.t("brst.aStaking")}</h4>
                            <span className="font-w600 text-black">Brutus</span>
                            <span className="my-4 fs-16 font-w600 d-block">1 BRST = {this.state.precioBrst} TRX</span>
                            <p className="text-start">{this.props.i18n.t("brst.description")}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer p-2 border-0">
                      <a href="https://brutus.finance/brutusblog.html" className="btn btn-link text-primary">{this.props.i18n.t("brst.button.readM")}</a>
                    </div>
                  </div>
                </div>
                <div className="col-xl-6 col-sm-6 wow fadeInUp" data-wow-delay="0.4s">
                  <div className="card quick-trade">
                    <div className="card-header pb-0 border-0 flex-wrap">
                      <div>
                        <h4 className="heading mb-0">{this.props.i18n.t("brst.exchange")} V4</h4>
                        <p className="mb-0 fs-14">{this.props.i18n.t("brst.energy", { e1: (this.state.contractEnergy).toLocaleString('en-US'), e2: parseInt(this.state.contractEnergy / this.state.eenergy) })}</p>
                      </div>
                    </div>
                    <div className="card-body pb-0">
                      <div className="basic-form">
                        <form className="form-wrapper trade-form">
                          <div className="input-group mb-3 ">
                            <span className="input-group-text">BRST</span>
                            <input className="form-control form-control text-end" type="number" id="amountBRST" onChange={this.handleChangeBRST} placeholder={minventa} min={this.state.minventa} value={this.state.valueBRST} step={1} ></input>
                          </div>
                          <div className="input-group mb-3 ">
                            <span className="input-group-text">TRX</span>
                            <input className="form-control form-control text-end" type="number" id="amountTRX" onChange={this.handleChangeTRX} placeholder={minCompra} min={this.state.minCompra} value={this.state.valueTRX} step={1} ></input>
                          </div>
                        </form>
                      </div>
                    </div>
                    <div className="card-footer border-0">
                      <div className="row">

                        <div className="col-6">
                          <button className="btn d-flex  btn-danger justify-content-between w-100" onClick={() => this.sell()}>
                            {this.props.i18n.t("sell")}
                            <img src="/images/svg/up.svg" style={{ transform: "rotate(180deg)" }} height="16px" alt="" ></img>
                          </button>
                        </div>

                        <div className="col-6">
                          <button className="btn d-flex  btn-success justify-content-between w-100" onClick={() => this.preCompra()}>
                            {this.props.i18n.t("buy")}

                            <img src="/images/svg/up.svg" height="16px" alt="" ></img>
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
                        <h4 className="text-warning mb-0">{this.props.i18n.t("mya")}</h4>
                      </div>
                    </div>
                    <div className="card-body p-3 py-0">
                      <div className="table-responsive">
                        <table className="table text-center bg-warning-hover order-tbl">
                          <thead>
                            <tr>
                              <th className="text-left">{this.props.i18n.t("token")}</th>
                              <th className="text-center">{this.props.i18n.t("amount")}</th>
                              <th className="text-center">{this.props.i18n.t("value")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ cursor: "pointer" }} onClick={() => { this.llenarBRST() }}>
                              <td className="text-left">BRST</td>
                              <td>{this.state.balanceBRST}</td>
                              <td>{(this.state.balanceBRST * this.state.precioBrst).toFixed(3)} TRX</td>

                            </tr>
                            <tr style={{ cursor: "pointer" }} onClick={() => { this.llenarTRX() }}>
                              <td className="text-left">TRX</td>
                              <td>{this.state.balanceTRX}</td>
                              <td>{new BigNumber(this.state.balanceTRX * 0.16).dp(2).toString(10)} USD</td>

                            </tr>

                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="card-footer text-center py-3 border-0">
                      <a href="/" className="btn-link text-black">{this.props.i18n.t("showM")}<i className="fa fa-caret-right"></i></a>
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
                      <th>{this.props.i18n.t("day")}</th>
                      <th>{this.props.i18n.t("earned")}</th>
                      <th>{this.props.i18n.t("brst.dailyG")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.map((objeto) => (
                      <tr key={objeto.dias.toString()}>
                        <th>{this.props.i18n.t("brst.daysAgo", { days: objeto.dias })}</th>

                        <td>{(objeto.trx).toFixed(6)} TRX</td>
                        <td className="color-primary">{(objeto.diario).toFixed(6)} TRX/{this.props.i18n.t("day")} </td>
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
                <h4 className="fs-20 text-black">{this.props.i18n.t("brst.request", { returnObjects: true, number: this.state.globDepositos.length })[0]}
                  <button className="btn  btn-success text-white" onClick={async () => await this.estado()}>
                    {this.props.i18n.t("brst.request", { returnObjects: true })[1]} <i className="bi bi-arrow-repeat"></i>
                  </button></h4>
                <p className="mb-0 fs-12">{this.props.i18n.t("brst.request", { returnObjects: true })[2]}</p>
              </div>

            </div>
            <div className="card-body">

              {this.state.globDepositos}




            </div>

          </div>
        </div>

        <div className="col-lg-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">{this.props.i18n.t("brst.estimate")}</h4><br></br>
              <h6 className="card-subtitle" style={{ cursor: "pointer" }} onClick={() => { document.getElementById("hold").value = this.state.balanceBRST; this.handleChangeCalc({ target: { value: this.state.balanceBRST } }) }}>
                {this.props.i18n.t("brst.mystaking")}{this.state.misBRST} BRST = {(this.state.misBRST * this.state.precioBrst).toFixed(3)} TRX
              </h6>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover table-responsive-sm">
                  <thead>
                    <tr>
                      <th>{this.props.i18n.t("day", { count: 10 })}</th>
                      <th>{this.props.i18n.t("brst.hold")}</th>
                      <th>{this.props.i18n.t("brst.status")}</th>
                      <th>{this.props.i18n.t("brst.estimateIn")}</th>
                      <th>{this.props.i18n.t("brst.growthR")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th><input type="number" id="days" defaultValue={1} onChange={this.handleChangeDias} ></input></th>
                      <td><input type="number" id="hold" defaultValue={0} onChange={this.handleChangeCalc} ></input> BRST</td>
                      <td><span className="badge badge-primary light">{this.props.i18n.t("brst.calculated")}</span>
                      </td>
                      <td>{(this.state.resultCalc).toFixed(6)} TRX</td>
                      <td className="color-primary">{(this.state.promE7to1day).toFixed(4)} % {this.props.i18n.t("brst.daily")} </td>
                    </tr>
                    {ListProspect}
                    <tr>
                      <th>365</th>
                      <td>{this.state.misBRST} BRST</td>
                      <td><span className="badge badge-danger light">{this.props.i18n.t("brst.estimated")}</span>
                      </td>
                      <td className="text-danger">{((this.state.misBRST * this.state.precioBrst * ((this.state.varBrst * 365) / 100))).toFixed(6)} TRX</td>
                      <td className="text-danger">{(this.state.varBrst * 365).toFixed(4)} % {this.props.i18n.t("brst.yearly")}</td>
                    </tr>
                  </tbody>
                </table>
                <p>{this.props.i18n.t("brst.calcullatorText", { days: this.state.tiempoPromediado })}</p>
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
