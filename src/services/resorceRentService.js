import { getTronweb } from './tronWebService';
import { config } from '../config/env';
import { encryptData } from './encriptService';

export const rentResource = async (wallet_orden, recurso, cantidad, periodo, temporalidad, precio, signedTransaction, referral = false) => {

    if (recurso === "bandwidth" || recurso === "band") {
        recurso = "band"
    } else {
        recurso = "energy"
    }

    let time = periodo

    if (temporalidad === "h" || temporalidad === "hour" || temporalidad === "hora") {
        time = periodo + temporalidad
    }

    if (temporalidad === "m" || temporalidad === "min" || temporalidad === "minutes" || temporalidad === "minutos") {
        time = periodo + "min"
    }

    let data = {
        "wallet": wallet_orden,
        "resource": recurso,
        "amount": cantidad,
        "duration": time,

        "transaction": signedTransaction,
        "to_address": config.WALLET_API,
        "precio": await getTronweb.toSun(precio),

        "expire": Date.now() + (500 * 1000),

        "id_api": import.meta.env.VITE_USER_ID,
        "token": import.meta.env.VITE_TOKEN,

        "dApp": referral ? 1 : 0,
        "referral": referral ? referral : 0,
        "dapp_identif": import.meta.env.VITE_IDENTF || 0
    }

    // Encrypt
    const DATA_ENCRYPT = encryptData(data)

    let consulta = await fetch(config.BRUTUS_API + "/rent/energy", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user: import.meta.env.VITE_USER_C, DATA_ENCRYPT })
    }).then((r) => r.json())
        .catch((error) => {
            console.error(error)
            return { result: false, hash: signedTransaction.txID, msg: "API-Error: " + error.toString() }
        })


    return consulta

}