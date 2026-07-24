// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {Circle} from "../src/Circle.sol";
import {CircleFactory} from "../src/CircleFactory.sol";
import {ReputationRegistry} from "../src/ReputationRegistry.sol";
import {MockKRW} from "../src/mocks/MockKRW.sol";

/// @notice Deploys the full Jjan stack to GIWA testnet.
/// Usage:
///   forge script script/Deploy.s.sol --rpc-url giwa_testnet --broadcast --verify
contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);

        // 1. Circle implementation (logic only; clones point here).
        Circle impl = new Circle();

        // 2. Resolve the factory<->registry circular dependency by precomputing the
        //    factory address. Registry is deployed next (nonce n), factory after (n+1).
        uint64 nonce = vm.getNonce(deployer);
        address predictedFactory = vm.computeCreateAddress(deployer, nonce + 1);

        ReputationRegistry registry = new ReputationRegistry(predictedFactory);
        CircleFactory factory = new CircleFactory(address(impl), registry);
        require(address(factory) == predictedFactory, "factory address mismatch");

        // 3. Testnet-only mock stablecoin.
        MockKRW mkrw = new MockKRW();

        vm.stopBroadcast();

        console2.log("Circle implementation:", address(impl));
        console2.log("ReputationRegistry:   ", address(registry));
        console2.log("CircleFactory:        ", address(factory));
        console2.log("MockKRW (mKRW):       ", address(mkrw));
    }
}
