const CuttToken = artifacts.require("CuttToken");
const V3Staking = artifacts.require("V3Staking");
const Cutties = artifacts.require("Cutties");
const NonfungiblePositionManager = artifacts.require("NonfungiblePositionManager");
const NonfungiblePositionManagerABI = require('./abis/NonfungiblePositionManagerABI.json');
const BigNumber = require('bignumber.js');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const NonfungiblePositionManagerAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

contract("", async (accounts) => {
    const deployer = accounts[0];
    let instanceCuttToken;
    let instanceV3Staking;
    let instanceCutties;
    let instanceNonfungiblePositionManager;

    let NFT1;
    let NFT2;

    before(async () => {
        instanceCuttToken = await CuttToken.new({ from: deployer });
        instanceV3Staking = await V3Staking.new({ from: deployer });
        instanceCutties = await Cutties.new({ from: deployer });
        instanceNonfungiblePositionManager = await NonfungiblePositionManager.at(NonfungiblePositionManagerABI.address);
    });

    describe("V3 Staking", () => {
        it("mint token", async () => {
            await instanceCuttToken.setV3StakingAddress(instanceV3Staking.address);

            await instanceCuttToken.setLiquidityAddress(accounts[1]);
            await instanceCuttToken.setCuttiesAddress(accounts[1]);
            await instanceCuttToken.setTreasuryAddress(accounts[1]);
            await instanceCuttToken.setNFTStakingAddress(accounts[1]);
            await instanceCuttToken.setSmartFarmingAddress(accounts[1]);

            await instanceV3Staking.setTokenAddress(instanceCuttToken.address);
            await instanceV3Staking.mintV3StakingToken();

            await instanceCuttToken.mintTreasuryToken({ from: accounts[1] });
            await instanceCuttToken.mintLiquidityToken({ from: accounts[1] });
            await instanceCuttToken.mintCuttiesToken({ from: accounts[1] });
            await instanceCuttToken.mintNFTStakingToken({ from: accounts[1] });
            await instanceCuttToken.mintSmartFarmingToken({ from: accounts[1] });

            const balance = new BigNumber(await instanceCuttToken.balanceOf(instanceCuttToken.address));
            const balance0 = new BigNumber(await instanceCuttToken.balanceOf(instanceV3Staking.address));
            const balance1 = new BigNumber(await instanceCuttToken.balanceOf(accounts[1]));

            assert.equal(balance.toString(10), "0");
            assert.equal(balance0.toString(10), "250000000000000000000000");
            assert.equal(balance1.toString(10), "750000000000000000000000");
        });

        it("mint v3 NFT", async () => {
            await instanceCutties.setTokenAddress(instanceCuttToken.address);
            await instanceCuttToken.setLiquidityAddress(instanceCutties.address);

            await instanceCuttToken.transfer(instanceCutties.address, "200000000000000000000000", { from: accounts[1] });
            await instanceCutties.deposit({ value: "300000000000000000000" });
            const fee = 500; // 500, 3000, 10000
            const tickLower = -887270
            const tickUpper = 887270
            await instanceCutties.createPoolAndLiquidity(fee, tickLower, tickUpper);

            let cuttBalance = new BigNumber(await instanceCuttToken.balanceOf(instanceCutties.address));
            let ethBalance = new BigNumber(await web3.eth.getBalance(instanceCutties.address));
            assert.equal(ethBalance.toString(10), "0");
            assert.equal(cuttBalance.toString(10), "1");
            await instanceCutties.burnExtraToken();

            NFT1 = await instanceNonfungiblePositionManager.tokenOfOwnerByIndex(instanceCutties.address, 0);
            await instanceCutties.setTreasuryAddress(accounts[2]);
            await instanceCutties.withdrawNFT(NFT1, { from: accounts[2] });

            await instanceCuttToken.transfer(instanceCutties.address, "100000000000000000000000", { from: accounts[1] });
            await instanceCutties.deposit({ value: "150000000000000000000" });
            await instanceCutties.createPoolAndLiquidity(fee, tickLower, tickUpper);

            cuttBalance = new BigNumber(await instanceCuttToken.balanceOf(instanceCutties.address));
            ethBalance = new BigNumber(await web3.eth.getBalance(instanceCutties.address));
            assert.equal(ethBalance.toString(10), "0");
            assert.equal(cuttBalance.toString(10), "1");
            await instanceCutties.burnExtraToken();

            NFT2 = await instanceNonfungiblePositionManager.tokenOfOwnerByIndex(instanceCutties.address, 0);
            await instanceCutties.setTreasuryAddress(accounts[3], { from: accounts[2] });
            await instanceCutties.withdrawNFT(NFT2, { from: accounts[3] });
        });

        it("staking v3 NFT", async () => {
            const position1 = await instanceNonfungiblePositionManager.positions(NFT1);
            assert.equal(position1.liquidity.toString(), "7745966692123397144574");
            const position2 = await instanceNonfungiblePositionManager.positions(NFT2);
            assert.equal(position2.liquidity.toString(), "3872983346061698572287");

            await instanceNonfungiblePositionManager.approve(instanceV3Staking.address, NFT1, { from: accounts[2] });
            await instanceNonfungiblePositionManager.approve(instanceV3Staking.address, NFT2, { from: accounts[3] });

            await instanceV3Staking.setMultipliers([
                100, 104, 108, 112, 115, 119, 122, 125, 128, 131,
                134, 136, 139, 142, 144, 147, 149, 152, 154, 157,
                159, 161, 164, 166, 168, 170, 173, 175, 177, 179,
                181, 183, 185, 187, 189, 191, 193, 195, 197, 199,
                201, 203, 205, 207, 209, 211, 213, 214, 216, 218,
                220, 222, 223, 225, 227, 229, 230, 232, 234, 236,
                237, 239, 241, 242, 244, 246, 247, 249, 251, 252,
                254, 255, 257, 259, 260, 262, 263, 265, 267, 268,
                270, 271, 273, 274, 276, 277, 279, 280, 282, 283,
                285, 286, 288, 289, 291, 292, 294, 295, 297, 298
            ]);
            await instanceV3Staking.stake(NFT1, 103, { from: accounts[2] });
            await instanceV3Staking.stake(NFT2, 4, { from: accounts[3] });


            function timeout(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            await timeout(20000);
            await instanceCutties.deposit({ value: "1" });

            const reward1 = await instanceV3Staking.getReward(accounts[2]);
            const reward2 = await instanceV3Staking.getReward(accounts[3]);
            expect(reward1.pending.div(reward2.pending).gt(6)).to.equal(true);
        });

        it("unStake v3 NFT", async () => {
            await instanceV3Staking.withdraw(0, { from: accounts[2] });
            await instanceV3Staking.withdraw(0, { from: accounts[3] });

            const owner1 = await instanceNonfungiblePositionManager.ownerOf(NFT1);
            const owner2 = await instanceNonfungiblePositionManager.ownerOf(NFT2);
            assert.equal(owner1, accounts[2]);
            assert.equal(owner2, accounts[3]);

            const balance1 = new BigNumber(await instanceCuttToken.balanceOf(accounts[2]));
            const balance2 = new BigNumber(await instanceCuttToken.balanceOf(accounts[3]));
            expect(balance1.gt(150000000000000)).to.equal(true);
            expect(balance2.gt(60000000000000)).to.equal(true);
        });
    });
});