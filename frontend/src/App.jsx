import { useEffect, useState } from "react";
import { getContract, CHAINVOTE_ADDRESS } from "./utils/contract.js";
import ElectionCard from "./components/ElectionCard.jsx";

export default function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [electionIds, setElectionIds] = useState([]);
  const [error, setError] = useState(null);

  async function connect() {
    if (!window.ethereum) {
      setError("MetaMask is not installed.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      const c = await getContract({ signer: true });
      setContract(c);
    } catch (e) {
      setError(e?.message || "Failed to connect");
    }
  }

  useEffect(() => {
    if (!contract) return;
    let cancelled = false;
    async function loadElections() {
      try {
        const count = Number(await contract.electionCount());
        if (cancelled) return;
        setElectionIds(Array.from({ length: count }, (_, i) => i));
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load elections");
      }
    }
    loadElections();
    return () => {
      cancelled = true;
    };
  }, [contract]);

  const addressIsSet =
    CHAINVOTE_ADDRESS !== "0x0000000000000000000000000000000000000000";

  return (
    <div className="app">
      <header>
        <h1>ChainVote</h1>
        <p className="tagline">Transparent on-chain elections.</p>
        {account ? (
          <span className="account">
            Connected: {account.slice(0, 6)}…{account.slice(-4)}
          </span>
        ) : (
          <button onClick={connect}>Connect wallet</button>
        )}
      </header>
      <main>
        {!addressIsSet && (
          <p className="warning">
            Contract address is not set. Deploy the contract and update{" "}
            <code>CHAINVOTE_ADDRESS</code> in <code>src/utils/contract.js</code>.
          </p>
        )}
        {error && <p className="error">{error}</p>}
        {contract && electionIds.length === 0 && (
          <p className="muted">No elections yet.</p>
        )}
        {contract &&
          electionIds.map((id) => (
            <ElectionCard
              key={id}
              electionId={id}
              contract={contract}
              account={account}
            />
          ))}
      </main>
    </div>
  );
}
