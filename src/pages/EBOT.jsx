import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import BigNumber from "bignumber.js";

import { config } from "../config/env";
import utils from "../services";

const amountsE = [
  { amount: 65000, text: "65K" },
  { amount: 130000, text: "130K" },
  { amount: 200000, text: "200K" },
  { amount: 1000000, text: "1M" },
  { amount: 3000000, text: "3M" },
];

const amountB = [
  { amount: 1000, text: "1k" },
  { amount: 2000, text: "2k" },
  { amount: 5000, text: "5k" },
  { amount: 10000, text: "10k" },
  { amount: 50000, text: "50k" },
];

let intervalId;

class EnergyRental extends Component {
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
      minPrice: "2.56",
      periodo: 5,
      temporalidad: "min",
      duration: "5min",
      av_band: new BigNumber(0),
      av_energy: new BigNumber(0),
      available_bandwidth: [],
      available_energy: [],
      total_bandwidth_pool: 0,
      total_energy_pool: 0,
      titulo: "Titulo",
      body: "Cuerpo del mensaje",
      amounts: amountsE,
      energyOn: false,
      bandOn: false,
      fromUrl: true,

      unitEnergyPrice: new BigNumber(1),
      precios: { energy: [], bandwidth: [] },

      referral: false,
    };

    this.handleChangePeriodo = this.handleChangePeriodo.bind(this);
    this.handleChangeWallet = this.handleChangeWallet.bind(this);

    this.updateAmount = this.updateAmount.bind(this);

    this.estado = this.estado.bind(this);

    this.recursos = this.recursos.bind(this);
    this.calcularRecurso = this.calcularRecurso.bind(this);
    this.calcularPrecios = this.calcularPrecios.bind(this);

    this.preCompra = this.preCompra.bind(this);
    this.compra = this.compra.bind(this);
  }

  async componentDidMount() {
    const { t } = this.props;

    document.getElementById("tittle").innerText = t("ebot.tittle");

    setTimeout(() => {
      this.estado();
    }, 2 * 1000);

    intervalId = setInterval(() => {
      this.estado();
    }, 15 * 1000);
  }

  componentWillUnmount() {
    clearInterval(intervalId);
  }

  handleChangeWallet(event) {
    let dato = event.target.value;
    this.setState({
      wallet_orden: dato,
    });
  }

  async handleChangePeriodo(event) {
    let dato = event.target.value.toLowerCase();
    let tmp = "d";

    document.getElementById("periodo").value = dato;

    if (dato.split("h").length > 1 || dato.split("hora").length > 1) {
      tmp = "h";
    }

    if (dato.split("m").length > 1 || dato.split("min").length > 1) {
      tmp = "m";
    }

    await this.setState({
      periodo: parseInt(dato),
      temporalidad: tmp,
      duration: parseInt(dato) + tmp,
    });

    this.calcularRecurso();
  }

  updateAmount(amount) {
    let { recurso } = this.state;

    let montoMin = 32000;
    if (recurso === "bandwidth") {
      montoMin = 1000;
    }

    this.setState({ montoMin });

    let cantidad = 0;
    if (amount) {
      cantidad = amount;
      try {
        let elAmount = document.getElementById("amount");

        if (elAmount) {
          elAmount.value = amount;
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        let elAmount = document.getElementById("amount");

        if (elAmount) {
          cantidad = elAmount.value;
        }
      } catch (e) {
        console.log(e);
      }
    }

    cantidad = parseInt(cantidad);

    if (parseInt(cantidad) < montoMin || isNaN(cantidad)) {
      cantidad = montoMin;
    }

    this.setState({ cantidad });

    return cantidad;
  }

  async estado() {
    let { fromUrl } = this.state;

    await this.calcularPrecios();

    let loc = document.location.href;
    if ((loc.indexOf("amount") > 0 || loc.indexOf("amb") > 0) && fromUrl) {
      let getString = loc.split("?")[1];
      let GET = getString.split("&");
      let get = {};
      let tmp;

      for (var i = 0, l = GET.length; i < l; i++) {
        tmp = GET[i].split("=");
        get[tmp[0]] = unescape(decodeURI(tmp[1]));
      }

      if (parseInt(get["amount"]) >= 32000) {
        let cantidad = parseInt(get["amount"]);
        let recurso = "energy";
        let duration = "5min";
        if (get["resource"] !== undefined) {
          recurso = get["resource"];
        }

        if (recurso === "band" || recurso === "bandwidth") {
          recurso = "bandwidth";
        } else {
          recurso = "energy";
        }

        if (get["duration"] !== undefined) {
          duration = get["duration"];
        }

        await this.setState({
          cantidad,
          recurso,
          temporalidad: "m",
          periodo: "5",
          duration,
          fromUrl: false,
        });

        this.updateAmount(cantidad);

        this.preCompra();
      }

      if (get["amb"] !== undefined) {
        await this.setState({ referral: get["amb"] });
      }
    }

    this.calcularRecurso();
  }

  async recursos() {
    let { energyOn, bandOn } = this.state;

    let consulta = false;
    const URL = config.BOT_URL;

    consulta = await fetch(URL)
      .then((r) => r.json())
      .catch((e) => {
        console.log(e);
        return false;
      });

    energyOn = consulta.available;
    bandOn = consulta.available;

    consulta = await fetch(URL + "available")
      .then((r) => r.json())
      .catch((e) => {
        console.log(e);
        return false;
      });

    if (!consulta) return false;

    let available_energy = [
      {
        duration: "5min",
        available: consulta.av_energy[0].available,
      },
      {
        duration: "1h",
        available: consulta.av_energy[0].available,
      },
      {
        duration: "1d",
        available: consulta.av_energy[1].available,
      },
      {
        duration: "3d",
        available: consulta.av_energy[2].available,
      },
      {
        duration: "7d",
        available: consulta.av_energy[3].available,
      },
      {
        duration: "14d",
        available: consulta.av_energy[3].available,
      },
      {
        duration: "30d",
        available: consulta.av_energy[3].available,
      },
    ];

    let available_bandwidth = [
      {
        duration: "5min",
        available: consulta.av_band[0].available,
      },
      {
        duration: "1h",
        available: consulta.av_band[0].available,
      },
      {
        duration: "1d",
        available: consulta.av_band[1].available,
      },
      {
        duration: "3d",
        available: consulta.av_band[2].available,
      },
      {
        duration: "7d",
        available: consulta.av_band[3].available,
      },
      {
        duration: "14d",
        available: consulta.av_band[3].available,
      },
      {
        duration: "30d",
        available: consulta.av_band[3].available,
      },
    ];

    let elPeriodo = document.getElementById("periodo");
    let duration = "5min";
    if (elPeriodo) {
      duration = elPeriodo.value;
    }

    this.setState({ duration });

    let av_energy = available_energy.find((obj) => obj.duration === duration);
    av_energy = new BigNumber(av_energy.available);
    this.setState({ av_energy });

    let av_band = available_bandwidth.find((obj) => obj.duration === duration);
    av_band = new BigNumber(av_band.available);
    this.setState({ av_band });

    this.setState({
      available_bandwidth,
      available_energy,
      total_bandwidth_pool: consulta.total_bandwidth_pool,
      total_energy_pool: consulta.total_energy_pool,
      energyOn,
      bandOn,
    });

    return energyOn;
  }

  async calcularPrecios() {
    await this.recursos();

    let { precios, duration, recurso } = this.state;

    let url = config.BOT_URL + "/prices/all";

    let consulta = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (r) => await r.json())
      .catch((e) => {
        console.log(e);
        return false;
      });

    if (consulta) {
      precios["energy"] = [
        {
          duration: "5min",
          UE: new BigNumber(consulta.energy_minutes_100K)
            .shiftedBy(1)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "1h",
          UE: new BigNumber(consulta.energy_hour_100K)
            .shiftedBy(1)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "1",
          UE: new BigNumber(consulta.energy_one_day_100K)
            .shiftedBy(1)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "2",
          UE: new BigNumber(consulta.energy_over_one_day_100K)
            .shiftedBy(1)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "3",
          UE: new BigNumber(consulta.energy_over_one_day_100K)
            .shiftedBy(1)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "4",
          UE: new BigNumber(consulta.energy_over_one_day_100K)
            .shiftedBy(1)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "7",
          UE: new BigNumber(consulta.energy_over_one_day_100K)
            .shiftedBy(1)
            .times(7 / 3)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "14",
          UE: new BigNumber(consulta.energy_over_one_day_100K)
            .shiftedBy(1)
            .times(14 / 3)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "30",
          UE: new BigNumber(consulta.energy_over_one_day_100K)
            .shiftedBy(1)
            .times(30 / 3)
            .dp(6)
            .toNumber(),
        },
      ];

      precios["bandwidth"] = [
        {
          duration: "5min",
          UE: new BigNumber(consulta.band_minutes_1000)
            .times(1000)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "1h",
          UE: new BigNumber(consulta.band_hour_1000)
            .times(1000)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "1",
          UE: new BigNumber(consulta.band_one_day_1000)
            .times(1000)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "2",
          UE: new BigNumber(consulta.band_one_day_1000)
            .times(1000)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "3",
          UE: new BigNumber(consulta.band_over_one_day_1000)
            .times(1000)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "4",
          UE: new BigNumber(consulta.band_over_one_day_1000)
            .times(1000)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "7",
          UE: new BigNumber(consulta.band_over_one_day_1000)
            .times(1000)
            .times(7 / 3)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "14",
          UE: new BigNumber(consulta.band_over_one_day_1000)
            .times(1000)
            .times(14 / 3)
            .dp(6)
            .toNumber(),
        },
        {
          duration: "30",
          UE: new BigNumber(consulta.band_over_one_day_1000)
            .times(1000)
            .times(30 / 3)
            .dp(6)
            .toNumber(),
        },
      ];

      this.setState({ precios });
    }

    let priceList = precios[recurso];

    if (priceList.length > 0) {
      const foundPrice = priceList.find((price) => price.duration === duration);
      if (foundPrice !== undefined) {
        this.setState({ unitEnergyPrice: foundPrice.UE });
      }
    }

    return precios;
  }

  async calcularRecurso() {
    let { t } = this.props;

    this.calcularPrecios();

    let { recurso, montoMin, precio, duration } = this.state;

    let cantidad = this.updateAmount();

    let ok = true;

    if (duration.indexOf("d") >= 0) {
      if (parseInt(duration[0]) < 1 || parseInt(duration[0]) > 14) {
        this.setState({
          titulo: t("ebot.alert.eRange", { returnObjects: true })[0],
          body: t("ebot.alert.eRange", { returnObjects: true })[1],
        });

        ok = false;

        window.$("#mensaje-ebot").modal("show");
      }

      duration = duration.split("d")[0];
    }

    if (duration.indexOf("h") >= 0) {
      if (parseInt(duration[0]) !== 1) {
        this.setState({
          titulo: t("ebot.alert.eRange", { returnObjects: true })[0],
          body: t("ebot.alert.eRange2"),
          periodo: "1",
        });

        ok = false;

        window.$("#mensaje-ebot").modal("show");
      }

      duration = "1h";
    }

    if (duration.indexOf("m") >= 0) {
      if (parseInt(duration[0]) !== 5) {
        this.setState({
          titulo: t("ebot.alert.eRange", { returnObjects: true })[0],
          body: t("ebot.alert.eRange2"),
          periodo: "5",
        });

        ok = false;

        window.$("#mensaje-ebot").modal("show");
      }

      duration = "5min";
    }

    let priceList = this.state.precios[recurso];

    if (ok && priceList.length > 0) {
      const foundPrice = priceList.find((price) => price.duration === duration);

      precio = new BigNumber(foundPrice.UE).times(cantidad);
      // cobro adicional para aumentar la reserva de trx === 10_000 SUN
      precio = precio.plus(0);

      precio = precio.shiftedBy(-6).dp(6);

      this.setState({ unitEnergyPrice: foundPrice.UE });

      if (parseInt(cantidad) <= montoMin) {
        this.setState({ minPrice: precio });
      }
    } else {
      precio = "**.**";
    }

    this.setState({
      precio: precio,
    });

    return precio;
  }

  async preCompra() {
    const { t, isViewerMode } = this.props;

    if (isViewerMode) {
      this.setState({
        titulo: "To continue",
        body: "Connect your wallet to perform this operation.",
      });

      window.$("#mensaje-ebot").modal("show");
      return;
    }

    await this.recursos();

    let {
      wallet_orden,
      cantidad,
      periodo,
      temporalidad,
      recurso,
      energyOn,
      bandOn,
      av_energy,
      av_band,
      total_energy_pool,
      total_bandwidth_pool,
    } = this.state;
    let { accountAddress, tronWeb, i18n } = this.props;

    if (!energyOn || !bandOn) {
      this.setState({
        titulo: i18n.t("ebot.alert.eResource", { returnObjects: true })[0],
        body: (
          <span>
            {i18n.t("ebot.alert.eResource", { returnObjects: true })[1]}
          </span>
        ),
      });

      window.$("#mensaje-ebot").modal("show");
      return;
    }

    if (av_energy.toNumber() < total_energy_pool * 0.005) {
      energyOn = false;

      if (recurso === "energy") {
        this.setState({
          titulo: <>{t("ebot.alert.soldOut", { returnObjects: true })[0]}</>,
          body: (
            <>
              {" "}
              <img
                src="/images/alerts/recarge_energy.jpeg"
                alt="Energy sold out"
                style={{ borderRadius: "15px", width: "100%" }}
              ></img>{" "}
              <br></br>
              <br></br>
              {t("ebot.alert.soldOut", { returnObjects: true })[1]}
            </>
          ),
        });

        window.$("#mensaje-ebot").modal("show");
      }
    }

    if (av_band.toNumber() < total_bandwidth_pool * 0.005) {
      bandOn = false;
      if (recurso !== "energy") {
        this.setState({
          titulo: t("ebot.alert.soldOut", { returnObjects: true })[0],
          body: t("ebot.alert.soldOut", { returnObjects: true })[1],
        });

        window.$("#mensaje-ebot").modal("show");
      }
    }

    let pagas = (await this.calcularRecurso()).toNumber();

    if (isNaN(pagas)) {
      this.setState({
        titulo: "Error",
        body: "error to calculating price of resource",
      });

      window.$("#mensaje-ebot").modal("show");
      return;
    }

    if (wallet_orden === "" || !tronWeb.isAddress(wallet_orden)) {
      this.setState({
        wallet_orden: accountAddress,
      });
    }

    if (
      parseFloat(pagas) >
      new BigNumber(await tronWeb.trx.getBalance(accountAddress))
        .shiftedBy(-6)
        .toNumber()
    ) {
      this.setState({
        titulo: i18n.t("ebot.alert.noFounds", { returnObjects: true })[0],
        body: (
          <span>
            {i18n.t("ebot.alert.noFounds", { returnObjects: true })[1]}
          </span>
        ),
      });

      window.$("#mensaje-ebot").modal("show");
      return;
    }

    if (wallet_orden === "" || !tronWeb.isAddress(wallet_orden)) {
      this.setState({
        wallet_orden: accountAddress,
      });
    }

    if (wallet_orden === "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb") {
      this.setState({
        titulo: i18n.t("ebot.alert.eTronlink", { returnObjects: true })[0],
        body: (
          <span>
            {i18n.t("ebot.alert.eTronlink", { returnObjects: true })[1]}
            <br></br>
            <button className="btn btn-danger" data-bs-dismiss="modal">
              Ok
            </button>
          </span>
        ),
      });

      window.$("#mensaje-ebot").modal("show");
      return;
    }

    if (recurso === "energy") {
      if (cantidad > av_energy.toNumber()) {
        this.setState({
          titulo: "Error",
          body: "insufficient resources to cover this order try a lower value or try again later.",
        });

        window.$("#mensaje-ebot").modal("show");
        return;
      }
    } else {
      if (cantidad > av_band.toNumber()) {
        this.setState({
          titulo: "Error",
          body: "insufficient resources to cover this order try a lower value or try again later.",
        });

        window.$("#mensaje-ebot").modal("show");
        return;
      }
    }

    this.setState({
      titulo: <>Confirm order information</>,
      body: (
        <span>
          <b>Buy: </b> {cantidad + " " + recurso + " " + periodo + temporalidad}
          <br></br>
          <b>For: </b> {pagas} TRX<br></br>
          <b>To: </b> {this.state.wallet_orden}
          <br></br>
          <br></br>
          <br></br>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              window.$("#mensaje-ebot").modal("hide");
            }}
          >
            Cancel <i className="bi bi-x-circle"></i>
          </button>{" "}
          <button
            type="button"
            className="btn btn-success"
            onClick={() => {
              this.compra(
                cantidad,
                periodo,
                temporalidad,
                recurso,
                wallet_orden,
                pagas,
              );
            }}
          >
            Confirm <i className="bi bi-bag-check"></i>
          </button>
        </span>
      ),
    });

    window.$("#mensaje-ebot").modal("show");
  }

  async compra() {
    let {
      cantidad,
      periodo,
      temporalidad,
      recurso,
      wallet_orden,
      precio,
      referral,
    } = this.state;

    const imgLoading = (
      <img src="images/cargando.gif" height="20px" alt="loading..."></img>
    );

    this.setState({
      titulo: <>Confirm transaction {imgLoading}</>,
      body: <>Please confirm the transaction from your wallet </>,
    });

    window.$("#mensaje-ebot").modal("show");

    const unSignedTransaction =
      await this.props.tronWeb.transactionBuilder.sendTrx(
        config.WALLET_API,
        this.props.tronWeb.toSun(precio),
        this.props.accountAddress,
      );
    // using adapter to sign the transaction
    const signedTransaction = await window.tronWeb.trx
      .sign(unSignedTransaction)
      .catch((e) => {
        this.setState({
          ModalTitulo: "Transaction failed",
          ModalBody: (
            <>
              {e.toString()}
              <br></br>
              <br></br>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  window.$("#mensaje-brst").modal("hide");
                }}
              >
                Close
              </button>
            </>
          ),
        });

        window.$("#mensaje-brst").modal("show");
        return false;
      });

    if (!signedTransaction) {
      return false;
    }

    this.setState({
      titulo: <>Your order is being processed {imgLoading}</>,
      body: "Wait while one of our robots attends to your recharge, we try to be as fast as possible.",
    });

    let consulta2 = await utils.rentResource(
      wallet_orden,
      recurso,
      cantidad,
      periodo,
      temporalidad,
      precio,
      signedTransaction,
      referral,
    );

    if (consulta2.result) {
      this.setState({
        titulo: "Completed successfully",
        body: (
          <>
            Rental of {recurso} is completed successfully.<br></br>
            <br></br>{" "}
            <button
              type="button"
              data-bs-dismiss="modal"
              className="btn btn-success"
            >
              Thank you!
            </button>
          </>
        ),
      });

      window.$("#mensaje-ebot").modal("show");
    } else {
      console.log(consulta2);

      this.setState({
        titulo: "Contact support",
        body: "Support hash: " + consulta2.hash + " | " + consulta2.msg,
      });

      window.$("#mensaje-ebot").modal("show");
    }
  }

  render() {
    const { t } = this.props;
    let { unitEnergyPrice, amounts, recurso, av_energy, av_band } = this.state;

    const amountButtons = amounts.map((amounts) => (
      <button
        key={"Amb-" + amounts.text}
        id="ra1"
        type="button"
        className="btn btn-primary"
        style={{ margin: "auto" }}
        onClick={() => {
          this.updateAmount(amounts.amount);
          this.estado();
        }}
      >
        {amounts.text}
      </button>
    ));

    let texto = (
      <>
        Bandwidth Pool:{" "}
        {av_band.toString(10).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
      </>
    );
    let porcentaje =
      (av_band.toNumber() * 100) / this.state.total_bandwidth_pool;

    if (recurso === "energy") {
      texto = (
        <>
          Energy Pool:{" "}
          {av_energy.toString(10).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </>
      );
      porcentaje = (av_energy.toNumber() * 100) / this.state.total_energy_pool;
    }

    if (isNaN(porcentaje)) porcentaje = 0;

    let medidor = (
      <>
        <p className="font-14">
          {texto} ({new BigNumber(porcentaje).dp(2).toString(10)}%)
        </p>
        <div
          className="progress"
          style={{ margin: "5px", backgroundColor: "lightgray" }}
        >
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: porcentaje + "%" }}
            aria-valuenow={porcentaje}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </>
    );

    function capitalizarPrimeraLetra(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
      <>
        <div className="row ">
          <div className="col-md-12 text-center">
            <h1>{t("ebot.subTittle")}</h1>
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
                            <button
                              id="btnGroupDrop1"
                              type="button"
                              className="btn btn-primary dropdown-toggle"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              Resource
                            </button>
                            <ul
                              className="dropdown-menu"
                              aria-labelledby="btnGroupDrop1"
                            >
                              <li
                                onClick={async () => {
                                  await this.setState({
                                    cantidad: 32000,
                                    recurso: "energy",
                                    amounts: amountsE,
                                  });

                                  this.updateAmount(32000);

                                  await this.estado();
                                }}
                              >
                                <button className="dropdown-item">
                                  Energy
                                </button>
                              </li>

                              <li
                                onClick={async () => {
                                  await this.setState({
                                    cantidad: 1000,
                                    recurso: "bandwidth",
                                    amounts: amountB,
                                  });
                                  this.updateAmount(1000);
                                  await this.estado();
                                }}
                              >
                                <button className="dropdown-item">
                                  Bandwidth
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <form className="dzForm" method="" action="">
                        <div className="dzFormMsg"></div>
                        <input
                          type="hidden"
                          className="form-control"
                          name="dzToDo"
                          value="Contact"
                        ></input>
                        {medidor}

                        <div className="col-12 mt-2 mb-2 d-flex justify-content-center align-items-center">
                          <p
                            style={{ marginTop: "auto", marginRight: "10px" }}
                            className="font-14"
                          >
                            Amount
                          </p>
                          <input
                            style={{
                              textAlign: "end",
                              border: "lightgray  solid",
                            }}
                            id="amount"
                            name="dzLastName"
                            type="text"
                            onInput={() => this.calcularRecurso()}
                            className="form-control mb-1"
                            placeholder={this.state.montoMin}
                          ></input>
                        </div>
                        <div className="col-xl-12 mt-2 mb-2">
                          <div className="d-flex justify-content-xl-center">
                            {amountButtons}
                          </div>
                        </div>

                        <div className="col-12 mt-2 mb-2 d-flex justify-content-center align-items-center">
                          <p
                            style={{ marginTop: "auto", marginRight: "10px" }}
                            className="font-14"
                          >
                            Duration
                          </p>
                          <input
                            style={{
                              textAlign: "end",
                              border: "lightgray  solid",
                              cursor: "not-allowed",
                            }}
                            id="periodo"
                            required
                            type="text"
                            className="form-control mb-1"
                            onChange={this.handleChangePeriodo}
                            placeholder={"Default: 5m (five minutes)"}
                            defaultValue="5min"
                            readOnly
                          ></input>
                        </div>
                        <div className="col-12 mt-2 mb-2 ">
                          <div className="d-flex justify-content-xl-center">
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ margin: "auto" }}
                              onClick={() => {
                                this.handleChangePeriodo({
                                  target: { value: "5min" },
                                });
                              }}
                            >
                              5m
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ margin: "auto" }}
                              onClick={() => {
                                this.handleChangePeriodo({
                                  target: { value: "1h" },
                                });
                              }}
                            >
                              1h
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ margin: "auto" }}
                              onClick={() => {
                                this.handleChangePeriodo({
                                  target: { value: "1d" },
                                });
                              }}
                            >
                              1d
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ margin: "auto" }}
                              onClick={() => {
                                this.handleChangePeriodo({
                                  target: { value: "3d" },
                                });
                              }}
                            >
                              3d
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ margin: "auto" }}
                              onClick={() => {
                                this.handleChangePeriodo({
                                  target: { value: "14d" },
                                });
                              }}
                            >
                              14d
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ margin: "auto" }}
                              onClick={() => {
                                this.handleChangePeriodo({
                                  target: { value: "30d" },
                                });
                              }}
                            >
                              30d
                            </button>
                          </div>
                        </div>

                        <div className="col-12 mt-2 mb-2 justify-content-center align-items-center">
                          {capitalizarPrimeraLetra(this.state.recurso)} Unit:{" "}
                          {unitEnergyPrice.toString(10)} SUN<br></br>
                          <button
                            name="submit"
                            type="button"
                            value="Submit"
                            className="btn btn-secondary"
                            style={{
                              width: "100%",
                              height: "40px",
                              marginTop: "5px",
                            }}
                            onClick={() => this.preCompra()}
                          >
                            {" "}
                            Complete Purchase - Total:{" "}
                            {this.state.precio.toString(10)} TRX
                          </button>
                        </div>

                        <div className="col-xl-12 mb-3 mb-md-4">
                          <p className="font-14">
                            Send resources to this wallet {"⬇️"}
                          </p>

                          <input
                            name="dzFirstName"
                            required
                            type="text"
                            className="form-control"
                            placeholder={this.props.accountAddress}
                            onChange={this.handleChangeWallet}
                          ></input>
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
              <img
                src="images/ebot.png"
                width="170px"
                className="figure-img img-fluid rounded"
                alt="resource rental energy"
              ></img>

              <div className="info">
                <p className="font-20 p-5">
                  In Brutus Energy Bot, we've developed an app for a faster and
                  secure resource rental experience on the Tron network.{" "}
                  <br></br>
                  <br></br>
                  Innovatively simplifying the process, we ensure efficient
                  management at competitive prices. Explore further through our{" "}
                  <a
                    style={{ color: "purple", textDecoration: "underline" }}
                    href="https://t.me/BRUTUS_energy_bot"
                  >
                    Telegram bot
                  </a>{" "}
                  or API for added accessibility. <br></br>
                  <br></br>
                  For additional information, contact us via our{" "}
                  <a
                    style={{ color: "purple", textDecoration: "underline" }}
                    href="https://t.me/brutus_comunidad_sr"
                  >
                    Telegram group
                  </a>{" "}
                  or reach out to us at{" "}
                  <a
                    style={{ color: "purple", textDecoration: "underline" }}
                    href="mailto:support@brutus.finance"
                  >
                    support@brutus.finance
                  </a>
                  <br></br>
                  <br></br>
                  Do you want to sell your energy/bandwidth and earn daily
                  income?{" "}
                  <a
                    style={{ color: "purple", textDecoration: "underline" }}
                    href="https://brutus.finance/provider/"
                  >
                    Join us as a provider now!
                  </a>
                </p>
              </div>

              <div className="widget widget_about">
                <div className="widget widget_getintuch"></div>
              </div>
              <div className="social-box dz-social-icon style-3"></div>
            </div>
          </div>

          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Smart Contracts </h4>
              </div>
              <div className="card-body">
                <p>
                  <b>Rental operator:</b>{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={
                      "https://tronscan.org/#/contract/" +
                      config.WALLET_API +
                      "/code"
                    }
                  >
                    {config.WALLET_API}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal fade" id="mensaje-ebot">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{this.state.titulo}</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div className="modal-body">
                <p>{this.state.body}</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

const EnergyRentalWithTranslation = withTranslation()(EnergyRental);

export default EnergyRentalWithTranslation;
