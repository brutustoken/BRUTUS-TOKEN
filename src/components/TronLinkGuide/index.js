import React from 'react';

import TronLinkLogo from './TronLinkLogo.png';


const WEBSTORE_URL = 'https://chrome.google.com/webstore/detail/ibnejdfjmmkpcnlpebklmnkoeoihofec/';

const logo = (
    <div className='col-sm-4 text-center'>
        <img src={ TronLinkLogo } className="img-fluid" alt='TronLink logo' />
    </div>
);

const openTronLink = () => {
    window.open(WEBSTORE_URL, '_blank');
};


const TronLinkGuide = props => {
    var {
        installed = false,
        url = document.location.href,
    } = props;

    if(!installed) {
        return (
            <div className='row' onClick={ openTronLink }>
                <div className='col-sm-8'>
                    <h1>Por favor instale TronLink</h1>
                    <p>
                        Para acceder a esta pagina debe instalar TronLink. TronLink es una wallet de TRON wallet para el navegador la puede instalar desde la <a href={ WEBSTORE_URL } target='_blank' rel='noopener noreferrer'>Chrome Webstore</a>.
                        una vez instalada, regrese y actualice la pagina.
                    </p>
                </div>
                { logo }
            </div>
        );
    }

    return (
    <>  
        <div className='tronLink row' style={{'padding': '3em','decoration':'none','color':'white'}} onClick={() => {window.tronLink.request({ method: 'tron_requestAccounts' })}}>

            <div className='info col-sm-8'>
                <h1>Desbloquear su wallet</h1>
                <p>
                    TronLink esta instalado. Abra TronLink desde la barra de su navegador si no lo ha hecho configure su primer wallet desde cero, 
                    si usted ya tiene una wallet con fondos solo desbloquee la wallet para usar esta pagina.
                </p>
            </div>
            { logo }
        </div>

        

    </>
    );
};

export default TronLinkGuide;
