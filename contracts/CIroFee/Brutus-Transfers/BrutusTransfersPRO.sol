pragma solidity >=0.8.20;
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
}

contract BrutusTransfersPRO {

    event AgregateToken(address indexed newToken);
    event DeprecateToken(address indexed oldToken);
    event UpdateToken(address indexed token, uint256 fee);
    event UpdateReciver(address indexed reciver);
    event UpdateDefaultToken(address indexed token);
    event UpdateDefaultFee(uint256 fee);

    mapping(address => uint256) private feeList;

    address[] private tokenList;

    address private immutable _owner;

    address private _defaultToken = 0xE91A7411e56Ce79E83570570f49B9FC35B7727c5;
    uint256 private _defaultFee = 0.5 * 10 ** 18;

    address private _receiverFee;

    address private constant _brutusToken = 0x86aAD1e25364A61bEE549791b52b30E46c80043f;

    constructor() {
        _owner = msg.sender;
        _receiverFee = msg.sender;
    }

    modifier onlyOwner() {
        require(_owner == msg.sender, "Caller is not the owner");
        _;
    }

    function updateReciver(address _reciver) public onlyOwner {
        _receiverFee = _reciver;
        emit UpdateReciver(_reciver);
    }

    function viewParameters()
        public
        view
        returns (
            address owner,
            address defaultToken,
            uint256 defaultFee,
            address receiverFee
        )
    {
        return (_owner, _defaultToken, _defaultFee, _receiverFee);
    }

    function addToken(address _token, uint256 _fee) public onlyOwner {
        tokenList.push(_token);
        feeList[_token] = _fee;

        emit AgregateToken(_token);
    }


    function removeTokenList(uint256 _id) public onlyOwner {
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

        bool[] memory activeList = new bool[](length);
        uint256[] memory feeArray = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            feeArray[i] = feeList[tokenList[i]];
        }

        return (tokenList, activeList, feeArray);
    }

    function updateDefaultToken(address _token) public onlyOwner {
        _defaultToken = _token;
        emit UpdateDefaultToken(_token);
    }

    function updateDefaultFee(uint256 _fee) public onlyOwner {
        _defaultFee = _fee;
        emit UpdateDefaultFee(_fee);
    }

    function updateFeeToken(address _token, uint256 _FEE) public onlyOwner {
        feeList[_token] = _FEE;
        emit UpdateToken(_token, _FEE);
    }

    function _getFee(address _token) private view returns (uint256) {
        return feeList[_token];
    }

    function transfer(address _to, uint256 _value, address _token) public {
        uint256 fee = _getFee(_token);
        TRC20_Interface(fee == 0 ? _defaultToken : _token).transferFrom(
            msg.sender,
            _receiverFee,
            fee == 0 ? _defaultFee : fee
        );
        TRC20_Interface(_token).transferFrom(msg.sender, _to, _value - fee);
    }

    function transferV2(
        address _to,
        uint256 _value,
        address _token
    ) public {
        TRC20_Interface(_brutusToken).transferFrom(msg.sender, _receiverFee, 1);
        TRC20_Interface(_token).transferFrom(msg.sender, _to, _value);
    }

    function multiTransfer(
        address[] calldata _to,
        uint256[] calldata _value,
        address[] calldata _token
    ) public {
        require(_to.length == _value.length && _to.length == _token.length, "Arrays length mismatch");
        require(_value.length > 0, "At least one transfer required");
        require(_to.length <= 10, "Too many recipients");
        TRC20_Interface(_brutusToken).transferFrom(
            msg.sender,
            _receiverFee,
            _to.length
        );

        for (uint256 index = 0; index < _to.length; index++) {
            TRC20_Interface(_token[index]).transferFrom(
                msg.sender,
                _to[index],
                _value[index]
            );
        }
    }

    function redimirToken(address _token) public onlyOwner {
        TRC20_Interface(_token).transfer(
            _owner,
            TRC20_Interface(_token).balanceOf(address(this))
        );
    }

    function redimirTokenV2(uint _value, address _token) public onlyOwner {
        TRC20_Interface(_token).transfer(_owner, _value);
    }

    function redimTrx() public onlyOwner {
        if (address(this).balance == 0) revert();
        payable(_owner).transfer(address(this).balance);
    }

    function redimTrxV2(uint _value) public onlyOwner {
        if (address(this).balance < _value) revert();
        payable(_owner).transfer(_value);
    }

    fallback() external payable {}
    receive() external payable {}
}
