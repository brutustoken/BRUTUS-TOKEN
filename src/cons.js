var proxy = "https://cors.brutusservices.com/";

const testnet = false; // revisar si está tesnet activada

const PRICE = proxy + process.env.REACT_APP_API_URL + "api/v1/precio/BRUT"; //API de precio
const market_brut = proxy + process.env.REACT_APP_API_URL + "api/v1/consulta/marketcap/brut"; //API de capitalizacion de mercado

const apiProviders = proxy + "https://api-providers.brutusservices.com/main/"

var RED = "https://api.trongrid.io";// shasta para habilitar red de pruebas

var SC = "TBRVNF2YCJYGREKuPKaP7jYYP9R1jvVQeq";//contrato BRUT/USDT
var SC2 = "TMzxRLeBwfhm8miqm5v2qPw3P8rVZUa3x6";//contrato N°2 POOL Staking  BRST/TRX
var ProxySC2 = "TRSWzPDgkEothRpgexJv7Ewsqo66PCqQ55";// POOL Staking  BRST/TRX Proxy
var SC3 = "TV2oWfCNLtLDxu1AGJ2D4QJhdWagJN5Xqk";//contrato Mixtery box
var SC4 = "TKghr3aZvCbo41c8y5vUXofChF1gMmjTHr";//contrato sorteo de loteria 15 dias Proxy

var USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";//token USDT
var BRUT = "TLGhEHUevHsfExxm4miyMxfmT5xumNr4BU";//token trc20 BRUT
var BRST = "TF8YgHqnJdWzCbUyouje3RYrdDKJYpGfB3";//token trc20 BRST
var APENFT = "TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq";//token de venta de mixtery box
var BRGY = "TGpQ3qap18rN1vMJj3pveMfqTeXDaKaDE7";//token NFT  BRGY 
var BRLT = "TBCp8r6xdZ34w7Gm3Le5pAjPpA3hVvFZFU";//token NFT LOTERIA 


var KEYS = process.env.REACT_APP_LIST_API_KEY || ""
KEYS = (KEYS).split(",")


if (testnet) {

    RED = "https://nile.trongrid.io"

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
    KEYS = {}

}

export default { proxy, RED, SC, SC2, ProxySC2, SC3, SC4, USDT, PRICE, BRUT, BRST, BRGY, APENFT, BRLT, market_brut, KEYS, apiProviders };
