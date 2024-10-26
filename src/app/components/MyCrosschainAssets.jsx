'use client';
import { useState, useEffect } from 'react';
import { FaCoins, FaImage } from 'react-icons/fa';
import { useAccount, useChainId } from 'wagmi';
import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { config } from '../config';
import { MASTER, VAULT } from '@/settings';
import VAULT_ABI from '@/abis/vault.json';
import MASTER_ABI from '@/abis/master.json';
import ERC20_ABI from '@/abis/erc20.json';
import { ethers } from 'ethers';
import ActionButton from './ActionButton';
import Toast from './Toast';

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

const chainIdToName = {
  56: 'BSC',
  8453: 'BASE',
};

const chainNameToChainId = {
  'BSC': 56,
  'BASE': 8453,
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
  const [toast, setToast] = useState(null);

  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const chainName = chainIdToName[chainId];

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
      setToast({
        type: 'error',
        message: `Error fetching length for ${chain}: ${error.message}`,
      });
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
          chain: chain,
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
      setToast({
        type: 'error',
        message: `Error fetching tokens for ${chain}: ${error.message}`,
      });
      return [];
    }
  };

  useEffect(() => {
    if (!isConnected) return; 

    const fetchData = async () => {
      try {
        const bscLen = await fetchLength('BSC');
        setBscLength(bscLen);

        const baseLen = await fetchLength('BASE');
        setBaseLength(baseLen);

        const bscToks = await fetchTokensAndBalances('BSC', bscLen);
        setBscTokens(bscToks);

        const baseToks = await fetchTokensAndBalances('BASE', baseLen);
        setBaseTokens(baseToks);
      } catch (error) {
        console.error("Error fetching data:", error);
        setToast({
          type: 'error',
          message: `Error fetching data: ${error.message}`,
        });
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, [isConnected]);

  const handleWithdraw = async (token, amountStr) => {
    if (!amountStr) return;
    const amount = ethers.parseUnits(amountStr, token.decimals);

    const vaultAddress = VAULT[token.chain];
    const tokenChainId = chainNameToChainId[token.chain];

    try {
      const txHash = await writeContract(config, {
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'withdrawTokens',
        args: [token.address, amount.toString()],
        chainId: tokenChainId,
        // Include fee if necessary
      });

      console.log('Transaction Hash:', txHash);

      const receipt = await waitForTransactionReceipt(config, {
        hash: txHash,
        confirmations: 2,
        pollingInterval: 1000,
        onReplaced: (replacement) => {
          console.log('Transaction was replaced:', replacement);
          setToast({
            type: 'warning',
            message: `Transaction was replaced: ${replacement.transaction.hash}`,
          });
        },
      });

      console.log('Transaction Receipt:', receipt);
      console.log('Transaction Status:', receipt.status, typeof receipt.status);

      if (receipt.status === 1n || receipt.status === 'success') {
        setToast({
          type: 'success',
          message: (
            <>
              Successfully withdrew {ethers.formatUnits(amount, token.decimals)} {token.symbol} from {token.chain}.<br />
              You can track the transaction by accessing{' '}
              <a
                href={`https://www.${chainIdToName[chainId] == 'BASE' ? "basescan.org" : "bscscan.com"}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600"
              >
                www.{chainIdToName[chainId] == 'BASE' ? "basescan.org" : "bscscan.com"}
              </a>
              .
            </>
          ),
        });

        if (token.chain === 'BSC') {
          const bscToks = await fetchTokensAndBalances('BSC', bscLength);
          setBscTokens(bscToks);
        } else {
          const baseToks = await fetchTokensAndBalances('BASE', baseLength);
          setBaseTokens(baseToks);
        }
      } else if (receipt.status === 0n || receipt.status === 'fail') {
        setToast({
          type: 'error',
          message: `Transaction failed: ${txHash}`,
        });
      } else {
        setToast({
          type: 'error',
          message: `Unexpected transaction status: ${receipt.status}`,
        });
      }
    } catch (error) {
      console.error("Error withdrawing tokens: ", error);
      setToast({
        type: 'error',
        message: `Error withdrawing tokens: ${error.message}`,
      });
    }
  };

  const handleSend = async (token, to, amountStr) => {
    if (!to || !amountStr) return;

    const amount = ethers.parseUnits(amountStr, token.decimals);

    const masterAddress = MASTER[token.chain];
    const tokenChainId = chainNameToChainId[token.chain];

    try {
      const txHash = await writeContract(config, {
        address: masterAddress,
        abi: MASTER_ABI,
        functionName: 'sendTokensOut',
        args: [to, token.address, amount.toString()],
        chainId: tokenChainId,
        // Include fee if necessary
      });

      console.log('Transaction Hash:', txHash);

      const receipt = await waitForTransactionReceipt(config, {
        hash: txHash,
        confirmations: 2,
        pollingInterval: 1000,
        onReplaced: (replacement) => {
          console.log('Transaction was replaced:', replacement);
          setToast({
            type: 'warning',
            message: `Transaction was replaced: ${replacement.transaction.hash}`,
          });
        },
      });

      console.log('Transaction Receipt:', receipt);
      console.log('Transaction Status:', receipt.status, typeof receipt.status);


      if (receipt.status === 1n || receipt.status === 'success') {
        setToast({
          type: 'success',
          message: (
            <>
              Successfully sent {ethers.formatUnits(amount, token.decimals)} {token.symbol} to {to}.<br />
              The balance change will reflect after the crosschain transaction is finished, which can take up to 20 minutes.<br />
              You can track it by accessing{' '}
              <a
                href={`https://ccip.chain.link/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600"
              >
               ccip.chain.link
              </a>
              .
            </>
          ),
        });

        if (token.chain === 'BSC') {
          const bscToks = await fetchTokensAndBalances('BSC', bscLength);
          setBscTokens(bscToks);
        } else {
          const baseToks = await fetchTokensAndBalances('BASE', baseLength);
          setBaseTokens(baseToks);
        }
      } else if (receipt.status === 0n) {
        setToast({
          type: 'error',
          message: `Transaction failed: ${txHash}`,
        });
      } else {
        setToast({
          type: 'error',
          message: `Unexpected transaction status: ${receipt.status}`,
        });
      }
    } catch (error) {
      console.error("Error sending tokens: ", error);
      setToast({
        type: 'error',
        message: `Error sending tokens: ${error.message}`,
      });
    }
  };

  const closeToast = () => setToast(null);

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
                <th className="text-left p-4 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {bscTokens.map((token, index) => (
                <tr key={`bsc-${index}`} className="border-t border-gray-200">
                  <td className="p-4 whitespace-nowrap">{truncateAddress(token.address)}</td>
                  <td className="p-4 whitespace-nowrap">{token.name}</td>
                  <td className="p-4 whitespace-nowrap">{token.symbol}</td>
                  <td className="p-4 whitespace-nowrap">
                    <img
                      src={chainLogos['BSC'].src}
                      alt={chainLogos['BSC'].alt}
                      className="h-6 inline-block"
                    />
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <img
                      src={chainLogos['BASE'].src}
                      alt={chainLogos['BASE'].alt}
                      className="h-6 inline-block"
                    />
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {ethers.formatUnits(token.balance, token.decimals)}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <ActionButton
                      token={token}
                      chainName={chainName}
                      handleWithdraw={handleWithdraw}
                      handleSend={handleSend}
                    />
                  </td>
                </tr>
              ))}
              {baseTokens.map((token, index) => (
                <tr key={`base-${index}`} className="border-t border-gray-200">
                  <td className="p-4 whitespace-nowrap">{truncateAddress(token.address)}</td>
                  <td className="p-4 whitespace-nowrap">{token.name}</td>
                  <td className="p-4 whitespace-nowrap">{token.symbol}</td>
                  <td className="p-4 whitespace-nowrap">
                    <img
                      src={chainLogos['BASE'].src}
                      alt={chainLogos['BASE'].alt}
                      className="h-6 inline-block"
                    />
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <img
                      src={chainLogos['BSC'].src}
                      alt={chainLogos['BSC'].alt}
                      className="h-6 inline-block"
                    />
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {ethers.formatUnits(token.balance, token.decimals)}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <ActionButton
                      token={token}
                      chainName={chainName}
                      handleWithdraw={handleWithdraw}
                      handleSend={handleSend}
                    />
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

      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast type={toast.type} message={toast.message} onClose={closeToast} />
        </div>
      )}
    </div>
  );
}
