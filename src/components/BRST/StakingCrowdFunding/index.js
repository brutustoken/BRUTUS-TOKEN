import React, { Component } from "react";
import Utils from "../../../utils";

import cons from "../../../cons.js";

const contractAddress = cons.SC2;

export default class Trading extends Component {
  constructor(props) {
    super(props);

    this.state = {

      minCompra: 10,
      minventa: 1,
      deposito: "Cargando...",
      wallet: "Cargando...",
      valueBRUT: "",
      valueUSDT: "",
      value: "",
      cantidad: 0,
      tiempo: 0,
      enBrutus: 0,
      tokensEmitidos: 0,
      enPool: 0,
      solicitado: 0,

    };

    this.compra = this.compra.bind(this);
    this.venta = this.venta.bind(this);
    this.estado = this.estado.bind(this);

    this.handleChangeBRUT = this.handleChangeBRUT.bind(this);
    this.handleChangeUSDT = this.handleChangeUSDT.bind(this);

    this.llenarBRUT = this.llenarBRUT.bind(this);
    this.llenarUSDT = this.llenarUSDT.bind(this);

    this.consultarPrecio = this.consultarPrecio.bind(this);
    this.completarSolicitud = this.completarSolicitud.bind(this);
  }

  handleChangeBRUT(event) {
    this.setState({valueBRUT: event.target.value});
  }

  handleChangeUSDT(event) {
    this.setState({valueUSDT: event.target.value});
  }

  llenarBRUT(){
    document.getElementById('amountBRUT').value = this.state.balanceBRUT;
    this.setState({valueBRUT: this.state.balanceBRUT});
    
  }

  llenarUSDT(){
    document.getElementById('amountUSDT').value = this.state.balanceUSDT;
    this.setState({valueUSDT: this.state.balanceUSDT});
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    this.estado();
    setInterval(() => this.estado(),1*1000);
  };

  async consultarPrecio(){

    var precio = await Utils.contract.RATE().call();
    precio = parseInt(precio._hex)/10**6;

    this.setState({
      precioBRUT: precio
    });

    return precio;

  };

  async completarSolicitud(id, trx){

    await Utils.contract.completarSolicitud(id).send({callValue: trx});

  }

