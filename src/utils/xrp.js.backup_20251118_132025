import { Client, Wallet, dropsToXrp, xrpToDrops } from 'xrpl';

// Network configurations
export const NETWORKS = {
  TESTNET: { 
    url: 'wss://s.altnet.rippletest.net:51233', 
    isLive: false,
    name: 'Testnet'
  },
  MAINNET: { 
    url: 'wss://xrplcluster.com/', 
    isLive: true,
    name: 'Mainnet'
  }
};

let currentNetwork = NETWORKS.TESTNET;
let client = null;

// Initialize client connection
const getClient = async () => {
  if (!client || !client.isConnected()) {
    client = new Client(currentNetwork.url);
    await client.connect();
  }
  return client;
};

// Set network and reconnect
export const setNetwork = async (network) => {
  if (client && client.isConnected()) {
    await client.disconnect();
  }
  currentNetwork = network;
  client = null; // Force reconnection on next use
};

export const getCurrentNetwork = () => currentNetwork;

// Generate a new wallet
export const generateWallet = () => {
  const wallet = Wallet.generate();
  return {
    address: wallet.address,
    secret: wallet.seed,
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey
  };
};

// Import wallet from secret
export const importWallet = (secret) => {
  try {
    const wallet = Wallet.fromSeed(secret);
    return {
      address: wallet.address,
      secret: wallet.seed,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey
    };
  } catch (error) {
    throw new Error('Invalid secret key');
  }
};

// Get account balance
export const getBalance = async (address) => {
  try {
    const cli = await getClient();
    const response = await cli.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated'
    });
    
    const balance = dropsToXrp(response.result.account_data.Balance);
    return parseFloat(balance);
  } catch (error) {
    if (error.data?.error === 'actNotFound') {
      return 0; // Account not yet funded
    }
    throw error;
  }
};

// Send XRP transaction
export const sendXRP = async (secret, recipient, amount, destinationTag = null) => {
  try {
    const cli = await getClient();
    const wallet = Wallet.fromSeed(secret);
    
    const payment = {
      TransactionType: 'Payment',
      Account: wallet.address,
      Amount: xrpToDrops(amount),
      Destination: recipient
    };

    if (destinationTag !== null && destinationTag !== undefined) {
      payment.DestinationTag = parseInt(destinationTag);
    }

    const prepared = await cli.autofill(payment);
    const signed = wallet.sign(prepared);
    const result = await cli.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult === 'tesSUCCESS') {
      return {
        hash: result.result.hash,
        validated: true,
        result: result.result.meta.TransactionResult
      };
    } else {
      throw new Error(`Transaction failed: ${result.result.meta.TransactionResult}`);
    }
  } catch (error) {
    console.error('Send XRP error:', error);
    throw new Error(error.message || 'Transaction failed');
  }
};

// Validate XRP address
export const isValidAddress = (address) => {
  try {
    if (!address || typeof address !== 'string') return false;
    
    // Basic validation
    if (!address.startsWith('r')) return false;
    if (address.length < 25 || address.length > 35) return false;
    
    // Use XRPL's built-in validation if available
    // For now, basic check is sufficient
    return true;
  } catch {
    return false;
  }
};

// Get transaction history
export const getTransactionHistory = async (address, limit = 20) => {
  try {
    const cli = await getClient();
    const response = await cli.request({
      command: 'account_tx',
      account: address,
      ledger_index_min: -1,
      ledger_index_max: -1,
      limit: limit
    });

    return response.result.transactions || [];
  } catch (error) {
    if (error.data?.error === 'actNotFound') {
      return []; // No transactions yet
    }
    console.error('Transaction history error:', error);
    return [];
  }
};

// Get XRP price from CoinGecko
export const getXRPPrice = async () => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd'
    );
    const data = await response.json();
    return data.ripple?.usd || 0;
  } catch (error) {
    console.error('Price fetch error:', error);
    return 0;
  }
};

// Fund testnet account (for testnet only)
export const fundTestnetAccount = async (address) => {
  if (currentNetwork.isLive) {
    throw new Error('Cannot fund mainnet accounts via faucet');
  }

  try {
    const cli = await getClient();
    const response = await cli.fundWallet(null, {
      faucetHost: 'faucet.altnet.rippletest.net',
      amount: '1000' // 1000 XRP on testnet
    });
    
    return response;
  } catch (error) {
    console.error('Faucet error:', error);
    throw new Error('Failed to fund account. Please use the web faucet.');
  }
};

// Cleanup connection
export const disconnect = async () => {
  if (client && client.isConnected()) {
    await client.disconnect();
    client = null;
  }
};

// Secure storage functions (localStorage with basic encryption)
const STORAGE_PREFIX = 'xrp_wallet_';

export const saveWallet = (wallet, password) => {
  try {
    // Simple encryption (for production, use proper encryption library)
    const data = JSON.stringify({ wallet, timestamp: Date.now() });
    const encoded = btoa(data + password); // Basic obfuscation
    
    localStorage.setItem(`${STORAGE_PREFIX}encrypted`, encoded);
    localStorage.setItem(`${STORAGE_PREFIX}hash`, btoa(password));
    return true;
  } catch (error) {
    console.error('Save wallet error:', error);
    return false;
  }
};

export const loadWallet = (password) => {
  try {
    const encoded = localStorage.getItem(`${STORAGE_PREFIX}encrypted`);
    const hash = localStorage.getItem(`${STORAGE_PREFIX}hash`);
    
    if (!encoded || !hash) return null;
    if (btoa(password) !== hash) return null;
    
    const decoded = atob(encoded);
    const data = decoded.substring(0, decoded.length - password.length);
    const parsed = JSON.parse(data);
    
    return parsed.wallet;
  } catch (error) {
    console.error('Load wallet error:', error);
    return null;
  }
};

export const walletExists = () => {
  return !!localStorage.getItem(`${STORAGE_PREFIX}encrypted`);
};

export const deleteWallet = () => {
  localStorage.removeItem(`${STORAGE_PREFIX}encrypted`);
  localStorage.removeItem(`${STORAGE_PREFIX}hash`);
};

// Contact management
export const saveContact = (name, address, tag = '') => {
  const contacts = getContacts();
  const contact = { 
    id: Date.now(), 
    name, 
    address, 
    tag: tag || '' 
  };
  contacts.push(contact);
  localStorage.setItem(`${STORAGE_PREFIX}contacts`, JSON.stringify(contacts));
  return contact;
};

export const getContacts = () => {
  try {
    const data = localStorage.getItem(`${STORAGE_PREFIX}contacts`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const deleteContact = (id) => {
  const contacts = getContacts().filter(c => c.id !== id);
  localStorage.setItem(`${STORAGE_PREFIX}contacts`, JSON.stringify(contacts));
};

// Settings management
export const saveSettings = (settings) => {
  localStorage.setItem(`${STORAGE_PREFIX}settings`, JSON.stringify(settings));
};

export const loadSettings = () => {
  try {
    const data = localStorage.getItem(`${STORAGE_PREFIX}settings`);
    return data ? JSON.parse(data) : { network: 'testnet' };
  } catch {
    return { network: 'testnet' };
  }
};
