import { ContractFactory } from "ethers";
import fs from "fs/promises";
import hre, { ethers, network } from "hardhat";

import { ExampleNFT, ExampleNFT__factory } from "../typechain-types";

const exists = (path: string) =>
  fs
    .access(path)
    .then(() => true)
    .catch(() => false);

// TODO: add type for deploys JSON

const contractsToRedeploy = process.env.REDEPLOY_CONTRACTS?.split(",") || [];

const deployContract = async <T extends ContractFactory>(
  factory: T,
  args: Parameters<T["deploy"]>
) => {
  const deploysPath = `${__dirname}/../deploys.json`;
  const deploys = (await exists(deploysPath))
    ? JSON.parse((await fs.readFile(deploysPath)).toString())
    : {};

  const deployedContracts = deploys[network.name] || {};
  const contractName = factory.constructor.name.replace(/__factory$/, "");

  if (
    deployedContracts[contractName] &&
    !contractsToRedeploy.includes(contractName)
  ) {
    const { address } = deployedContracts[contractName];
    console.log(
      `Contract ${contractName} has already been deployed to ${address}. Use \`REDEPLOY_CONTRACTS=${contractName}\` to deploy a new contract and override the stored address.`
    );
    return factory.attach(address);
  }

  const contract = await factory.deploy(...args);
  // For some reason, `contract.address` is returning a different address
  // than the one deployed. Might be a Polygon issue?
  //
  // Instead, grab `contractAddress` from the deploy transaction receipt.
  const tx = await contract.deployTransaction.wait();
  console.log(
    `${contractName} deployed at ${tx.contractAddress} (block #${
      tx.blockNumber
    }), cost: ${ethers.utils.formatUnits(
      tx.gasUsed.mul(tx.effectiveGasPrice),
      18
    )}`
  );

  // TODO: consider storing args? and use that to determine if we should redeploy?

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

  return factory.attach(tx.contractAddress);
};

const start = async () => {
  const [deployer] = await ethers.getSigners();
  console.log(`Starting deploy on ${network.name} from ${deployer.address}`);

  // TODO: figure out how to get TS to infer contract type so we don't have to cast
  const exampleNFT = (await deployContract(
    new ExampleNFT__factory(deployer),
    []
  )) as ExampleNFT;

  console.log("Done!");
};

start().catch((e: Error) => {
  console.error(e);
  process.exit(1);
});
