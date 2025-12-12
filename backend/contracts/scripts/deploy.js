const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying HealthRecordRegistry to Polygon Amoy...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC");

  // Deploy contract
  const HealthRecordRegistry = await hre.ethers.getContractFactory("HealthRecordRegistry");
  const contract = await HealthRecordRegistry.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  
  console.log("\n✅ HealthRecordRegistry deployed!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 View on PolygonScan:", `https://amoy.polygonscan.com/address/${contractAddress}`);
  
  console.log("\n📝 Update your .env file:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);

  // Grant HOSPITAL_ROLE to deployer for testing
  console.log("\n🏥 Granting HOSPITAL_ROLE to deployer...");
  const HOSPITAL_ROLE = await contract.HOSPITAL_ROLE();
  const tx = await contract.addHospital(deployer.address);
  await tx.wait();
  console.log("✅ HOSPITAL_ROLE granted");

  console.log("\n🎉 Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
