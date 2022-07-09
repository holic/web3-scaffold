import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import Editor from "../../../components/Editor";
import Header from "../../../components/Header";

import useCanvasResponse from "../../../hooks/use-canvas-response";

const RiffEditorScreen: NextPage = () => {
  const router = useRouter();
  const { id: riffId } = router.query;

  // @ts-ignore
  const [{ data: canvasResponse, fetching, error }] = useCanvasResponse({
    canvasId: String(riffId),
  });

  useEffect(() => {
    if (!fetching && (!canvasResponse || error)) {
      toast(`Canvas #${riffId} not found. Why not draw one instead?`);
      router.push("/editor");
    }
  }, [fetching, canvasResponse, error, riffId, router]);

  return canvasResponse ? (
    <div className="flex flex-col h-screen w-full">
      <Header title="Daily Canvas"></Header>
      <div className="flex-grow flex flex-col items-center pt-4">
        <div className="flex justify-center h-full">
          <Editor
            riffId={Number(riffId)}
            palette={canvasResponse.prompt.palette}
            height={Number(canvasResponse.prompt.height)}
            width={Number(canvasResponse.prompt.width)}
          />
        </div>
      </div>
    </div>
  ) : (
    <div />
  );
};

export default RiffEditorScreen;
