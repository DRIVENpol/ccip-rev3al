'use client';
import { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { ethers } from 'ethers';

export default function ActionButton({ token, chainName, handleWithdraw, handleSend }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');

  const isHomeChain = token.chain === chainName;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setToAddress('');
    setAmount('');
  };

  const onSubmit = () => {
    if (isHomeChain) {
      handleWithdraw(token, amount);
    } else {
      handleSend(token, toAddress, amount);
    }
    closeModal();
  };

  return (
    <>
      <button
        className="bg-blue-600 text-white py-1 px-3 rounded-lg flex items-center"
        onClick={openModal}
      >
        {isHomeChain ? (
          'Withdraw'
        ) : (
          <>
            <FaPaperPlane className="mr-2" /> Send
          </>
        )}
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {isHomeChain ? `Withdraw ${token.symbol}` : `Send ${token.symbol}`}
            </h2>
            {!isHomeChain && (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Recipient Address</label>
                <input
                  type="text"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="0x..."
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="0.0"
              />
              <p className="text-sm text-gray-500 mt-1">
                Balance: {ethers.formatUnits(token.balance, token.decimals)} {token.symbol}
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white py-2 px-4 rounded"
                onClick={onSubmit}
                disabled={
                  (!isHomeChain && (!toAddress || !amount)) || (isHomeChain && !amount)
                }
              >
                {isHomeChain ? 'Withdraw' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
