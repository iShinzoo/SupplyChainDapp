const hre = require("hardhat");

async function main() {

    const Tracking = await hre.ethers.getContractFactory("Tracking");
    const tracking = await Tracking.deploy(); 

    await tracking.waitForDeployment();

    const address = await tracking.getAddress();

    console.log("Tracking deployed to: ", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});