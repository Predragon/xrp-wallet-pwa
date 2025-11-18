import React, { useState, useEffect } from 'react';
import { 
  Wallet, Send, Eye, EyeOff, Copy, RefreshCw, AlertCircle, CheckCircle, 
  History, QrCode, Lock, Unlock, BookOpen, Download, Trash2, Plus, ArrowLeft,
  TrendingUp
} from 'lucide-react';

import {
  generateWallet,
  importWallet as importWalletFromSeed,
  getBalance,
  sendXRP,
  isValidAddress,
  getTransactionHistory,
  getXRPPrice,
  setNetwork,
  NETWORKS,
  saveWalletToList,
  getSavedWallets,
  loadWalletFromList,
  removeWalletFromList,
  clearAllWallets,
  deleteWallet,
  saveContact,
  getContacts,
  deleteContact,
  loadSettings,
  saveSettings
} from './utils/xrp';

// Modal Components
const TransactionModal = ({ show, onClose, onConfirm, recipient, amount, destinationTag, loading, error, success }) => {
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

const QRCodeModal = ({ show, onClose, address }) => {
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

// Wallet List Component
const WalletList = ({ wallets, onSelectWallet, onWalletsUpdated, network, xrpPrice }) => {
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState({});
  const [showCreateOptions, setShowCreateOptions] = useState(wallets.length === 0);

  useEffect(() => {
    loadAllBalances();
  }, [wallets, network]);

  const loadAllBalances = async () => {
    const newBalances = {};
    for (const wallet of wallets) {
      try {
        const balance = await getBalance(wallet.address);
        newBalances[wallet.address] = balance;
      } catch (error) {
        newBalances[wallet.address] = 0;
      }
    }
    setBalances(newBalances);
  };

  const createNewWallet = async () => {
    const walletName = prompt('Enter a name for this wallet:');
    if (!walletName || walletName.trim() === '') return;
    
    const pwd = prompt('Set a password (min 6 characters):');
    if (!pwd || pwd.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      const newWallet = generateWallet();
      
      if (saveWalletToList(newWallet, pwd, walletName.trim())) {
        alert('✅ Wallet created and saved!');
        onWalletsUpdated();
        setShowCreateOptions(false);
      } else {
        alert('❌ Failed to save wallet');
      }
    } catch (error) {
      alert('Error creating wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const importExistingWallet = async () => {
    const secret = prompt('Enter your XRP secret key (starts with "s"):');
    if (!secret || !secret.trim()) return;
    
    const walletName = prompt('Enter a name for this wallet:');
    if (!walletName || walletName.trim() === '') return;
    
    const pwd = prompt('Set a password (min 6 characters):');
    if (!pwd || pwd.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      const importedWallet = importWalletFromSeed(secret.trim());
      
      if (saveWalletToList(importedWallet, pwd, walletName.trim())) {
        alert('✅ Wallet imported and saved!');
        onWalletsUpdated();
        setShowCreateOptions(false);
      } else {
        alert('❌ Failed to save wallet (may already exist)');
      }
    } catch (error) {
      alert('Invalid secret key: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteWalletItem = (walletId) => {
    if (window.confirm('Delete this wallet? Make sure you have backed up the secret key!')) {
      if (removeWalletFromList(walletId)) {
        onWalletsUpdated();
      }
    }
  };

  if (showCreateOptions || wallets.length === 0) {
    return (
      <div className="space-y-4">
        <button
          onClick={createNewWallet}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center"
        >
          {loading ? <RefreshCw className="w-6 h-6 animate-spin mr-2" /> : <Plus className="w-6 h-6 mr-2" />}
          Create New Wallet
        </button>
        
        <button
          onClick={importExistingWallet}
          disabled={loading}
          className="w-full bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white font-semibold py-5 rounded-2xl transition-all"
        >
          <Download className="w-5 h-5 inline mr-2" />
          Import Existing Wallet
        </button>

        {wallets.length > 0 && (
          <button
            onClick={() => setShowCreateOptions(false)}
            className="w-full bg-white/5 hover:bg-white/10 text-white/70 py-3 rounded-xl transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {wallets.map((wallet) => {
          const balance = balances[wallet.address] || 0;
          const usdValue = xrpPrice ? (balance * xrpPrice).toFixed(2) : '0.00';
          
          return (
            <div
              key={wallet.id}
              className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 border border-white/20 hover:border-white/40 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-xl mb-1 group-hover:text-blue-300 transition-colors">
                    {wallet.name}
                  </h3>
                  <p className="text-white/50 text-sm font-mono">{wallet.address.substring(0, 30)}...</p>
                  <p className="text-white/40 text-xs mt-1">
                    Added {new Date(wallet.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteWalletItem(wallet.id);
                  }}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4 text-red-300" />
                </button>
              </div>

              <div className="bg-black/20 rounded-xl p-4 mb-4">
                <div className="text-white/60 text-sm mb-1">Balance</div>
                <div className="text-white font-bold text-2xl">{balance.toFixed(6)} XRP</div>
                <div className="text-white/50 text-sm">≈ ${usdValue} USD</div>
              </div>

              <button
                onClick={() => onSelectWallet(wallet)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl transition-all font-semibold"
              >
                Open Wallet →
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setShowCreateOptions(true)}
        className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 rounded-xl transition-all border border-white/20"
      >
        <Plus className="w-5 h-5 inline mr-2" />
        Add Another Wallet
      </button>
    </div>
  );
};

// Wallet Details Component
const WalletDetails = ({ wallet, network, xrpPrice, onBack, onSwitchNetwork }) => {
  const [showSecret, setShowSecret] = useState(false);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [destinationTag, setDestinationTag] = useState('');
  const [copied, setCopied] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState(null);
  const [txSuccess, setTxSuccess] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);

  useEffect(() => {
    setContacts(getContacts());
    checkBalance();
    loadTransactionHistory();
  }, [wallet, network]);

  useEffect(() => {
    if (recipient && recipient.length > 0) {
      setIsAddressValid(isValidAddress(recipient));
    } else {
      setIsAddressValid(null);
    }
  }, [recipient]);

  const checkBalance = async () => {
    if (!wallet || !wallet.address) return;
    
    try {
      setLoading(true);
      const newBalance = await getBalance(wallet.address);
      setBalance(newBalance);
    } catch (error) {
      console.error('Error checking balance:', error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionHistory = async () => {
    if (!wallet || !wallet.address) return;
    
    try {
      setLoading(true);
      const txHistory = await getTransactionHistory(wallet.address, 20);
      setTransactions(Array.isArray(txHistory) ? txHistory : []);
    } catch (error) {
      console.error('Error loading transaction history:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendClick = () => {
    setTxError(null);
    setTxSuccess(null);

    if (!wallet || !wallet.secret) {
      alert('Wallet not initialized');
      return;
    }

    if (!recipient || recipient.trim() === '') {
      alert('Please enter a recipient address');
      return;
    }
    
    if (!isValidAddress(recipient.trim())) {
      alert('Invalid XRP address');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(amount) > balance) {
      alert(`Insufficient balance. Available: ${balance} XRP`);
      return;
    }

    if (network === 'mainnet') {
      const confirm = window.confirm(
        `⚠️ MAINNET TRANSACTION!\n\nSending ${amount} XRP to:\n${recipient}\n\nThis is IRREVERSIBLE!\n\nConfirm?`
      );
      if (!confirm) return;
    }

    setShowModal(true);
  };

  const handleConfirmTransaction = async () => {
    setTxLoading(true);
    setTxError(null);
    
    try {
      const result = await sendXRP(
        wallet.secret,
        recipient.trim(),
        parseFloat(amount),
        destinationTag && destinationTag !== '' ? parseInt(destinationTag) : null
      );
      
      setTxSuccess(result);
      
      setTimeout(() => {
        checkBalance();
        loadTransactionHistory();
      }, 3000);
      
      setRecipient('');
      setAmount('');
      setDestinationTag('');
    } catch (error) {
      console.error('Transaction failed:', error);
      setTxError(error.message || 'Transaction failed');
    } finally {
      setTxLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!txLoading) {
      setShowModal(false);
      setTimeout(() => {
        setTxError(null);
        setTxSuccess(null);
      }, 300);
    }
  };

  const copyToClipboard = (text, type) => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(type);
        setTimeout(() => setCopied(''), 2000);
      });
    }
  };

  const addContact = () => {
    const name = prompt('Contact name:');
    if (!name || name.trim() === '') return;
    
    const address = prompt('XRP address:');
    if (!address || !isValidAddress(address.trim())) {
      alert('Invalid address');
      return;
    }
    
    const tag = prompt('Destination tag (optional):');
    
    const contact = saveContact(name.trim(), address.trim(), tag && tag.trim() !== '' ? tag.trim() : '');
    if (contact) {
      setContacts(getContacts());
      alert('✅ Contact saved!');
    }
  };

  const selectContact = (contact) => {
    setRecipient(contact.address);
    if (contact.tag) setDestinationTag(contact.tag);
    setShowContacts(false);
  };

  const removeContact = (id) => {
    if (window.confirm('Delete this contact?')) {
      deleteContact(id);
      setContacts(getContacts());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Wallets
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => onSwitchNetwork('testnet')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                network === 'testnet' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white/10 text-white/60'
              }`}
            >
              Testnet
            </button>
            <button
              onClick={() => onSwitchNetwork('mainnet')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                network === 'mainnet' 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-white/10 text-white/60'
              }`}
            >
              ⚠️ Mainnet
            </button>
          </div>

          {xrpPrice && (
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
              <span className="text-white/70 text-sm">XRP: </span>
              <span className="text-white font-bold">${xrpPrice.toFixed(4)}</span>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl mb-3 shadow-lg">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-1">{wallet.name}</h1>
            <p className="text-white/50 text-sm font-mono">{wallet.address.substring(0, 20)}...</p>
          </div>

          <div className={`bg-gradient-to-r ${
            network === 'mainnet' 
              ? 'from-red-500/30 to-orange-500/30 border-red-400/50'
              : 'from-yellow-500/20 to-orange-500/20 border-yellow-400/50'
          } border rounded-2xl p-4 mb-6 flex items-start`}>
            <AlertCircle className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-100">
              <strong>{network === 'mainnet' ? '🔴 MAINNET' : 'Testnet Mode'}</strong>
              {network === 'mainnet' 
                ? ': Real XRP transactions!' 
                : ': Test network only'}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-2">
              <button
                onClick={() => setShowQRModal(true)}
                className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold py-2 px-4 rounded-xl transition-all border border-purple-400/30 flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Receive
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-5 border border-blue-400/30">
              <label className="text-sm text-blue-200 font-semibold mb-3 block">Address</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={wallet.address}
                  readOnly
                  className="flex-1 bg-black/30 text-white px-4 py-3 rounded-xl border border-white/20 text-sm font-mono"
                />
                <button
                  onClick={() => copyToClipboard(wallet.address, 'address')}
                  className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl"
                >
                  <Copy className="w-5 h-5 text-white" />
                </button>
              </div>
              {copied === 'address' && <span className="text-xs text-green-300 mt-2 block">✓ Copied!</span>}
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl p-5 border border-red-400/30">
              <label className="text-sm text-red-200 font-semibold mb-3 block flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Secret Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={wallet.secret || 'N/A'}
                  readOnly
                  className="flex-1 bg-black/30 text-white px-4 py-3 rounded-xl border border-white/20 text-sm font-mono"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-3 bg-gray-600 rounded-xl"
                >
                  {showSecret ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
                </button>
                <button
                  onClick={() => copyToClipboard(wallet.secret, 'secret')}
                  className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl"
                >
                  <Copy className="w-5 h-5 text-white" />
                </button>
              </div>
              {copied === 'secret' && <span className="text-xs text-green-300 mt-2 block">✓ Copied!</span>}
            </div>

            <div className="bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-2xl p-6 border border-emerald-400/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Balance</h2>
                <div className="flex gap-2">
                  <button onClick={() => setShowHistory(!showHistory)} className="p-3 bg-blue-500 rounded-xl">
                    <History className="w-5 h-5 text-white" />
                  </button>
                  <button onClick={() => { checkBalance(); loadTransactionHistory(); }} disabled={loading} className="p-3 bg-emerald-500 rounded-xl">
                    <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              <div className="text-5xl font-black text-white">
                {balance !== null ? `${balance.toLocaleString(undefined, { maximumFractionDigits: 6 })} XRP` : 'Loading...'}
              </div>
              <div className="text-emerald-200/70 text-sm mt-2">
                {xrpPrice && balance ? `≈ $${(balance * xrpPrice).toFixed(2)} USD` : '≈ $0.00 USD'}
              </div>
              
              {balance === 0 && network === 'testnet' && (
                <div className="mt-4 bg-yellow-500/20 border border-yellow-400/40 rounded-xl p-4">
                  <div className="text-sm text-yellow-100">
                    <p className="font-semibold mb-2">💰 Fund Your Wallet</p>
                    <p className="text-xs">Visit: <a href="https://xrpl.org/xrp-testnet-faucet.html" target="_blank" rel="noopener noreferrer" className="underline">xrpl.org/xrp-testnet-faucet.html</a></p>
                  </div>
                </div>
              )}
            </div>

            {showHistory && (
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Recent Transactions</h3>
                {transactions.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {transactions.map((txData, idx) => {
                      const tx = txData.tx || txData.transaction || txData;
                      if (!tx) return null;

                      const isSent = tx.Account === wallet.address;
                      const amount = tx.Amount ? (parseInt(tx.Amount) / 1000000).toFixed(2) : '0.00';
                      const txType = tx.TransactionType || 'Unknown';
                      const txHash = tx.hash || tx.Hash || 'Unknown';
                      
                      return (
                        <div key={idx} className="bg-black/20 rounded-xl p-3 border border-white/10">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <span className={`text-xs font-bold px-2 py-1 rounded ${
                                isSent ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                              }`}>
                                {isSent ? 'SENT' : 'RECEIVED'}
                              </span>
                              <div className="text-xs font-mono text-white/60 mt-1 break-all">
                                {txHash.substring(0, 16)}...
                              </div>
                            </div>
                            {txType === 'Payment' && (
                              <div className={`text-right ml-2 font-bold ${
                                isSent ? 'text-red-400' : 'text-green-400'
                              }`}>
                                {isSent ? '-' : '+'}{amount} XRP
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }).filter(Boolean)}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60">No transactions yet</p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30">
              <h2 className="text-2xl font-bold text-white mb-5 flex items-center">
                <Send className="w-6 h-6 mr-3" />
                Send XRP
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-purple-200 font-semibold mb-2 block">Recipient Address</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      className={`flex-1 bg-black/30 text-white px-4 py-3 rounded-xl border ${
                        isAddressValid === false ? 'border-red-400' : 
                        isAddressValid === true ? 'border-green-400' : 
                        'border-white/20'
                      } focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white/30`}
                    />
                    <button
                      onClick={() => setShowContacts(!showContacts)}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                      title="Contacts"
                    >
                      <BookOpen className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  {isAddressValid === false && (
                    <p className="text-xs text-red-300 mt-1">Invalid XRP address</p>
                  )}
                  {isAddressValid === true && (
                    <p className="text-xs text-green-300 mt-1">✓ Valid address</p>
                  )}
                </div>

                {showContacts && (
                  <div className="bg-black/30 rounded-xl p-4 border border-white/20">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-white font-semibold">Contacts</h4>
                      <button
                        onClick={addContact}
                        className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-lg hover:bg-green-500/30"
                      >
                        + Add
                      </button>
                    </div>
                    {contacts.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {contacts.map(contact => (
                          <div key={contact.id} className="flex items-center gap-2">
                            <button
                              onClick={() => selectContact(contact)}
                              className="flex-1 bg-white/5 hover:bg-white/10 rounded-lg p-2 text-left transition-all"
                            >
                              <div className="text-white font-semibold text-sm">{contact.name}</div>
                              <div className="text-white/50 text-xs font-mono truncate">{contact.address}</div>
                            </button>
                            <button
                              onClick={() => removeContact(contact.id)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4 text-red-300" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/50 text-sm text-center py-2">No contacts yet</p>
                    )}
                  </div>
                )}
                
                <div>
                  <label className="text-sm text-purple-200 font-semibold mb-2 block">Amount (XRP)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.000001"
                    min="0"
                    className="w-full bg-black/30 text-white px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white/30"
                  />
                  {amount && xrpPrice && (
                    <p className="text-xs text-white/50 mt-1">≈ ${(parseFloat(amount) * xrpPrice).toFixed(2)} USD</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm text-purple-200 font-semibold mb-2 block">
                    Destination Tag (Optional)
                  </label>
                  <input
                    type="number"
                    value={destinationTag}
                    onChange={(e) => setDestinationTag(e.target.value)}
                    placeholder="e.g., 12345"
                    className="w-full bg-black/30 text-white px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white/30"
                  />
                </div>
                
                <button
                  onClick={handleSendClick}
                  disabled={!wallet || !recipient || !amount || loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 transform flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send XRP
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TransactionModal
        show={showModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmTransaction}
        recipient={recipient}
        amount={amount}
        destinationTag={destinationTag}
        loading={txLoading}
        error={txError}
        success={txSuccess}
      />

      <QRCodeModal
        show={showQRModal}
        onClose={() => setShowQRModal(false)}
        address={wallet?.address}
      />
    </div>
  );
};

// Main App Component
const App = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [savedWallets, setSavedWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [network, setNetworkState] = useState('testnet');
  const [xrpPrice, setXrpPrice] = useState(null);

  useEffect(() => {
    const wallets = getSavedWallets();
    setSavedWallets(wallets);
    
    const settings = loadSettings();
    setNetworkState(settings.network);
    setNetwork(settings.network === 'mainnet' ? NETWORKS.MAINNET : NETWORKS.TESTNET);
    
    loadPriceData();
    const priceInterval = setInterval(loadPriceData, 60000);
    return () => clearInterval(priceInterval);
  }, []);

  const loadPriceData = async () => {
    const price = await getXRPPrice();
    setXrpPrice(price);
  };

  const unlockWallets = () => {
    if (!password || password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    if (savedWallets.length > 0) {
      const testWallet = loadWalletFromList(savedWallets[0].id, password);
      if (testWallet) {
        setIsUnlocked(true);
      } else {
        alert('Incorrect password');
      }
    }
  };

  const handleSelectWallet = (walletData) => {
    const decryptedWallet = loadWalletFromList(walletData.id, password);
    if (decryptedWallet) {
      setSelectedWallet({ ...decryptedWallet, id: walletData.id, name: walletData.name });
    } else {
      alert('Failed to unlock wallet');
    }
  };

  const handleBackToList = () => {
    setSelectedWallet(null);
  };

  const handleDeleteAllWallets = () => {
    if (window.confirm('Delete ALL wallets? Make sure you have backed up your secret keys!')) {
      deleteWallet();
      clearAllWallets();
      setSavedWallets([]);
      setIsUnlocked(false);
      setSelectedWallet(null);
    }
  };

  const switchNetwork = async (newNetwork) => {
    if (newNetwork === 'mainnet') {
      const confirm = window.confirm(
        '⚠️ WARNING: Switching to MAINNET. This uses REAL XRP!\n\nAre you sure?'
      );
      if (!confirm) return;
    }

    setNetworkState(newNetwork);
    await setNetwork(newNetwork === 'mainnet' ? NETWORKS.MAINNET : NETWORKS.TESTNET);
    saveSettings({ ...loadSettings(), network: newNetwork });
    
    if (selectedWallet) {
      setSelectedWallet(null);
    }
  };

  const handleWalletsUpdated = () => {
    setSavedWallets(getSavedWallets());
  };

  // Lock screen
  if (savedWallets.length === 0 || !isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 p-4 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl mb-4">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {savedWallets.length === 0 ? 'XRP Wallet' : 'Wallet Locked'}
            </h1>
            <p className="text-white/70 text-sm">
              {savedWallets.length === 0 
                ? 'No wallets found. Create or import a wallet to get started.' 
                : `${savedWallets.length} wallet${savedWallets.length > 1 ? 's' : ''} available`}
            </p>
          </div>

          {savedWallets.length > 0 ? (
            <div className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && unlockWallets()}
                placeholder="Enter password"
                className="w-full bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-white/50"
              />
              
              <button
                onClick={unlockWallets}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl transition-all"
              >
                <Unlock className="w-5 h-5 inline mr-2" />
                Unlock Wallets
              </button>

              <button
                onClick={handleDeleteAllWallets}
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold py-3 rounded-xl transition-all"
              >
                Delete All Wallets
              </button>
            </div>
          ) : (
            <WalletList 
              wallets={[]}
              onWalletsUpdated={handleWalletsUpdated}
              network={network}
              xrpPrice={xrpPrice}
            />
          )}
        </div>
      </div>
    );
  }

  // Wallet selected - show details
  if (selectedWallet) {
    return (
      <WalletDetails
        wallet={selectedWallet}
        network={network}
        xrpPrice={xrpPrice}
        onBack={handleBackToList}
        onSwitchNetwork={switchNetwork}
      />
    );
  }

  // Wallet list view
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => switchNetwork('testnet')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                network === 'testnet' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white/10 text-white/60'
              }`}
            >
              Testnet
            </button>
            <button
              onClick={() => switchNetwork('mainnet')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                network === 'mainnet' 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-white/10 text-white/60'
              }`}
            >
              ⚠️ Mainnet
            </button>
          </div>

          {xrpPrice && (
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
              <span className="text-white/70 text-sm">XRP: </span>
              <span className="text-white font-bold">${xrpPrice.toFixed(4)}</span>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/50">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              My Wallets
            </h1>
            <p className="text-white/70 text-sm">Select a wallet to view details</p>
          </div>

          <div className={`bg-gradient-to-r ${
            network === 'mainnet' 
              ? 'from-red-500/30 to-orange-500/30 border-red-400/50'
              : 'from-yellow-500/20 to-orange-500/20 border-yellow-400/50'
          } border rounded-2xl p-4 mb-8 flex items-start backdrop-blur-sm`}>
            <AlertCircle className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-100">
              <strong className="font-semibold">
                {network === 'mainnet' ? '🔴 MAINNET - REAL MONEY!' : 'Testnet Mode'}:
              </strong> 
              {network === 'mainnet' 
                ? ' You are using the real XRP network. All transactions use real XRP!'
                : ' Using XRP Testnet. Do not send real XRP to these addresses.'
              }
            </div>
          </div>

          <WalletList 
            wallets={savedWallets}
            onSelectWallet={handleSelectWallet}
            onWalletsUpdated={handleWalletsUpdated}
            network={network}
            xrpPrice={xrpPrice}
          />

          <button
            onClick={() => setIsUnlocked(false)}
            className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all"
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Lock Wallets
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
