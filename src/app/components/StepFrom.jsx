'use client';
import { useState, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useForm } from 'react-hook-form';
import { readContract, writeContract } from '@wagmi/core';
import TOKEN_LAUNCHER_ABI from '@/abis/tokenLauncher.json';
import TOKEN_ABI from '@/abis/erc20.json';
import VAULT_ABI from '@/abis/vault.json';
import { TOKEN_LAUNCHER, VAULT } from '@/settings';
import { config } from '../config';
import { ethers } from 'ethers';

const logos = [
    {
        src: "https://cryptologos.cc/logos/bnb-bnb-logo.png?v=033",
        alt: "BNB Smart Chain",
        chainId: 56,
    },
    {
        src: "https://github.com/base-org/brand-kit/blob/main/logo/symbol/Base_Symbol_Blue.png?raw=true",
        alt: "BASE",
        chainId: 8453,
    },
];

export default function StepForm() {
    const { isConnected, address, chainId } = useAccount();
    const { register, handleSubmit, watch, setValue } = useForm();
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [tokenBalanceRaw, setTokenBalanceRaw] = useState(BigInt(0));
    const [tokenBalance, setTokenBalance] = useState('0');
    const [tokenDecimals, setTokenDecimals] = useState(18);
    const [currentAllowance, setAllowance] = useState(BigInt(0));
    const [selectedTokenAddress, setSelectedTokenAddress] = useState('');
    const [isApproving, setIsApproving] = useState(false);
    const [isDepositing, setIsDepositing] = useState(false);
    const [approvalTransactionHash, setApprovalTransactionHash] = useState(null);

    const amount = watch('amount');
    const CHAIN_IDS = {
        8453: 'BASE',
        56: 'BSC',
    };

    const fetchTokens = async () => {
        if (!CHAIN_IDS[chainId]) {
            setTokens([]);
            return;
        }

        const chainName = CHAIN_IDS[chainId];
        setLoading(true);
        setError(null);

        try {
            const tokenLauncherAddress = TOKEN_LAUNCHER[chainName];
            if (!tokenLauncherAddress) {
                setError('Invalid chain selected');
                setLoading(false);
                return;
            }

            const length = await fetchTokensLength(tokenLauncherAddress, chainId);
            const fetchedTokens = [];

            for (let i = 0; i < length; i++) {
                const tokenDetails = await fetchTokenDetails(tokenLauncherAddress, chainId, i);
                if (tokenDetails) {
                    fetchedTokens.push({
                        address: tokenDetails[3],
                        name: tokenDetails[0],
                        symbol: tokenDetails[1],
                        supply: tokenDetails[2].toString(),
                    });
                }
            }

            setTokens(fetchedTokens);
            console.log("Fetched token: ", fetchTokens)

            if (fetchedTokens.length > 0) {
                setSelectedTokenAddress(fetchedTokens[0].address);
            } else {
                setSelectedTokenAddress('');
            }

        } catch (error) {
            setError('Failed to fetch tokens');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTokensLength = async (tokenLauncherAddress, chainId) => {
        try {
            const result = await readContract(config, {
                abi: TOKEN_LAUNCHER_ABI,
                address: tokenLauncherAddress,
                functionName: 'getTokensLength',
                args: [address],
                chainId: chainId,
            });

            return Number(result);
        } catch (error) {
            console.error(`Error fetching tokens length on chainId ${chainId}:`, error);
            return 0;
        }
    };

    const fetchTokenDetails = async (tokenLauncherAddress, chainId, index) => {
        try {
            const result = await readContract(config, {
                address: tokenLauncherAddress,
                abi: TOKEN_LAUNCHER_ABI,
                functionName: 'myTokens',
                args: [address, index],
                chainId: chainId,
            });
            return result;
        } catch (error) {
            console.error(`Error fetching token details for index ${index} on chainId ${chainId}:`, error);
            return null;
        }
    };

    useEffect(() => {
        if (isConnected) {
            fetchTokens();
        }
    }, [chainId, isConnected]);

    const fetchTokenBalance = async () => {
        try {
            if (!selectedTokenAddress) {
                setTokenBalanceRaw(BigInt(0));
                setTokenBalance('0');
                setTokenDecimals(18);
                return;
            }

            const decimalsResult = await readContract(config, {
                abi: TOKEN_ABI,
                address: selectedTokenAddress,
                functionName: 'decimals',
                chainId: chainId,
            });
            const decimals = Number(decimalsResult);
            setTokenDecimals(decimals);

            const balanceRaw = await readContract(config, {
                abi: TOKEN_ABI,
                address: selectedTokenAddress,
                functionName: 'balanceOf',
                args: [address],
                chainId: chainId,
            });

            const balanceRawBigNumber = BigInt(balanceRaw);

            const balanceFormatted = ethers.formatUnits(balanceRawBigNumber, decimals);

            setTokenBalanceRaw(balanceRawBigNumber);
            setTokenBalance(balanceFormatted);

        } catch (error) {
            console.error("Error fetching token balance: ", error);
            setTokenBalanceRaw(BigInt(0));
            setTokenBalance('0');
            setTokenDecimals(18);
        }
    };

    useEffect(() => {
        if (isConnected) {
            fetchTokenBalance();
        }
    }, [selectedTokenAddress, isConnected]);

    const fetchAllowance = async () => {
        try {
            if (!selectedTokenAddress) {
                setAllowance(BigInt(0));
                return;
            }

            const result = await readContract(config, {
                abi: TOKEN_ABI,
                address: selectedTokenAddress,
                functionName: 'allowance',
                args: [address, VAULT[CHAIN_IDS[chainId]]],
                chainId: chainId,
            });

            setAllowance(BigInt(result));
            console.log("Allowance: ", BigInt(result).toString());
        } catch (error) {
            console.log("Can't fetch allowance: ", error);
            setAllowance(BigInt(0));
        }
    };

    useEffect(() => {
        fetchAllowance();
    }, [selectedTokenAddress, amount, isConnected]);

    const giveAllowance = async () => {
        try {
            setIsApproving(true);
            const amountToApprove = ethers.parseUnits(amount, tokenDecimals);

            console.log("Before approving --------");
            console.log(selectedTokenAddress);
            console.log(VAULT[CHAIN_IDS[chainId]]);
            console.log(amountToApprove.toString());

            const tx = await writeContract(config, {
                address: selectedTokenAddress,
                abi: TOKEN_ABI,
                functionName: 'approve',
                args: [VAULT[CHAIN_IDS[chainId]], amountToApprove.toString()],
                chainId: chainId,
            });

            setApprovalTransactionHash(tx.hash);
        } catch (error) {
            console.log("Approval error: ", error);
            setIsApproving(false);
        }
    };

    const { data: approvalData, isLoading: isWaitingForApproval } = useWaitForTransactionReceipt({
        hash: approvalTransactionHash,
        onSuccess: () => {
            fetchAllowance(); 
            setIsApproving(false);
            setApprovalTransactionHash(null);
        },
        onError: () => {
            setIsApproving(false);
            setApprovalTransactionHash(null);
        }
    });

    const depositTokens = async () => {
        try {
            setIsDepositing(true);
            const amountToDeposit = ethers.parseUnits(amount, tokenDecimals);
            console.log("ADDR: ", selectedTokenAddress)
            console.log("SC: ", VAULT[CHAIN_IDS[chainId]])
            console.log("Amount to deposit: ", amountToDeposit.toString());
            await writeContract(config, {
                address: VAULT[CHAIN_IDS[chainId]],
                abi: VAULT_ABI,
                functionName: 'depositToken',
                args: [address, selectedTokenAddress, amountToDeposit.toString()],
                chainId: chainId,
            });

            setIsDepositing(false);
            console.log("Tokens deposited successfully!");
        } catch (error) {
            console.log("Deposit error: ", error);
            setIsDepositing(false);
        }
    };

    const onSubmit = (data) => {
        console.log("Form Data: ", data);
    };

    const requiredAmount = ethers.parseUnits(amount ? amount : '0', tokenDecimals);

    const needsApproval = currentAllowance < requiredAmount;

    return (
        <div className="relative bg-white p-6 rounded-lg shadow-lg border border-blue-600">
            <h2 className="text-blue-600 text-2xl font-bold mb-4">Make Your Token Crosschain</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step 0: Select Token Type */}
                <div className="mb-4">
                    <label className="block text-blue-600 text-sm font-medium mb-2">Select Token Type</label>
                    <select
                        {...register('tokenType')}
                        defaultValue="erc20"
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="erc20">ERC20</option>
                        <option value="erc721" disabled>ERC721 (Coming Soon!)</option>
                    </select>
                </div>

                {/* Step 1: Select Home Chain */}
                <div className="mb-8">
                    <label className="block text-blue-600 text-sm font-medium mb-2">
                        Select Home Chain
                    </label>
                    <w3m-network-button />
                </div>

                {/* Step 2: Select Token */}
                <div className="mb-4">
                    <label className="block text-blue-600 text-sm font-medium mb-2">Select Token</label>
                    <select
                        {...register('selectedToken')}
                        onChange={(e) => setSelectedTokenAddress(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="" disabled>Select your token</option>
                        {tokens.map((token, index) => (
                            <option key={index} value={token.address}>{token.name} ({token.symbol})</option>
                        ))}
                    </select>
                </div>

                {/* Step 3: Select Destination Chain */}
                <div className="mb-4">
                    <label className="block text-blue-600 text-sm font-medium mb-2">Select Destination Chain</label>
                    <select
                        {...register('destinationChain')}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="" disabled>Select destination chain</option>
                        {logos.filter((logo) => logo.chainId !== chainId).map((logo, index) => (
                            <option key={index} value={logo.chainId}>{logo.alt}</option>
                        ))}
                    </select>
                </div>

                {/* Step 4: Input Amount or ID */}
                <div className="mb-4">
                    {watch('tokenType') === 'erc20' ? (
                        <>
                            <label className="block text-blue-600 text-sm font-medium mb-2">Amount</label>
                            <div className="flex">
                                <input
                                    type="number"
                                    step="any"
                                    {...register('amount')}
                                    className="w-full p-2 border border-gray-300 rounded-l"
                                />
                                <button
                                    type="button"
                                    onClick={() => setValue('amount', tokenBalance)}
                                    className="bg-blue-600 text-white py-2 px-4 rounded-r"
                                >
                                    Max
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Balance: {tokenBalance}</p>
                        </>
                    ) : (
                        <>
                            <label className="block text-blue-600 text-sm font-medium mb-2">ID</label>
                            <input
                                type="text"
                                {...register('nftId')}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </>
                    )}
                </div>

                {/* Approve or Deposit */}
                {needsApproval ? (
                    <button
                        type="button"
                        onClick={giveAllowance}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg text-lg disabled:opacity-50"
                        disabled={isApproving || isDepositing || isWaitingForApproval}
                    >
                        {isApproving || isWaitingForApproval ? (
                            <div role="status">
                                <span>Loading...</span>
                            </div>
                        ) : (
                            <>Approve Tokens</>
                        )}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={depositTokens}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg text-lg disabled:opacity-50"
                        disabled={isDepositing}
                    >
                        {isDepositing ? (
                            <div role="status">
                                <span>Loading...</span>
                            </div>
                        ) : (
                            <>Deposit</>
                        )}
                    </button>
                )}
            </form>

            {!isConnected && (
                <div className="absolute inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    Please connect your wallet!
                </div>
            )}

            {error && (
                <div className="text-red-600 mt-4">{error}</div>
            )}
        </div>
    );
}
