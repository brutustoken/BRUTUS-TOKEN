import React, { Component } from "react";
import cons from "../../cons.js";

export default class nfts extends Component {

  constructor(props) {
    super(props);

    this.state = {
      deposito: "Cargando...",
      wallet: this.props.accountAddress,
      balanceBRUT: 0,
      precioBRUT: 0

    };

    this.estado = this.estado.bind(this);
    this.consultarPrecio = this.consultarPrecio.bind(this);
    this.compra = this.compra.bind(this);

  }

  async componentDidMount() {

    setInterval(() => {this.estado()},3*1000);
  };

  async compra(isBRST){

     await this.props.contrato.loteria.buyLoteria(isBRST, this.props.accountAddress).send({callValue: 100000000});

  }

  async consultarPrecio(){

    var precio = await this.props.contrato.loteria.RATE().call();
    precio = parseInt(precio._hex)/10**6;

    this.setState({
      precioBRUT: precio
    });

    return precio;

  };

  async estado(){

    var robots = [];
    var cantidad = parseInt((await this.props.contrato.BRLT.balanceOf(this.props.accountAddress).call())._hex)

    //console.log(cantidad)

    for (let index = 0; index < cantidad; index++) {

      var ID = await this.props.contrato.BRLT.tokenOfOwnerByIndex(this.props.accountAddress, index).call();
      ID = parseInt(ID._hex);

      var URI = await this.props.contrato.BRLT.tokenURI(ID).call();
  
      var metadata = JSON.parse( await (await fetch(cons.proxy+URI)).text());

      robots[index] = {
        id: ID,
        uri: URI,
        metadata: metadata
      };

    }

    var imagerobots = [];

    for (let index = 0; index < robots.length; index++) {
      
      imagerobots[index] =(
        <div className="col-lg-3 p-2" key={"robbrutN"+index}>
          <div className="card">
            <h5 >
              <strong>#{robots[index].id} {robots[index].metadata.name}</strong><br /><br />
            </h5>
            <img src={robots[index].metadata.image} alt={robots[index].metadata.name} className="img-thumbnail"></img>
            <br></br>
            
          </div>
          
        </div>
      )
    }

    this.setState({
      robots: robots,
      imagerobots: imagerobots
    });

  }

  render() {

    return (
      <>
        <section className="convert-area" id="convert">
          <div className="container">
            <div className="convert-wrap">
              <div className="row justify-content-center align-items-center flex-column pb-30">
                <h1 className="text-white text-center">JUEGAS Y NUNCA ¡PIERDES!</h1>
              </div>
              <div className="row justify-content-center align-items-start">

                <div className="col-lg-12 cols">
                  <div className="container text-center">

                    <div className="card">
                      <div className="row">

                        <div className="col-lg-12">
                          <img
                            className="img-fluid"
                            src="nft/loteria/image.gif"
                            alt="brutus loteria"
                          />
                          <h2>Comprar Tickets BRLT</h2>
                          <button className="btn btn-success" style={{ "cursor": "pointer" }} onClick={() => this.compra(false)}>100 TRX</button> <br />ó<br />
                          <button className="btn btn-success" style={{ "cursor": "pointer" }} onClick={() => this.compra(true)}>### BRST</button>


                          <br></br><br></br>

                          Tickets comprados: {this.state.mc}

                          <br></br>

                          <button className="btn btn-warning" style={{ "cursor": "pointer" }} onClick={async () => {

                            if (false) {

                              window.alert("por favor espera a la fecha anunciada para reclamar tu NFT")

                            } else {
                              
                              await this.props.contrato.BRLT.claimNFT().send()
                                .then(() => { window.alert("NFT's enviados a tu wallet") })
                                .catch(() => { window.alert("Error al reclamar") })

                            }

                          }}>Reclamar {this.state.mb} TRX ganados</button>
                        </div>

                      </div>

                    </div>


                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section className="convert-area pt-5" id="convert">
          <div className="container">
            <div className="convert-wrap">
              <div className="row justify-content-center align-items-center flex-column pb-30">
                <h1 className="text-white  text-center">Mis Tickets Brutus loteria (BRLT)</h1>
              </div>
              <div className="row justify-content-center align-items-start">

                <div className="col-lg-12 cols">
                  <div className=" container text-center">
                    <div className="row">

                      <div className="col-lg-12 p-2">
                        <div className="card">
                          <br /><br />

                          <h5 >
                            wallet:<br />
                            <strong>{this.props.accountAddress}</strong><br /><br />
                          </h5>


                        </div>

                      </div>

                    </div>

                    <div className="row">

                      {this.state.imagerobots}

                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
}
