import { CanvasDrawn, DailyCanvas } from "../generated/DailyCanvas/DailyCanvas";
import { Daily } from "../generated/schema";

export function handleCanvasDrawn(event: CanvasDrawn): void {
  const contract = DailyCanvas.bind(event.address);

  // temporary rename to avoid Canvas/plural collision
  const canvas = new Daily(event.params.canvasId.toString());
  canvas.id = event.params.canvasId.toString();
  canvas.author = event.params.author;
  canvas.promptId = event.params.promptId;

  canvas.tokenURI = contract.tokenURI(event.params.canvasId);
  canvas.svg = contract.getTileSVG(event.params.canvasId);
  canvas.riffCanvasId = event.params.riffCanvasId.toString();
  canvas.save();
}
