// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {CircleFactory} from "../src/CircleFactory.sol";
import {MockKRW} from "../src/mocks/MockKRW.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Creates one demo circle from an already-deployed factory + mKRW, for the
///         demo video. Members/amounts come from env so you can wire real testnet wallets.
///   FACTORY=0x.. MKRW=0x.. M1=0x.. M2=0x.. M3=0x.. \
///   forge script script/DemoCircle.s.sol --rpc-url giwa_testnet --broadcast
contract DemoCircle is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        CircleFactory factory = CircleFactory(vm.envAddress("FACTORY"));
        address mkrw = vm.envAddress("MKRW");

        address[] memory order = new address[](3);
        order[0] = vm.envAddress("M1");
        order[1] = vm.envAddress("M2");
        order[2] = vm.envAddress("M3");

        vm.startBroadcast(pk);
        address circle = factory.createCircle(
            IERC20(mkrw),
            100_000e18, // 100k mKRW / round
            5 minutes, // short round for a live demo
            50_000e18, // bond
            order
        );
        vm.stopBroadcast();

        console2.log("Demo circle:", circle);
    }
}
