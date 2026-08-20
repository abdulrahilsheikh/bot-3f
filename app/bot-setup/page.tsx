"use client";
import BotComponent from "@/components/bot-generator";
import BotWorkFlow from "@/components/bot-workflow";
import ThreeJsCanvas from "@/components/three-js-canvas";
import { SegmentProvider } from "@/context/segment";
import { ReactFlowProvider } from "@xyflow/react";

export default function Home() {
  return (
    <ReactFlowProvider>
      <SegmentProvider>
        <div className="h-screen grid grid-cols-2 font-sans ">
          <BotWorkFlow />
          <ThreeJsCanvas>
            <BotComponent />
          </ThreeJsCanvas>
        </div>
      </SegmentProvider>
    </ReactFlowProvider>
  );
}
