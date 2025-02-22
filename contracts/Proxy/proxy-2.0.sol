// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library StorageSlot {
    struct AddressSlot {
        address value;
    }

    struct Uint256Slot {
        uint256 value;
    }

    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly {
            r.slot := slot
        }
    }

    function getUint256Slot(bytes32 slot) internal pure returns (Uint256Slot storage r) {
        assembly {
            r.slot := slot
        }
    }
}

interface TRC20_Interface {

  function allowance(address _owner, address _spender) external view returns (uint256);
  function approve(address _spender, uint _value) external returns (bool);
  function transferFrom(address _from, address _to, uint _value) external returns (bool);
  function transfer(address direccion, uint cantidad) external returns (bool);
  function balanceOf(address who) external view returns (uint256);
  function decimals() external view returns (uint256);
  function totalSupply() external view returns (uint256);
  function issue(uint amount) external;
  function redeem(uint amount) external;
  function transferOwnership(address newOwner) external;

}


contract Proxy {
    // All functions / variables should be private, forward all calls to fallback

    // -1 for unknown preimage
    // 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc
    bytes32 private constant IMPLEMENTATION_SLOT =
        bytes32(uint(keccak256("eip1967.proxy.implementation")) - 1);
    // 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103
    bytes32 private constant ADMIN_SLOT =
        bytes32(uint(keccak256("eip1967.proxy.admin")) - 1);

    bytes32 private constant SWAP_SLOT =
        bytes32(uint(keccak256("eip1967.proxy.swap")) - 1);

    bytes32 private constant VERSION_IMPLEMENTATION_SLOT =
        bytes32(uint(keccak256("eip1967.proxy.version")) - 1);

    constructor() {
        _setAdmin(msg.sender);
    }

    modifier ifAdmin() {
        if (msg.sender == _getAdmin()) {
            _;
        } else {
            _fallback();
        }
    }

    function _getAdmin() private view returns (address) {
        return StorageSlot.getAddressSlot(ADMIN_SLOT).value;
    }

    function _getSwap() private view returns (address) {
        return StorageSlot.getAddressSlot(SWAP_SLOT).value;
    }

    function _setAdmin(address _admin) private {
        require(_admin != address(0), "admin = zero address");
        StorageSlot.getAddressSlot(ADMIN_SLOT).value = _admin;
    }

    function _getImplementation() private view returns (address) {
        return StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value;
    }

    function _setImplementation(address _implementation) private {
        require(_implementation.code.length > 0, "implementation is not contract");
        StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value = _implementation;
    }

    function _getImplementationVersion() private view returns (uint256) {
        return StorageSlot.getUint256Slot(VERSION_IMPLEMENTATION_SLOT).value;
    }

    function _updateImplementationVersion() private {
        StorageSlot.getUint256Slot(VERSION_IMPLEMENTATION_SLOT).value = _getImplementationVersion()+1;
    }

    // Admin interface //
    function changeAdmin(address _admin) external ifAdmin {
        StorageSlot.getAddressSlot(SWAP_SLOT).value = _admin;
    }

    function agreeAdmin() external {
        if(StorageSlot.getAddressSlot(SWAP_SLOT).value == msg.sender){
            _setAdmin(msg.sender);
        }else {
            revert("admin no agree");
        }
    }

    // 0x3659cfe6
    function upgradeTo(address _implementation) external ifAdmin {
        if(_getImplementation()!=_implementation){
            _setImplementation(_implementation);
            _updateImplementationVersion();
        }else{
            revert("no upgraded");
        }
        
    }

    // 0xf851a440
    function admin() external view returns (address) {
        return _getAdmin();
    }

    function swap() external view returns (address) {
        return StorageSlot.getAddressSlot(SWAP_SLOT).value;
    }

    // 0x5c60da1b
    function implementation() external view returns (address) {
        return _getImplementation();
    }

    function version() external view returns (uint256) {
        return _getImplementationVersion();
    }

    // User interface //
    function _delegate(address _implementation) internal virtual {
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.

            // calldatacopy(t, f, s) - copy s bytes from calldata at position f to mem at position t
            // calldatasize() - size of call data in bytes
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.

            // delegatecall(g, a, in, insize, out, outsize) -
            // - call contract at address a
            // - with input mem[in…(in+insize))
            // - providing g gas
            // - and output area mem[out…(out+outsize))
            // - returning 0 on error (eg. out of gas) and 1 on success
            let result := delegatecall(gas(), _implementation, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            // returndatacopy(t, f, s) - copy s bytes from returndata at position f to mem at position t
            // returndatasize() - size of the last returndata
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 {
                // revert(p, s) - end execution, revert state changes, return data mem[p…(p+s))
                revert(0, returndatasize())
            }
            default {
                // return(p, s) - end execution, return data mem[p…(p+s))
                return(0, returndatasize())
            }
        }
    }

    function _fallback() private {
        _delegate(_getImplementation());
    }

    fallback() external payable {
        _fallback();
    }

    receive() external payable {
        _fallback();
    }
}
