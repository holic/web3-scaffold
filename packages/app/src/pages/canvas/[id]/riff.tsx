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
    <div className="flex flex-col justify-center h-full w-full items-center text-white xs:pt-8 sm:pt-24 md:pt-40 lg:pt-40 xl:pt-40 2xl:pt-40 pt-24">
      <Header title="Daily Canvas"></Header>
      <div className="flex flex-col items-center pt-4">
        <div className="flex justify-center h-full">
          <Editor
            riffId={Number(riffId)}
            palette={canvasResponse.prompt.palette}
            height={Number(canvasResponse.prompt.height)}
            width={Number(canvasResponse.prompt.width)}
          />
        </div>
      </div>
      <Footer></Footer>
    </div>
  ) : (
    <div />
  );
};

export default RiffEditorScreen;
