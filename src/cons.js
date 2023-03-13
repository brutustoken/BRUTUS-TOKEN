var proxy = "http://localhost:8080/";
const PRICE = "https://chainlist.tk/api/v1/precio/BRUT"; //API de precio
const PRU = "shasta1.";// shasta1. para inhabilitar red de pruebas

const WS = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb";//T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb recibe los huerfanos por defecto

var SC = "TBRVNF2YCJYGREKuPKaP7jYYP9R1jvVQeq";//contrato
var SC2 = "TMzxRLeBwfhm8miqm5v2qPw3P8rVZUa3x6";//contrato N°2 POOL Staking 
var SC3 = "TV2oWfCNLtLDxu1AGJ2D4QJhdWagJN5Xqk";//contrato Mixtery box
var SC4 = "TV2oWfCNLtLDxu1AGJ2D4QJhdWagJN5Xqk";//contrato sorteo de loteria 15 dias


var USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";//token USDT
var BRUT = "TLGhEHUevHsfExxm4miyMxfmT5xumNr4BU";//token trc20 BRUT
var BRST = "TF8YgHqnJdWzCbUyouje3RYrdDKJYpGfB3";//token trc20 BRST
var APENFT = "TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq";//token de venta de mixtery box
var BRGY = "TGpQ3qap18rN1vMJj3pveMfqTeXDaKaDE7";//token NFT  BRGY 
var BRLT = "TXTcK8Lb34FSkojMyA27Zr4GPbwAjB6ZkU";//token brutus LOTERIA

const testnet = true;

if(testnet){

    SC2 = "TSZ679Wh1L8sG7VYcjfAEMLmWu7vV1aoTM"; //Pool BRST
    SC4 = "TYY1nbpPnvZThjdcoTiNWC2DDXG3TzwWm9"; // Loteria 

    BRST = "TVF78ZDkPL2eJgUqs7pDusTgyMtw9WA4tq";// BRST token
    BRGY = "TGpQ3qap18rN1vMJj3pveMfqTeXDaKaDE7";//NFT Galeria
    BRLT = "TXTcK8Lb34FSkojMyA27Zr4GPbwAjB6ZkU";//NFT LOTERIA

    proxy = ""
}


export default {proxy, PRU, WS,  SC, SC2, SC3, SC4, USDT, PRICE, BRUT, BRST, BRGY, APENFT, BRLT};
