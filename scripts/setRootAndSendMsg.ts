import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { ethers } from "hardhat";
import { Options } from "@layerzerolabs/lz-v2-utilities"
import { deployments } from "hardhat";
import fs from "fs";

const LEAVES_COUNT = 10;

const generateRandomLeaf = (tokenAddr: string) => {
  const randomWallet = ethers.Wallet.createRandom();
  const randomAmount = Math.floor(Math.random() * 1000);
  const amountInEth = ethers.utils.parseEther(randomAmount.toString());
  return [ randomWallet.address, tokenAddr, amountInEth ];
}

const generateTree = (user: string, tokenAddr: string, amount: ethers.BigNumber) => {
  const leaves: any[] = [];
  for (let i = 0; i < LEAVES_COUNT; i++) {
    const leaf = generateRandomLeaf(tokenAddr);
    leaves.push(leaf);
  }
  const aggregated = [...leaves, [user, tokenAddr, amount]];
  const tree = StandardMerkleTree.of(aggregated, ["address", "address", "uint256"]);
  fs.writeFileSync("./tree.json", JSON.stringify(tree.dump()));
  return tree;
}

const main = async () => {

  const merkleTreeAddr = (await deployments.get("MerkleTreePoC")).address;
  const merkleTreePoC = await ethers.getContractAt("MerkleTreePoC", merkleTreeAddr);
  const crosschainMerkleAddr = "0xeC48B7B60111caFE3Fb25D3BfFEf56c60700220E";
  const crosschainMerkle = await ethers.getContractAt("CrosschainMerkle", crosschainMerkleAddr);

  const target = "0x5B88F598162aBD11E8DCd802C42F2c6D8C7b1e96";
  const remoteTokenAddress = "0xF36e6E18f7f491B03E8A7A47D6A69B3AB61F53aE";
  const amount = ethers.utils.parseEther("4129889");
  if (!fs.existsSync("./tree.json")) {
    generateTree(target, remoteTokenAddress, amount);
  }
  const tree = StandardMerkleTree.load(JSON.parse(fs.readFileSync("./tree.json").toString()));
  const currentRoot = await merkleTreePoC.root();
  if (currentRoot !== tree.root) {
    const setRootTx = await merkleTreePoC.setRoot(tree.root);
    const setRootReceipt = await setRootTx.wait();
    // transaction hash log 
    console.log(`setRoot transaction hash: ${setRootReceipt.transactionHash}`);
  } else {
    console.log("Root match!")
  }

  let proof;
  for (const [i, v] of tree.entries()) {
    if (v[0] === target)
      proof = tree.getProof(i);
  }
  // console.log("Wut?");
  console.log("Merkle proof is:", await merkleTreePoC.verifyJustView(target, remoteTokenAddress, amount, proof));
  console.log("Check peer set", await crosschainMerkle.peers(40161));
  const GAS_LIMIT = 1000000; // Gas limit for the executor
  const MSG_VALUE = 0; // msg.value for the lzReceive() function on destination in wei
  const _options = Options.newOptions().addExecutorLzReceiveOption(GAS_LIMIT, MSG_VALUE);
  const opt = _options.toHex();
  console.log(opt);
  const quote = await crosschainMerkle.quote(
    40161,
    target,
    remoteTokenAddress,
    amount,
    opt,
    false
  );
  const msgValue = quote[0];
  const gasToPay = msgValue.mul(11).div(10);
  const payInEth = ethers.utils.formatEther(gasToPay);
  console.log(`Gas to pay: ${payInEth}`);

  const verifyTx = await merkleTreePoC.verify(
    40161,
    target,
    remoteTokenAddress,
    amount,
    proof,
    opt,
    { value: gasToPay, gasLimit: 1000000 }
  );
  const verifyReceipt = await verifyTx.wait();
  // transaction hash log
  console.log(`verify transaction hash: ${verifyReceipt.transactionHash}`);
}

main().then();