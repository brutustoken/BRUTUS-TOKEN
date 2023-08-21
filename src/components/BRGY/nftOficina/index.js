import React, { Component } from "react";
import Utils from "../../../utils";

import cons from "../../../cons.js";
const contractAddress = cons.SC2;

export default class nftOficina extends Component {
  constructor(props) {
    super(props);

    this.state = {
      deposito: "Loading...",
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
    var contractNFT = await window.tronWeb.contract().at(cons.BRGY);


    var robots = [];


    for (let index = 0; index < 25; index++) {
      var conteo = await contractMistery.entregaNFT(this.props.accountAddress, index).call()
      .then((conteo)=>{
        if(conteo._hex){
          robots.push(parseInt(conteo._hex));return 1;
        }
      })
      .catch(()=>{
        return 0;
      })

      if(conteo === 0){
        break;
      }
      
    }

    var estonuevo = [];

    for(let index = 0; index < robots.length; index++){
      let user = await contractNFT.ownerOf(robots[index]).call();
      estonuevo[index] = window.tronWeb.address.fromHex(user) === this.props.accountAddress;
    }

    //console.log(estonuevo)

    for (let index = 0; index < robots.length; index++) {

      var URI = await contractNFT.tokenURI(robots[index]).call()

      var metadata = JSON.parse( await (await fetch(cons.proxy+URI)).text());
      metadata.numero = robots[index]

      robots[index] = metadata;

    }


    var imagerobots = [];
    var recBotton = (<></>)

    for (let index = 0; index < robots.length; index++) {

      if(!estonuevo[index]){
        recBotton = (
          <button className="btn btn-success" onClick={async()=>{
            var contractMistery = await window.tronWeb.contract().at(cons.SC3);
            await contractMistery.claimNFT_especifico(index).send();
         }}>Claim</button>
        )
      }else{
        recBotton = (<></>)
      }
      
      imagerobots[index] =(
        <div className="col-xl-3 col-lg-6 col-sm-6" key={"robbrutN"+index}>
						<div className="card">
							<div className="card-body">
								<div className="new-arrival-product">
									<div className="new-arrivals-img-contnent">
                    <img src={robots[index].image} alt={robots[index].name} className="img-thumbnail"></img>
									</div>
									<div className="new-arrival-content text-center mt-3">
										<h4>#{robots[index].numero} {robots[index].name}</h4>
										{recBotton}
									</div>
								</div>
							</div>
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
