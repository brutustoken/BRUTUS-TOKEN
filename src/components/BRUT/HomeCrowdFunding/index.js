import React, { Component } from "react";
import Utils from "../../../utils";

import cons from "../../../cons.js";

const contractAddress = cons.SC;


export default class Trading extends Component {
  constructor(props) {
    super(props);

    this.state = {

      minCompra: 10,
      minventa: 1,
      deposito: "Cargando...",
      wallet: this.props.accountAddress,
      valueBRUT: "",
      valueUSDT: "",
      value: "",
      balanceBRUT: 0,
      balanceUSDT: 0,
      precioBRUT: 0.07886435,
      depositoUSDT: "Cargando...",
      depositoBRUT: "Cargando...",

    };

    this.compra = this.compra.bind(this);
    this.venta = this.venta.bind(this);
    this.estado = this.estado.bind(this);
    this.handleChangeBRUT = this.handleChangeBRUT.bind(this);
    this.handleChangeUSDT = this.handleChangeUSDT.bind(this);
    this.consultarPrecio = this.consultarPrecio.bind(this);
  }

  async handleChangeBRUT(event) {
    this.consultarPrecio();
    await this.setState({valueBRUT: event.target.value});

    this.setState({valueUSDT: parseFloat((this.state.valueBRUT*this.state.precioBRUT).toPrecision(8))});

  }

  async handleChangeUSDT(event) {
    this.consultarPrecio();
    
    await this.setState({valueUSDT: event.target.value});

    this.setState({valueBRUT: parseFloat((this.state.valueUSDT/this.state.precioBRUT).toPrecision(8))});

    
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);

