'use client'
import HeroImage from "@/app/assets/ccip.png"

import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

export default function HeroBanner() {
    const { isConnected } = useAccount();

    const router = useRouter();

    const handleNavigate = (path) => {
        router.push(path);
    };

    return (
        <section className="bg-white py-16">
            <div className="container mx-auto flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 text-center md:text-left p-4">
                    <h1 className="text-4xl font-bold mb-4">CCIP X REV3AL</h1>
                    <p className="text-lg mb-6">
                        Unlock the full potential of your tokens with cross-chain compatibility and enhanced security features. Explore seamless integration across multiple blockchains.
                    </p>
                    <div className="flex justify-center md:justify-start">
                        {isConnected ? (
                            <button className="bg-blue-600 text-white py-2 px-6 rounded-lg text-lg"
                            onClick={() => handleNavigate('/dashboard')}
                            >
                                Dashboard
                            </button>
                        ) : (
                            <w3m-button />
                        )}
                    </div>
                </div>

                <div className="md:w-1/2 p-4">
                    <img
                        src={HeroImage.src}
                        alt="CCIP X REV3AL"
                        className="w-full h-auto rounded-lg"
                    />
                </div>
            </div>
        </section>
    );
}
