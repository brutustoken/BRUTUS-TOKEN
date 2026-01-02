import { TronWeb } from 'tronweb';
import { config } from '../config/env';

export const keyQuery = async () => {

    try {

        let consulta = await fetch(config.BRUTUS_API + '/selector/apikey')
            .then(r => r.json())

        return consulta.apikey


    } catch (e) {
        console.error(e)
        throw new Error("Error obteniendo API key para trongrid desde el servidor ")
    }


}

const getRed = (index = 0) => {

    try {

        let tokenList = config.LIST_TRONQL || "";
        //console.log(tokenList, (tokenList == false))
        tokenList = tokenList.split(",")

        if (index > tokenList.length) index = tokenList.length - 1;

        let url = "https://" + tokenList[index] + ".mainnet.tron.tronql.com/"

        return url;

    } catch (e) {
        console.error(e)
        throw new Error("Error al obtener red de tronql")
    }

}

export const getTronweb = async (wallet = config.WALLET_DEFAULT, red = 0) => {

    try {

        const tronWeb = new TronWeb({
            fullHost: getRed(red),
            //headers: { "TRON-PRO-API-KEY": await keyQuery() }
        })

        tronWeb.setAddress(wallet)

        return tronWeb


    } catch (e) {
        console.error(e)
        throw new Error("Error al crear objeto TronWeb")
    }



}