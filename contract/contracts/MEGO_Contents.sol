// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title MEGO Contents
 */
contract MEGO_Contents is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private token_id_counter;
    string public contract_base_uri = "ipfs://";
    mapping(uint256 => bool) public token_freezed;
    mapping(string => bool) public metadata_freezed;
    mapping(uint256 => string) public token_metadata;
    mapping(string => bool) public activated_models;
    mapping(uint256 => string) public token_models;
    uint8 total_models;
    event PermanentURI(string _value, uint256 indexed _id);

    constructor(string memory _name, string memory _ticker)
        ERC721(_name, _ticker)
    {}

    function _baseURI() internal view override returns (string memory) {
        return contract_base_uri;
    }

    function totalSupply() public view returns (uint256) {
        return token_id_counter.current();
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override(ERC721)
        returns (string memory)
    {
        string memory _tknMetadata = token_metadata[_tokenId];
        return string(abi.encodePacked(contract_base_uri, _tknMetadata));
    }

    function tokensOfOwner(address _owner)
        external
        view
        returns (uint256[] memory ownerTokens)
    {
        uint256 tokenCount = balanceOf(_owner);
        if (tokenCount == 0) {
            // Return an empty array
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalTkns = totalSupply();
            uint256 resultIndex = 0;
            uint256 tnkId;

            for (tnkId = 1; tnkId <= totalTkns; tnkId++) {
                if (ownerOf(tnkId) == _owner) {
                    result[resultIndex] = tnkId;
                    resultIndex++;
                }
            }

            return result;
        }
    }

    function fixURI(string memory _newURI) external onlyOwner {
        contract_base_uri = _newURI;
    }

    function addType(string memory _model) external onlyOwner {
        require(!activated_models[_model], "Model active");
        activated_models[_model] = true;
        total_models++;
    }

    function removeType(string memory _model) external onlyOwner {
        require(activated_models[_model], "Model not active");
        activated_models[_model] = false;
        total_models--;
    }

    function dropContent(string memory _metadata, string memory _model)
        external
        onlyOwner
    {
        require(!metadata_freezed[_metadata], "This NFT exists");
        require(activated_models[_model], "Model not activated");
        token_id_counter.increment();
        uint256 newTokenId = token_id_counter.current();
        token_metadata[newTokenId] = _metadata;
        token_models[newTokenId] = _model;
        _mint(msg.sender, newTokenId);
    }

    /*
        This method will fix a token metadata if not freezed
    */
    function fixContent(uint256 _token, string memory _metadata)
        external
        onlyOwner
    {
        require(!token_freezed[_token], "Token is freezed");
        token_metadata[_token] = _metadata;
    }

    /*
        This method will fix a token metadata if not freezed
    */
    function freezeContent(uint256 _token) external onlyOwner {
        require(!token_freezed[_token], "Token is freezed");
        token_freezed[_token] = true;
        metadata_freezed[token_metadata[_token]] = true;
        emit PermanentURI(token_metadata[_token], _token);
    }
}
