'use client';
import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useAccount } from 'wagmi';

export default function CreateTokenForm() {
    const { isConnected } = useAccount();
    
    const [tokenName, setTokenName] = useState('');
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [supply, setSupply] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ tokenName, tokenSymbol, supply });
    };

    return (
        <div className="relative bg-white p-6 rounded-lg shadow-lg w-full h-full border border-blue-600">
            <h2 className="text-blue-600 text-2xl font-bold mb-4">Create ERC20 Token</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-blue-600 text-sm font-medium mb-2">Token Name</label>
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-blue-600 text-sm font-medium mb-2">Token Symbol</label>
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={tokenSymbol}
                        onChange={(e) => setTokenSymbol(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-blue-600 text-sm font-medium mb-2">Supply</label>
                    <input
                        type="number"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={supply}
                        onChange={(e) => setSupply(e.target.value)}
                    />
                </div>
                <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg text-lg flex items-center">
                    <FaPlus className="mr-2" /> Create
                </button>
            </form>

            {!isConnected && (
                <div className="absolute inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    Please connect your wallet!
                </div>
            )}
        </div>
    );
}
