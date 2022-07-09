/* eslint-disable @typescript-eslint/ban-types */
import {
  CanvasDrawn,
  DailyCanvas,
  NewCanvasPrompt,
} from "../generated/DailyCanvas/DailyCanvas";
import { CanvasResponse, CanvasPrompt } from "../generated/schema";

export function handleNewCanvasDrawn(event: CanvasDrawn): void {
  const contract = DailyCanvas.bind(event.address);
  const canvas = new CanvasResponse(event.params.canvasId.toString());

  canvas.author = event.params.author;
  canvas.prompt = event.params.canvasPromptId.toString();
  canvas.tokenURI = contract.tokenURI(event.params.canvasId);
  canvas.svg = contract.getTileSVG(event.params.canvasId);
  canvas.riffCanvasId = event.params.canvasRiffId.toString();
  canvas.createdAt = event.block.timestamp.toI32();

  canvas.save();
}

export function handleNewCanvasPrompt(event: NewCanvasPrompt): void {
  const prompt = new CanvasPrompt(event.params.promptId.toString());

  prompt.width = event.params.width;
  prompt.height = event.params.height;
  prompt.author = event.params.author;
  prompt.palette = event.params.palette;
  prompt.createdAt = event.block.timestamp.toI32();

  prompt.save();
}
