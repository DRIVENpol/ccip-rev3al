'use client';
import { useState, useEffect } from 'react';
import { useAccount, useNetwork } from 'wagmi';

const logos = [
    {
        src: "https://cryptologos.cc/logos/bnb-bnb-logo.png?v=033",
        alt: "BNB Smart Chain",
        chainId: 56,
    },
    {
        src: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=033",
        alt: "Polygon",
        chainId: 137,
    },
    {
        src: "https://cryptologos.cc/logos/avalanche-avax-logo.png?v=033",
        alt: "Avalanche",
        chainId: 43114, 
    },
];

export default function StepForm() {
    const [tokenType, setTokenType] = useState('erc20');
    const [selectedToken, setSelectedToken] = useState('');
    const [destinationChain, setDestinationChain] = useState('');
    const [amount, setAmount] = useState('');
    const [nftId, setNftId] = useState('');

    const { isConnected, chainId } = useAccount();
    const currentChainId = chainId;

    // Filter out the current chain from destination chain options
    const filteredChains = logos.filter((logo) => logo.chainId !== currentChainId);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle the form submission logic here
    };

    return (
        <div className="relative bg-white p-6 rounded-lg shadow-lg border border-blue-600">
            <h2 className="text-blue-600 text-2xl font-bold mb-4">Make Your Token Crosschain</h2>
            <form onSubmit={handleSubmit}>
                {/* Step 0: Select Token Type */}
                <div className="mb-4">
                    <label className="block text-blue-600 text-sm font-medium mb-2">Select Token Type</label>
                    <select
                        value={tokenType}
                        onChange={(e) => setTokenType(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="erc20">ERC20</option>
                        <option value="erc721" disabled>ERC721 (Coming Soon!)</option>
                    </select>
                </div>

                {/* Step 1: Select Home Chain */}
                <div className="mb-4">
                    <label className="block text-blue-600 text-sm font-medium mb-2">
                        Select Home Chain
                    </label>
                    <w3m-network-button />
                </div>

                {/* Step 2: Select Token */}
                <div className="mb-4">
                    <label className="block text-blue-600 text-sm font-medium mb-2">Select Token</label>
                    <select
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="" disabled>Select your token</option>
                        {/* Replace with dynamic token options */}
                        <option value="token1">Token 1</option>
                        <option value="token2">Token 2</option>
                    </select>
                </div>

                {/* Step 3: Select Destination Chain */}
                <div className="mb-4">
                    <label className="block text-blue-600 text-sm font-medium mb-2">
                        Select Destination Chain
                    </label>
                    <select
                        value={destinationChain}
                        onChange={(e) => setDestinationChain(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="" disabled>Select destination chain</option>
                        {filteredChains.map((logo, index) => (
                            <option key={index} value={logo.alt}>{logo.alt}</option>
                        ))}
                    </select>
                </div>

                {/* Step 4: Input Amount or ID */}
                <div className="mb-4">
                    {tokenType === 'erc20' ? (
                        <>
                            <label className="block text-blue-600 text-sm font-medium mb-2">Amount</label>
                            <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </>
                    ) : (
                        <>
                            <label className="block text-blue-600 text-sm font-medium mb-2">ID</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={nftId}
                                onChange={(e) => setNftId(e.target.value)}
                            />
                        </>
                    )}
                </div>

                <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg text-lg">
                    Go Crosschain
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
