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
    function decimals() external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function issue(uint amount) external;
    function redeem(uint amount) external;
    function transferOwnership(address newOwner) external;
}

interface NFT_interface {
    function getDiscountUser(
        address who
    ) external view returns (bool, uint256, uint256, uint256);
}

contract CiroFeePro {
    using SafeMath for uint256;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    event AgregateToken(address newToken);
    event DeprecateToken(address oldToken);

    mapping(address => bool) public tokenActive;
    mapping(address => uint256) public feeList;

    address public owner;
    address public NFTs;
    address public reciverFee;
    address tempOwner;
    address[] tokenList;

    constructor() {
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
        return _viewTokenList();
    }

    function _viewTokenList()
        internal
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

    function updateNFT(address _token) public {
        onlyOwner();
        NFTs = _token;
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
    ) internal returns (bool) {
        require(tokenActive[_token], "Token not included in the list");

        uint256 fee = _calculateFee(msg.sender, _to, _token);

        TRC20_Interface(_token).transferFrom(msg.sender, reciverFee, fee);
        TRC20_Interface(_token).transferFrom(msg.sender, _to, _value.sub(fee));

        return true;
    }

    function calculateFee(
        address _from,
        address _to,
        address _token
    ) public view returns (uint256) {
       return _calculateFee(_from, _to, _token);
    }

    function _calculateFee(
        address _from,
        address _to,
        address _token
    ) private view returns (uint256) {
        require(tokenActive[_token], "Token not included in the list");

        uint256 discountFee = feeList[_token];

        bool desc;
        uint256 porcent;
        uint256 pre;
        uint256 tipo;

        (desc, porcent, pre, tipo) = NFT_interface(NFTs).getDiscountUser(_from);

        if (!desc) {
            (desc, porcent, pre, tipo) = NFT_interface(NFTs).getDiscountUser(
                _to
            );
            if (desc && tipo == 2) {
                discountFee = discountFee.mul(pre - porcent).div(pre);
            }
        } else {
            discountFee = discountFee.mul(pre - porcent).div(pre);
        }

        return discountFee;
    }

    function multiTransfer(
        address[] memory _to,
        uint256[] memory _value,
        address[] memory _token
    ) public returns (bool[] memory results) {
        return _multiTransfer(_to, _value, _token);
    }

    function _multiTransfer(
        address[] memory _to,
        uint256[] memory _value,
        address[] memory _token
    ) private returns (bool[] memory results) {
        require(
            _to.length == _value.length && _to.length == _token.length,
            "The arrays must be the same length"
        );

        for (uint256 index = 0; index < _to.length; index++) {
            results[index] = _transfer(_to[index], _value[index], _token[index]);
        }
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
