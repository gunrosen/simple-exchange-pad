const hre = require("hardhat");
const {ethers} = require("ethers");
const EXCHANGE = require("../artifacts/contracts/Exchange.sol/Exchange.json")

const toWei = (value) => ethers.utils.parseEther(value.toString());

const fromWei = (value) =>
    ethers.utils.formatEther(
        typeof value === "string" ? value : value.toString()
    );

async function createTestGreetingContract(){
    const Greeting = await hre.ethers.getContractFactory("Greeting");
    const greeting = await Greeting.deploy("First contract deployment!");
    await greeting.deployed();
    console.log("Contract Greeting deployed to: ", greeting.address);
}

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

    //Testing with greeting contract
    // await createTestGreetingContract();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
