// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import { Ownable } from "openzeppelin-contracts/contracts/access/Ownable.sol";
import { ERC721 } from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import { ERC721Burnable } from "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import { Counters } from "@openzeppelin/contracts/utils/Counters.sol";

contract DailyCanvas is ERC721, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;
    
    event CanvasDrawn(uint256 canvasId, bool pixelFilled, address author, uint256 promptId);
    event NewPrompt(uint256 promptId, string promptText, address author);

    Counters.Counter private _canvasIdCounter;
    Counters.Counter private _promptIdCounter;

    constructor() ERC721("Canvas", "CAN") {}

    mapping(uint256 => bool) private _pixelFilled;
    mapping(uint256 => string) private _promptTexts;
    mapping(uint256 => uint256) private _promptId;
    // canvas width ??

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

    // function getPromptById()

    function getPromptByCanvasId(uint256 canvasId) public view returns (string memory) {
        return _promptTexts[_promptId[canvasId]];
    }

    function getPrompt(uint256 promptId) public view returns (string memory) {
        return _promptTexts[promptId];
    }

    function drawCanvas(bool pixelFilled, uint256 promptId) public {
        // limit entries per address? 
        // require anything?

        safeMint(msg.sender);
        uint256 canvasId = _canvasIdCounter.current();

        // fill in the data
        _pixelFilled[canvasId] = pixelFilled;
        _promptId[canvasId] = promptId;

        // emit events
        emit CanvasDrawn(canvasId, pixelFilled, msg.sender, promptId);
    }

    // give user a token that can be filled with pixels
    // worry about expiring it later, aka the flip of saving it for later

    // Do I care about this?
    // function _baseURI() internal pure override returns (string memory) {
    //     return abi.encodePacked("<pixel ", _pixelFilled[]);
    // }

    function tokenURI(uint256 canvasId) public view override returns (string memory) {
        string memory pixel = "pixel filled";
        if (_pixelFilled[canvasId]) {
            pixel = "no pixel";
        }

        // todo: replace with xqstgfx

        return string(abi.encodePacked("<pixel=", pixel,  " /pixel>"));
    }

    function safeMint(address to) public onlyOwner {
        uint256 canvasId = _canvasIdCounter.current();
        _canvasIdCounter.increment();
        _safeMint(to, canvasId);
        // could this return break things? 
        _canvasIdCounter.current();
    }
}