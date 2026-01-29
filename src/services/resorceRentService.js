import { getTronweb } from './tronWebService';
import { config } from '../config/env';
import { encryptData } from './encriptService';

export const rentResource = async (wallet_orden, recurso, cantidad, periodo, temporalidad, precio, signedTransaction, referral = false) => {

    try {

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

        const tronweb = await getTronweb()

        let data = {
            "wallet": wallet_orden,
            "resource": recurso,
            "amount": cantidad,
            "duration": time,

            "transaction": signedTransaction,
            "to_address": config.WALLET_API,
            "precio": tronweb.toSun(precio),

            "expire": Date.now() + (500 * 1000),

            "id_api": import.meta.env.VITE_USER_ID,
            "token": import.meta.env.VITE_TOKEN,

            "dApp": referral ? 1 : 0,
            "referral": referral ? referral : 0,
            "dapp_identif": import.meta.env.VITE_IDENTF ?? 0
        }

        // Encrypt
        const DATA_ENCRYPT = encryptData(data)

        const response = await fetch(config.BRUTUS_API + "/rent/energy", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user: import.meta.env.VITE_USER_C, data: DATA_ENCRYPT })
        })

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error servidor (${response.status}): ${errorText}`);
        }

        const consulta = await response.json();

        if (consulta.error) {
            throw new Error(consulta.msg);
        }

        return consulta

    } catch (error) {
        console.error("Error en rentResource:", error);
        // Devolvemos un objeto con el mismo formato para no romper el flujo de la UI
        return {
            result: false,
            hash: signedTransaction?.txID || null,
            msg: error.message || "Error desconocido al rentar"
        };
    }

}