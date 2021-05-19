var Cutties = artifacts.require("./Cutties.sol");
var CuttToken = artifacts.require("./CuttToken.sol");

module.exports = function (deployer) {
  deployer.deploy(Cutties, "");
  deployer.deploy(CuttToken);
};
