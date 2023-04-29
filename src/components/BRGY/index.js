import React, { Component } from "react";

//import CrowdFunding from "./nftCrowdFunding";
//import Oficina from "./nftOficina";

import cons from "../../cons.js";

export default class nfts extends Component {
  constructor(props) {
		super(props);

		this.state = {

			imagerobots: []

		};

		this.estado = this.estado.bind(this);


	}


	componentDidMount() {
    document.title = "B.F | BRGY"
		//this.estado();

    setTimeout(()=> {
      this.estado();
    }, 3*1000)

		//setInterval(() => {this.estado();}, 30*1000);

	}


  async estado() {

		var robots = [];

		for (let index = 0; index < 25; index++) {
			var conteo = await this.props.contrato.MBOX.entregaNFT(this.props.accountAddress, index).call()
				.then((conteo) => {
					if (conteo._hex) {
						robots.push(parseInt(conteo._hex)); return 1;
					}
				})
				.catch(() => {
					return 0;
				})

			if (conteo === 0) {
				break;
			}

		}

		var estonuevo = [];

		for (let index = 0; index < robots.length; index++) {
			let user = await this.props.contrato.BRGY.ownerOf(robots[index]).call();
			estonuevo[index] = window.tronWeb.address.fromHex(user) === this.props.accountAddress;
		}

		for (let index = 0; index < robots.length; index++) {

			var URI = await this.props.contrato.BRGY.tokenURI(robots[index]).call()

			var metadata = await fetch(cons.proxy + URI).then((res)=>{return res.json()}).catch(console.error);
			metadata.numero = robots[index]
			robots[index] = metadata;

		}

		var imagerobots = [];
		var recBotton = (<></>)

		for (let index = 0; index < robots.length; index++) {

			if (!estonuevo[index]) {
				recBotton = (
					<button className="btn btn-success" onClick={async () => {
						await this.props.contrato.MBOX.claimNFT_especifico(index).send();
					}}>Reclamar</button>
				)
			} else {
				recBotton = (<></>)
			}

			imagerobots[index] = (
				<div className="col-xl-3 col-lg-6 col-sm-6" key={"robbrutN" + index}>
					<div className="card">
						<div className="card-body">
							<div className="new-arrival-product">
								<div className="new-arrivals-img-contnent">
									<a href={robots[index].image} rel="noopener noreferrer" target="_blank">
										<img src={robots[index].image} alt={robots[index].name} className="img-thumbnail"></img>
									</a>
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
			<>

				<div className="row page-titles mx-0">
					<div className="col-sm-6 p-md-0">
						<div className="welcome-text">
							<h4>Mis Coleccionables</h4>
							<p className="mb-0">BRGY</p>
						</div>
					</div>
					<div className="col-sm-6 p-md-0 justify-content-sm-end mt-2 mt-sm-0 d-flex">
						<ol className="breadcrumb">
							<li className="breadcrumb-item"><a href="/">BRUTUS</a></li>
							<li className="breadcrumb-item active"><a href="/?brgy">NFT</a></li>
						</ol>
					</div>
				</div>
				<div className="row">
					{this.state.imagerobots}
				</div>

			</>
		);
	}
}

