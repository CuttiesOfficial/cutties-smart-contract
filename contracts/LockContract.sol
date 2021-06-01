// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./SafeMath.sol";
import "./Address.sol";
import "./Ownable.sol";
import "./ICUTTToken.sol";

contract LockContract is Ownable {
    using SafeMath for uint256;
    using Address for address;

    uint256 public _startedLockedTime;
    uint256 public _lockedPeriod = 3 * 4 weeks;

    address public _team;
    address public _cuttToken;

    constructor() {
        _startedLockedTime = block.timestamp;
    }

    function setTokenAddress(address tokenAddress) public onlyOwner {
        _cuttToken = tokenAddress;
    }

    function setTeamAddress(address teamAddress) public onlyOwner {
        _team = teamAddress;
    }

    function mintToken() public onlyOwner {
        require(_cuttToken != address(0));
        ICUTTToken(_cuttToken).setTreasuryAddress();
    }

    function withdrawToken() public {
        require(_team != address(0) && _team == _msgSender());
        require(block.timestamp > _startedLockedTime.add(_lockedPeriod));
        uint256 balance = ICUTTToken(_cuttToken).balanceOf(address(this));
        require(
            block.timestamp > _startedLockedTime.add(_lockedPeriod) &&
                balance > 0
        );
        ICUTTToken(_cuttToken).transfer(_msgSender(), balance);
    }
}