    setInterval(() => {this.estado()},3*1000);
  };

  async consultarPrecio(){

    var proxyUrl = cons.proxy;
    var apiUrl = cons.PRICE;

    var response;
    try {
      response = await fetch(proxyUrl+apiUrl);
    } catch (err) {
      console.log(err);
      return this.state.precioBRUT;
    }

    const json = await response.json();
    return json.Data.usd;

  };

  async estado(){

    var accountAddress =  this.props.accountAddress;

    var tronUSDT = await window.tronWeb;
    var contractUSDT = await tronUSDT.contract().at(cons.USDT);

    var aprovadoUSDT = await contractUSDT.allowance(accountAddress,contractAddress).call();
    if(aprovadoUSDT.remaining){
      aprovadoUSDT = parseInt(aprovadoUSDT.remaining._hex);
    }else{
      aprovadoUSDT = parseInt(aprovadoUSDT._hex);
    }
    

    var balanceUSDT = await contractUSDT.balanceOf(accountAddress).call();
    balanceUSDT = parseInt(balanceUSDT._hex)/10**6;

    if (aprovadoUSDT > 0) {
      aprovadoUSDT = "Comprar "; 
    }else{
      aprovadoUSDT = "Aprobar Compras"; 
      this.setState({
        valueUSDT: ""
      })
    }

    var tronBRUT = await window.tronWeb;
    var contractBRUT = await tronBRUT.contract().at(cons.BRUT);

    var aprovadoBRUT = await contractBRUT.allowance(accountAddress,contractAddress).call();
    if(aprovadoBRUT.remaining){
      aprovadoBRUT = parseInt(aprovadoBRUT.remaining._hex);
    }else{
      aprovadoBRUT = parseInt(aprovadoBRUT._hex);
    }

    var balanceBRUT = await contractBRUT.balanceOf(accountAddress).call();
    balanceBRUT = parseInt(balanceBRUT._hex)/10**6;

    if (aprovadoBRUT > 0) {
      aprovadoBRUT = "Vender ";
    }else{
      aprovadoBRUT = "Aprobar Ventas";
      this.setState({
        valueBRUT: ""
      })
    }

    var precioBRUT =  await this.consultarPrecio();


    this.setState({
      depositoUSDT: aprovadoUSDT,
      depositoBRUT: aprovadoBRUT,
      balanceBRUT: balanceBRUT,
      balanceUSDT: balanceUSDT,
      wallet: accountAddress,
      precioBRUT: precioBRUT
    });

  }


  async compra() {


    const { minCompra } = this.state;

    var amount = document.getElementById("amountUSDT").value;
    amount = parseFloat(amount);
    amount = parseInt(amount*10**6);

    var accountAddress =  this.props.accountAddress;

    var tronUSDT = await window.tronWeb;
    var contractUSDT = await tronUSDT.contract().at(cons.USDT);

    var aprovado = await contractUSDT.allowance(accountAddress,contractAddress).call();
    if(aprovado.remaining){
      aprovado = parseInt(aprovado.remaining._hex);
    }else{
      aprovado = parseInt(aprovado._hex);
    }

    if ( aprovado >= amount ){


        if ( amount >= minCompra){

          document.getElementById("amountUSDT").value = "";

          await Utils.contract.comprar(amount).send();

        }else{
          window.alert("Ingrese un monto mayor a "+minCompra+" USDT");
          document.getElementById("amountUSDT").value = minCompra;
        }



    }else{

        if (aprovado <= 0) {
          await contractUSDT.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send();
        }

        if ( amount > aprovado) {
          if (aprovado <= 0) {
            document.getElementById("amountUSDT").value = minCompra;
            window.alert("No tienen suficiente USDT");
          }else{
            document.getElementById("amountUSDT").value = minCompra;
            window.alert("valor inválido");
          }



        }else{

          document.getElementById("amountUSDT").value = amount;
          window.alert("valor inválido");

        }
    }


  };

  async venta() {


    const { minventa } = this.state;

    var amount = document.getElementById("amountBRUT").value;
    amount = parseFloat(amount);
    amount = parseInt(amount*10**6);

    var accountAddress =  this.props.accountAddress;

    var tronBRUT = await window.tronWeb;
    var contractBRUT = await tronBRUT.contract().at(cons.BRUT);

    var aprovado = await contractBRUT.allowance(accountAddress,contractAddress).call();
    if(aprovado.remaining){
      aprovado = parseInt(aprovado.remaining._hex);
    }else{
      aprovado = parseInt(aprovado._hex);
    }

    if ( aprovado >= amount ){


        if ( amount >= minventa){

          document.getElementById("amountBRUT").value = "";

          await Utils.contract.vender(amount).send();

        }else{
          window.alert("coloque un monto mayor a 10 USDT");
          document.getElementById("amountBRUT").value = 10;
        }



    }else{


        if (aprovado <= 0) {
          await contractBRUT.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send();
        }

        if ( amount > aprovado) {
          if (aprovado <= 0) {
            document.getElementById("amountBRUT").value = minventa;
            window.alert("lo minimo para vender son "+minventa+" BRUT");
          }else{
            document.getElementById("amountBRUT").value = minventa;
            window.alert("valor inválido");
          }



        }else{

          document.getElementById("amountBRUT").value = minventa;
          window.alert("valor inválido");

        }

    }


  };


  render() {

    var { minCompra, minventa } = this.state;

    minCompra = "Min. "+minCompra+" USDT";
    minventa = "Min. "+minventa+" BRUT";


    return (


      <div className="container text-center">
        <div className="row justify-content-md-center">
          <div className="col-lg-12 p-3">
            <div className="card">
            
              
              <h5 >
                <strong>Intercambio</strong><br />
                1 BRUT = {this.state.precioBRUT} USDT
              </h5>
              <hr color="white"/>
            
              <div className="form-group">
                <p>
                  Tether: <strong>{this.state.balanceUSDT}</strong> (USDT)
                </p>
                <input type="number" className="form-control mb-20 text-center" id="amountUSDT" value={this.state.valueUSDT} onChange={this.handleChangeUSDT} placeholder={minCompra}></input>
                <br></br>
                <p>
                  Brutus Token: <strong>{this.state.balanceBRUT}</strong> (BRUT)
                </p>
                <input type="number" className="form-control mb-20 text-center" id="amountBRUT" value={this.state.valueBRUT} onChange={this.handleChangeBRUT} placeholder={minventa}></input>
                <br></br>

                <p className="card-text">
                  
                  { (this.state.valueBRUT) + " BRUT = "+(this.state.valueUSDT)+" USDT"}
                  <br></br>
                  <button className="btn btn-success" style={{"wordBreak":"break-all"}} onClick={() => this.compra()}><b>{this.state.depositoUSDT}</b></button>
                  {"  "}
                  <button className="btn btn-danger" style={{"wordBreak":"break-all"}} onClick={() => this.venta()}><b>{this.state.depositoBRUT}</b></button>
                  <br></br>
                  Es necesario ~50 TRX para realizar la transacción
                  
                </p>
              </div>
              
            </div>
            
          </div>

        </div>
      </div>


    );
  }
}
