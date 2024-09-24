// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Functions
// 1) Deposit an ERC20 token > call the master contract > add the amount
// 2) Withdraw the deposited tokens > call the master contract > substract the amount
// 3) Receive a call from the other chain > send tokens out

contract Base_Vault {
    function depositToken(address user, address token, uint256 amount) external virtual {}
    function withdrawTokens(address token, uint256 amount) external virtual {}
    function _sendTokensOut(address from, address to, address token, uint256 amount) internal virtual {}
    function getLength(address user) external virtual view returns(uint256) {}
}

// Vault on BSC | From Avalanche
contract Vault_CCIP is CCIPReceiver, Base_Vault, Ownable {
    using SafeERC20 for IERC20;

    uint64 immutable destinationChainSelector = 16015286601757825753;

    address private master; // Contract from the other network
    address private router_ccip = 0xE1053aE1857476f36A3C62580FF9b016E8EE8F6f;

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
            abi.decode(any2EvmMessage.sender, (address)) == master,
            "Invalid sender!"
        );

        (
            address _user,
            address _to,
            address _token,
            uint256 _amount
        ) = abi.decode(any2EvmMessage.data, (address,address,address,uint256));
            _sendTokensOut(_user, _to, _token, _amount);
    }

    function depositToken(address user, address token, uint256 amount) external override {
        IERC20(token).safeTransferFrom(user, address(this), amount);

        balance[user][token] += amount;

        // If token don't exist in the array, we add it
        if(!tokenExist[user][token]) {
            tokenExist[user][token] = true;
            myCrossChainTokens[user].push(token);
        }

        // Call the contract from the other chain to add the amount
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            user,
            token,
            amount,
            true,
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

    function withdrawTokens(address token, uint256 amount) external override {
        require(
           amount <= balance[msg.sender][token],
           "Not enough balance!"
        );

        balance[msg.sender][token] -= amount;

        _checkBalanceAndRemove(msg.sender, token);

        // Call the contract from the other chain to substract the amount;
       Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            msg.sender,
            token,
            amount,
            false,
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

        IERC20(token).safeTransfer(msg.sender, amount);
    }

    function _sendTokensOut(address from, address to, address token, uint256 amount) internal override {
        require(
            tokenExist[from][token],
            "Token don't exist!"
        );

        require(
            amount <= balance[msg.sender][token],
            "Not enough balance!"
        );

        balance[from][token] -= amount;

        _checkBalanceAndRemove(from, token);

        IERC20(token).safeTransfer(to, amount);
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

    function changeMaster(address newMaster) external onlyOwner {
        master = newMaster;
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
        address _token,
        uint256 _amount,
        bool _add,
        address _feeTokenAddress
    ) private view returns (Client.EVM2AnyMessage memory) {
        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(master),
                data: abi.encode(_user, _token, _amount, _add),
                tokenAmounts: new Client.EVMTokenAmount[](0),
                extraArgs: Client._argsToBytes(
                    Client.EVMExtraArgsV1({gasLimit: 200_000})
                ),
                feeToken: _feeTokenAddress
            });
    }
}