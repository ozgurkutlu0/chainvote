import { BrowserProvider, Contract } from "ethers";
import abi from "../abi/ChainVote.json";

// Replace with deployed address after running `npm run deploy:sepolia` (or local).
export const CHAINVOTE_ADDRESS = "0x0000000000000000000000000000000000000000";

export function getProvider() {
  if (!window.ethereum) throw new Error("MetaMask not available");
  return new BrowserProvider(window.ethereum);
}

export async function getContract({ signer = false } = {}) {
  const provider = getProvider();
  const runner = signer ? await provider.getSigner() : provider;
  return new Contract(CHAINVOTE_ADDRESS, abi, runner);
}
