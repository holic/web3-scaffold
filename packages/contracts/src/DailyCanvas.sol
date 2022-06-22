// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import { Ownable } from "openzeppelin-contracts/contracts/access/Ownable.sol";
import { ERC721 } from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import { ERC721Burnable } from "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import { Counters } from "@openzeppelin/contracts/utils/Counters.sol";
import { IExquisiteGraphics } from "./interfaces/IExquisiteGraphics.sol";

import "@sstore2/contracts/SSTORE2.sol";
import "./Base64.sol";

contract DailyCanvas is ERC721, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;
    
    event CanvasDrawn(uint256 canvasId, bytes pixels, address author, uint256 promptId);
    event NewPrompt(uint256 promptId, string promptText, address author);

    Counters.Counter private _canvasIdCounter;
    Counters.Counter private _promptIdCounter;

    IExquisiteGraphics gfx = IExquisiteGraphics(payable(0xDf01A4040493B514605392620B3a0a05Eb8Cd295));

    constructor() ERC721("Canvas", "CAN") {
        // setRenderer(0xDf01A4040493B514605392620B3a0a05Eb8Cd295);
    }

    mapping(uint256 => bool) private _pixelFilled;
    mapping(uint256 => string) private _promptTexts;
    mapping(uint256 => uint256) private _promptId;
    mapping(uint256 => address) private _svgData;

    // DAY = 43200
    // testnet?

    // current prompt? [ could be toggled with something before impleneting time loop ]
    function newPrompt(string memory promptText) public onlyOwner {
        // uint256 currentPromptId = _promptIdCounter.current();
        // how to de-zero-index this
        _promptIdCounter.increment();

        uint256 newPromptId = _promptIdCounter.current();

        _promptTexts[newPromptId] = promptText;

        emit NewPrompt(newPromptId, promptText, msg.sender);
    }

    // setNextCanvasWidth setNextCanvasHeight setNextCanvasStartingMap ?

    function getCurrentPrompt() public view returns (string memory) {
        return _promptTexts[_promptIdCounter.current()];
    }

    function getCurrentPromptId() public view returns (uint256) {
        return _promptIdCounter.current();
    }

    // function getPromptById()

    function getPromptByCanvasId(uint256 canvasId) public view returns (string memory) {
        return _promptTexts[_promptId[canvasId]];
    }

    function getPrompt(uint256 promptId) public view returns (string memory) {
        return _promptTexts[promptId];
    }

    function drawCanvas(bytes calldata pixels, uint256 promptId) public {
        // todo: limit entries per address? 
        // require anything?
        // require(pixels.length == 1024, 'Data is not 1024 bytes');

        safeMint(msg.sender);
        uint256 canvasId = _canvasIdCounter.current();

        // fill in the data
        _svgData[canvasId] = SSTORE2.write(pixels);

        // _pixelFilled[canvasId] = pixelFilled;
        _promptId[canvasId] = promptId;

        // emit events
        emit CanvasDrawn(canvasId, pixels, msg.sender, promptId);
    }

    function getTileSVG(uint256 canvasId) public view returns (string memory) {
        return gfx.draw(
            SSTORE2.read(_svgData[canvasId])
        );
    }

    function setRenderer(address addr) public onlyOwner {
        gfx = IExquisiteGraphics(payable(addr));
    }

    function tokenURI(uint256 canvasId)
        public
        view
        override
        returns (string memory)
    {
        string memory output;
        string memory description;

        output = 'data:image/svg+xml;base64,';
        output = string(
            abi.encodePacked(
            output,
            Base64.encode(abi.encodePacked(getTileSVG(uint256(canvasId))))
            )
        );
        description = string(
            abi.encodePacked('Daily Canvas')
        );

        string memory json = Base64.encode(
        bytes(
            string(
            abi.encodePacked(
                '{"name": "Daily Canvas", "description": a daily canvas", "image": "',
                output,
                '"}'
            )
            )
        )
        );
        output = string(abi.encodePacked('data:application/json;base64,', json));
        return output;
    }

    // give user a token that can be filled with pixels
    // worry about expiring it later, aka the flip of saving it for later

    // Do I care about this?
    // function _baseURI() internal pure override returns (string memory) {
    //     return abi.encodePacked("<pixel ", _pixelFilled[]);
    // }

    function safeMint(address to) public onlyOwner {
        uint256 canvasId = _canvasIdCounter.current();
        _canvasIdCounter.increment();
        _safeMint(to, canvasId);
        // could this return break things? 
        _canvasIdCounter.current();
    }
}