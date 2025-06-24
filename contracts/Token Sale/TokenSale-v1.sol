// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface TRC20_Interface {
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
    function decimals() external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function issue(uint256 amount) external;
    function redeem(uint256 amount) external;
    function transferOwnership(address newOwner) external;
    function reciveOwnership() external;
}

contract TokenSaleImplementation {
    address public owner;
    address public paymentWallet;
    TRC20_Interface public paymentToken; 
    TRC20_Interface public saleToken;    

    struct Package {
        uint256 amount; 
        uint256 price;  
    }

    mapping(uint256 => Package) public packages;

    modifier onlyOwner() {
        require(msg.sender == owner, "No autorizado");
        _;
    }

    function initialize(address _usddToken, address _saleToken) external {
        require(owner == address(0), "Ya inicializado");
        owner = msg.sender;
        paymentToken = TRC20_Interface(_usddToken);
        saleToken = TRC20_Interface(_saleToken);
    }

    function setPackage(uint256 id, uint256 amount, uint256 price) external onlyOwner {
        require(amount > 0 && price > 0, "Valores invalidos");
        packages[id] = Package(amount, price);
    }

    function deletePackage(uint256 id) external onlyOwner {
        delete packages[id];
    }

    function buy(uint256 packageId) external {
        Package memory p = packages[packageId];
        require(p.amount > 0, "Paquete inexistente");

        require(paymentToken.transferFrom(msg.sender, paymentWallet, p.price), "Pago paquete fallido");

        saleToken.issue(p.amount);

        require(saleToken.transfer(msg.sender, p.amount), "Entrega de token fallida");
    }

    function issueTokens(uint256 amount) external onlyOwner {
        saleToken.issue(amount);
    }

    function burnTokens(uint256 amount) external onlyOwner {
        saleToken.redeem(amount);
    }

    function changeSaleToken(address newToken) external onlyOwner {
        saleToken = TRC20_Interface(newToken);
    }

    function changeSaleTokenOwner(address newOwner) external onlyOwner {
        saleToken.transferOwnership(newOwner);
    }

    function reciveSaleTokenOwnership() external onlyOwner {
        saleToken.reciveOwnership();
    }

    function changePaymentWallet(address newPaymentwallet) external onlyOwner {
        paymentWallet = newPaymentwallet;
    }

    function withdrawSupport(address to, uint256 amount, address use_token) external onlyOwner {
        require(TRC20_Interface(use_token).transfer(to, amount), "Retiro token fallido");
    }

    function changeOwner(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    fallback() external payable {}
    receive() external payable {}
}
