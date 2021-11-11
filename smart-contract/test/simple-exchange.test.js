require("@nomiclabs/hardhat-waffle");
const {expect} = require("chai");
const { ethers } = require("hardhat");

const toWei = (value) => ethers.utils.parseEther(value.toString());

const fromWei = (value) =>
    ethers.utils.formatEther(
        typeof value === "string" ? value : value.toString()
    );

const getBalance = ethers.provider.getBalance;

describe("Simple Exchange", () => {
    let owner;
    let user;
    let simpleExchange;
    let token;

    beforeEach(async () => {
        // owner is set as accounts[0]
        // user is set as accounts[1]
        [owner, user] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Token", "TKN", toWei(1000));
        await token.deployed();

        const SimpleExchange = await ethers.getContractFactory("SimpleExchange");
        simpleExchange = await SimpleExchange.deploy();
        await simpleExchange.deployed();

        // Send Ethers to DEX contract
        await simpleExchange.receiveEth({ value: toWei(100) });
    });

    it("is deployed", async () => {
        expect(await simpleExchange.deployed()).to.equal(simpleExchange);
        expect(await token.deployed()).to.equal(token);
        expect(await token.name()).to.equal("Token");
        expect(await token.symbol()).to.equal("TKN");
        expect(await token.totalSupply()).to.equal(toWei(1000));
        expect(await token.balanceOf(owner.address)).to.equal(toWei(1000));
    });

    describe("upsertTokenRate", async () => {
        let tokenRate;
        beforeEach(async () => {
            await simpleExchange.upsertTokenRate(token.address, 1, 2); // 0.01
            tokenRate = await simpleExchange.getTokenRate(token.address);
        })
        it("create new rate", async () => {
            expect(tokenRate.value).to.equal(1);
            expect(tokenRate.decimal).to.equal(2);
        })

        it("Update old one", async () => {
            await simpleExchange.upsertTokenRate(token.address, 12, 10);
            tokenRate = await simpleExchange.getTokenRate(token.address);
            expect(tokenRate.value).to.equal(12);
            expect(tokenRate.decimal).to.equal(10);
        })

        describe("set up simple DEX", async () => {
            beforeEach(async () => {
                await simpleExchange.upsertTokenRate(token.address, 25, 5);
                await token.transfer(user.address, toWei(400));
                await token.transfer(simpleExchange.address, toWei(400));
            })

            it("set up OK", async () => {
                expect(await token.balanceOf(owner.address)).to.equal(toWei(200));
                expect(await token.balanceOf(simpleExchange.address)).to.equal(toWei(400))
                expect(await token.balanceOf(user.address)).to.equal(toWei(400));
            })

            describe("user exchange token to ETH", async () => {
                it("10 tokens will equal 0.0025 ETH", async ()=>{
                    await token.connect(user).approve(simpleExchange.address, toWei(10));
                    await simpleExchange.connect(user).tokenToETH(token.address, toWei(10));
                    expect(await token.balanceOf(owner.address)).to.equal(toWei(200));
                    expect(await token.balanceOf(simpleExchange.address)).to.equal(toWei(410));
                    expect(await token.balanceOf(user.address)).to.equal(toWei(390));

                    expect(await getBalance(simpleExchange.address)).to.equal(toWei(100 - 0.0025))
                })
            })

            describe("user exchange ETH to token", async () => {
                it("0.012 ETH will equal 48 token", async ()=> {
                    await simpleExchange.connect(user).ethToToken(token.address , {value: toWei(0.012)});

                    expect(await token.balanceOf(owner.address)).to.equal(toWei(200));
                    expect(await token.balanceOf(simpleExchange.address)).to.equal(toWei(400 - 48));
                    expect(await token.balanceOf(user.address)).to.equal(toWei(400 + 48));

                    expect(await getBalance(simpleExchange.address)).to.equal(toWei(100 + 0.012));
                })
            })
        });

    });


});