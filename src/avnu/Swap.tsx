import { Account, CallData, Call, uint256 } from 'starknet';
import { RpcProvider } from 'starknet';
import axios from 'axios';

// Import addresses from an external file
import { ADDRESSES } from '../constants';
import { AddressesType } from '../types';
import { toHex, parseUnits } from 'viem'

// Vite-specific environment variable import
const takerAddress = import.meta.env.VITE_PUBLIC_KEY;
const privateKey = import.meta.env.VITE_PRIVATE_KEY;
const accountAddress = import.meta.env.VITE_ACCOUNT_ADDRESS;

class StarknetSwap {
  private provider: RpcProvider;
  private account: Account;

  constructor() {
    this.provider = new RpcProvider({ nodeUrl: 'https://free-rpc.nethermind.io/mainnet-juno' });
    this.account = new Account(this.provider, accountAddress, privateKey);
  }

  private async getQuote(
    sellToken: string,
    buyToken: string,
    amount: string
  ): Promise<any> {
    const sellTokenAddress = ADDRESSES[sellToken as keyof AddressesType].SN_MAIN;
    const buyTokenAddress = ADDRESSES[buyToken as keyof AddressesType].SN_MAIN;

    let sellAmount: string
    if (sellToken === "ETH") {
      sellAmount = toHex(parseUnits(amount, 18)) // 18 decimals for ETH
    } else if (buyToken === "ETH") {
      sellAmount = toHex(parseUnits(amount, 6))  // 6 decimals for USDC
    } else {
      throw new Error("Unsupported token pair")
    }

    const url = `https://starknet.api.avnu.fi/swap/v2/quotes?sellTokenAddress=${sellTokenAddress}&buyTokenAddress=${buyTokenAddress}&sellAmount=${sellAmount}&size=1`;

    const response = await axios.get(url);
    return response.data[0];
  }

  private async buildSwapCalldata(
    quoteId: string,
    slippage: number,
    includeApprove: boolean,
    gasTokenAddress: string
  ): Promise<any> {
    const url = 'https://starknet.api.avnu.fi/swap/v2/build';
    const data = {
      quoteId,
      takerAddress,
      slippage,
      gasTokenAddress,
      includeApprove
    };

    const response = await axios.post(url, data);
    return response.data;
  }

  private async executeTransactions(calls: Call[]): Promise<string> {
    const response = await this.account.execute(calls);
    await this.provider.waitForTransaction(response.transaction_hash);
    return response.transaction_hash;
  }



  public async swapEthToUsdc(amount: string): Promise<string> {
    try {
      const quote = await this.getQuote("ETH", "USDC", amount);
      const calldata = await this.buildSwapCalldata(quote.quoteId, 0.05, true,accountAddress);
      const calls = this.convertToCall(calldata.calls);
      return await this.executeTransactions(calls);
    } catch (e) {
      console.error("An error occurred during ETH to USDC swap:", e);
      throw e;
    }
  }

  public async swapUsdcToEth(amount: string): Promise<string> {
    try {
      const quote = await this.getQuote("USDC", "ETH", amount);
      const calldata = await this.buildSwapCalldata(quote.quoteId, 0.05, true,accountAddress);
      const calls = this.convertToCall(calldata.calls);
      return await this.executeTransactions(calls);
    } catch (e) {
      console.error("An error occurred during USDC to ETH swap:", e);
      throw e;
    }
  }

  private convertToCall(data: any[]): Call[] {
    return data.map(item => ({
      contractAddress: item.contractAddress,
      entrypoint: item.entrypoint,
      calldata: CallData.compile(item.calldata)
    }));
  }
}


export default StarknetSwap;