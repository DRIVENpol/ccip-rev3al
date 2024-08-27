'use client';
import { FaEnvelope } from "react-icons/fa";

export default function SupportBanner() {
    return (
        <div className="bg-blue-600 text-white py-16 flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Do you have issues or need support?</h2>
                <button className="bg-white text-blue-600 py-2 px-6 rounded-lg text-lg shadow-lg">
                <FaEnvelope className="mr-2 inline-block align-middle" />
                    Contact Us Now
                </button>
            </div>
        </div>
    );
}
