'use client';
import { useState, useEffect } from 'react';
import { FaCoins, FaImage, FaPaperPlane } from 'react-icons/fa';
import { useAccount } from 'wagmi';

import { readContract } from '@wagmi/core';
import { useChainId } from 'wagmi'

import { config } from '../config';
import { MASTER, VAULT } from '@/settings';
import VAULT_ABI from '@/abis/vault.json';
import { base } from 'viem/chains';

const logos = [
    {
        src: "https://cryptologos.cc/logos/versions/ethereum-eth-logo-colored.svg?v=033",
        alt: "Ethereum Logo",
    },
    {
        src: "https://cryptologos.cc/logos/bnb-bnb-logo.png?v=033",
        alt: "BSC Logo",
    },
    {
        src: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=033",
        alt: "Polygon Logo",
    },
    {
        src: "https://cryptologos.cc/logos/avalanche-avax-logo.png?v=033",
        alt: "Avalanche Logo",
    },
];

export default function MyCrosschainAssets() {
    const [activeTab, setActiveTab] = useState('tokens');
    const [bscLength, setBscLength] = useState();
    const [baseLength, setBaseLength] = useState();
    const [bscTokens, setBscTokens] = useState([]);
    const [baseTokens, setBaseTokens] = useState([]);

    const { isConnected, address } = useAccount();
    const chain_id = useChainId();

// Generalized function to fetch length
const fetchLength = async (chain) => {
  if (!address) {
    console.log("No address connected");
    return 0;
  }

  try {
    const chainInfo = {
      'BSC': {
        address: VAULT.BSC,
        chainId: 56,
      },
      'BASE': {
        address: VAULT.BASE,
        chainId: 8453,
      }
    };

    const { address: vaultAddress, chainId } = chainInfo[chain];

    const result = await readContract(config, {
      abi: VAULT_ABI,
      address: vaultAddress,
      functionName: 'getLength',
      args: [address],
      chainId: chainId,
    });

    console.log(`fetchLength${chain}: `, result);
    return Number(result);
  } catch (error) {
    console.error(`Error fetching length for ${chain}: `, error);
    return 0;
  }
};

// Generalized function to fetch tokens and balances
const fetchTokensAndBalances = async (chain, length) => {
  if (!address) {
    console.log("No address connected");
    return [];
  }

  try {
    const chainInfo = {
      'BSC': {
        address: VAULT.BSC,
        chainId: 56,
      },
      'BASE': {
        address: VAULT.BASE,
        chainId: 8453,
      }
    };

    const { address: vaultAddress, chainId } = chainInfo[chain];

    let tokens = [];

    for (let i = 0; i < length; i++) {
      // Fetch the token address at index i
      const tokenAddress = await readContract(config, {
        abi: VAULT_ABI,
        address: vaultAddress,
        functionName: 'myCrossChainTokens',
        args: [address, i],
        chainId: chainId,
      });

      // Fetch the balance for the token
      const tokenBalance = await readContract(config, {
        abi: VAULT_ABI,
        address: vaultAddress,
        functionName: 'balance',
        args: [address, tokenAddress],
        chainId: chainId,
      });

      tokens.push({
        address: tokenAddress,
        balance: tokenBalance.toString(), // Convert balance to string if it's a BigNumber
      });
    }

    console.log(`${chain} Tokens with Balances: `, tokens);
    return tokens;
  } catch (error) {
    console.error(`Error fetching tokens and balances for ${chain}: `, error);
    return [];
  }
};

// Use useEffect to fetch data
useEffect(() => {
  if (isConnected) {
    const fetchData = async () => {
      const bscLength = await fetchLength('BSC');
      setBscLength(bscLength);

      const baseLength = await fetchLength('BASE');
      setBaseLength(baseLength);

      const bscTokens = await fetchTokensAndBalances('BSC', bscLength);
      setBscTokens(bscTokens);

      const baseTokens = await fetchTokensAndBalances('BASE', baseLength);
      setBaseTokens(baseTokens);
    };

    fetchData();
  }
}, [isConnected]);


    return (
        <div className="relative bg-white p-6 rounded-2xl shadow-lg border border-blue-600">
            <h2 className="text-blue-600 text-2xl font-bold mb-6">My Crosschain Assets</h2>
            <div className="flex mb-6 space-x-4">
                <button
                    className={`flex items-center px-4 py-2 rounded-lg ${
                        activeTab === 'tokens' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
                    }`}
                    onClick={() => setActiveTab('tokens')}
                >
                    <FaCoins className="mr-2" /> Tokens
                </button>
                <button
                    className={`flex items-center px-4 py-2 rounded-lg cursor-not-allowed opacity-50`}
                    disabled
                >
                    <FaImage className="mr-2" /> NFTs (coming soon!)
                </button>
            </div>

            {activeTab === 'tokens' && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-2xl shadow-lg text-black">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left p-4 whitespace-nowrap">Token Address</th>
                                <th className="text-left p-4 whitespace-nowrap">Token Name</th>
                                <th className="text-left p-4 whitespace-nowrap">Token Symbol</th>
                                <th className="text-left p-4 whitespace-nowrap">Home</th>
                                <th className="text-left p-4 whitespace-nowrap">Destination</th>
                                <th className="text-left p-4 whitespace-nowrap">Balance Home</th>
                                <th className="text-left p-4 whitespace-nowrap">Balance Destination</th>
                                <th className="text-left p-4 whitespace-nowrap">Send</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Replace with dynamic data */}
                            <tr className="border-t border-gray-200">
                                <td className="p-4 whitespace-nowrap">0x123...456</td>
                                <td className="p-4 whitespace-nowrap">Example Token</td>
                                <td className="p-4 whitespace-nowrap">EXT</td>
                                <td className="p-4 whitespace-nowrap">
                                    <img src={logos[0].src} alt={logos[0].alt} className="h-6 inline-block" />
                                </td>
                                <td className="p-4 whitespace-nowrap">
                                    <img src={logos[1].src} alt={logos[1].alt} className="h-6 inline-block" />
                                </td>
                                <td className="p-4 whitespace-nowrap">1000</td>
                                <td className="p-4 whitespace-nowrap">500</td>
                                <td className="p-4 whitespace-nowrap">
                                    <button className="bg-blue-600 text-white py-1 px-3 rounded-lg flex items-center">
                                        <FaPaperPlane className="mr-2" /> Send
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {!isConnected && (
                <div className="absolute inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                    Please connect your wallet!
                </div>
            )}
        </div>
    );
}