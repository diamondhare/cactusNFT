// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CactusCore is ERC721, AccessControl {
    bytes32 public constant BREEDER_ROLE = keccak256("BREEDER_ROLE");

    uint32[14] private COOLDOWNS = [
        uint32(1 minutes),
        uint32(2 minutes),
        uint32(5 minutes),
        uint32(10 minutes),
        uint32(30 minutes),
        uint32(1 hours),
        uint32(2 hours),
        uint32(4 hours),
        uint32(8 hours),
        uint32(16 hours),
        uint32(1 days),
        uint32(2 days),
        uint32(4 days),
        uint32(7 days)
    ];

    struct CactusData {
        uint256 seedParentId;
        uint256 pollenParentId;
        uint32 generation;
        uint16 cooldownIndex;
        uint64 breedingCooldownEndTime;
        uint256 genomeData;
    }

    struct SeedData {
        address owner;
        uint256 seedParentId;
        uint256 pollenParentId;
        uint32 generation;
        uint64 createdAt;
        uint64 germinationReadyTime;
        uint256 genomeData;
        bool germinated;
    }

    string private _baseTokenURI;

    uint256 private _tokenIdCounter;
    uint256 private _seedIdCounter;

    mapping(uint256 => CactusData) public cactusData;
    mapping(uint256 => SeedData) public seedData;

    // tokenId => approved specific partner tokenId
    mapping(uint256 => uint256) public breedingApprovalPartner;

    event MotherCactusMinted(address indexed owner);

    event Gen1CactusMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint32 generation,
        uint256 genomeData
    );

    event BreedingApprovalSet(
        uint256 indexed tokenId,
        uint256 indexed approvedPartnerTokenId
    );

    event BreedingApprovalCleared(uint256 indexed tokenId);

    event SeedInitiated(
        uint256 indexed seedId,
        address indexed owner,
        uint256 indexed seedParentId,
        uint256 pollenParentId,
        uint256 genomeData,
        uint32 generation,
        uint64 germinationReadyTime
    );

    event CactusGerminated(
        uint256 indexed tokenId,
        uint256 indexed seedId,
        uint256 indexed seedParentId,
        uint256 pollenParentId,
        uint256 genomeData,
        uint32 generation
    );

    error NotTokenOwner();
    error InvalidToken();
    error SameParentToken();
    error BreedingCooldownActive(uint256 tokenId, uint64 cooldownEndTime);
    error InvalidBreedingApproval(uint256 tokenId, uint256 partnerTokenId);
    error SeedNotFound();
    error SeedAlreadyGerminated();
    error GerminationNotReady(uint64 readyAt);
    error NotSeedOwner();
    error ZeroAddressRecipient();

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) AccessControl() {
        _baseTokenURI = baseURI;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BREEDER_ROLE, msg.sender);
    }

    function mintMotherCactus(
        address to,
        uint256 genomeData
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256 tokenId) {
        if (to == address(0)) revert ZeroAddressRecipient();

        tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        cactusData[tokenId] = CactusData({
            seedParentId: 0,
            pollenParentId: 0,
            generation: 0,
            cooldownIndex: 0,
            breedingCooldownEndTime: uint64(block.timestamp),
            genomeData: genomeData
        });

        _mint(to, tokenId);

        emit MotherCactusMinted(to);
    }

    function mintGen1Cactus(
        address to,
        uint256 genomeData
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256 tokenId) {
        if (to == address(0)) revert ZeroAddressRecipient();

        tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        cactusData[tokenId] = CactusData({
            seedParentId: 0,
            pollenParentId: 0,
            generation: 1,
            cooldownIndex: 0,
            breedingCooldownEndTime: uint64(block.timestamp),
            genomeData: genomeData
        });

        _mint(to, tokenId);

        emit Gen1CactusMinted(tokenId, to, 1, genomeData);
    }

    // ============================================================
    // Breeding approvals
    // ============================================================

    function approveBreedingWith(
        uint256 tokenId,
        uint256 partnerTokenId
    ) external {
        _isCactusExist(tokenId);
        _isCactusExist(partnerTokenId);

        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (tokenId == partnerTokenId) revert SameParentToken();

        breedingApprovalPartner[tokenId] = partnerTokenId;

        emit BreedingApprovalSet(tokenId, partnerTokenId);
    }

    function renounceBreedingApproval(uint256 tokenId) external {
        _isCactusExist(tokenId);

        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();

        delete breedingApprovalPartner[tokenId];

        emit BreedingApprovalCleared(tokenId);
    }

    function isBreedingApprovedWith(
        uint256 tokenId,
        uint256 partnerTokenId
    ) public view returns (bool) {
        return breedingApprovalPartner[tokenId] == partnerTokenId;
    }

    // Seed

    /// @notice Creates a seed record from two adult cacti.
    /// @dev This does NOT mint the final cactus NFT yet.
    ///      Expected flow:
    ///      1) owners approve breeding with specific partner token
    ///      2) backend / breeder role computes genome off-chain
    ///      3) breeder calls initiateSeed(...)
    ///      4) later owner calls germinate(seedId)
    function initiateSeed(
        uint256 seedParentId,
        uint256 pollenParentId,
        uint256 genomeData,
        uint64 germinationDelay
    ) external onlyRole(BREEDER_ROLE) returns (uint256 seedId) {
        _validateBreeding(seedParentId, pollenParentId);

        address seedOwner = ownerOf(seedParentId);

        uint32 seedGen = cactusData[seedParentId].generation;
        uint32 pollenGen = cactusData[pollenParentId].generation;
        uint32 childGeneration = seedGen>= pollenGen ? seedGen + 1 : pollenGen + 1;

        _triggerBreedingCooldown(seedParentId);
        _triggerBreedingCooldown(pollenParentId);

        seedId = _seedIdCounter;
        _seedIdCounter++;

        seedData[seedId] = SeedData({
            owner: seedOwner,
            seedParentId: seedParentId,
            pollenParentId: pollenParentId,
            generation: childGeneration,
            createdAt: uint64(block.timestamp),
            germinationReadyTime: uint64(block.timestamp + germinationDelay),
            genomeData: genomeData,
            germinated: false
        });

        // clear pair approvals after successful breeding
        delete breedingApprovalPartner[seedParentId];
        delete breedingApprovalPartner[pollenParentId];
        emit BreedingApprovalCleared(seedParentId);
        emit BreedingApprovalCleared(pollenParentId);

        emit SeedInitiated(
            seedId,
            seedOwner,
            seedParentId,
            pollenParentId,
            genomeData,
            childGeneration,
            uint64(block.timestamp + germinationDelay)
        );
    }

    /// @notice Final stage: mint the adult cactus NFT from matured seed
    function germinate(uint256 seedId) external returns (uint256 tokenId) {
        SeedData storage seed = seedData[seedId];

        if (seed.owner == address(0)) revert SeedNotFound();
        if (seed.germinated) revert SeedAlreadyGerminated();
        if (seed.owner != msg.sender) revert NotSeedOwner();
        if (block.timestamp < seed.germinationReadyTime) {
            revert GerminationNotReady(seed.germinationReadyTime);
        }

        tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        cactusData[tokenId] = CactusData({
            seedParentId: seed.seedParentId,
            pollenParentId: seed.pollenParentId,
            generation: seed.generation,
            cooldownIndex: 0,
            breedingCooldownEndTime: uint64(block.timestamp),
            genomeData: seed.genomeData
        });

        seed.germinated = true;

        _mint(seed.owner, tokenId);

        emit CactusGerminated(
            tokenId,
            seedId,
            seed.seedParentId,
            seed.pollenParentId,
            seed.genomeData,    
            seed.generation
        );
    }

    function canBreedWith(
        uint256 seedParentId,
        uint256 pollenParentId
    ) external view returns (bool) {
        if (_ownerOf(seedParentId) == address(0) || _ownerOf(pollenParentId) == address(0)) return false;
        if (seedParentId == pollenParentId) return false;

        if (block.timestamp < cactusData[seedParentId].breedingCooldownEndTime) {
            return false;
        }

        if (block.timestamp < cactusData[pollenParentId].breedingCooldownEndTime) {
            return false;
        }

        if (!_hasRequiredBreedingApproval(seedParentId, pollenParentId)) {
            return false;
        }

        return true;
    }

    function getCooldownDuration(
        uint256 tokenId
    ) external view returns (uint32) {
        return COOLDOWNS[cactusData[tokenId].cooldownIndex];
    }

    // Internal breeding logic

    function _validateBreeding(
        uint256 seedParentId,
        uint256 pollenParentId
    ) internal view {
        _isCactusExist(seedParentId);
        _isCactusExist(pollenParentId);

        if (seedParentId == pollenParentId) revert SameParentToken();

        if (
            block.timestamp <
            cactusData[seedParentId].breedingCooldownEndTime
        ) {
            revert BreedingCooldownActive(
                seedParentId,
                cactusData[seedParentId].breedingCooldownEndTime
            );
        }

        if (
            block.timestamp <
            cactusData[pollenParentId].breedingCooldownEndTime
        ) {
            revert BreedingCooldownActive(
                pollenParentId,
                cactusData[pollenParentId].breedingCooldownEndTime
            );
        }

        if (!_hasRequiredBreedingApproval(seedParentId, pollenParentId)) {
            revert InvalidBreedingApproval(seedParentId, pollenParentId);
        }

    }

    function _hasRequiredBreedingApproval(
        uint256 seedParentId,
        uint256 pollenParentId
    ) internal view returns (bool) {
        address seedOwner = ownerOf(seedParentId);
        address pollenOwner = ownerOf(pollenParentId);

        // if same owner, no explicit pair approval is needed
        if (seedOwner == pollenOwner) {
            return true;
        }

        // if different owners, both sides must approve the exact pair
        return
            isBreedingApprovedWith(seedParentId, pollenParentId) &&
            isBreedingApprovedWith(pollenParentId, seedParentId);
    }

    function _triggerBreedingCooldown(uint256 tokenId) internal {
        CactusData storage cactus = cactusData[tokenId];

        uint32 cooldown = COOLDOWNS[cactus.cooldownIndex];
        cactus.breedingCooldownEndTime = uint64(block.timestamp + cooldown);

        if (cactus.cooldownIndex < COOLDOWNS.length - 1) {
            cactus.cooldownIndex += 1;
        }
    }

    function _isCactusExist(uint256 tokenId) internal view {
        if (_ownerOf(tokenId) == address(0)) revert InvalidToken();
    }


    // Overrides

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = super._update(to, tokenId, auth);

        // clear breeding approval on transfer
        if (from != address(0) && from != to) {
            delete breedingApprovalPartner[tokenId];
            emit BreedingApprovalCleared(tokenId);
        }

        return from;
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