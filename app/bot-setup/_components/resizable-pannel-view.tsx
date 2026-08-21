import React from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import BotWorkFlow from "@/components/bot-workflow";
import ThreeJsCanvas from "@/components/three-js-canvas";
import BotComponent from "@/components/bot-generator";

const ResizablePanelView = () => {
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className=" w-full rounded-lg border"
    >
      <ResizablePanel defaultSize="50%" minSize={"30%"}>
        <BotWorkFlow />
      </ResizablePanel>
      <ResizableHandle withHandle className="w-2" />
      <ResizablePanel defaultSize="50%" minSize={"30%"}>
        <ThreeJsCanvas>
          <BotComponent />
        </ThreeJsCanvas>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ResizablePanelView;
