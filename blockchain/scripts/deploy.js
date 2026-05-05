const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Crowdfunding contract...");
  console.log("==============================================");

  // Get the contract factory
  const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");

  // Deploy the contract
  const crowdfunding = await Crowdfunding.deploy();

  // Wait for deployment to be confirmed
  await crowdfunding.waitForDeployment();

  // Get the deployed contract address
  const address = await crowdfunding.getAddress();

  console.log("✅ Crowdfunding contract deployed successfully!");
  console.log("==============================================");
  console.log(`📌 Contract Address: ${address}`);
  console.log("==============================================");
  console.log("");
  console.log("📋 Next Steps:");
  console.log("1. Copy the Contract Address above.");
  console.log("2. Copy the ABI from: blockchain/artifacts/contracts/Crowdfunding.sol/Crowdfunding.json");
  console.log("3. Paste both into your React client folder.");
  console.log("");
  console.log("💡 To interact with the contract using Hardhat console:");
  console.log(`   npx hardhat console --network localhost`);
  console.log(`   > const Crowdfunding = await ethers.getContractFactory("Crowdfunding");`);
  console.log(`   > const crowdfunding = await Crowdfunding.attach("${address}");`);
}

// Execute deployment
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});