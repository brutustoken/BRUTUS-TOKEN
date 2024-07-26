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

library Array {
    function addArray(
        uint256[] memory oldArray,
        uint256 data
    ) internal pure returns (uint256[] memory) {
        uint256[] memory newArray = new uint256[](oldArray.length + 1);

        for (uint256 i = 0; i < oldArray.length; i++) {
            newArray[i] = oldArray[i];
        }

        newArray[oldArray.length] = data;

        return newArray;
    }

    function findIndexOf(
        uint256[] memory arr,
        uint256 _id
    ) internal pure returns (bool found, uint256 r) {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == _id) {
                found = true;
                r = i;
            }
        }
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
}

contract PoolBRST_v4_1 {
    using SafeMath for uint256;
    using Array for uint256[];

    TRC20_Interface BRST_Contract;

    TRC20_Interface OTRO_Contract;

    struct Peticion {
        address wallet;
        uint256 tiempo;
        uint256 precio;
        uint256 brst;
    }

    uint256 public MIN_DEPOSIT;
    uint256 public TRON_SOLICITADO;

    uint256 public TRON_RR;
    uint256 public descuentoRapido;
    uint256 public precision;

    uint256 private _WALLET_SR_BALANCE;
    address payable public Wallet_SR;

    uint256 public TIEMPO;

    mapping(uint256 => Peticion) public peticiones;
    mapping(uint256 => bool) public completada;
    mapping(address => uint256[]) public misSolicitudes;

    mapping(address => bool) public whiteList;
    uint256 public totalDisponible;

    uint256 public index;

    bool public iniciado = true;
    //almacenamiento adicional version 4

    constructor() {}

    function inicializar() public {
        onlyOwner();
        require(!iniciado);
        iniciado = true;
        MIN_DEPOSIT = 1 * 10 ** 6;
        TIEMPO = 17 * 86400;
        BRST_Contract = TRC20_Interface(
            0x389ccc30de1d311738Dffd3F60D4fD6188970F45
        );
        OTRO_Contract = TRC20_Interface(
            0x389ccc30de1d311738Dffd3F60D4fD6188970F45
        );
        precision = 100;
    }

    function onlyOwner() internal view {
        require(msg.sender == owner());
    }

    function disponible_TRX() public view returns (uint256) {
        /*uint256 balance = address(this).balance;
        for (uint256 a = 0; a < almacen.length; a++) {
            balance = balance.sub(almacen[a]);
        }
        return balance;*/
        return address(this).balance;
    }

    function TRON_BALANCE() public view returns (uint256) {
        return _WALLET_SR_BALANCE;
    }

    function RATE() public view returns (uint256) {
        //1 BRST -> TRX
        return
            (TRON_BALANCE().mul(10 ** BRST_Contract.decimals())).div(
                BRST_Contract.totalSupply()
            );
    }

    function largoSolicitudes(address _user) public view returns (uint256) {
        return misSolicitudes[_user].length;
    }

    function todasSolicitudes(
        address _user
    ) public view returns (uint256[] memory) {
        return misSolicitudes[_user];
    }

    function solicitudesPendientesGlobales()
        public
        view
        returns (uint256[] memory pGlobales)
    {
        for (uint256 i = 0; i < index; i++) {
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

    function donate() public payable {
        _WALLET_SR_BALANCE = _WALLET_SR_BALANCE.add(msg.value);
    }

    function donate(uint256 _value) public {
        if (!BRST_Contract.transferFrom(msg.sender, address(this), _value))
            revert();
        BRST_Contract.redeem(_value);
    }

    function staking() public payable returns (uint256) {
        if (msg.value < MIN_DEPOSIT) revert();
        uint256 _value = msg.value;

        payable(Wallet_SR).transfer(_value);

        _value = (_value.mul(10 ** BRST_Contract.decimals())).div(RATE());
        _WALLET_SR_BALANCE = _WALLET_SR_BALANCE.add(msg.value);

        BRST_Contract.issue(_value);
        BRST_Contract.transfer(msg.sender, _value);

        return _value;
    }

    function solicitudRetiro(uint256 _value) public returns (bool, uint256) {
        if (instaRetiro(_value)) {
            return (true, 0);
        } else {
            return (false, esperaRetiro(_value));
        }
    }

    function instaRetiro(uint256 _value) public returns (bool) {
        /*
        uint256 pago = _value.mul(RATE()).div(10 ** BRST_Contract.decimals());
        uint256 toPay;

        if (whiteList[msg.sender]) {
            toPay = TRON_PAY_BALANCE_WHITE();
            retirarDisponible(pago);
        } else {
            pago = pago.mul(precision - descuentoRapido).div(100);
            toPay = TRON_PAY_BALANCE_FAST();
        }

        if (toPay >= pago) {
            if (!BRST_Contract.transferFrom(msg.sender, address(this), _value))
                revert();
            BRST_Contract.redeem(_value);
            payable(msg.sender).transfer(pago);
            _WALLET_SR_BALANCE = _WALLET_SR_BALANCE.sub(pago);
            return true;
        } else {
            return false;
        }
        */
        return false;

    }

    function esperaRetiro(uint256 _value) public returns (uint256 order) {
        if (!BRST_Contract.transferFrom(msg.sender, address(this), _value))
            revert();

        order = index;

        peticiones[order] = Peticion({
            wallet: msg.sender,
            tiempo: block.timestamp,
            precio: RATE(),
            brst: _value
        });

        TRON_SOLICITADO = TRON_SOLICITADO.add(
            _value.mul(RATE()).div(10 ** BRST_Contract.decimals())
        );
        misSolicitudes[msg.sender].push(order);

        index++;
    }

    function retirarFrom(address _user) public returns (bool exitoso) {
        uint256 pago;
        uint256[] memory arr = todasSolicitudes(_user);
        uint256[] memory salidaGlob;
        uint256[] memory nuevo;
        uint256 totalBRST;

        for (uint256 i = 0; i < arr.length; i++) {
            if (
                msg.sender == owner() ||
                whiteList[_user] ||
                peticiones[arr[i]].tiempo.add(TIEMPO) >= block.timestamp
            ) {
                pago = pago.add(
                    peticiones[arr[i]].brst.mul(peticiones[arr[i]].precio).div(
                        10 ** BRST_Contract.decimals()
                    )
                );
                totalBRST = totalBRST.add(peticiones[arr[i]].brst);
                salidaGlob = salidaGlob.addArray(arr[i]);
            } else {
                nuevo = nuevo.addArray(arr[i]);
            }
        }
        require(pago > 0 && totalBRST > 0);
        require(address(this).balance >= pago);

        misSolicitudes[_user] = nuevo;

        for (uint256 i = 0; i < salidaGlob.length; i++) {
            completada[salidaGlob[i]] = true;
        }

        if (whiteList[_user]) {
            retirarDisponible(pago);
        }

        payable(_user).transfer(pago);
        BRST_Contract.redeem(totalBRST);

        _WALLET_SR_BALANCE = _WALLET_SR_BALANCE.sub(pago);
        TRON_SOLICITADO = TRON_SOLICITADO.sub(pago);

        exitoso = true;
    }

    function retirar(uint256 _id) public returns (bool exitoso) {
        require(index > _id);
        if (msg.sender != owner()) {
            if (!whiteList[peticiones[_id].wallet]) {
                if (block.timestamp < peticiones[_id].tiempo.add(TIEMPO))
                    revert();
            }
        }

        uint256 pago = peticiones[_id].brst.mul(peticiones[_id].precio).div(
            10 ** BRST_Contract.decimals()
        );
        
        if (address(this).balance >= pago) {
            (, uint256 i) = misSolicitudes[peticiones[_id].wallet].findIndexOf(
                _id
            );

            misSolicitudes[peticiones[_id].wallet][i] = misSolicitudes[
                peticiones[_id].wallet
            ][misSolicitudes[peticiones[_id].wallet].length - 1];
            misSolicitudes[peticiones[_id].wallet].pop();

            if (whiteList[peticiones[_id].wallet]) {
                retirarDisponible(pago);
            }
            payable(peticiones[_id].wallet).transfer(pago);
            BRST_Contract.redeem(peticiones[_id].brst);

            _WALLET_SR_BALANCE = _WALLET_SR_BALANCE.sub(pago);
            TRON_SOLICITADO = TRON_SOLICITADO.sub(pago);
            completada[_id] = true;
            exitoso = true;
        }
    }

    function asignarPerdida(uint256 _value) public {
        onlyOwner();
        _WALLET_SR_BALANCE = _WALLET_SR_BALANCE.sub(_value);
    }

    function gananciaDirecta(uint256 _value) public {
        onlyOwner();
        _WALLET_SR_BALANCE = _WALLET_SR_BALANCE.add(_value);
    }

    function setWalletSR(address payable _w) public {
        onlyOwner();
        Wallet_SR = _w;
    }

    function setTiempo(uint256 _dias) public {
        onlyOwner();
        TIEMPO = _dias;
    }

    function ChangeToken(address _tokenTRC20) public {
        onlyOwner();
        BRST_Contract = TRC20_Interface(_tokenTRC20);
    }

    function ChangeTokenOTRO(address _tokenTRC20) public {
        onlyOwner();
        OTRO_Contract = TRC20_Interface(_tokenTRC20);
    }

    function newOwnerBRTS(address _newOwner) public {
        onlyOwner();
        BRST_Contract.transferOwnership(_newOwner);
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
        BRST_Contract.issue(_value);
        BRST_Contract.transfer(msg.sender, _value);
        return true;
    }

    function quemarBRTS(
        uint256 _value,
        bool _fromOwner
    ) public returns (bool, uint256) {
        onlyOwner();
        if (_fromOwner) {
            if (!BRST_Contract.transferFrom(msg.sender, address(this), _value))
                revert();
        }
        BRST_Contract.redeem(_value);

        return (true, _value);
    }

    function sumarDisponible(uint256 _value) public {
        onlyOwner();
        totalDisponible = totalDisponible.add(_value);
    }

    function restarDisponible(uint256 _value) public {
        onlyOwner();
        retirarDisponible(_value);
    }

    function retirarDisponible(uint256 _value) internal {
        totalDisponible = totalDisponible.sub(_value);
    }

    function setDisponible(uint256 _value) public {
        onlyOwner();
        totalDisponible = _value;
    }

    function setWhiteList(address _w, bool _sn) public {
        onlyOwner();
        whiteList[_w] = _sn;
    }

    function setListaNegra(address _evilUser, bool _si_no) public {
        onlyOwner();
        if (_si_no) {
            BRST_Contract.addBlackList(_evilUser);
        } else {
            BRST_Contract.removeBlackList(_evilUser);
        }
    }

    function redimBRTS(uint256 _value) public returns (uint256) {
        onlyOwner();
        if (BRST_Contract.balanceOf(address(this)) < _value) revert();
        BRST_Contract.transfer(owner(), _value);
        return _value;
    }

    function redimOTRO() public returns (uint256) {
        onlyOwner();
        uint256 valor = OTRO_Contract.balanceOf(address(this));
        OTRO_Contract.transfer(owner(), valor);
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
