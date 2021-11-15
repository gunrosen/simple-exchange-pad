require('dotenv').config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
const {utils} = require("ethers");
const {API_URL, PRIVATE_KEY, PRIVATE_KEY_USER_2} = process.env;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    paths: {
        artifacts: '../../frontend/src/artifacts',
    },
    defaultNetwork: "ropsten",
    networks: {
        hardhat: {
            chainId: 1337,
            accounts: {
                accountsBalance: utils.parseEther("10").toString(),
            },
            gasPrice: 1000,
            initialBaseFeePerGas: 0
        },
        ropsten: {
            url: API_URL,
            accounts: [`0x${PRIVATE_KEY}`, `0x${PRIVATE_KEY_USER_2}`]
        }
    },
    solidity: "0.8.4",
};
