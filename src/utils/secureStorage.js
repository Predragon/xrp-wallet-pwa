// Secure storage for wallet data
// WARNING: This is basic encryption. For production, use a proper key derivation function

const STORAGE_KEY = 'xrp_wallet_data';
const CONTACTS_KEY = 'xrp_contacts';

// Simple XOR encryption (For demo purposes - use better encryption in production!)
const encryptData = (data, password) => {
  const text = JSON.stringify(data);
  let encrypted = '';
  for (let i = 0; i < text.length; i++) {
    encrypted += String.fromCharCode(text.charCodeAt(i) ^ password.charCodeAt(i % password.length));
  }
  return btoa(encrypted);
};

const decryptData = (encrypted, password) => {
  try {
    const text = atob(encrypted);
    let decrypted = '';
    for (let i = 0; i < text.length; i++) {
      decrypted += String.fromCharCode(text.charCodeAt(i) ^ password.charCodeAt(i % password.length));
    }
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Save wallet with password protection
export const saveWallet = (wallet, password) => {
  try {
    const encrypted = encryptData(wallet, password);
    localStorage.setItem(STORAGE_KEY, encrypted);
    return true;
  } catch (error) {
    console.error('Error saving wallet:', error);
    return false;
  }
};

// Load wallet with password
export const loadWallet = (password) => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;
    
    const wallet = decryptData(encrypted, password);
    return wallet;
  } catch (error) {
    console.error('Error loading wallet:', error);
    return null;
  }
};

// Check if wallet exists
export const walletExists = () => {
  return localStorage.getItem(STORAGE_KEY) !== null;
};

// Delete wallet
export const deleteWallet = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Contact management
export const saveContact = (name, address, tag = null) => {
  try {
    const contacts = getContacts();
    const newContact = {
      id: Date.now(),
      name,
      address,
      tag,
      createdAt: new Date().toISOString()
    };
    contacts.push(newContact);
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
    return newContact;
  } catch (error) {
    console.error('Error saving contact:', error);
    return null;
  }
};

export const getContacts = () => {
  try {
    const contacts = localStorage.getItem(CONTACTS_KEY);
    return contacts ? JSON.parse(contacts) : [];
  } catch (error) {
    console.error('Error loading contacts:', error);
    return [];
  }
};

export const deleteContact = (id) => {
  try {
    const contacts = getContacts();
    const filtered = contacts.filter(c => c.id !== id);
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting contact:', error);
    return false;
  }
};

// Settings management
export const saveSettings = (settings) => {
  try {
    localStorage.setItem('xrp_settings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

export const loadSettings = () => {
  try {
    const settings = localStorage.getItem('xrp_settings');
    return settings ? JSON.parse(settings) : {
      network: 'testnet',
      currency: 'USD',
      notifications: true
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      network: 'testnet',
      currency: 'USD',
      notifications: true
    };
  }
};
