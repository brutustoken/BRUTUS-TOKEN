import React, { Component } from "react";

export default class nftBaner extends Component {

  constructor(props) {
    super(props);

    this.state = {

      minCompra: 10,
      minventa: 1,
      deposito: "Cargando...",
      wallet: "Cargando...",
      valueBRUT: "",
      valueUSDT: "",
      value: "",
      cantidad: 0,
      tiempo: ""

    };
    
  }

  
  render() {

      return (
        <>
          <div className="welcome-area wow fadeInUp" id="home">
              <div id="particles-js"></div>
              <div className="container">
                  <div className="row">
                      <div className="col-12 col-md-6 align-self-center">
                        <div className="welcome-right">
                          <div className="welcome-text">
                            <h1>BRUTUS LOTERY, LA PRIMER LOTERIA GARANTIZADA.</h1>
                            <h6>
                              
                            </h6>
            
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                          <div className="welcome-img">
                              <img src="assets/img/brlt.png" alt="Brutus Staking" />
                          </div>
                      </div>
                  </div>
              </div>
          </div>

        </>
      );
  }
}
