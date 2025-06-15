// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

interface IUniswapRouter {
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
}

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract SmartLiquidityVault {
    struct VaultConfig {
        address owner;
        address tokenA;
        address tokenB;
        address lpToken;
        uint256 deposited;
        int256 stopLoss;
        int256 takeProfit;
        bool autoReenter;
        bool active;
        uint256 entryPrice;
    }

    mapping(address => VaultConfig) public vaults;
    address public keeper;
    address public router;
    AggregatorV3Interface public priceFeed;

    event VaultEntered(address indexed user, address tokenA, address tokenB);
    event VaultExited(address indexed user, uint256 amountA, uint256 amountB);
    event VaultReentered(address indexed user);
    event TriggerFired(address indexed user, string trigger);

    modifier onlyKeeper() {
        require(msg.sender == keeper, "Only keeper allowed");
        _;
    }

    constructor(address _router, address _keeper, address _priceFeed) {
        router = _router;
        keeper = _keeper;
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function enterVault(
        address tokenA,
        address tokenB,
        address lpToken,
        uint256 deposited,
        int256 stopLoss,
        int256 takeProfit,
        bool autoReenter
    ) external {
        uint256 entryPrice = getLatestPrice();

        vaults[msg.sender] = VaultConfig({
            owner: msg.sender,
            tokenA: tokenA,
            tokenB: tokenB,
            lpToken: lpToken,
            deposited: deposited,
            stopLoss: stopLoss,
            takeProfit: takeProfit,
            autoReenter: autoReenter,
            active: true,
            entryPrice: entryPrice
        });

        emit VaultEntered(msg.sender, tokenA, tokenB);
    }

    function reenterVault(
        address user,
        uint amountA,
        uint amountB,
        uint amountAMin,
        uint amountBMin
    ) external onlyKeeper {
        VaultConfig storage vault = vaults[user];
        require(!vault.active && vault.autoReenter, "Re-entry conditions not met");

        IERC20(vault.tokenA).transferFrom(user, address(this), amountA);
        IERC20(vault.tokenB).transferFrom(user, address(this), amountB);
        IERC20(vault.tokenA).approve(router, amountA);
        IERC20(vault.tokenB).approve(router, amountB);

        (,, uint liquidity) = IUniswapRouter(router).addLiquidity(
            vault.tokenA,
            vault.tokenB,
            amountA,
            amountB,
            amountAMin,
            amountBMin,
            address(this),
            block.timestamp + 600
        );

        vault.deposited = liquidity;
        vault.entryPrice = getLatestPrice();
        vault.active = true;

        emit VaultReentered(user);
    }

    function markTrigger(address user, string calldata reason) external onlyKeeper {
        emit TriggerFired(user, reason);
    }

    function getLatestPrice() public view returns (uint256) {
        (, int price,,,) = priceFeed.latestRoundData();
        return uint256(price);
    }
}
