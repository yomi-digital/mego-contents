// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./MEGO_Contents.sol";
import "./MEGO_Types.sol";

contract MEGO_Factory is MEGO_Types {
    MEGO_Types types;
    uint256 public instances_counter;
    struct Instance {
        address instance_address;
        MEGO_Contents instance;
    }
    mapping(address => uint256) public owned_instances;
    mapping(uint256 => Instance) public instances;

    event InstanceCreated(address _contents);
    event ContentCreated(
        address _instance,
        uint256 _tokenId,
        string _metadata,
        string _model
    );
    event ContentFixed(address _instance, uint256 _tokenId, string _metadata);
    event ContentFreezed(address _instance, uint256 _tokenId);

    constructor() {
        types = new MEGO_Types();
    }

    function startNewInstance(string memory _name, string memory _ticker)
        public
        returns (address)
    {
        // Increase instances counter
        instances_counter++;
        // Create new instance of contract
        MEGO_Contents newInstance = new MEGO_Contents(
            _name,
            _ticker,
            address(this)
        );
        // Transfer the ownership to sender user
        newInstance.transferOwnership(msg.sender);
        // Increment the number of instances owned by the sender
        owned_instances[msg.sender]++;
        // Store the instance
        instances[instances_counter].instance = newInstance;
        // Store the instance address
        instances[instances_counter].instance_address = address(newInstance);
        // Finally emit creation event
        emit InstanceCreated(address(newInstance));
        return address(newInstance);
    }

    function instancesOfOwner(address _owner)
        external
        view
        returns (address[] memory _instances)
    {
        uint256 instancesCount = owned_instances[_owner];
        if (instancesCount == 0) {
            // Return an empty array
            return new address[](0);
        } else {
            address[] memory result = new address[](instancesCount);
            uint256 resultIndex = 0;
            uint256 instanceIndex;

            for (
                instanceIndex = 1;
                instanceIndex <= instances_counter;
                instanceIndex++
            ) {
                MEGO_Contents instance = MEGO_Contents(
                    instances[instanceIndex].instance_address
                );
                if (instance.owner() == _owner) {
                    result[resultIndex] = instances[instanceIndex]
                        .instance_address;
                    resultIndex++;
                }
            }

            return result;
        }
    }

    function dropContent(
        address _instance,
        string memory _metadata,
        string memory _model
    ) public {
        MEGO_Contents instance = MEGO_Contents(_instance);
        require(msg.sender == instance.owner(), "Only owner can drop contents");
        uint256 _newTokenId = instance.dropContent(_metadata, _model);
        emit ContentCreated(_instance, _newTokenId, _metadata, _model);
    }

    function fixContent(
        address _instance,
        uint256 _tokenId,
        string memory _metadata
    ) public {
        MEGO_Contents instance = MEGO_Contents(_instance);
        require(msg.sender == instance.owner(), "Only owner can fix contents");
        instance.fixContent(_tokenId, _metadata);
        emit ContentFixed(_instance, _tokenId, _metadata);
    }

    function freezeContent(address _instance, uint256 _tokenId) public {
        MEGO_Contents instance = MEGO_Contents(_instance);
        require(
            msg.sender == instance.owner(),
            "Only owner can freeze contents"
        );
        instance.freezeContent(_tokenId);
        emit ContentFreezed(_instance, _tokenId);
    }

    function returnTypesInstance() public view returns (address) {
        return address(types);
    }
}
