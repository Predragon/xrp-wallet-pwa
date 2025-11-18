import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { isValidAddress } from '../utils/xrp';

const SendForm = ({ onSend, balance }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [destinationTag, setDestinationTag] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(null);

  useEffect(() => {
    if (recipient.length > 0) {
      setIsAddressValid(isValidAddress(recipient));
    } else {
      setIsAddressValid(null);
    }
  }, [recipient]);

  const handleSubmit = () => {
    onSend({ recipient, amount, destinationTag });
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30 backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-white mb-5 flex items-center">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
          <Send className="w-5 h-5 text-white" />
        </div>
        Send XRP
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm text-purple-200 font-semibold mb-2 block">Recipient Address</label>
          <div className="relative">
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              className={`w-full bg-black/30 text-white px-4 py-3 pr-12 rounded-xl border ${
                isAddressValid === false ? 'border-red-400' : 
                isAddressValid === true ? 'border-green-400' : 
                'border-purple-400/30'
              } focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all`}
            />
            {isAddressValid !== null && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isAddressValid ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            )}
          </div>
          {isAddressValid === false && (
            <p className="text-xs text-red-400 mt-1">Invalid XRP address format</p>
          )}
          {isAddressValid === true && (
            <p className="text-xs text-green-400 mt-1">Valid XRP address ✓</p>
          )}
        </div>

        <div>
          <label className="text-sm text-purple-200 font-semibold mb-2 block">
            Amount (XRP)
            <span className="text-purple-300/60 ml-2 font-normal">Available: {balance?.toFixed(6) || '0'} XRP</span>
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.000001"
            max={balance}
            className="w-full bg-black/30 text-white px-4 py-3 rounded-xl border border-purple-400/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
          />
          {amount && parseFloat(amount) > balance && (
            <p className="text-xs text-red-400 mt-1">Insufficient balance</p>
          )}
        </div>

        <div>
          <label className="text-sm text-purple-200 font-semibold mb-2 block">Destination Tag (Optional)</label>
          <input
            type="number"
            value={destinationTag}
            onChange={(e) => setDestinationTag(e.target.value)}
            placeholder="12345"
            className="w-full bg-black/30 text-white px-4 py-3 rounded-xl border border-purple-400/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isAddressValid || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
          className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 hover:scale-105 transform disabled:hover:scale-100 disabled:shadow-none"
        >
          <span className="text-lg">Send Transaction</span>
        </button>
      </div>
    </div>
  );
};

export default SendForm;
