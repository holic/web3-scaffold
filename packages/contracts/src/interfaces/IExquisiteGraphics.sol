// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IExquisiteGraphics {
  struct Header {
    /* HEADER START */
    uint8 version; // 8 bits
    uint16 width; // 8 bits
    uint16 height; // 8 bits
    uint16 numColors; // 16 bits
    uint8 backgroundColorIndex; // 8 bits
    uint16 scale; // 10 bits
    uint8 reserved; // 4 bits
    bool alpha; // 1 bit
    bool hasBackground; // 1 bit
    /* HEADER END */

    /* CALCULATED DATA START */
    uint24 totalPixels; // total pixels in the image
    uint8 bitsPerPixel; // bits per pixel
    uint8 pixelsPerByte; // pixels per byte
    uint16 paletteStart; // number of the byte where the palette starts
    uint16 dataStart; // number of the byte where the data starts
    /* CALCULATED DATA END */
  }

  struct DrawContext {
    bytes data; // the binary data in .xqst format
    Header header; // the header of the data
    string[] palette; // hex color for each color in the image
    uint8[] pixels; // color index (in the palette) for a pixel
  }

  error ExceededMaxPixels();
  error ExceededMaxRows();
  error ExceededMaxColumns();
  error ExceededMaxColors();
  error BackgroundColorIndexOutOfRange();
  error PixelColorIndexOutOfRange();
  error MissingHeader();
  error NotEnoughData();

  /// @notice Draw an SVG from the provided data
  /// @param data Binary data in the .xqst format.
  /// @return string the <svg>
  function draw(bytes memory data) external pure returns (string memory);

  /// @notice Draw an SVG from the provided data. No validation.
  /// @param data Binary data in the .xqst format.
  /// @return string the <svg>
  function drawUnsafe(bytes memory data) external pure returns (string memory);

  /// @notice Draw the <rect> elements of an SVG from the data
  /// @param data Binary data in the .xqst format.
  /// @return string the <rect> elements
  function drawPixels(bytes memory data) external pure returns (string memory);

  /// @notice Draw the <rect> elements of an SVG from the data. No validation
  /// @param data Binary data in the .xqst format.
  /// @return string the <rect> elements
  function drawPixelsUnsafe(bytes memory data)
    external
    pure
    returns (string memory);

  /// @notice validates if the given data is a valid .xqst file
  /// @param data Binary data in the .xqst format.
  /// @return bool true if the data is valid
  function validate(bytes memory data) external pure returns (bool);

  // Check if the header of some data is an XQST Graphics Compatible file
  /// @notice validates the header for some data is a valid .xqst header
  /// @param data Binary data in the .xqst format.
  /// @return bool true if the header is valid
  function validateHeader(bytes memory data) external pure returns (bool);

  /// @notice Decodes the header from a binary .xqst blob
  /// @param data Binary data in the .xqst format.
  /// @return Header the decoded header
  function decodeHeader(bytes memory data)
    external
    pure
    returns (Header memory);

  /// @notice Decodes the palette from a binary .xqst blob
  /// @param data Binary data in the .xqst format.
  /// @return bytes8[] the decoded palette
  function decodePalette(bytes memory data)
    external
    pure
    returns (string[] memory);

  /// @notice Decodes all of the data needed to draw an SVG from the .xqst file
  /// @param data Binary data in the .xqst format.
  /// @return ctx The Draw Context containing all of the decoded data
  function decodeDrawContext(bytes memory data)
    external
    pure
    returns (DrawContext memory ctx);

  /// @notice A way to say "Thank You"
  function ty() external payable;

  /// @notice A way to say "Thank You"
  function ty(string memory message) external payable;

  /// @notice Able to receive ETH from anyone
  receive() external payable;
}