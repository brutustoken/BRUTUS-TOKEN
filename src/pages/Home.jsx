import React, { Component } from "react";
import utils from "../utils";

let nextUpdate = 0
let intervalId = null
export default class Inicio extends Component {
	constructor(props) {
		super(props);

		this.state = {
			precioTRX: 0.1594,

			precioBrut: 0,
			varBrut: 0,
			precioBrst: 0,
			varBrst: 0,
			misBRUT: 0,
			misBRST: 0,
			misBRGY: 0,
			misBRLT: 0,
			precioBrstUSD: 0,

			imagerobots: []

		};

		this.consultaPrecios = this.consultaPrecios.bind(this);
		this.subeobaja = this.subeobaja.bind(this);
		this.textoE = this.textoE.bind(this);
		this.estado = this.estado.bind(this);


	}

	componentDidMount() {
		document.getElementById("tittle").innerText = this.props.i18n.t("inicio.tittle")

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

	async consultaPrecios() {
		await fetch(process.env.REACT_APP_API_URL + 'api/v1/precio/brut')
			.then(response => { return response.json(); })
			.then(data => {

				this.setState({
					precioBrut: data.Data.usd,
					varBrut: data.Data.v24h,
				})

			}).catch(err => {
				console.log(err);

			});

		await fetch(process.env.REACT_APP_API_URL + 'api/v1/precio/brst')
			.then(async (r) => (await r.json()).Data)
			.then((r) => {
				//console.log(r)

				this.setState({
					precioTRX: r.usd / r.trx,
					varBrst: r.v24h,
					precioBrstUSD: r.usd
				})

			}).catch((err) => {
				console.log(err);

			});

	}

	async estado() {

		await this.consultaPrecios();

		let { contrato, accountAddress } = this.props

		if (!contrato.ready) return;

		//console.log(this.props.tronWeb.createRandom({path: "m/44'/195'/0'/0/0", extraEntropy: 'alajuacdand', locale: 'en'}))
		let precioBrst = utils.normalizarNumero(await contrato.BRST_TRX_Proxy.RATE().call());
		this.setState({
			precioBrst: precioBrst,
		})

		contrato.BRST.balanceOf(accountAddress).call()
			.then((result) => { this.setState({ misBRST: utils.normalizarNumero(result) }) })
			.catch(console.error)

		contrato.BRUT.balanceOf(accountAddress).call()
			.then((result) => { this.setState({ misBRUT: utils.normalizarNumero(result) }) })
			.catch(console.error)

		if (accountAddress !== "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb") {
			contrato.BRGY.balanceOf(accountAddress).call()
				.then((result) => { this.setState({ misBRGY: utils.normalizarNumero(result, 0) }) })
				.catch(console.error)

			contrato.BRLT.balanceOf(accountAddress).call()
				.then((result) => { this.setState({ misBRLT: utils.normalizarNumero(result, 0) }) })
				.catch(console.error)
		}


	}

	

	render() {

		/**
		 *
		 * <div className="row">
					<div className="col-lg-12">
						<div className="profile card card-body px-3 pt-3">
							<div className="profile-head">
								<div className="photo-content">
									<a href="/#/ebot" title={this.props.i18n.t('inicio.try')}>
										<div className="rounded"><img style={{ borderRadius: "1%" }}
											src="images/banner.jpg" alt="tron energy rental" width="100%" />
										</div>
									</a>
								</div>

							</div>
						</div>
					</div>
				</div> 
		 * 
		 */

				const tableStyle = {
					minWidth: "425px",
					width: "100%",
					borderCollapse: "collapse",
				  };
				  
				  const cellStyle = {
					borderBottom: "1px solid #ddd", // Solo bordes internos horizontales
					borderRight: "1px solid #ddd", // Solo bordes internos verticales
					padding: "8px",
				  };

				  const lastCellStyle = {
					...cellStyle,
					borderRight: "none",
				  };
				  
				  

		return (
			<>

				<div className="row">

					<div className="col-12">
						<div className="card">
							<div className="card-body pt-0">
								<div className="tab-content" id="pills-tabContent">
									<div className="tab-pane fade show active" id="pills-crypto" role="tabpanel"
										aria-labelledby="pills-crypto-tab">
										<div className="table-responsive dataTablemarket">
											<table id="example" style={tableStyle} className="table shadow-hover display"
												>
												<thead>
													<tr>
														<th>{this.props.i18n.t('inicio.name')}</th>
														<th className="text-center">{this.props.i18n.t('inicio.tokenB')}</th>
														<th className="text-center">{this.props.i18n.t("inicio.totalB")}</th>
														<th className="text-center">{this.props.i18n.t("inicio.usdValue")}</th>

													</tr>
												</thead>
												<tbody>
													<tr>
														<td style={cellStyle}>
															<a className="market-title d-flex align-items-center"
																href="/#/brut">
																<img src="images/brut.png" width="50px" alt="brutus token" />
																<div style={{paddingLeft: "10px"}}>
																	<span className="text-muted ms-2"><b style={{color: "black",fontSize:"18px"}}>BRUT</b> Brutus Token<br></br>
																		{this.state.precioBrut} USDT {this.subeobaja(this.state.varBrut)}<span className={"text-" + this.textoE(this.state.varBrut)}>{(this.state.varBrut).toFixed(3)}%</span>

																	</span>
																</div>
															</a>
														</td>
														<td  style={cellStyle}>{this.state.misBRUT}</td>
														<td  style={cellStyle}>{(this.state.misBRUT * this.state.precioBrut).toFixed(3)} USDT</td>
														<td  style={lastCellStyle}>{(this.state.misBRUT * this.state.precioBrut).toFixed(3)} USD</td>
													</tr>
													<tr>
														<td  style={cellStyle}>
															<a className="market-title d-flex align-items-center"href="/#/brst">
																<img src="images/brst.png" width="50px" alt="brutus tron staking" />
																<div style={{paddingLeft: "10px"}}>
																	<span className="text-muted ms-2"><b style={{color: "black",fontSize:"18px"}}>BRST</b> Brutus Tron Staking<br></br>
																	{(this.state.precioBrst).toFixed(6)} TRX {this.subeobaja(this.state.varBrst)}<span className={"text-" + this.textoE(this.state.varBrst)}>{(this.state.varBrst).toFixed(3)}%</span>

																	</span>
																</div>
															</a>
														</td>
														<td  style={cellStyle}>{(this.state.misBRST).toLocaleString("en-US")}</td>
														<td  style={cellStyle}>{(this.state.misBRST * this.state.precioBrst).toLocaleString("en-US")} TRX</td>
														<td  style={lastCellStyle}>{(this.state.misBRST * this.state.precioBrstUSD).toLocaleString("en-US")} USD</td>
													</tr>
													<tr>
														<td  style={cellStyle}>
															<a className="market-title d-flex align-items-center"
																href="/#/brgy">
																<img src="images/brgy.png" width="50px" alt="brutus gallery" />
																<div style={{paddingLeft: "10px"}}>
																	<span className="text-muted ms-2"><b style={{color: "black",fontSize:"18px"}}>BRGY</b> Brutus {this.props.i18n.t("gallery")}<br></br>
																	10,000 NFT

																	</span>
																</div>
															</a>
														</td>
														<td  style={cellStyle}>{this.state.misBRGY}</td>
														<td  style={cellStyle}>{this.state.misBRGY*10000} NFT</td>
														<td  style={lastCellStyle}>-0-</td>
													</tr>
													<tr>
														<td  style={{...cellStyle, borderBottom: "none"}}>
															<a className="market-title d-flex align-items-center"
																href="/#/brlt">
																<img src="images/brlt.png" width="50px" alt="brutus lottery" />
																<div style={{paddingLeft: "10px"}}>
																	<span className="text-muted ms-2"><b style={{color: "black",fontSize:"18px"}}>BRLT</b> Brutus {this.props.i18n.t("lottery")}<br></br>
																	100 TRX

																	</span>
																</div>
															</a>
														</td>
														<td style={{...cellStyle, borderBottom: "none"}}>{this.state.misBRLT}</td>
														<td style={{...cellStyle, borderBottom: "none"}}>{this.state.misBRLT * 100} TRX</td>
														<td style={{...lastCellStyle, borderBottom: "none"}}>{(this.state.misBRLT * 100 * this.state.precioTRX).toFixed(1)} USD</td>
													</tr>
												</tbody>
											</table>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div >

			</>
		);
	}
}


export const Head = () => <>

	<meta property="og:image" content="brutusimage" />
</>