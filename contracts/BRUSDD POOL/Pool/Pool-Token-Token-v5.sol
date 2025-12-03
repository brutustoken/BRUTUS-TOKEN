pragma solidity >=0.8.17;
// SPDX-License-Identifier: BSL-1.1

library Array {
    function addArray(
        uint256[] memory oldArray,
        uint256 data
    ) internal pure returns (uint256[] memory newArray) {
        uint256 len = oldArray.length;
        newArray = new uint256[](len + 1);

        for (uint256 i = 0; i < len; ) {
            newArray[i] = oldArray[i];
            unchecked {
                i++;
            } // menos gas
        }

        newArray[len] = data;
    }

    function find_indexOf(
        uint256[] memory arr,
        uint256 value
    ) internal pure returns (bool found, uint256 index) {
        uint256 len = arr.length;

        for (uint256 i = 0; i < len; ) {
            if (arr[i] == value) {
                return (true, i);
            }
            unchecked {
                i++;
            }
        }

        return (false, 0);
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
    function addBlackList(address _evilUser) external;
    function removeBlackList(address _clearedUser) external;
    function destroyBlackFunds(address _blackListedUser) external;
}

interface Proxy_Interface {
    function admin() external view returns (address);
    function changeAdmin(address _admin) external;
    function agreeAdmin() external;
    function upgradeTo(address _implementation) external;
    function swap() external view returns (address);
    function implementation() external view returns (address);
    function version() external view returns (uint256);
}

contract PoolTokenToken_v5 {
    using Array for uint256[];

    TRC20_Interface A_Contract; // Token principal BRSS
    TRC20_Interface B_Contract; // Token de pago USDD

    TRC20_Interface O_Contract;

    struct Peticion {
        address wallet;
        uint256 tiempo;
        uint256 precio;
        uint256 tokenAmount;
    }

    uint256 private _MIN_DEPOSIT;
    uint256 private _USDD_SOLICITADO;

    uint256 private _B_balance;

    uint256 private _TIEMPO;

    mapping(uint256 => Peticion) public peticiones;
    mapping(uint256 => bool) public completada;
    mapping(address => uint256[]) public misPeticiones;

    mapping(address => bool) public whiteList;

    uint256 private _index;

    bool public iniciado = true;
    //almacenamiento adicional despues de esta linea version 5

    constructor() {}

    function inicializar(address _token_A, address _token_B) public {
        onlyOwner();
        require(!iniciado);
        iniciado = true;
        _MIN_DEPOSIT = 1 * 10 ** 18;
        _TIEMPO = 7 * 86400;
        A_Contract = TRC20_Interface(_token_A);
        B_Contract = TRC20_Interface(_token_B);
        O_Contract = TRC20_Interface(_token_B);
    }

    function onlyOwner() internal view {
        require(msg.sender == owner());
    }

    function B_disponible() public view returns (uint256) {
        if (address(B_Contract) == address(0)) return 0;
        return B_Contract.balanceOf(address(this));
    }

    function B_balance() public view returns (uint256) {
        return _B_balance;
    }

    function RATE() public view returns (uint256) {
        return
            (B_balance() * (10 ** A_Contract.decimals())) /
            A_Contract.totalSupply();
    }

    function largoSolicitudes(address _user) public view returns (uint256) {
        return misPeticiones[_user].length;
    }

    function todasSolicitudes(
        address _user
    ) public view returns (uint256[] memory) {
        return misPeticiones[_user];
    }

    function solicitudesPendientesGlobales()
        public
        view
        returns (uint256[] memory pGlobales)
    {
        for (uint256 i = 0; i < _index; i++) {
            if (!completada[i]) {
                pGlobales = pGlobales.addArray(i);
            }
        }
    }

    function verSolicitudPendiente(
        uint256 _id
    ) public view returns (Peticion memory pt2) {
        pt2 = peticiones[_id];
    }

    function donate(uint256 _value) public {
        require(_value > 0, "Donate: amount must be greater than 0");
        if (!A_Contract.transferFrom(msg.sender, address(this), _value))
            revert("Donate: transferFrom failed");
        require(
            A_Contract.balanceOf(address(this)) >= _value,
            "Donate: insufficient balance to redeem"
        );
        A_Contract.redeem(_value);
    }

    // Compra BRST pagando con el token `B_Contract` (medio de pago).
    // _payAmount: cantidad de `B_Contract` a transferir desde el comprador.
    function staking(uint256 _payAmount) public returns (uint256) {
        require(_payAmount >= _MIN_DEPOSIT, "staking: amount below minimum");
        require(
            address(B_Contract) != address(0),
            "staking: pay token not set"
        );
        // cobrar el token de pago al usuario
        require(
            B_Contract.transferFrom(msg.sender, address(this), _payAmount),
            "staking: transferFrom failed"
        );

        // calcular la cantidad de A tokens a emitir: aAmount = payAmount * 10**A_decimals / RATE()
        uint256 aAmount = (_payAmount * (10 ** A_Contract.decimals())) / RATE();

        // actualizar saldo interno del pool (en unidades de B_Contract)
        _B_balance += _payAmount;

        A_Contract.issue(aAmount);
        A_Contract.transfer(msg.sender, aAmount);

        return aAmount;
    }

    function solicitudRetiro(uint256 _value) public {
        esperaRetiro(_value);
    }

    function esperaRetiro(uint256 _value) public {
        if (!A_Contract.transferFrom(msg.sender, address(this), _value))
            revert();

        uint256 precio = RATE();

        peticiones[_index] = Peticion({
            wallet: msg.sender,
            tiempo: block.timestamp,
            precio: precio,
            tokenAmount: _value
        });

        _USDD_SOLICITADO += (_value * precio) / (10 ** A_Contract.decimals());
        misPeticiones[msg.sender].push(_index);

        _index++;
    }

    function retirar(uint256 _id) public returns (bool exitoso) {
        require(_index > _id);
        require(!completada[_id]);
        Peticion memory onPeticion = peticiones[_id];
        if (msg.sender != owner()) {
            if (block.timestamp < onPeticion.tiempo + _TIEMPO)
                revert("no time to claim");
        }

        uint256 pago = (onPeticion.tokenAmount * onPeticion.precio) /
            (10 ** A_Contract.decimals());

        // comprobar que el pool tiene suficientes tokens B (medio de pago)
        require(
            address(B_Contract) != address(0),
            "retirar: pay token not set"
        );
        require(
            B_Contract.balanceOf(address(this)) >= pago,
            "retirar: insufficient pay-token balance in contract"
        );

        (bool success, uint256 i) = misPeticiones[onPeticion.wallet]
            .find_indexOf(_id);

        require(success);

        misPeticiones[onPeticion.wallet][i] = misPeticiones[onPeticion.wallet][
            misPeticiones[onPeticion.wallet].length - 1
        ];
        misPeticiones[onPeticion.wallet].pop();

        _B_balance -= pago;
        _USDD_SOLICITADO -= pago;
        completada[_id] = true;

        // transferir tokens B al usuario como pago
        require(
            B_Contract.transfer(onPeticion.wallet, pago),
            "retirar: pay-token transfer failed"
        );

        // quemar los A tokens que el contrato recibió
        A_Contract.redeem(onPeticion.tokenAmount);

        exitoso = true;
    }

    // --- Owner-only order management ---
    // Deshacer una orden: devolver los tokens A al usuario y cancelar la solicitud
    function ownerCancelOrder(uint256 _id) public {
        onlyOwner();
        require(_id < _index, "ownerCancelOrder: invalid id");
        require(!completada[_id], "ownerCancelOrder: already completed");

        Peticion memory onPeticion = peticiones[_id];

        // localizar y eliminar de misPeticiones del usuario
        (bool success, uint256 i) = misPeticiones[onPeticion.wallet]
            .find_indexOf(_id);
        require(success, "ownerCancelOrder: request not found in user list");

        misPeticiones[onPeticion.wallet][i] = misPeticiones[onPeticion.wallet][
            misPeticiones[onPeticion.wallet].length - 1
        ];
        misPeticiones[onPeticion.wallet].pop();

        // actualizar contador solicitado
        uint256 pago = (onPeticion.tokenAmount * onPeticion.precio) /
            (10 ** A_Contract.decimals());
        if (_USDD_SOLICITADO >= pago) {
            _USDD_SOLICITADO -= pago;
        } else {
            _USDD_SOLICITADO = 0;
        }

        // devolver los tokens A al usuario
        require(
            A_Contract.transfer(onPeticion.wallet, onPeticion.tokenAmount),
            "ownerCancelOrder: refund transfer failed"
        );

        completada[_id] = true;
    }

    // Eliminar una orden sin devolver tokens (se mantiene lo recibido en el contrato)
    function ownerDeleteOrder(uint256 _id) public {
        onlyOwner();
        require(_id < _index, "ownerDeleteOrder: invalid id");
        require(!completada[_id], "ownerDeleteOrder: already completed");

        Peticion memory onPeticion = peticiones[_id];

        (bool success, uint256 i) = misPeticiones[onPeticion.wallet]
            .find_indexOf(_id);
        require(success, "ownerDeleteOrder: request not found in user list");

        misPeticiones[onPeticion.wallet][i] = misPeticiones[onPeticion.wallet][
            misPeticiones[onPeticion.wallet].length - 1
        ];
        misPeticiones[onPeticion.wallet].pop();

        uint256 pago = (onPeticion.tokenAmount * onPeticion.precio) /
            (10 ** A_Contract.decimals());
        if (_USDD_SOLICITADO >= pago) {
            _USDD_SOLICITADO -= pago;
        } else {
            _USDD_SOLICITADO = 0;
        }

        // marcar completa sin transferir nada (los tokens A permanecen en el contrato)
        completada[_id] = true;
    }

    // Completar una orden de forma anticipada: pagar en B al usuario y quemar los A recibidos
    function ownerCompleteOrder(uint256 _id) public {
        onlyOwner();
        require(_id < _index, "ownerCompleteOrder: invalid id");
        require(!completada[_id], "ownerCompleteOrder: already completed");

        Peticion memory onPeticion = peticiones[_id];

        uint256 pago = (onPeticion.tokenAmount * onPeticion.precio) /
            (10 ** A_Contract.decimals());

        // comprobar que el pool tiene suficientes tokens B (medio de pago)
        require(
            address(B_Contract) != address(0),
            "ownerCompleteOrder: pay token not set"
        );
        require(
            B_Contract.balanceOf(address(this)) >= pago,
            "ownerCompleteOrder: insufficient pay-token balance in contract"
        );

        (bool success, uint256 i) = misPeticiones[onPeticion.wallet]
            .find_indexOf(_id);
        require(success, "ownerCompleteOrder: request not found in user list");

        misPeticiones[onPeticion.wallet][i] = misPeticiones[onPeticion.wallet][
            misPeticiones[onPeticion.wallet].length - 1
        ];
        misPeticiones[onPeticion.wallet].pop();

        // actualizar balances
        if (_B_balance >= pago) {
            _B_balance -= pago;
        } else {
            _B_balance = 0;
        }
        if (_USDD_SOLICITADO >= pago) {
            _USDD_SOLICITADO -= pago;
        } else {
            _USDD_SOLICITADO = 0;
        }

        // transferir tokens B al usuario
        require(
            B_Contract.transfer(onPeticion.wallet, pago),
            "ownerCompleteOrder: pay-token transfer failed"
        );

        // quemar los A tokens que el contrato recibió
        A_Contract.redeem(onPeticion.tokenAmount);

        completada[_id] = true;
    }

    function asignarPerdida(uint256 _value) public {
        onlyOwner();
        if (_B_balance >= _value) {
            _B_balance -= _value;
        } else {
            _B_balance = 0;
        }
    }

    function gananciaDirecta(uint256 _value) public {
        onlyOwner();
        _B_balance += _value;
    }

    function setTiempo(uint256 _tiempo) public {
        onlyOwner();
        _TIEMPO = _tiempo;
    }

    function ChangeToken(address _tokenTRC20) public {
        onlyOwner();
        A_Contract = TRC20_Interface(_tokenTRC20);
    }

    function ChangeTokenOTRO(address _tokenTRC20) public {
        onlyOwner();
        O_Contract = TRC20_Interface(_tokenTRC20);
    }

    // Cambiar token de pago (B_Contract)
    function ChangeTokenB(address _tokenTRC20) public {
        onlyOwner();
        B_Contract = TRC20_Interface(_tokenTRC20);
    }

    function newOwnerBRTS(address _newOwner) public {
        onlyOwner();
        A_Contract.transferOwnership(_newOwner);
    }
    function owner() public view returns (address) {
        Proxy_Interface Proxy_Contract = Proxy_Interface(address(this));
        return Proxy_Contract.admin();
    }

    function transferOwnership(address _newAdmin) public {
        onlyOwner();
        Proxy_Interface Proxy_Contract = Proxy_Interface(address(this));
        Proxy_Contract.changeAdmin(_newAdmin);
    }

    function crearBRTS(uint256 _value) public returns (bool) {
        onlyOwner();
        A_Contract.issue(_value);
        A_Contract.transfer(msg.sender, _value);
        return true;
    }

    function quemarBRTS(
        uint256 _value,
        bool _fromWallet
    ) public returns (bool, uint256) {
        onlyOwner();
        if (_fromWallet) {
            if (!A_Contract.transferFrom(msg.sender, address(this), _value))
                revert();
        }
        A_Contract.redeem(_value);

        return (true, _value);
    }

    function setWhiteList(address _w, bool _sn) public {
        onlyOwner();
        whiteList[_w] = _sn;
    }

    function setListaNegra(address _evilUser, bool _si_no) public {
        onlyOwner();
        if (_si_no) {
            A_Contract.addBlackList(_evilUser);
        } else {
            A_Contract.removeBlackList(_evilUser);
        }
    }

    function redimBRTS(uint256 _value) public returns (uint256) {
        onlyOwner();
        if (A_Contract.balanceOf(address(this)) < _value) revert();
        A_Contract.transfer(owner(), _value);
        return _value;
    }

    function redimOTRO() public returns (uint256) {
        onlyOwner();
        uint256 valor = O_Contract.balanceOf(address(this));
        O_Contract.transfer(owner(), valor);
        return valor;
    }

    function redimTRX(uint256 _value) public returns (uint256) {
        onlyOwner();
        if (address(this).balance < _value) revert();
        payable(owner()).transfer(_value);
        return _value;
    }

    fallback() external payable {}
    receive() external payable {}
}
