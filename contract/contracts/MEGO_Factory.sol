// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./MEGO_Contents.sol";
import "./MEGO_Types.sol";

contract MEGO_Factory is MEGO_Types {
    MEGO_Types types;
    mapping(address => MEGO_Contents) public instances;

    event NewContentsCreated(address _contents);

    constructor() {
        types = new MEGO_Types();
    }

    function startNewContents(string memory _name, string memory _ticker)
        public
        returns (address)
    {
        // Create new instance of contract
        MEGO_Contents instance = new MEGO_Contents(_name, _ticker);
        // Transfer the ownership to sender user
        instance.transferOwnership(msg.sender);
        instances[msg.sender] = instance;
        emit NewContentsCreated(address(instance));
        return address(instance);
    }

    function returnContentsInstance(address _address) public view returns (MEGO_Contents) {
        return instances[_address];
    }

    function returnTypesInstance() public view returns (address) {
        return address(types);
    }
}
