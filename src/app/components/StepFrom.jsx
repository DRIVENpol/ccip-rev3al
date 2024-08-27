'use client';
import { useState } from 'react';
import { useAccount } from 'wagmi';

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

export default function StepForm() {
    const [tokenType, setTokenType] = useState('erc20');
    const [selectedToken, setSelectedToken] = useState('');
    const [homeChain, setHomeChain] = useState('');
    const [destinationChain, setDestinationChain] = useState('');
    const [amount, setAmount] = useState('');

    const { isConnected } = useAccount();

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
                        <option value="erc721">ERC721</option>
                    </select>
                </div>

                {/* Step 1: Select Token */}
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

                {/* Step 2: Select Home Chain */}
                <div className="mb-4">
                    <label className="block text-blue-600 text-sm font-medium mb-2">
                        Select Home Chain
                    </label>
                    <w3m-network-button />
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
                        {logos.map((logo, index) => (
                            <option key={index} value={logo.alt}>{logo.alt}</option>
                        ))}
                    </select>
                </div>

                {/* Step 4: Input Amount */}
                <div className="mb-4">
                    <label className="block text-blue-600 text-sm font-medium mb-2">Amount</label>
                    <input
                        type="number"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
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
