// SPDX-License-Identifier: CC0-1.0
pragma solidity >=0.8.10 <0.9.0;
import "../src/ExampleNFT.sol";
import "../src/IRenderer.sol";

contract ExampleNFTTest is Test {
    Cheats constant cheats = Cheats(HEVM_ADDRESS);
    ExampleNFT private nft;

    address private owner =
        cheats.addr(uint256(keccak256(abi.encodePacked("owner"))));
    address private minter =
        cheats.addr(uint256(keccak256(abi.encodePacked("minter"))));

    function setUp() public {
        nft = new ExampleNFT();
        nft.transferOwnership(owner);
        cheats.deal(owner, 10 ether);
        cheats.deal(minter, 10 ether);
    }

    function testMint() public {
        assertEq(nft.balanceOf(minter), 0);

        cheats.expectRevert(ERC721Base.WrongPayment.selector);
        nft.mint{value: 1 ether}(1);

        cheats.prank(minter);
        nft.mint{value: 0.1 ether}(1);
        assertEq(nft.balanceOf(minter), 1);

        cheats.prank(minter);
        nft.mint{value: 0.3 ether}(3);
        assertEq(nft.balanceOf(minter), 4);

        cheats.prank(minter);
        cheats.expectRevert(
            abi.encodeWithSelector(ERC721Base.MintLimitExceeded.selector, 4)
        );
        nft.mint{value: 0.1 ether}(1);
    }
}
