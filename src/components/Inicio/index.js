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

			imagerobots: []

		};

		this.consultaPrecios = this.consultaPrecios.bind(this);
		this.subeobaja = this.subeobaja.bind(this);
		this.textoE = this.textoE.bind(this);
		this.estado = this.estado.bind(this);


	}

	componentDidMount() {
		setTimeout(() => {this.estado();}, 3*1000);
		setTimeout(() => {this.consultaPrecios();}, 1*1000);

		setInterval(() => {this.estado();}, 60*1000);
		setInterval(() => {this.consultaPrecios();}, 60*1000);
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

		if (valor <= 0) {
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
					varBrut: data.Data.v24h
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
					varBrst: data.Data.v24h
				})

			}).catch(err => {
				console.log(err);

			});

	}

	async estado() {

		this.props.contrato.BRGY.totalSupply().call()
		.then((result)=>{ this.setState({ BRGY:result.toNumber() }) })
		.catch(console.error)

		this.props.contrato.BRUT.balanceOf(this.props.accountAddress).call()
		.then((result)=>{ this.setState({ misBRUT:result.toNumber()/ 1e6 }) })
		.catch(console.error)

		this.props.contrato.BRST.balanceOf(this.props.accountAddress).call()
		.then((result)=>{ this.setState({ misBRST:result.toNumber()/ 1e6 }) })
		.catch(console.error)

		this.props.contrato.BRGY.balanceOf(this.props.accountAddress).call()
		.then((result)=>{ this.setState({ misBRGY:result.toNumber() }) })
		.catch(console.error)

		

	}

	render() {

		return (
			<>
				<h1>Datos Generales</h1>
				<div className="row">
					<div className="col-xl-3 col-sm-6 m-t35">
						<div className="card card-coin">
							<div className="card-body text-center">
								<a href="/?brut">
									<img className="mb-3 currency-icon" src="assets/img/brut.png" alt="brutus finance" width="80" height="80" />

									<h2 className="text-black mb-2 font-w600">{this.state.precioBrut} USDT</h2>
									<p className="mb-0 fs-14">
										{this.subeobaja(this.state.varBrut)}
										<span className={"text-" + this.textoE(this.state.varBrut) + " me-1"}>{(this.state.varBrut).toFixed(3)}%</span> 24h
									</p>
								</a>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-sm-6 m-t35">
						<div className="card card-coin">
							<div className="card-body text-center">
								<a href="/?brst">
									<img className="mb-3 currency-icon" src="assets/img/brst.png" alt="brutus finance" width="80" height="80" />

									<h2 className="text-black mb-2 font-w600">{this.state.precioBrst} TRX</h2>
									<p className="mb-0 fs-13">
										{this.subeobaja(this.state.varBrst)}
										<span className={"text-" + this.textoE(this.state.varBrst) + " me-1"}>{(this.state.varBrst).toFixed(3)}%</span> 24h
									</p>
								</a>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-sm-6 m-t35">
						<div className="card card-coin">
							<div className="card-body text-center">
								<a href="/?brgy">
									<img className="mb-3 currency-icon" src="assets/img/brgy.png" alt="brutus finance" width="80" height="80" />
									<h2 className="text-black mb-2 font-w600">{this.state.BRGY} NFT's </h2>
									<p className="mb-0 fs-14">
										Minteados
									</p>
								</a>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-sm-6 m-t35">
						<div className="card card-coin">
							<div className="card-body text-center">
								<a href="/?brlt">
									<img className="mb-3 currency-icon" src="assets/img/brlt.png" alt="brutus finance" width="80" height="80" />
									<h2 className="text-black mb-2 font-w600">{this.state.BRLT} Boletos </h2>
									<p className="mb-0 fs-14">
										Generados
									</p>
								</a>
							</div>
						</div>
					</div>
				</div>


				<div className="row">
					<div className="col-xl-12 col-xxl-12">
						<div className="row">
							<div className="col-xl-12">
								<div className="card">
									<div className="card-header border-0 pb-0">
										<h4 className="mb-0 fs-20 text-black">Mis Tokens</h4>

									</div>
									<div className="card-body">

										<div className="bg-warning coin-holding flex-wrap">
											<div className="mb-2 coin-bx">
												<div className="d-flex align-items-center">
													<div>
														<a href="/?brut">
															<img src="assets/img/brut.png" alt="brutus finance brut" width="80" height="80" />
														</a>
													</div>
													<div className="ms-3">
														<h4 className="coin-font font-w600 mb-0 text-white">Brutus Token</h4>
														<p className="mb-0 text-white op-6">BRUT</p>
													</div>
												</div>
											</div>
											<div className="mb-2">
												<div className="d-flex align-items-center">
													<div className="ms-3">
														<h2 className="mb-0 text-white coin-font-1">{this.state.misBRUT}</h2>
													</div>
												</div>
											</div>
											<div className="mb-2">
												<div className="d-flex align-items-center">
													{this.subeobaja(this.state.varBrut)}
													<p className="mb-0 ms-2"><span className={"text-" + this.textoE(this.state.varBrut) + " me-1"}>{(this.state.varBrut).toFixed(3)}%</span></p>
													<p className="mb-0 ms-2 font-w400 text-white">${(this.state.misBRUT * this.state.precioBrut).toFixed(3)} USDT</p>
												</div>
											</div>
										</div>
										<div className="bg-danger coin-holding mt-4 flex-wrap">
											<div className="mb-2 coin-bx">
												<div className="d-flex align-items-center">
													<div>
														<a href="/?brst">
															<img src="assets/img/brst.png" alt="brutus finance brst" width="80" height="80" />
														</a>
													</div>
													<div className="ms-3">
														<h4 className="coin-font font-w600 mb-0 text-white">Brutus Tron Staking</h4>
														<p className="mb-0 text-white">BRST</p>
													</div>
												</div>
											</div>
											<div className="mb-2">
												<div className="d-flex align-items-center">
													<div className="ms-3">
														<h2 className="mb-0 text-white coin-font-1">{this.state.misBRST}</h2>
													</div>
												</div>
											</div>
											<div className="mb-2">
												<div className="d-flex align-items-center">
													{this.subeobaja(this.state.varBrst)}
													<p className="mb-0 ms-2"><span className={"text-" + this.textoE(this.state.varBrst) + " me-1"}>{(this.state.varBrst).toFixed(3)}%</span></p>
													<p className="mb-0 ms-2 font-w400 text-white">{(this.state.misBRST * this.state.precioBrst).toFixed(3)} TRX</p>
												</div>
											</div>
										</div>
										<div className="bg-info coin-holding mt-4 flex-wrap">
											<div className="mb-2 coin-bx">
												<div className="d-flex align-items-center">
													<div>
														<a href="/?brgy">
															<img src="assets/img/brgy.png" alt="brutus finance brgy" width="80" height="80" />
														</a>
													</div>
													<div className="ms-3">
														<h4 className="coin-font font-w600 mb-0 text-white">Brutus Gallery</h4>
														<p className="mb-0 text-white">BRGY</p>
													</div>
												</div>
											</div>
											<div className="mb-2">
												<div className="d-flex align-items-center">
													<div className="ms-3">
														<h2 className="mb-0 text-white coin-font-1">{this.state.misBRGY}</h2>
													</div>
												</div>
											</div>
											<div className="mb-2">
												<div className="d-flex align-items-center">
													<p className="mb-0 ms-2 font-w400 text-white">NFT's</p>
												</div>
											</div>
										</div>
										<div className=" coin-holding mt-4 flex-wrap" style={{ backgroundColor: "#6418c3" }}>
											<div className="mb-2 coin-bx">
												<div className="d-flex align-items-center">
													<div>
														<a href="/?brlt">
															<img src="assets/img/brlt.png" alt="brutus finance brlt" width="80" height="80" />
														</a>
													</div>
													<div className="ms-3">
														<h4 className="coin-font font-w600 mb-0 text-white">Brutus Lottery</h4>
														<p className="mb-0 text-white">BRLT</p>
													</div>
												</div>
											</div>
											<div className="mb-2">
												<div className="d-flex align-items-center">
													<div className="ms-3">
														<h2 className="mb-0 text-white coin-font-1">{this.state.misBRLT}</h2>
													</div>
												</div>
											</div>
											<div className="mb-2">
												<div className="d-flex align-items-center">
													<p className="mb-0 ms-2 font-w400 text-white">{this.state.misBRLT * 100} TRX</p>
												</div>
											</div>
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
