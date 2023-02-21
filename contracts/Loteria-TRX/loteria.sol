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

interface ITRC20 {
    function balanceOf(address owner) external view returns(uint256);
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
       
       return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce, _moreRandom))) % _modulus;
    }

    function doneRandom() public {
       randNonce++; 
    }
}

contract Lottery is RandomNumber, Ownable{

    using SafeMath for uint256;

    uint256 public precio = 100 * 10**6;

    uint256 public trxPooled;

    uint256 public proximaRonda = 0;
    uint256 public periodo = 15*86400;

    address public tokenBRST = 0xebb9bf74543Fb8b86DEd187eD2Ca38e01840d592;

    address public tokenTRC721 = 0xebb9bf74543Fb8b86DEd187eD2Ca38e01840d592;
    address public contractPool = 0xebb9bf74543Fb8b86DEd187eD2Ca38e01840d592;

    ITRC20 BRST_Contract = ITRC20(tokenBRST);

    ITRC721 TRC721_Contract = ITRC721(tokenTRC721);

    IPOOL POOL_Contract = IPOOL(contractPool);

    function buyLoteria() public payable {

        if(proximaRonda == 0){
            proximaRonda = block.timestamp+periodo;
        }

        //confirmar cantidad de 100 TRX

        require(msg.value == precio);

        // comprar BRST y registrar cuanto TRX ingresó

        POOL_Contract.staking{value:msg.value}();

        //seleccionar NFT disponible o imprimir NFT

        if(TRC721_Contract.balanceOf(address(this))>0){
            TRC721_Contract.transferFrom(address(this), msg.sender, TRC721_Contract.tokenOfOwnerByIndex(address(this), 0) );
        }else{
            TRC721_Contract.mintLoteryToken(msg.sender);
        }
        
        doneRandom();

    }

    function premio() public view returns(uint256){

        // consulta cuanto TRX ha ganado hasta el momento 

        return (BRST_Contract.balanceOf(address(this)).mul(POOL_Contract.RATE()).div(10e6)).sub(trxPooled);
         

    }

    function reclamarPremio() public {

        // consulta cuanto TRX ha ganado hasta el momento 
        //y los reclama si no hay disponible le dice intenta mas tarde

        payable(msg.sender).transfer(100);

    }

    function sorteo() public {

        //verificar que si tenha allowed el BRST para transacciones

        //seguro de tiempo, administrador

        if(proximaRonda == 0){
            proximaRonda = block.timestamp+periodo;
        }else{
            proximaRonda = proximaRonda+periodo;
        }

        //      cantidad de tickets || tiempo
        uint256 myNumber = randMod(TRC721_Contract.totalSupply(), block.timestamp);

        //consulta cuanto se ha ganado hasta el momento y se pone en venta el BRST

        POOL_Contract.solicitudRetiro(premio());// recibo premio en TRX debo convertir a BRST para solicitar retiro

        //busca al dueño del nft que gano y se le asignan los TRX virtuales
        TRC721_Contract.ownerOf(myNumber);
        

    }

  
    function update_tokenTRC721(address _tokenTRC721) public onlyOwner returns(bool){
        tokenTRC721 = _tokenTRC721;
        TRC721_Contract = ITRC721(_tokenTRC721);
        return true;
    }

    function update_precio(uint256 _precio) public onlyOwner returns(bool){
        precio = _precio;
        return true;
    }

}