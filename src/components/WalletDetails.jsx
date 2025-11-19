// components/WalletDetails.jsx
import React, { useState, useEffect } from 'react';
import { 
  Wallet, Send, Eye, EyeOff, Copy, RefreshCw, AlertCircle,
  History, QrCode, BookOpen, Trash2, ArrowLeft
} from 'lucide-react';
import { TransactionModal, QRCodeModal } from './Modals';
import {
  getBalance,
  sendXRP,
  isValidAddress,
  getTransactionHistory,
  saveContact,
  getContacts,
  deleteContact
} from '../utils/xrp';

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
            {/* Receive Button */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowQRModal(true)}
                className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold py-2 px-4 rounded-xl transition-all border border-purple-400/30 flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Receive
              </button>
            </div>

            {/* Address Display */}
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

            {/* Secret Key Display */}
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

            {/* Balance Display */}
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

            {/* Transaction History */}
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

            {/* Send XRP Form */}
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

export default WalletDetails;
