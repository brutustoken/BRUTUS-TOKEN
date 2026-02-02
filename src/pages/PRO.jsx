import React, { Component } from "react";
import { config } from "../config/env";

import BigNumber from "bignumber.js";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

import CsvDownloader from "react-csv-downloader";
import { withTranslation } from "react-i18next";

import moment from "moment-timezone";
import FaqItem from "../components/FaqItems";

const env = import.meta.env;

const faqs = [
  {
    question: "When will I receive my next sales order?",
    answer: (
      <>
        <p>
          The system is designed to be as equitable as possible among all
          providers, and all providers receive orders based on their available
          energy ratio. We cannot guarantee an exact time, but you have at your
          disposal tools to get an estimate.<br></br>
          <br></br>
          For example, the famous “orange coefficient” or “availability ratio”
          indicates what percentage of your total energy you have available for
          sale, and compares it to the average ratio of the entire pool of
          providers. The higher your ratio, the better positioned you are in the
          ranking to receive the next order. This depends a lot on the “maxdays”
          you have configured (at what term you want to sell), since, in
          general, there is usually much more demand at long terms than at short
          terms.<br></br>
          <br></br>
          You can check the ratios broken down by timeframe in the Telegram bot{" "}
          <strong>@BRUTUS_energy_bot</strong> with the command{" "}
          <code>/infopool</code>.
        </p>
      </>
    ),
  },
  {
    question: "How is my % payout calculated?",
    answer: (
      <>
        <p>
          The payout is the payment you receive with respect to the total price
          of each sale order. Payout = price - Brutus commission. The % you
          receive depends on two factors: whether or not you vote Brutus as SR,
          and the term at which you sell your resources.<br></br>
          <br></br>
          If at least 95% of your votes are for Brutus, your % payout will be
          80%, regardless of the timeframe at which you sell your resources.
          <br></br>
          <br></br>
          Otherwise (less than 95% of your votes are for Brutus), if your
          “maxdays” is at 1h, you will receive 67%, and if you sell at a higher
          term, you will receive 77%.<br></br>
          <br></br>A daily check is made at a random time of the votes made by
          your wallet, and based on that this percentage is determined.
          Therefore, if you change your maxdays or votes, you may not see a
          change in your payout until the check is made at a random time of the
          day.
        </p>
      </>
    ),
  },
  /*{
    question: <>What is it and how is my <span role="img" aria-label="orange">🍊</span> coefficient calculated?</>,
    answer: (
      <>
        <p>
          The coefficient reflects your relative position in the ranking we use to distribute buy orders. It ranges from 0 to 1, is updated every few minutes and determines your priority: the higher, the more likely you are to receive an order soon.<br></br><br></br>

          <b>This value is based on:</b><br></br>

          <ul>
            <li>· The percentage of your total energy you have available for sale.</li>
            <li>· Your recent activity: how much energy you have sold in the last 24 hours through Brutus.</li>
            <li>· If you are selling above your staked energy, the system corrects the coefficient to avoid disproportionate advantages (something common due to fast regeneration or underuse by buyers).</li>
          </ul>
          <br></br>


          <b>In the panel you will see something like: <span role="img" aria-label="orange">🍊</span> 0.80 / 0.65 </b><br></br>
          <ul>
            <li>· First value: your current coefficient.</li>

            <li>· Second value: the overall average of the providers pool.</li>
          </ul>
          Note that this average includes all active providers, without distinguishing time horizons. However, your actual position is defined according to the other providers that are in the same timeframe as you (1h, 3 days, etc.), and the demand is usually higher at longer timeframes.<br></br><br></br>

          To see this information broken down by timeframe, you can send /infopool to the Telegram bot @BRUTUS_energy_bot.
        </p>
      </>
    )
  },*/
];

class ProviderPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      provider: false,
      firma: false,
      rent: false,
      elegible: false,
      sellband: false,
      bandover: "0",
      sellener: false,
      enerover: "0",
      burn: false,
      noti: false,
      autofreeze: "off",
      paymenthour: "Loading...",
      maxdays: "Loading...",
      ongoins: [],
      nexpayment: "Loading...",
      payoutRatio: 0,
      ratioEnergy: new BigNumber(0),
      ratioEnergyPool: new BigNumber(0),
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
      tiempo: "",
      payment: "0",
      payhere: ">>>>>>>>>>>>>>>Loading<<<<<<<<<<<<<<<",
      payHere: "*************************************",
      completed: [],
      totalPayed30: "Loading...",
      allPayed: "Loading...",
      coin: "Loading...",
    };

    this.estado = this.estado.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.setConfig = this.setConfig.bind(this);

    this.grafico = this.grafico.bind(this);
  }

  componentDidMount() {
    document.title = "Provider Panel | Brutus.Finance";
    document.getElementById("tittle").innerText =
      this.props.i18n.t("Provider Panel");

    function esDispositivoMovil() {
      return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    if (esDispositivoMovil()) {
      console.log("movil: true");
    }

    setTimeout(() => {
      this.estado();
    }, 3 * 1000);

    setInterval(() => {
      this.estado();
    }, 20 * 1000);
  }

  async estado() {
    const { accountAddress } = this.props;

    this.setState({
      tiempo: moment.tz.guess(true),
    });

    let url = config.apiProviders;

    let provider = { result: false };

    try {
      provider = await fetch(url + "provider?wallet=" + accountAddress).then(
        (r) => {
          return r.json();
        },
      );
    } catch (error) {
      console.log(error.toString());
    }

    this.setState({
      provider: provider.result,
    });

    let auth = false;

    if (provider.result && this.props.tronlink.adapter.connected) {
      let firma = localStorage.getItem("firma-tron");
      let fecha = new Date(Date.now());
      let messge = "https://brutus.finance - " + fecha.getFullYear();

      if (
        firma === null ||
        firma === undefined ||
        (await window.tronWeb.trx.verifyMessageV2(messge, firma)) !==
          this.props.tronlink.adapter.address
      ) {
        firma = await this.props.tronlink.adapter.signMessage(messge);
        //cookies.set('firma-tron', firma, { maxAge: 86400 });

        localStorage.setItem("firma-tron", firma);
      } else {
        firma = localStorage.getItem("firma-tron");
      }

      try {
        if (
          (await window.tronWeb.trx.verifyMessageV2(messge, firma)) ===
          this.props.tronlink.adapter.address
        ) {
          auth = true;
        } else {
          auth = false;
        }
      } catch (error) {
        console.log(error.toString());
        auth = true;
      }

      this.setState({ firma: auth });

      if (firma !== undefined && auth) {
        let info = {};

        try {
          info = await fetch(url + "status?wallet=" + accountAddress)
            .then((r) => {
              return r.json();
            })
            .then((r) => {
              return r.data;
            });
        } catch (error) {
          console.log(error.toString());
        }

        //console.log(info)

        let naranja = new BigNumber((info.ratio_e - info.ratio_e_pool) * 100)
          .dp(3)
          .toNumber();

        if (naranja >= 0) {
          naranja = "+" + naranja;
        }

        info.naranja = naranja;

        if (info.freez) {
          info.freez = info.freez.toLowerCase();
        }

        if (info.freez === "no") {
          info.freez = "Off";
        }

        let cuenta =
          await this.props.tronWeb.trx.getAccountResources(accountAddress);

        let providerEnergy = 0;
        let providerEnergyTotal = 0;

        let providerBand = 0;
        let providerBandTotal = 0;

        if (cuenta.EnergyLimit) {
          providerEnergy = cuenta.EnergyLimit;
          providerEnergyTotal = cuenta.EnergyLimit;
        }

        if (cuenta.EnergyUsed) {
          providerEnergy -= cuenta.EnergyUsed;
        }

        if (cuenta.freeNetLimit) {
          providerBandTotal = cuenta.freeNetLimit;
        }

        if (cuenta.NetLimit) {
          providerBandTotal += cuenta.NetLimit;
        }

        providerBand = providerBandTotal;

        if (cuenta.freeNetUsed) {
          providerBand -= cuenta.freeNetUsed;
        }

        if (cuenta.NetUsed) {
          providerBand -= cuenta.NetUsed;
        }

        if (info.allow_notifications === 1) {
          info.allow_notifications = true;
        } else {
          info.allow_notifications = false;
        }

        let sellener = false;

        if (info.energyover > 0) {
          sellener = true;
        }

        info.coin = info.currency;

        //console.log(info)

        this.setState({
          ...info,
          rent: info.activo,
          sellener: sellener,
          enerover: info.energyover,
          noti: info.allow_notifications,
          autofreeze: info.freez,
          paymentPoints: info.payout_ratio * 100,
          payoutRatio: info.payout_ratio,
          ratioEnergy: new BigNumber(info.ratio_e * 100),
          ratioEnergyPool: new BigNumber(info.ratio_e_pool * 100),
          cNaranja: naranja,
          voteSR: info.srVote,
          proEnergy: providerEnergy,
          proEnergyTotal: providerEnergyTotal,

          proBand: providerBand,
          proBandTotal: providerBandTotal,
        });

        let allPayed = await fetch(url + "acum_payments", {
          method: "POST",
          headers: {
            "token-api": env.REACT_APP_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ wallet: accountAddress }),
        })
          .then((r) => {
            return r.json();
          })
          .then((r) => {
            return r.data;
          })
          .catch((e) => {
            console.log(e);
            return 0;
          });

        allPayed = new BigNumber(allPayed)
          .dp(3)
          .toNumber()
          .toLocaleString("en-US");
        this.setState({ allPayed: allPayed });

        let dataHistoric = await fetch(url + "historic_payments", {
          method: "POST",
          headers: {
            "token-api": env.REACT_APP_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ wallet: accountAddress }),
        })
          .then((r) => {
            return r.json();
          })
          .then((r) => {
            return r.data;
          })
          .catch((e) => {
            console.log(e);
            return [];
          });

        dataHistoric = dataHistoric.map((item, index) => {
          item.amount = new BigNumber(item.amount);
          if (item.amount_stable) {
            if (item.coin.toLowerCase() !== "trx") {
              item.amount = new BigNumber(item.amount_stable);
              if (
                item.amount.toNumber() < 5_000_000 &&
                item.amount.toNumber() > 0
              ) {
                item.amount = item.amount.shiftedBy(6);
              }
            }
          }

          return {
            index,
            date: moment
              .utc(item.date * 1000)
              .tz(this.state.tiempo)
              .format("lll"),
            amount: item.amount.shiftedBy(-6).dp(6).toNumber(),
            coin: item.coin,
          };
        });

        let totalPayed30 = dataHistoric.reduce((totales, { amount, coin }) => {
          let index = totales.findIndex((item) => item.coin === coin);
          if (index === -1) {
            totales.push({ coin, amount: new BigNumber(amount) });
          } else {
            totales[index].amount = totales[index].amount.plus(amount);
          }

          return totales;
        }, []);

        console.log(totalPayed30);

        totalPayed30 = totalPayed30.map((item) => {
          const cantidad = item.amount.dp(6).toNumber().toLocaleString("en-US");
          return `${cantidad} ${item.coin}`;
        });
        console.log(totalPayed30);

        this.setState({
          dataHistoric,
          totalPayed30: totalPayed30.join(" + "),
        });

        let ongoins = await fetch(url + "ongoingdeals", {
          method: "POST",
          headers: {
            "token-api": env.REACT_APP_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ wallet: accountAddress }),
        })
          .then((r) => {
            return r.json();
          })
          .then((r) => {
            return r.ongoing_deals;
          })
          .catch((e) => {
            console.log(e);
            return [];
          });

        let listWallets = [];

        ongoins = ongoins.map((item, index) => {
          listWallets.push(item.customer);

          item.lock = "unlock";

          if (item.order_type.toLowerCase().includes("wol")) {
            item.lock = "unlock";
          } else {
            item.lock = "lock";
          }

          if (item.order_type.toLowerCase().includes("hour")) {
            item.order_type = "HOUR";
          }

          if (item.order_type.toLowerCase().includes("day")) {
            item.order_type = "DAY";
          }

          if (item.order_type.toLowerCase().includes("minutes")) {
            item.order_type = "MINUTES";
          }

          item.confirm = moment
            .utc(item.confirm * 1000)
            .tz(this.state.tiempo)
            .format("lll");
          item.unfreeze = moment
            .utc(item.unfreeze * 1000)
            .tz(this.state.tiempo)
            .format("lll");
          item.time = item.confirm + " -> " + item.unfreeze;

          return { index, ...item };
        });

        let completed = await fetch(url + "completed_deals", {
          method: "POST",
          headers: {
            "token-api": env.REACT_APP_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ wallet: accountAddress }),
        })
          .then((r) => {
            return r.json();
          })
          .then((r) => {
            return r.completed_deals;
          })
          .catch((e) => {
            console.log(e);
            return [];
          });

        completed = completed.map((item, index) => {
          listWallets.push(item.customer);

          item.lock = "unlock";

          if (item.order_type.toLowerCase().includes("wol")) {
            item.lock = "unlock";
          } else {
            item.lock = "lock";
          }

          if (item.order_type.toLowerCase().includes("hour")) {
            item.order_type = "HOUR";
          }

          if (item.order_type.toLowerCase().includes("day")) {
            item.order_type = "DAY";
          }

          if (item.order_type.toLowerCase().includes("minutes")) {
            item.order_type = "MINUTES";
          }

          item.confirm = moment
            .utc(item.confirm * 1000)
            .tz(this.state.tiempo)
            .format("lll");
          item.unfreeze = moment
            .utc(item.unfreeze * 1000)
            .tz(this.state.tiempo)
            .format("lll");
          item.time = item.confirm + " -> " + item.unfreeze;
          return { index, ...item };
        });

        const delegationInfo =
          await this.props.tronWeb.trx.getDelegatedResourceAccountIndexV2(
            accountAddress,
          );

        let noregist = [];

        if (delegationInfo.toAccounts) {
          for (
            let index = 0;
            index < delegationInfo.toAccounts.length;
            index++
          ) {
            delegationInfo.toAccounts[index] =
              this.props.tronWeb.address.fromHex(
                delegationInfo.toAccounts[index],
              );

            if (listWallets.indexOf(delegationInfo.toAccounts[index]) === -1) {
              let info = await this.props.tronWeb.trx.getDelegatedResourceV2(
                accountAddress,
                delegationInfo.toAccounts[index],
              );

              //console.log(info.delegatedResource)

              for (
                let index2 = 0;
                index2 < info.delegatedResource.length;
                index2++
              ) {
                let order = {
                  wallet: delegationInfo.toAccounts[index],
                  resource: "ENERGY",
                  trx: 0,
                  sun: "0",
                  expire: "--/--/-- 00:00 --",
                  ownerAddress: accountAddress,
                };

                if (info.delegatedResource[index2].frozen_balance_for_energy) {
                  order.trx =
                    info.delegatedResource[index2].frozen_balance_for_energy /
                    10 ** 6;
                  order.sun =
                    info.delegatedResource[index2].frozen_balance_for_energy;
                  if (info.delegatedResource[index2].expire_time_for_energy) {
                    order.expire = new Date(
                      info.delegatedResource[index2].expire_time_for_energy,
                    );
                    order.expire = moment
                      .utc(order.expire)
                      .tz(this.state.tiempo)
                      .format("lll");
                  }
                } else {
                  order.trx =
                    info.delegatedResource[index2]
                      .frozen_balance_for_bandwidth /
                    10 ** 6;
                  order.sun =
                    info.delegatedResource[index2].frozen_balance_for_bandwidth;
                  if (
                    info.delegatedResource[index2].expire_time_for_bandwidth
                  ) {
                    order.expire = new Date(
                      info.delegatedResource[index2].expire_time_for_bandwidth,
                    );
                    order.expire = moment
                      .utc(order.expire)
                      .tz(this.state.tiempo)
                      .format("lll");
                  }

                  order.resource = "BANDWIDTH";
                }

                noregist.push(order);
              }
            }
          }
        }

        this.setState({
          ongoins,
          completed,
          noregist,
        });
      }
    }
  }

  async handleChange(event) {
    let elemento = event.target;

    //console.log(elemento.id)

    switch (elemento.id) {
      case "rent":
        if (elemento.value !== this.state.rent) {
          //alert("diferentes: " + this.state.rent) //hace cambio

          let activate = 1;
          if (this.state.rent) {
            activate = 0;
          }
          // activar renta

          try {
            let body = { wallet: this.props.accountAddress, active: activate };
            fetch(config.apiProviders + "set/active", {
              method: "POST",
              headers: {
                "token-api": env.REACT_APP_TOKEN,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            });
          } catch (error) {
            console.log(error.toString());
          }

          let value = false;
          if (elemento.value === "true") {
            value = true;
          }

          this.setState({
            rent: value,
          });
        }

        break;

      case "band":
        if (elemento.value !== this.state.sellband) {
          //alert("diferentes: " + this.state.rent) //hace cambio

          let over = 0;
          let activate = "0";
          if (!this.state.sellband) {
            activate = "1";
            over = parseInt(
              prompt("sell band over, leave ", this.state.bandover),
            );

            console.log(over);
            if (!isNaN(over)) {
              let body = {
                wallet: this.props.accountAddress,
                sellbandover: over,
              };

              fetch(config.apiProviders + "set/sellbandover", {
                method: "POST",
                headers: {
                  "token-api": env.REACT_APP_TOKEN,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
              });
            }
          }
          // activar renta

          try {
            let body = {
              wallet: this.props.accountAddress,
              sellband: activate,
            };
            fetch(config.apiProviders + "set/sellband", {
              method: "POST",
              headers: {
                "token-api": env.REACT_APP_TOKEN,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            });
          } catch (error) {
            console.log(error.toString());
          }

          let value = false;
          if (elemento.value === "true") {
            value = true;
          }

          this.setState({
            sellband: value,
          });
        }

        break;

      case "ener":
        if (elemento.value !== this.state.sellener) {
          let over = 0;
          if (!this.state.sellener) {
            over = parseInt(prompt("sell energy over, leave ", 32000));
          }

          //console.log(over)

          if (!isNaN(over)) {
            let body = {
              wallet: this.props.accountAddress,
              sellenergyover: over,
            };

            fetch(config.apiProviders + "set/sellenergyover", {
              method: "POST",
              headers: {
                "token-api": env.REACT_APP_TOKEN,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            });
          }

          let value = false;
          if (elemento.value === "true") {
            value = true;
          }

          this.setState({
            sellband: value,
          });
        }

        break;

      case "burn":
        if (elemento.value !== this.state.burn) {
          //alert("diferentes: " + this.state.rent) //hace cambio

          let activate = "1";
          if (this.state.burn) {
            activate = "0";
          }
          // activar renta

          try {
            let body = { wallet: this.props.accountAddress, burn: activate };
            fetch(config.apiProviders + "set/burn", {
              method: "POST",
              headers: {
                "token-api": env.REACT_APP_TOKEN,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            });
          } catch (error) {
            console.log(error.toString());
          }

          //console.log(elemento.value)

          let value = false;
          if (elemento.value === "true") {
            value = true;
          }

          this.setState({
            burn: value,
          });
        }

        break;

      case "voteSR":
        this.setState({
          newVoteSR: elemento.value,
        });

        break;

      case "noti":
        if (elemento.value !== this.state.noti) {
          //alert("diferentes: " + this.state.noti) //hace cambio

          let activate = "1";
          if (this.state.noti) {
            activate = "0";
          }
          // activar renta

          try {
            let body = {
              wallet: this.props.accountAddress,
              allow_notifications: activate,
            };
            fetch(config.apiProviders + "set/allow_notifications", {
              method: "POST",
              headers: {
                "token-api": env.REACT_APP_TOKEN,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            });
          } catch (error) {
            console.log(error.toString());
          }

          let value = false;
          if (elemento.value === "true") {
            value = true;
          }

          this.setState({
            noti: value,
          });
        }

        break;

      default:
        break;
    }

    this.estado();
  }

  async grafico(external_data) {
    if (!document.getElementById("chartdiv")) return;

    if (this.root) {
      this.root.dispose();
    }
    const root = am5.Root.new("chartdiv");
    root._logo.dispose();
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        layout: root.verticalLayout,
      }),
    );

    // Define data
    let data = [
      {
        date: new Date(1712953610 * 1000),
        amount: 1000,
        coin: "trx",
      },
      {
        date: new Date(1712780810 * 1000),
        amount: 1300,
        coin: "trx",
      },
      {
        date: new Date(1712694410 * 1000),
        amount: 1200,
        coin: "trx",
      },
      {
        date: new Date(1712694410 * 1000),
        amount: 250,
        coin: "brst",
      },
      {
        date: new Date(1712521610 * 1000),
        amount: 200,
        coin: "brst",
      },
      {
        date: new Date(1712435210 * 1000),
        amount: 500,
        coin: "brst",
      },
    ];

    data = external_data;

    // Create Y-axis
    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {}),
        categoryField: "date",
      }),
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
        stroke: am5.color(0x7135ff),
      }),
    );
    series1.data.setAll(data);

    chart.set("cursor", am5xy.XYCursor.new(root, {}));

    this.root = root;
  }

  async setConfig(target, info) {
    const { accountAddress } = this.props;
    let { ModalTitulo, ModalBody } = this.state;

    let msg = false;

    async function setFreez(data) {
      try {
        let body = { wallet: accountAddress, autofreeze: data };
        await fetch(config.apiProviders + "set/autofreeze", {
          method: "POST",
          headers: {
            "token-api": env.REACT_APP_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
      } catch (error) {
        console.log(error.toString());
      }
    }

    async function setPaymentHour(hour) {
      try {
        let body = { wallet: accountAddress, paymenthour: hour };
        let consulta = await fetch(config.apiProviders + "set/paymenthour", {
          method: "POST",
          headers: {
            "token-api": env.REACT_APP_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }).then((r) => r.json());

        if (!consulta.result && consulta.data) {
          msg = true;
          ModalTitulo = "Operation not executed";
          ModalBody = consulta.data;
        }
      } catch (error) {
        console.log(error.toString());
      }
    }

    async function setMaxDays(days) {
      try {
        let body = { wallet: accountAddress, maxdays: days };
        await fetch(config.apiProviders + "set/maxdays", {
          method: "POST",
          headers: {
            "token-api": env.REACT_APP_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
      } catch (error) {
        console.log(error.toString());
      }
    }

    async function setWalletSr(wallet) {
      try {
        let body = { wallet: accountAddress, sr: wallet };
        await fetch(config.apiProviders + "set/sr", {
          method: "POST",
          headers: {
            "token-api": env.REACT_APP_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
      } catch (error) {
        console.log(error.toString());
      }
    }

    async function setCoin(coin) {
      try {
        let body = { wallet: accountAddress, currency: coin.toUpperCase() };
        let consulta = await fetch(
          config.apiProviders + "set/change_currency",
          {
            method: "POST",
            headers: {
              "token-api": env.REACT_APP_TOKEN,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          },
        ).then((r) => r.json());

        console.log(consulta);

        if (consulta.result) {
          if (consulta.data.msg) {
            msg = true;
            ModalTitulo = "Operation Alert";
            ModalBody = consulta.data.msg;
          }
        } else {
          msg = true;
          ModalTitulo = "Operation not executed";
          ModalBody = consulta.data;
        }
      } catch (error) {
        console.log(error.toString());
      }
    }

    switch (target) {
      case "setFreez":
        await setFreez(info);
        break;

      case "setPaymentHour":
        await setPaymentHour(info);
        break;

      case "setMaxDays":
        await setMaxDays(info);
        break;

      case "setWalletSr":
        await setWalletSr(info);
        break;

      case "setCoin":
        await setCoin(info);
        break;

      default:
        alert("no asigned");
        break;
    }

    if (msg) {
      this.setState({
        ModalTitulo,
        ModalBody,
      });
      window.$("#alert").modal("show");
    }

    this.estado();
  }

  render() {
    let { provider, firma, autofreeze, coin, dataHistoric } = this.state;

    if (provider) {
      if (!firma) {
        return (
          <>
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="row">
                    <div className="col-12">
                      <div className="card exchange">
                        <div
                          className="card-header d-block"
                          style={{ border: "none" }}
                        >
                          <h2 className="heading">
                            Status: you are a provider
                          </h2>

                          <p>
                            <button
                              className="btn btn-warning"
                              onClick={() => this.estado()}
                            >
                              Login
                            </button>
                          </p>

                          <p>
                            There seems to be problems when performing signature
                            verification please contact support.
                          </p>

                          <p>
                            Join the telegram providers{" "}
                            <a
                              href="https://t.me/+V-HHCgAevxA5NGQ0"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              channel
                            </a>{" "}
                            to keep tuned with the latest news!{" "}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      } else {
        let estatus = (
          <button
            className="btn btn-outline-danger btn-block"
            style={{
              cursor: "default",
              maxHeight: "36.55px",
              fontSize: "12px",
            }}
          >
            <i className="bi bi-sign-stop-fill"></i> Stopped
          </button>
        );

        if (this.state.rent) {
          estatus = (
            <button
              className="btn btn-outline-info btn-block"
              style={{
                cursor: "default",
                maxHeight: "36.55px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-arrow-clockwise"></i> Recharging
            </button>
          );

          if (this.state.elegible) {
            estatus = (
              <button
                className="btn btn-outline-success btn-block"
                style={{
                  cursor: "default",
                  maxHeight: "36.55px",
                  fontSize: "12px",
                }}
              >
                <i className="bi bi-check-circle-fill"></i> Active
              </button>
            );
          }
        }

        let campoFreeze = <></>;

        if (autofreeze !== "Off") {
          campoFreeze = (
            <div className="container mt-1">
              <div className="row mt-1">
                <div className="col-12">
                  Wallet of SR to vote (default: Brutus)
                </div>
                <div className="col-11">
                  <input
                    type="text"
                    className="form-control"
                    id="voteSR"
                    style={{ borderColor: "#c3c3c3" }}
                    placeholder={this.state.voteSR}
                    onChange={this.handleChange}
                    disabled={false}
                  ></input>
                </div>
                <div className="col-1">
                  <i
                    className="bi bi-question-circle-fill"
                    title="You can set by which super representative wallet the automatic votes will be made"
                    onClick={() => {
                      this.setState({
                        ModalTitulo: "Info",
                        ModalBody:
                          "You can set by which super representative wallet the automatic votes will be made",
                      });

                      window.$("#alert").modal("show");
                    }}
                  ></i>
                </div>
              </div>
            </div>
          );

          if (
            this.state.voteSR !== "" &&
            this.props.tronWeb.isAddress(this.state.newVoteSR) &&
            this.state.voteSR !== this.state.newVoteSR
          ) {
            campoFreeze = (
              <>
                {campoFreeze}
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => {
                    this.setWalletSr(this.state.newVoteSR);
                  }}
                >
                  Update Wallet to Vote
                </button>
              </>
            );
          }
        }

        return (
          <>
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="row">
                    <div className="col-lg-8 col-sm-12">
                      <div className="card exchange">
                        <div
                          className="card-header d-block"
                          style={{ border: "none" }}
                        >
                          <div className="container-fluid">
                            <div className="row">
                              <div className="col-lg-6 col-sm-12 mb-2 text-center">
                                <img
                                  height="15px"
                                  src="images/energy.png"
                                  alt=""
                                ></img>{" "}
                                Energy (
                                {this.state.proEnergy.toLocaleString("en-US")}/
                                {this.state.proEnergyTotal.toLocaleString(
                                  "en-us",
                                )}
                                )
                                <div
                                  className="progress"
                                  style={{
                                    margin: "5px",
                                    backgroundColor: "lightgray",
                                  }}
                                >
                                  <div
                                    className="progress-bar bg-warning"
                                    role="progressbar"
                                    style={{
                                      width:
                                        (this.state.proEnergy /
                                          this.state.proEnergyTotal) *
                                          100 +
                                        "%",
                                    }}
                                    aria-valuenow={
                                      (this.state.proEnergy /
                                        this.state.proEnergyTotal) *
                                      100
                                    }
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  ></div>
                                </div>
                              </div>
                              <div className="col-lg-6 col-sm-12 mb-2 text-center">
                                <span role="img">{"🌐"}</span> Bandwidth (
                                {this.state.proBand.toLocaleString("en-us")}/
                                {this.state.proBandTotal.toLocaleString(
                                  "en-us",
                                )}
                                )
                                <div
                                  className="progress"
                                  style={{
                                    margin: "5px",
                                    backgroundColor: "lightgray",
                                  }}
                                >
                                  <div
                                    className="progress-bar bg-info"
                                    role="progressbar"
                                    style={{
                                      width:
                                        (this.state.proBand /
                                          this.state.proBandTotal) *
                                          100 +
                                        "%",
                                    }}
                                    aria-valuenow={
                                      (this.state.proBand /
                                        this.state.proBandTotal) *
                                      100
                                    }
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  ></div>
                                </div>
                              </div>
                              <div className="col-lg-4 col-sm-12 mb-2">
                                <h2 className="heading">{estatus} </h2>
                              </div>
                              <div className="col-lg-4 col-sm-12 mb-2">
                                <h2 className="heading">
                                  <button
                                    type="button"
                                    className="btn btn-outline-warning btn-block"
                                    style={{
                                      cursor: "default",
                                      maxHeight: "36.55px",
                                      fontSize: "12px",
                                    }}
                                  >
                                    <img
                                      height="15px"
                                      src="images/naranja.png"
                                      alt=""
                                    ></img>{" "}
                                    {this.state.ratioEnergy.dp(3).toString(10)}{" "}
                                    {this.state.ratioEnergyPool.toNumber() >
                                      0 &&
                                      " / " +
                                        this.state.ratioEnergyPool
                                          .dp(3)
                                          .toString(10)}{" "}
                                  </button>
                                </h2>
                              </div>
                              <div className="col-lg-4 col-sm-12 mb-2">
                                <h2 className="heading">
                                  <button
                                    className="btn btn-outline-secondary btn-block"
                                    style={{
                                      cursor: "default",
                                      maxHeight: "36.55px",
                                      fontSize: "12px",
                                    }}
                                  >
                                    {" "}
                                    <span role="img" aria-label="$">
                                      💲
                                    </span>{" "}
                                    Payout %{this.state.paymentPoints}{" "}
                                  </button>
                                </h2>
                              </div>

                              <div className="col-lg-6 col-md-12 mb-2">
                                <button
                                  type="button"
                                  className="btn btn-primary dropdown-toggle "
                                  style={{ width: "90%" }}
                                  data-bs-toggle="dropdown"
                                  id="menu1"
                                >
                                  Pay hour: {this.state.payhour} GMT
                                </button>{" "}
                                {"  "}{" "}
                                <span role="img">
                                  <i
                                    className="bi bi-question-circle-fill"
                                    title="Set the time you want to receive your daily payments"
                                    onClick={() => {
                                      this.setState({
                                        ModalTitulo: "Info",
                                        ModalBody:
                                          "Set the time you want to receive your daily payments",
                                      });

                                      window.$("#alert").modal("show");
                                    }}
                                  ></i>
                                </span>
                                <div
                                  className="dropdown-menu"
                                  aria-labelledby="menu1"
                                >
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      this.setConfig("setPaymentHour", "130")
                                    }
                                  >
                                    1:30 GMT
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      this.setConfig("setPaymentHour", "930")
                                    }
                                  >
                                    9:30 GMT
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      this.setConfig("setPaymentHour", "1730")
                                    }
                                  >
                                    17:30 GMT
                                  </button>
                                </div>
                              </div>

                              <div className="col-lg-6 col-md-12 mb-2">
                                <button
                                  type="button"
                                  className="btn btn-primary dropdown-toggle "
                                  style={{ width: "90%" }}
                                  data-bs-toggle="dropdown"
                                  id="menu1"
                                >
                                  Coin: {coin}{" "}
                                </button>{" "}
                                {"  "}{" "}
                                <i
                                  className="bi bi-question-circle-fill"
                                  title="Set the currency you want to receive your daily payments"
                                  onClick={() => {
                                    this.setState({
                                      ModalTitulo: "Info",
                                      ModalBody:
                                        "Set the currency you want to receive your daily payments",
                                    });

                                    window.$("#alert").modal("show");
                                  }}
                                ></i>
                                <div
                                  className="dropdown-menu"
                                  aria-labelledby="menu1"
                                >
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      this.setConfig("setCoin", "trx")
                                    }
                                  >
                                    TRX
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      this.setConfig("setCoin", "usdd")
                                    }
                                  >
                                    USDD
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      this.setConfig("setCoin", "usdt")
                                    }
                                  >
                                    USDT
                                  </button>
                                </div>
                              </div>

                              <div className="col-lg-6 col-md-12 mb-2">
                                <button
                                  type="button"
                                  className="btn btn-primary dropdown-toggle"
                                  style={{ width: "90%" }}
                                  data-bs-toggle="dropdown"
                                  id="menu2"
                                >
                                  Max Days: {this.state.maxdays}
                                </button>{" "}
                                <i
                                  className="bi bi-question-circle-fill"
                                  title="Establish the max. duration of the orders you want to accept"
                                  onClick={() => {
                                    this.setState({
                                      ModalTitulo: "Info",
                                      ModalBody:
                                        "Establish the max. duration of the orders you want to accept",
                                    });

                                    window.$("#alert").modal("show");
                                  }}
                                ></i>
                                <div
                                  className="dropdown-menu"
                                  aria-labelledby="menu2"
                                >
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      this.setConfig("setMaxDays", "1h")
                                    }
                                  >
                                    1h
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      this.setConfig("setMaxDays", 3)
                                    }
                                  >
                                    3 days
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      this.setConfig("setMaxDays", 7)
                                    }
                                  >
                                    7 days
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      this.setConfig("setMaxDays", 14)
                                    }
                                  >
                                    14 days
                                  </button>
                                </div>
                              </div>

                              <div className="col-lg-6 col-md-12 mb-2">
                                <button
                                  type="button"
                                  className="btn btn-primary dropdown-toggle"
                                  style={{ width: "90%" }}
                                  data-bs-toggle="dropdown"
                                  id="menu"
                                >
                                  Autofreeze: {this.state.autofreeze}
                                </button>{" "}
                                {"  "}{" "}
                                <i
                                  className="bi bi-question-circle-fill"
                                  title="Let the bot freeze the remaining TRX in your wallet (leaving 100 TRX unfrozen)"
                                  onClick={() => {
                                    this.setState({
                                      ModalTitulo: "Info",
                                      ModalBody:
                                        "Let the bot freeze the remaining TRX in your wallet (leaving 100 TRX unfrozen)",
                                    });

                                    window.$("#alert").modal("show");
                                  }}
                                ></i>
                                <div
                                  className="dropdown-menu"
                                  aria-labelledby="menu"
                                >
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      this.setConfig("setFreez", "no")
                                    }
                                  >
                                    Off
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      this.setConfig("setFreez", "bandwidth")
                                    }
                                  >
                                    Bandwidth
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      this.setConfig("setFreez", "energy")
                                    }
                                  >
                                    Energy
                                  </button>
                                </div>
                              </div>

                              <div className="col-lg-12 col-sm-12 mb-2">
                                {campoFreeze}
                              </div>

                              <div className="col-4  ">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="rent"
                                  style={{
                                    backgroundColor: this.state.rent
                                      ? "#9568FF"
                                      : "lightgray",
                                  }}
                                  checked={this.state.rent}
                                  onChange={this.handleChange}
                                ></input>
                                <label
                                  className="form-check-label"
                                  htmlFor="flexSwitchCheckDefault"
                                >
                                  Rent{" "}
                                  <i
                                    className="bi bi-question-circle-fill"
                                    title="Pause/Resume the bot"
                                    onClick={() => {
                                      this.setState({
                                        ModalTitulo: "Info",
                                        ModalBody: "Pause/Resume the bot",
                                      });

                                      window.$("#alert").modal("show");
                                    }}
                                  ></i>
                                </label>
                              </div>

                              <div
                                className="col-4  "
                                style={{ textAlign: "center" }}
                              >
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="burn"
                                  style={{
                                    backgroundColor: this.state.burn
                                      ? "#9568FF"
                                      : "lightgray",
                                  }}
                                  checked={this.state.burn}
                                  onChange={this.handleChange}
                                ></input>
                                <label
                                  className="form-check-label"
                                  htmlFor="flexSwitchCheckDefault"
                                >
                                  Burn{" "}
                                  <i
                                    className="bi bi-question-circle-fill"
                                    title="Allow TRX burn to accept new orders when you run out of bandwidth"
                                    onClick={() => {
                                      this.setState({
                                        ModalTitulo: "Info",
                                        ModalBody:
                                          "Allow TRX burn to accept new orders when you run out of bandwidth",
                                      });

                                      window.$("#alert").modal("show");
                                    }}
                                  ></i>
                                </label>
                              </div>

                              <div
                                className="col-4  "
                                style={{ textAlign: "right" }}
                              >
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="noti"
                                  style={{
                                    backgroundColor: this.state.noti
                                      ? "#9568FF"
                                      : "lightgray",
                                  }}
                                  checked={this.state.noti}
                                  onChange={this.handleChange}
                                ></input>
                                <label
                                  className="form-check-label"
                                  htmlFor="flexSwitchCheckDefault"
                                >
                                  Notify{" "}
                                  <i
                                    className="bi bi-question-circle-fill"
                                    title="Pause/Resume notifications from the telegram bot"
                                    onClick={() => {
                                      this.setState({
                                        ModalTitulo: "Info",
                                        ModalBody:
                                          "Pause/Resume notifications from the telegram bot",
                                      });

                                      window.$("#alert").modal("show");
                                    }}
                                  ></i>
                                </label>
                              </div>

                              <div className="col-6  ">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="band"
                                  style={{
                                    backgroundColor: this.state.sellband
                                      ? "#9568FF"
                                      : "lightgray",
                                  }}
                                  checked={this.state.sellband}
                                  onChange={this.handleChange}
                                ></input>
                                <label
                                  className="form-check-label"
                                  htmlFor="flexSwitchCheckDefault"
                                >
                                  Sell Band over: <br></br>
                                  {this.state.bandover.toLocaleString(
                                    "en-us",
                                  )}{" "}
                                  <i
                                    className="bi bi-question-circle-fill"
                                    title="Sell your staked bandwidth over the amount you establish"
                                    onClick={() => {
                                      this.setState({
                                        ModalTitulo: "Info",
                                        ModalBody:
                                          "Sell your staked bandwidth over the amount you establish",
                                      });

                                      window.$("#alert").modal("show");
                                    }}
                                  ></i>
                                </label>
                              </div>

                              <div
                                className="col-6 "
                                style={{ textAlign: "right" }}
                              >
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="ener"
                                  style={{
                                    backgroundColor: this.state.sellener
                                      ? "#9568FF"
                                      : "lightgray",
                                  }}
                                  checked={this.state.sellener}
                                  onChange={this.handleChange}
                                ></input>
                                <label
                                  className="form-check-label"
                                  htmlFor="flexSwitchCheckDefault"
                                >
                                  Sell Energy over: <br></br>{" "}
                                  {this.state.enerover.toLocaleString("en-us")}{" "}
                                  <i
                                    className="bi bi-question-circle-fill"
                                    title="Sell your staked energy over the amount you establish"
                                    onClick={() => {
                                      this.setState({
                                        ModalTitulo: "Info",
                                        ModalBody:
                                          "Sell your staked energy over the amount you establish",
                                      });

                                      window.$("#alert").modal("show");
                                    }}
                                  ></i>
                                </label>
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
                          <div className="mt-1">
                            Hour {this.state.payhour} GMT
                          </div>
                          <hr></hr>
                          <div className="count-num mt-1">
                            {this.state.payment.toLocaleString("en-US")} TRX
                          </div>
                          <hr></hr>

                          <div className="mt-1">
                            that will be paid here:<br></br>{" "}
                            <u
                              onMouseEnter={() => {
                                this.setState({ payHere: this.state.payhere });
                              }}
                              onMouseLeave={() => {
                                this.setState({
                                  payHere:
                                    "*************************************",
                                });
                              }}
                            >
                              {this.state.payHere}
                            </u>
                          </div>

                          <hr></hr>

                          <div className="mt-1">
                            Total earned all time:<br></br>
                            <b>{this.state.allPayed} TRX</b> <br></br>
                            <button
                              className="btn btn-danger"
                              onClick={() => {
                                localStorage.removeItem("firma-tron");
                                this.setState({ firma: false });
                              }}
                            >
                              LogOut{" "}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-box-arrow-right"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
                                />
                                <path
                                  fillRule="evenodd"
                                  d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
                                />
                              </svg>
                            </button>
                          </div>
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
                          <h4 className="card-title">
                            last {dataHistoric.length} payments ={" "}
                            {this.state.totalPayed30}
                          </h4>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-lg-8 col-sm-12">
                              <div
                                className="table-responsive recentOrderTable overflow-scroll"
                                style={{ height: "350px" }}
                              >
                                <table className="table verticle-middle table-responsive-md ">
                                  <thead>
                                    <tr>
                                      <th
                                        scope="col"
                                        style={{ textAlign: "right" }}
                                      >
                                        Amount
                                      </th>
                                      <th scope="col">Currency</th>
                                      <th scope="col">Date</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {dataHistoric
                                      .toReversed()
                                      .map((item, index) => {
                                        return (
                                          <tr key={index}>
                                            <td align="right">
                                              {item.amount.toLocaleString(
                                                "en-US",
                                              )}
                                            </td>
                                            <td>{item.coin}</td>
                                            <td>{item.date}</td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            <div className="col-lg-4 col-sm-12">
                              <div
                                className="mb-3"
                                id="chartdiv"
                                style={{
                                  height: this.state.alturaGrafico,
                                  backgroundColor: "white",
                                }}
                              ></div>
                              <button
                                className="btn btn-success"
                                onClick={() => {
                                  if (this.state.alturaGrafico === "0px") {
                                    this.setState({ alturaGrafico: "350px" });
                                    this.grafico(this.state.dataHistoric);
                                  } else {
                                    this.setState({ alturaGrafico: "0px" });
                                    this.root.dispose();
                                  }
                                }}
                              >
                                Graphic (Open / Close)
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="card-footer">
                          <CsvDownloader
                            filename={"Last_30_payments"}
                            suffix={true}
                            extension=".csv"
                            separator=";"
                            wrapColumnChar="'"
                            columns={[
                              {
                                id: "amount",
                                displayName: "Amount",
                              },
                              {
                                id: "coin",
                                displayName: "Currency",
                              },
                              {
                                id: "date",
                                displayName: "Date",
                              },
                            ]}
                            datas={dataHistoric}
                            text="DOWNLOAD CSV"
                            className="btn btn-info"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h4 className="card-title">
                            Ongoing deals ({this.state.ongoins.length})
                          </h4>
                        </div>
                        <div className="card-body">
                          <div
                            className="table-responsive recentOrderTable overflow-scroll"
                            style={{ height: "350px" }}
                          >
                            <table className="table verticle-middle table-responsive-md ">
                              <thead>
                                <tr>
                                  <th scope="col">Resource / Period</th>
                                  <th scope="col">Buyer / Time</th>
                                  <th scope="col">Payout</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.ongoins.map((item) => {
                                  return (
                                    <tr key={item.index}>
                                      <td>
                                        {item.amount.toLocaleString("en-US")}{" "}
                                        {item.resource} / {item.order_type}{" "}
                                        <i
                                          className={
                                            "bi bi-" + item.lock + "-fill"
                                          }
                                        ></i>
                                      </td>
                                      <td>
                                        {item.customer}
                                        <br></br>
                                        {item.confirm}
                                        {" -> "}
                                        {item.unfreeze}
                                        <br></br>
                                      </td>
                                      <td>{item.payout} TRX</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="card-footer">
                          <CsvDownloader
                            filename={"ongoing_deals"}
                            suffix={true}
                            extension=".csv"
                            separator=";"
                            wrapColumnChar="'"
                            columns={[
                              {
                                id: "resource",
                                displayName: "Resource",
                              },
                              {
                                id: "order_type",
                                displayName: "Period",
                              },
                              {
                                id: "customer",
                                displayName: "Buyer",
                              },
                              {
                                id: "time",
                                displayName: "Time",
                              },
                              {
                                id: "payout",
                                displayName: "Payout",
                              },
                            ]}
                            datas={this.state.ongoins}
                            text="DOWNLOAD CSV"
                            className="btn btn-info"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h4 className="card-title">
                            Completed deals ({this.state.completed.length})
                          </h4>
                        </div>
                        <div className="card-body">
                          <div
                            className="table-responsive recentOrderTable overflow-scroll"
                            style={{ height: "350px" }}
                          >
                            <table className="table verticle-middle table-responsive-md ">
                              <thead>
                                <tr>
                                  <th scope="col">Resource / Period</th>
                                  <th scope="col">Buyer / Time</th>
                                  <th scope="col">Payout</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.completed.map((item) => {
                                  return (
                                    <tr key={item.index}>
                                      <td>
                                        {item.amount.toLocaleString("en-US")}{" "}
                                        {item.resource} / {item.order_type}{" "}
                                        <i
                                          className={
                                            "bi bi-" + item.lock + "-fill"
                                          }
                                        ></i>
                                      </td>
                                      <td>
                                        {item.customer}
                                        <br></br>
                                        {item.confirm}
                                        {" -> "}
                                        {item.unfreeze}
                                        <br></br>
                                      </td>
                                      <td>{item.payout} TRX</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="card-footer">
                          <CsvDownloader
                            filename={"completed_deals"}
                            suffix={true}
                            extension=".csv"
                            separator=";"
                            wrapColumnChar="'"
                            columns={[
                              {
                                id: "resource",
                                displayName: "Resource",
                              },
                              {
                                id: "order_type",
                                displayName: "Period",
                              },
                              {
                                id: "customer",
                                displayName: "Buyer",
                              },
                              {
                                id: "time",
                                displayName: "Time",
                              },
                              {
                                id: "payout",
                                displayName: "Payout",
                              },
                            ]}
                            datas={this.state.completed}
                            text="DOWNLOAD CSV"
                            className="btn btn-info"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h4 className="card-title">
                            Other delegations ({this.state.noregist.length})
                          </h4>
                        </div>
                        <div className="card-body">
                          <div
                            className="table-responsive recentOrderTable overflow-scroll"
                            style={{ height: "350px" }}
                          >
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
                                {this.state.noregist.map((item) => {
                                  let amount = item.sun;
                                  let receiverAddress = item.wallet;
                                  let resource = item.resource;
                                  let ownerAddress = item.ownerAddress;

                                  return (
                                    <tr key={item.index}>
                                      <td className="text-end">
                                        <div className="dropdown custom-dropdown mb-0">
                                          <div
                                            className="btn sharp btn-primary tp-btn"
                                            data-bs-toggle="dropdown"
                                          >
                                            <i className="bi bi-three-dots-vertical"></i>
                                          </div>
                                          <div className="dropdown-menu dropdown-menu-end">
                                            <a
                                              className="dropdown-item text-info"
                                              href="https://tronscan.org/#/wallet/resources"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              View on TronScan
                                            </a>

                                            <button
                                              className="dropdown-item text-danger"
                                              onClick={async () => {
                                                let transaction =
                                                  await this.props.tronWeb.transactionBuilder.undelegateResource(
                                                    amount,
                                                    receiverAddress,
                                                    resource,
                                                    ownerAddress,
                                                  );
                                                transaction =
                                                  await window.tronWeb.trx.sign(
                                                    transaction,
                                                  );
                                                transaction =
                                                  await this.props.tronWeb.trx.sendRawTransaction(
                                                    transaction,
                                                  );

                                                this.setState({
                                                  ModalTitulo:
                                                    "Result: " +
                                                    transaction.result,
                                                  ModalBody: (
                                                    <a
                                                      className="btn btn-primary"
                                                      href={
                                                        "https://tronscan.org/#/transaction/" +
                                                        transaction.txid
                                                      }
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                    >
                                                      see result in TronScan
                                                    </a>
                                                  ),
                                                });

                                                window
                                                  .$("#alert")
                                                  .modal("show");
                                                this.estado();
                                              }}
                                            >
                                              Reclaim Resource
                                            </button>
                                          </div>
                                        </div>
                                      </td>
                                      <td>{item.resource} </td>
                                      <td>
                                        {item.trx.toLocaleString("en-US")}{" "}
                                      </td>

                                      <td>
                                        {item.wallet}
                                        <br></br>
                                        {item.expire}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h1 className="text-3xl font-bold mb-6">
                            Frequently Asked Questions
                          </h1>
                        </div>
                        <div className="card-body">
                          {faqs.map((faq, index) => (
                            <FaqItem
                              key={index}
                              question={faq.question}
                              answer={faq.answer}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h4 className="card-title">Other Info</h4>
                        </div>
                        <div className="card-body">
                          <p>
                            {"🔵"} Join the telegram providers{" "}
                            <b>
                              <a
                                href="https://t.me/+V-HHCgAevxA5NGQ0"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                channel
                              </a>
                            </b>{" "}
                            to keep tuned with the latest news!
                          </p>
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
                    <h5 className="modal-title">{this.state.ModalTitulo}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>{this.state.ModalBody}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      }
    } else {
      return (
        <>
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="row">
                  <div className="col-12">
                    <div className="card exchange">
                      <div
                        className="card-header d-block"
                        style={{ border: "none" }}
                      >
                        <h2 className="heading">Ready for rent your energy</h2>

                        <p>
                          You are not a supplier? if you want to become one read
                          the following article <br></br>
                          <a
                            className="btn btn-primary"
                            href="https://brutus.finance/brutusprovider.html"
                          >
                            Become a supplier
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
  }
}

const ProviderPanelWT = withTranslation()(ProviderPanel);

export default ProviderPanelWT;
