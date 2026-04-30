// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Cactus721 is ERC721, AccessControl {
    bytes32 public constant GAME_ROLE = keccak256("GAME_ROLE");

    struct CactusData {
        uint256 genome;
        uint256 parentA;
        uint256 parentB;
        uint32 generation;
    }

    string private _baseTokenURI;
    uint256 private _nextTokenId;

    mapping(uint256 tokenId => CactusData) private _cactusData;

    event CactusMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 indexed parentA,
        uint256 parentB,
        uint32 generation,
        uint256 genome
    );
    event OriginCactusMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 genome
    );
    event Gen1CactusMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 genome
    );
    event CactusBurned(uint256 indexed tokenId, address indexed owner);
    event BaseURISet(string baseURI);

    error ZeroAddressRecipient();
    error InvalidToken();
    error SeedMintRequiresChildGeneration();

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) ERC721(name_, symbol_) {
        _baseTokenURI = baseURI_;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GAME_ROLE, msg.sender);
    }

    function mintOriginCactus(
        address to,
        uint256 genome
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256 tokenId) {
        tokenId = _mintCactus(to, genome, 0, 0, 0);

        emit OriginCactusMinted(tokenId, to, genome);
    }

    function mintGen1Cactus(
        address to,
        uint256 genome
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256 tokenId) {
        tokenId = _mintCactus(to, genome, 0, 0, 1);

        emit Gen1CactusMinted(tokenId, to, genome);
    }

    function mintFromSeed(
        address to,
        uint256 genome,
        uint256 parentA,
        uint256 parentB
    ) external onlyRole(GAME_ROLE) returns (uint256 tokenId) {
        if (to == address(0)) revert ZeroAddressRecipient();

        uint32 generation = _nextGeneration(parentA, parentB);
        if (generation <= 1) revert SeedMintRequiresChildGeneration();

        tokenId = _mintCactus(to, genome, parentA, parentB, generation);
    }

    function burn(uint256 tokenId) external onlyRole(GAME_ROLE) {
        address owner = _ownerOf(tokenId);
        if (owner == address(0)) revert InvalidToken();

        delete _cactusData[tokenId];
        _burn(tokenId);

        emit CactusBurned(tokenId, owner);
    }

    function setBaseURI(
        string calldata baseURI_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseURI_;

        emit BaseURISet(baseURI_);
    }

    function cactusData(
        uint256 tokenId
    ) external view returns (CactusData memory) {
        if (_ownerOf(tokenId) == address(0)) revert InvalidToken();

        return _cactusData[tokenId];
    }

    function genomeOf(uint256 tokenId) external view returns (uint256) {
        if (_ownerOf(tokenId) == address(0)) revert InvalidToken();

        return _cactusData[tokenId].genome;
    }

    function parentAOf(uint256 tokenId) external view returns (uint256) {
        if (_ownerOf(tokenId) == address(0)) revert InvalidToken();

        return _cactusData[tokenId].parentA;
    }

    function parentBOf(uint256 tokenId) external view returns (uint256) {
        if (_ownerOf(tokenId) == address(0)) revert InvalidToken();

        return _cactusData[tokenId].parentB;
    }

    function generationOf(uint256 tokenId) external view returns (uint32) {
        if (_ownerOf(tokenId) == address(0)) revert InvalidToken();

        return _cactusData[tokenId].generation;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function _mintCactus(
        address to,
        uint256 genome,
        uint256 parentA,
        uint256 parentB,
        uint32 generation
    ) internal returns (uint256 tokenId) {
        if (to == address(0)) revert ZeroAddressRecipient();

        tokenId = _nextTokenId++;

        _cactusData[tokenId] = CactusData({
            genome: genome,
            parentA: parentA,
            parentB: parentB,
            generation: generation
        });

        _mint(to, tokenId);

        emit CactusMinted(tokenId, to, parentA, parentB, generation, genome);
    }

    function _nextGeneration(
        uint256 parentA,
        uint256 parentB
    ) internal view returns (uint32) {
        uint32 parentAGeneration = _cactusData[parentA].generation;
        uint32 parentBGeneration = _cactusData[parentB].generation;

        if (_ownerOf(parentA) == address(0) || _ownerOf(parentB) == address(0)) {
            revert InvalidToken();
        }

        return
            parentAGeneration >= parentBGeneration
                ? parentAGeneration + 1
                : parentBGeneration + 1;
    }
}
