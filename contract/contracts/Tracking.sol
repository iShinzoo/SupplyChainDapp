// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// cotract Tracking deployed at:  0x4EC17E231FEC4e133c3f58Ac94B549dD40Db0599

contract Tracking {
    //Status of the shipment
    enum ShipmentStatus {
        PENDING,
        IN_TRANSIT,
        DELIVERED
    }

    //Parameters required for the shipment
    struct Shipment {
        address sender;
        address receiver;
        uint256 pickupTime;
        uint256 deliveryTime;
        uint256 distance;
        uint256 price;
        ShipmentStatus status;
        bool ispaid;
    }

    mapping(address => Shipment[]) public shipments;
    uint256 public shipmentCount;

    //For the Use of Frontend
    struct TypeShipment {
        address sender;
        address receiver;
        uint256 pickupTime;
        uint256 deliveryTime;
        uint256 distance;
        uint256 price;
        ShipmentStatus status;
        bool ispaid;
    }

    TypeShipment[] typeShipments;

    //event to be emitted when a shipment is created,InTransit,ShipmentPaid and Delivered
    event ShipmentCreated(
        address indexed sender,
        address indexed receiver,
        uint256 pickupTime,
        uint256 distance,
        uint256 price
    );
    event ShipmentInTransit(
        address indexed sender,
        address indexed receiver,
        uint256 pickupTime
    );
    event ShipmentDelivered(
        address indexed sender,
        address indexed receiver,
        uint256 deliveryTime
    );
    event ShipmentPaid(
        address indexed sender,
        address indexed receiver,
        uint256 amount
    );

    constructor() {
        shipmentCount = 0;
    }

    //Function to create a Shipment
    function CreateShipment(
        address _receiver,
        uint256 _pickupTime,
        uint256 _distance,
        uint256 _price
    ) 
    public 
    payable 
    {
        require(msg.value == _price, "Insufficient funds");

        Shipment memory shipment = Shipment({
            sender: msg.sender,
            receiver: _receiver,
            pickupTime: _pickupTime,
            deliveryTime: 0,
            distance: _distance,
            price: _price,
            status: ShipmentStatus.PENDING,
            ispaid: false
        });

        shipments[msg.sender].push(shipment);
        shipmentCount++;

        typeShipments.push(
            TypeShipment({
                sender: msg.sender,
                receiver: _receiver,
                pickupTime: _pickupTime,
                deliveryTime: 0,
                distance: _distance,
                price: _price,
                status: ShipmentStatus.PENDING,
                ispaid: false
            })
        );

        emit ShipmentCreated(
            msg.sender,
            _receiver,
            _pickupTime,
            _distance,
            _price
        );
    }

    function StartShipment(
        address _sender,
        address _receiver,
        uint256 _index
    ) 
    public 
    {
        Shipment storage shipment = shipments[_sender][_index];
        TypeShipment storage typeShipment = typeShipments[_index];

        require(shipment.receiver == _receiver, "Invalid Receiver");
        require(
            shipment.status == ShipmentStatus.PENDING,
            "Shipment already in transit"
        );

        shipment.status = ShipmentStatus.IN_TRANSIT;
        typeShipment.status = ShipmentStatus.IN_TRANSIT;

        emit ShipmentInTransit(_sender, _receiver, shipment.pickupTime);
    }

    function CompleteShipment(
        address _sender,
        address _receiver,
        uint256 _index
    ) 
    public 
    {
        Shipment storage shipment = shipments[_sender][_index];
        TypeShipment storage typeShipment = typeShipments[_index];

        require(shipment.receiver == _receiver, "Invalid Receiver");
        require(
            shipment.status == ShipmentStatus.PENDING,
            "Shipment already in Transit"
        );
        require(!shipment.ispaid, "Shipment already paid");

        shipment.status = ShipmentStatus.DELIVERED;
        typeShipment.status = ShipmentStatus.DELIVERED;
        typeShipment.deliveryTime = block.timestamp;
        shipment.deliveryTime = block.timestamp;

        uint256 amount = shipment.price;

        payable(shipment.sender).transfer(amount);

        shipment.ispaid = true;
        typeShipment.ispaid = true;

        emit ShipmentDelivered(_sender, _receiver, shipment.deliveryTime);
        emit ShipmentPaid(_sender, _receiver, amount);
    }

    function getShipment(
        address _sender,
        uint256 _index
    )
        public
        view
        returns (
            address,
            address,
            uint256,
            uint256,
            uint256,
            uint256,
            ShipmentStatus,
            bool
        )
    {
        Shipment memory shipment = shipments[_sender][_index];
        return (
            shipment.sender,
            shipment.receiver,
            shipment.pickupTime,
            shipment.deliveryTime,
            shipment.distance,
            shipment.price,
            shipment.status,
            shipment.ispaid
        );
    }

    function getShipmentCount(address _sender) 
    public 
    view 
    returns (uint256) 
    {
        return shipments[_sender].length;
    }

    function getAllTransaction() 
    public 
    view 
    returns (TypeShipment[] memory) 
    {
        return typeShipments;
    }
}
