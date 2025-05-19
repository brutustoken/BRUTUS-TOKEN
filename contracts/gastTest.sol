// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GasTest {
    uint256 public number;

    // Public function
    function setNumberPublic(uint256 _num) public {
        number = _num;
    }

    // Internal function
    function _setNumberInternal(uint256 _num) internal {
        number = _num;
    }

    // Public function calling internal function
    function setNumberViaInternal(uint256 _num) public {
        _setNumberInternal(_num);
    }
}