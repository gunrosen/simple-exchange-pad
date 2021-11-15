# Basic Sample Hardhat Project
We create simple exchange smart contract.

Ideal come from https://medium.com/coinmonks/programming-defi-uniswap-part-1-839ebe796c7b

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:
###Deploy testnet Hardhat in local
```shell
npx hardhat node
npx hardhat run scripts/deploy-simple.js --network localhost
```

###Deploy testnet Ropsten
```shell
npx hardhat run scripts/deploy-simple.js --network ropsten
```
Address in testnet
```
tokenX deployed to: 0xa529B9c66999d40782310275d563EE6e9f9D0a46
tokenY deployed to: 0xC7f09aaD54B5343f4711B60F857194460574496C
SimpleExchange deployed to: 0x73db65e153B5B7bab714560975AAe9c2b25c5Fdf
owner address 0xc5Ad7f45b2b235A2a62014D07dDa0a4A33120480
user address 0x8246fEC2e2d7A840F231175d653564d065a9494B
```



