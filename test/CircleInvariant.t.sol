// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {Circle} from "../src/Circle.sol";
import {CircleFactory} from "../src/CircleFactory.sol";
import {ReputationRegistry} from "../src/ReputationRegistry.sol";
import {MockKRW} from "../src/mocks/MockKRW.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @dev Drives a live Circle through random join/contribute/close/withdraw sequences.
contract CircleHandler is Test {
    Circle public c;
    MockKRW public token;
    address[3] public us;
    uint256 public duration;

    constructor(Circle _c, MockKRW _token, address[3] memory _us, uint256 _dur) {
        c = _c;
        token = _token;
        us = _us;
        duration = _dur;
    }

    function _actor(uint256 seed) internal view returns (address) {
        return us[seed % 3];
    }

    function join(uint256 seed) external {
        address a = _actor(seed);
        vm.startPrank(a);
        token.approve(address(c), type(uint256).max);
        try c.join() {} catch {}
        vm.stopPrank();
    }

    function start() external {
        try c.start() {} catch {}
    }

    function contribute(uint256 seed) external {
        address a = _actor(seed);
        vm.prank(a);
        try c.contribute() {} catch {}
    }

    function closeRound(uint256 warpBy) external {
        vm.warp(block.timestamp + (warpBy % (duration * 2)) + 1);
        try c.closeRound() {} catch {}
    }

    function withdrawBond(uint256 seed) external {
        address a = _actor(seed);
        vm.prank(a);
        try c.withdrawBond() {} catch {}
    }
}

contract CircleInvariantTest is StdInvariant, Test {
    Circle c;
    MockKRW token;
    CircleHandler handler;

    function setUp() public {
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");
        address carol = makeAddr("carol");

        Circle impl = new Circle();
        address predicted = vm.computeCreateAddress(address(this), vm.getNonce(address(this)) + 1);
        ReputationRegistry registry = new ReputationRegistry(predicted);
        CircleFactory factory = new CircleFactory(address(impl), registry);

        token = new MockKRW();
        address[3] memory us = [alice, bob, carol];
        for (uint256 i; i < 3; i++) {
            token.mintTo(us[i], 100_000_000e18);
        }

        address[] memory order = new address[](3);
        order[0] = alice;
        order[1] = bob;
        order[2] = carol;
        c = Circle(factory.createCircle(IERC20(address(token)), 100_000e18, 7 days, 50_000e18, order));

        handler = new CircleHandler(c, token, us, 7 days);
        targetContract(address(handler));
    }

    /// @notice The Circle's token balance must ALWAYS be enough to cover everything
    ///         it still owes members (live bonds + unpaid escrow). If this ever
    ///         breaks, some member's money became unbacked. It must never break.
    function invariant_Solvency() public view {
        assertGe(token.balanceOf(address(c)), c.obligations(), "circle is insolvent");
    }
}
