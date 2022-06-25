// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

/**
 * @title MEGO_Types
 */

contract MEGO_Types {
    struct DataType {
        bool active;
        string name;
        bool print;
        bool required;
        bool multiple;
        string input;
        string specs;
    }

    struct Models {
        bool active;
        address creator;
        mapping(uint256 => DataType) datatypes;
    }

    mapping(string => Models) public models;

    function createModel(string memory _name) public {
        require(!models[_name].active, "Model exists yet");
        models[_name].active = true;
        models[_name].creator = msg.sender;
    }

    function editDatatypeInModel(
        string memory _identitifer,
        uint256 _order,
        bool _active,
        string memory _name,
        bool _print,
        bool _required,
        bool _multiple,
        string memory _input,
        string memory _specs
    ) public {
        require(models[_identitifer].active, "Model doesn't exists");
        require(
            models[_identitifer].creator == msg.sender,
            "Only creator can change models"
        );
        models[_identitifer].datatypes[_order].active = _active;
        models[_identitifer].datatypes[_order].name = _name;
        models[_identitifer].datatypes[_order].print = _print;
        models[_identitifer].datatypes[_order].required = _required;
        models[_identitifer].datatypes[_order].multiple = _multiple;
        models[_identitifer].datatypes[_order].input = _input;
        models[_identitifer].datatypes[_order].specs = _specs;
    }

    function returnModelType(string memory _identitifer, uint256 _index)
        public
        view
        returns (
            bool _active,
            string memory _name,
            bool _print,
            bool _required,
            bool _multiple,
            string memory _input,
            string memory _specs
        )
    {
        return (
            models[_identitifer].datatypes[_index].active,
            models[_identitifer].datatypes[_index].name,
            models[_identitifer].datatypes[_index].print,
            models[_identitifer].datatypes[_index].required,
            models[_identitifer].datatypes[_index].multiple,
            models[_identitifer].datatypes[_index].input,
            models[_identitifer].datatypes[_index].specs
        );
    }
}
