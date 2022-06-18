import { CanvasDrawn, DailyCanvas } from "../generated/DailyCanvas/DailyCanvas";
import { Canvas } from "../generated/schema";

export function handleCanvasDrawn(event: CanvasDrawn): void {
  const contract = DailyCanvas.bind(event.address);

  const canvas = new Canvas(event.params.canvasId.toString());
  canvas.author = event.params.author;
  canvas.pixelFilled = event.params.pixelFilled;
  canvas.promptId = event.params.promptId;

  // canvas.tokenURI = contract.tokenURI(event.params.tokenId);
  // canvas.pixelFilled = event.params.pixelFilled;
  canvas.save();
}
