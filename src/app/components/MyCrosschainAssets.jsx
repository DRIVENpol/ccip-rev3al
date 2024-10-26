'use client';
import { useState, useEffect } from 'react';
import { FaCoins, FaImage, FaPaperPlane } from 'react-icons/fa';
import { useAccount } from 'wagmi';
import { readContract } from '@wagmi/core';
import { useChainId } from 'wagmi';
import { config } from '../config';
import { MASTER, VAULT } from '@/settings';
import VAULT_ABI from '@/abis/vault.json';
import ERC20_ABI from '@/abis/erc20.json';
import { ethers } from 'ethers';

const chainLogos = {
  'BSC': {
    src: "https://cryptologos.cc/logos/bnb-bnb-logo.png?v=033",
    alt: "BSC Logo",
  },
  'BASE': {
    src: "https://github.com/base-org/brand-kit/blob/main/logo/symbol/Base_Symbol_Blue.png?raw=true",
    alt: "Base Logo",
  },
};

const truncateAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export default function MyCrosschainAssets() {
  const [activeTab, setActiveTab] = useState('tokens');
  const [bscLength, setBscLength] = useState(0);
  const [baseLength, setBaseLength] = useState(0);
  const [bscTokens, setBscTokens] = useState([]);
  const [baseTokens, setBaseTokens] = useState([]);

  const { isConnected, address } = useAccount();

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
        },
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
        },
      };

      const { address: vaultAddress, chainId } = chainInfo[chain];

      let tokens = [];

      for (let i = 0; i < length; i++) {
        const tokenAddress = await readContract(config, {
          abi: VAULT_ABI,
          address: vaultAddress,
          functionName: 'myCrossChainTokens',
          args: [address, i],
          chainId: chainId,
        });

        const tokenBalance = await readContract(config, {
          abi: VAULT_ABI,
          address: vaultAddress,
          functionName: 'balance',
          args: [address, tokenAddress],
          chainId: chainId,
        });

        const [tokenName, tokenSymbol, tokenDecimals] = await Promise.all([
          readContract(config, {
            abi: ERC20_ABI,
            address: tokenAddress,
            functionName: 'name',
            chainId: chainId,
          }),
          readContract(config, {
            abi: ERC20_ABI,
            address: tokenAddress,
            functionName: 'symbol',
            chainId: chainId,
          }),
          readContract(config, {
            abi: ERC20_ABI,
            address: tokenAddress,
            functionName: 'decimals',
            chainId: chainId,
          }),
        ]);

        tokens.push({
          address: tokenAddress,
          balance: tokenBalance.toString(),
          name: tokenName,
          symbol: tokenSymbol,
          decimals: Number(tokenDecimals),
        });
      }

      console.log(`${chain} Tokens with Balances: `, tokens);
      return tokens;
    } catch (error) {
      console.error(`Error fetching tokens and balances for ${chain}: `, error);
      return [];
    }
  };

  useEffect(() => {
    if (isConnected) {
      const fetchData = async () => {
        const bscLen = await fetchLength('BSC');
        setBscLength(bscLen);

        const baseLen = await fetchLength('BASE');
        setBaseLength(baseLen);

        const bscToks = await fetchTokensAndBalances('BSC', bscLen);
        setBscTokens(bscToks);

        const baseToks = await fetchTokensAndBalances('BASE', baseLen);
        setBaseTokens(baseToks);
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
                <th className="text-left p-4 whitespace-nowrap">Balance</th>
                <th className="text-left p-4 whitespace-nowrap">Send</th>
              </tr>
            </thead>
            <tbody>
              {bscTokens.map((token, index) => (
                <tr key={`bsc-${index}`} className="border-t border-gray-200">
                  <td className="p-4 whitespace-nowrap">{truncateAddress(token.address)}</td>
                  <td className="p-4 whitespace-nowrap">{token.name}</td>
                  <td className="p-4 whitespace-nowrap">{token.symbol}</td>
                  <td className="p-4 whitespace-nowrap">
                    <img src={chainLogos['BSC'].src} alt={chainLogos['BSC'].alt} className="h-6 inline-block" />
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <img src={chainLogos['BASE'].src} alt={chainLogos['BASE'].alt} className="h-6 inline-block" />
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {ethers.formatUnits(token.balance, token.decimals)}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <button className="bg-blue-600 text-white py-1 px-3 rounded-lg flex items-center">
                      <FaPaperPlane className="mr-2" /> Send
                    </button>
                  </td>
                </tr>
              ))}
              {baseTokens.map((token, index) => (
                <tr key={`base-${index}`} className="border-t border-gray-200">
                  <td className="p-4 whitespace-nowrap">{truncateAddress(token.address)}</td>
                  <td className="p-4 whitespace-nowrap">{token.name}</td>
                  <td className="p-4 whitespace-nowrap">{token.symbol}</td>
                  <td className="p-4 whitespace-nowrap">
                    <img src={chainLogos['BASE'].src} alt={chainLogos['BASE'].alt} className="h-6 inline-block" />
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <img src={chainLogos['BSC'].src} alt={chainLogos['BSC'].alt} className="h-6 inline-block" />
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {ethers.formatUnits(token.balance, token.decimals)}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <button className="bg-blue-600 text-white py-1 px-3 rounded-lg flex items-center">
                      <FaPaperPlane className="mr-2" /> Send
                    </button>
                  </td>
                </tr>
              ))}
              {bscTokens.length === 0 && baseTokens.length === 0 && (
                <tr>
                  <td className="p-4 text-center" colSpan="7">
                    No tokens found.
                  </td>
                </tr>
              )}
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
