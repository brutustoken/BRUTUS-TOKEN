import React, { Component } from 'react';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink';

import TronLinkLogo from './TronLinkLogo.png';

const adapter = new TronLinkAdapter();

function conectDirect(){
   adapter.connect()
   .then(()=>{console.log("conectado")})
   .catch((e)=>{console.log(e)})
}

const WEBSTORE_URL = 'https://chrome.google.com/webstore/detail/ibnejdfjmmkpcnlpebklmnkoeoihofec/';

const logo = (
    <div className='col-sm-4 text-center'>
        <img src={TronLinkLogo} className="img-fluid" alt='TronLink logo' />
    </div>
);

const openTronLink = () => {
    window.open(WEBSTORE_URL, '_blank');
};
export default class TronLinkGuide extends Component {

    render() {

        var { installed } = this.props;

        var tronLink = (<></>)

        if (!installed) {
            tronLink = (
                <div className='row' style={{ 'padding': '3em', 'decoration': 'none', 'cursor':'pointer' }} onClick={openTronLink}>
                    <div className='col-sm-8'>
                        <h1>Install TronLink</h1>
                        <p>
                            To access this page you must install TronLink. TronLink is a TRON wallet for the browser, you can install it from the <a href={WEBSTORE_URL} target='_blank' rel='noopener noreferrer'>Chrome Webstore</a>.
                            Once installed, go back and refresh the page.
                        </p>
                    </div>
                    {logo}
                </div>
            );
        }else{
            tronLink = (<>  
                <div className='tronLink row' style={{ 'padding': '3em', 'decoration': 'none', 'cursor':'pointer' }} onClick={conectDirect}>
    
                    <div className='info col-sm-8'>
                        <h1>Unlock wallet</h1>
                        <p>
                            TronLink is installed. Open TronLink from your browser bar if you haven't already set up your first wallet from scratch,
                            If you already have a wallet with funds, just unlock the wallet to use this page.
                        </p>
                    </div>
                    {logo}
                </div>
    
            </>);
        }

    
        return (
        <div className="container">
            <div className="row">
                <div className="col-xl-12">
                    <div className="card">
                        {tronLink}
                    </div>
                </div>
            </div>
        </div>
        )
    }
}
