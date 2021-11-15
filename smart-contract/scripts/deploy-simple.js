const hre = require("hardhat");
const {ethers} = require("ethers");

const toWei = (value) => ethers.utils.parseEther(value.toString());

const fromWei = (value) =>
    ethers.utils.formatEther(
        typeof value === "string" ? value : value.toString()
    );

async function main() {
    const TokenX = await hre.ethers.getContractFactory("Token");
    let tokenX = await TokenX.deploy("Token-X", "TXX",toWei(1000));
    await tokenX.deployed();
    console.log("tokenX deployed to:", tokenX.address);

    const TokenY = await hre.ethers.getContractFactory("Token");
    let tokenY = await TokenY.deploy("Token-Y", "TYY", toWei(1000));
    await tokenY.deployed();
    console.log("tokenY deployed to:", tokenY.address);

    const SimpleExchange = await hre.ethers.getContractFactory("SimpleExchange");
    const simpleExchange = await SimpleExchange.deploy();
    await simpleExchange.deployed();
    console.log("SimpleExchange deployed to:", simpleExchange.address);

    // Init exchanges rate
    await simpleExchange.upsertTokenRate(tokenX.address, 2,2);
    await simpleExchange.upsertTokenRate(tokenY.address, 3,1);

    // Init balance for user
    const [owner, user] = await  hre.ethers.getSigners();
    console.log("owner address", owner.address);
    console.log("user address", user.address);

    await simpleExchange.receiveEth({ value: toWei(2) });
    await tokenX.connect(owner).transfer(user.address, toWei(400));
    await tokenX.connect(owner).transfer(simpleExchange.address, toWei(400));

    await tokenY.connect(owner).transfer(user.address, toWei(600));
    await tokenY.connect(owner).transfer(simpleExchange.address, toWei(200));

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
