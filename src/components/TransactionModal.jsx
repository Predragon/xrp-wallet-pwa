import React from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const TransactionModal = ({ isOpen, onClose, transaction, onConfirm, loading, error, success }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white/90 backdrop-blur-md rounded-2xl p-6 w-full max-w-md shadow-2xl transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
          {success ? 'Transaction Complete!' : error ? 'Transaction Failed' : 'Confirm Transaction'}
        </h2>

        {loading && (
          <div className="flex flex-col items-center justify-center p-8">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="mt-4 text-gray-600 font-semibold">Broadcasting to XRP Ledger...</p>
          </div>
        )}

        {success && (
          <div className="text-center p-4 bg-green-100 rounded-xl">
            <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <p className="text-green-800 font-semibold">Success! Check transaction history shortly.</p>
            <p className="text-xs text-green-700 mt-2 break-all">Hash: {success.tx_json?.hash?.substring(0, 30)}...</p>
          </div>
        )}

        {error && (
          <div className="text-center p-4 bg-red-100 rounded-xl">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
            <p className="text-red-800 font-semibold">Error:</p>
            <p className="text-sm text-red-700 mt-1 break-words">{error}</p>
          </div>
        )}

        {!loading && !success && !error && (
          <div className="space-y-3">
            <p className="text-gray-700">You are about to send:</p>
            <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
              <p><strong>Amount:</strong> {transaction.amount} XRP</p>
              <p><strong>To:</strong> <span className="break-all">{transaction.to}</span></p>
              {transaction.destinationTag && <p><strong>Tag:</strong> {transaction.destinationTag}</p>}
            </div>

            <p className="text-sm text-red-500">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              This is irreversible. Confirm details.
            </p>

            <button
              onClick={onConfirm}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all duration-300 mt-4"
            >
              Confirm Send
            </button>
          </div>
        )}

        <button 
          onClick={onClose} 
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-xl transition-all duration-300 mt-3"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Close'}
        </button>
      </div>
    </div>
  );
};

export default TransactionModal;
