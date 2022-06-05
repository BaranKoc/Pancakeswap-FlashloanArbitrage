//Import node modules
const { ethers} = require("ethers");
const {utils} = ethers;
const Web3 = require('web3'); 
const BigNumber = require("bignumber.js");

//import .env variables
require('dotenv').config();
const project_folder = process.env.project_folder;
const privateKey = process.env.account_privateKey;
const url = process.env.testnet_url;

//import json files
const BEP20ABI = require(project_folder+"repository/abis/erc20.json");
const DAI = require(project_folder+"repository/tokens.json").dai;

//const vars
const usdc_whale_addr = process.env.usdc_whale;
const dai_whale_addr =  process.env.dai_whale;
const bnb_whale_addr = process.env.bnb_whale;
const busd_whale_addr = process.env.busd_whale;

//global vars
let provider, wallet, bnb_whale;
let web3;



// **** FUNTIONS ****
//====================================

//provider funtions
async function setEthers(url,privateKey,unlocked1){
    provider = new ethers.providers.JsonRpcProvider(url);
    wallet = new ethers.Wallet(privateKey,provider);
    bnb_whale = provider.getSigner(unlocked1);
  };

async function setWeb3(url) {
    web3 = new Web3(url);
  };

//fund network token
async function fundBNB(_amount,_to) {
    let amount = utils.parseUnits(_amount,'ether');
    let tx = await bnb_whale.sendTransaction({
        to: _to,
        value: amount
    });
    await tx.wait();
};

//fund BEP20 token
async function fundBEP20(address,_amount,from,to) {
    let bep20 = new web3.eth.Contract(BEP20ABI, address);
    let amount = web3.utils.toWei(_amount,'ether');
    await bep20.methods.transfer(to,amount).send({from:from});
}

//****  RUNING CODE ****
//=========================

async function run(){
    await fundBNB("10",wallet.address);
    await fundBEP20(DAI,"1000000",dai_whale_addr,wallet.address);
}

setEthers(url,privateKey,bnb_whale_addr);
setWeb3(url);
run();