//import node modules
const { ethers} = require("ethers");
const fs = require('fs');
const colors = require('colors/safe');
require('dotenv').config();

//import .env variables
const project_folder = process.env.project_folder;
const privateKey = process.env.account_privateKey;
const url = process.env.testnet_url;

//const vars
const abi = require(project_folder+"src/blockchain/artifacts/src/blockchain/contracts/FlashloanArbitrage.sol/FlashloanArbitrage.json").abi;
const bytecode = require(project_folder+"src/blockchain/artifacts/src/blockchain/contracts/FlashloanArbitrage.sol/FlashloanArbitrage.json").bytecode;
const contractFile = project_folder+"repository/contract.json";

//global vars
let provider,deployer;
let contract;
let contract_info;



// **** FUNTIONS ****
//==========================


//provider funtions
async function setEthers(url,privateKey){
  provider = new ethers.providers.JsonRpcProvider(url);
  deployer = new ethers.Wallet(privateKey,provider);
};


//json writer
async function WriteJson(file,text) {
  let data = JSON.stringify(text);
  fs.writeFileSync(file,data);
};


//update contract info
async function _updateContractInfo(contract_address,deployment_fee,_deployer) {
  contract_info = {
    "contract_address":contract_address,
    "deployment_fee":deployment_fee,
    "deployer":_deployer
  }
};

async function updateContractInfo(contract_address,deployment_fee,_deployer,file) {
  await _updateContractInfo(contract_address,deployment_fee,_deployer);
  await WriteJson(file,contract_info);
};


//deploy contract
async function _deployContract(factory,gasPrice,gasLimit) {
  console.log("\ndeploying contract...");
  let Contract = await factory.deploy({
    gasPrice: gasPrice,
    gasLimit: 6721975
  });
  let contract = await Contract.deployed();
  
  return contract;
};

async function checkDeploymentFee(deployment_fee,expected_fee) {
  if (deployment_fee.eq(expected_fee)) {
    console.log(`\nExpected Gas Fee ${colors.brightGreen(equal)} to Deployment Fee`);
    console.log(`Deployment Fee is: ${colors.brightYellow(deployment_fee.toString())}`);
    console.log(`Expected fee is:   ${colors.brightYellow(expected_fee)}\n`);
  }
  else{
    console.log(`\nExpected Gas Fee ${colors.brightRed("not equal")} to Deployment Fee`);
    console.log(`Deployment Fee is: ${colors.brightYellow(deployment_fee.toString())}`);
    console.log(`Expected fee is:   ${colors.brightYellow(expected_fee)}\n`);
  }
};

async function deployContract(abi,bytecode,_deployer) {
  let factory = new ethers.ContractFactory(abi,bytecode,_deployer);
  let gasPrice = await provider.getGasPrice();
  let gasLimit = await provider.estimateGas(factory.getDeployTransaction().data);
  let gasFee = gasPrice * gasLimit;

  let old_balance = await _deployer.getBalance()
  contract = await _deployContract(factory,gasPrice,gasLimit);
  let new_balance = await _deployer.getBalance()

  let deployment_fee = old_balance.sub(new_balance);

  await checkDeploymentFee(deployment_fee,gasFee)
  await updateContractInfo(contract.address,deployment_fee.toString(),_deployer.address,contractFile); 
};



//**** RUNING CODE ****
//==========================
async function run() {

  console.log(`Current provider is: ${colors.brightYellow(deployer.provider.connection.url)} \n`); 
  console.log(`Deploying contracts with the account: ${colors.brightBlue(deployer.address)}`);
  console.log(`Account balance: ${colors.brightCyan(ethers.utils.formatEther(await deployer.getBalance()))} \n`);

  await deployContract(abi,bytecode,deployer);

  console.log(contract_info);
}

setEthers(url,privateKey);
run();