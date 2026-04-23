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

library RandomNumber {
    struct Data {
        uint256 numero;
    }

    function randMod(
        uint256 _modulus,
        uint256 _moreRandom,
        uint256 _randNonce
    ) internal view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        msg.sender,
                        _moreRandom,
                        _randNonce
                    )
                )
            ) % _modulus;
    }
}

interface ITRC20 {
    function balanceOf(address owner) external view returns (uint256);
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
    function decimals() external view returns (uint256);
}

interface ITRC721 {
    function baseURI() external view returns (string memory);
    function totalSupply() external view returns (uint256);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external view returns (address);
    function balanceOf(address from) external view returns (uint256);
    function tokenOfOwnerByIndex(
        address owner,
        uint256 index
    ) external view returns (uint256);
    function mintLoteryToken(address to) external returns (bool);
}

interface IPOOL {
    function staking() external payable returns (uint256);
    function solicitudRetiro(uint256 _value) external returns (bool, uint256);
    function retirar(uint256 _id) external returns (bool);
    function RATE() external view returns (uint256);
    function completada(uint256 _id) external view returns (bool);
    function retirarFrom(address _user) external returns (bool exitoso);
    function todasSolicitudes(
        address _user
    ) external view returns (uint256[] memory);
}

interface FASTPOOL {
    function  sell_token_2(uint256 _value_t2) external payable;
}

interface Proxy_Interface {
    function admin() external view returns (address);
    function changeAdmin(address _admin) external;
}

