import { expect } from "chai";
import { ethers } from "hardhat";

describe("ExampleNFT contract", () => {
  it("can mint", async () => {
    const [deployer] = await ethers.getSigners();
    const ContractFactory = await ethers.getContractFactory("ExampleNFT");
    const contract = await ContractFactory.deploy();

    const tx = await contract.mint();
    await tx.wait();
    expect(await contract.ownerOf(1)).to.equal(deployer.address);
  });
});
