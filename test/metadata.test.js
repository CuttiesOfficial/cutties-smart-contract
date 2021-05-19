const Cutties = artifacts.require("Cutties");
const BigNumber = require('bignumber.js');

contract("CUTTIES", async (accounts) => {
  const deployer = accounts[0];
  let instance;

  beforeEach(async () => {
    instance = await Cutties.new("", { from: deployer });
  });

  describe("Meta test", () => {
    beforeEach(async () => {
      instance = await Cutties.new("", { from: deployer });
    });

    it("name", async () => {
      const name = await instance.name();
      assert.equal(name, "Cutties");
    });

    it("symbol", async () => {
      const symbol = await instance.symbol();
      assert.equal(symbol, "CUTTIES");
    });

    it("initial supply", async () => {
      const supply = await instance.totalSupply();
      assert.equal(supply, 0);
    });

    it("Maximum cutties supply", async () => {
      const supply = await instance.MAX_CUTTIES_SUPPLY();
      assert.equal(supply, 10000);
    });

    it("inital balance", async () => {
      const balance = await instance.balanceOf(deployer);
      assert.equal(balance, 0);
    });

    it("initial price", async () => {
      const price = new BigNumber(await instance.getCuttiesPrice());
      assert.equal(price.toString(10), '20000000000000000');
    });

    it("initial mintalbe count", async () => {
      const amount = await instance.getMintableCount();
      assert.equal(amount, 20);
    });

    it("initial base URI", async () => {
      const baseURI = await instance.baseURI();
      assert.equal(baseURI, "");
    });
  });
});