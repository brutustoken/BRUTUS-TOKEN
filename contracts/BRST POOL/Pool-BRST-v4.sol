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

  function allowance(address _owner, address _spender) external view returns (uint remaining);
  function transferFrom(address _from, address _to, uint _value) external returns (bool);
  function transfer(address direccion, uint cantidad) external returns (bool);
  function balanceOf(address who) external view returns (uint256);
  function decimals() external view returns (uint256);
  function totalSupply() external view returns (uint256);
  function issue(uint amount) external;
  function redeem(uint amount) external;
  function transferOwnership(address newOwner) external;

}

library Array {

  function addArray(uint256[] memory oldArray, uint256 data)internal pure returns ( uint256[] memory) {
    uint256[] memory newArray = new uint256[](oldArray.length+1);

    for(uint256 i = 0; i < oldArray.length; i++){
      newArray[i] = oldArray[i];
    }

    newArray[oldArray.length]=data;
    
    return newArray;
  }

}

contract PoolBRSTv4{
  using SafeMath for uint256;
  using Array for uint256[];

  TRC20_Interface BRTS_Contract;

  TRC20_Interface OTRO_Contract;

  struct Peticion {
    address wallet;
    uint256 tiempo;
    uint256 precio;
    uint256 brst;

  }

  address public owner;

  uint256 public MIN_DEPOSIT;
  uint256 public TRON_SOLICITADO;

  uint256 public TRON_RR; 
  uint256 public descuentoRapido;
  uint256 public precision;

  uint256 public TRON_WALLET_BALANCE;
  address payable public Wallet_SR;

  uint256 public TIEMPO;

  mapping (uint256 => Peticion) public peticiones;
  mapping (address => uint256[]) public misSolicitudes;

  mapping (address => bool) public whiteList;

  uint256 public index;

  bool public iniciado = true;

  constructor(){}

  function inicializar() public{
    require(!iniciado);
    owner = msg.sender;
    MIN_DEPOSIT = 1 * 10**6;
    TIEMPO = 17 * 86400;
    iniciado = true;
    BRTS_Contract = TRC20_Interface(0x389ccc30de1d311738Dffd3F60D4fD6188970F45);
    OTRO_Contract = TRC20_Interface(0x389ccc30de1d311738Dffd3F60D4fD6188970F45);
    descuentoRapido = 5;
    precision = 100;
    TRON_RR = 2000 * 10**6;
  }

  function onlyOwner() internal view{
    require(msg.sender == owner);
  }

  function TRON_TOTAL_BALANCE() public view returns (uint256){
    return TRON_PAY_BALANCE().add(TRON_WALLET_BALANCE);
  }

  function TRON_BALANCE() public view returns (uint256){
    return TRON_WALLET_BALANCE;
  }

  function TRON_PAY_BALANCE() public view returns (uint256){
    return address(this).balance;
  }

  function RATE() public view returns (uint256){
    //1 BRST -> TRX
    return (TRON_BALANCE().mul(10**BRTS_Contract.decimals())).div( BRTS_Contract.totalSupply() );
  }

  function largoSolicitudes(address _user) public view returns(uint256){
    return misSolicitudes[_user].length ;
  }

  function todasSolicitudes(address _user) public view returns(uint256[] memory){
    return misSolicitudes[_user];
  }

  function solicitudesPendientesGlobales() public view returns(uint256[] memory pGlobales){

    for (uint256 i = 0; i < index; i++) {
      pGlobales = pGlobales.addArray(i);
      
    }
    
  }

  function verSolicitudPendiente(uint256 _id) public view returns(Peticion memory pt2){

    pt2 = peticiones[_id];

  }

  function staking() public payable returns (uint) {

    if(msg.value < MIN_DEPOSIT)revert();
    uint256 _value = msg.value;
      
    payable(Wallet_SR).transfer(_value);

    _value = (_value.mul( 10 ** BRTS_Contract.decimals() )).div(RATE());
    TRON_WALLET_BALANCE += msg.value;

    BRTS_Contract.issue(_value);
    BRTS_Contract.transfer(msg.sender,_value);

    return _value;

  }

  function solicitudRetiro(uint256 _value) public {

    if(!instaRetiro(_value)){
      esperaRetiro(_value);
    }

  }

  function instaRetiro(uint256 _value) public returns(bool){

    uint256 pago = _value.mul(RATE()).div(10 ** BRTS_Contract.decimals());
    if(!whiteList[msg.sender]){
      pago = pago.mul(precision-descuentoRapido).div(100);
    }
    
    if(TRON_PAY_BALANCE() >= pago && TRON_RR >= pago){
      if( !BRTS_Contract.transferFrom(msg.sender, address(this), _value) )revert();
      payable(msg.sender).transfer(pago);
      return true;
    }else{
      return false;
    }


  }

  function esperaRetiro(uint256 _value) public {
    
    if( !BRTS_Contract.transferFrom(msg.sender, address(this), _value) )revert();

    peticiones[index] = Peticion({
      wallet:msg.sender,
     tiempo:block.timestamp,
     precio:RATE(),
     brst:_value

    });

    uint256 pago = _value.mul(RATE()).div(10 ** BRTS_Contract.decimals());

    TRON_SOLICITADO += pago;

    misSolicitudes[msg.sender].push(index);
    index++;

  }

  /*function completarSolicitud(uint256 _index) public payable returns (bool){

    address payable _user = payable(solicitudesEnProgreso[_index]);
    uint256 _id = solicitudInterna[_index];

    if(usuario.completado[_id])revert();

    if(msg.sender != _user){
      if(msg.value != usuario.trxx[_id])revert();
      _user.transfer(usuario.trxx[_id]);
    }else{
      _user.transfer(msg.value);
    }

    BRTS_Contract.transfer(msg.sender, usuario.brst[_id]);
    usuario.partner[_id] = msg.sender;
    usuario.completado[_id] = true;

    TRON_SOLICITADO -= usuario.trxx[_id];

    return true;

  }*/

  function retirar(uint256 _id) public returns(bool) {

    if(!whiteList[peticiones[_id].wallet]){
      if( _id >= index || block.timestamp < peticiones[_id].tiempo.add(TIEMPO) )revert();
    }

    uint256 pago = peticiones[_id].brst.mul(peticiones[_id].precio);

    if(TRON_PAY_BALANCE() >= pago){
      payable(peticiones[_id].wallet).transfer(pago);
      BRTS_Contract.redeem(peticiones[_id].brst);
      
      misSolicitudes[peticiones[_id].wallet][_id] = misSolicitudes[peticiones[_id].wallet][misSolicitudes[peticiones[_id].wallet].length - 1];
      misSolicitudes[peticiones[_id].wallet].pop();

      TRON_WALLET_BALANCE -= pago;
      TRON_SOLICITADO -= pago;
      return true;
    }else{
      return false;
    }

  }


  function addWL(address _w) public  {
    onlyOwner();
    whiteList[_w]=true;
  }

  function delWL(address _w) public  {
    onlyOwner();
    whiteList[_w]=false;
  }

  function setWalletSR(address payable _w) public  {
    onlyOwner();
    Wallet_SR = _w;
  }

  function setTiempo(uint256 _dias) public  {
    onlyOwner();
    TIEMPO = _dias;
  }

  function setSalidaRapida(uint256 _descuento, uint256 _precision) public {
    onlyOwner();
    descuentoRapido = _descuento;
    precision = _precision;
  }

  function ChangeToken(address _tokenTRC20) public {
    onlyOwner();
    BRTS_Contract = TRC20_Interface(_tokenTRC20);
  }

  function ChangeTokenOTRO(address _tokenTRC20) public {
    onlyOwner();
    OTRO_Contract = TRC20_Interface(_tokenTRC20);
  }

  function newOwnerBRTS(address _newowner) public {
    onlyOwner();
    BRTS_Contract.transferOwnership(_newowner);
  }

  function asignarPerdida(uint256 _value) public {
    onlyOwner();
    TRON_WALLET_BALANCE -= _value;
  }

  function gananciaDirecta(uint256 _value) public {
    onlyOwner();
    TRON_WALLET_BALANCE += _value;
  }

  function crearBRTS(uint256 _value) public returns(bool){
    onlyOwner();
    BRTS_Contract.issue(_value);
    BRTS_Contract.transfer(owner, _value);
    return true;
  }

  function quemarBRTS(uint256 _value) public returns(bool, uint256){
    onlyOwner();
    if( BRTS_Contract.allowance(msg.sender, address(this)) < _value || 
    BRTS_Contract.balanceOf(msg.sender) < _value ||
    !BRTS_Contract.transferFrom(msg.sender, address(this), _value))revert();
      
    BRTS_Contract.redeem(_value);

    return (true,_value);
      
  }

  function redimBRTS01() public  returns (uint256){
    onlyOwner();
    uint256 valor = BRTS_Contract.balanceOf(address(this));
    BRTS_Contract.transfer(owner, valor);
    return valor;
  }

  function redimBRTS02(uint256 _value) public returns (uint256) {
    onlyOwner();
    if ( BRTS_Contract.balanceOf(address(this)) < _value)revert();
    BRTS_Contract.transfer(owner, _value);
    return _value;
  }

  function redimOTRO01() public returns (uint256){
    onlyOwner();
    uint256 valor = OTRO_Contract.balanceOf(address(this));
    OTRO_Contract.transfer(owner, valor);
    return valor;
  }

  function redimTRX() public returns (uint256){
    onlyOwner();
    if ( address(this).balance == 0)revert();
    payable(owner).transfer( address(this).balance );
    return address(this).balance;
  }

  function redimTRX(uint256 _value) public returns (uint256){
    onlyOwner();
    if ( address(this).balance < _value)revert();
    payable(owner).transfer( _value);
    return _value;
  }

  fallback() external payable {}
  receive() external payable {}

}