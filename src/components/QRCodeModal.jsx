import React, { useEffect, useRef } from 'react';
import { X, Download, Copy } from 'lucide-react';
import QRCode from 'qrcode';

const QRCodeModal = ({ isOpen, onClose, address, amount = null }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && canvasRef.current && address) {
      generateQRCode();
    }
  }, [isOpen, address, amount]);

  const generateQRCode = async () => {
    try {
      // XRP URI format: ripple:ADDRESS?amount=AMOUNT
      const uri = amount 
        ? `ripple:${address}?amount=${amount}`
        : `ripple:${address}`;
      
      await QRCode.toCanvas(canvasRef.current, uri, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQR = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `xrp-address-${address.substring(0, 10)}.png`;
      link.href = url;
      link.click();
    }
  };

  const copyAddress = () => {
    const textarea = document.createElement('textarea');
    textarea.value = address;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Receive XRP</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-xl border-4 border-gray-200 mb-4">
            <canvas ref={canvasRef} />
          </div>

          <div className="w-full bg-gray-100 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 mb-1">Your XRP Address</p>
            <p className="text-sm font-mono text-gray-800 break-all">{address}</p>
          </div>

          {amount && (
            <div className="w-full bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-600 mb-1">Requested Amount</p>
              <p className="text-lg font-bold text-blue-800">{amount} XRP</p>
            </div>
          )}

          <div className="flex gap-2 w-full">
            <button
              onClick={copyAddress}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Copy className="w-5 h-5" />
              Copy Address
            </button>
            <button
              onClick={downloadQR}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download QR
            </button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ Only send XRP to this address. Sending other cryptocurrencies may result in loss of funds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
