const CuttToken = artifacts.require("CuttToken");
const Cutties = artifacts.require("Cutties");
const BigNumber = require('bignumber.js');

contract("", async (accounts) => {
    const deployer = accounts[0];
    let instanceCuttToken;
    let instanceCutties;

    beforeEach(async () => {
        instanceCuttToken = await CuttToken.new({ from: deployer });
        instanceCutties = await Cutties.new({ from: deployer });
    });

    describe("CUTT token", () => {

        it("create pool", async () => {
            await instanceCuttToken.setLiquidityAddress(instanceCutties.address);
            await instanceCuttToken.setCuttiesAddress(instanceCutties.address);

            await instanceCuttToken.setTreasuryAddress(accounts[1]);
            await instanceCuttToken.setNFTStakingAddress(accounts[1]);
            await instanceCuttToken.setV3StakingAddress(accounts[1]);
            await instanceCuttToken.setSmartFarmingAddress(accounts[1]);

            await instanceCutties.setTokenAddress(instanceCuttToken.address);
            await instanceCutties.mintLiquidityAndCuttiesToken();

            await instanceCuttToken.mintTreasuryToken({ from: accounts[1] });
            await instanceCuttToken.mintNFTStakingToken({ from: accounts[1] });
            await instanceCuttToken.mintV3StakingToken({ from: accounts[1] });
            await instanceCuttToken.mintSmartFarmingToken({ from: accounts[1] });

            const balance = new BigNumber(await instanceCuttToken.balanceOf(instanceCuttToken.address));
            const balance0 = new BigNumber(await instanceCuttToken.balanceOf(instanceCutties.address));
            const balance1 = new BigNumber(await instanceCuttToken.balanceOf(accounts[1]));

            assert.equal(balance.toString(10), "0");
            assert.equal(balance0.toString(10), "300000000000000000000000");
            assert.equal(balance1.toString(10), "700000000000000000000000");

            await instanceCutties.deposit({ value: "300000000000000000000" });

            let ethBalance = new BigNumber(await web3.eth.getBalance(instanceCutties.address));
            assert.equal(ethBalance.toString(10), "300000000000000000000");

            const fee = 500; // 500, 3000, 10000
            const tickLower = -887270
            const tickUpper = 887270
            await instanceCutties.createPoolAndLiquidity(fee, tickLower, tickUpper);

            let cuttBalance = new BigNumber(await instanceCuttToken.balanceOf(instanceCutties.address));
            ethBalance = new BigNumber(await web3.eth.getBalance(instanceCutties.address));
            let allownceBalance = new BigNumber(await instanceCuttToken.allowance(instanceCutties.address, "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"));

            assert.equal(ethBalance.toString(10), "0");
            assert.equal(cuttBalance.toString(10), "100000000000000000000001");
            assert.equal(allownceBalance.toString(10), "1");

            await instanceCutties.burnExtraToken();
            cuttBalance = new BigNumber(await instanceCuttToken.balanceOf(instanceCutties.address));
            assert.equal(cuttBalance.toString(10), "0");

            await instanceCuttToken.transfer(instanceCuttToken.address, "600000000000000000000", {
                from: accounts[1]
            });

            cuttBalance = new BigNumber(await instanceCuttToken.balanceOf(instanceCuttToken.address));
            assert.equal(cuttBalance.toString(10), "600000000000000000000");

            await instanceCuttToken.transfer(accounts[3], "1", {
                from: accounts[1]
            });

            cuttBalance = new BigNumber(await instanceCuttToken.balanceOf(instanceCuttToken.address));
            assert.equal(cuttBalance.toString(10), "100000000000000000011");
        });

        it("mint NFT and create pool", async () => {
            await instanceCuttToken.setLiquidityAddress(instanceCutties.address);
            await instanceCuttToken.setCuttiesAddress(instanceCutties.address);

            await instanceCuttToken.setTreasuryAddress(accounts[1]);
            await instanceCuttToken.setNFTStakingAddress(accounts[1]);
            await instanceCuttToken.setV3StakingAddress(accounts[1]);
            await instanceCuttToken.setSmartFarmingAddress(accounts[1]);

            await instanceCutties.setTokenAddress(instanceCuttToken.address);
            await instanceCutties.mintLiquidityAndCuttiesToken();

            await instanceCuttToken.mintTreasuryToken({ from: accounts[1] });
            await instanceCuttToken.mintNFTStakingToken({ from: accounts[1] });
            await instanceCuttToken.mintV3StakingToken({ from: accounts[1] });
            await instanceCuttToken.mintSmartFarmingToken({ from: accounts[1] });

            const balance = new BigNumber(await instanceCuttToken.balanceOf(instanceCuttToken.address));
            const balance0 = new BigNumber(await instanceCuttToken.balanceOf(instanceCutties.address));
            const balance1 = new BigNumber(await instanceCuttToken.balanceOf(accounts[1]));

            assert.equal(balance.toString(10), "0");
            assert.equal(balance0.toString(10), "300000000000000000000000");
            assert.equal(balance1.toString(10), "700000000000000000000000");

            await instanceCutties.startSale();

            const price = new BigNumber(await instanceCutties.getCuttiesPrice());
            const amount = new BigNumber(await instanceCutties.getMintableCount());
            const ethValue = price.times(amount);

            for (let i = 0; i < 10; i++) {
                await instanceCutties.mintCutties(accounts[2], amount, { from: accounts[2], value: ethValue });
            }
            const balance2 = new BigNumber(await instanceCuttToken.balanceOf(accounts[2]));
            assert.equal(balance2.toString(10), "198452073824000000000");

            let ethBalance = new BigNumber(await web3.eth.getBalance(instanceCutties.address));
            assert.equal(ethBalance.toString(10), "4000000000000000000");

            await instanceCutties.pauseSale();

            const fee = 500; // 500, 3000, 10000
            const tickLower = -887270; // -887270, -887220, -887200
            const tickUpper = 887270; //   887270,  887220,  887200
            await instanceCutties.createPoolAndLiquidity(fee, tickLower, tickUpper);

            let cuttBalance = new BigNumber(await instanceCuttToken.balanceOf(instanceCutties.address));
            ethBalance = new BigNumber(await web3.eth.getBalance(instanceCutties.address));
            let allownceBalance = new BigNumber(await instanceCuttToken.allowance(instanceCutties.address, "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"));

            assert.equal(cuttBalance.toString(10), "99801547927032804516478");
            assert.equal(ethBalance.toString(10), "0");
            assert.equal(allownceBalance.toString(10), "856804516478");

            await instanceCutties.burnExtraToken();
            cuttBalance = new BigNumber(await instanceCuttToken.balanceOf(instanceCutties.address));
            assert.equal(cuttBalance.toString(10), "0");

            await instanceCuttToken.transfer(instanceCuttToken.address, "300000000000000000000", {
                from: accounts[1]
            });

            await instanceCuttToken.transfer(instanceCuttToken.address, "300000000000000000000", {
                from: accounts[1]
            });

            cuttBalance = new BigNumber(await instanceCuttToken.balanceOf(instanceCuttToken.address));
            assert.equal(cuttBalance.toString(10), "600000000000000000000");

            await instanceCuttToken.transfer(accounts[3], "1", {
                from: accounts[1]
            });

            cuttBalance = new BigNumber(await instanceCuttToken.balanceOf(instanceCuttToken.address));
            assert.equal(cuttBalance.toString(10), "100000000000000000155");
        });
    });
});