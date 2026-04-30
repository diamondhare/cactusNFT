// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Seed721 is ERC721, AccessControl {
    bytes32 public constant GAME_ROLE = keccak256("GAME_ROLE");

    struct SeedData {
        uint256 genome;
        uint256 parentA;
        uint256 parentB;
        uint32 generation;
        uint16 germinationChanceBps;
        uint64 createdAt;
    }

    string private _baseTokenURI;
    uint256 private _nextTokenId;

    mapping(uint256 tokenId => SeedData) private _seedData;

    event SeedMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 indexed parentA,
        uint256 parentB,
        uint32 generation,
        uint256 genome,
        uint16 germinationChanceBps
    );
    event SeedBurned(uint256 indexed tokenId, address indexed owner);
    event BaseURISet(string baseURI);

    error ZeroAddressRecipient();
    error InvalidToken();
    error InvalidGerminationChance();

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) ERC721(name_, symbol_) {
        _baseTokenURI = baseURI_;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GAME_ROLE, msg.sender);
    }

    function mint(
        address to,
        uint256 genome,
        uint256 parentA,
        uint256 parentB,
        uint32 generation,
        uint16 germinationChanceBps
    ) external onlyRole(GAME_ROLE) returns (uint256 tokenId) {
        if (to == address(0)) revert ZeroAddressRecipient();
        if (germinationChanceBps > 10_000) revert InvalidGerminationChance();

        tokenId = _nextTokenId++;
        _seedData[tokenId] = SeedData({
            genome: genome,
            parentA: parentA,
            parentB: parentB,
            generation: generation,
            germinationChanceBps: germinationChanceBps,
            createdAt: uint64(block.timestamp)
        });

        _mint(to, tokenId);

        emit SeedMinted(
            tokenId,
            to,
            parentA,
            parentB,
            generation,
            genome,
            germinationChanceBps
        );
    }

    function burn(uint256 tokenId) external onlyRole(GAME_ROLE) {
        address owner = _ownerOf(tokenId);
        if (owner == address(0)) revert InvalidToken();

        delete _seedData[tokenId];
        _burn(tokenId);

        emit SeedBurned(tokenId, owner);
    }

    function setBaseURI(
        string calldata baseURI_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseURI_;

        emit BaseURISet(baseURI_);
    }

    function seedData(uint256 tokenId) external view returns (SeedData memory) {
        if (_ownerOf(tokenId) == address(0)) revert InvalidToken();

        return _seedData[tokenId];
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
