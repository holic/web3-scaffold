import React from "react";
import Image from "next/image";
import Editor from "../components/Editor";
import Header from "../components/Header";
import Footer from "../components/Footer";
import useDailyCanvasPrompt from "../hooks/use-daily-canvas-prompt";

export default function About() {
  return (
    <div className="flex justify-center w-full text-white">
      <Header title="The Scroll" className="fixed" />

      <div className="flex-wrap mt-[160px] min-w-[360px] max-w-[360px]">
        <div className="w-full flex justify-center">
          <Image
            src="/earf.png"
            height="200"
            width="200"
            alt="test"
            className=""
          ></Image>
        </div>
        <div className="mt-5 text-4xl text-center font-mono">
          The Scroll is a new place for you to draw and riff.
        </div>

        <div className="mt-[40px]">
          <div className="mt-10 text-4xl bg-black absolute font-mono z-50">
            Draw Trees!
          </div>
          <div className="w-full flex justify-end">
            <Image
              src="/tree.png"
              height="200"
              width="200"
              alt="test"
              className=""
            ></Image>
          </div>
        </div>
        <div className="mt-10 text-4xl text-center font-mono">
          Connect Tiles!
        </div>
        <div className="w-full flex justify-end mt-10">
          <Image
            src="/connect.png"
            height="200"
            width="400"
            alt="test"
            className="mt-10"
          ></Image>
        </div>
        <div className="mt-5 text-4xl text-center font-mono">
          Work with others to make something *Exquisite*
        </div>
        <div className="w-full flex justify-center mt-10">
          <Image
            src="/multi.png"
            height="529"
            width="800"
            alt="test"
            className="mt-10"
          ></Image>
        </div>
        <div className="mt-5 text-4xl text-center font-mono">
          Then Own Your Piece
        </div>
        <div className="mt-5 mb-8 flex justify-center">
          <Image
            src="/nft.png"
            height="140"
            width="150"
            alt="test"
            className="mt-10"
          ></Image>
        </div>
        <div className="mt-5 text-2xl text-center font-mono">
          (Share it, sell it, burn it)
        </div>
        <div className="mt-8 mb-8 flex justify-center">
          <Image
            src="/row.png"
            height="299"
            width="800"
            alt="test"
            className="mt-10"
          ></Image>
        </div>
        <div className="mt-5 text-4xl text-center font-mono font-bold	">
          Join!
        </div>
        <div className="mt-5 text-4xl text-center font-mono">
          We&apos;re starting this with friends and slowly opening it up.
          <br></br>
          <br></br>
          Hit us up on twitter for an invite.
        </div>
        <div className="w-full flex justify-center mt-10">
          <Image
            src="/bottom.png"
            height="303"
            width="800"
            alt="test"
            className="mt-10"
          ></Image>
        </div>
        <div className="h-[80px]"></div>
      </div>
    </div>
  );
}
