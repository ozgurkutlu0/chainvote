import { useEffect, useState } from "react";
import VoteForm from "./VoteForm.jsx";
import Results from "./Results.jsx";

export default function ElectionCard({ electionId, contract, account }) {
  const [meta, setMeta] = useState(null);
  const [voted, setVoted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [title, creator, startTime, endTime] = await contract.getElection(electionId);
      if (cancelled) return;
      setMeta({
        title,
        creator,
        startTime: Number(startTime),
        endTime: Number(endTime),
      });
      if (account) {
        const v = await contract.hasVoted(electionId, account);
        if (!cancelled) setVoted(v);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [contract, electionId, account]);

  if (!meta) return <div className="card">Loading election #{electionId}…</div>;

  const now = Math.floor(Date.now() / 1000);
  const status =
    now < meta.startTime ? "Upcoming" : now > meta.endTime ? "Closed" : "Open";

  return (
    <div className="card">
      <div className="card-header">
        <h2>{meta.title}</h2>
        <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
      </div>
      <p className="meta">
        Window: {new Date(meta.startTime * 1000).toLocaleString()} →{" "}
        {new Date(meta.endTime * 1000).toLocaleString()}
      </p>
      {status === "Open" && !voted && account && (
        <VoteForm
          electionId={electionId}
          contract={contract}
          onVoted={() => {
            setVoted(true);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
      {voted && <p className="voted">You have voted in this election.</p>}
      <Results electionId={electionId} contract={contract} refreshKey={refreshKey} />
    </div>
  );
}
