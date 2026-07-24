// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @title ReputationRegistry — global on-chain reliability score for Jjan members.
/// @notice Scores follow a wallet across every circle it joins. Only circles that
///         the factory has authorized may write deltas; nobody can forge a score.
contract ReputationRegistry {
    address public immutable factory; // only the factory can authorize writers
    mapping(address => bool) public isCircle; // authorized writer set
    mapping(address => int256) public scoreOf; // member => cumulative score
    mapping(address => uint256) public roundsOf; // member => rounds participated in

    event Authorized(address indexed circle);
    event Recorded(address indexed member, int256 delta, int256 newScore);

    error NotFactory();
    error NotAuthorized();

    /// @param _factory the CircleFactory allowed to authorize new circles.
    constructor(address _factory) {
        factory = _factory;
    }

    /// @notice Factory-only: allow a freshly created circle to record scores.
    function authorize(address circle) external {
        if (msg.sender != factory) revert NotFactory();
        isCircle[circle] = true;
        emit Authorized(circle);
    }

    /// @notice Circle-only: adjust a member's score (+1 paid on time, -1 missed).
    function record(address member, int256 delta) external {
        if (!isCircle[msg.sender]) revert NotAuthorized();
        int256 s = scoreOf[member] + delta;
        scoreOf[member] = s;
        roundsOf[member] += 1;
        emit Recorded(member, delta, s);
    }
}
