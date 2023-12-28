var proxy = "https://cors.brutusservices.com/";

const conProxy = true;
const testnet = true; // revisar si está tesnet activada

if(!conProxy)proxy = "";

const PRICE = proxy+process.env.REACT_APP_API_URL+"api/v1/precio/BRUT"; //API de precio
const market_brut =  proxy+process.env.REACT_APP_API_URL+"api/v1/consulta/marketcap/brut"; //API de capitalizacion de mercado

const PRU = "shasta1.";// shasta1. para inhabilitar red de pruebas

var SC = "TBRVNF2YCJYGREKuPKaP7jYYP9R1jvVQeq";//contrato BRUT/USDT
var SC2 = "TMzxRLeBwfhm8miqm5v2qPw3P8rVZUa3x6";//contrato N°2 POOL Staking  BRST/TRX
var ProxySC2 = "";// versionable POOL Staking  BRST/TRX
var SC3 = "TV2oWfCNLtLDxu1AGJ2D4QJhdWagJN5Xqk";//contrato Mixtery box
var SC4 = "";//contrato sorteo de loteria 15 dias

var USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";//token USDT
var BRUT = "TLGhEHUevHsfExxm4miyMxfmT5xumNr4BU";//token trc20 BRUT
var BRST = "TF8YgHqnJdWzCbUyouje3RYrdDKJYpGfB3";//token trc20 BRST
var APENFT = "TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq";//token de venta de mixtery box
var BRGY = "TGpQ3qap18rN1vMJj3pveMfqTeXDaKaDE7";//token NFT  BRGY 
var BRLT = "TBCp8r6xdZ34w7Gm3Le5pAjPpA3hVvFZFU";//token NFT LOTERIA

var TAK = {"TRON-PRO-API-KEY": 'b0e8c09f-a9c8-4b77-8363-3cde81365fac'}

if(testnet){

    SC = "TADgHFAqjTeTRthrkGcP1m7TtX221pmPH1";//pool USDT_BUT
    SC2 = "TMt5zzCgpWDUVpw3fiqBZgqQDYCYViZCVC"; //Pool BRST_TRX
    ProxySC2 = "TH4xHxyecwZJJ5SXouUYJ3KW4zPw5BtNSE"; // Pool_BRST_TRX versionable 
    SC3 = "";//pool APENFT_NFT
    SC4 = "TYtAGrdr6VDopFqrWRbZPXYT9yyMXsZ4zR";// Loteria Contract NFT_BRST_TRX PROXY

    USDT = "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf";//token USDT
    BRUT = "TTBZHmxP5H2FW8zaJgCR2x2WeB82rJo3xb";//token trc20 BRUT
    BRST = "TVF78ZDkPL2eJgUqs7pDusTgyMtw9WA4tq";//token trc20 BRST
    APENFT = "TMaG566bcktJkjxQpQxshewfTqATzxmtPX";//token de venta de mixtery box
    BRGY = "TMEmo4xexAEu3zSmSrzPJoA1FE6AEfgVyW";//token NFT  BRGY 
    BRLT = "TPJ8chq5pHGkWsyDrrVVKQQbS2ECK5UZd5";//NFT LOTERIA
    TAK = {}

}

export default {proxy, PRU,  SC, SC2, ProxySC2, SC3, SC4, USDT, PRICE, BRUT, BRST, BRGY, APENFT, BRLT, market_brut,TAK};
