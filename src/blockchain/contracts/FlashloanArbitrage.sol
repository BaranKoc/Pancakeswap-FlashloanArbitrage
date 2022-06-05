pragma solidity ^0.6.6;

import './libraries/SafeMath.sol';
import './interfaces/IPancakeRouter02.sol';
import './interfaces/IPancakeERC20.sol';
 
contract FlashloanArbitrage{
  using SafeMath for uint256;

  //constant variables
  uint deadline = block.timestamp + 1 minutes;
  address pancakeRouter = 0x10ED43C718714eb63d5aA57B78B54704E256024E;
  address pancakeFactory = 0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73;
  
  //events
  event log_address(string massage, address value);
  event log_uint(string massage, uint value);
  
  function pancakeCall(
    address _sender,
    uint _amount0, 
    uint _amount1,
    bytes calldata _data  
  ) external {
    
    (address[] memory r_path, address[] memory t_path, address t_router) 
    = abi.decode(_data, 
    (address[], //r_path repayment path
    address[], //t_path trade path
    address //t_router router address of dex we gone trade
    ));
    
    uint Amount = _amount0 == 0 ? _amount1 : _amount0;

    // do stuff here
    IPancakeERC20(t_path[0]).approve(t_router, Amount);
    

    //compute this localy?
    uint AmountRequired = IPancakeRouter02(pancakeRouter).getAmountsIn(
      Amount, 
      r_path
    )[0];

    uint Amountrecived = IPancakeRouter02(t_router).swapExactTokensForTokens(
      Amount, 
      AmountRequired.mul(98)/100,//%2 slipage for test // use (amountRequired.mul(19)/981).add(1) for real swaps
      t_path, 
      msg.sender, 
      deadline
    )[1];  

    //pay back flash loan
    IPancakeERC20(t_path[1]).transfer(msg.sender, AmountRequired);

    //send what left to wallet ignore line if its a test
    //IPancakeERC20(t_path[1]).transfer(tx.origin, Amountrecived.sub(AmountRequired));
    
    //emit events
    emit log_address("_sender is: ", _sender);
  }
} 