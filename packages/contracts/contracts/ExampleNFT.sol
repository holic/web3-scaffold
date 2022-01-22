// SPDX-License-Identifier: CC0-1.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ExampleNFT is ERC721 {
    uint256 private currentTokenId = 0;

    constructor() ERC721("ExampleNFT", "NFT") {
    }

    function mint() public returns (uint256) {
        currentTokenId++;
        _mint(msg.sender, currentTokenId);
        return currentTokenId;
    }
}
