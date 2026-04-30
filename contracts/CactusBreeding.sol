// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import "./Cactus721.sol";
import "./Seed721.sol";

contract CactusBreeding is AccessControl {
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");
    bytes32 public constant BACKEND_SIGNER_ROLE =
        keccak256("BACKEND_SIGNER_ROLE");

    Cactus721 public immutable cactus;
    Seed721 public immutable seeds;

    uint256 public breedingFee;
    uint16 public germinationChanceBps = 7_000;
    address payable public feeRecipient;

    mapping(uint256 tokenId => address owner) public openForBreedingOwner;
    mapping(address account => uint256) public breedingNonces;

    struct BreedRequest {
        address breeder;
        uint256 parentA;
        uint256 parentB;
        uint256 childGenome;
        uint32 childGeneration;
        uint256 deadline;
    }

    event CactusOpenedForBreeding(
        address indexed owner,
        uint256 indexed tokenId
    );
    event CactusClosedForBreeding(
        address indexed owner,
        uint256 indexed tokenId
    );
    event Breeded(
        address indexed breeder,
        uint256 indexed parentA,
        uint256 indexed parentB,
        uint256 seedId,
        uint256 partnerSeedId,
        uint32 generation,
        uint256 genome,
        uint16 germinationChanceBps,
        uint256 feePaid
    );
    event BreedingFeeSet(uint256 fee);
    event GerminationChanceSet(uint16 germinationChanceBps);
    event FeeRecipientSet(address indexed recipient);

    error SameParentToken();
    error NotApprovedForParent(uint256 tokenId, address operator);
    error InsufficientFee(uint256 expected, uint256 actual);
    error FeeTransferFailed();
    error ZeroAddressRecipient();
    error SignatureExpired(uint256 deadline);
    error InvalidBackendSignature();
    error InvalidGerminationChance();

    constructor(
        Cactus721 cactus_,
        Seed721 seeds_,
        uint256 breedingFee_,
        address payable feeRecipient_
    ) {
        if (feeRecipient_ == address(0)) revert ZeroAddressRecipient();

        cactus = cactus_;
        seeds = seeds_;
        breedingFee = breedingFee_;
        feeRecipient = feeRecipient_;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FEE_MANAGER_ROLE, msg.sender);
        _grantRole(BACKEND_SIGNER_ROLE, msg.sender);
    }

    function openForBreeding(uint256 tokenId) external {
        if (cactus.ownerOf(tokenId) != msg.sender) {
            revert NotApprovedForParent(tokenId, msg.sender);
        }

        openForBreedingOwner[tokenId] = msg.sender;

        emit CactusOpenedForBreeding(msg.sender, tokenId);
    }

    function closeForBreeding(uint256 tokenId) external {
        if (cactus.ownerOf(tokenId) != msg.sender) {
            revert NotApprovedForParent(tokenId, msg.sender);
        }

        delete openForBreedingOwner[tokenId];

        emit CactusClosedForBreeding(msg.sender, tokenId);
    }

    function breedWithSignature(
        uint256 parentA,
        uint256 parentB,
        uint256 childGenome,
        uint256 deadline,
        bytes calldata backendSignature
    ) external payable returns (uint256 seedId, uint256 partnerSeedId) {
        BreedRequest memory request = BreedRequest({
            breeder: msg.sender,
            parentA: parentA,
            parentB: parentB,
            childGenome: childGenome,
            childGeneration: _childGeneration(parentA, parentB),
            deadline: deadline
        });

        if (request.parentA == request.parentB) revert SameParentToken();
        if (msg.value < breedingFee) {
            revert InsufficientFee(breedingFee, msg.value);
        }
        if (block.timestamp > request.deadline) {
            revert SignatureExpired(request.deadline);
        }

        _requireApprovedForParent(request.parentA, request.breeder);
        _requireApprovedOrOpenForPartner(request.parentB, request.breeder);
        _requireValidBackendSignature(
            _breedDigest(request, breedingNonces[request.breeder]++),
            backendSignature
        );

        (seedId, partnerSeedId) = _mintSeeds(request);

        _payFee();

        emit Breeded(
            request.breeder,
            request.parentA,
            request.parentB,
            seedId,
            partnerSeedId,
            request.childGeneration,
            request.childGenome,
            germinationChanceBps,
            msg.value
        );
    }

    function setBreedingFee(
        uint256 breedingFee_
    ) external onlyRole(FEE_MANAGER_ROLE) {
        breedingFee = breedingFee_;

        emit BreedingFeeSet(breedingFee_);
    }

    function setGerminationChanceBps(
        uint16 germinationChanceBps_
    ) external onlyRole(FEE_MANAGER_ROLE) {
        if (germinationChanceBps_ > 10_000) revert InvalidGerminationChance();

        germinationChanceBps = germinationChanceBps_;

        emit GerminationChanceSet(germinationChanceBps_);
    }

    function setFeeRecipient(
        address payable feeRecipient_
    ) external onlyRole(FEE_MANAGER_ROLE) {
        if (feeRecipient_ == address(0)) revert ZeroAddressRecipient();

        feeRecipient = feeRecipient_;

        emit FeeRecipientSet(feeRecipient_);
    }

    function _payFee() internal {
        if (msg.value > 0) {
            (bool sent, ) = feeRecipient.call{value: msg.value}("");
            if (!sent) revert FeeTransferFailed();
        }
    }

    function _mintSeeds(
        BreedRequest memory request
    ) internal returns (uint256 seedId, uint256 partnerSeedId) {
        seedId = _mintSeedTo(cactus.ownerOf(request.parentA), request);
        partnerSeedId = _mintSeedTo(cactus.ownerOf(request.parentB), request);
    }

    function _mintSeedTo(
        address owner,
        BreedRequest memory request
    ) internal returns (uint256) {
        return
            seeds.mint(
                owner,
                request.childGenome,
                request.parentA,
                request.parentB,
                request.childGeneration,
                germinationChanceBps
            );
    }

    function _childGeneration(
        uint256 parentA,
        uint256 parentB
    ) internal view returns (uint32) {
        return
            _nextGeneration(
                cactus.generationOf(parentA),
                cactus.generationOf(parentB)
            );
    }

    function _breedDigest(
        BreedRequest memory request,
        uint256 nonce
    ) internal view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    block.chainid,
                    address(this),
                    request.breeder,
                    request.parentA,
                    request.parentB,
                    request.childGenome,
                    nonce,
                    request.deadline
                )
            );
    }

    function _requireApprovedForParent(
        uint256 tokenId,
        address operator
    ) internal view {
        address owner = cactus.ownerOf(tokenId);

        if (
            owner != operator &&
            cactus.getApproved(tokenId) != operator &&
            !cactus.isApprovedForAll(owner, operator)
        ) {
            revert NotApprovedForParent(tokenId, operator);
        }
    }

    function _requireApprovedOrOpenForPartner(
        uint256 tokenId,
        address operator
    ) internal view {
        if (isOpenForBreeding(tokenId)) {
            return;
        }

        _requireApprovedForParent(tokenId, operator);
    }

    function isOpenForBreeding(uint256 tokenId) public view returns (bool) {
        address listedOwner = openForBreedingOwner[tokenId];

        return listedOwner != address(0) && cactus.ownerOf(tokenId) == listedOwner;
    }

    function _requireValidBackendSignature(
        bytes32 digest,
        bytes calldata signature
    ) internal view {
        address signer = ECDSA.recover(
            MessageHashUtils.toEthSignedMessageHash(digest),
            signature
        );
        if (!hasRole(BACKEND_SIGNER_ROLE, signer)) {
            revert InvalidBackendSignature();
        }
    }

    function _nextGeneration(
        uint32 parentAGeneration,
        uint32 parentBGeneration
    ) internal pure returns (uint32) {
        return
            parentAGeneration >= parentBGeneration
                ? parentAGeneration + 1
                : parentBGeneration + 1;
    }
}
