# Pancakeswap - FlashloanArbitrage

$~$

Learn how to trigger Pancakeswaps **<mark>{Flashswap}</mark>** feature. Calculate repayment amount. And execute a arbitrage trading using coin you barrow. Than pay it back

$~$

## Dependencies

- Node.js ``` v14.19.0```

- Npm ```6.14.16``` 

- A crypto wallet like metamask
  
  $~$
 

## How to install the project

1) $~$ clone the project
   
   ```
   git clone https://github.com/BaranKoc/Pancakeswap-FlashloanArbitrage
   ```

2) $~$ install packages
   
   ```
   npm i
   ```

$~$

## HOW TO RUN THE PROJECT

1) $~$ fill out .env file
   
   ```
   project_folder = "PROJECT FOLDER PATH"
   account_privateKey = "YOUR WALLET PRIVATE KEY" 
   
   forking_url = "https://bsc-dataseed.binance.org"
   testnet_url = "http://127.0.0.1:7545"
   mainnet_url = "" 
   
   usdc_whale =  "0xF977814e90dA44bFA03b6295A0616a897441aceC"
   dai_whale =  "0xF977814e90dA44bFA03b6295A0616a897441aceC"
   bnb_whale = "0xF977814e90dA44bFA03b6295A0616a897441aceC"
   busd_whale =  "0xF977814e90dA44bFA03b6295A0616a897441aceC"
   ```

2) $~$ run local ganache-cli fork
   
   ```
   ganache-cli \
   --fork https://bsc-dataseed.binance.org \
   --unlock 0xF977814e90dA44bFA03b6295A0616a897441aceC \
   --p 7545
   ```

3) $~$ compile contracts
   
   ```
   npx hardhat compile
   ```

4) $~$ send BNB to wallet //we will use our normal crypto wallet 
   
   ```
   npm run fund
   ```

5) $~$ deploy contract
   
   ```
   npm run deploy
   ```

6) $~$ test contract
   
   ```
   npm run test
   ```
- or  ```npm run auto_test``` $~$ instead of steps 3-4-5-6
