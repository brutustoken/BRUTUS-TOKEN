import React, { Component } from "react";

export default class nftBaner extends Component {

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
                            <h1>BRUTUS LOTERY</h1>
                            <h6>
                              LA PRIMER LOTERÍA GARANTIZADA
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
