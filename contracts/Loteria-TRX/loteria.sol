pragma solidity >=0.8.0;

// SPDX-License-Identifier: Apache-2.0 

library SafeMath {

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        uint256 c = a - b;

        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {

        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {

        require(b > 0, "SafeMath: division by zero");
        uint256 c = a / b;

        return c;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0, "SafeMath: modulo by zero");
        return a % b;
    }
}

interface ITRC20 {
    function balanceOf(address owner) external view returns(uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address from, address to) external returns (bool);

}

interface ITRC721 {
    function baseURI() external view returns(string memory);
    function totalSupply() external view returns(uint256);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external view returns (address);
    function balanceOf(address from) external view returns(uint256);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns(uint256);
    function mintLoteryToken(address to) external returns(bool);

}

interface IPOOL {
    function staking() external payable returns (uint);
    function solicitudRetiro(uint256 _value) external returns (uint256);
    function RATE() external view returns (uint);
}

contract Ownable {
  address payable public owner;
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
  constructor(){
    owner = payable(msg.sender);
  }
  modifier onlyOwner() {
    if(msg.sender != owner)revert();
    _;
  }
  function transferOwnership(address payable newOwner) public onlyOwner {
    if(newOwner == address(0))revert();
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}

contract RandomNumber{

    uint randNonce = 0;

    function randMod(uint _modulus, uint _moreRandom) public view returns(uint){
       return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, _moreRandom, randNonce))) % _modulus;

    }

    function doneRandom() public {
       randNonce++; 
    }
}

contract Lottery is RandomNumber, Ownable{
    using SafeMath for uint256;

    uint256 public precio = 100 * 1e6;
    uint256 public umbral = 1 * 1e6;

    uint256 public trxPooled;

    uint256 public paso;
    uint256 public lastWiner;

    uint256 public administradores = 1;
    uint256 public colaborador = 1; // en porcentaje y en cantidad

    uint256 public proximaRonda = 0;
    uint256 public periodo = 15*86400;

    address public tokenBRST = 0xd36C2506eF27Fa376612eCBA208926bA0261A4ad;//BRST testnet

    address public tokenTRC721 = 0x922De0b0fd795Bb6Cd34B8a38EA0ba6954e93aF6; // nft loteria testnet
    address public contractPool = 0xb5Ea6649ddb66cC296A7ee0e07d5B526dbaf01F8; // BRST_TRX testnet

    ITRC20 BRST_Contract = ITRC20(tokenBRST);

    ITRC721 TRC721_Contract = ITRC721(tokenTRC721);

    IPOOL POOL_Contract = IPOOL(contractPool);

    mapping(uint256 => uint256) vaul;

    function buyLoteria(bool _brst, address _user) public payable {

        if(proximaRonda == 0){
            proximaRonda = block.timestamp+periodo;
        }

        //confirmar cantidad de 100 TRX o BRST
        if( !_brst || msg.value == precio ){
            require(msg.value == precio);
            POOL_Contract.staking{value:msg.value}();
            trxPooled = trxPooled.add(msg.value);
            
        }else{
            BRST_Contract.transferFrom(msg.sender, address(this));

        }

        //seleccionar NFT disponible o imprimir NFT
        if(TRC721_Contract.balanceOf(address(this))>0){
            TRC721_Contract.transferFrom(address(this), _user, TRC721_Contract.tokenOfOwnerByIndex(address(this), 0) );
        }else{
            TRC721_Contract.mintLoteryToken(_user);
        }
        
        doneRandom();

    }

    function sellLoteria(bool _brst) public {
        TRC721_Contract.transferFrom(address(this), msg.sender, TRC721_Contract.tokenOfOwnerByIndex(address(this), 0) );
        
        if(_brst){
            BRST_Contract.transfer(msg.sender, precio.mul(1e6).div(POOL_Contract.RATE()) );

        }else{
            payable(msg.sender).transfer(precio);
            trxPooled = trxPooled.sub(precio);

        }


    }

    function premio() public view returns(uint256){
        // consulta cuanto TRX ha ganado hasta el momento 
        return (BRST_Contract.balanceOf(address(this)).mul(POOL_Contract.RATE()).div(1e6)).sub(trxPooled);

    }

    function toBRST(uint256 _value) public view returns(uint256){
        // consulta cuanto TRX ha ganado hasta el momento 
        return _value.mul(POOL_Contract.RATE()).div(1e6);

    }

    function reclamarPremio(uint256 _nft) public {
        uint256 pago = vaul[_nft];
        require(pago > 0); 
        payable(TRC721_Contract.ownerOf(_nft)).transfer(pago);
        trxPooled = trxPooled.sub(pago);

    }

    function sorteo(bool _brst) public returns(uint myNumber){
        uint256 ganado = premio(); //trx

        if(BRST_Contract.allowance(address(this), contractPool) <= 1000 * 1e6){
            BRST_Contract.approve(contractPool, 2**256 - 1);
        }

        require(proximaRonda < block.timestamp);

        if(proximaRonda == 0){
            proximaRonda = block.timestamp+periodo;
        }else{
            proximaRonda = proximaRonda+periodo;
        }

        if(paso > 0){
            myNumber = randMod(paso, block.timestamp);

            //selecciona si es pago en TRX con reclamo o BRST entrega inmediata
            if(_brst){

                BRST_Contract.transfer(TRC721_Contract.ownerOf(myNumber), ganado);

            }else{

                // debe estar por encima de 1 trx o lo equivalente en BRST || opcional
                if(ganado >= umbral){
                    POOL_Contract.solicitudRetiro((ganado.mul(10**6)).div(POOL_Contract.RATE()));// recibo premio en TRX debo convertir a BRST para solicitar retiro

                }

                trxPooled = trxPooled.add(ganado);
                vaul[myNumber] += ganado;

                if(address(this).balance >= vaul[myNumber]){
                    reclamarPremio(myNumber);
                }
            }

            lastWiner = myNumber;
        }

        paso = TRC721_Contract.totalSupply();

    }

    function solicitarTRXBRST(uint256 _valor) public onlyOwner {
        // se solicita con valor en TRX
        POOL_Contract.solicitudRetiro((_valor.mul(10**6)).div(POOL_Contract.RATE()));

    }
  
    function update_tokenTRC721(address _tokenTRC721) public onlyOwner {
        tokenTRC721 = _tokenTRC721;
        TRC721_Contract = ITRC721(_tokenTRC721);
    }

    function update_tokenTRC20(address _tokenBRST) public onlyOwner {
        tokenBRST = _tokenBRST;
        BRST_Contract = ITRC20(_tokenBRST);
    }

    function update_addressPOOL(address _addressPOOL) public onlyOwner {
        contractPool = _addressPOOL;
        POOL_Contract = IPOOL(_addressPOOL);
    }

    function update_precio(uint256 _precio) public onlyOwner {
        precio = _precio;
    }

    //retirar TRC20
    function retiroTRC20(uint256 _value, address _TRC20) public onlyOwner {
        ITRC20(_TRC20).transfer(msg.sender, _value);
    }

    //retirar TRC721
    function retiroTRC20(uint256 _tokenId) public onlyOwner {
        ITRC721(TRC721_Contract).transferFrom(address(this), msg.sender, _tokenId);
    }

    fallback() external payable{}
    receive() external payable{}

}