const CuttToken = artifacts.require("CuttToken");
const NFTStaking = artifacts.require("NFTStaking");
const Cutties = artifacts.require("Cutties");
const BigNumber = require('bignumber.js');

contract("", async (accounts) => {
    const deployer = accounts[0];
    let instanceCuttToken;
    let instanceNFTStaking;
    let instanceCutties;

    let NFT1;
    let NFT2;
    let NFT3;

    before(async () => {
        instanceCuttToken = await CuttToken.new({ from: deployer });
        instanceNFTStaking = await NFTStaking.new({ from: deployer });
        instanceCutties = await Cutties.new({ from: deployer });
    });

    describe("NFT Staking", () => {
        it("mint token", async () => {
            await instanceCuttToken.setNFTStakingAddress(instanceNFTStaking.address);
            await instanceCuttToken.setCuttiesAddress(instanceCutties.address);
            await instanceCuttToken.setLiquidityAddress(instanceCutties.address);

            await instanceCuttToken.setTreasuryAddress(accounts[1]);
            await instanceCuttToken.setSmartFarmingAddress(accounts[1]);
            await instanceCuttToken.setV3StakingAddress(accounts[1]);

            await instanceNFTStaking.setTokenAddress(instanceCuttToken.address);
            await instanceNFTStaking.mintNFTStakingToken();
            await instanceCutties.setTokenAddress(instanceCuttToken.address);
            await instanceCutties.mintLiquidityAndCuttiesToken();

            await instanceCuttToken.mintTreasuryToken({ from: accounts[1] });
            await instanceCuttToken.mintV3StakingToken({ from: accounts[1] });
            await instanceCuttToken.mintSmartFarmingToken({ from: accounts[1] });

            const balance = new BigNumber(await instanceCuttToken.balanceOf(instanceCuttToken.address));
            const balance0 = new BigNumber(await instanceCuttToken.balanceOf(instanceNFTStaking.address));
            const balance1 = new BigNumber(await instanceCuttToken.balanceOf(instanceCutties.address));
            const balance2 = new BigNumber(await instanceCuttToken.balanceOf(accounts[1]));

            assert.equal(balance.toString(10), "0");
            assert.equal(balance0.toString(10), "150000000000000000000000");
            assert.equal(balance1.toString(10), "300000000000000000000000");
            assert.equal(balance2.toString(10), "550000000000000000000000");
        });

        it("mint NFT", async () => {
            const price = new BigNumber(await instanceCutties.getCuttiesPrice());
            const amount = new BigNumber(await instanceCutties.getMintableCount());
            const ethValue = price.times(amount);

            await instanceCutties.startSale();

            await instanceCutties.mintCutties(accounts[2], amount, { from: accounts[2], value: ethValue });
            NFT1 = await instanceCutties.tokenOfOwnerByIndex(accounts[2], 0);

            await instanceCutties.mintCutties(accounts[3], amount, { from: accounts[3], value: ethValue });
            NFT2 = await instanceCutties.tokenOfOwnerByIndex(accounts[3], 0);

            await instanceCutties.mintCutties(accounts[2], amount, { from: accounts[2], value: ethValue });
            NFT3 = await instanceCutties.tokenOfOwnerByIndex(accounts[2], 1);

            await instanceCutties.pauseSale();
            await instanceCutties.burnExtraToken();
        });

        it("staking v3 NFT", async () => {
            const balance1 = new BigNumber(await instanceCuttToken.balanceOf(accounts[2]));
            const balance2 = new BigNumber(await instanceCuttToken.balanceOf(accounts[3]));
            await instanceCuttToken.burn(balance1, { from: accounts[2] });
            await instanceCuttToken.burn(balance2, { from: accounts[3] });

            await instanceCutties.approve(instanceNFTStaking.address, NFT1, { from: accounts[2] });
            await instanceCutties.approve(instanceNFTStaking.address, NFT2, { from: accounts[3] });
            await instanceCutties.approve(instanceNFTStaking.address, NFT3, { from: accounts[2] });
            await instanceNFTStaking.setCuttiesAddress(instanceCutties.address);
            await instanceNFTStaking.setMultipliers([
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
            await instanceNFTStaking.stake(NFT1, 103, { from: accounts[2] });
            await instanceNFTStaking.stake(NFT2, 4, { from: accounts[3] });
            await instanceNFTStaking.stake(NFT3, 4, { from: accounts[2] });

            function timeout(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            await timeout(20000);
            await instanceCutties.deposit({ value: "1" });

            const reward1 = await instanceNFTStaking.getReward(accounts[2]);
            const reward2 = await instanceNFTStaking.getReward(accounts[3]);
            expect(reward1.pending.div(reward2.pending).gt(4)).to.equal(true);
        });

        it("unStake NFT", async () => {
            await instanceNFTStaking.withdraw(0, { from: accounts[2] });
            await instanceNFTStaking.withdraw(1, { from: accounts[2] });
            await instanceNFTStaking.withdraw(0, { from: accounts[3] });

            const owner1 = await instanceCutties.ownerOf(NFT1);
            const owner2 = await instanceCutties.ownerOf(NFT2);
            const owner3 = await instanceCutties.ownerOf(NFT3);
            assert.equal(owner1, accounts[2]);
            assert.equal(owner2, accounts[3]);
            assert.equal(owner3, accounts[2]);

            const balance1 = new BigNumber(await instanceCuttToken.balanceOf(accounts[2]));
            const balance2 = new BigNumber(await instanceCuttToken.balanceOf(accounts[3]));

            expect(balance1.gt(120000000000000)).to.equal(true);
            expect(balance2.gt(50000000000000)).to.equal(true);
        });
    });
});