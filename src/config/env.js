const env = import.meta.env;
export let config = {
    WALLET_DEFAULT: "TWVVi4x2QNhRJyhqa7qrwM4aSXnXoUDDwY",
    WALLET_API: env.VITE_WALLET_API,
    BOT_URL: env.VITE_BOT_URL,
    BRUTUS_API: env.VITE_API_URL,
    apiProviders: env.VITE_API_PROVIDERS_URL,
    NFT_API: env.VITE_API_NFT,

    PRICE: env.VITE_API_URL + "precio/BRUT", //API de precio
    market_brut: env.VITE_API_URL + "consulta/marketcap/brut", //API de capitalizacion de mercado

    LIST_TRONQL: env.VITE_LIST_TRONQL,

    // sistema de renta de recursos
    ID_RENT: import.meta.env.VITE_USER_ID,
    TOKEN_RENT: import.meta.env.VITE_TOKEN,
    // verificacion de conexion
    USER_RENT: env.VITE_USER_C,
    SECRET_RENT: env.VITE_SECRET,

    SC: "TMGnBtzQufLp4GvCMBqFQGcV6nsXFNrWcs",//contrato BRUT/USDT
    SC2: "TMzxRLeBwfhm8miqm5v2qPw3P8rVZUa3x6",//contrato N°2 POOL Staking  BRST/TRX
    ProxySC2: "TRSWzPDgkEothRpgexJv7Ewsqo66PCqQ55",// POOL Staking  BRST/TRX Proxy
    ProxySC3: "TKSpw8UXhJYL2DGdBNPZjBfw3iRrVFAxBr",// Pool brst/trx retiradas rapidas
    SC3: "TV2oWfCNLtLDxu1AGJ2D4QJhdWagJN5Xqk",//contrato Mixtery box
    SC4: "TKghr3aZvCbo41c8y5vUXofChF1gMmjTHr",//contrato sorteo de loteria 15 dias Proxy

    USDT: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",//token trc20 USDT
    USDD: "TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz",//token trc20 USDD
    BRUT: "TLGhEHUevHsfExxm4miyMxfmT5xumNr4BU",//token trc20 BRUT
    BRST: "TF8YgHqnJdWzCbUyouje3RYrdDKJYpGfB3",//token trc20 BRST
    APENFT: "TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq",//token de venta de mixtery box
    BRGY: "TGpQ3qap18rN1vMJj3pveMfqTeXDaKaDE7",//token NFT  BRGY 
    BRLT: "TBCp8r6xdZ34w7Gm3Le5pAjPpA3hVvFZFU",//token NFT LOTERIA 

    SUNSWAPV3: "TXF1xDbVGdxFGbovmmmXvBGu8ZiE3Lq4mR"//contrato SUNSWAPV3
}


// Validar variables requeridas
const requiredEnvVars = ['VITE_API_URL', 'VITE_BOT_URL', 'VITE_API_PROVIDERS_URL', 'VITE_WALLET_API', 'VITE_LIST_TRONQL', 'VITE_API_NFT']

requiredEnvVars.forEach(varName => {
    if (!import.meta.env[varName]) {
        throw new Error(`Falta variable de entorno: ${varName}`)
    }
})