  async estado(){

    var accountAddress =  await window.tronWeb.trx.getAccount();
    accountAddress = window.tronWeb.address.fromHex(accountAddress.address);

    var inicio = accountAddress.substr(0,4);
    var fin = accountAddress.substr(-4);

    var texto = inicio+"..."+fin;

    document.getElementById("login").innerHTML = '<a href="https://tronscan.io/#/address/'+accountAddress+'" className="logibtn gradient-btn">'+texto+'</a>';

    var aprovadoUSDT = await window.tronWeb.trx.getBalance();

    aprovadoUSDT = aprovadoUSDT/10**6;

    var balanceUSDT = aprovadoUSDT;

    if (aprovadoUSDT > 0) {
      aprovadoUSDT = "Comprar "; 
    }else{
      aprovadoUSDT = "Necesitas TRX para hacer Staking"; 
      this.setState({
        valueUSDT: ""
      })
    }

    var tronBRUT = await window.tronWeb;
    var contractBRUT = await tronBRUT.contract().at(cons.BRST);

    var MIN_DEPOSIT = await Utils.contract.MIN_DEPOSIT().call();
    MIN_DEPOSIT = parseInt(MIN_DEPOSIT._hex)/10**6;

    var aprovadoBRUT = await contractBRUT.allowance(accountAddress,contractAddress).call();
    aprovadoBRUT = parseInt(aprovadoBRUT._hex);

    var balanceBRUT = await contractBRUT.balanceOf(accountAddress).call();
    balanceBRUT = parseInt(balanceBRUT._hex)/10**6;

    if (aprovadoBRUT > 0) {
      aprovadoBRUT = "Vender ";
    }else{
      aprovadoBRUT = "Aprobar intercambio";
      this.setState({
        valueBRUT: ""
      })
    }

    var precioBRUT =  await this.consultarPrecio();

    var deposito = await Utils.contract.todasSolicitudes(accountAddress).call();

    var tiempo = await Utils.contract.TIEMPO().call();

    tiempo = parseInt(tiempo._hex)*1000;

    console.log(deposito);

    var misDepositos = [];
    var id;
    
    for (let index = 0; index < deposito.brst.length; index++) {
      if (!deposito.completado[index]) {
        id = parseInt(deposito.id[index]._hex);
        misDepositos.push(<div className="col-lg-12" key={"mis-"+id}>
          <p># {id} | {parseInt(deposito.brst[index]._hex)/10**6} BRST -&gt; {parseInt(deposito.trxx[index]._hex)/10**6} TRX  {" "}
          <button type="button" className="btn btn-warning" onClick={() => this.completarSolicitud(parseInt(deposito.id[index]._hex), 0)}>Cancelar</button></p>
          <hr></hr>
        </div>)
      }
      
    }

    var deposits = await Utils.contract.solicitudesPendientesGlobales().call();

    var globDepositos = [];

    var pen;
    
    for (let index = 0; index < deposits.length; index++) {

      pen = await Utils.contract.verSolicitudPendiente(parseInt(deposits[index]._hex)).call();

      globDepositos[index] = (<div className="col-lg-12" key={"glob"+parseInt(deposits[index]._hex)}>
          <p># {parseInt(deposits[index]._hex)} | {parseInt(pen[3]._hex)/10**6} BRST -&gt; {parseInt(pen[2]._hex)/10**6} TRX  {" "}
          <button type="button" className="btn btn-prymary" onClick={async() => {
            var local = await Utils.contract.verSolicitudPendiente(parseInt(deposits[index]._hex)).call();
            this.completarSolicitud(parseInt(deposits[index]._hex),parseInt(local[2]._hex));
            }}>Completar</button></p>
          <hr></hr>
        </div>)
      
      
    }


    var enBrutus = await Utils.contract.TRON_BALANCE().call();
    var tokensEmitidos = await contractBRUT.totalSupply().call();
    var enPool = await Utils.contract.TRON_PAY_BALANCE().call();
    var solicitado = await Utils.contract.TRON_SOLICITADO().call();
    var solicitudes = await Utils.contract.index().call();

    //console.log(tokensEmitidos);
    this.setState({
      minCompra: MIN_DEPOSIT,
      globDepositos: globDepositos,
      misDepositos: misDepositos,
      depositoUSDT: aprovadoUSDT,
      depositoBRUT: aprovadoBRUT,
      balanceBRUT: balanceBRUT,
      balanceUSDT: balanceUSDT,
      wallet: accountAddress,
      precioBRUT: precioBRUT,
      espera: tiempo,
      enBrutus: parseInt(enBrutus._hex)/10**6,
      tokensEmitidos: parseInt(tokensEmitidos._hex)/10**6,
      enPool: parseInt(enPool._hex)/10**6,
      solicitado: parseInt(solicitado._hex)/10**6,
      solicitudes: parseInt(solicitudes._hex),
    });

  }


  async compra() {


    const { minCompra } = this.state;

    var amount = document.getElementById("amountUSDT").value;
    amount = parseFloat(amount);
    amount = parseInt(amount*10**6);

    var aprovado = await window.tronWeb.trx.getBalance();

    if ( aprovado >= amount ){


        if ( amount >= minCompra){

          document.getElementById("amountUSDT").value = "";

          await Utils.contract.staking().send({callValue: amount});

        }else{
          window.alert("Please enter an amount greater than "+minCompra+" USDT");
          document.getElementById("amountUSDT").value = minCompra;
        }



    }else{

        if ( amount > aprovado) {
          if (aprovado <= 0) {
            document.getElementById("amountUSDT").value = minCompra;
            window.alert("You do not have enough funds in your account you place at least 10 USDT");
          }else{
            document.getElementById("amountUSDT").value = minCompra;
            window.alert("You must leave 50 TRX free in your account to make the transaction");
          }



        }else{

          document.getElementById("amountUSDT").value = amount;
          window.alert("You must leave 50 TRX free in your account to make the transaction");

        }
    }

    this.llenarUSDT();

  };

  async venta() {


    const { minventa } = this.state;

    var amount = document.getElementById("amountBRUT").value;
    amount = parseFloat(amount);
    amount = parseInt(amount*10**6);

    var accountAddress =  await window.tronWeb.trx.getAccount();
    accountAddress = window.tronWeb.address.fromHex(accountAddress.address);

    var tronBRUT = await window.tronWeb;
    var contractBRUT = await tronBRUT.contract().at(cons.BRST);

    var aprovado = await contractBRUT.allowance(accountAddress,contractAddress).call();
    aprovado = parseInt(aprovado._hex);

    if ( aprovado >= amount ){


        if ( amount >= minventa){

          document.getElementById("amountBRUT").value = "";

          var pass = window.confirm("Tu solicitud generará una orden de venta para tus BRST esperando a que sea completada por la comunidad");
          if(pass){await Utils.contract.solicitudRetiro(amount).send()};

          //window.alert("Estamos actualizando a la version 3 del contrato de liquidez por favor contacta atravez de telegram para intercambiar tus BRST por TRX, estamos mejorando nustro sistema ;)");

        }else{
          window.alert(`ingrese un valor mayor a ${minventa} BRST`);
          document.getElementById("amountBRUT").value = minventa;
        }



    }else{


        if (aprovado <= 0) {
          await contractBRUT.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send();
        }

        if ( amount > aprovado) {
          if (aprovado <= 0) {
            document.getElementById("amountBRUT").value = minventa;
            window.alert("You do not have enough funds in your account you place at least "+minventa+" USDT");
          }else{
            document.getElementById("amountBRUT").value = minventa;
            window.alert("You must leave 50 TRX free in your account to make the transaction");
          }



        }else{

          document.getElementById("amountBRUT").value = minventa;
          window.alert("You must leave 50 TRX free in your account to make the transaction");

        }

    }

    this.llenarBRUT();

  };

