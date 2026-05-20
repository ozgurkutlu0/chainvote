# ChainVote

Decentralized voting dApp on Ethereum. Transparent, tamper-proof elections with on-chain results, voter authentication via wallet address, and real-time tallies.

## Features

- Create elections with arbitrary candidate sets and a fixed voting window
- One vote per wallet address per election, enforced on-chain
- Live results with vote counts and percentages
- Voting window status (Upcoming / Open / Closed) reflected in the UI
- Custom Solidity errors for gas-efficient reverts
- Events (`ElectionCreated`, `VoteCast`) for off-chain indexing

## Stack

- **Contracts:** Solidity 0.8.24, Hardhat, hardhat-toolbox
- **Frontend:** React 18, Vite, ethers.js v6
- **Networks:** localhost (Hardhat node), Sepolia

## Project structure

```
chainvote/
├── contracts/ChainVote.sol      # Election + voting logic
├── scripts/deploy.js            # Hardhat deploy script
├── test/ChainVote.test.js       # Contract tests
├── frontend/                    # React + Vite dApp
│   └── src/
│       ├── App.jsx
│       ├── components/          # ElectionCard, VoteForm, Results
│       ├── utils/contract.js    # ethers helpers, contract address
│       └── abi/ChainVote.json
├── hardhat.config.js
└── package.json
```

## Getting started

### 1. Install dependencies

```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Run tests

```bash
npm test
```

### 3. Deploy locally

In one terminal:

```bash
npm run node
```

In another:

```bash
npm run deploy:local
```

Copy the printed contract address into `frontend/src/utils/contract.js`:

```js
export const CHAINVOTE_ADDRESS = "0xYourDeployedAddress";
```

### 4. Run the frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` and connect MetaMask (set to the local Hardhat network, chain ID `31337`).

### 5. Deploy to Sepolia

Copy `.env.example` to `.env` and fill in `SEPOLIA_RPC_URL` and `PRIVATE_KEY`, then:

```bash
npm run deploy:sepolia
```

## Contract API

| Function | Description |
| --- | --- |
| `createElection(title, candidateNames[], startTime, endTime)` | Creates an election. Returns the new election ID. |
| `vote(electionId, candidateIndex)` | Casts a vote. Reverts on double vote, closed window, or bad index. |
| `getElection(electionId)` | Returns `(title, creator, startTime, endTime, candidateLen)`. |
| `getResults(electionId)` | Returns `(names[], voteCounts[])`. |
| `hasVoted(electionId, voter)` | Returns whether the address has already voted. |

## Roadmap

- [ ] Election creation form in the frontend
- [ ] Subgraph indexer for historical results
- [ ] Quadratic voting variant
- [ ] ENS display for voter addresses

## License

MIT — see [LICENSE](./LICENSE).
