// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import { Ownable } from "openzeppelin-contracts/contracts/access/Ownable.sol";
import { ERC721 } from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import { ERC721Burnable } from "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import { Counters } from "@openzeppelin/contracts/utils/Counters.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { IExquisiteGraphics } from "./interfaces/IExquisiteGraphics.sol";
// import { MinimalForwarderRecipient } from "./MinimalForwarderRecipient.sol";
import { ERC2771Context } from "openzeppelin-contracts/contracts/metatx/ERC2771Context.sol";

import "@sstore2/contracts/SSTORE2.sol";
import "./Base64.sol";

contract DailyCanvas is ERC2771Context, ERC721, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;
    
    event NewCanvasPrompt(uint256 promptId, uint256 width, uint256 height, string[] palette, address author);
    event CanvasDrawn(uint256 canvasId, bytes pixels, address author, uint256 canvasPromptId, uint256 canvasRiffId);

    Counters.Counter private _canvasDraw;
    Counters.Counter private _canvasPrompt;

    IExquisiteGraphics gfx = IExquisiteGraphics(payable(0xDf01A4040493B514605392620B3a0a05Eb8Cd295));

    constructor(address trustedForwarder) ERC721("Canvas", "CAN") ERC2771Context(address(trustedForwarder)) {}

    // todo: canvas id on prompt?; canvas-as-prompt

    // canvas prompt data
    mapping(uint256 => uint256) private _promptCanvasHeight;
    mapping(uint256 => uint256) private _promptCanvasWidth;
    mapping(uint256 => string[]) private _promptCanvasPalette;

    // canvas response data
    mapping(uint256 => uint256) private _canvasPromptId;
    mapping(uint256 => address) private _svgData;
    // the id of the canvas this canvas is responding to (default=0)
    mapping(uint256 => uint256) private _canvasRiffId;

    address private relayer;

    function authorizeRelayer(address newRelayer) public onlyOwner {
        relayer = newRelayer;
    }

    function _newCanvasPrompt(uint256 width, uint256 height, string[] memory palette) private {
        _canvasPrompt.increment();

        uint256 newPromptId = _canvasPrompt.current();
        
        _promptCanvasWidth[newPromptId] = width;
        _promptCanvasHeight[newPromptId] = height;
        _promptCanvasPalette[newPromptId] = palette;

        emit NewCanvasPrompt(newPromptId, width, height, palette, _msgSender());
    }

    function newCanvasPromptFromRelay(uint256 width, uint256 height, string[] memory palette) public {
        require(msg.sender == relayer, "not authorized to create new prompts");
        _newCanvasPrompt(width, height, palette);
    }

    function newCanvasPrompt(uint256 width, uint256 height, string[] memory palette) public onlyOwner {
        _newCanvasPrompt(width, height, palette);
    }

    // returns a tuple -> [2, 32, 32, ['#000000', '#111111']]
    function getCanvasPrompt() public view returns (string memory) {
        return string(abi.encodePacked(
            _canvasPrompt.current(),
            _promptCanvasWidth[_canvasPrompt.current()],
            _promptCanvasHeight[_canvasPrompt.current()]
        ));
    }

    function getCanvasPromptPalette() public view returns (string[] memory) {
        return _promptCanvasPalette[_canvasPrompt.current()];
    }

    function getCurrentPromptId() public view returns (uint256) {
        return _canvasPrompt.current();
    }

    function wipeCanvas(uint256 canvasId) public onlyOwner {
        _svgData[canvasId] = address(0);
        _canvasPromptId[canvasId] = 0;
        _canvasRiffId[canvasId] = 0;
    }

    function drawCanvas(bytes calldata pixels, uint256 riffCanvasId) public returns (uint256) {
        safeMint(msg.sender);
        
        uint256 canvasId = _canvasDraw.current();

        _svgData[canvasId] = SSTORE2.write(pixels);
        _canvasPromptId[canvasId] = _canvasPrompt.current();
        _canvasRiffId[canvasId] = riffCanvasId;

        // emit events
        emit CanvasDrawn(canvasId, pixels, msg.sender, _canvasPrompt.current(), riffCanvasId);

        return canvasId;
    }

    function getTileSVG(uint256 canvasId) public view returns (string memory) {
        return gfx.draw(
            SSTORE2.read(_svgData[canvasId])
        );
    }

    function getCanvasPixels(uint256 canvasId) public view returns (bytes memory) {
        return SSTORE2.read(_svgData[canvasId]);
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
        output = 'data:image/svg+xml;base64,';
        output = string(
            abi.encodePacked(
                output,
                Base64.encode(abi.encodePacked(getTileSVG(uint256(canvasId))))
            )
        );

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Daily Canvas", "description": "One new canvas, everyday, for your pixels.", "image": "', output, '"}'
                    )
                )
            )
        );

        output = string(abi.encodePacked('data:application/json;base64,', json));
    
        return output;
    }

    function _msgSender() internal view override(Context, ERC2771Context) returns(address) {
        return ERC2771Context._msgSender();
    } 

    function _msgData() internal view override(Context, ERC2771Context) returns(bytes memory) 
    {
            return ERC2771Context._msgData();
    }


    function safeMint(address to) public {
        _canvasDraw.increment();
        uint256 canvasId = _canvasDraw.current();
        _safeMint(to, canvasId);
    }
}