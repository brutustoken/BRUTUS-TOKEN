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

contract StorageV1 {
    TRC20_Interface Token_1_Contract;
    TRC20_Interface Token_2_Contract;

    TRC20_Interface OTRO_Contract;

    address public Token_1; // USDT
    address public Token_2; // BRUT

    uint256 internal rate; // USDT

    bool internal iniciado = true;

    address internal updater;

}

contract SimpleSwapV4 is StorageV1{
    using SafeMath for uint256;

    event BuyToken (address indexed user, uint256 amount, uint256 rate);
    event SellToken (address indexed user, uint256 amount, uint256 rate);

    constructor() {}

    function inicializar(address _token_1, address _token_2) public {
        onlyOwner();
        require(!iniciado);
        updater = msg.sender;
        iniciado = true;
        Token_1 = _token_1;
        Token_2 = _token_2;
        Token_1_Contract = TRC20_Interface(
            _token_1
        );
        Token_2_Contract = TRC20_Interface(
            _token_2
        );
        OTRO_Contract = TRC20_Interface(
            _token_2
        );
    }

    function owner() public view returns (address) {
        Proxy_Interface Proxy_Contract = Proxy_Interface(address(this));
        return Proxy_Contract.admin();
    }

    function onlyOwner() internal view {
        require(msg.sender == owner());
    }

    function balance_token_1() public view returns (uint256) {
        return Token_1_Contract.balanceOf(address(this));
    }

    function balance_token_2() public view returns (uint256) {
        return Token_2_Contract.balanceOf(address(this));
    }

    function RATE() public view returns (uint256) {
        return rate;
    }

    function ChangeRate(uint256 _rate) public {
        require(msg.sender == updater || msg.sender == owner(), "Not authorized");
        rate = _rate;
    }

    function updaterRate(address _updater) public{
        onlyOwner();
        updater = _updater;
    }

    function  buy_token(uint256 _value_t1,address _to) public {

        //USDT -> BRUT

        uint256 pago = _value_t1.mul(10 ** Token_1_Contract.decimals()).div(rate);
        Token_1_Contract.transferFrom(msg.sender, address(this), _value_t1);

        Token_2_Contract.issue(pago);
        Token_2_Contract.transfer(_to, pago);

        emit BuyToken(msg.sender, pago, rate);

    }

    function  sell_token(uint256 _value_t2, address _to) public {

        // BRUT -> USDT

        uint256 pago = _value_t2.mul(rate).div(10 ** Token_2_Contract.decimals());
        require(balance_token_1() >= pago,"balance token 1: insuficiente");

        Token_2_Contract.transferFrom(msg.sender, address(this), _value_t2);
        Token_2_Contract.redeem(_value_t2);

        Token_1_Contract.transfer(_to, pago);

        emit SellToken(msg.sender, pago, rate);

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

    function createToken(address _token, uint256 _value) public {
        onlyOwner();
        TRC20_Interface(_token).issue(_value);
    }

    function burnToken(address _token, uint256 _value) public {
        onlyOwner();
        TRC20_Interface(_token).redeem(_value);
    }

    function changeTokenOTRO(address _tokenTRC20) public {
        onlyOwner();
        OTRO_Contract = TRC20_Interface(_tokenTRC20);
    }

    function allowToken(address _token, address _spender) public {
        onlyOwner();
        TRC20_Interface(_token).approve(_spender, 2**256-1);
    }

    function transferOwnership_proxy(address _newAdmin) public {
        onlyOwner();
        Proxy_Interface Proxy_Contract = Proxy_Interface(address(this));
        Proxy_Contract.changeAdmin(_newAdmin);
    }

    function transferOwnership_token(address _token, address _newAdmin) public {
        onlyOwner();
        TRC20_Interface(_token).transferOwnership(_newAdmin);
    }

    function redimToken(address _token, uint256 _value) public {
        onlyOwner();
        TRC20_Interface(_token).transfer(owner(), _value);
    }

     function redimToken(address _token) public {
        onlyOwner();
        TRC20_Interface(_token).transfer(owner(), TRC20_Interface(_token).balanceOf(address(this)));
    }

    function redimTRX(uint256 _value, address _to) public {
        onlyOwner();
        if (address(this).balance < _value) revert();
        payable(_to).transfer(_value);
    }

    fallback() external payable {}
    receive() external payable {}
}
