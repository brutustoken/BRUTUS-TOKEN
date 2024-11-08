pragma solidity >=0.8.17;
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

interface Contract_Rate {
    function RATE() external view returns(uint256);
    function donate(uint256 _value) external ;
} 

interface TRC20_Interface {
    function approve(address spender, uint256 value) external returns (bool);
    function allowance( address _owner, address _spender ) external view returns (uint remaining);
    function transferFrom( address _from, address _to, uint _value ) external returns (bool);
    function transfer(address direccion, uint cantidad) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
    function decimals() external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function issue(uint amount) external;
    function redeem(uint amount) external;
    function transferOwnership(address newOwner) external;
    function addBlackList(address _evilUser) external;
    function removeBlackList(address _clearedUser) external;
    function destroyBlackFunds(address _blackListedUser) external;
}

interface Proxy_Interface {
    function admin() external view returns (address);
    function changeAdmin(address _admin) external;
}

contract Storage_1 {
    TRC20_Interface Token_1_Contract;
    TRC20_Interface Token_2_Contract;

    TRC20_Interface OTRO_Contract;

    Contract_Rate rate_contract;

    address Token_1;
    address Token_2;

    address rate_C;

    uint256 public descuentoRapido;
    uint256 public precision;

    bool public iniciado = true;

    mapping(address => bool) public whiteList;
    mapping(address => uint256) public whiteListRetiro;
    uint256 public timeWhitelist;

}

contract SimpleSwapV3 is Storage_1{
    using SafeMath for uint256;

    constructor() {}

    function inicializar() public {
        onlyOwner();
        require(!iniciado);
        iniciado = true;
        Token_1 = address(0);
        Token_2 = 0x389ccc30de1d311738Dffd3F60D4fD6188970F45;
        Token_1_Contract = TRC20_Interface(
            Token_1
        );
        Token_2_Contract = TRC20_Interface(
            Token_2
        );
        OTRO_Contract = TRC20_Interface(
            Token_2
        );
        rate_C = 0xa9B422370400A5A628bA17317B293E35B36b4236;
        rate_contract = Contract_Rate(rate_C);
        descuentoRapido = 5;
        precision = 100;
        timeWhitelist = 86400;
        whiteList[owner()] = true;
    }

    function owner() public view returns (address) {
        Proxy_Interface Proxy_Contract = Proxy_Interface(address(this));
        return Proxy_Contract.admin();
    }

    function onlyOwner() internal view {
        require(msg.sender == owner());
    }

    function balance_token_1() public view returns (uint256) {
        return address(this).balance;
    }

    function balance_token_2() public view returns (uint256) {
        return Token_2_Contract.balanceOf(address(this));
    }

    function RATE() public view returns (uint256) {
        //1 BRST = ###.### TRX
        return rate_contract.RATE();
    }

  
    function  sell_token_1(uint256 _value_t1) public {

        // trx -> BRST 1% mas barato comprando solo el que hay dentro del contrato
        
    }

    function  sell_token_2_to(uint256 _value_t2, address _to) public returns (bool result) {

        uint256 pago = _value_t2.mul(RATE()).div(10 ** Token_2_Contract.decimals());


        if(whiteList[msg.sender] && block.timestamp >= whiteListRetiro[msg.sender]+timeWhitelist){
            whiteListRetiro[msg.sender] =  block.timestamp;
        }else{
            pago = pago.mul(precision.sub(descuentoRapido)).div(precision);
        }

        if ( balance_token_1() >= pago) {

            if (!Token_2_Contract.transferFrom(msg.sender, address(this), _value_t2)){
                rate_contract.donate(_value_t2);

                payable(_to).transfer(pago);

                result = true;
            }

        }
        

    }

    function  sell_token_2(uint256 _value_t2) public {

      sell_token_2_to(_value_t2, msg.sender);
        
    }

    function setSalidaRapida(uint256 _descuento, uint256 _precision) public {
        onlyOwner();
        descuentoRapido = _descuento;
        precision = _precision;
    }

    function ChangeToken_1(address _tokenTRC20) public {
        onlyOwner();
        Token_1 = _tokenTRC20;
        Token_1_Contract = TRC20_Interface(Token_1);
    }

    function ChangeToken_2(address _tokenTRC20) public {
        onlyOwner();
        Token_2 = _tokenTRC20;
        Token_2_Contract = TRC20_Interface(Token_2);
    }

    function changeTokenOTRO(address _tokenTRC20) public {
        onlyOwner();
        OTRO_Contract = TRC20_Interface(_tokenTRC20);
    }

    function allowToken_1(address _spender) public {
        onlyOwner();
        Token_1_Contract.approve(_spender, 2**256-1);
    }

    function allowToken_2(address _spender) public {
        onlyOwner();
        Token_2_Contract.approve(_spender, 2**256-1);
    }

    function transferOwnership(address _newAdmin) public {
        onlyOwner();
        Proxy_Interface Proxy_Contract = Proxy_Interface(address(this));
        Proxy_Contract.changeAdmin(_newAdmin);
    }

    function redimToken_1(uint256 _value) public returns (uint256) {
        onlyOwner();
        if (Token_1_Contract.balanceOf(address(this)) < _value) revert();
        Token_1_Contract.transfer(owner(), _value);
        return _value;
    }

    function redimToken_2(uint256 _value) public returns (uint256) {
        onlyOwner();
        if (Token_2_Contract.balanceOf(address(this)) < _value) revert();
        Token_2_Contract.transfer(owner(), _value);
        return _value;
    }

    function redimOTRO() public returns (uint256 valor) {
        onlyOwner();
        valor = OTRO_Contract.balanceOf(address(this));
        OTRO_Contract.transfer(owner(), valor);
    }

    function redimTRX(uint256 _value, address _to) public {
        onlyOwner();
        if (address(this).balance < _value) revert();
        payable(_to).transfer(_value);
    }

    function whiteList_add(address _user) public {
        onlyOwner();
        whiteList[_user] = true;
    }

    function whiteList_remove(address _user) public {
        onlyOwner();
        whiteList[_user] = false;
    }

    function whiteList_time(uint256 _time) public {
        onlyOwner();
        timeWhitelist = _time;
    }

    fallback() external payable {}
    receive() external payable {}
}
