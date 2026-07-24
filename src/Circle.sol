// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IReputationRegistry {
    function record(address member, int256 delta) external;
}

/// @title Circle — a trustless rotating savings club (Korean "kye" / 곗돈).
/// @notice Members contribute a fixed amount each round; the contract escrows the
///         pot and pays the scheduled recipient. There is NO admin key that can
///         drain funds — that non-custodial guarantee is the entire product.
/// @dev Deployed as an EIP-1167 clone, so state is set via initialize(), not a
///      constructor. Payout order is fixed at creation to avoid manipulation.
contract Circle is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // --- config (set once in initialize) ---
    IERC20 public token;
    uint256 public contribution; // fixed amount per member per round
    uint256 public roundDuration; // seconds per round
    uint256 public bond; // posted on join, slashable on a missed round
    address public reputation; // optional ReputationRegistry (address(0) = off)
    address[] public payoutOrder; // who is paid each round, in order

    // --- lifecycle state ---
    bool public initialized;
    bool public started;
    bool public finished;
    uint256 public currentRound; // 0-indexed; also index into payoutOrder
    uint256 public roundStart; // timestamp the current round opened

    // --- member state ---
    mapping(address => bool) public isMember;
    mapping(address => uint256) public bondOf;
    mapping(uint256 => mapping(address => bool)) public paid; // round => member => paid?
    mapping(uint256 => uint256) public potOf; // round => escrowed pot

    // solvency invariant support: everything the contract still owes to members
    uint256 public totalBonds; // sum of live bonds held
    uint256 public escrowedPot; // contributions/slashes not yet paid out

    event Initialized(address indexed token, uint256 contribution, uint256 members);
    event Joined(address indexed member);
    event Started(uint256 timestamp);
    event Contributed(address indexed member, uint256 indexed round);
    event Slashed(address indexed member, uint256 indexed round, uint256 amount);
    event RoundClosed(uint256 indexed round, address indexed recipient, uint256 amount);
    event Finished();

    modifier onlyStarted() {
        require(started && !finished, "not active");
        _;
    }

    /// @notice One-time setup for a cloned Circle.
    function initialize(
        IERC20 _token,
        uint256 _contribution,
        uint256 _roundDuration,
        uint256 _bond,
        address _reputation,
        address[] calldata _payoutOrder
    ) external {
        require(!initialized, "initialized");
        require(address(_token) != address(0), "token=0");
        require(_contribution > 0, "contribution=0");
        require(_roundDuration > 0, "duration=0");
        require(_payoutOrder.length >= 2, "need >=2 members");

        // reject duplicate members (would break rotation + accounting)
        for (uint256 i; i < _payoutOrder.length; i++) {
            require(_payoutOrder[i] != address(0), "member=0");
            for (uint256 j = i + 1; j < _payoutOrder.length; j++) {
                require(_payoutOrder[i] != _payoutOrder[j], "dup member");
            }
        }

        initialized = true;
        token = _token;
        contribution = _contribution;
        roundDuration = _roundDuration;
        bond = _bond;
        reputation = _reputation;
        payoutOrder = _payoutOrder;

        emit Initialized(address(_token), _contribution, _payoutOrder.length);
    }

    /// @notice Join the circle by posting the required bond. Only invited addresses.
    function join() external nonReentrant {
        require(initialized && !started, "join closed");
        require(_invited(msg.sender), "not invited");
        require(!isMember[msg.sender], "already joined");

        isMember[msg.sender] = true;
        bondOf[msg.sender] = bond;
        totalBonds += bond;
        if (bond > 0) token.safeTransferFrom(msg.sender, address(this), bond);

        emit Joined(msg.sender);
    }

    /// @notice Anyone can start the circle once every invited member has joined.
    function start() external {
        require(initialized && !started, "already started");
        for (uint256 i; i < payoutOrder.length; i++) {
            require(isMember[payoutOrder[i]], "members missing");
        }
        started = true;
        roundStart = block.timestamp;
        emit Started(block.timestamp);
    }

    /// @notice Contribute this round's fixed amount into escrow.
    function contribute() external nonReentrant onlyStarted {
        require(isMember[msg.sender], "not member");
        require(!paid[currentRound][msg.sender], "already paid");

        paid[currentRound][msg.sender] = true;
        potOf[currentRound] += contribution;
        escrowedPot += contribution;
        token.safeTransferFrom(msg.sender, address(this), contribution);

        emit Contributed(msg.sender, currentRound);
    }

    /// @notice Settle the current round: slash no-shows, pay the scheduled recipient,
    ///         advance to the next round (or finish). Callable by anyone after the
    ///         round window elapses. Recipient is fixed by payoutOrder — not caller-chosen.
    function closeRound() external nonReentrant onlyStarted {
        require(block.timestamp >= roundStart + roundDuration, "round not over");

        uint256 round = currentRound;
        address recipient = payoutOrder[round];
        uint256 pot = potOf[round];

        // Effects: slash members who missed this round into the pot.
        for (uint256 i; i < payoutOrder.length; i++) {
            address m = payoutOrder[i];
            if (!paid[round][m] && bondOf[m] > 0) {
                uint256 s = bondOf[m] >= contribution ? contribution : bondOf[m];
                bondOf[m] -= s;
                totalBonds -= s;
                pot += s;
                escrowedPot += s; // moved from bonds bucket into payable pot
                if (reputation != address(0)) IReputationRegistry(reputation).record(m, -1);
                emit Slashed(m, round, s);
            } else if (paid[round][m] && reputation != address(0)) {
                IReputationRegistry(reputation).record(m, 1);
            }
        }

        escrowedPot -= pot;
        currentRound = round + 1;
        roundStart = block.timestamp;
        if (currentRound >= payoutOrder.length) {
            finished = true;
            emit Finished();
        }

        // Interactions last.
        token.safeTransfer(recipient, pot);
        emit RoundClosed(round, recipient, pot);
    }

    /// @notice After the circle finishes, members withdraw any bond still standing.
    function withdrawBond() external nonReentrant {
        require(finished, "not finished");
        uint256 amt = bondOf[msg.sender];
        require(amt > 0, "nothing to withdraw");
        bondOf[msg.sender] = 0;
        totalBonds -= amt;
        token.safeTransfer(msg.sender, amt);
    }

    // --- views ---
    function members() external view returns (address[] memory) {
        return payoutOrder;
    }

    function memberCount() external view returns (uint256) {
        return payoutOrder.length;
    }

    /// @dev Solvency invariant: the token the contract holds must cover everything
    ///      it still owes (live bonds + unpaid escrow). Used by invariant tests.
    function obligations() external view returns (uint256) {
        return totalBonds + escrowedPot;
    }

    function _invited(address a) internal view returns (bool) {
        for (uint256 i; i < payoutOrder.length; i++) {
            if (payoutOrder[i] == a) return true;
        }
        return false;
    }
}
