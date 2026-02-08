import React, { useState, useEffect, useRef } from "react";
import { withTranslation } from "react-i18next";

import BigNumber from "bignumber.js";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import { config } from "../config/env";

import utils from "../services";
import Alert from "../components/Alert";

const options = [
  {
    label: "Hours",
    value: "hour",
  },
  {
    label: "Days",
    value: "day",
  },
];

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

const BrutComponent = (props) => {
  const [state, setState] = useState({
    minCompra: 1,
    minventa: 0.1,
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
    depositoUSDT: "BUY",
    depositoBRUT: "SELL",
    msj: {},
    balanceBRUT: 0,
    balanceUSDT: 0,
    precioBRUT: 0,
  });

  const rootRef = useRef(null);
  const intervalRef = useRef(null);
  const nextUpdateRef = useRef(0);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    document.title = "BRUT | Brutus Token";

    grafico(1000, "day", 30);
    consultarPrecio();

    intervalRef.current = setInterval(() => {
      if (Date.now() >= nextUpdateRef.current) {
        if (!props.contrato.ready) {
          nextUpdateRef.current = Date.now() + 3 * 1000;
        } else {
          nextUpdateRef.current = Date.now() + 60 * 1000;
        }
        estado();
      }
    }, 3 * 1000);

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (rootRef.current) {
        rootRef.current.dispose();
        rootRef.current = null;
      }
    };
  }, []);

  const setStatePartial = (updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const grafico = async (time, temporalidad, cantidad) => {
    const chartElement = document.getElementById("chartdiv");

    if (!chartElement) {
      return;
    }

    // Dispose del root anterior si existe
    if (rootRef.current) {
      rootRef.current.dispose();
      rootRef.current = null;
    }

    // Verificar si el componente sigue montado antes de crear el gráfico
    if (!isMountedRef.current) {
      return;
    }

    const root = am5.Root.new("chartdiv");

    // IMPORTANTE: Asignar la referencia INMEDIATAMENTE después de crear el root
    // Esto garantiza que el cleanup pueda disposed el root si el componente se desmonta
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
      }),
    );

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    let cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "none",
      }),
    );
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
      let date = data.date;

      if (value >= previousValue) {
        color = upColor;
      } else {
        color = downColor;
      }
      previousValue = value;

      let dataObj = { date, value, color }; // color will be used for tooltip background

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
      let consulta = (
        await (
          await fetch(
            config.BRUTUS_API +
              "chartdata/brut?temporalidad=" +
              temporalidad +
              "&limite=" +
              count,
          )
        ).json()
      ).Data;
      let data = [];

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
        tooltip: am5.Tooltip.new(root, {}),
      }),
    );

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    let series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "Series",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
      }),
    );

    series.strokes.template.set("templateField", "strokeSettings");

    let tooltip = series.set(
      "tooltip",
      am5.Tooltip.new(root, {
        labelText: "{valueY}",
      }),
    );

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
        height: 30,
      }),
    );

    let sbDateAxis = scrollbar.chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: {
          timeUnit: temporalidad,
          count: 1,
        },
        renderer: am5xy.AxisRendererX.new(root, {}),
      }),
    );

    let sbValueAxis = scrollbar.chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    let sbSeries = scrollbar.chart.series.push(
      am5xy.LineSeries.new(root, {
        valueYField: "value",
        valueXField: "date",
        xAxis: sbDateAxis,
        yAxis: sbValueAxis,
      }),
    );

    // Generate and set data
    let data = await generateDatas(cantidad);

    // Verificar si el componente sigue montado después de la operación async
    // Si se desmontó, el cleanup ya habrá dispuesto el root
    if (!isMountedRef.current) {
      return;
    }

    series.data.setAll(data);
    sbSeries.data.setAll(data);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear(time);
    chart.appear(time, time / 10);
  };

  const compra = async () => {
    let { minCompra } = state;
    const { contrato, accountAddress, tronWeb } = props;

    let amount = document.getElementById("amountUSDT").value;
    amount = utils.normalizarNumero(amount.replace(/,/g, "."), 0);

    let aprovado = await contrato.USDT.allowance(
      accountAddress,
      contrato.BRUT_USDT.address,
    ).call();

    if (aprovado <= 0) {
      let inputs = [
        { type: "address", value: contrato.BRUT_USDT.address },
        {
          type: "uint256",
          value:
            "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        },
      ];

      let funcion = "approve(address,uint256)";
      let trigger = await tronWeb.transactionBuilder.triggerSmartContract(
        tronWeb.address.toHex(contrato.USDT.address),
        funcion,
        {},
        inputs,
        tronWeb.address.toHex(accountAddress),
      );
      let transaction = await tronWeb.transactionBuilder.extendExpiration(
        trigger.transaction,
        180,
      );
      transaction = await window.tronLink.tronWeb.trx
        .sign(transaction)
        .catch((e) => {
          setStatePartial({ msj: { title: "Error", message: e.toString() } });
          return false;
        });
      if (!transaction) return;
      await tronWeb.trx.sendRawTransaction(transaction).then((r) => {
        setStatePartial({
          msj: { title: "Result", message: <>Transacction hash: {r.txid}</> },
        });
      });
      //await contrato.USDT.approve(contrato.USDT, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send();
      aprovado = await contrato.USDT.allowance(
        accountAddress,
        contrato.BRUT_USDT.address,
      ).call();
    }

    if (aprovado.remaining) aprovado = aprovado.remaining;
    aprovado = utils.normalizarNumero(aprovado);

    if (aprovado >= amount) {
      if (amount >= minCompra) {
        let inputs = [
          { type: "uint256", value: utils.numberToStringCero(amount) },
          { type: "address", value: accountAddress },
        ];

        let funcion = "buy_token(uint256,address)";
        let trigger = await tronWeb.transactionBuilder.triggerSmartContract(
          tronWeb.address.toHex(contrato.BRUT_USDT.address),
          funcion,
          {},
          inputs,
          tronWeb.address.toHex(accountAddress),
        );
        let transaction = await tronWeb.transactionBuilder.extendExpiration(
          trigger.transaction,
          180,
        );
        transaction = await window.tronLink.tronWeb.trx
          .sign(transaction)
          .catch((e) => {
            setStatePartial({ msj: { title: "Error", message: e.toString() } });
            return false;
          });
        if (!transaction) return;
        await tronWeb.trx.sendRawTransaction(transaction).then((r) => {
          setStatePartial({
            msj: { title: "Result", message: <>Transacction {r.txid}</> },
          });
        });

        document.getElementById("amountUSDT").value = "";
      } else {
        window.alert("Enter an amount greater than " + minCompra + " USDT");
        document.getElementById("amountUSDT").value = minCompra;
      }
    } else {
      if (aprovado <= 0) {
        document.getElementById("amountUSDT").value = minCompra;
        window.alert("Not enough USDT");
      } else {
        document.getElementById("amountUSDT").value = minCompra;
        window.alert("invalid value");
      }
    }

    estado();
  };

  const venta = async () => {
    const { minventa, balanceBRUT } = state;
    const { contrato, accountAddress, tronWeb } = props;

    let amount = document.getElementById("amountBRUT").value;
    amount = utils.normalizarNumero(amount.replace(/,/g, "."), 0);

    let aprovado = await contrato.BRUT.allowance(
      accountAddress,
      contrato.BRUT_USDT.address,
    ).call();

    if (aprovado <= 0) {
      let inputs = [
        { type: "address", value: contrato.BRUT_USDT.address },
        {
          type: "uint256",
          value:
            "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        },
      ];

      let funcion = "approve(address,uint256)";
      let trigger = await tronWeb.transactionBuilder.triggerSmartContract(
        tronWeb.address.toHex(contrato.BRUT.address),
        funcion,
        {},
        inputs,
        tronWeb.address.toHex(accountAddress),
      );
      let transaction = await tronWeb.transactionBuilder.extendExpiration(
        trigger.transaction,
        180,
      );
      transaction = await window.tronLink.tronWeb.trx
        .sign(transaction)
        .catch((e) => {
          setStatePartial({ msj: { title: "Error", message: e.toString() } });
          return false;
        });
      if (!transaction) return;
      await tronWeb.trx.sendRawTransaction(transaction).then((r) => {
        setStatePartial({
          msj: { title: "Result", message: <>Transacction hash: {r.txid}</> },
        });
      });
      aprovado = await contrato.BRUT.allowance(
        accountAddress,
        contrato.BRUT_USDT.address,
      ).call();
    }

    if (aprovado.remaining) aprovado = aprovado.remaining;
    aprovado = utils.normalizarNumero(aprovado);

    if (amount < minventa) {
      document.getElementById("amountBRUT").value = minventa;
      setStatePartial({
        msj: {
          title: "Error",
          message: "Place an amount greater than " + minventa + " BRUT",
        },
      });
      return;
    }

    if (amount > balanceBRUT) {
      document.getElementById("amountBRUT").value = minventa;
      setStatePartial({ msj: { title: "Error", message: "Insuficient BRUT" } });
      return;
    }

    if (aprovado >= amount) {
      let inputs = [
        { type: "uint256", value: utils.numberToStringCero(amount) },
        { type: "address", value: accountAddress },
      ];

      let funcion = "sell_token(uint256,address)";
      let trigger = await tronWeb.transactionBuilder.triggerSmartContract(
        tronWeb.address.toHex(contrato.BRUT_USDT.address),
        funcion,
        {},
        inputs,
        tronWeb.address.toHex(accountAddress),
      );
      let transaction = await tronWeb.transactionBuilder.extendExpiration(
        trigger.transaction,
        180,
      );
      transaction = await window.tronLink.tronWeb.trx
        .sign(transaction)
        .catch((e) => {
          setStatePartial({ msj: { title: "Error", message: e.toString() } });
          return false;
        });
      if (!transaction) return;
      await tronWeb.trx.sendRawTransaction(transaction).then((r) => {
        setStatePartial({
          msj: { title: "Result", message: <>Transacction {r.txid}</> },
        });
      });

      document.getElementById("amountBRUT").value = "";
    }
  };

  const estado = async () => {
    const { accountAddress, contrato } = props;
    let depositoUSDT, depositoBRUT;

    if (!contrato.ready) return;

    let aprovadoUSDT = await contrato.USDT.allowance(
      accountAddress,
      contrato.BRUT_USDT.address,
    ).call();
    if (aprovadoUSDT.remaining) aprovadoUSDT = aprovadoUSDT.remaining;
    if (aprovadoUSDT.length >= 1) aprovadoUSDT = aprovadoUSDT[0];

    aprovadoUSDT = utils.normalizarNumero(aprovadoUSDT);

    let balanceUSDT = await contrato.USDT.balanceOf(accountAddress).call();
    balanceUSDT = utils.normalizarNumero(balanceUSDT);

    if (aprovadoUSDT >= balanceUSDT && aprovadoUSDT !== 0) {
      depositoUSDT = "Buy BRUT";
    } else {
      depositoUSDT = "Approve buy";
    }

    let aprovadoBRUT = await contrato.BRUT.allowance(
      accountAddress,
      contrato.BRUT_USDT.address,
    ).call();
    if (aprovadoBRUT.remaining) aprovadoBRUT = aprovadoBRUT.remaining;
    if (aprovadoBRUT.length >= 1) aprovadoBRUT = aprovadoBRUT[0];

    aprovadoBRUT = utils.normalizarNumero(aprovadoBRUT);

    let balanceBRUT = await contrato.BRUT.balanceOf(accountAddress).call();
    balanceBRUT = utils.normalizarNumero(balanceBRUT);

    if (aprovadoBRUT >= balanceBRUT && aprovadoBRUT !== 0) {
      depositoBRUT = "Sell BRUT";
    } else {
      depositoBRUT = "Approve sell";
    }

    let supplyBRUT = await contrato.BRUT.totalSupply().call();
    supplyBRUT = utils.normalizarNumero(supplyBRUT);

    setStatePartial({
      depositoUSDT,
      depositoBRUT,
      balanceBRUT,
      balanceUSDT,
      wallet: accountAddress,
      totalCirculando: supplyBRUT,
    });
  };

  const handleChange = (e) => {
    let evento = e.target.value;
    grafico(500, evento, state.cantidadDatos);
    setStatePartial({ temporalidad: evento });
  };

  const handleChange2 = (e) => {
    let evento = e.target.value;
    grafico(500, state.temporalidad, evento);
    setStatePartial({ cantidadDatos: evento });
  };

  const handleChangeBRUT = async (event) => {
    let price = event.target.value;
    await consultarPrecio();
    setStatePartial({
      valueBRUT: price,
      valueUSDT: parseFloat((price * state.precioBRUT).toPrecision(8)),
    });
  };

  const handleChangeUSDT = async (event) => {
    let price = event.target.value;
    await consultarPrecio();
    setStatePartial({
      valueUSDT: price,
      valueBRUT: parseFloat((price / state.precioBRUT).toPrecision(8)),
    });
  };

  const consultarPrecio = async () => {
    let apiUrl = config.PRICE;

    let response;
    let cambio = 0;

    let precio;
    try {
      response = await fetch(apiUrl)
        .then((res) => {
          return res.json();
        })
        .catch((error) => {
          console.error(error);
        });
      precio = response.Data.usd;
      cambio = response.Data.v24h;
    } catch (err) {
      console.log(err);
      precio = state.precioBRUT;
      cambio = state.cambio24h;
    }

    let market = 0;
    let tokens = 0;

    try {
      response = await fetch(config.market_brut)
        .then((res) => {
          return res.json();
        })
        .catch((error) => {
          console.error(error);
        });
      market = response.marketcap.usdt;
      tokens = response.circulatingSupply;
    } catch (err) {
      console.log(err);
      market = state.enBrutus;
      tokens = state.tokensEmitidos;
    }

    setStatePartial({
      cambio24h: new BigNumber(cambio).dp(3).toString(10),
      precioBRUT: new BigNumber(precio).dp(2).toString(10),
      enBrutus: market,
      tokensEmitidos: tokens,
    });

    return response;
  };
  /*
    const ajustarRate = async () => {
      const { contrato, accountAddress, tronWeb } = props;

      let rate = utils.normalizarNumero(await contrato.BRUT_USDT.RATE().call())

      alert("rate is:" + rate)

      if (false) {

        let inputs = [
          //{ type: 'address', value: AddressContract },
          { type: 'uint256', value: utils.numberToStringCero(14.71) }
        ]

        let funcion = "ChangeRate(uint256)"
        let trigger = await tronWeb.transactionBuilder.triggerSmartContract(tronWeb.address.toHex(contrato.BRUT_USDT.address), funcion, {}, inputs, tronWeb.address.toHex(accountAddress))
        let transaction = await tronWeb.transactionBuilder.extendExpiration(trigger.transaction, 180);
        transaction = await window.tronLink.tronWeb.trx.sign(transaction)
          .catch((e) => {

            setStatePartial({ msj: { title: "Error", message: e.toString() } })
            return false;
          })
        if (!transaction) return;
        await tronWeb.trx.sendRawTransaction(transaction)
          .then((r) => {

            setStatePartial({ msj: { title: "Result", message: <>Transacction {r.txid}</> } })

          })
      }


    }
  */
  const { contrato } = props;

  let {
    minCompra,
    minventa,
    msj,
    totalCirculando,
    precioBRUT,
    cambio24h,
    enBrutus,
    depositoBRUT,
    depositoUSDT,
  } = state;

  minCompra = "Min. " + minCompra + " USDT";
  minventa = "Min. " + minventa + " BRUT";

  return (
    <>
      <div className="row">
        <div className="col-xl-12">
          <div className="tab-content" id="nav-tabContent">
            <div
              className="tab-pane fade show active"
              id="nav-bitcoin"
              role="tabpanel"
              aria-labelledby="nav-bitcoin-tab"
            >
              <div className="row">
                <div
                  className="col-xl-9 col-xxl-9 wow fadeInLeft"
                  data-wow-delay="0.2s"
                >
                  <div className="card coin-content">
                    <div className="card-header border-0 flex-wrap">
                      <div className="mb-2">
                        <h4 className="heading m-0">BRUT Chart</h4>
                        <span className="fs-16">
                          Brutus Algorithmic Trading Robot{" "}
                        </span>
                      </div>
                      <div className="dropdown bootstrap-select">
                        <select
                          className="image-select default-select dashboard-select"
                          aria-label="Default"
                          tabIndex="0"
                          defaultValue="usdt"
                          style={{ background: "rgb(3 0 8 / 49%)" }}
                        >
                          <option value={"usdt"}>USD₮ (Tether)</option>
                        </select>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                          <div className="price-content">
                            <span className="fs-18 d-block mb-2">Price</span>
                            <h4 className="fs-20 font-w600">${precioBRUT}</h4>
                          </div>
                          <div className="price-content">
                            <span className="fs-14 d-block mb-2">
                              24h% change
                            </span>
                            <h4 className="font-w600 text-success">
                              {cambio24h}
                              <i className="fa-solid fa-caret-up ms-1 text-success"></i>
                            </h4>
                          </div>
                          <div className="price-content">
                            <span className="fs-14 d-block mb-2">
                              Circulating
                            </span>
                            <h4 className="font-w600">
                              {(totalCirculando * 1).toFixed(2)}
                            </h4>
                          </div>
                          <div className="price-content">
                            <span className="fs-14 d-block mb-2">
                              Market Cap
                            </span>
                            <h4 className="font-w600">
                              ${(enBrutus * 1).toFixed(2)}
                            </h4>
                          </div>
                        </div>
                      </div>
                      <div
                        className="mb-3"
                        id="chartdiv"
                        style={{ height: "400px", backgroundColor: "white" }}
                      ></div>

                      <select
                        className="btn-secondary style-1 default-select"
                        style={{ backgroundColor: "white" }}
                        value={state.cantidadDatos}
                        onChange={handleChange2}
                      >
                        {options2.map((option) => (
                          <option
                            key={option.label.toString()}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {" | "}
                      <select
                        className="btn-secondary style-1 default-select"
                        style={{ backgroundColor: "white" }}
                        value={state.temporalidad}
                        onChange={handleChange}
                      >
                        {options.map((option) => (
                          <option
                            key={option.label.toString()}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div
                  className="col-xl-3 col-xxl-3 col-sm-6 wow fadeInRight"
                  data-wow-delay="0.3s"
                >
                  <div className="card  digital-cash">
                    <div className="card-body ">
                      <div className="text-center">
                        <div className="media d-block">
                          <img
                            src="images/brut.png"
                            width="100%"
                            alt="brutus token"
                          ></img>
                          <div className="media-content">
                            <h4 className="mt-0 mt-md-4 fs-20 font-w700 text-black mb-0">
                              Automated Trading
                            </h4>
                            <span className="font-w600 text-black">Brutus</span>
                            <span className="my-4 fs-16 font-w600 d-block">
                              1 BRUT = {state.precioBRUT} USD
                            </span>
                            <p className="text-start">
                              The Brutus Token is a Tron-based token whose value
                              is backed by an automated trading strategy that
                              uses backtesting and capital management to
                              maximize profits and minimize losses. The value of
                              the Brutus Token is pegged to USDT, so its value
                              remains stable in USD terms.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="card-footer p-2 border-0">
                        <a
                          href="https://brutus.finance/brutusblog.html"
                          className="btn btn-link text-primary"
                        >
                          Read more
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="col-xl-6 col-sm-6 wow fadeInUp"
                  data-wow-delay="0.4s"
                >
                  <div className="card quick-trade">
                    <div className="card-header pb-0 border-0 flex-wrap">
                      <div>
                        <h4 className="heading mb-0">
                          Quick Trade: BRUT{" <-> "}USDT
                        </h4>
                        <p className="mb-0 fs-14">without fees</p>
                      </div>
                    </div>
                    <div className="card-body pb-0">
                      <div className="row">
                        <div className="col-6">
                          <input
                            className="form-control form-control text-end"
                            type="number"
                            id="amountBRUT"
                            onChange={handleChangeBRUT}
                            placeholder={minventa}
                            min={state.minventa}
                            max={state.balanceBRUT}
                            value={state.valueBRUT}
                            step={0.5}
                          ></input>
                        </div>
                        <div className="col-6">
                          <input
                            className="form-control form-control text-end"
                            type="number"
                            id="amountUSDT"
                            onChange={handleChangeUSDT}
                            placeholder={minCompra}
                            min={state.minCompra}
                            max={state.balanceUSDT}
                            value={state.valueUSDT}
                          ></input>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer border-0">
                      <div className="row">
                        <div className="col-6">
                          <button
                            className="btn d-flex  btn-success justify-content-between w-100"
                            onClick={() => compra()}
                          >
                            {depositoUSDT}
                            <svg
                              className="ms-4 scale5"
                              width="16"
                              height="16"
                              viewBox="0 0 29 29"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5.35182 13.4965L5.35182 13.4965L5.33512 6.58823C5.33508 6.5844 5.3351 6.58084 5.33514 6.57759M5.35182 13.4965L5.83514 6.58306L5.33514 6.58221C5.33517 6.56908 5.33572 6.55882 5.33597 6.5545L5.33606 6.55298C5.33585 6.55628 5.33533 6.56514 5.33516 6.57648C5.33515 6.57684 5.33514 6.57721 5.33514 6.57759M5.35182 13.4965C5.35375 14.2903 5.99878 14.9324 6.79278 14.9305C7.58669 14.9287 8.22874 14.2836 8.22686 13.4897L8.22686 13.4896L8.21853 10.0609M5.35182 13.4965L8.21853 10.0609M5.33514 6.57759C5.33752 5.789 5.97736 5.14667 6.76872 5.14454C6.77041 5.14452 6.77217 5.14451 6.77397 5.14451L6.77603 5.1445L6.79319 5.14456L13.687 5.16121L13.6858 5.66121L13.687 5.16121C14.4807 5.16314 15.123 5.80809 15.1211 6.6022C15.1192 7.3961 14.4741 8.03814 13.6802 8.03626L13.6802 8.03626L10.2515 8.02798L23.4341 21.2106C23.9955 21.772 23.9955 22.6821 23.4341 23.2435C22.8727 23.8049 21.9625 23.8049 21.4011 23.2435L8.21853 10.0609M5.33514 6.57759C5.33513 6.57959 5.33514 6.58159 5.33514 6.5836L8.21853 10.0609M6.77407 5.14454C6.77472 5.14454 6.77537 5.14454 6.77603 5.14454L6.77407 5.14454Z"
                                fill="white"
                                stroke="white"
                              ></path>
                            </svg>
                          </button>
                        </div>
                        <div className="col-6">
                          <button
                            className="btn d-flex  btn-danger justify-content-between w-100"
                            onClick={() => venta()}
                          >
                            {depositoBRUT}
                            <svg
                              className="ms-4 scale3"
                              width="16"
                              height="16"
                              viewBox="0 0 21 21"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M16.9638 11.5104L16.9721 14.9391L3.78954 1.7565C3.22815 1.19511 2.31799 1.19511 1.75661 1.7565C1.19522 2.31789 1.19522 3.22805 1.75661 3.78943L14.9392 16.972L11.5105 16.9637L11.5105 16.9637C10.7166 16.9619 10.0715 17.6039 10.0696 18.3978C10.0677 19.1919 10.7099 19.8369 11.5036 19.8388L11.5049 19.3388L11.5036 19.8388L18.3976 19.8554L18.4146 19.8555L18.4159 19.8555C18.418 19.8555 18.42 19.8555 18.422 19.8555C19.2131 19.8533 19.8528 19.2114 19.8555 18.4231C19.8556 18.4196 19.8556 18.4158 19.8556 18.4117L19.8389 11.5035L19.8389 11.5035C19.8369 10.7097 19.1919 10.0676 18.3979 10.0695C17.604 10.0713 16.9619 10.7164 16.9638 11.5103L16.9638 11.5104Z"
                                fill="white"
                                stroke="white"
                              ></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="d-flex mt-3 align-items-center">
                        <div className="form-check custom-checkbox me-3">
                          <label
                            className="form-check-label fs-14 font-w400"
                            htmlFor="customCheckBox1"
                          >
                            We recommend keeping ~ 21 TRX for transactions.
                          </label>
                        </div>
                        <p className="mb-0"></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="col-xl-6 col-sm-12 wow fadeInUp"
                  data-wow-delay="0.6s"
                >
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
                            <tr
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                handleChangeBRUT({
                                  target: { value: state.balanceBRUT },
                                });
                              }}
                            >
                              <td className="text-left">BRUT</td>
                              <td>{state.balanceBRUT}</td>
                            </tr>
                            <tr
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                handleChangeUSDT({
                                  target: { value: state.balanceUSDT },
                                });
                              }}
                            >
                              <td className="text-left">USDT</td>
                              <td>{state.balanceUSDT}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="card-footer text-center py-3 border-0">
                      <a href="/" className="btn-link text-black">
                        Show more <i className="fa fa-caret-right"></i>
                      </a>
                    </div>
                  </div>
                </div>
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
                <b>Token:</b>{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={
                    "https://tronscan.org/#/contract/" +
                    contrato.BRUT.address +
                    "/code"
                  }
                >
                  {contrato.BRUT.address}
                </a>
                <br></br>
                <b>swap:</b>{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={
                    "https://tronscan.org/#/contract/" +
                    contrato.BRUT_USDT.address +
                    "/code"
                  }
                >
                  {contrato.BRUT_USDT.address}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Alert {...msj} />
    </>
  );
};

const BrutComponentWithTranslation = withTranslation()(BrutComponent);

export default BrutComponentWithTranslation;
