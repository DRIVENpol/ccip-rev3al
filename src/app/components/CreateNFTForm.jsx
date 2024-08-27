'use client';
import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useAccount } from 'wagmi';

export default function CreateNFTForm() {
    const { isConnected } = useAccount();

    const [tokenName, setTokenName] = useState('');
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [ipfsLink, setIpfsLink] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ tokenName, tokenSymbol, ipfsLink });
    };

    return (
        <div className="relative bg-white p-6 rounded-lg shadow-lg border border-blue-600">
            <div>
                <h2 className="text-blue-600 text-2xl font-bold mb-4">Create an ERC721 (Single) Token</h2>
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
                        <label className="block text-blue-600 text-sm font-medium mb-2">Ipfs Link To The Image</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={ipfsLink}
                            onChange={(e) => setIpfsLink(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg text-lg flex items-center">
                        <FaPlus className="mr-2" /> Create
                    </button>
                </form>
            </div>

            {!isConnected && (
                <div className="absolute inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    Please connect your wallet!
                </div>
            )}
        </div>
    );
}
