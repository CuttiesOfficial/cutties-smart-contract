const CuttToken = artifacts.require("CuttToken");
const Cutties = artifacts.require("Cutties");
const BigNumber = require('bignumber.js');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

contract("", async (accounts) => {
    const deployer = accounts[0];
    let instance1;
    let instance2;

    beforeEach(async () => {
        instance1 = await CuttToken.new({ from: deployer });
        instance2 = await Cutties.new({ from: deployer });
    });

    describe("CUTT token", () => {
        it("mint cutt token", async () => {
            await instance1.setLiquidityAddress(instance2.address);
            await instance1.setCuttiesAddress(instance2.address);

            await instance1.setTreasuryAddress(accounts[1]);
            await instance1.setNFTStakingAddress(accounts[1]);
            await instance1.setV3StakingAddress(accounts[1]);
            await instance1.setFarmingtakingAddress(accounts[1]);

            await instance2.setTokenAddress(instance1.address);
            await instance2.mintLiquidityAndCuttiesToken();

            await instance1.mintTreasuryToken({ from: accounts[1] });
            await instance1.mintNFTStakingToken({ from: accounts[1] });
            await instance1.mintV3StakingToken({ from: accounts[1] });
            await instance1.mintFarmingToken({ from: accounts[1] });

            const balance = new BigNumber(await instance1.balanceOf(instance1.address));
            const balance0 = new BigNumber(await instance1.balanceOf(instance2.address));
            const balance1 = new BigNumber(await instance1.balanceOf(accounts[1]));

            assert.equal(balance.toString(10), "0");
            assert.equal(balance0.toString(10), "350000000000000000000000");
            assert.equal(balance1.toString(10), "650000000000000000000000");

            await instance2.startSale();

            const price = new BigNumber(await instance2.getCuttiesPrice());
            const amount = new BigNumber(await instance2.getMintableCount());
            const ethValue = price.times(amount);

            for (let i = 0; i < 10; i++) {
                await instance2.mintCutties(accounts[2], amount, { from: accounts[2], value: ethValue });
            }
            const balance2 = new BigNumber(await instance1.balanceOf(accounts[2]));
            assert.equal(balance2.toString(10), "198452073824000000000");

            let ethBalance = new BigNumber(await web3.eth.getBalance(instance2.address));
            assert.equal(ethBalance.toString(10), "4000000000000000000");

            await instance2.pauseSale();

            const fee = 500; // 500, 3000, 10000
            const tickLower = -887270; // -887270, -887220, -887200
            const tickUpper = 887270; //   887270,  887220,  887200
            await instance2.createPoolAndLiquidity(fee, tickLower, tickUpper);

            let cuttBalance = new BigNumber(await instance1.balanceOf(instance2.address));
            ethBalance = new BigNumber(await web3.eth.getBalance(instance2.address));
            let allownceBalance = new BigNumber(await instance1.allowance(instance2.address, "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"));

            assert.equal(cuttBalance.toString(10), "99801547926176000000054");
            assert.equal(ethBalance.toString(10), "0");
            assert.equal(allownceBalance.toString(10), "54");

            await instance2.burnExtraToken();
            cuttBalance = new BigNumber(await instance1.balanceOf(instance2.address));
            assert.equal(cuttBalance.toString(10), "0");

            await instance1.transfer(instance1.address, "300000000000000000000", {
                from: accounts[1]
            });

            await instance1.transfer(instance1.address, "300000000000000000000", {
                from: accounts[1]
            });

            cuttBalance = new BigNumber(await instance1.balanceOf(instance1.address));
            assert.equal(cuttBalance.toString(10), "600000000000000000000");

            await instance1.transfer(accounts[3], "1", {
                from: accounts[1]
            });

            cuttBalance = new BigNumber(await instance1.balanceOf(instance1.address));
            assert.equal(cuttBalance.toString(10), "100000000000000000029");
        });

        it("create liquidity", async () => {
        });
    });
});