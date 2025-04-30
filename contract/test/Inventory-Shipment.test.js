const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Inventory and Shipment Integration", function () {
  let Inventory;
  let inventory;
  let Shipment;
  let shipment;
  let owner;
  let receiver;
  let addr1;

  beforeEach(async function () {
    [owner, receiver, addr1] = await ethers.getSigners();

    // Deploy Inventory contract
    Inventory = await ethers.getContractFactory("Inventory");
    inventory = await Inventory.deploy();
    await inventory.waitForDeployment();

    // Deploy Shipment contract with Inventory address
    Shipment = await ethers.getContractFactory("ShipmentPart");
    shipment = await Shipment.deploy(await inventory.getAddress());
    await shipment.waitForDeployment();

    // Add some test products to inventory
    await inventory.addProduct("Product 1", "Test Product 1", 100);
    await inventory.addProduct("Product 2", "Test Product 2", 50);
  });

  describe("Inventory", function () {
    it("Should add products correctly", async function () {
      const [name, description, quantity] = await inventory.getProduct(1);
      expect(name).to.equal("Product 1");
      expect(description).to.equal("Test Product 1");
      expect(quantity).to.equal(100);
    });

    it("Should update product quantity", async function () {
      await inventory.updateProductQuantity(1, 75);
      const [, , quantity] = await inventory.getProduct(1);
      expect(quantity).to.equal(75);
    });

    it("Should check availability correctly", async function () {
      const available = await inventory.checkAvailability(1, 50);
      expect(available).to.be.true;

      const notAvailable = await inventory.checkAvailability(1, 150);
      expect(notAvailable).to.be.false;
    });

    it("Should decrease inventory correctly", async function () {
      await inventory.decreaseInventory(1, 30);
      const [, , quantity] = await inventory.getProduct(1);
      expect(quantity).to.equal(70);
    });

    it("Should revert when decreasing more than available", async function () {
      await expect(
        inventory.decreaseInventory(1, 150)
      ).to.be.revertedWith("Insufficient inventory");
    });
  });

  describe("Shipment", function () {
    it("Should create shipment correctly", async function () {
      const productIds = [1, 2];
      const quantities = [10, 5];

      await shipment.createShipment(receiver.address, productIds, quantities);

      const shipmentDetails = await shipment.getShipment(1);
      expect(shipmentDetails[1]).to.equal(owner.address); // sender
      expect(shipmentDetails[2]).to.equal(receiver.address); // receiver
      expect(shipmentDetails[3]).to.equal(0); // status (Pending)
    });

    it("Should update shipment status correctly", async function () {
      const productIds = [1];
      const quantities = [10];

      await shipment.createShipment(receiver.address, productIds, quantities);
      await shipment.updateShipmentStatus(1, 1); // Set to InTransit

      const status = await shipment.getShipmentStatus(1);
      expect(status).to.equal("InTransit");
    });

    it("Should only allow authorized users to update status", async function () {
      const productIds = [1];
      const quantities = [10];

      await shipment.createShipment(receiver.address, productIds, quantities);

      await expect(
        shipment.connect(addr1).updateShipmentStatus(1, 1)
      ).to.be.revertedWith("Unauthorized");
    });

    it("Should enforce valid status transitions", async function () {
      const productIds = [1];
      const quantities = [10];

      await shipment.createShipment(receiver.address, productIds, quantities);
      
      // Cannot go directly to Delivered
      await expect(
        shipment.updateShipmentStatus(1, 2)
      ).to.be.revertedWith("Invalid status transition");

      // Correct transition: Pending -> InTransit -> Delivered
      await shipment.updateShipmentStatus(1, 1); // To InTransit
      await shipment.updateShipmentStatus(1, 2); // To Delivered

      const status = await shipment.getShipmentStatus(1);
      expect(status).to.equal("Delivered");
    });

    it("Should update inventory when creating shipment", async function () {
      const productIds = [1];
      const quantities = [50];

      await shipment.createShipment(receiver.address, productIds, quantities);

      const [, , quantity] = await inventory.getProduct(1);
      expect(quantity).to.equal(50); // Original 100 - 50
    });
  });
});