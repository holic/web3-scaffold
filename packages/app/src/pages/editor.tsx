import type { NextPage } from "next";
import React from "react";
import Editor from "../components/Editor";
import Header from "../components/Header";

import useDailyCanvasPrompt from "../hooks/use-daily-canvas-prompt";

const EditorScreen: NextPage = () => {
  const [canvasPromptResult] = useDailyCanvasPrompt();

  const { data: canvasPrompt, fetching } = canvasPromptResult;

  return canvasPrompt && !fetching ? (
    <div className="flex flex-col h-screen w-full justify-center">
      <Header title="Daily Canvas"></Header>
      <div className="flex-grow flex flex-col items-center pt-4">
        <div className="flex justify-center h-full">
          <Editor
            palette={canvasPrompt.palette}
            height={Number(canvasPrompt.height)}
            width={Number(canvasPrompt.width)}
          />
        </div>
      </div>
    </div>
  ) : (
    <div />
  );
};

export default EditorScreen;
