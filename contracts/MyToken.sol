pragma solidity ^0.4.23;

contract MyToken {
    mapping (address => uint) balanceOf;

    event transaction(address,uint);
    
    constructor() public{
        balanceOf[msg.sender] = 10000;
    }
    function transfer(address _to, uint _amount) public{
        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;
        emit transaction(_to,_amount);
    }
    function getBalance() public view returns(uint){
    	return balanceOf[msg.sender];
    }
    function getAccountGems(address _account) public view returns(uint){
    	return balanceOf[_account];
    }
}
