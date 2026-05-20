import { useState } from "react";

export default function App() {
  const [account, setAccount] = useState(null);

  async function connect() {
    if (!window.ethereum) {
      alert("MetaMask is not installed.");
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
  }

  return (
    <div className="app">
      <header>
        <h1>ChainVote</h1>
        <p className="tagline">Transparent on-chain elections.</p>
        {account ? (
          <span className="account">Connected: {account.slice(0, 6)}…{account.slice(-4)}</span>
        ) : (
          <button onClick={connect}>Connect wallet</button>
        )}
      </header>
      <main>
        <p>Voting UI coming soon.</p>
      </main>
    </div>
  );
}
