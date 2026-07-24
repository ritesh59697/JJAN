// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {Circle} from "../src/Circle.sol";
import {CircleFactory} from "../src/CircleFactory.sol";
import {ReputationRegistry} from "../src/ReputationRegistry.sol";
import {MockKRW} from "../src/mocks/MockKRW.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CircleTest is Test {
    CircleFactory factory;
    ReputationRegistry registry;
    MockKRW token;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address carol = makeAddr("carol");

    uint256 constant CONTRIB = 100_000e18; // 100k mKRW per round
    uint256 constant BOND = 50_000e18;
    uint256 constant DUR = 7 days;

    function setUp() public {
        Circle impl = new Circle();
        // precompute factory address to satisfy registry's immutable factory
        address predicted = vm.computeCreateAddress(address(this), vm.getNonce(address(this)) + 1);
        registry = new ReputationRegistry(predicted);
        factory = new CircleFactory(address(impl), registry);
        assertEq(address(factory), predicted);

        token = new MockKRW();
        address[3] memory us = [alice, bob, carol];
        for (uint256 i; i < 3; i++) {
            token.mintTo(us[i], 10_000_000e18);
        }
    }

    function _newCircle() internal returns (Circle c) {
        address[] memory order = new address[](3);
        order[0] = alice;
        order[1] = bob;
        order[2] = carol;
        c = Circle(factory.createCircle(IERC20(address(token)), CONTRIB, DUR, BOND, order));
    }

    function _joinAll(Circle c) internal {
        address[3] memory us = [alice, bob, carol];
        for (uint256 i; i < 3; i++) {
            vm.startPrank(us[i]);
            token.approve(address(c), type(uint256).max);
            c.join();
            vm.stopPrank();
        }
    }

    function _contributeAll(Circle c) internal {
        address[3] memory us = [alice, bob, carol];
        for (uint256 i; i < 3; i++) {
            vm.prank(us[i]);
            c.contribute();
        }
    }

    // --- happy path: 3 rounds, everyone pays, each gets the pot once ---
    function test_FullCircle_EveryonePaysEachGetsPot() public {
        Circle c = _newCircle();
        _joinAll(c);
        c.start();

        address[3] memory us = [alice, bob, carol];
        for (uint256 r; r < 3; r++) {
            _contributeAll(c);
            // snapshot AFTER contributing so the recipient's own contribution
            // doesn't net against the payout we're measuring.
            uint256 before = token.balanceOf(us[r]);
            vm.warp(block.timestamp + DUR);
            c.closeRound();
            // recipient receives 3 * CONTRIB (no slashes)
            assertEq(token.balanceOf(us[r]) - before, 3 * CONTRIB, "pot to recipient");
        }
        assertTrue(c.finished());

        // bonds returned intact
        for (uint256 i; i < 3; i++) {
            vm.prank(us[i]);
            c.withdrawBond();
            assertEq(c.bondOf(us[i]), 0);
        }
        // contract fully drained
        assertEq(token.balanceOf(address(c)), 0, "contract empty at end");
    }

    // --- no organizer drain: there is simply no function to do it ---
    function test_NoAdminDrainExists() public {
        Circle c = _newCircle();
        _joinAll(c);
        c.start();
        _contributeAll(c);
        // The only way funds leave is closeRound (to the fixed recipient) or
        // withdrawBond (to the member). No arbitrary transfer path exists.
        uint256 potHeld = token.balanceOf(address(c));
        assertGt(potHeld, 0);
        // Try to invoke any drain-like selector as the organizer. The contract has
        // no such function and no fallback, so the call fails and no funds move.
        vm.prank(alice); // organizer
        (bool ok,) = address(c).call(abi.encodeWithSignature("emergencyDrain(address)", alice));
        assertFalse(ok, "no drain selector should exist");
        assertEq(token.balanceOf(address(c)), potHeld, "no funds escaped");
    }

    // --- missed contribution gets slashed into the pot ---
    function test_MissedContribution_Slashed() public {
        Circle c = _newCircle();
        _joinAll(c);
        c.start();

        // Round 0 recipient = alice. bob & alice pay, carol misses.
        vm.prank(alice);
        c.contribute();
        vm.prank(bob);
        c.contribute();
        // carol does NOT contribute

        uint256 aliceBefore = token.balanceOf(alice);
        vm.warp(block.timestamp + DUR);
        c.closeRound();

        // pot = 2*CONTRIB + slash(min(BOND, CONTRIB)) from carol
        uint256 slash = BOND >= CONTRIB ? CONTRIB : BOND;
        assertEq(token.balanceOf(alice) - aliceBefore, 2 * CONTRIB + slash, "slash added to pot");
        assertEq(c.bondOf(carol), BOND - slash, "carol bond reduced");
        assertEq(registry.scoreOf(carol), -1, "carol reputation dinged");
        assertEq(registry.scoreOf(bob), 1, "bob reputation up");
    }

    function test_CannotCloseEarly() public {
        Circle c = _newCircle();
        _joinAll(c);
        c.start();
        _contributeAll(c);
        vm.expectRevert("round not over");
        c.closeRound();
    }

    function test_CannotStartUntilAllJoined() public {
        Circle c = _newCircle();
        vm.startPrank(alice);
        token.approve(address(c), type(uint256).max);
        c.join();
        vm.stopPrank();
        vm.expectRevert("members missing");
        c.start();
    }

    function test_UninvitedCannotJoin() public {
        Circle c = _newCircle();
        address mallory = makeAddr("mallory");
        token.mintTo(mallory, 1_000_000e18);
        vm.startPrank(mallory);
        token.approve(address(c), type(uint256).max);
        vm.expectRevert("not invited");
        c.join();
        vm.stopPrank();
    }

    function test_CannotDoubleContribute() public {
        Circle c = _newCircle();
        _joinAll(c);
        c.start();
        vm.startPrank(alice);
        c.contribute();
        vm.expectRevert("already paid");
        c.contribute();
        vm.stopPrank();
    }

    // --- fuzz: pot paid out always equals contributions + slashes for the round ---
    function testFuzz_PotConservation(uint8 payMask) public {
        Circle c = _newCircle();
        _joinAll(c);
        c.start();

        address[3] memory us = [alice, bob, carol];
        uint256 payers;
        for (uint256 i; i < 3; i++) {
            if (payMask & (1 << i) != 0) {
                vm.prank(us[i]);
                c.contribute();
                payers++;
            }
        }
        uint256 nonPayers = 3 - payers;
        uint256 slash = BOND >= CONTRIB ? CONTRIB : BOND;

        uint256 recipientBefore = token.balanceOf(us[0]); // round 0 -> alice
        vm.warp(block.timestamp + DUR);
        c.closeRound();

        uint256 expected = payers * CONTRIB + nonPayers * slash;
        // if alice herself was a non-payer she was also slashed, but she's recipient:
        // her balance delta = pot received - (already handled, slash came from bond not balance)
        assertEq(token.balanceOf(us[0]) - recipientBefore, expected, "pot conserved");
    }
}
