'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { useAccount, useChainId } from 'wagmi';
import { useRouter } from 'next/navigation';
import { TOKEN_LAUNCHER } from '@/settings';
import TOKEN_LAUNCHER_ABI from '@/abis/tokenLauncher.json';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import Toast from './Toast';
import { config } from '../config'; 

const chainIdToName = {
  56: 'BSC',
  8453: 'BASE',
};

const chainNameToChainId = {
  BSC: 56,
  BASE: 8453,
};

export default function CreateTokenForm() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const chainName = chainIdToName[chainId];
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm();
  const [toast, setToast] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const contractAddress = TOKEN_LAUNCHER[chainName];

  const onSubmit = async (data) => {
    const { tokenName, tokenSymbol, supply } = data;

    if (!contractAddress) {
      setToast({
        type: 'warning',
        message: 'Unsupported network. Please switch to BSC or BASE.',
      });
      return;
    }

    try {
      setIsPending(true);

      const txHash = await writeContract(config, {
        address: contractAddress,
        abi: TOKEN_LAUNCHER_ABI,
        functionName: 'launchToken',
        args: [tokenName, tokenSymbol, BigInt(supply), address],
        chainId: chainId,
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
          message: 'Your ERC20 token has been created successfully.',
        });
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
      console.error("Error creating token: ", error);
      setToast({
        type: 'error',
        message: `Error creating token: ${error.message}`,
      });
    } finally {
      setIsPending(false);
    }
  };

  const closeToast = () => setToast(null);

  return (
    <div className="relative bg-white p-6 rounded-lg shadow-lg w-full h-full border border-blue-600">
      <h2 className="text-blue-600 text-2xl font-bold mb-4">Create ERC20 Token</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-blue-600 text-sm font-medium mb-2">Token Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            {...register('tokenName', { required: 'Token name is required' })}
          />
          {errors.tokenName && <span className="text-red-500 text-sm">{errors.tokenName.message}</span>}
        </div>
        <div className="mb-4">
          <label className="block text-blue-600 text-sm font-medium mb-2">Token Symbol</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            {...register('tokenSymbol', { required: 'Token symbol is required' })}
          />
          {errors.tokenSymbol && <span className="text-red-500 text-sm">{errors.tokenSymbol.message}</span>}
        </div>
        <div className="mb-4">
          <label className="block text-blue-600 text-sm font-medium mb-2">Supply</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            {...register('supply', {
              required: 'Total supply is required',
              min: { value: 1, message: 'Supply must be at least 1' },
            })}
          />
          {errors.supply && <span className="text-red-500 text-sm">{errors.supply.message}</span>}
        </div>
        <div className="mb-8">
          <label className="block text-blue-600 text-sm font-medium mb-2">
            Select Home Chain
          </label>
          <w3m-network-button />
        </div>
        <button
          type="submit"
          className="bg-blue-600 w-50 text-white py-2 px-4 rounded-lg text-lg flex items-center justify-center disabled:bg-gray-400"
          disabled={isPending}
        >
          {isPending ? (
            <div role="status">
              <span>Loading...</span>
            </div>
          ) : (
            <>
              <FaPlus className="mr-2" /> Create
            </>
          )}
        </button>
      </form>

      {!isConnected && (
        <div className="absolute inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex items-center justify-center rounded-lg">
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
