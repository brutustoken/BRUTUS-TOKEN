//SPDX-License-Identifier: APACHE-2.0
pragma solidity ^0.8.20;


library AddressUtils {


  function isContract(address addr) internal view returns (bool) {
    uint256 size;
    assembly { size := extcodesize(addr) }
    return size > 0;
  }

}

contract Proxy {

    event Upgraded(address implementation);
    event AdminChanged(address previousAdmin, address newAdmin);

    bytes32 private constant IMPLEMENTATION_SLOT = 
        bytes32(uint(keccak256("eip1967.proxy.implementation")) - 1);

    bytes32 private constant ADMIN_SLOT =
        bytes32(uint(keccak256("eip1967.proxy.admin")) - 1);

    bytes32 private constant VERSION_IMPLEMENTATION_SLOT =
        bytes32(uint(keccak256("eip1967.proxy.version")) - 1);

    constructor() public {
        _setAdmin(msg.sender);
    }

    
    function _delegate(address _to) internal {
        assembly {
        // Copy msg.data. We take full control of memory in this inline assembly
        // block because it will not return to Solidity code. We overwrite the
        // Solidity scratch pad at memory position 0.
        calldatacopy(0, 0, calldatasize())

        // Call the implementation.
        // out and outsize are 0 because we don't know the size yet.
        let result := delegatecall(gas(), _to, 0, calldatasize(), 0, 0)

        // Copy the returned data.
        returndatacopy(0, 0, returndatasize())

        switch result
        // delegatecall returns 0 on error.
        case 0 { revert(0, returndatasize()) }
        default { return(0, returndatasize()) }
        }
    }

    function _fallback() internal {
        _delegate(_implementation());
    }

    receive() payable external {
        _fallback();
    }

    fallback() payable external {
        _fallback();
    }

    function _implementation() internal view returns (address impl) {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
        impl := sload(slot)
        }
    }

    function _upgradeTo(address newImplementation) internal {
        _setImplementation(newImplementation);
        emit Upgraded(newImplementation);
    }

    function _setImplementation(address newImplementation) private {
        require(AddressUtils.isContract(newImplementation), "Cannot set a proxy implementation to a non-contract address");

        bytes32 slot = IMPLEMENTATION_SLOT;

        assembly {
        sstore(slot, newImplementation)
        }
    }

    

    modifier ifAdmin() {
        if (msg.sender == _admin()) {
        _;
        } else {
        _fallback();
        }
    }


    function admin() external view returns (address) {
        return _admin();
    }

    function implementation() external view returns (address) {
        return _implementation();
    }

    function changeAdmin(address newAdmin) external ifAdmin {
        require(newAdmin != address(0), "Cannot change the admin of a proxy to the zero address");
        emit AdminChanged(_admin(), newAdmin);
        _setAdmin(newAdmin);
    }

    function upgradeTo(address newImplementation) external ifAdmin {
        _upgradeTo(newImplementation);
    }

    function upgradeToAndCall(address newImplementation,  bytes memory data ) payable external ifAdmin {
        _upgradeTo(newImplementation);
        (bool result, bytes memory dat) = address(this).call{value:msg.value}(data);
        require(result);
        dat;

    }

    function _admin() internal view returns (address adm) {
        bytes32 slot = ADMIN_SLOT;
        assembly {
        adm := sload(slot)
        }
    }

    function _setAdmin(address newAdmin) internal {
        bytes32 slot = ADMIN_SLOT;

        assembly {
        sstore(slot, newAdmin)
    }
  }

 
}

