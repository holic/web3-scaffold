import { ExampleNFT, Transfer } from "../generated/ExampleNFT/ExampleNFT";
import { NFT } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  const contract = ExampleNFT.bind(event.address);

  const nft = new NFT(event.params.tokenId.toString());
  nft.owner = event.params.to;
  nft.tokenURI = contract.tokenURI(event.params.tokenId);
  nft.save();
}
