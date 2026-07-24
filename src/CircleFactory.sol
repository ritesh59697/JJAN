// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Circle} from "./Circle.sol";
import {ReputationRegistry} from "./ReputationRegistry.sol";

/// @title CircleFactory — deploys cheap EIP-1167 clones of the Circle implementation.
/// @notice One implementation is deployed once; every new savings circle is a
///         minimal proxy, so creating a circle costs a fraction of a full deploy.
contract CircleFactory {
    address public immutable implementation;
    ReputationRegistry public immutable reputation;

    address[] public circles;
    mapping(address => address[]) public circlesOf; // organizer => circles created

    event CircleCreated(address indexed circle, address indexed organizer, uint256 members);

    constructor(address _implementation, ReputationRegistry _reputation) {
        require(_implementation != address(0), "impl=0");
        implementation = _implementation;
        reputation = _reputation;
    }

    /// @notice Create and initialize a new savings circle.
    function createCircle(
        IERC20 token,
        uint256 contribution,
        uint256 roundDuration,
        uint256 bond,
        address[] calldata payoutOrder
    ) external returns (address circle) {
        circle = Clones.clone(implementation);
        Circle(circle).initialize(token, contribution, roundDuration, bond, address(reputation), payoutOrder);

        // authorize this circle to write reputation deltas
        if (address(reputation) != address(0)) {
            reputation.authorize(circle);
        }

        circles.push(circle);
        circlesOf[msg.sender].push(circle);
        emit CircleCreated(circle, msg.sender, payoutOrder.length);
    }

    function allCircles() external view returns (address[] memory) {
        return circles;
    }

    function circleCount() external view returns (uint256) {
        return circles.length;
    }
}
