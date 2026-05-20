// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ChainVote — transparent on-chain elections
/// @notice Each election has a fixed candidate set, a voting window, and one vote per address.
contract ChainVote {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    struct Election {
        string title;
        address creator;
        uint64 startTime;
        uint64 endTime;
        bool exists;
        Candidate[] candidates;
        mapping(address => bool) hasVoted;
    }

    uint256 public electionCount;
    mapping(uint256 => Election) private elections;

    event ElectionCreated(uint256 indexed electionId, string title, address indexed creator, uint64 startTime, uint64 endTime);
    event VoteCast(uint256 indexed electionId, address indexed voter, uint256 indexed candidateIndex);

    error ElectionNotFound();
    error VotingNotOpen();
    error AlreadyVoted();
    error InvalidCandidate();
    error InvalidWindow();
    error NoCandidates();

    /// @notice Create an election with the given title, candidates, and time window.
    function createElection(
        string calldata title,
        string[] calldata candidateNames,
        uint64 startTime,
        uint64 endTime
    ) external returns (uint256 electionId) {
        if (candidateNames.length == 0) revert NoCandidates();
        if (endTime <= startTime) revert InvalidWindow();
        if (endTime <= block.timestamp) revert InvalidWindow();

        electionId = electionCount++;
        Election storage e = elections[electionId];
        e.title = title;
        e.creator = msg.sender;
        e.startTime = startTime;
        e.endTime = endTime;
        e.exists = true;

        for (uint256 i = 0; i < candidateNames.length; i++) {
            e.candidates.push(Candidate({name: candidateNames[i], voteCount: 0}));
        }

        emit ElectionCreated(electionId, title, msg.sender, startTime, endTime);
    }

    /// @notice Cast a single vote for `candidateIndex` in election `electionId`.
    function vote(uint256 electionId, uint256 candidateIndex) external {
        Election storage e = elections[electionId];
        if (!e.exists) revert ElectionNotFound();
        if (block.timestamp < e.startTime || block.timestamp > e.endTime) revert VotingNotOpen();
        if (e.hasVoted[msg.sender]) revert AlreadyVoted();
        if (candidateIndex >= e.candidates.length) revert InvalidCandidate();

        e.hasVoted[msg.sender] = true;
        e.candidates[candidateIndex].voteCount += 1;

        emit VoteCast(electionId, msg.sender, candidateIndex);
    }

    /// @notice Return election metadata (without candidates).
    function getElection(uint256 electionId)
        external
        view
        returns (string memory title, address creator, uint64 startTime, uint64 endTime, uint256 candidateLen)
    {
        Election storage e = elections[electionId];
        if (!e.exists) revert ElectionNotFound();
        return (e.title, e.creator, e.startTime, e.endTime, e.candidates.length);
    }

    /// @notice Return all candidate names and their current vote counts.
    function getResults(uint256 electionId)
        external
        view
        returns (string[] memory names, uint256[] memory votes)
    {
        Election storage e = elections[electionId];
        if (!e.exists) revert ElectionNotFound();
        uint256 n = e.candidates.length;
        names = new string[](n);
        votes = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            names[i] = e.candidates[i].name;
            votes[i] = e.candidates[i].voteCount;
        }
    }

    /// @notice Whether `voter` has already voted in `electionId`.
    function hasVoted(uint256 electionId, address voter) external view returns (bool) {
        Election storage e = elections[electionId];
        if (!e.exists) revert ElectionNotFound();
        return e.hasVoted[voter];
    }
}
