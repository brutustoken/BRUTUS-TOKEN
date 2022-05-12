import React, { Component } from "react";
import Utils from "../../utils";

import cons from "../../cons.js";
const contractAddress = cons.SC2;

export default class nftOficina extends Component {
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
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    this.estado();
    setInterval(() => this.estado(),3*1000);
  };

  async consultarPrecio(){

    var precio = await Utils.contract.RATE().call();
    precio = parseInt(precio._hex)/10**6;

    this.setState({
      precioBRUT: precio
    });

    return precio;

  };

  async estado(){

    var contractMistery = await window.tronWeb.contract().at(cons.SC3);

    var robots = [];

    var contractNFT = await window.tronWeb.contract().at(cons.SC4);

    for (let index = 0; index < 25; index++) {
      var conteo = await contractMistery.entregaNFT(this.props.accountAddress, index).call()
      .then((conteo)=>{
        if(conteo._hex){
          robots.push(parseInt(conteo._hex));
          return 1;
        }
      })
      .catch(()=>{
        return 0;
      })

      if(conteo === 0){
        break;
      }
      
    }

    for (let index = 0; index < robots.length; index++) {

      var URI = await contractNFT.tokenURI(robots[index]).call()

      var metadata = JSON.parse( await (await fetch(URI)).text());
      metadata.numero = robots[index]

      robots[index] = metadata;

    }

    var imagerobots = [];

    for (let index = 0; index < robots.length; index++) {
      imagerobots[index] =(
        <div className="col-lg-3 p-2" key={"robbrutN"+index}>
          <div className="card">
            <br /><br />
            
            <h5 >
              <strong>#{robots[index].numero} {robots[index].name}</strong><br /><br />
            </h5>
            <img src={robots[index].image} alt={robots[index].name} className="img-thumbnail"></img>
            <br></br>
   
            <button className="btn btn-success" onClick={async()=>{
               var contractMistery = await window.tronWeb.contract().at(cons.SC3);
               await contractMistery.claimNFT_especifico(robots[index].numero).send();
            }}>Reclamar</button>
            
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


    );
  }
}
