import { TronWeb } from 'tronweb';
import { config } from '../config/env';

export const keyQuery = async () => {

    let KEY = await fetch(config.BRUTUS_API + '/selector/apikey')
        .then(response => { return response.json(); })
        .then(data => {
            let API_KEY = ""

            if (data.ok) {
                if (data.apikey) {
                    API_KEY = data.apikey
                }

            }
            return API_KEY

        }).catch(err => {
            console.log(err);
            return ""
        });

    return KEY

}

const getRed = (index = 0) => {

    let tokenList = config.LIST_TRONQL || "";
    //console.log(tokenList, (tokenList == false))
    tokenList = tokenList.split(",")

    if (index > tokenList.length) index = tokenList.length - 1;

    let url = "https://" + tokenList[index] + ".mainnet.tron.tronql.com/"

    return url;
}

export const getTronweb = async (wallet, red = 0) => {

    const tronWeb = new TronWeb({
        fullHost: getRed(red),
        //headers: { "TRON-PRO-API-KEY": await keyQuery() }
    })

    tronWeb.setAddress(wallet)

    return tronWeb

}