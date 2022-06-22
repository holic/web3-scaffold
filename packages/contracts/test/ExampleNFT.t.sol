// SPDX-License-Identifier: CC0-1.0
pragma solidity >=0.8.10 <0.9.0;

import "forge-std/Test.sol";
import "../src/ExampleNFT.sol";
import "../src/IRenderer.sol";

contract ExampleNFTTest is Test {
    ExampleNFT private nft;

    address private owner =
        vm.addr(uint256(keccak256(abi.encodePacked("owner"))));
    address private minter =
        vm.addr(uint256(keccak256(abi.encodePacked("minter"))));

    function setUp() public {
        nft = new ExampleNFT();
        nft.transferOwnership(owner);
        vm.deal(owner, 10 ether);
        vm.deal(minter, 10 ether);
    }

    function testMint() public {
        assertEq(nft.balanceOf(minter), 0);

        vm.expectRevert(ERC721Base.WrongPayment.selector);
        nft.mint{value: 1 ether}(1);

        vm.prank(minter);
        nft.mint{value: 0.1 ether}(1);
        assertEq(nft.balanceOf(minter), 1);

        vm.prank(minter);
        nft.mint{value: 0.3 ether}(3);
        assertEq(nft.balanceOf(minter), 4);

        vm.prank(minter);
        vm.expectRevert(
            abi.encodeWithSelector(ERC721Base.MintLimitExceeded.selector, 4)
        );
        nft.mint{value: 0.1 ether}(1);
    }
}
