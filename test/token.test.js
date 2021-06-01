const CuttToken = artifacts.require("CuttToken");
const Cutties = artifacts.require("Cutties");
const BigNumber = require('bignumber.js');

contract("", async (accounts) => {
    const deployer = accounts[0];
    let instanceCuttToken;
    let instanceCutties;

    before(async () => {
        instanceCuttToken = await CuttToken.new({ from: deployer });
        instanceCutties = await Cutties.new({ from: deployer });
    });

    describe("CUTT token", () => {

        it("mint token", async () => {
            await instanceCuttToken.setLiquidityAddress(accounts[1]);
            await instanceCuttToken.setCuttiesAddress(accounts[1]);
            await instanceCuttToken.setTreasuryAddress(accounts[1]);
            await instanceCuttToken.setNFTStakingAddress(accounts[1]);
            await instanceCuttToken.setV3StakingAddress(accounts[1]);
            await instanceCuttToken.setSmartFarmingAddress(accounts[1]);

            await instanceCuttToken.mintLiquidityToken({ from: accounts[1] });
            await instanceCuttToken.mintCuttiesToken({ from: accounts[1] });
            await instanceCuttToken.mintTreasuryToken({ from: accounts[1] });
            await instanceCuttToken.mintNFTStakingToken({ from: accounts[1] });
            await instanceCuttToken.mintV3StakingToken({ from: accounts[1] });
            await instanceCuttToken.mintSmartFarmingToken({ from: accounts[1] });

            let totalSupply = new BigNumber(await instanceCuttToken.totalSupply());
            let balance0 = new BigNumber(await instanceCuttToken.balanceOf(instanceCuttToken.address));
            let balance1 = new BigNumber(await instanceCuttToken.balanceOf(accounts[1]));
            assert.equal(totalSupply.toString(10), "1000000000000000000000000");
            assert.equal(balance0.toString(10), "0");
            assert.equal(balance1.toString(10), "1000000000000000000000000");

            await instanceCuttToken.transfer(accounts[2], "500000000000000000000000", { from: accounts[1] });

            balance1 = new BigNumber(await instanceCuttToken.balanceOf(accounts[1]));
            balance2 = new BigNumber(await instanceCuttToken.balanceOf(accounts[2]));
            assert.equal(balance1.toString(10), "500000000000000000000000");
            assert.equal(balance2.toString(10), "500000000000000000000000");

            await instanceCuttToken.burn("200000000000000000000000", { from: accounts[1] });
            totalSupply = new BigNumber(await instanceCuttToken.totalSupply());
            balance1 = new BigNumber(await instanceCuttToken.balanceOf(accounts[1]));
            assert.equal(totalSupply.toString(10), "800000000000000000000000");
            assert.equal(balance1.toString(10), "300000000000000000000000");

            await instanceCuttToken.burn("200000000000000000000000", { from: accounts[2] });
            totalSupply = new BigNumber(await instanceCuttToken.totalSupply());
            balance2 = new BigNumber(await instanceCuttToken.balanceOf(accounts[2]));
            assert.equal(totalSupply.toString(10), "600000000000000000000000");
            assert.equal(balance2.toString(10), "300000000000000000000000");
        });
    });
});