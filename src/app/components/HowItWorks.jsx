'use client';
import { FaPlus, FaTachometerAlt, FaExchangeAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function HowItWorks() {
    const router = useRouter();

    const handleNavigate = (path) => {
        router.push(path);
    };

    return (
        <section className="bg-white py-16">
            <div className="container mx-auto px-4">
                {/* Title */}
                <h2 className="text-black text-4xl font-bold text-center mb-12">
                    How It Works
                </h2>

                {/* Steps */}
                <div className="flex justify-start md:justify-center flex-nowrap space-x-4 md:space-x-8 overflow-x-auto pb-4">
                    {/* Step 1 */}
                    <div className="bg-blue-600 p-6 rounded-lg shadow-lg flex-shrink-0 w-72 md:w-80 h-64 flex flex-col justify-between">
                        <div>
                            <h3 className="text-white text-2xl font-bold mb-4">Step 1</h3>
                            <p className="text-white text-lg mb-4">
                                Create an ERC20 token or an NFT if you don't have any tokens.
                            </p>
                        </div>
                        <button
                            className="bg-white text-blue-600 py-2 px-6 rounded-lg text-lg flex items-center"
                            onClick={() => handleNavigate('/create-token')}
                        >
                            <FaPlus className="mr-2" /> Create
                        </button>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-blue-600 p-6 rounded-lg shadow-lg flex-shrink-0 w-72 md:w-80 h-64 flex flex-col justify-between">
                        <div>
                            <h3 className="text-white text-2xl font-bold mb-4">Step 2</h3>
                            <p className="text-white text-lg mb-4">
                                Go to your dashboard and make your token multichain.
                            </p>
                        </div>
                        <button
                            className="bg-white text-blue-600 py-2 px-6 rounded-lg text-lg flex items-center"
                            onClick={() => handleNavigate('/dashboard')}
                        >
                            <FaTachometerAlt className="mr-2" /> Dashboard
                        </button>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-blue-600 p-6 rounded-lg shadow-lg flex-shrink-0 w-72 md:w-80 h-64 flex flex-col justify-between">
                        <div>
                            <h3 className="text-white text-2xl font-bold mb-4">Step 3</h3>
                            <p className="text-white text-lg mb-4">
                                Control your tokens on Chain A from Chain B from your dashboard.
                            </p>
                        </div>
                        <button
                            className="bg-white text-blue-600 py-2 px-6 rounded-lg text-lg flex items-center"
                            onClick={() => handleNavigate('/dashboard')}
                        >
                            <FaExchangeAlt className="mr-2" /> Control
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
