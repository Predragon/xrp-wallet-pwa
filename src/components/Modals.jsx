// components/Modals.jsx
import React from 'react';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export const TransactionModal = ({ show, onClose, onConfirm, recipient, amount, destinationTag, loading, error, success }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-4">Confirm Transaction</h3>
        
        {!success && !error && (
          <>
            <div className="space-y-3 mb-6">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-white/60 text-sm">To</p>
                <p className="text-white font-mono text-sm break-all">{recipient}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-white/60 text-sm">Amount</p>
                <p className="text-white font-bold text-xl">{amount} XRP</p>
              </div>
              {destinationTag && (
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-white/60 text-sm">Destination Tag</p>
                  <p className="text-white font-mono">{destinationTag}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl transition-all flex items-center justify-center"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Confirm'}
              </button>
            </div>
          </>
        )}
        
        {error && (
          <div className="mb-4">
            <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-red-200 text-sm">{error}</div>
            </div>
            <button onClick={onClose} className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl">
              Close
            </button>
          </div>
        )}
        
        {success && (
          <div className="mb-4">
            <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4 flex items-start">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-green-200 text-sm">
                <p className="font-bold mb-1">Transaction Successful!</p>
                <p className="font-mono text-xs break-all">{success.hash}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const QRCodeModal = ({ show, onClose, address }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-4">Receive XRP</h3>
        <div className="bg-white p-4 rounded-xl mb-4">
          <div className="text-center text-gray-800 font-mono text-sm break-all">{address}</div>
        </div>
        <p className="text-white/70 text-sm mb-4 text-center">
          Share this address to receive XRP
        </p>
        <button onClick={onClose} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl">
          Close
        </button>
      </div>
    </div>
  );
};
