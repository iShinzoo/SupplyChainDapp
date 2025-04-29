// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Inventory.sol";

contract ShipmentPart {
    enum ShipmentStatus { Pending, InTransit, Delivered }
    
    struct ShipmentItem {
        uint256 productId;
        uint256 quantity;
    }
    
    struct Shipment {
        uint256 shipmentId;
        address sender;
        address receiver;
        ShipmentItem[] items;
        ShipmentStatus status;
        uint256 creationTime;
        uint256 deliveryTime;
    }
    
    Inventory public inventory;
    mapping(uint256 => Shipment) public shipments;
    uint256 public shipmentCount;
    
    event ShipmentCreated(uint256 shipmentId, address sender, address receiver);
    event ShipmentStatusUpdated(uint256 shipmentId, ShipmentStatus newStatus);
    
    constructor(address _inventoryAddress) {
        inventory = Inventory(_inventoryAddress);
    }
    
    function createShipment(
        address _receiver,
        uint256[] memory _productIds,
        uint256[] memory _quantities
    ) public 
    {
        require(_productIds.length == _quantities.length, "Mismatched arrays");
        
        for (uint256 i = 0; i < _productIds.length; i++) {
            require(inventory.checkAvailability(_productIds[i], _quantities[i]), "Insufficient inventory");
        }
        
        shipmentCount++;
        Shipment storage newShipment = shipments[shipmentCount];
        newShipment.shipmentId = shipmentCount;
        newShipment.sender = msg.sender;
        newShipment.receiver = _receiver;
        newShipment.status = ShipmentStatus.Pending;
        newShipment.creationTime = block.timestamp;
        
        for (uint256 i = 0; i < _productIds.length; i++) {
            newShipment.items.push(ShipmentItem({
                productId: _productIds[i],
                quantity: _quantities[i]
            }));
            inventory.decreaseInventory(_productIds[i], _quantities[i]);
        }
        
        emit ShipmentCreated(shipmentCount, msg.sender, _receiver);
    }
    
    function updateShipmentStatus(uint256 _shipmentId, ShipmentStatus _newStatus) 
    public 
    {
        require(_shipmentId > 0 && _shipmentId <= shipmentCount, "Invalid shipment ID");
        Shipment storage shipment = shipments[_shipmentId];
        
        require(msg.sender == shipment.sender || msg.sender == shipment.receiver, "Unauthorized");
        
        if (_newStatus == ShipmentStatus.InTransit) {
            require(shipment.status == ShipmentStatus.Pending, "Invalid status transition");
        } else if (_newStatus == ShipmentStatus.Delivered) {
            require(shipment.status == ShipmentStatus.InTransit, "Invalid status transition");
            shipment.deliveryTime = block.timestamp;
        }
        
        shipment.status = _newStatus;
        emit ShipmentStatusUpdated(_shipmentId, _newStatus);
    }
    
    function getShipment(uint256 _shipmentId) 
    public 
    view 
    returns (
        uint256,
        address,
        address,
        ShipmentStatus,
        uint256,
        uint256,
        ShipmentItem[] memory
    ) {
        require(_shipmentId > 0 && _shipmentId <= shipmentCount, "Invalid shipment ID");
        Shipment storage shipment = shipments[_shipmentId];
        return (
            shipment.shipmentId,
            shipment.sender,
            shipment.receiver,
            shipment.status,
            shipment.creationTime,
            shipment.deliveryTime,
            shipment.items
        );
    }
    
    function getShipmentStatus(uint256 _shipmentId) 
    public 
    view 
    returns (string memory) 
    {
        require(_shipmentId > 0 && _shipmentId <= shipmentCount, "Invalid shipment ID");
        ShipmentStatus status = shipments[_shipmentId].status;
        
        if (status == ShipmentStatus.Pending) return "Pending";
        if (status == ShipmentStatus.InTransit) return "InTransit";
        if (status == ShipmentStatus.Delivered) return "Delivered";
        return "Unknown";
    }
}