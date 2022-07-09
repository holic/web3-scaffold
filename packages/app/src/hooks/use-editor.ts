import { useState } from "react";

export type Pixels = readonly (readonly string[])[];

export enum Tool {
  BRUSH = "BRUSH",
  BUCKET = "BUCKET",
  EYEDROPPER = "EYEDROPPER",
}

export interface EditorProps {
  palette: string[];
}

const useEditor = ({ palette }: EditorProps) => {
  const [activeColorString, setActiveColorString] = useState(palette[0]);
  const [activeToolValue, setActiveToolValue] = useState(Tool.BRUSH);
  const [prevToolValue, setPrevToolValue] = useState(Tool.BRUSH);

  const setActiveTool = (tool: Tool) => {
    if (tool === activeToolValue) return;

    setActiveToolValue((currentActiveTool) => {
      setPrevToolValue(currentActiveTool);
      return tool;
    });
  };

  const setActiveColor = (hex: string) => {
    if (activeColorString === hex) return;

    setActiveColorString(hex);
  };

  const getActiveCursor = () => {
    switch (activeToolValue) {
      case Tool.BRUSH:
        return "url(/static/px-icon-pencil-cursor.svg) 0 11, pointer";
      case Tool.BUCKET:
        return "url(/static/px-icon-bucket-cursor.svg) 0 11, pointer";
      case Tool.EYEDROPPER:
        return "url(/static/px-icon-eyedropper-cursor.svg) 4 11, pointer";
    }
  };

  return {
    palette,
    prevTool: prevToolValue,
    activeTool: activeToolValue,
    activeColor: activeColorString,
    setActiveColor,
    setActiveTool,
    getActiveCursor,
  };
};

export default useEditor;
