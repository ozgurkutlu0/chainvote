const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying ChainVote with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const ChainVote = await hre.ethers.getContractFactory("ChainVote");
  const chainVote = await ChainVote.deploy();
  await chainVote.waitForDeployment();

  const address = await chainVote.getAddress();
  console.log("ChainVote deployed to:", address);

  console.log("\nNext steps:");
  console.log(`  - Update frontend/src/utils/contract.js with address: ${address}`);
  console.log(`  - Verify on Etherscan: npx hardhat verify --network ${hre.network.name} ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
