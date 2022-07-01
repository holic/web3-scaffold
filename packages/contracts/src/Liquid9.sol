pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Liquid {
    address liquid11;
    uint256 auctionIndex;

    AggregatorV3Interface internal priceFeed;

    mapping(uint256 => Auction) public auctions;
    struct Auction {
        uint256 totalTokenPool;
        uint256 auctionAmount;
        uint256 minAuctionPrice;
        uint256 auctionLength;
        uint256 startTime;
        uint256 totalRaised;
        uint256 totalLPTokensCreated;
        address protocolTreasuryAddress;
        address protocolToken;
        address otherToken;
        address routerAddress;
        address pairAddress;
        bool auctionDidNotPass;
        bool auctionFinalized;
    }

    mapping(address => mapping(uint256 => UserContribution))
        public userContributions;

    struct UserContribution {
        uint256 amount;
        uint256 lastRedeemTimestamp;
        bool diamondHand;
    }

    constructor() {
        liquid11 = msg.sender;
    }

    modifier auctionOpen(uint256 _auctionIndex) {
        require(
            block.timestamp > auctions[_auctionIndex].startTime &&
                block.timestamp <
                auctions[_auctionIndex].startTime +
                    auctions[_auctionIndex].auctionLength,
            "Auction not open"
        );
        _;
    }

    /*╔═════════════════════════════╗
      ║  Create liquidity event     ║
      ╚═════════════════════════════╝*/

    function createAuction(
        uint256 _totalTokenAmount,
        uint256 _auctionAmount,
        uint256 _minAuctionPrice,
        uint256 _auctionLength,
        uint256 _startTime,
        address _protocolToken,
        address _otherToken,
        address _routerAddress,
        address _factoryAddress
    ) external {
        auctionIndex++;

        // This include also bonus incentive tokens.
        require(
            _totalTokenAmount >= 2 * _auctionAmount,
            "insufcient auction funds"
        );

        auctions[auctionIndex].pairAddress = IUniswapV2Factory(_factoryAddress)
            .getPair(_protocolToken, _otherToken);

        // check the pair exists
        require(
            auctions[auctionIndex].pairAddress != address(0),
            "pair must exist"
        );

        // give us the juice
        IERC20(_protocolToken).transfer(address(this), _totalTokenAmount);

        // set what we need for the auctionzs
        auctions[auctionIndex].auctionAmount = _auctionAmount;
        auctions[auctionIndex].minAuctionPrice = _minAuctionPrice;
        auctions[auctionIndex].auctionLength = _auctionLength;
        auctions[auctionIndex].protocolToken = _protocolToken;
        auctions[auctionIndex].otherToken = _otherToken;
        auctions[auctionIndex].routerAddress = _routerAddress;
        auctions[auctionIndex].protocolTreasuryAddress = msg.sender;

        // auction start ser
        require(
            block.timestamp + 1 hours < _startTime,
            "auction already started"
        );
        // also check reasonable start time paratmeter.
        auctions[auctionIndex].startTime = _startTime;
    }

    /*╔═════════════════════════════╗
      ║    User participate         ║
      ╚═════════════════════════════╝*/

    // ape into the sepcific liquidity event
    function ape(
        uint256 _auctionIndex,
        uint256 _amountToApe,
        bool _diamondHand
    ) external auctionOpen(_auctionIndex) {
        require(_amountToApe > 0, "ape harder");

        // enforce not too much ape edge case after hack.
        IERC20(auctions[_auctionIndex].otherToken).transfer(
            address(this),
            _amountToApe
        );

        userContributions[msg.sender][_auctionIndex].amount += _amountToApe;
        userContributions[msg.sender][_auctionIndex].diamondHand = _diamondHand; // set this always
        auctions[auctionIndex].totalRaised += _amountToApe;
    }

    // ape out of the sepcific liquidity event
    function unApe(uint256 _auctionIndex, uint256 _amountToApeOut)
        external
        auctionOpen(_auctionIndex)
    {
        require(
            _amountToApeOut <=
                userContributions[msg.sender][_auctionIndex].amount,
            "naughty ape"
        );

        // cannot withdraw in last day. Make this neater.
        require(
            block.timestamp + 1 days <
                auctions[_auctionIndex].startTime +
                    auctions[_auctionIndex].auctionLength,
            "Cannot withdraw in last day"
        );

        userContributions[msg.sender][_auctionIndex].amount -= _amountToApeOut;
        auctions[_auctionIndex].totalRaised -= _amountToApeOut;

        IERC20(auctions[_auctionIndex].otherToken).transfer(
            msg.sender,
            _amountToApeOut
        );
    }

    /*╔═════════════════════════════╗
      ║    Finalize the event       ║
      ╚═════════════════════════════╝*/

    function finalizeAuction(uint256 _auctionIndex) external {
        require(
            block.timestamp >
                auctions[_auctionIndex].startTime +
                    auctions[_auctionIndex].auctionLength,
            "Auction not ended"
        );
        require(
            !auctions[_auctionIndex].auctionFinalized,
            "auction already finalized"
        );

        auctions[_auctionIndex].auctionFinalized = true;

        if (
            auctions[_auctionIndex].totalRaised <
            auctions[_auctionIndex].minAuctionPrice
        ) {
            auctions[_auctionIndex].auctionDidNotPass = true;
            return; // auction didn't pass people should withdraw.
        }

        // Need to ensure permissonless addition of this liquidity cannot be exploited
        _addTheLiquidity(_auctionIndex);

        // perform other work!
    }

    function _addTheLiquidity(uint256 _auctionIndex) internal {
        Auction memory auction = auctions[_auctionIndex];

        uint256 balanceBefore = IUniswapV2Pair(auction.pairAddress).balanceOf(
            address(this)
        );

        // It is not safe to look up the reserve ratio from within a transaction and rely on it as a price belief,
        // as this ratio can be cheaply manipulated to your detriment.
        // don't want to get rugged here. We need slippage tolerance and or a price estimate.zs
        // https://docs.uniswap.org/protocol/V2/guides/smart-contract-integration/providing-liquidity

        // address token0 = IUniswapV2Pair(auction.pairAddress).token0();
        (uint112 reserve0, uint112 reserve1, ) = IUniswapV2Pair(
            auction.pairAddress
        ).getReserves();

        (
            uint256 reserveProtocolToken,
            uint256 reserveOtherToken
        ) = (IUniswapV2Pair(auction.pairAddress).token0() ==
                auction.protocolToken)
                ? (uint256(reserve0), uint256(reserve1))
                : (uint256(reserve1), uint256(reserve0));

        // calculate exact ratio to put it in at.
        uint256 amountOfProtocolTokenToPutIn = (reserveOtherToken *
            auction.totalRaised) / reserveProtocolToken;

        // dyanimcally get address in future
        uint256 fairPrice = uint256(getLatestPrice(auction.pairAddress));
        // uint256 ammImpliedPrice = (reserveOtherToken * 1e18) /
        // reserveProtocolToken;

        //check we weren't sandwidched using chainlink
        require(
            (fairPrice * 997) / 1000 <
                (reserveOtherToken * 1e18) / reserveProtocolToken
        );
        require(
            (fairPrice * 1003) / 1000 >
                (reserveOtherToken * 1e18) / reserveProtocolToken
        );

        // give router the necessary allowance
        // maximal approve rather in contructor
        // IERC20(auction.protocolToken).approve(
        //     auction.routerAddress,
        //     amountOfProtocolTokenToPutIn
        // );
        // IERC20(auction.otherToken).approve(
        //     auction.routerAddress,
        //     auction.totalRaised
        // );
        IUniswapV2Router02(auction.routerAddress).addLiquidity(
            auction.protocolToken,
            auction.otherToken,
            amountOfProtocolTokenToPutIn, // amountADesired
            auction.totalRaised,
            (amountOfProtocolTokenToPutIn * 997) / 1000, // 30 bips tolerance
            (auction.totalRaised * 997) / 1000, // 30 bips tolerance
            address(this),
            block.timestamp // must execute atomically obvs
        );

        auctions[_auctionIndex].totalLPTokensCreated =
            IUniswapV2Pair(auction.pairAddress).balanceOf(address(this)) -
            balanceBefore;
    }

    function getLatestPrice(address _address) public view returns (int256) {
        (
            ,
            /*uint80 roundID*/
            int256 price, /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/
            ,
            ,

        ) = AggregatorV3Interface(_address).latestRoundData();
        return price;
    }

    /*╔═════════════════════════════╗
      ║    success redeem events    ║
      ╚═════════════════════════════╝*/

    function userRedeemTokens(uint256 _auctionIndex) external {
        require(
            auctions[_auctionIndex].auctionFinalized,
            "auction not finalized"
        );
        //only once auction is over
        UserContribution storage user = userContributions[msg.sender][
            _auctionIndex
        ];

        uint256 baseAmountForUser = (auctions[_auctionIndex].auctionAmount *
            user.amount) / auctions[_auctionIndex].totalRaised;

        if (user.lastRedeemTimestamp == 0) {
            user.lastRedeemTimestamp = block.timestamp;
        }

        // todo allocate bonus liquidity
        uint256 vestingPeriod = (user.diamondHand) ? 90 days : 180 days;
        uint256 vestEndTime = auctions[_auctionIndex].startTime +
            auctions[_auctionIndex].auctionLength +
            vestingPeriod;

        uint256 vestedTill = (block.timestamp > vestEndTime)
            ? vestEndTime
            : block.timestamp;

        // safe math will revert if they try redeem again past their vest period
        uint256 vestedAmount = (baseAmountForUser *
            (vestedTill - user.lastRedeemTimestamp)) / vestingPeriod;

        user.lastRedeemTimestamp = block.timestamp;

        IERC20(auctions[_auctionIndex].protocolToken).transfer(
            msg.sender,
            vestedAmount
        );
    }

    function protocolRedeemLPtokens(uint256 _auctionIndex) external {
        require(
            auctions[_auctionIndex].auctionFinalized,
            "auction not finalized"
        );
        uint256 amount = auctions[_auctionIndex].totalLPTokensCreated;

        auctions[_auctionIndex].totalLPTokensCreated = 0;
        IUniswapV2Pair(auctions[_auctionIndex].pairAddress).transferFrom(
            address(this),
            auctions[_auctionIndex].protocolTreasuryAddress,
            amount
        );
    }

    /*╔═════════════════════════════╗
      ║    Failed event withdrawls  ║
      ╚═════════════════════════════╝*/

    function withdrawFailedEvent(uint256 _auctionIndex) external {
        require(
            auctions[auctionIndex].auctionDidNotPass,
            "can only exit in failed event"
        );
        uint256 amount = userContributions[msg.sender][_auctionIndex].amount;
        userContributions[msg.sender][_auctionIndex].amount = 0;

        IERC20(auctions[_auctionIndex].otherToken).transfer(msg.sender, amount);
    }

    function withdrawFailedEventProtocol(uint256 _auctionIndex) external {
        require(
            auctions[_auctionIndex].auctionDidNotPass,
            "can only exit in failed event"
        );
        uint256 amount = auctions[_auctionIndex].totalTokenPool;
        auctions[_auctionIndex].totalTokenPool = 0;

        IERC20(auctions[_auctionIndex].protocolToken).transfer(
            auctions[_auctionIndex].protocolTreasuryAddress,
            amount
        );
    }
}
