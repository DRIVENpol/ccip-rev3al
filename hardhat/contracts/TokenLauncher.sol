//SPDX-License-Identifier:MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import { MyToken } from "./ERC20.sol";

contract TokenLauncher is Ownable {

    struct TokenObject {
        string _name;
        string _symbol;
        uint256 _supply;
        address _ca;
        string _chain;
    }

    mapping(address => TokenObject[]) public myTokens;

    constructor() Ownable(msg.sender) {}

    function launchToken(
        string memory _name,
        string memory _symbol,
        uint256 _supply,
        address _owner
    ) external payable {

        MyToken _newTokenObject = new MyToken(
            _name,
            _symbol,
            _supply,
            _owner
        );

        address _newTokenCa = address(_newTokenObject);

        if(_newTokenCa == address(0)) {
            revert("No new token!");
        }

        TokenObject memory _newToken = TokenObject(
            _name,
            _symbol,
            _supply,
            _newTokenCa,
            "BSC"
        );

        myTokens[_owner].push(_newToken);
    }

    function getTokensLength(address _who) public view returns(uint256) {
        return myTokens[_who].length;
    }

}