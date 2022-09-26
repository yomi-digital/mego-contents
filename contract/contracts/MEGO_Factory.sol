// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./MEGO_Contents.sol";
import "./MEGO_Types.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MEGO_Factory is MEGO_Types, Ownable {
    MEGO_Types types;
    uint256 public instances_counter;
    mapping(address => uint256) public owned_instances;
    mapping(uint256 => address) public instances;
    mapping(address => mapping(uint8 => bool)) public plans_bought;
    mapping(address => uint8) public subscriptions;
    mapping(address => uint256) public registration_timestamps;
    mapping(address => mapping(uint256 => bool)) public monthly_payments;
    mapping(uint8 => uint256) public deployment_prices;
    mapping(uint8 => uint256) public monthly_prices;
    mapping(uint8 => uint256) public subscription_prices;
    mapping(address => mapping(address => bool)) public instance_users;
    address public vault_address;
    uint256 public payment_window = 2_592_000; // 1 Month payment window
    mapping(address => uint256) public free_mints;
    uint256 public free_limit = 5;

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
        vault_address = msg.sender;
        // Premium subscription price
        subscription_prices[1] = 0.15 ether;
        // Unlimited subscription price
        subscription_prices[2] = 0.3 ether;
        // Deployment price for free accounts
        deployment_prices[0] = 0.2 ether;
        // Deployment price for premium accounts
        deployment_prices[1] = 0.15 ether;
        // Deployment price for unlimited accounts
        deployment_prices[2] = 0.05 ether;
        // Monthly price for premium accounts
        monthly_prices[1] = 0.025 ether;
        // Monthly price for unlimited accounts
        monthly_prices[2] = 0.01 ether;
    }

    function getEpoch(address _account) public view returns (uint256) {
        uint256 epoch = (block.timestamp - registration_timestamps[_account]) /
            payment_window;
        return epoch;
    }

    function isSubscriptionActive(address _account) public view returns (bool) {
        bool active = false;
        if (subscriptions[msg.sender] == 0) {
            active = true;
        } else {
            uint256 epoch = getEpoch(_account);
            active = monthly_payments[msg.sender][epoch];
        }
        return active;
    }

    function chooseSubscription(uint8 _type) public payable {
        // Be sure subscription exists and has price > 0 or is free one
        require(
            subscription_prices[_type] > 0 || _type == 0,
            "Subscription not found."
        );
        // Be sure sender doesn't own same subscription yet
        require(
            subscriptions[msg.sender] != _type,
            "You already own this subscription."
        );
        // Be sure value is the same of subscription
        if (!plans_bought[msg.sender][_type]) {
            require(
                msg.value == subscription_prices[_type],
                "Must send exact amount needed to deploy the instance."
            );
        }
        // Finally upgrade subscription
        subscriptions[msg.sender] = _type;
        plans_bought[msg.sender][_type] = true;
        registration_timestamps[msg.sender] = block.timestamp;
        // Pay first month of subscription
        if (monthly_prices[_type] > 0) {
            uint256 epoch = getEpoch(msg.sender);
            monthly_payments[msg.sender][epoch] = true;
        }
    }

    function payMonthlyFee() public payable {
        require(subscriptions[msg.sender] > 0, "Subscription not found.");
        require(
            msg.value == monthly_prices[subscriptions[msg.sender]],
            "Send exact amount"
        );
        uint256 epoch = getEpoch(msg.sender);
        require(
            !isSubscriptionActive(msg.sender),
            "You already paid for monthly fee"
        );
        monthly_payments[msg.sender][epoch] = true;
    }

    function startNewInstance(string memory _name, string memory _ticker)
        public
        payable
        returns (address)
    {
        require(
            msg.value == deployment_prices[subscriptions[msg.sender]],
            "Must send exact amount needed to deploy the instance."
        );
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
        // Store the instance address
        instances[instances_counter] = address(newInstance);
        // Add user to instance
        instance_users[address(newInstance)][msg.sender] = true;
        // Increment user instances
        owned_instances[msg.sender]++;
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
                    instances[instanceIndex]
                );
                if (
                    instance.owner() == _owner ||
                    instance_users[instances[instanceIndex]][_owner]
                ) {
                    result[resultIndex] = instances[instanceIndex];
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
        require(isSubscriptionActive(msg.sender), "Subscription not active");
        if (subscriptions[msg.sender] == 0) {
            require(
                free_mints[msg.sender] < free_limit,
                "Can't mint more for free"
            );
            free_mints[msg.sender]++;
        }
        MEGO_Contents instance = MEGO_Contents(_instance);
        require(
            instance_users[_instance][msg.sender],
            "Not an allowed user in instance"
        );
        uint256 _newTokenId = instance.dropContent(_metadata, _model);
        emit ContentCreated(_instance, _newTokenId, _metadata, _model);
    }

    function manageInstanceUsers(
        address _instance,
        address _user,
        bool _state
    ) public {
        MEGO_Contents instance = MEGO_Contents(_instance);
        require(msg.sender == instance.owner(), "Only owner can drop contents");
        require(
            subscriptions[msg.sender] > 0,
            "Only paid account can manage users"
        );
        require(
            instance_users[_instance][_user] != _state,
            "This account already has this state"
        );
        instance_users[_instance][_user] = _state;
        if (_state == true) {
            // Increment the number of instances owned by the sender
            owned_instances[_user]++;
        } else {
            // Decrement the number of instances owned by the sender
            owned_instances[_user]--;
        }
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

    // Admin functions
    function fixPaymentWindow(uint256 _window) public onlyOwner {
        payment_window = _window;
    }

    function fixDeploymentPrices(uint8 _type, uint256 _newPrice)
        public
        onlyOwner
    {
        deployment_prices[_type] = _newPrice;
    }

    function fixSubscriptionPrices(uint8 _type, uint256 _newPrice)
        public
        onlyOwner
    {
        subscription_prices[_type] = _newPrice;
    }

    function fixMonthlyPrices(uint8 _type, uint256 _newPrice) public onlyOwner {
        monthly_prices[_type] = _newPrice;
    }

    function fixVault(address newAddress) public onlyOwner {
        require(newAddress != address(0), "Can't use black hole");
        vault_address = newAddress;
    }

    function withdrawEther() external onlyOwner {
        uint256 balance = address(this).balance;
        require(vault_address != address(0) && balance > 0, "Can't withdraw");
        bool success;
        (success, ) = vault_address.call{value: balance}("");
        require(success, "Withdraw to vault failed");
    }
}
