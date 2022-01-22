import { ContractFactory } from "ethers";
import fs from "fs/promises";
import hre, { ethers, network } from "hardhat";

import { ExampleNFT__factory } from "../typechain-types";

const exists = (path: string) =>
  fs
    .access(path)
    .then(() => true)
    .catch(() => false);

const deployContract = async (factory: ContractFactory) => {
  const deploysPath = `${__dirname}/../deploys.json`;
  const deploys = (await exists(deploysPath))
    ? JSON.parse((await fs.readFile(deploysPath)).toString())
    : {};

  const deployedContracts = deploys[network.name] || {};
  const contractName = factory.constructor.name.replace(/__factory$/, "");

  if (deployedContracts[contractName] && !process.env.REDEPLOY_CONTRACTS) {
    throw new Error(
      `Contract ${contractName} has already been deployed to ${deployedContracts[contractName].address}. Use \`REDEPLOY_CONTRACTS=1\` to deploy a new contract and override the stored address.`
    );
  }

  const contract = await factory.deploy();
  // For some reason, `contract.address` is returning a different address
  // than the one deployed. Might be a Polygon issue?
  //
  // Instead, grab `contractAddress` from the deploy transaction receipt.
  const tx = await contract.deployTransaction.wait();
  console.log(
    `${contractName} deployed at ${tx.contractAddress} (block #${tx.blockNumber})`
  );

  await fs.writeFile(
    deploysPath,
    JSON.stringify(
      {
        ...deploys,
        [network.name]: {
          ...deployedContracts,
          [contractName]: {
            address: tx.contractAddress,
            blockNumber: tx.blockNumber,
          },
        },
      },
      null,
      2
    )
  );

  console.log("Waiting for 10 confirmations before verify…");
  await contract.deployTransaction.wait(10);

  console.log("Verifying contract…");
  await hre.run("verify:verify", {
    address: tx.contractAddress,
    constructorArguments: [],
  });
};

async function start() {
  const [deployer] = await ethers.getSigners();
  await deployContract(new ExampleNFT__factory(deployer));

  console.log("Done!");
}

start().catch((e: Error) => {
  console.error(e);
  process.exit(1);
});