contract LotteryV2 {
    using SafeMath for uint256;

    RandomNumber.Data randNonce;

    uint256 public precio;

    uint256 public trxPooled;

    uint256 public paso;
    uint256 public lastWiner;

    uint256 public beneficio;
    uint256 public precicion;
    address public walletTeam;
    uint256 public toTeam;

    uint256 public proximaRonda;
    uint256 public periodo;

    address public tokenBRST;
    address public tokenTRC721;
    address public contractPool;

    ITRC20 BRST_Contract;
    ITRC721 TRC721_Contract;
    IPOOL POOL_Contract;

    mapping(uint256 => uint256) vaul;

    bool public iniciado = true;

    FASTPOOL FAST_Contract;
    address public contractFastPool;

    constructor() {}

    function inicializar() public {
        onlyOwner();
        require(!iniciado);
        iniciado = true;
        precio = 100 * 1e6;
        beneficio = 20;
        precicion = 100;
        walletTeam = 0x51A2ae8110057556c9Fa4Dc18964ACA5f6D47945;
        periodo = 15 * 86400;
        tokenBRST = 0x389ccc30de1d311738Dffd3F60D4fD6188970F45; //BRST
        tokenTRC721 = 0x0D8AdCA61a885Df7fCB8cC5f26225DdBb4Ca70FA; // nft loteria
        contractPool = 0x83F62b5EA709673649c4D2a8a9d2e47F50ef694F; // BRST_TRX pool proxyed
        contractFastPool = 0x83F62b5EA709673649c4D2a8a9d2e47F50ef694F; // BRST_TRX pool proxyed
        BRST_Contract = ITRC20(tokenBRST);
        TRC721_Contract = ITRC721(tokenTRC721);
        POOL_Contract = IPOOL(contractPool);
        FAST_Contract = FASTPOOL(contractFastPool);
    }

    function onlyOwner() internal view {
        require(msg.sender == adminProxy());
    }

    function adminProxy() public view returns (address) {
        Proxy_Interface Proxy_Contract = Proxy_Interface(address(this));
        return Proxy_Contract.admin();
    }

    function buyLoteria(address _user, uint256 _cantidad) public payable {
        if (proximaRonda == 0) proximaRonda = block.timestamp + periodo;

        uint256 valor = _cantidad * precio;

        require(msg.value == valor);
        POOL_Contract.staking{value: msg.value}();
        trxPooled = trxPooled.add(msg.value);

        for (uint256 index = 0; index < _cantidad; index++) {
            TRC721_Contract.mintLoteryToken(_user);
        }

        randNonce.numero = randNonce.numero + 1;
    }

    function _premio() public view returns (uint256 prix) {
        uint256 brstPooledInTrx = toTRX(BRST_Contract.balanceOf(address(this)));
        if (brstPooledInTrx > trxPooled.add(toTeam)) {
            prix = (brstPooledInTrx).sub(trxPooled).sub(toTeam);
        }
    }

    function premio() public view returns (uint256 prix) {
        if (_premio() > 0) {
            prix = _premio().mul(precicion - beneficio).div(precicion);
        }
    }

    function premioTeam() public view returns (uint256 prix) {
        if (_premio() > 0) {
            prix = _premio().mul(beneficio).div(precicion);
        }
    }

    function toTRX(uint256 _valueBRST) public view returns (uint256 rtrx) {
        // consulta cuanto TRX vale el BRST  351995.666666  || 2.111974
        return
            _valueBRST.mul(POOL_Contract.RATE()).div(
                10 ** BRST_Contract.decimals()
            );
    }

    function toBRST(uint256 _valueTRX) public view returns (uint256 brst) {
        // consulta cuanto TRX vale el BRST 999999
        return
            _valueTRX.mul(10 ** BRST_Contract.decimals()).div(
                POOL_Contract.RATE()
            );
    }

    function valueNFT(uint256 _nft) public view returns (uint256 tron) {
        return vaul[_nft];
    }

    function reclamarValueNFT(uint256 _nft) public {
        uint256 pago = vaul[_nft];
        require(pago > 0 && address(this).balance >= pago );
        payable(TRC721_Contract.ownerOf(_nft)).transfer(pago);
        vaul[_nft] = 0;
        if (toTeam > 0 && address(this).balance >= toTeam ) {
            payable(walletTeam).transfer(toTeam);
            delete toTeam;
        }
    }

    function deleteVaul(uint256 _nft) public {
        onlyOwner();
        vaul[_nft] = 0;
    }

    function random() public view returns (uint256 myNumber) {
        uint256 rand1 = RandomNumber.randMod(
            paso,
            uint256(
                keccak256(
                    abi.encode(
                        blockhash(block.number),
                        block.timestamp,
                        lastWiner
                    )
                )
            ),
            randNonce.numero
        );

        uint256 rand2 = RandomNumber.randMod(
            paso,
            uint256(
                keccak256(
                    abi.encode(
                        lastWiner,
                        rand1,
                        blockhash(block.number),
                        block.timestamp
                    )
                )
            ),
            randNonce.numero + 2
        );

        uint256 rand3 = RandomNumber.randMod(
            paso,
            uint256(
                keccak256(
                    abi.encode(
                        block.timestamp,
                        rand2,
                        lastWiner,
                        blockhash(block.number)

                    )
                )
            ),
            randNonce.numero + 3
        );

        myNumber = RandomNumber.randMod(
            paso,
            randNonce.numero + 4,
            uint256(keccak256(abi.encode(rand1, rand2, rand3)))
        );
    }

    function sorteo(bool _fast) public returns (uint myNumber) {
        uint256 ganado = premio(); //trx

        require(proximaRonda < block.timestamp);

        if (proximaRonda == 0) {
            proximaRonda = block.timestamp + periodo;
        } else {
            proximaRonda = proximaRonda + periodo;
        }
        // el ultimo corte nft vendidos a la fecha seran los que participen
        if (paso > 0) {
            randNonce.numero = randNonce.numero + 1;
            myNumber = random();

            if (myNumber == 0 || myNumber == lastWiner) {
                randNonce.numero = randNonce.numero + 1;
                myNumber = random();
            }

            if (ganado > 0) {
                uint256 granPrix = _premio();
                uint256 temp = premioTeam();
                bool insta;

                if(_fast){
                    if (  BRST_Contract.allowance(address(this), contractFastPool) <= 1000 * 1e6 ) {
                        BRST_Contract.approve(contractFastPool, 2 ** 256 - 1);
                    }
                    FAST_Contract.sell_token_2(toBRST(granPrix));
                    insta = true;
                }else{
                    if (  BRST_Contract.allowance(address(this), contractPool) <= 1000 * 1e6 ) {
                        BRST_Contract.approve(contractPool, 2 ** 256 - 1);
                    }
                    ( insta, ) = POOL_Contract.solicitudRetiro(toBRST(granPrix)); 

                }

                if (insta && address(this).balance >= ganado) {
                    payable(TRC721_Contract.ownerOf(myNumber)).transfer(ganado);
                    if (address(this).balance >= temp) {
                        payable(walletTeam).transfer(temp);
                    } else {
                        toTeam = toTeam.add(temp);
                    }
                } else {
                    vaul[myNumber] = vaul[myNumber].add(ganado);
                    toTeam = toTeam.add(temp);
                }
            }

            lastWiner = myNumber;
        }

        paso = TRC721_Contract.totalSupply();
    }

    function solicitarRetiroPool(
        uint256 _valorTrx
    ) public returns (bool insta, uint256 id) {
        onlyOwner();
        (insta, id) = POOL_Contract.solicitudRetiro(toBRST(_valorTrx));
    }

    function verRetirosP() public view returns (uint256[] memory) {
        return POOL_Contract.todasSolicitudes(address(this));
    }

    function terminarRetiroPool(
        uint256 _id,
        bool _all
    ) public returns (bool ret) {
        //onlyOwner();
        if (_all) {
            ret = POOL_Contract.retirarFrom(address(this));
        } else {
            ret = POOL_Contract.retirar(_id);
        }
    }

    function update_tokenTRC721(address _tokenTRC721) public {
        onlyOwner();
        tokenTRC721 = _tokenTRC721;
        TRC721_Contract = ITRC721(_tokenTRC721);
    }

    function update_tokenTRC20(address _tokenBRST) public {
        onlyOwner();
        tokenBRST = _tokenBRST;
        BRST_Contract = ITRC20(_tokenBRST);
    }

    function update_addressPOOL(address _addressPOOL) public {
        onlyOwner();
        contractPool = _addressPOOL;
        POOL_Contract = IPOOL(_addressPOOL);
    }

    function update_addressFAST(address _addressFAST) public {
        onlyOwner();
        contractFastPool = _addressFAST;
        FAST_Contract = FASTPOOL(_addressFAST);
    }

    function update_precio(uint256 _precio) public {
        onlyOwner();
        precio = _precio;
    }

    function update_tiempo(uint256 _periodo, uint256 _proxRonda) public {
        onlyOwner();
        proximaRonda = _proxRonda;
        periodo = _periodo;
    }

    function retiroTRC20(uint256 _value, address _TRC20) public {
        onlyOwner();
        ITRC20(_TRC20).transfer(msg.sender, _value);
    }

    function retiroTRC20(uint256 _tokenId) public {
        onlyOwner();
        ITRC721(TRC721_Contract).transferFrom(
            address(this),
            msg.sender,
            _tokenId
        );
    }

    function changeWalletTeam(address _wallet) public {
        onlyOwner();
        walletTeam = _wallet;
    }

    function changeBeneficioTeam(
        uint256 _beneficio,
        uint256 _precicion
    ) public {
        onlyOwner();
        beneficio = _beneficio;
        precicion = _precicion;
    }
    function retiroToTeam() public {
        if (walletTeam != msg.sender) {
            onlyOwner();
        }
        payable(walletTeam).transfer(toTeam);
        delete toTeam;
    }

    fallback() external payable {}
    receive() external payable {}
}
