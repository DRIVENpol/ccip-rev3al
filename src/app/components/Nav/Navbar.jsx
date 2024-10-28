'use client';
import { useState } from 'react';
import NavbarLink from './NavbarLink';
import Sidebar from './Sidebar';

export default function Navbar() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <>
            <nav className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="font-bold" >
                            <NavbarLink href="/">REV3AL Interchain</NavbarLink>
                        </div>
                        <div className="hidden md:flex space-x-4">
                            <NavbarLink href="/">Home</NavbarLink>
                            <NavbarLink href="/create-token">Create Token</NavbarLink>
                            <NavbarLink href="/dashboard">Dashboard</NavbarLink>
                        </div>
                    </div>

                    <div className="hidden md:flex">
                        <w3m-button />
                    </div>

                    <div className="flex md:hidden">
                        <button onClick={toggleSidebar} className="text-2xl">
                            ☰
                        </button>
                    </div>
                </div>
            </nav>


            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <div className="flex flex-col h-full">
                    <div className="flex flex-col space-y-4">
                        <NavbarLink href="/">Home</NavbarLink>
                        <NavbarLink href="/create-token">Create Token</NavbarLink>
                        <NavbarLink href="/dashboard">Dashboard</NavbarLink>
                    </div>
                    <div className="mt-auto md:hidden">
                        <w3m-button />
                    </div>
                </div>
            </Sidebar>
        </>
    );
}
