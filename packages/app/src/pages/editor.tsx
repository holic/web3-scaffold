import type { NextPage } from "next";
import React from "react";
import Editor from "../components/Editor";
import Header from "../components/Header";

const EditorScreen: NextPage = () => {
  return (
    <div className="flex flex-col h-screen w-full">
      <Header title="Daily Canvas"></Header>
      <div className="flex-grow flex flex-col items-center pt-4">
        <div className="flex justify-center h-full">
          <Editor />
        </div>
      </div>
    </div>
  );
};

export default EditorScreen;
