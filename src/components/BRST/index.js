import React, { Component } from "react";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

import CrowdFunding from "./StakingCrowdFunding";
import Oficina from "./StakingOficina";


export default class Staking extends Component {
  constructor(props) {
    super(props);

    this.state = {
      minCompra: 10

    };

    this.grafico = this.grafico.bind(this);
  }
  componentDidMount() {
    this.grafico();
  }

  async grafico() {
    let root = am5.Root.new("chartdiv");

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true
    }));

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", true);

   
    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      maxDeviation: 0.5,
      baseInterval: {
        timeUnit: "day",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {
        pan: "zoom"
      }),
      tooltip: am5.Tooltip.new(root, {})
    }));

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      maxDeviation: 0.5,
      renderer: am5xy.AxisRendererY.new(root, {
        pan: "zoom"
      })
    }));

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    let series = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
      name: "Series",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY}",
      })
    }));

    series.fills.template.setAll({
      visible: true,
      fillOpacity: 0.2
    });

    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 0,
        sprite: am5.Circle.new(root, {
          radius: 4,
          stroke: root.interfaceColors.get("background"),
          strokeWidth: 2,
          fill: series.get("fill")
        })
      });
    });

    let data = (await (await fetch("https://chainlist.tk/api/v1/chartdata/brst")).json()).Data
    series.data.setAll(data);

    series.appear(1000);
    chart.appear(1000, 100);
  }

  render() {

    return (

      <div className="row">
        <div className="col-xl-3 col-xxl-4 mt-4">
          <div className="card">

            <div className="card-body height400 dz-scroll" id="about-1">
              <div className="d-flex align-items-start mb-3 about-coin">
                <div>
                  <img src="images/logo.png" className="rounded-circle" alt="" />
                </div>
                <div className="ms-3">
                  <h2 className="font-w600 text-black mb-0 title">Tron Staking</h2>
                  <p className="font-w600 text-black sub-title">BRST</p>
                  <span>1 BRST = 1.250 TRX</span>
                </div>
              </div>
              <p className="fs-14">Dash is an open source cryptocurrency. It is an altcoin that was forked from the Bitcoin protocol. It is also a decentralized autonomous organization (DAO) run by a subset of its users, which are called "masternodes". The currency permits transactions that can be untraceable.</p>
            </div>
            <div className="card-footer border-0 p-0 caret">
              <a href="coin-details.html" className="btn-link"><i className="fa fa-caret-down" aria-hidden="true"></i></a>
            </div>
          </div>
        </div>
        <div className="col-xl-9 col-xxl-8 mt-4">
          <div className="card">

            <div className="card-body pb-0 pt-sm-3 pt-0">
              <div className="row sp20 mb-4 align-items-center">
                <div className="col-lg-4 col-xxl-4 col-sm-4 d-flex flex-wrap align-items-center">
                  <div className="px-2 info-group">
                    <p className="fs-18 mb-1">Precio TRX</p>
                    <h2 className="fs-28 font-w600 text-black">1.250801</h2>
                  </div>
                </div>
                <div className="d-flex col-lg-8 col-xxl-8 col-sm-8 align-items-center mt-sm-0 mt-3 justify-content-end">

                  <div className="px-2 info-group">
                    <p className="fs-14 mb-1">Respaldo TRX</p>
                    <h3 className="fs-20 font-w600 text-black">472,067.48</h3>
                  </div>
                  <div className="px-2 info-group">
                    <p className="fs-14 mb-1">Market Cap</p>
                    <h3 className="fs-20 font-w600 text-black">$30279.92</h3>
                  </div>
                </div>
              </div>
              <div id="chartdiv" style={{height: "300px"}}></div>

            </div>
          </div>
        </div>
        <div className="col-xl-6 col-xxl-12">
          <div className="card">
            <div className="card-header d-sm-flex d-block pb-0 border-0">
              <div>
                <h4 className="fs-20 text-black">Quick Trade</h4>
                <p className="mb-0 fs-12">Lorem ipsum dolor sit amet, consectetur</p>
              </div>

            </div>
            <div className="card-body">
              <div className="basic-form">
                <form className="form-wrapper">
                  <div className="form-group">
                    <div className="input-group input-group-lg">
                      <div className="input-group-prepend">
                        <span className="input-group-text">Amount BTC</span>
                      </div>
                      <input type="text" className="form-control" placeholder="52.5" />
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group input-group-lg">
                      <div className="input-group-prepend">
                        <span className="input-group-text ">Price BPL</span>
                      </div>
                      <input type="text" className="form-control" placeholder="0,000000" />
                    </div>
                  </div>
                  <div className="row mt-4 align-items-center">
                    <div className="col-sm-6 mb-3">
                      <p className="mb-0 fs-14">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut</p>
                    </div>
                    <div className="col-sm-6 text-sm-right text-start">
                      <a href="#" className="btn  btn-success text-white mb-2">
                        BUY
                        <svg className="ms-4 scale3" width="16" height="16" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16.9638 11.5104L16.9721 14.9391L3.78954 1.7565C3.22815 1.19511 2.31799 1.19511 1.75661 1.7565C1.19522 2.31789 1.19522 3.22805 1.75661 3.78943L14.9392 16.972L11.5105 16.9637L11.5105 16.9637C10.7166 16.9619 10.0715 17.6039 10.0696 18.3978C10.0677 19.1919 10.7099 19.8369 11.5036 19.8388L11.5049 19.3388L11.5036 19.8388L18.3976 19.8554L18.4146 19.8555L18.4159 19.8555C18.418 19.8555 18.42 19.8555 18.422 19.8555C19.2131 19.8533 19.8528 19.2114 19.8555 18.4231C19.8556 18.4196 19.8556 18.4158 19.8556 18.4117L19.8389 11.5035L19.8389 11.5035C19.8369 10.7097 19.1919 10.0676 18.3979 10.0695C17.604 10.0713 16.9619 10.7164 16.9638 11.5103L16.9638 11.5104Z" fill="white" stroke="white"></path>
                        </svg>
                      </a>
                      <a href="#" className="btn btn-danger ms-4 mb-2">
                        SELL
                        <svg className="ms-4 scale5" width="16" height="16" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5.35182 13.4965L5.35182 13.4965L5.33512 6.58823C5.33508 6.5844 5.3351 6.58084 5.33514 6.57759M5.35182 13.4965L5.83514 6.58306L5.33514 6.58221C5.33517 6.56908 5.33572 6.55882 5.33597 6.5545L5.33606 6.55298C5.33585 6.55628 5.33533 6.56514 5.33516 6.57648C5.33515 6.57684 5.33514 6.57721 5.33514 6.57759M5.35182 13.4965C5.35375 14.2903 5.99878 14.9324 6.79278 14.9305C7.58669 14.9287 8.22874 14.2836 8.22686 13.4897L8.22686 13.4896L8.21853 10.0609M5.35182 13.4965L8.21853 10.0609M5.33514 6.57759C5.33752 5.789 5.97736 5.14667 6.76872 5.14454C6.77041 5.14452 6.77217 5.14451 6.77397 5.14451L6.77603 5.1445L6.79319 5.14456L13.687 5.16121L13.6858 5.66121L13.687 5.16121C14.4807 5.16314 15.123 5.80809 15.1211 6.6022C15.1192 7.3961 14.4741 8.03814 13.6802 8.03626L13.6802 8.03626L10.2515 8.02798L23.4341 21.2106C23.9955 21.772 23.9955 22.6821 23.4341 23.2435C22.8727 23.8049 21.9625 23.8049 21.4011 23.2435L8.21853 10.0609M5.33514 6.57759C5.33513 6.57959 5.33514 6.58159 5.33514 6.5836L8.21853 10.0609M6.77407 5.14454C6.77472 5.14454 6.77537 5.14454 6.77603 5.14454L6.77407 5.14454Z" fill="white" stroke="white"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <CrowdFunding />
        <Oficina />
      </div>

    );
  }
}
