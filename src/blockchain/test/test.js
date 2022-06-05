//import node modules
const {ethers} = require("ethers");
const {utils} = ethers;
const Big = require("bignumber.js");
const colors = require('colors/safe');
const cmd = require('node-cmd');

//import web3
const Web3 = require('web3'); 
const web3 = new Web3('http://127.0.0.1:7545');

//import .env variables
require('dotenv').config();
const project_folder = process.env.project_folder;
const privateKey = process.env.account_privateKey;

//import tokens files
const BEP20ABI = require(project_folder+"repository/abis/erc20.json")
const DAI = require(project_folder+"repository/tokens.json").dai;
const WBNB = require(project_folder+"repository/tokens.json").wbnb;
const USDC = require(project_folder+"repository/tokens.json").usdc;
const BUSD = require(project_folder+"repository/tokens.json").busd;

//import contract files
const arbitrage_abi = require(project_folder+"src/blockchain/artifacts/src/blockchain/contracts/FlashloanArbitrage.sol/FlashloanArbitrage.json").abi;
const arbitrage_addr = require(project_folder+"repository/contract.json").contract_address;

//import dex files
const pan_factory_addr = require(project_folder+"repository/addresses/pancake-mainnet.json").factory;
const ape_factory_addr = require(project_folder+"repository/addresses/ape-mainnet.json").factory;
const bake_factory_addr = require(project_folder+"repository/addresses/bakery-mainnet.json").factory;
const pan_router_addr = require(project_folder+"repository/addresses/pancake-mainnet.json").router;
const ape_router_addr = require(project_folder+"repository/addresses/ape-mainnet.json").router;
const bake_router_addr = require(project_folder+"repository/addresses/bakery-mainnet.json").router;
const pan_router_abi = require(project_folder+"repository/abis/pancakeRouter.json").pancakeRouter;
const ape_router_abi = require(project_folder+"repository/abis/apeRouter.json").apeRouter;
const bake_router_abi = require(project_folder+"repository/abis/bakeryRouter.json").bakeryRouter;
const pan_factory_abi = require(project_folder+"repository/abis/pancakeFactory.json").pancakeFactory;
const ape_factory_abi = require(project_folder+"repository/abis/apeFactory.json").apeFactory;
const bake_factory_abi = require(project_folder+"repository/abis/bakeryFactory.json").bakeryFactory
const V2PAIR = require(project_folder+"repository/abis/v2Pair.json").PancakeV2pair;


//const vars
const account_addr = process.env.account
const usdc_whale_addr = process.env.usdc_whale;
const dai_whale_addr =  process.env.dai_whale;
const bnb_whale_addr = process.env.bnb_whale;
const busd_whale_addr = process.env.busd_whale;


