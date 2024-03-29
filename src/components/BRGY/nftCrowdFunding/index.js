import React, { Component } from "react";
import cons from "../../../cons.js";

const contractAddress = cons.SC3;

export default class nftCrowdFunding extends Component {
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

    setInterval(()=>{
      this.misterio();
    }, 7*1000)
  }

  async misterio() {
    
    var contractNFT = await window.tronWeb.contract().at(cons.BRGY);
    console.log(contractNFT)
    var contractMistery = await window.tronWeb.contract().at(cons.SC3);

    let mb = 0; 
    let mc = 0; 

    for (let index = 0; index < 25; index++) {
      var conteo = await contractMistery.entregaNFT(this.props.accountAddress, index).call().catch(()=>{return 0;});

      if(conteo._hex){
        mc++;
        let nft = await contractMistery.entregaNFT(this.props.accountAddress, index).call();
        let ownerNft = await contractNFT.ownerOf(parseInt(nft._hex)).call();
        ownerNft = window.tronWeb.address.fromHex(ownerNft);

        if(ownerNft !== this.props.accountAddress){
          mb++;
        }

      }else{
        break;
      }
      
    }

    this.setState({
      mc: mc,
      mb: mb
    })

  }


  async compra() {

    var accountAddress =  await window.tronWeb.trx.getAccount();
    accountAddress = window.tronWeb.address.fromHex(accountAddress.address);

    var contractMistery = await window.tronWeb.contract().at(cons.SC3);

    var contractAPENFT = await window.tronWeb.contract().at(cons.APENFT);

    var aprovado = await contractAPENFT.allowance(accountAddress,contractAddress).call();

    if(aprovado.remaining){
      aprovado = aprovado.remaining;
    }
    
    aprovado = parseInt(aprovado._hex);
    aprovado = aprovado/10**6;


    if ( aprovado > 0 ){

      await contractMistery.buyMisteryBox().send();

      window.alert("Mistery box buyed!");


    }else{

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
                <button className="btn btn-success" style={{"cursor":"pointer"}} onClick={() => this.compra()}>Buy Mistery Box</button>

                <br></br><br></br>

                Mistery Box buyed: {this.state.mc}

                <br></br>

                <button className="btn btn-warning" style={{"cursor":"pointer"}} onClick={async() => { 

                  if(false){

                    window.alert("please wait to claim your NFT")

                  }else{
                    var contractMistery = await window.tronWeb.contract().at(cons.SC3);

                    await contractMistery.claimNFT().send()
                    .then(()=>{window.alert("NFT's sended")})
                    .catch(()=>{window.alert("Error to reclaim")})
                    
                  }
                  
                  }}>Open {this.state.mb} Mistery Box</button>
            </div>

          </div>

        </div>


      </div>


    );
  }
}
