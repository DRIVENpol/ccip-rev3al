'use client';
import { useState } from 'react';
import { FaCoins, FaImage } from 'react-icons/fa';
import { useAccount } from 'wagmi';

export default function MyAssets() {
    const { isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState('tokens');

    return (
        <div className="relative bg-white p-6 rounded-2xl shadow-lg mt-8 border border-blue-600">
            <h2 className="text-blue-600 text-2xl font-bold mb-6">My Created Assets</h2>
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
                    className={`flex items-center px-4 py-2 rounded-lg ${
                        activeTab === 'nfts' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
                    }`}
                    onClick={() => setActiveTab('nfts')}
                >
                    <FaImage className="mr-2" /> NFTs
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
                                <th className="text-left p-4 whitespace-nowrap">Supply</th>
                                <th className="text-left p-4 whitespace-nowrap">My Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Replace with dynamic data */}
                            <tr className="border-t border-gray-200">
                                <td className="p-4 whitespace-nowrap">0x123...456</td>
                                <td className="p-4 whitespace-nowrap">Example Token</td>
                                <td className="p-4 whitespace-nowrap">EXT</td>
                                <td className="p-4 whitespace-nowrap">10000</td>
                                <td className="p-4 whitespace-nowrap">1000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'nfts' && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-2xl shadow-lg text-black">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left p-4 whitespace-nowrap">Collection Address</th>
                                <th className="text-left p-4 whitespace-nowrap">Collection Name</th>
                                <th className="text-left p-4 whitespace-nowrap">Collection Symbol</th>
                                <th className="text-left p-4 whitespace-nowrap">Item ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t border-gray-200">
                                <td className="p-4 whitespace-nowrap">0x789...012</td>
                                <td className="p-4 whitespace-nowrap">Example NFT</td>
                                <td className="p-4 whitespace-nowrap">EXN</td>
                                <td className="p-4 whitespace-nowrap">1</td>
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
