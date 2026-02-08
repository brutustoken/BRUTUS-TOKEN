import CryptoJS from 'crypto-js';
import { config } from '../config/env';


export const encryptData = (data = {}) => {
    try {
        return CryptoJS.AES.encrypt(JSON.stringify(data), config.SECRET_RENT).toString();

    } catch (e) {
        console.error(e)
        throw new Error("Error de encriptacion")
    }
}