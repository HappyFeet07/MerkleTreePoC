// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { CrosschainMerkle } from "./CrosschainMerkle.sol";
import { MessagingReceipt } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppSender.sol";

contract MerkleTreePoC {

  bytes32 public root;
  CrosschainMerkle public crosschainMerkle;

  constructor(address _crosschainMerkle) {
    crosschainMerkle = CrosschainMerkle(_crosschainMerkle);
  }

  function setRoot(bytes32 newRoot) public {
    root = newRoot;
  }

  function verifyJustView(
    address who,
    address token,
    uint256 amount,
    bytes32[] memory proof
  ) public view returns (bool) {
    bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(who, token, amount))));
    return MerkleProof.verify(proof, root, leaf);
  }

  function verify(
    uint32 destEid,
    address who,
    address token,
    uint256 amount,
    bytes32[] memory proof,
    bytes memory options
  ) public payable returns (MessagingReceipt memory receipt) {

    bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(who, token, amount))));
    require(MerkleProof.verify(proof, root, leaf), "Invalid proof");
    receipt = crosschainMerkle.send{value: msg.value}(destEid, who, token, amount, options);
  }

  receive() external payable {}
}