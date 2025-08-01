// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint8 decimals) ERC20(name, symbol) {
        _mint(msg.sender, 1_000_000 * (10 ** uint256(decimals)));
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
