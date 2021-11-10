const hre = require("hardhat");

async function main() {
    const TokenX = await hre.ethers.getContractFactory("Token");
    let tokenX = await TokenX.deploy("Token-X", "TXX", (10 ** 18).toString());
    await tokenX.deployed();
    console.log("tokenX deployed to:", tokenX.address);

    const TokenY = await hre.ethers.getContractFactory("Token");
    let tokenY = await TokenY.deploy("Token-Y", "TYY", (10 ** 18).toString());
    await tokenY.deployed();
    console.log("tokenY deployed to:", tokenY.address);

    const Factory = await hre.ethers.getContractFactory("Factory");
    const factory = await Factory.deploy();
    await factory.deployed();
    console.log("Factory deployed to:", factory.address);

    const createExchangeXTx = await factory.createExchange(tokenX.address);
    await createExchangeXTx.wait();     // wait until the transaction is mined
    const addressExchangeTokenX = await factory.getExchange(tokenX.address);
    console.log("Exchange X deployed to:", addressExchangeTokenX);

    const createExchangeYTx = await factory.createExchange(tokenY.address);
    await createExchangeYTx.wait();     // wait until the transaction is mined
    const addressExchangeTokenY = await factory.getExchange(tokenY.address);
    console.log("Exchange Y deployed to:", addressExchangeTokenY);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
