import { useCallback, useEffect, useState } from "react";

export default function Results({ electionId, contract, refreshKey = 0 }) {
  const [names, setNames] = useState([]);
  const [votes, setVotes] = useState([]);

  const load = useCallback(async () => {
    const [n, v] = await contract.getResults(electionId);
    setNames(n);
    setVotes(v.map((x) => Number(x)));
  }, [contract, electionId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const total = votes.reduce((a, b) => a + b, 0);

  return (
    <div className="results">
      <h3>Live results</h3>
      {names.map((name, i) => {
        const pct = total === 0 ? 0 : Math.round((votes[i] / total) * 100);
        return (
          <div key={i} className="result-row">
            <div className="result-label">
              <span>{name}</span>
              <span className="result-count">
                {votes[i]} ({pct}%)
              </span>
            </div>
            <div className="result-bar">
              <div className="result-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
      {total === 0 && <p className="muted">No votes cast yet.</p>}
    </div>
  );
}
