import React, { Component } from "react";

export default class Inicio extends Component {
	constructor(props) {
		super(props);

		this.state = {

			precioBrut: 0,
			varBrut: 0,
			precioBrst: 0,
			varBrst: 0,
			BRGY: 0,
			BRLT: 0,
			misBRUT: 0,
			misBRST: 0,
			misBRGY: 0,
			misBRLT: 0,
			precioBrstUSD:0,

			imagerobots: []

		};

		this.consultaPrecios = this.consultaPrecios.bind(this);
		this.subeobaja = this.subeobaja.bind(this);
		this.textoE = this.textoE.bind(this);
		this.estado = this.estado.bind(this);


	}

	componentDidMount() {
		setTimeout(() => { this.estado(); }, 3 * 1000);
		setTimeout(() => { this.consultaPrecios(); }, 1 * 1000);

		setInterval(() => { this.estado(); }, 60 * 1000);
		setInterval(() => { this.consultaPrecios(); }, 60 * 1000);
	}

	subeobaja(valor) {
		var imgNPositivo = (<svg width="29" height="22" viewBox="0 0 29 22" fill="none"
			xmlns="http://www.w3.org/2000/svg">
			<g filter="url(#filter0_d2)">
				<path d="M5 16C5.91797 14.9157 8.89728 11.7277 10.5 10L16.5 13L23.5 4"
					stroke="#2BC155" strokeWidth="2" strokeLinecap="round" />
			</g>
			<defs>
				<filter id="filter0_d2" x="-3.05176e-05" y="-6.10352e-05" width="28.5001"
					height="22.0001" filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB">
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feColorMatrix in="SourceAlpha" type="matrix"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
					<feOffset dy="1" />
					<feGaussianBlur stdDeviation="2" />
					<feColorMatrix type="matrix"
						values="0 0 0 0 0.172549 0 0 0 0 0.72549 0 0 0 0 0.337255 0 0 0 0.61 0" />
					<feBlend mode="normal" in2="BackgroundImageFix"
						result="effect1_dropShadow" />
					<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow"
						result="shape" />
				</filter>
			</defs>
		</svg>);
		var imgNegativo = (<svg width="29" height="22" viewBox="0 0 29 22" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g filter="url(#filter0_d)">
				<path d="M5 4C5.91797 5.08433 8.89728 8.27228 10.5 10L16.5 7L23.5 16" stroke="#FF2E2E" strokeWidth="2" strokeLinecap="round" />
			</g>
			<defs>
				<filter id="filter0_d" x="0" y="0" width="28.5001" height="22.0001" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
					<feOffset dy="1" />
					<feGaussianBlur stdDeviation="2" />
					<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.180392 0 0 0 0 0.180392 0 0 0 0.61 0" />
					<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
					<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
				</filter>
			</defs>
		</svg>);

		var resultado = imgNPositivo;

		if (valor < 0) {
			resultado = imgNegativo
		}

		return resultado;
	}

	textoE(valor) {

		var resultado = "success";

		if (valor < 0) {
			resultado = "danger"
		}

		return resultado;

	}

	consultaPrecios() {
		var API = process.env.REACT_APP_API_URL;

		var apiUrl = API + 'api/v1/precio/brut';
		fetch(apiUrl)
			.then(response => { return response.json(); })
			.then(data => {

				this.setState({
					precioBrut: data.Data.usd,
					varBrut: data.Data.v24h,
				})

			}).catch(err => {
				console.log(err);

			});

		apiUrl = API + 'api/v1/precio/brst';
		fetch(apiUrl)
			.then(response => { return response.json(); })
			.then(data => {

				this.setState({
					precioBrst: data.Data.trx,
					varBrst: data.Data.v24h,
					precioBrstUSD: data.Data.usd
				})

			}).catch(err => {
				console.log(err);

			});

	}

	async estado() {

		//console.log(window.tronWeb.createRandom({path: "m/44'/195'/0'/0/0", extraEntropy: 'alajuacdand', locale: 'en'}))

		this.props.contrato.BRGY.totalSupply().call()
			.then((result) => { this.setState({ BRGY: result.toNumber() }) })
			.catch(console.error)

		this.props.contrato.BRUT.balanceOf(this.props.accountAddress).call()
			.then((result) => { this.setState({ misBRUT: result.toNumber() / 1e6 }) })
			.catch(console.error)

		this.props.contrato.BRST.balanceOf(this.props.accountAddress).call()
			.then((result) => { this.setState({ misBRST: result.toNumber() / 1e6 }) })
			.catch(console.error)

		this.props.contrato.BRGY.balanceOf(this.props.accountAddress).call()
			.then((result) => { this.setState({ misBRGY: result.toNumber() }) })
			.catch(console.error)



	}

