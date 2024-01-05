pragma solidity >=0.8.0;
// SPDX-License-Identifier: Apache-2.0

library SafeMath {
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
        return 0;
    }
    uint256 c = a * b;
    require(c / a == b);
    return c;
  }
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b > 0);
    uint256 c = a / b;
    return c;
  }
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b <= a);
    uint256 c = a - b;
    return c;
  }
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    require(c >= a);
    return c;
  }
  function sqrt(uint256 x) internal pure returns(uint256 y){
    uint256 z = div(add(x,1),2);
    y = x;
    while (z < y){
      y = z;
      z = div(add(div(x,z),z),2);
    }
  }
}

interface TRC20_Interface {

  function allowance(address _owner, address _spender) external view returns (uint remaining);
  function transferFrom(address _from, address _to, uint _value) external returns (bool);
  function transfer(address direccion, uint cantidad) external returns (bool);
  function balanceOf(address who) external view returns (uint256);
  function decimals() external view returns (uint256);
  function totalSupply() external view returns (uint256);

}

interface Proxy_Interface{
  function admin() external view returns(address);
  function changeAdmin(address _admin) external;
}

contract DaoBrutus {
  using SafeMath for uint256;

  TRC20_Interface BRTS_Contract;

  bool iniciado = true;
  uint256 index;
  uint256 tiempo; 
  uint256 allLocked;

  mapping(address => uint256) locked;
  mapping(uint256 => string) propuestas;
  mapping(uint256 => uint256) votes;
  mapping(uint256 => uint256) inicio;
  mapping(uint256 => bool) aprovado;
  mapping(uint256 => bool) cuadratic;

  constructor(){

  }

  function incializar() public {
    BRTS_Contract = TRC20_Interface(address(0));
    tiempo = 30 * 86400;
  }

  function onlyOwner() internal view{
    require(msg.sender == owner());
  }

  function lockToken(uint256 _value) public {
    BRTS_Contract.transferFrom(msg.sender, address(this), _value);
    locked[msg.sender] = locked[msg.sender].add(_value);
    allLocked = allLocked.add(_value);
  }

  function unLockToken(uint256 _value) public {
    BRTS_Contract.transfer(msg.sender, _value);
    locked[msg.sender] = locked[msg.sender].sub(_value);
    allLocked = allLocked.sub(_value);
  }

  function cuadratica(uint256 num) public pure returns(uint256 r){
    return num.sqrt();
  }

  function votos(address _user) public view returns(uint256 r){
    return locked[_user].mul(10**7).sqrt();
  }

  function allVotos() public view returns(uint256 r){
    return allLocked.mul(10**7).sqrt();
  }

  function votar(uint256 _proposal) public {
    require(_proposal < index);
    votes[_proposal] = votos(msg.sender);
  }

  function createProposal(string memory _texto, bool _cuadratic) public {
    propuestas[index] = _texto;
    inicio[index] = block.timestamp;
    cuadratic[index] = _cuadratic;
    index++;
  }

  function solveProposal(uint256 _proposal) public {
    require(_proposal < index && block.timestamp >= inicio[_proposal].add(tiempo));

    if(cuadratic[_proposal]){
        if(votes[_proposal] > allVotos().div(2).add(10**6) ){
            aprovado[_proposal] = true;
        }
    }else{
        if(votes[_proposal] > allLocked.div(2).add(1) ){
            aprovado[_proposal] = true;
        }
    }
  }

  function owner() public view returns(address){
    Proxy_Interface Proxy_Contract = Proxy_Interface(address(this));
    return Proxy_Contract.admin();
  }

  function transferOwnership(address _newAdmin)public {
    onlyOwner();
    Proxy_Interface Proxy_Contract = Proxy_Interface(address(this));
    Proxy_Contract.changeAdmin(_newAdmin);
  }
  
}