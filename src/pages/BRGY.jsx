import React, { Component } from "react";
import utils from "../utils";


/**
class nftOficina extends Component {
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
		await utils.setContract(window.tronWeb, contractAddress);
		this.estado();
		setInterval(() => this.estado(), 3 * 1000);
	};

	async consultarPrecio() {

		var precio = await utils.contract.RATE().call();
		precio = parseInt(precio) / 10 ** 6;

		this.setState({
			precioBRUT: precio
		});

		return precio;

	};

	async estado() {

		var contractMistery = await window.tronWeb.contract().at(cons.SC3);
		var contractNFT = await window.tronWeb.contract().at(cons.BRGY);

		var robots = [];


		for (let index = 0; index < 25; index++) {
			var conteo = await contractMistery.entregaNFT(this.props.accountAddress, index).call()
				.then((conteo) => {
					if (conteo) {
						robots.push(parseInt(conteo)); return 1;
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
			let user = await contractNFT.ownerOf(robots[index]).call();
			estonuevo[index] = window.tronWeb.address.fromHex(user) === this.props.accountAddress;
		}

		//console.log(estonuevo)

		for (let index = 0; index < robots.length; index++) {

			var URI = await contractNFT.tokenURI(robots[index]).call()

			var metadata = JSON.parse(await (await fetch(cons.proxy + URI)).text());
			metadata.numero = robots[index]

			robots[index] = metadata;

		}


		var imagerobots = [];
		var recBotton = (<></>)

		for (let index = 0; index < robots.length; index++) {

			if (!estonuevo[index]) {
				recBotton = (
					<button className="btn btn-success" onClick={async () => {
						var contractMistery = await window.tronWeb.contract().at(cons.SC3);
						await contractMistery.claimNFT_especifico(index).send();
					}}>Claim</button>
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

class nftCrowdFunding extends Component {
	constructor(props) {
		super(props);

		this.state = {

			mc: "Loading...",
			mb: "Loading..."
		};

		this.compra = this.compra.bind(this);
		this.misterio = this.misterio.bind(this);


	}

	async componentDidMount() {

		setInterval(() => {
			this.misterio();
		}, 7 * 1000)
	}

	async misterio() {

		var contractNFT = await window.tronWeb.contract().at(cons.BRGY);
		console.log(contractNFT)
		var contractMistery = await window.tronWeb.contract().at(cons.SC3);

		let mb = 0;
		let mc = 0;

		for (let index = 0; index < 25; index++) {
			var conteo = await contractMistery.entregaNFT(this.props.accountAddress, index).call().catch(() => { return 0; });

			if (conteo) {
				mc++;
				let nft = await contractMistery.entregaNFT(this.props.accountAddress, index).call();
				let ownerNft = await contractNFT.ownerOf(parseInt(nft)).call();
				ownerNft = window.tronWeb.address.fromHex(ownerNft);

				if (ownerNft !== this.props.accountAddress) {
					mb++;
				}

			} else {
				break;
			}

		}

		this.setState({
			mc: mc,
			mb: mb
		})

	}


	async compra() {

		var accountAddress = await window.tronWeb.trx.getAccount();
		accountAddress = window.tronWeb.address.fromHex(accountAddress.address);

		var contractMistery = await window.tronWeb.contract().at(cons.SC3);

		var contractAPENFT = await window.tronWeb.contract().at(cons.APENFT);

		var aprovado = await contractAPENFT.allowance(accountAddress, contractAddress).call();

		if (aprovado.remaining) {
			aprovado = aprovado.remaining;
		}

		aprovado = parseInt(aprovado);
		aprovado = aprovado / 10 ** 6;


		if (aprovado > 0) {

			await contractMistery.buyMisteryBox().send();

			window.alert("Mistery box buyed!");


		} else {

			await contractAPENFT.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send();


		}

		this.misterio();

	};

	render() {


		return (


			<div className="container text-center">

				<div className="card">
					<div className="row">

						<div className="col-lg-12">
							<img
								className="img-fluid"
								src="assets/img/MISTERY2.gif"
								alt="mistery box brutus"
							/>
							<h2>Mistery box</h2>
							<p>10'000.000 APENFT</p>
							<button className="btn btn-success" style={{ "cursor": "pointer" }} onClick={() => this.compra()}>Buy Mistery Box</button>

							<br></br><br></br>

							Mistery Box buyed: {this.state.mc}

							<br></br>

							<button className="btn btn-warning" style={{ "cursor": "pointer" }} onClick={async () => {

								if (false) {

									window.alert("please wait to claim your NFT")

								} else {
									var contractMistery = await window.tronWeb.contract().at(cons.SC3);

									await contractMistery.claimNFT().send()
										.then(() => { window.alert("NFT's sended") })
										.catch(() => { window.alert("Error to reclaim") })

								}

							}}>Open {this.state.mb} Mistery Box</button>
						</div>

					</div>

				</div>


			</div>


		);
	}
}
 */

let nextUpdate = 0
let intervalId = null

export default class nfts extends Component {
	constructor(props) {
		super(props);

		this.state = {
			imagerobots: []

		};

		this.estado = this.estado.bind(this);

	}


	componentDidMount() {
		document.title = "BRGY | Brutus.Finance"

		intervalId = setInterval(() => {

			if (Date.now() >= nextUpdate) {

				if (!this.props.contrato.ready) {
					nextUpdate = Date.now() + 3 * 1000;
				} else {
					nextUpdate = Date.now() + 60 * 1000;
				}
				this.estado();
			}

		}, 3 * 1000);
	}

	componentWillUnmount() {
		clearInterval(intervalId)
	}


	async estado() {

		let { contrato } = this.props

		if (!contrato.ready) return;

		let robots = [];

		for (let index = 0; index < 25; index++) {
			var conteo = await this.props.contrato.MBOX.entregaNFT(this.props.accountAddress, index).call()
				.then((conteo) => {
					if (conteo) {
						robots.push(parseInt(conteo)); return 1;
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

			var metadata = await fetch(utils.proxy + URI).then((res) => { return res.json() }).catch(console.error);
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
					}}>Claim</button>
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
							<h4>My Colectibles</h4>
							<p className="mb-0">BRGY</p>
						</div>
					</div>
					<div className="col-sm-6 p-md-0 justify-content-sm-end mt-2 mt-sm-0 d-flex">
						<ol className="breadcrumb">
							<li className="breadcrumb-item">See collection on </li>
							<li className="breadcrumb-item active"><a href="https://bit.ly/Brutus-Gallery" rel="noopener noreferrer" target="_blank">APENFT</a></li>
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

