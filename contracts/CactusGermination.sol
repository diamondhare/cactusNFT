// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import "./Cactus721.sol";
import "./MockVRF.sol";
import "./Seed721.sol";

contract CactusGermination is AccessControl {
    bytes32 public constant VRF_MANAGER_ROLE = keccak256("VRF_MANAGER_ROLE");
    bytes32 public constant BACKEND_SIGNER_ROLE =
        keccak256("BACKEND_SIGNER_ROLE");

    Cactus721 public immutable cactus;
    Seed721 public immutable seeds;
    MockVRF public vrf;
    mapping(address account => uint256) public germinationNonces;

    event Germinated(
        address indexed owner,
        uint256 indexed seedId,
        uint256 indexed cactusId,
        uint256 requestId,
        uint256 randomWord
    );
    event GerminationFailed(
        address indexed owner,
        uint256 indexed seedId,
        uint256 requestId,
        uint256 randomWord
    );
    event VrfSet(address indexed vrf);

    error NotApprovedForSeed(uint256 seedId, address operator);
    error ZeroAddressVrf();
    error SignatureExpired(uint256 deadline);
    error InvalidBackendSignature();

    constructor(Cactus721 cactus_, Seed721 seeds_, MockVRF vrf_) {
        if (address(vrf_) == address(0)) revert ZeroAddressVrf();

        cactus = cactus_;
        seeds = seeds_;
        vrf = vrf_;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VRF_MANAGER_ROLE, msg.sender);
        _grantRole(BACKEND_SIGNER_ROLE, msg.sender);
    }

    function germinateWithSignature(
        uint256 seedId,
        uint256 deadline,
        bytes calldata backendSignature
    ) external returns (uint256 cactusId) {
        if (block.timestamp > deadline) revert SignatureExpired(deadline);

        address owner = seeds.ownerOf(seedId);
        if (
            owner != msg.sender &&
            seeds.getApproved(seedId) != msg.sender &&
            !seeds.isApprovedForAll(owner, msg.sender)
        ) {
            revert NotApprovedForSeed(seedId, msg.sender);
        }

        uint256 nonce = germinationNonces[msg.sender]++;
        _requireValidBackendSignature(
            keccak256(
                abi.encode(
                    block.chainid,
                    address(this),
                    msg.sender,
                    seedId,
                    nonce,
                    deadline
                )
            ),
            backendSignature
        );

        Seed721.SeedData memory seed = seeds.seedData(seedId);
        uint256 requestId = vrf.requestRandomWord();
        uint256 randomWord = vrf.randomWord(requestId);
        bool success = (randomWord % 10_000) < seed.germinationChanceBps;

        seeds.burn(seedId);

        if (!success) {
            emit GerminationFailed(owner, seedId, requestId, randomWord);
            return 0;
        }

        cactusId = cactus.mintFromSeed(
            owner,
            seed.genome,
            seed.parentA,
            seed.parentB
        );

        emit Germinated(owner, seedId, cactusId, requestId, randomWord);
    }

    function setVrf(MockVRF vrf_) external onlyRole(VRF_MANAGER_ROLE) {
        if (address(vrf_) == address(0)) revert ZeroAddressVrf();

        vrf = vrf_;

        emit VrfSet(address(vrf_));
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
}
