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

interface TRC20_Interface {

  function allowance(address _owner, address _spender) external view returns (uint256);
  function approve(address _spender, uint _value) external returns (bool);
  function transferFrom(address _from, address _to, uint _value) external returns (bool);
  function transfer(address direccion, uint cantidad) external returns (bool);
  function balanceOf(address who) external view returns (uint256);
  function decimals() external view returns (uint256);
  function totalSupply() external view returns (uint256);
  function issue(uint amount) external;
  function redeem(uint amount) external;
  function transferOwnership(address newOwner) external;

}

interface IPOOL {
    function RATE() external view returns (uint256);
}

interface FASTPOOL {
    function sell_token_2(uint256 _value_t2) external payable;
    function sell_token_2_to(uint256 _value_t2, address _to) external payable returns(bool);
}

contract Storage {

    mapping (address => bool) public isBlackListed;
    mapping (address => uint256) internal _balances;
    mapping (address => mapping (address => uint256)) internal _allowances;

    uint256 internal _totalSupply;

    bool public iniciado;

    address public owner;
    address public token_brst;
    address public contract_pool;
    address public contract_fast_pool;

}

contract Owner is Storage {

    event newOwner(address indexed _user);
    event AddedBlackList(address indexed _user);
    event RemovedBlackList(address indexed _user);

    function onlyOwner() internal view{
        require(msg.sender == owner);
    }

    function setOwner(address _newOwner) public{
        onlyOwner();
        owner = _newOwner;
        emit newOwner(owner);
    }

    function addBlackList (address _evilUser) public  {
        onlyOwner();
        isBlackListed[_evilUser] = true;
        emit AddedBlackList(_evilUser);
    }

    function removeBlackList (address _clearedUser) public {
        onlyOwner();
        isBlackListed[_clearedUser] = false;
        emit RemovedBlackList(_clearedUser);
    }

}

contract BTC_S is Owner {
    using SafeMath for uint256;

    string public name = "Bitcoin Staking";
    string public symbol = "BTC-S";
    uint8 public decimals = 8;

    uint256 public price  = 1; //sat0chi

    event DestroyedBlackFunds(address indexed _blackListedUser, uint _balance);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    event Staking(address indexed user, uint256 tron, uint256 date);

    constructor(){

    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply.mul(price).div(10**decimals);
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account].mul(price).div(10**decimals);
    }

    function balanceOfBRST(address account) public view returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        require(amount>0);
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 value) public returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        require(amount>0);
        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, _allowances[sender][msg.sender].sub(amount));
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        require(addedValue>0);
        _approve(msg.sender, spender, _allowances[msg.sender][spender].add(addedValue));
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        require(subtractedValue>0);
        _approve(msg.sender, spender, _allowances[msg.sender][spender].sub(subtractedValue));
        return true;
    }

    function issue(uint amount) public {
        onlyOwner();
        require(amount>0);
        _mint(msg.sender, amount);
    }
        
    function redeem(uint amount) public {
        onlyOwner();
        require(amount>0);
        _burn(msg.sender, amount);
    }

    function setPrice(uint256 _newPrice) public{
        price = _newPrice;
    }

    function destroyBlackFunds (address _blackListedUser) public {
        onlyOwner();
        require(isBlackListed[_blackListedUser]);
        uint dirtyFunds = balanceOf(_blackListedUser);
        _burnFrom(_blackListedUser, dirtyFunds);
        emit DestroyedBlackFunds(_blackListedUser, dirtyFunds);
    }

    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(!isBlackListed[sender]&&!isBlackListed[recipient]);
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _balances[sender] = _balances[sender].sub(amount);
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");

        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);
        emit Staking(account, amount,block.timestamp);

    }

    function _burn(address account, uint256 value) internal {
        require(account != address(0), "ERC20: burn from the zero address");

        _totalSupply = _totalSupply.sub(value);
        _balances[account] = _balances[account].sub(value);
        emit Transfer(account, address(0), value);
    }

    function _approve(address owner, address spender, uint256 value) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function _burnFrom(address account, uint256 amount) internal {
        _burn(account, amount);
        _approve(account, msg.sender, _allowances[account][msg.sender].sub(amount));
    }

    // aditional personal functions

    function inicializar (string memory __name, string memory __symbol, uint8 __decimals) public{

        require(!iniciado);
        owner = msg.sender;
        iniciado = true;
        name = __name;
        symbol = __symbol;
        decimals = __decimals;
    
    }

    function updateName(string memory _name) public{
        name = _name;
    }

    function updateSymbol(string memory _symbol) public{
        symbol = _symbol;
    }

    function updateToken_brst(address token) public{
        token_brst = token;
    }

    function updateContract_pool(address contrato)public{
        contract_pool = contrato;
    }

    function updateContract_fast_pool(address contrato)public{
        contract_fast_pool = contrato;
    }

    function staking(uint256 amount) public payable{
        require(amount>0);
        TRC20_Interface(token_brst).transferFrom(msg.sender, address(this), amount);
        _mint(msg.sender, amount); 
    }

    function unStaking(uint256 amount) public payable{
        require(amount>0);
        TRC20_Interface(token_brst).transfer(msg.sender, amount);
        _burn(msg.sender, amount);
    }

    function claimReward(uint256 amount) public payable{
        if(TRC20_Interface(token_brst).allowance(address(this), contract_fast_pool) < amount){
            TRC20_Interface(token_brst).approve(contract_fast_pool, 2**256-1);
        }
        FASTPOOL(contract_fast_pool).sell_token_2_to(amount,msg.sender);
        _burn(msg.sender, amount);

    }

}
