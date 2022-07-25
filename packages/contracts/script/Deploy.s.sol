// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "forge-std/Script.sol";

import {ExampleNFT} from "../src/ExampleNFT.sol";

/// @dev This is best run by calling "$ ./scripts/Deploy.sh" from the root of the "contracts" app!

contract Deploy is Script {
    /// @dev Deployable contracts
    ExampleNFT public exampleNFT;

    // Renderer public renderer; -- uncomment if you have a renderer contract

    /// @notice Allows for easily loading ENV vars
    /// @dev The Solenv include path is relative to the project root, or whereever you run the shell command from
    // function setUp() external {
    //   Solenv.config("./packages/contracts/.env.local");
    // }

    function deployTokenContract() public {
        /// @dev Deploy the base contract with any inputs
        exampleNFT = new ExampleNFT();
    }

    function deployRendererContract() public {
        /// @dev If you setup a renderer contract, easily deploy it alongside the base contract
        // renderer = new Renderer(
        //     address(exampleNFT),
        // );
    }

    function run() public {
        vm.startBroadcast();

        deployTokenContract();
        // deployRendererContract();

        /// @dev Update token contract to point to the renderer
        // exampleNFT.setRenderer(renderer);

        vm.stopBroadcast();

        console.log("Deployed contract to ==> ", address(exampleNFT));
    }
}