	render() {

		return (
			<>

				<div className="row">
					<div className="col-lg-12">
						<div className="profile card card-body px-3 pt-3">
							<div className="profile-head">
								<div className="photo-content">
									<a href="?ebot">
										<div className="rounded"><img style={{borderRadius: "1%"}}
											src="images/banner.jpg" alt="tron energy rental" width="100%" />
										</div>
									</a>
								</div>
								<div className="profile-info d-none d-block">
									<div className="profile-details d-flex flex-row-reverse">
										<div className="text-center mt-12 mb-12 ">
											<a href="?ebot" className="btn btn-primary mx-auto">Try it
												now!</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>


				<div className="row">
					<div className="col-xl-12">
						<div className="card">
							<div className="card-header border-0">
								<ul className="order nav nav-tabs" id="pills-tab" role="tablist">
									<li className="nav-item my-1" role="presentation">
										<button className="nav-link active" id="pills-crypto-tab" data-bs-toggle="pill"
											data-bs-target="#pills-crypto" type="button" role="tab"
											aria-controls="pills-crypto" aria-selected="true">My Position</button>
									</li>
								</ul>
							</div>
							<div className="card-body pt-0">
								<div className="tab-content" id="pills-tabContent">
									<div className="tab-pane fade show active" id="pills-crypto" role="tabpanel"
										aria-labelledby="pills-crypto-tab">
										<div className="table-responsive dataTablemarket">
											<table id="example" className="table shadow-hover display"
												style={{minWidth:"845px"}}>
												<thead>
													<tr>
														<th>Name</th>
														<th className="text-center">Token Balance</th>
														<th className="text-center">Price</th>
														<th className="text-center">24h Change</th>
														<th className="text-center">Total Value</th>
														<th className="text-center">USD Value</th>

													</tr>
												</thead>
												<tbody>
													<tr>
														<td>
															<a className="market-title d-flex align-items-center"
																href="?brut">
																<img src="images/brut.png" width="50px" alt="brutus token" />
																	<h5 className="mb-0 ms-2">BRUT</h5>
																	<span className="text-muted ms-2">Brutus Token</span>
															</a>
														</td>
														<td>{this.state.misBRUT}</td>
														<td>{this.state.precioBrut} USDT</td>
														<td>{this.subeobaja(this.state.varBrut)}
										<span className={"text-" + this.textoE(this.state.varBrut)}>{(this.state.varBrut).toFixed(3)}%</span></td>
														<td>{(this.state.misBRUT * this.state.precioBrut).toFixed(3)} USDT</td>
														<td>{(this.state.misBRUT * this.state.precioBrut).toFixed(3)} USD</td>
													</tr>
													<tr>
														<td>
															<a className="market-title d-flex align-items-center"
																href="?brst">
																<img src="images/brst.png" width="50px" alt="brutus tron staking" />
																	<h5 className="mb-0 ms-2">BRST</h5>
																	<span className="text-muted ms-2">Brutus Tron Staking</span>
															</a>
														</td>
														<td>{this.state.misBRST}</td>
														<td>{(this.state.precioBrst).toFixed(6)} TRX</td>
														<td>{this.subeobaja(this.state.varBrst)}<span className={"text-" + this.textoE(this.state.varBrst)}>{(this.state.varBrst).toFixed(3)}%</span></td>
														<td>{(this.state.misBRST * this.state.precioBrst).toFixed(3)} TRX</td>
														<td>{(this.state.misBRST * this.state.precioBrstUSD).toFixed(2)} USD</td>
													</tr>
													<tr>
														<td>
															<a className="market-title d-flex align-items-center"
																href="?brgy">
																<img src="images/brgy.png" width="50px" alt="brutus gallery"/>
																	<h5 className="mb-0 ms-2">BRGY</h5>
																	<span className="text-muted ms-2">Brutus Gallery</span>
															</a>
														</td>
														<td>{this.state.misBRGY}</td>
														<td>NFT</td>
														<td>-0-</td>
														<td>-0-</td>
														<td>-0-</td>
													</tr>
													<tr>
														<td>
															<a className="market-title d-flex align-items-center"
																href="?brlt">
																<img src="images/brlt.png" width="50px" alt="brutus lottery"/>
																	<h5 className="mb-0 ms-2">BRLT</h5>
																	<span className="text-muted ms-2">Brutus Lottery</span>
															</a>
														</td>
														<td>{this.state.misBRLT}</td>
														<td>100 TRX</td>
														<td>0</td>
														<td>{this.state.misBRLT * 100}</td>
														<td>0</td>
													</tr>
												</tbody>
											</table>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

			</>
		);
	}
}
