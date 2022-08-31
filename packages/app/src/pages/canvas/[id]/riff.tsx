import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import Editor from "../../../components/Editor";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

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
    <div className="flex flex-col h-full w-full items-center">
      <Header title="The Scroll" className="pb-4"></Header>

      <div className="flex-1" />
      <div className="flex-1 ">
        <div className="flex flex-col items-center">
          <Editor
            riffId={Number(riffId)}
            palette={canvasResponse.prompt.palette}
            height={Number(canvasResponse.prompt.height)}
            width={Number(canvasResponse.prompt.width)}
          />
        </div>
      </div>
      <div className="flex-[2]" />
      <Footer></Footer>
    </div>
  ) : (
    <div />
  );
};

export default RiffEditorScreen;
