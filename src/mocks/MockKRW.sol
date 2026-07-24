// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockKRW — testnet-only KRW-pegged stablecoin for Jjan demos.
/// @notice Open faucet mint. DO NOT use on mainnet. Replace with a real
///         bridged/canonical stablecoin once one exists on GIWA.
contract MockKRW is ERC20 {
    constructor() ERC20("Mock Korean Won", "mKRW") {}

    /// @notice Anyone can mint testnet tokens to try the app.
    function faucet(uint256 amount) external {
        _mint(msg.sender, amount);
    }

    function mintTo(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