async function init() {
  //set up ethers provider
  //====================================================
  let url = "http://127.0.0.1:7545";
  let provider = new ethers.providers.JsonRpcProvider(url);
  let account = new ethers.Wallet(privateKey,provider);
  console.log(`Current http provider is: ${colors.brightYellow(provider.connection.url)}\n`); 
  

  //set up Contracts
  //======================================
  const arbitrage = new ethers.Contract(arbitrage_addr,arbitrage_abi,account);
  const dai = new ethers.Contract(DAI,BEP20ABI,provider);
  const busd = new ethers.Contract(BUSD,BEP20ABI,provider);
  const pan_factory = new ethers.Contract(pan_factory_addr,pan_factory_abi,provider);
  const pan_router = new ethers.Contract(pan_router_addr,pan_router_abi,provider);
  const ape_factory = new ethers.Contract(ape_factory_addr,ape_factory_abi,provider);
  const ape_router = new ethers.Contract(ape_router_addr,ape_router_abi,provider);
  const bake_factory = new ethers.Contract(bake_factory_addr,bake_factory_abi,provider);
  const bake_router = new ethers.Contract(bake_router_addr,bake_router_abi,provider);


  
  //Set up test variables
  //======================================
  const barrowToken = dai;
  const otherToken = busd;
  const barrowAmount = '2000';

  let pan_pair_addr = await pan_factory.getPair(barrowToken.address,otherToken.address);
  let pan_pair = new ethers.Contract(pan_pair_addr,V2PAIR,account);

  let ape_pair_addr = await ape_factory.getPair(barrowToken.address,otherToken.address);
  let ape_pair = new ethers.Contract(pan_pair_addr,V2PAIR,account);

  let bake_pair_addr = await bake_factory.getPair(barrowToken.address,otherToken.address);
  let bake_pair = new ethers.Contract(pan_pair_addr,V2PAIR,account);

  var token0 = await pan_pair.token0();
  var token1 = await pan_pair.token1();
  const Token0 = new ethers.Contract(token0,BEP20ABI,provider);
  const Token1 = new ethers.Contract(token1,BEP20ABI,provider);

  let Token0_symbol = await Token0.symbol();
  let Token1_symbol = await Token1.symbol();
  const pair_name = colors.brightBlue(Token0_symbol+"/"+Token1_symbol);

  console.log(`Token0 is: ${colors.brightBlue(Token0_symbol)}`);
  console.log(`Token1 is: ${colors.brightBlue(Token1_symbol)}`);
  console.log(`PancakeSwap ${pair_name} Pair Addess: ${colors.brightYellow(pan_pair_addr)}`);
  console.log(`BakerySwap ${pair_name} Pair Addess: ${colors.brightYellow(bake_pair_addr)}`);
  console.log(`ApeSwap ${pair_name} Pair Addess: ${colors.brightYellow(ape_pair_addr)}\n`);

  let fundToken = busd;
  let fundAmount = '1000000'
  let fundToken_whale = busd_whale_addr;
  let FundToken_symbol = await fundToken.symbol();
  

  //fund tokens to Contract using web3
  //!!!with web3 intract with unlocking accounts is easyer than ethers
  //====================================================
  let w3_FundToken = new web3.eth.Contract(BEP20ABI, fundToken.address);
  let FundAmount = utils.parseUnits(fundAmount,18);
  let balance = await fundToken.balanceOf(arbitrage.address);

  console.log(`\nFund token is: ${colors.brightBlue(FundToken_symbol)}`);
  console.log(`Arbitrage Contract ${colors.brightBlue(FundToken_symbol)} Balance is: ${colors.brightCyan(balance.toString())}`);
  console.log(`\nFund ${colors.brightBlue(FundToken_symbol)} amount is: ${colors.brightCyan(FundAmount.toString())}`);

  await w3_FundToken.methods.transfer(arbitrage.address,FundAmount.toString()).send({from:fundToken_whale});

  let fund_balance = await fundToken.balanceOf(arbitrage.address);
  console.log(`Arbitrage Contract ${colors.brightBlue(FundToken_symbol)} Balance is: ${colors.brightCyan(fund_balance.toString())}`);

  
  //calculate price
  //====================================================
  let reserves = await pan_pair.getReserves();
  console.log(`\nToken0 Reserves: ${colors.brightCyan(reserves._reserve0.toString())}`);
  console.log(`Token1 Reserves: ${colors.brightCyan(reserves._reserve1.toString())}`);

  let x = new Big(reserves._reserve0.toBigInt());
  let y = new Big(reserves._reserve1.toBigInt());
  
  let XtoY = x.div(y);
  let YtoX = y.div(x);
  console.log(`x/y: ${colors.brightCyan(XtoY.toNumber())}`);
  console.log(`y/x: ${colors.brightCyan(YtoX.toNumber())}`);

  let amountIn = utils.parseUnits(barrowAmount, 'ether');
  let amounts = await pan_router.getAmountsOut(amountIn, [barrowToken.address,otherToken.address]);
  let amountOutMin = amounts[1].div(100).mul(98);

  console.log(`AmountIn: ${colors.brightBlue(amountIn.toString())}`);
  console.log(`AmountOut: ${colors.brightBlue(amounts[1].toString())}`);
  console.log(`AmountOutMin: ${colors.brightBlue(amountOutMin.toString())}`);



  //Test flashswap
  //====================================================

  //set _data paramethers
  const r_path = [otherToken.address,barrowToken.address];
  const t_path = [barrowToken.address,otherToken.address];
  const t_router = ape_router_addr;

  const abi = utils.AbiCoder.prototype.encode(
    ['address[]','address[]','address'],
    [r_path,t_path,t_router]
  );

  //calculate gas for tx  
  let gasPrice = await provider.getGasPrice();
  console.log(`\n\nGasPrice is: ${colors.brightCyan(gasPrice.toString())}`);

  let gasLimit = await pan_pair.estimateGas.swap(amountIn,0,arbitrage.address,abi);
  console.log(`GasLimit is: ${colors.brightCyan(gasLimit.toString())}`);

  let gasFee = gasPrice * gasLimit;
  console.log(`Transaction Fee is: ${colors.brightCyan(gasFee.toString())}`);
  console.log(`Transaction Fee as ETH: ${colors.brightRed(ethers.utils.formatEther(gasFee).toString())}`);


  //sending tx...
  let old_balance = await account.getBalance();
  await provider.getBlock().then(async(result)=>{
    console.log(`\n\n\nLatest Block is: ${colors.brightYellow(result.number)} Before Transection!!!`); 
    console.log(`Account balance Before Tx: ${colors.brightRed(ethers.utils.formatEther(old_balance))}\n`);
  });

  console.log("sending transection...");
  const tx = await pan_pair.swap(amountIn,0,arbitrage_addr,abi,{
    gasPrice: gasPrice,
    gasLimit: gasLimit
  });

  const receipt = await tx.wait();
  console.log("Transection mined\n");

  let new_balance = await account.getBalance();
  console.log(`Account balance after Tx: ${colors.brightRed(ethers.utils.formatEther(new_balance))}`);
  console.log(`Old balance - New balance: ${colors.brightRed(ethers.utils.formatEther(old_balance.sub(new_balance)))}`);
  console.log(`\nEmitted events:`);
  console.log('===========================');
  //console.log(receipt);
  
} 

init()