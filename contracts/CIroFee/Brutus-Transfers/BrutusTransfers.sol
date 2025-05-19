pragma solidity >=0.8.0;
// SPDX-License-Identifier: BSL-1.1

interface TRC20_Interface {
    function totalSupply() external view returns (uint256);
    function decimals() external view returns (uint256);
    function symbol() external view returns (string memory);
    function name() external view returns (string memory);
    function approve(address spender, uint256 value) external returns (bool);
    function allowance(
        address _owner,
        address _spender
    ) external view returns (uint remaining);
    function transferFrom(
        address _from,
        address _to,
        uint _value
    ) external returns (bool);
    function transfer(address direccion, uint cantidad) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
    function issue(uint amount) external;
    function redeem(uint amount) external;
    function transferOwnership(address newOwner) external;
    function reciveOwnership() external;
    function owner() external;
}

contract BrutusTransfers {
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    event AgregateToken(address newToken);
    event DeprecateToken(address oldToken);

    mapping(address => bool) public tokenActive;
    mapping(address => uint256) public feeList;

    address public owner;
    address public tokenTransfers;
    address public reciverFee;
    address tempOwner;
    address[] tokenList;

    address public defaultToken = 0x1f7216b4C3d7e5A8B9C3d7E5A8B9c3D7e5A8B9C3; // USDD
    uint256 public defaultFee = 0.5 * 10 ** 18; // 0.05 USDD

    TRC20_Interface private transfers;

    constructor(address _tokenTransfers) {
        tokenTransfers = _tokenTransfers;
        transfers = TRC20_Interface(_tokenTransfers);
        owner = msg.sender;
        reciverFee = msg.sender;
    }

    function onlyOwner() private view {
        require(owner == msg.sender, "Ownable: caller is not the owner");
    }

    function transferOwnership(address _newAdmin) public {
        onlyOwner();
        tempOwner = _newAdmin;
    }

    function reciveOwnership() public {
        require(msg.sender == tempOwner, "Ownable: caller is not the owner");
        emit OwnershipTransferred(owner, tempOwner);
        owner = msg.sender;
        tempOwner = address(0);
    }

    function updateReciver(address _reciver) public {
        onlyOwner();
        reciverFee = _reciver;
    }

    function addToken(address _token, uint256 _fee) public {
        onlyOwner();
        tokenList.push(_token);
        tokenActive[_token] = true;
        feeList[_token] = _fee;

        emit AgregateToken(_token);
    }

    function pauseToken(address _token) public {
        onlyOwner();
        tokenActive[_token] = tokenActive[_token] ? false : true;
    }

    function removeTokenList(uint256 _id) public {
        onlyOwner();
        delete tokenActive[tokenList[_id]];
        delete feeList[tokenList[_id]];

        emit DeprecateToken(tokenList[_id]);

        tokenList[_id] = tokenList[tokenList.length - 1];
        tokenList.pop();
    }

    function viewTokenList()
        public
        view
        returns (address[] memory, bool[] memory, uint256[] memory)
    {
        uint256 length = tokenList.length;

        // Inicializa arrays en memory
        bool[] memory activeList = new bool[](length);
        uint256[] memory feeArray = new uint256[](length);

        // Llena los arrays con los datos de los mappings
        for (uint256 i = 0; i < length; i++) {
            address token = tokenList[i];
            activeList[i] = tokenActive[token];
            feeArray[i] = feeList[token];
        }

        return (tokenList, activeList, feeArray);
    }

    function updateTokenTransfers(address _token) public {
        onlyOwner();
        tokenTransfers = _token;
    }

    function updateDefaultToken(address _token) public {
        onlyOwner();
        defaultToken = _token;
    }

    function updateDefaultFee(uint256 _fee) public {
        onlyOwner();
        defaultFee = _fee;
    }

    function updateFeeToken(address _token, uint256 _FEE) public {
        onlyOwner();
        feeList[_token] = _FEE;
    }

    function transfer(
        address _to,
        uint256 _value,
        address _token
    ) public returns (bool) {
        return _transfer(_to, _value, _token);
    }

    function _transfer(
        address _to,
        uint256 _value,
        address _token
    ) private returns (bool) {
        (uint256 fee, address tokenFee) = _calculateFee(_token);

        TRC20_Interface(tokenFee).transferFrom(msg.sender, reciverFee, fee);
        TRC20_Interface(_token).transferFrom(msg.sender, _to, _value - fee);

        return true;
    }

    function transferRefer(
        address _to,
        uint256 _value,
        address _token,
        address _reciverFee,
        uint256 _factorFee
    ) public returns (bool) {
        require(_factorFee <= 100, "Factor fee must be <= 100");
        require(_reciverFee != address(0), "Receiver fee cannot be zero address");
        return _transferRefer(_to, _value, _token, _reciverFee, _factorFee);
    }

    function _transferRefer(
        address _to,
        uint256 _value,
        address _token,
        address _reciverFee,
        uint256 _factorFee
    ) private returns (bool) {

        (uint256 baseFee, address tokenFee) = _calculateFee(_token);
        uint256 fee = (baseFee * _factorFee) / 100;

        TRC20_Interface feeToken = TRC20_Interface(tokenFee);
        TRC20_Interface mainToken = TRC20_Interface(_token);

        transfers.transferFrom(_reciverFee, reciverFee, 1);
 
        feeToken.transferFrom(msg.sender, _reciverFee, fee);
        mainToken.transferFrom(msg.sender, _to, _value - fee);

        return true;
    }

    function multiTransfer(
        address[] calldata _to,
        uint256[] calldata _value,
        address[] calldata _token
    ) public returns (bool[] memory) {
        require(
            _to.length == _value.length && _to.length == _token.length,
            "The arrays must be the same length"
        );
        return _multiTransfer(_to, _value, _token);
    }

    function _multiTransfer(
        address[] calldata _to,
        uint256[] calldata _value,
        address[] calldata _token
    ) private returns (bool[] memory results) {
        
        results = new bool[](_to.length);

        for (uint256 index = 0; index < _to.length; index++) {
            results[index] = _transfer(
                _to[index],
                _value[index],
                _token[index]
            );
        }
    }

    function calculateFee(
        address _token
    ) public view returns (uint256, address) {
        return _calculateFee(_token);
    }

    function _calculateFee(
        address _token
    ) private view returns (uint256 fee, address token) {
        fee = feeList[_token];
        if (fee == 0) {
            return (defaultFee, defaultToken);
        } else {
            if(transfers.balanceOf(msg.sender) > 0){
                return (1, tokenTransfers);

            }else{
                return (fee, _token);
            }
        }
    }

    function buyTransfers(uint256 _amount) public {

        uint256 _value = _amount* defaultFee * 10 ** transfers.decimals();

        TRC20_Interface(defaultToken).transferFrom(msg.sender, reciverFee, _value);
        transfers.issue(_amount);
        transfers.transfer(msg.sender, _amount);
    }

    function getTransfers(uint256 _amount) public{
        onlyOwner();
        transfers.issue(_amount);
        transfers.transfer(owner, _amount);
    }

    function burnTransfers(uint256 _amount) public {
        onlyOwner();
        transfers.transferFrom(msg.sender, address(this), _amount);
        transfers.redeem(_amount);
    }

    function changeTransfers(address _newToken) public {
        onlyOwner();
        transfers.transferOwnership(_newToken);
    }

    function reciveTransfers() public {
        onlyOwner();
        transfers.reciveOwnership();
    }

    function redimirToken(address _token) public returns (uint256 valor) {
        onlyOwner();
        valor = TRC20_Interface(_token).balanceOf(address(this));
        TRC20_Interface(_token).transfer(owner, valor);
    }

    function redimirUSDT02(uint _value, address _token) public {
        onlyOwner();
        TRC20_Interface(_token).transfer(owner, _value);
    }

    function redimTRX() public {
        onlyOwner();
        if (address(this).balance == 0) revert();
        payable(owner).transfer(address(this).balance);
    }

    function redimTRX(uint _value) public {
        onlyOwner();
        if (address(this).balance < _value) revert();
        payable(owner).transfer(_value);
    }

    fallback() external payable {}
    receive() external payable {}
}
