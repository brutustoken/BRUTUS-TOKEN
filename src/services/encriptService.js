import CryptoJS from 'crypto-js';


export const encryptData = (data = {}) => {
    try {
        return CryptoJS.AES.encrypt(JSON.stringify(data), import.meta.env.VITE_SECRET).toString();

    } catch (e) {
        console.error(e)
        throw new Error("Error de encriptacion")
    }
}