import React, { Component } from 'react';
import TronLinkLogo from './TronLinkLogo.png';

import {IntlProvider, FormattedMessage } from 'react-intl';

const WEBSTORE_URL = 'https://chrome.google.com/webstore/detail/ibnejdfjmmkpcnlpebklmnkoeoihofec/';

const logo = (
    <div className='col-sm-4 text-center'>
        <img src={ TronLinkLogo } className="img-fluid" alt='TronLink logo' />
    </div>
);

const openTronLink = () => {
    window.open(WEBSTORE_URL, '_blank');
};
export default class TronLinkGuide extends Component {

    constructor(props) {
      super(props);
  
      this.state = {
        url: document.location.href,
  
      };

    }

    render() {

        var {installed , url } = this.props;

        if(!installed) {
            return (
                <IntlProvider messages={this.props.textos} locale={this.props.idioma} defaultLocale="es-co">
                <div className='row' onClick={ openTronLink } style={{'padding': '3em','decoration':'none','color':'white'}}>
                    <div className='col-sm-8'>
                        <h1><FormattedMessage
                            id="wallet.titulo.instalar"
                            defaultMessage="Instale TronLink"
                            /></h1>
                        <p>
                            <FormattedMessage
                            id="wallet.texto.instalar"
                            defaultMessage="Para acceder a esta pagina debe instalar TronLink. TronLink es una wallet de TRON wallet para el navegador la puede instalar desde la Chrome Webstore. una vez instalada, regrese y actualice la pagina."
                            
                            />
                        </p>
                    </div>
                    { logo }
                </div>
                </IntlProvider>
            );
        }

        return (
        <IntlProvider messages={this.props.textos} locale={this.props.idioma} defaultLocale="es-co">
        
            <a href={url}>
            <div className='tronLink row' style={{'padding': '3em','decoration':'none','color':'white'}} >

                <div className='info col-sm-8'>
                    <h1><FormattedMessage
                            id="wallet.titulo.desbloqueo"
                            defaultMessage="Desbloquee su wallet"
                            /></h1>
                    <p>
                        <FormattedMessage
                            id="wallet.texto.desbloqueo"
                            defaultMessage="TronLink esta instalado. Abra TronLink desde la barra de su navegador si no lo ha hecho configure su primer wallet desde cero, si usted ya tiene una wallet con fondos solo desbloquee la wallet para usar esta pagina."
                            
                            />
                    </p>
                </div>
                { logo }
            </div>
            </a>
            
        </IntlProvider>);
    }
}
