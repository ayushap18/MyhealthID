const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying HealthRecordRegistryV2 (Enhanced) to Ethereum Sepolia...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("❌ No ETH balance! Get testnet ETH from:");
    console.error("   https://sepoliafaucet.com/");
    process.exit(1);
  }

  // Deploy contract
  const HealthRecordRegistryV2 = await hre.ethers.getContractFactory("HealthRecordRegistryV2");
  const contract = await HealthRecordRegistryV2.deploy();
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ HealthRecordRegistryV2 deployed to:", address);
  console.log("\n📝 UPDATE your .env file with this new address:");
  console.log(`CONTRACT_ADDRESS=${address}`);
  
  console.log("\n🔍 View on Etherscan:");
  console.log(`https://sepolia.etherscan.io/address/${address}`);

  console.log("\n⚠️  IMPORTANT: You must re-seed your data or update the backend to use this new contract address.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
