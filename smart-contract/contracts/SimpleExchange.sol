//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract SimpleExchange is Ownable {
    using SafeMath for uint256;

    // Rate to native coin
    // token / eth = value/ decimal
    struct Rate {
        uint256 value;
        uint256 decimal;
    }

    mapping(address => Rate) public tokenRate;

    function getTokenRate(address _tokenAddress) public view returns (Rate memory) {
        return tokenRate[_tokenAddress];
    }

    function receiveEth() public payable onlyOwner{
    }

    function upsertTokenRate(address _tokenAddress, uint256 _value, uint256 _decimal) public onlyOwner {
        require(_tokenAddress != address(0), "SimpleExchange: address of token not valid");
        require(_value > 0, "SimpleExchange: _value must greater than zero");
        require(_decimal > 0, "SimpleExchange: _decimal must greater than zero");
        tokenRate[_tokenAddress] = Rate({value : _value, decimal : _decimal});
    }

    // @dev: user request to exchange from token to ETH
    function tokenToETH(address _tokenAddress, uint256 _tokensSold) public {
        require(_tokenAddress != address(0), "SimpleExchange: address of token not valid");
        require(_tokensSold > 0, "SimpleExchange: You need to sell at least some tokens");
        require(tokenRate[_tokenAddress].value > 0 && tokenRate[_tokenAddress].decimal > 0, "SimpleExchange: can not get rate of token");

        uint256 allowance = IERC20(_tokenAddress).allowance(msg.sender, address(this));
        require(allowance >= _tokensSold, "SimpleExchange: Please check the token allowance");
        uint256 _ethBought = _tokensSold  * tokenRate[_tokenAddress].value / (10 ** tokenRate[_tokenAddress].decimal);
        console.log("_ethBought",_ethBought);

        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _tokensSold);
        payable(msg.sender).transfer(_ethBought);
    }

    // @dev: user request to exchange from ETH to token
    function ethToToken(address _tokenAddress) public payable {
        require(_tokenAddress != address(0), "SimpleExchange: address of token not valid");
        require(msg.value > 0, "SimpleExchange: You need to sell at least some ethers");
        require(tokenRate[_tokenAddress].value > 0 && tokenRate[_tokenAddress].decimal > 0, "SimpleExchange: can not get rate of token");

        uint256 _tokenBought = msg.value * (10 ** tokenRate[_tokenAddress].decimal) / tokenRate[_tokenAddress].value ;
        uint256 dexBalance = IERC20(_tokenAddress).balanceOf(address(this));
        require(_tokenBought <= dexBalance, "SimpleExchange: DEX Not enough tokens in the reserve");
        IERC20(_tokenAddress).transfer(msg.sender, _tokenBought);
    }

    // @dev: swap token to token
    function tokenToTokenSwap(address _tokenFrom, address _tokenTo, uint256 _amountFrom) public payable {
        require(_tokenFrom != address(0), "SimpleExchange: address of From token not valid");
        require(_tokenTo != address(0), "SimpleExchange: address of To token not valid");
        require(_amountFrom > 0, "SimpleExchange: You need to sell at least some tokens");
        require(tokenRate[_tokenFrom].value > 0 && tokenRate[_tokenFrom].decimal > 0, "SimpleExchange: can not get rate of From token");
        require(tokenRate[_tokenTo].value > 0 && tokenRate[_tokenTo].decimal > 0, "SimpleExchange: can not get rate of To token");
        console.log("_amountFrom",_amountFrom);

        uint256 rateTo = tokenRate[_tokenTo].value.div(10 ** tokenRate[_tokenTo].decimal);
        uint256 rateFrom = tokenRate[_tokenFrom].value.div(10 ** tokenRate[_tokenFrom].decimal);
        console.log("rateTo",rateTo);
        console.log("rateFrom",rateFrom);
        uint256 _tokenBought = _amountFrom * (tokenRate[_tokenFrom].value * 10 ** tokenRate[_tokenTo].decimal) / (tokenRate[_tokenTo].value * 10 ** tokenRate[_tokenFrom].decimal) ;
        uint256 dexToTokenBalance = IERC20(_tokenTo).balanceOf(address(this));

        console.log("_amountFrom:",_amountFrom);
        console.log("_tokenBought:",_tokenBought);
        console.log("dexToTokenBalance:",dexToTokenBalance);
        require(_tokenBought <= dexToTokenBalance, "SimpleExchange: DEX Not enough tokens in the reserve");

        IERC20(_tokenFrom).transferFrom(msg.sender, address(this), _amountFrom);
        IERC20(_tokenTo).transfer(msg.sender, _tokenBought);
    }
}