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
