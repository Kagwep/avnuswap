import React, { useState } from 'react';
import StarknetSwap from './Swap'; // Adjust the import path as needed

const SwapInterface: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [swapDirection, setSwapDirection] = useState<'ethToUsdc' | 'usdcToEth'>('ethToUsdc');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);

  const starknetSwap = new StarknetSwap();

  const handleSwap = async () => {
    if (!amount) {
      setResult('Please enter an amount');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let transactionHash;
      if (swapDirection === 'ethToUsdc') {
        transactionHash = await starknetSwap.swapEthToUsdc(amount);
      } else {
        transactionHash = await starknetSwap.swapUsdcToEth(amount);
      }
      setResult(`Swap successful! Transaction hash: ${transactionHash}`);
    } catch (error) {
      setResult(`Swap failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Starknet Swap</h2>
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Amount
        </label>
        <input
          type="text"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter amount"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Swap Direction
        </label>
        <div className="flex space-x-4">
          <button
            onClick={() => setSwapDirection('ethToUsdc')}
            className={`px-4 py-2 rounded-md ${
              swapDirection === 'ethToUsdc'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            ETH to USDC
          </button>
          <button
            onClick={() => setSwapDirection('usdcToEth')}
            className={`px-4 py-2 rounded-md ${
              swapDirection === 'usdcToEth'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            USDC to ETH
          </button>
        </div>
      </div>
      <button
        onClick={handleSwap}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Swapping...' : 'Swap'}
      </button>
      {result && (
        <div className={`mt-4 p-3 rounded-md ${result.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {result}
        </div>
      )}
    </div>
  );
};

export default SwapInterface;