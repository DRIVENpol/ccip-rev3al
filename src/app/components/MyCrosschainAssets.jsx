'use client';
import { useState } from 'react';
import { FaCoins, FaImage, FaPaperPlane } from 'react-icons/fa';
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

export default function MyCrosschainAssets() {
    const [activeTab, setActiveTab] = useState('tokens');
    const { isConnected } = useAccount();

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
