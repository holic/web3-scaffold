import { Tool } from "../../hooks/use-editor";

export const getActiveToolStyle = (activeTool: Tool, tool: Tool) => {
  return activeTool === tool ? "opacity-100" : "opacity-40";
};
