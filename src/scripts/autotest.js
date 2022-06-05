const cmd = require("node-cmd");

cmd.runSync('npm run clear');
cmd.runSync('npx hardhat compile');
cmd.runSync('npm run fund');
cmd.runSync('npm run deploy');

cmd.run('npm run test',(err,data,stderr)=>{
    console.log(`Flashswap test: `,data);
});