  async retiro() {

    if (Date.now() >= this.state.tiempo && this.state.tiempo-this.state.espera !== 0) {
      await Utils.contract.retirar().send();
    }else{
      window.alert("todavia no es tiempo de retirar");
    }


  };


  render() {

    var { minCompra, minventa } = this.state;

    minCompra = "Min. "+minCompra+" TRX";
    minventa = "Min. "+minventa+" BRST";

    return (


      <div className="container text-center">
        
        <div className="card">
          <div className="row">

            <div className="col-lg-4">
                <h2>TRX en SR</h2>
                <p>{this.state.enBrutus} TRX</p>
            </div>

            <div className="col-lg-4">
                <h2>1 BRST</h2>
                <p>{(this.state.enBrutus/this.state.tokensEmitidos).toFixed(6)} TRX</p>
            </div>

            <div className="col-lg-4">
                <h2>BRST emitidos</h2>
                <p>{this.state.tokensEmitidos} BRST</p>
            </div>

          </div>

        </div>
        <div className="row">
          <div className="col-lg-6 ">
            <div className="card pt-4">
            
              
              <h5 >
                <strong>Hacer Staking</strong><br />
              </h5>

              <hr color="white"/>

              <p onClick={() => this.llenarUSDT()} style={{"cursor" : "pointer"}}>
                Tron: <strong>{this.state.balanceUSDT}</strong> (TRX)
              </p>

              <div className="form-group">
                <input type="number" className="form-control mb-20 text-center" id="amountUSDT"  onChange={this.handleChangeUSDT} placeholder={minCompra} min={this.state.minCompra} max={this.state.balanceUSDT}></input>
                <p className="card-text">recomendamos tener ~ 50 TRX para hacer la transacción</p>

                <button className="btn btn-success" style={{"wordBreak":"break-all"}} onClick={() => this.compra()}>{this.state.depositoUSDT} {" "} {(this.state.valueUSDT/this.state.precioBRUT).toFixed(6)} BRST</button>

              </div>
              
            </div>
            
          </div>
          

          
          <div className="col-lg-6">
            <div className="card pt-4">
            
              
              <h5 >
                <strong>Deshacer Staking</strong><br />
              </h5>

              <hr color="white"/>

              <p onClick={() => this.llenarBRUT()} style={{"cursor" : "pointer"}}>
                Brutus Staking: <strong>{this.state.balanceBRUT}</strong> (BRST)
              </p>

              <div className="form-group">
                <input type="number" className="form-control mb-20 text-center" id="amountBRUT"  onChange={this.handleChangeBRUT} placeholder={minventa} min={this.state.minventa} max={this.state.balanceBRUT}></input>
                <p className="card-text">recomendamos tener ~ 50 TRX para hacer la transacción</p>

                <button className="btn btn-danger" style={{"wordBreak":"break-all"}} onClick={() => this.venta()}>{this.state.depositoBRUT} {(this.state.precioBRUT*this.state.valueBRUT).toFixed(6)} TRX</button>


              </div>
              
            </div>
            
          </div>

        </div>

        <div className="card">
          <div className="row">

          <div className="col-lg-12">
                <h2><i className="fa fa-user-circle" aria-hidden="true"></i> Mis Solicitudes pendientes</h2>
            </div>

          </div>

          <hr  color="white"/>

          <div className="row">

            {this.state.misDepositos}

          </div>

        </div>

        <div className="card">
          <div className="row">

          <div className="col-lg-12">
                <h2><i className="fa fa-globe" aria-hidden="true"></i> Solicitudes Globales</h2>
            </div>

          </div>

          <hr  color="white"/>

          <div className="row">

              {this.state.globDepositos}

          </div>

        </div>

      </div>


    );
  }
}
