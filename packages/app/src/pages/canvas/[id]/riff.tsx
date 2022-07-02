import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import Editor from "../../../components/Editor";
import Header from "../../../components/Header";

import useDailyCanvas from "../../../hooks/use-daily-canvas";

const RiffEditorScreen: NextPage = () => {
  const router = useRouter();
  const { id: riffId } = router.query;

  // @ts-ignore
  const [{ data, fetching, error }] = useDailyCanvas({ id: String(riffId) });

  useEffect(() => {
    if (!fetching && (!data || error)) {
      toast(`Canvas #${riffId} not found. Why not draw one instead?`);
      router.push("/editor");
    }
  }, [fetching, data, error, riffId, router]);

  return (
    <div className="flex flex-col h-screen w-full">
      <Header title="Daily Canvas"></Header>
      <div className="flex-grow flex flex-col items-center pt-4">
        <div className="flex justify-center h-full">
          <Editor riffId={Number(riffId)} />
        </div>
      </div>
    </div>
  );
};

export default RiffEditorScreen;
