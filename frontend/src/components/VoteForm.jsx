import { useEffect, useState } from "react";

export default function VoteForm({ electionId, contract, onVoted }) {
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    contract.getResults(electionId).then(([names]) => {
      if (!cancelled) setCandidates(names);
    });
    return () => {
      cancelled = true;
    };
  }, [contract, electionId]);

  async function submit() {
    if (selected == null) return;
    setSubmitting(true);
    setError(null);
    try {
      const tx = await contract.vote(electionId, selected);
      await tx.wait();
      onVoted?.();
    } catch (e) {
      setError(e?.shortMessage || e?.message || "Vote failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="vote-form">
      <ul className="candidates">
        {candidates.map((name, i) => (
          <li key={i}>
            <label>
              <input
                type="radio"
                name={`vote-${electionId}`}
                checked={selected === i}
                onChange={() => setSelected(i)}
              />
              {name}
            </label>
          </li>
        ))}
      </ul>
      <button disabled={submitting || selected == null} onClick={submit}>
        {submitting ? "Submitting…" : "Cast vote"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
