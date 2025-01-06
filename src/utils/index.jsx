import {TronWeb} from 'tronweb';

const BigNumber = require('bignumber.js');

const env = process.env;

const CryptoJS = require("crypto-js");

let constantes = {}
constantes.proxy = "https://cors.brutusservices.com/";
constantes.BRUTUS_API = constantes.proxy + env.REACT_APP_API_URL + "api/v1/"
constantes.apiProviders = constantes.proxy + "https://api-providers.brutusservices.com/main/"

constantes.PRICE = constantes.BRUTUS_API + "precio/BRUT"; //API de precio
constantes.market_brut = constantes.BRUTUS_API + "consulta/marketcap/brut"; //API de capitalizacion de mercado

constantes.RED = "https://iujetrtxbxoskh9l1cidv7clngnjnm.mainnet.tron.tronql.com/"

constantes.SC = "TBRVNF2YCJYGREKuPKaP7jYYP9R1jvVQeq";//contrato BRUT/USDT
constantes.SC2 = "TMzxRLeBwfhm8miqm5v2qPw3P8rVZUa3x6";//contrato N°2 POOL Staking  BRST/TRX
constantes.ProxySC2 = "TRSWzPDgkEothRpgexJv7Ewsqo66PCqQ55";// POOL Staking  BRST/TRX Proxy
constantes.ProxySC3 = "TKSpw8UXhJYL2DGdBNPZjBfw3iRrVFAxBr";// Pool brst/trx retiradas rapidas
constantes.SC3 = "TV2oWfCNLtLDxu1AGJ2D4QJhdWagJN5Xqk";//contrato Mixtery box
constantes.SC4 = "TKghr3aZvCbo41c8y5vUXofChF1gMmjTHr";//contrato sorteo de loteria 15 dias Proxy

constantes.USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";//token USDT
constantes.BRUT = "TLGhEHUevHsfExxm4miyMxfmT5xumNr4BU";//token trc20 BRUT
constantes.BRST = "TF8YgHqnJdWzCbUyouje3RYrdDKJYpGfB3";//token trc20 BRST
constantes.APENFT = "TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq";//token de venta de mixtery box
constantes.BRGY = "TGpQ3qap18rN1vMJj3pveMfqTeXDaKaDE7";//token NFT  BRGY 
constantes.BRLT = "TBCp8r6xdZ34w7Gm3Le5pAjPpA3hVvFZFU";//token NFT LOTERIA 


if (constantes.testnet) {

  constantes.RED = "https://nile.trongrid.io"

  constantes.SC = "TADgHFAqjTeTRthrkGcP1m7TtX221pmPH1";//pool USDT_BUT
  constantes.SC2 = "TMt5zzCgpWDUVpw3fiqBZgqQDYCYViZCVC"; //Pool BRST_TRX
  constantes.ProxySC2 = "TH4xHxyecwZJJ5SXouUYJ3KW4zPw5BtNSE"; // Pool_BRST_TRX Prox
  constantes.ProxySC3 = "TH4xHxyecwZJJ5SXouUYJ3KW4zPw5BtNSE----"; // Pool_BRST_TRX Prox retiradas rapidas 

  constantes.SC3 = "";//pool APENFT_NFT
  constantes.SC4 = "TYtAGrdr6VDopFqrWRbZPXYT9yyMXsZ4zR";// Loteria Contract NFT_BRST_TRX PROXY

  constantes.USDT = "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf";//token USDT
  constantes.BRUT = "TTBZHmxP5H2FW8zaJgCR2x2WeB82rJo3xb";//token trc20 BRUT
  constantes.BRST = "TVF78ZDkPL2eJgUqs7pDusTgyMtw9WA4tq";//token trc20 BRST
  constantes.APENFT = "TMaG566bcktJkjxQpQxshewfTqATzxmtPX";//token de venta de mixtery box
  constantes.BRGY = "TMEmo4xexAEu3zSmSrzPJoA1FE6AEfgVyW";//token NFT  BRGY 
  constantes.BRLT = "TPJ8chq5pHGkWsyDrrVVKQQbS2ECK5UZd5";//NFT LOTERIA

}

function delay(s) { return new Promise(res => setTimeout(res, s * 1000)); }


async function keyQuery() {

  let KEY = await fetch(constantes.BRUTUS_API + 'selector/apikey')
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

function getRed(index) {
  index = parseInt(index)
  let tokenList = env.REACT_APP_LIST_TRONQL;
  tokenList = tokenList.split(",")

  if (index > tokenList.length) index = tokenList.length - 1;

  let url = "https://" + tokenList[index] + ".mainnet.tron.tronql.com/"

  return url;
}

async function getTronweb(wallet, red = 0) {

  const tronWeb = new TronWeb({
    fullHost: getRed(red),
    //headers: { "TRON-PRO-API-KEY": await keyQuery() }

  })

  tronWeb.setAddress(wallet)

  return tronWeb

}

async function rentResource(wallet_orden, recurso, cantidad, periodo, temporalidad, precio, signedTransaction) {

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
    "to_address": env.REACT_APP_WALLET_API,
    "precio": TronWeb.toSun(precio),

    "expire": Date.now() + (500 * 1000),

    "id_api": env.REACT_APP_USER_ID,
    "token": env.REACT_APP_TOKEN,
  }

  // Encrypt
  data = CryptoJS.AES.encrypt(JSON.stringify(data), env.REACT_APP_SECRET).toString();

  let consulta = await fetch(constantes.BRUTUS_API + "rent/energy", {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user: "9650f24d09200d8d0e1b31fd9eab8b55", data })
  }).then((r) => r.json())
    .catch((e) => {
      console.log(e.toString());
      return { result: false, hash: signedTransaction.txID, msg: "API-Error" }
    })

  return consulta

}

function normalizarNumero(n, s=6){
  return new BigNumber(n).shiftedBy(-s).toNumber();
}

function numberToStringCero(n, s=6){
  return new BigNumber(n).shiftedBy(s).dp(0).toString(10);
}

export default { ...constantes, keyQuery, getTronweb, delay, rentResource, normalizarNumero, numberToStringCero };
