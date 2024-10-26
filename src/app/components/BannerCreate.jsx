'use client';
import Link from 'next/link';

export default function BannerCreate() {
    return (
        <div className="bg-gradient-to-r from-blue-500 to-blue-800 text-white py-8 px-10 rounded-2xl shadow-lg mb-8">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
                <div className="text-center md:text-left mb-4 md:mb-0">
                    <h2 className="text-3xl font-bold mb-2">Already have a token?</h2>
                    <p className="text-lg">Make it crosschain and control it from every chain you want.</p>
                </div>
                <div>
                <Link href='/dashboard' className="mx-2 text-lg hover:text-blue-600">
                    <button className="bg-white text-blue-600 py-2 px-6 rounded-lg text-lg shadow-lg" href="/dashboard">
                        Go Crosschain
                    </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
