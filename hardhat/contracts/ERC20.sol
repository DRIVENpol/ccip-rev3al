// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _supply,
        address _initialOwner
    ) ERC20(_name, _symbol) Ownable(_initialOwner) 
    {
        _mint(_initialOwner, _supply * 10 ** 18);
    }
}