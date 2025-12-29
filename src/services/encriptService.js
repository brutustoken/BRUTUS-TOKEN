import CryptoJS from 'crypto-js';


export const encryptData = (data = {}) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), import.meta.env.VITE_SECRET).toString();
}