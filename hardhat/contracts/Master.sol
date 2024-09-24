// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";

// Functions
// 1) Receive a call from the other chain > add balance
// 2) Receive a call from the other chain > remove balance
// 3) Call the other chain > send tokens out

// Master On Avalanche
contract Base_Master {
    function _depositToken(address user, address token, uint256 amount) internal virtual {}
    function _withdrawTokens(address user, address token, uint256 amount) internal virtual {}
    function sendTokensOut(address to, address token, uint256 amount) external virtual {}
    function getLength(address user) external virtual view returns(uint256) {}
}

contract Master is CCIPReceiver, Base_Master, Ownable {
    using SafeERC20 for IERC20;

    uint64 immutable destinationChainSelector = 13264668187771770619;

    address private vault; // Vault on the destination chain
    address private router_ccip = 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59;

    mapping(address => address[]) public myCrossChainTokens;
    mapping(address => mapping(address => uint256)) public balance;
    mapping(address => mapping(address => bool)) public tokenExist;

    error FailedToWithdrawEth(address owner, address target, uint256 value);

    constructor() Ownable(msg.sender) CCIPReceiver(router_ccip) {}

    receive() external payable {}

    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    )
        internal
        override
    {
        require(
            abi.decode(any2EvmMessage.sender, (address)) == vault,
            "Invalid sender!"
        );

        (
            address _user,
            address _token,
            uint256 _amount,
            bool _add
        ) = abi.decode(any2EvmMessage.data, (address,address,uint256,bool));

        if(_add) {
            _depositToken(_user, _token, _amount);
        } else {
            _withdrawTokens(_user, _token, _amount);
        }
    }

    function _depositToken(address user, address token, uint256 amount) internal override {
        if(!tokenExist[user][token]) {
            myCrossChainTokens[user].push(token);
            tokenExist[user][token] = true;
        }

        balance[user][token] += amount;
    }

    function _withdrawTokens(address user, address token, uint256 amount) internal override {
        require(
           amount <= balance[user][token],
           "Not enough balance!"
        );

        balance[user][token] -= amount;

        _checkBalanceAndRemove(user, token);
    }

    function sendTokensOut(address to, address token, uint256 amount) external override {
        require(
           amount <= balance[msg.sender][token],
           "Not enough balance!"
        );

        balance[msg.sender][token] -= amount;

        _checkBalanceAndRemove(msg.sender, token);

        // Call the contrct on the other chain
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            msg.sender,
            to,
            token,
            amount,
            address(0)
        );

        // Initialize a router client instance to interact with cross-chain router
        IRouterClient router = IRouterClient(this.getRouter());

        // Get the fee required to send the CCIP message
        uint256 fees = router.getFee(destinationChainSelector, evm2AnyMessage);

        if (fees > address(this).balance) revert("Not enough balance!");

        router.ccipSend{value: fees}(
            destinationChainSelector,
            evm2AnyMessage
        );
    }

    function setVault(address newVault) external onlyOwner {
        vault = newVault;
    }

    function withdrawNative(address beneficiary) external onlyOwner {
        uint256 amount = address(this).balance;
        (bool sent, ) = beneficiary.call{value: amount}("");
        if (!sent) revert FailedToWithdrawEth(msg.sender, beneficiary, amount);
    }

    function withdrawToken(
        address beneficiary,
        address token
    ) external onlyOwner {
        uint256 amount = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransfer(beneficiary, amount);
    }

    function getLength(address user) external override view returns(uint256) {
        return myCrossChainTokens[user].length;
    }

    function _checkBalanceAndRemove(address from, address token) internal {
        if(balance[from][token] == 0) {
            tokenExist[from][token] = false;

            for(uint256 i = 0; i < myCrossChainTokens[from].length; i++) {
                if(myCrossChainTokens[from][i] == token) {
                   myCrossChainTokens[from][i] = myCrossChainTokens[from][myCrossChainTokens[from].length - 1];
                   myCrossChainTokens[from].pop(); 
                }
            }
        }
    }

    function _buildCCIPMessage(
        address _user,
        address _to,
        address _token,
        uint256 _amount,
        address _feeTokenAddress
    ) private view returns (Client.EVM2AnyMessage memory) {
        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(vault),
                data: abi.encode(_user, _to, _token, _amount),
                tokenAmounts: new Client.EVMTokenAmount[](0),
                extraArgs: Client._argsToBytes(
                    Client.EVMExtraArgsV1({gasLimit: 200_000})
                ),
                feeToken: _feeTokenAddress
            });
    }
}