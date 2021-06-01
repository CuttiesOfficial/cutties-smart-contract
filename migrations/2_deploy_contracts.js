var Cutties = artifacts.require("./Cutties.sol");
var CuttToken = artifacts.require("./CuttToken.sol");
var V3Staking = artifacts.require("./V3Staking.sol");
var NFTStaking = artifacts.require("./NFTStaking.sol");

module.exports = function (deployer) {
  deployer.deploy(Cutties, "");
  deployer.deploy(CuttToken);
  deployer.deploy(V3Staking);
  deployer.deploy(NFTStaking);
};
