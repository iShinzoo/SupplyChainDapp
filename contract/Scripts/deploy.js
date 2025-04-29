const hre = require("hardhat");

async function verify(contractAddress, args) {
    console.log("Verifying contract...");
    try {
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!");
        } else {
            console.log(e);
        }
    }
}

async function waitForConfirmations(contract) {
    console.log("Waiting for confirmations...");
    await contract.deploymentTransaction().wait(5);
}

async function deployInventory() {
    console.log("Deploying Inventory contract...");
    const Inventory = await hre.ethers.getContractFactory("Inventory");
    const inventory = await Inventory.deploy();
    await waitForConfirmations(inventory);
    
    const address = await inventory.getAddress();
    console.log("Inventory deployed to:", address);

    if (hre.network.name !== "hardhat") {
        await verify(address, []);
    }
    
    return address;
}

async function deployShipment(inventoryAddress) {
    console.log("Deploying Shipment contract...");
    const Shipment = await hre.ethers.getContractFactory("ShipmentPart");
    const shipment = await Shipment.deploy(inventoryAddress);
    await waitForConfirmations(shipment);
    
    const address = await shipment.getAddress();
    console.log("Shipment deployed to:", address);

    if (hre.network.name !== "hardhat") {
        await verify(address, [inventoryAddress]);
    }
    
    return address;
}

async function main() {
    try {
        // Deploy Inventory first
        const inventoryAddress = await deployInventory();
        console.log("✅ Inventory deployment completed");

        // Deploy Shipment with Inventory address
        const shipmentAddress = await deployShipment(inventoryAddress);
        console.log("✅ Shipment deployment completed");

        // Log all deployment addresses
        console.log("\nDeployment Summary:");
        console.log("-------------------");
        console.log("Inventory:", inventoryAddress);
        console.log("Shipment:", shipmentAddress);
        
    } catch (error) {
        console.error("❌ Deployment failed:");
        console.error(error);
        process.exitCode = 1;
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', error => {
    console.error('❌ Unhandled promise rejection:', error);
    process.exitCode = 1;
});

main();