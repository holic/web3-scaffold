import { DailyCanvas, Transfer } from "../generated/DailyCanvas/DailyCanvas";
import { Canvas } from "../generated/schema";

export function handleCanvasDrawn(event: Transfer): void {
  const contract = DailyCanvas.bind(event.address);

  const canvas = new Canvas(event.params.tokenId.toString());
  canvas.owner = event.params.to;
  canvas.tokenURI = contract.tokenURI(event.params.tokenId);
  // canvas.pixelFilled = event.params.pixelFilled;
  canvas.save();
}
