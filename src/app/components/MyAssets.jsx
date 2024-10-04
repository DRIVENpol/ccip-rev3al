'use client';
import { useState, useEffect } from 'react';
import { FaCoins, FaImage } from 'react-icons/fa';
import { useAccount } from 'wagmi';
import { readContract } from '@wagmi/core';
import TOKEN_LAUNCHER_ABI from '@/abis/tokenLauncher.json';
import { TOKEN_LAUNCHER } from '@/settings';
import { config } from '../config';

export default function MyAssets() {
    const { isConnected, address } = useAccount();
    const [activeTab, setActiveTab] = useState('tokens');
    const [selectedChain, setSelectedChain] = useState('all');
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const chainOptions = [
        { label: 'All Chains', value: 'all' },
        { label: 'Base', value: 'base' },
        { label: 'BSC', value: 'bsc' },
    ];

    const CHAIN_IDS = {
        BASE: 43114,
        BSC: 56,
    };

    useEffect(() => {
        if (isConnected) {
            const intervalId = setInterval(() => {
                fetchTokens();
            }, 5000);

            return () => clearInterval(intervalId);
        }
    }, [isConnected, selectedChain]);

    const fetchTokens = async () => {
        let chainsToFetch = [];
        if (selectedChain === 'all') {
            chainsToFetch = ['BSC', 'BASE'];
        } else {
            chainsToFetch = [selectedChain.toUpperCase()];
        }

        const fetchedTokens = [];
        for (let chain of chainsToFetch) {
            const tokenLauncherAddress = TOKEN_LAUNCHER[chain];
            const _chainId = CHAIN_IDS[chain];

            if (!tokenLauncherAddress || !_chainId) continue;

            const length = await fetchTokensLength(tokenLauncherAddress, _chainId);
            console.log("Length: " , length);

            for (let i = 0; i < length; i++) {
                const tokenDetails = await fetchTokenDetails(tokenLauncherAddress, _chainId, i);
                console.log("Details: ", tokenDetails);
                if (tokenDetails) {
                    fetchedTokens.push({
                        chain,
                        address: tokenDetails[3],
                        name: tokenDetails[0],
                        symbol: tokenDetails[1],
                        supply: tokenDetails[2].toString(),
                    });
                }

            }
     };
     setTokens(fetchedTokens);
    }

    const fetchTokensLength = async (tokenLauncherAddress, _chainId) => {
        const result = await readContract(config, {
            abi: TOKEN_LAUNCHER_ABI,
            address: tokenLauncherAddress,
            functionName: 'getTokensLength',
            args: [address],
            chainId: _chainId
          });
    
          const length = Number(result);

          return(length);
    };

    const fetchTokenDetails = async (tokenLauncherAddress, _chainId, index) => {
        try {
            const result = await readContract(config, {
                address: tokenLauncherAddress,
                abi: TOKEN_LAUNCHER_ABI,
                functionName: 'myTokens',
                args: [address, index],
                chainId: _chainId,
            });
            console.log("My tokens", result);
            return result;
        } catch (error) {
            console.error(`Error fetching token details for index ${index} on chainId ${chainId}:`, error);
            return null;
        }
    };

    const handleChainChange = (event) => {
        setSelectedChain(event.target.value);
    };

    return (
        <div className="relative bg-white p-6 rounded-2xl shadow-lg mt-8 border border-blue-600">
            <h2 className="text-blue-600 text-2xl font-bold mb-6">My Created Assets</h2>
            <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <div className="flex space-x-4">
                    <button
                        className={`flex items-center px-3 py-1.5 rounded-lg ${
                            activeTab === 'tokens' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
                        }`}
                        onClick={() => setActiveTab('tokens')}
                    >
                        <FaCoins className="mr-2" /> Tokens
                    </button>
                    <button
                        className={`flex items-center px-3 py-1.5 rounded-lg cursor-not-allowed opacity-50`}
                        disabled
                    >
                        <FaImage className="mr-2" /> NFTs (Coming Soon!)
                    </button>
                </div>
                <div className="w-full sm:w-auto flex justify-center mt-4 sm:mt-0">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="chainFilter" className="text-gray-700 font-medium">Filter by Chain:</label>
                        <select
                            id="chainFilter"
                            value={selectedChain}
                            onChange={handleChainChange}
                            className="px-4 py-2 rounded-lg bg-gray-200 text-black border border-gray-300"
                        >
                            {chainOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <div className="loader"></div>
                </div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : (
                activeTab === 'tokens' && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-2xl shadow-lg text-black">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-left p-4 whitespace-nowrap">Chain</th>
                                    <th className="text-left p-4 whitespace-nowrap">Token Address</th>
                                    <th className="text-left p-4 whitespace-nowrap">Token Name</th>
                                    <th className="text-left p-4 whitespace-nowrap">Token Symbol</th>
                                    <th className="text-left p-4 whitespace-nowrap">Supply</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tokens.map((token, index) => (
                                    <tr key={index} className="border-t border-gray-200">
                                        <td className="p-4 whitespace-nowrap">{token.chain}</td>
                                        <td className="p-4 whitespace-nowrap">{token.address}</td>
                                        <td className="p-4 whitespace-nowrap">{token.name}</td>
                                        <td className="p-4 whitespace-nowrap">{token.symbol}</td>
                                        <td className="p-4 whitespace-nowrap">{token.supply}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {!isConnected && (
                <div className="absolute inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                    Please connect your wallet!
                </div>
            )}
        </div>
    );
}
