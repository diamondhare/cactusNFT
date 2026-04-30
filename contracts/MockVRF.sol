// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract MockVRF {
    uint256 private _nextRequestId = 1;

    event RandomWordRequested(
        uint256 indexed requestId,
        address indexed requester
    );

    function requestRandomWord() external returns (uint256 requestId) {
        requestId = _nextRequestId++;

        emit RandomWordRequested(requestId, msg.sender);
    }

    function randomWord(uint256 requestId) external view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.prevrandao,
                        blockhash(block.number - 1),
                        requestId,
                        address(this)
                    )
                )
            );
    }
}
