const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ChainVote", function () {
  let chainVote;
  let owner, alice, bob, carol;

  beforeEach(async function () {
    [owner, alice, bob, carol] = await ethers.getSigners();
    const ChainVote = await ethers.getContractFactory("ChainVote");
    chainVote = await ChainVote.deploy();
    await chainVote.waitForDeployment();
  });

  async function createSampleElection(offsetStart = 0, offsetEnd = 3600) {
    const now = await time.latest();
    const start = now + offsetStart;
    const end = now + offsetEnd;
    const tx = await chainVote.createElection(
      "Best Pizza",
      ["Margherita", "Pepperoni", "Hawaiian"],
      start,
      end
    );
    await tx.wait();
    return { start, end };
  }

  describe("createElection", function () {
    it("increments electionCount and stores metadata", async function () {
      await createSampleElection();
      expect(await chainVote.electionCount()).to.equal(1);

      const [title, creator, , , candidateLen] = await chainVote.getElection(0);
      expect(title).to.equal("Best Pizza");
      expect(creator).to.equal(owner.address);
      expect(candidateLen).to.equal(3);
    });

    it("emits ElectionCreated", async function () {
      const now = await time.latest();
      await expect(
        chainVote.createElection("X", ["A", "B"], now + 10, now + 1000)
      ).to.emit(chainVote, "ElectionCreated");
    });

    it("reverts when candidate list is empty", async function () {
      const now = await time.latest();
      await expect(
        chainVote.createElection("X", [], now + 10, now + 1000)
      ).to.be.revertedWithCustomError(chainVote, "NoCandidates");
    });

    it("reverts when end <= start", async function () {
      const now = await time.latest();
      await expect(
        chainVote.createElection("X", ["A"], now + 100, now + 50)
      ).to.be.revertedWithCustomError(chainVote, "InvalidWindow");
    });

    it("reverts when end is in the past", async function () {
      const now = await time.latest();
      await expect(
        chainVote.createElection("X", ["A"], now - 1000, now - 10)
      ).to.be.revertedWithCustomError(chainVote, "InvalidWindow");
    });
  });

  describe("vote", function () {
    beforeEach(async function () {
      await createSampleElection();
    });

    it("records a vote and updates results", async function () {
      await chainVote.connect(alice).vote(0, 1);
      const [, votes] = await chainVote.getResults(0);
      expect(votes[0]).to.equal(0);
      expect(votes[1]).to.equal(1);
      expect(votes[2]).to.equal(0);
    });

    it("emits VoteCast", async function () {
      await expect(chainVote.connect(alice).vote(0, 2))
        .to.emit(chainVote, "VoteCast")
        .withArgs(0, alice.address, 2);
    });

    it("marks the voter as having voted", async function () {
      expect(await chainVote.hasVoted(0, alice.address)).to.equal(false);
      await chainVote.connect(alice).vote(0, 0);
      expect(await chainVote.hasVoted(0, alice.address)).to.equal(true);
    });

    it("reverts on double vote from the same address", async function () {
      await chainVote.connect(alice).vote(0, 0);
      await expect(
        chainVote.connect(alice).vote(0, 1)
      ).to.be.revertedWithCustomError(chainVote, "AlreadyVoted");
    });

    it("reverts on invalid candidate index", async function () {
      await expect(
        chainVote.connect(alice).vote(0, 99)
      ).to.be.revertedWithCustomError(chainVote, "InvalidCandidate");
    });

    it("reverts after the voting window closes", async function () {
      await time.increase(3700);
      await expect(
        chainVote.connect(alice).vote(0, 0)
      ).to.be.revertedWithCustomError(chainVote, "VotingNotOpen");
    });

    it("reverts for nonexistent elections", async function () {
      await expect(
        chainVote.connect(alice).vote(42, 0)
      ).to.be.revertedWithCustomError(chainVote, "ElectionNotFound");
    });

    it("tallies votes from multiple distinct addresses", async function () {
      await chainVote.connect(alice).vote(0, 0);
      await chainVote.connect(bob).vote(0, 0);
      await chainVote.connect(carol).vote(0, 1);
      const [, votes] = await chainVote.getResults(0);
      expect(votes[0]).to.equal(2);
      expect(votes[1]).to.equal(1);
    });
  });
});
