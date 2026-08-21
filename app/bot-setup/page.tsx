"use client";
import { SegmentProvider } from "@/context/segment";
import { ReactFlowProvider } from "@xyflow/react";
import ResizablePanelView from "./_components/resizable-pannel-view";

export default function Home() {
  return (
    <ReactFlowProvider>
      <SegmentProvider>
        <div className="h-screen  ">
          <ResizablePanelView />
        </div>
      </SegmentProvider>
    </ReactFlowProvider>
  );
}
