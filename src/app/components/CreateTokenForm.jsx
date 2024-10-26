// CreateTokenForm.js
'use client';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { TOKEN_LAUNCHER } from '@/settings';
import TOKEN_LAUNCHER_ABI from '@/abis/tokenLauncher.json';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import Toast from './Toast';

export default function CreateTokenForm() {
  const { isConnected, chainId, address } = useAccount();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm();
  const [toast, setToast] = React.useState(null);

  const contractAddress = chainId === 56
    ? TOKEN_LAUNCHER.BSC
    : chainId === 8453
    ? TOKEN_LAUNCHER.BASE
    : null;

  const { data: transactionHash, writeContract, isPending, error: writeError } = useWriteContract();

  const onSubmit = (data) => {
    const { tokenName, tokenSymbol, supply } = data;

    if (!contractAddress) {
      setToast({
        type: 'warning',
        message: 'Unsupported network. Please switch to BSC or BASE.',
      });
      return;
    }

    writeContract({
      address: contractAddress,
      abi: TOKEN_LAUNCHER_ABI,
      functionName: 'launchToken',
      args: [tokenName, tokenSymbol, BigInt(supply), address],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  useEffect(() => {
    if (isConfirmed) {
      setToast({
        type: 'success',
        message: 'Your ERC20 token has been created successfully.',
      });
      // Redirect after a short delay to allow users to read the success message
      setTimeout(() => router.push('/my-tokens'), 3000);
    } else if (writeError || receiptError) {
      console.error(writeError?.message || receiptError?.message);
      setToast({
        type: 'error',
        message: (writeError?.message || receiptError?.message)?.split('\n')[0] || 'An error occurred',
      });
    }
  }, [isConfirmed, writeError, receiptError, router]);

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
            {...register('supply', { required: 'Total supply is required', min: { value: 1, message: 'Supply must be at least 1' } })}
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
          disabled={isPending || isConfirming}
        >
          {isPending || isConfirming ? (
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
