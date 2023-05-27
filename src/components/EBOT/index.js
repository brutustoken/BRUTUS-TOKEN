import React, { Component } from "react";

export default class nfts extends Component {

  render() {

    return (
      <>
        <div className="row mx-0 ">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <div className="row justify-content-center">
                  <div className="col-12">
                    <div className="product-detail-content">
                      <div className="new-arrival-content pr">
                        <h2 className="mb-5">BRUTUS ENERGY BOT</h2>


                      </div>
                    </div>
                  </div>

                  <div className="col-4">
                    <a href="https://t.me/BRUTUS_ENERGY" style={{ color: "white" }}>
                      <img className="img-fluid pe-3 pb-4" align="left" src="assets/img/breb.png" alt="brutus energy bot" />
                      <h4 className="text-white" align="center">
                        @BRUTUS_ENERGY
                        <img src="images/telegram.png" width="50px" alt="telegram logo" />
                      </h4>
                    </a>
                  </div>

                  <div className="col-8">
                    <p className="text-content">El equipo ganador de un premio en el gran hackathon de Tron vuelve a la carga con una versión mejorada. Descubre el bot innovador "Brutus Energy bot. Este bot revolucionario te ofrece la oportunidad de alquilar energía y ancho de banda al mejor precio del mercado. Con operaciones flexibles de 1 hora y órdenes sin bloqueo, podrás aprovechar al máximo las ventajas del staking 2.0 de Tron.
                      <br /><br />
                      Beneficios destacados:
                      <br /><br />
                      Alquila energía y ancho de banda al mejor precio del mercado.<br />
                      Opera con flexibilidad en periodos de 1 hora para adaptarse a tus necesidades.<br />
                      Realiza órdenes sin bloqueo, manteniendo el control total de tus recursos.<br />
                      Renueva tus órdenes y obtén descuentos adicionales para maximizar tus beneficios.<br />
                      <br /><br />
                      Únete a nuestro bot en Telegram y descubre una forma eficiente y rentable de alquilar energía y ancho de banda con el poderoso "Brutus Energy".</p>


                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="modal fade" id="reviewModal">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">¡Nunca pierdes!</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal">
                  </button>
                </div>
                <div className="modal-body">
                  <p> no pierdes por que el trx que ingresas pasa a producir ganancias con otros productos como BRST una vez tenemos utilidades se genera el sorteo aletorio por contrato y las utilidades generadas son entregadas a el poseedor del NFT de la Loteria</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="modal fade" id="regalo">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">¡Sopresa!</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal">
                </button>
              </div>
              <div className="modal-body">
                <p> Nos colaboras ayudando a que la loteria funcione y te retribuiremos con una pequeña recompensa, recomendamos que tengas ENERGIA y ANCHO DE BANDA para que no consumas TRX y sea realmente beneficioso.</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
