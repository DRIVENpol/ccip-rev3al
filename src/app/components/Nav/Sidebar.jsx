import { useEffect } from 'react';

export default function Sidebar({ isOpen, toggleSidebar, children }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen]);

    return (
        <>
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
                    isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onClick={toggleSidebar} 
            ></div>

            <div
                className={`fixed top-0 left-0 w-64 h-full z-50 transform ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out`}
            >
                <div className="bg-white h-full p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <button onClick={toggleSidebar} className="text-2xl">✕</button>
                    </div>
                    {children}
                </div>
            </div>
        </>
    );
}
