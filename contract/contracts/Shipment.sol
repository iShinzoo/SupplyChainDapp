// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Shipment deployed to: 0xCdd43724cb2502e8A704C488a00DFe2A92d5606A

import "./Inventory.sol";

contract ShipmentPart {
    enum ShipmentStatus { Pending, InTransit, Delivered }
    
    struct ShipmentItem {
        uint256 productId;
        uint256 quantity;
    }
    
    struct TrackingInfo {
        string currentLocation;
        string[] locationHistory;
        uint256[] locationTimestamps;
        string notes;
        uint256 distance;
        bool isPaid;
    }
    
    struct Shipment {
        uint256 shipmentId;
        address sender;
        address receiver;
        ShipmentItem[] items;
        ShipmentStatus status;
        uint256 creationTime;
        uint256 deliveryTime;
        TrackingInfo tracking;
    }
    
    Inventory public inventory;
    mapping(uint256 => Shipment) public shipments;
    uint256 public shipmentCount;
    
    event ShipmentCreated(uint256 shipmentId, address sender, address receiver);
    event ShipmentStatusUpdated(uint256 shipmentId, ShipmentStatus newStatus);
    event TrackingUpdated(uint256 shipmentId, string location, uint256 timestamp);
    event NotesUpdated(uint256 shipmentId, string notes);
    
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
        
        // Initialize tracking information
        newShipment.tracking.currentLocation = "Warehouse";
        newShipment.tracking.locationHistory.push("Warehouse");
        newShipment.tracking.locationTimestamps.push(block.timestamp);
        newShipment.tracking.notes = "Shipment created and ready for dispatch";
        newShipment.tracking.distance = 0;
        newShipment.tracking.isPaid = false;
        
        for (uint256 i = 0; i < _productIds.length; i++) {
            newShipment.items.push(ShipmentItem({
                productId: _productIds[i],
                quantity: _quantities[i]
            }));
            inventory.decreaseInventory(_productIds[i], _quantities[i]);
        }
        
        emit ShipmentCreated(shipmentCount, msg.sender, _receiver);
        emit TrackingUpdated(shipmentCount, "Warehouse", block.timestamp);
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
        ShipmentItem[] memory,
        TrackingInfo memory
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
            shipment.items,
            shipment.tracking
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
    
    function updateTrackingLocation(uint256 _shipmentId, string memory _location, uint256 _distance) 
    public 
    {
        require(_shipmentId > 0 && _shipmentId <= shipmentCount, "Invalid shipment ID");
        Shipment storage shipment = shipments[_shipmentId];
        
        require(msg.sender == shipment.sender || msg.sender == shipment.receiver, "Unauthorized");
        
        shipment.tracking.currentLocation = _location;
        shipment.tracking.locationHistory.push(_location);
        shipment.tracking.locationTimestamps.push(block.timestamp);
        shipment.tracking.distance = _distance;
        
        emit TrackingUpdated(_shipmentId, _location, block.timestamp);
    }
    
    function updateTrackingNotes(uint256 _shipmentId, string memory _notes) 
    public 
    {
        require(_shipmentId > 0 && _shipmentId <= shipmentCount, "Invalid shipment ID");
        Shipment storage shipment = shipments[_shipmentId];
        
        require(msg.sender == shipment.sender || msg.sender == shipment.receiver, "Unauthorized");
        
        shipment.tracking.notes = _notes;
        
        emit NotesUpdated(_shipmentId, _notes);
    }
    
    function getTrackingInfo(uint256 _shipmentId) 
    public 
    view 
    returns (TrackingInfo memory) 
    {
        require(_shipmentId > 0 && _shipmentId <= shipmentCount, "Invalid shipment ID");
        return shipments[_shipmentId].tracking;
    }
    
    function getAllTransaction() 
    public 
    view 
    returns (Shipment[] memory) 
    {
        Shipment[] memory allShipments = new Shipment[](shipmentCount);
        
        for (uint256 i = 0; i < shipmentCount; i++) {
            allShipments[i] = shipments[i + 1];
        }
        
        return allShipments;
    }
    
    function StartShipment(address _sender, address _receiver, uint256 _shipmentId) 
    public 
    {
        require(_shipmentId > 0 && _shipmentId <= shipmentCount, "Invalid shipment ID");
        Shipment storage shipment = shipments[_shipmentId];
        
        require(msg.sender == shipment.sender, "Only sender can start shipment");
        require(shipment.sender == _sender, "Sender address mismatch");
        require(shipment.receiver == _receiver, "Receiver address mismatch");
        require(shipment.status == ShipmentStatus.Pending, "Shipment already started");
        
        shipment.status = ShipmentStatus.InTransit;
        
        emit ShipmentStatusUpdated(_shipmentId, ShipmentStatus.InTransit);
    }
    
    function CompleteShipment(address _sender, address _receiver, uint256 _shipmentId) 
    public 
    {
        require(_shipmentId > 0 && _shipmentId <= shipmentCount, "Invalid shipment ID");
        Shipment storage shipment = shipments[_shipmentId];
        
        require(msg.sender == shipment.receiver, "Only receiver can complete shipment");
        require(shipment.sender == _sender, "Sender address mismatch");
        require(shipment.receiver == _receiver, "Receiver address mismatch");
        require(shipment.status == ShipmentStatus.InTransit, "Shipment not in transit");
        
        shipment.status = ShipmentStatus.Delivered;
        shipment.deliveryTime = block.timestamp;
        
        emit ShipmentStatusUpdated(_shipmentId, ShipmentStatus.Delivered);
    }
}