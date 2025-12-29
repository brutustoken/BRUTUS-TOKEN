pragma solidity >=0.8.0;
// SPDX-License-Identifier: Apache-2.0

contract Ownable {
    address public owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

contract BlackList is Ownable {
    mapping(address => bool) public isBlackListed;

    event AddedBlackList(address indexed _user);
    event RemovedBlackList(address indexed _user);

    function addBlackList(address _evilUser) public onlyOwner {
        require(
            _evilUser != address(0),
            "BlackList: cannot blacklist zero address"
        );
        isBlackListed[_evilUser] = true;
        emit AddedBlackList(_evilUser);
    }

    function removeBlackList(address _clearedUser) public onlyOwner {
        require(
            _clearedUser != address(0),
            "BlackList: cannot remove zero address"
        );
        isBlackListed[_clearedUser] = false;
        emit RemovedBlackList(_clearedUser);
    }
}

contract TRC20 is BlackList {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string public name = "TRC20 Token";
    string public symbol = "TRC20";
    uint8 public decimals = 18;

    event DestroyedBlackFunds(address indexed _blackListedUser, uint _balance);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        require(amount > 0, "TRC20: amount must be greater than 0");
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(
        address owner,
        address spender
    ) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 value) public returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public returns (bool) {
        require(amount > 0, "TRC20: amount must be greater than 0");
        _transfer(sender, recipient, amount);

        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(currentAllowance >= amount, "TRC20: insufficient allowance");
        _approve(sender, msg.sender, currentAllowance - amount);

        return true;
    }

    function increaseAllowance(
        address spender,
        uint256 addedValue
    ) public returns (bool) {
        require(addedValue > 0, "TRC20: added value must be greater than 0");
        _approve(
            msg.sender,
            spender,
            _allowances[msg.sender][spender] + addedValue
        );
        return true;
    }

    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    ) public returns (bool) {
        require(
            subtractedValue > 0,
            "TRC20: subtracted value must be greater than 0"
        );
        uint256 currentAllowance = _allowances[msg.sender][spender];
        require(
            currentAllowance >= subtractedValue,
            "TRC20: decreased allowance below zero"
        );
        _approve(msg.sender, spender, currentAllowance - subtractedValue);
        return true;
    }

    function issue(uint amount) public onlyOwner {
        require(amount > 0, "TRC20: amount must be greater than 0");
        _mint(msg.sender, amount);
    }

    function redeem(uint amount) public onlyOwner {
        require(amount > 0, "TRC20: amount must be greater than 0");
        _burn(msg.sender, amount);
    }

    function destroyBlackFunds(address _blackListedUser) public onlyOwner {
        require(
            isBlackListed[_blackListedUser],
            "TRC20: address is not blacklisted"
        );
        uint dirtyFunds = balanceOf(_blackListedUser);
        require(dirtyFunds > 0, "TRC20: no funds to destroy");

        _burnFromBlackList(_blackListedUser, dirtyFunds);
        emit DestroyedBlackFunds(_blackListedUser, dirtyFunds);
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        require(!isBlackListed[sender], "TRC20: sender is blacklisted");
        require(!isBlackListed[recipient], "TRC20: recipient is blacklisted");
        require(sender != address(0), "TRC20: transfer from the zero address");
        require(recipient != address(0), "TRC20: transfer to the zero address");
        require(_balances[sender] >= amount, "TRC20: insufficient balance");

        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "TRC20: mint to the zero address");

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    function _burn(address account, uint256 value) internal {
        require(account != address(0), "TRC20: burn from the zero address");
        require(
            _balances[account] >= value,
            "TRC20: insufficient balance to burn"
        );

        _totalSupply -= value;
        _balances[account] -= value;
        emit Transfer(account, address(0), value);
    }

    function _burnFromBlackList(address account, uint256 amount) internal {
        require(account != address(0), "TRC20: burn from the zero address");
        require(
            _balances[account] >= amount,
            "TRC20: insufficient balance to destroy"
        );

        _totalSupply -= amount;
        _balances[account] -= amount;
    }

    function _approve(address owner, address spender, uint256 value) internal {
        require(owner != address(0), "TRC20: approve from the zero address");
        require(spender != address(0), "TRC20: approve to the zero address");

        _allowances[owner][spender] = value;
        emit Approval(owner, spender, value);
    }
}

contract TRC20Detailed is TRC20 {
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _mint(msg.sender, initialSupply * 10 ** uint256(decimals));
    }
}
