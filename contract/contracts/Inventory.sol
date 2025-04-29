// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Inventory {
    struct Product {
        string name;
        string description;
        uint256 quantity;
    }
    
    mapping(uint256 => Product) public products;
    uint256 public productCount;
    
    event ProductAdded(uint256 productId, string name, string description, uint256 quantity);
    event ProductUpdated(uint256 productId, uint256 newQuantity);
    
    function addProduct(string memory _name, string memory _description, uint256 _initialQuantity) 
    public 
    {
        productCount++;
        products[productCount] = Product(_name, _description, _initialQuantity);
        emit ProductAdded(productCount, _name, _description, _initialQuantity);
    }
    
    function updateProductQuantity(uint256 _productId, uint256 _newQuantity) 
    public 
    {
        require(_productId > 0 && _productId <= productCount, "Invalid product ID");
        products[_productId].quantity = _newQuantity;
        emit ProductUpdated(_productId, _newQuantity);
    }
    
    function getProduct(uint256 _productId) public view returns (string memory, string memory, uint256) 
    {
        require(_productId > 0 && _productId <= productCount, "Invalid product ID");
        Product memory product = products[_productId];
        return (product.name, product.description, product.quantity);
    }
    
    function checkAvailability(uint256 _productId, uint256 _requiredQuantity) 
    public 
    view 
    returns (bool) 
    {
        require(_productId > 0 && _productId <= productCount, "Invalid product ID");
        return products[_productId].quantity >= _requiredQuantity;
    }
    
    function decreaseInventory(uint256 _productId, uint256 _amount) 
    public 
    {
        require(_productId > 0 && _productId <= productCount, "Invalid product ID");
        require(products[_productId].quantity >= _amount, "Insufficient inventory");
        products[_productId].quantity -= _amount;
        emit ProductUpdated(_productId, products[_productId].quantity);
    }
}