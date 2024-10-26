'use client'

export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} REV3AL LLC | All rights reserved. | DAPP (Smart Contracts & Interface) Created By <a href='https://www.linkedin.com/in/socardepaul/' target="_blank" className="text-blue-600">🫡 Șocarde Paul</a>
          </p>
        </div>
      </footer>
    );
  }
  