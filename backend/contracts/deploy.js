const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying HealthRecordRegistry to Ethereum Sepolia...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("❌ No ETH balance! Get testnet ETH from:");
    console.error("   https://sepoliafaucet.com/");
    console.error("   https://www.alchemy.com/faucets/ethereum-sepolia");
    process.exit(1);
  }

  // Deploy contract
  const HealthRecordRegistry = await hre.ethers.getContractFactory("HealthRecordRegistry");
  const contract = await HealthRecordRegistry.deploy();
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ Contract deployed to:", address);
  console.log("\n📝 Add this to your .env file:");
  console.log(`CONTRACT_ADDRESS=${address}`);
  
  console.log("\n🔍 View on Etherscan:");
  console.log(`https://sepolia.etherscan.io/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
