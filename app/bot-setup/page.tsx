"use client";
import { SegmentProvider } from "@/context/segment";
import { SegmentNodeType } from "@/interfaces/segment";
import { decodeRobotConfig } from "@/utils/helper";
import { Edge, ReactFlowProvider } from "@xyflow/react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import ResizablePanelView from "./_components/resizable-pannel-view";
import { ROOT_ID } from "@/constants/shared";

export default function Home() {
  const searchParams = useSearchParams();
  const config = useMemo(() => {
    const encoded = searchParams.get("config");
    const defaultNode: SegmentNodeType[] = [
      {
        id: ROOT_ID,
        type: "segmentNode",
        position: {
          x: 100,
          y: 100,
        },
        data: {
          segment: {
            joint: {
              name: "Joint 1",
              type: "revolute",
              axis: [0, 1, 0],
              min: -Math.PI,
              max: Math.PI,
            },

            link: {
              name: "Link 1",
              length: 1,
              width: 0.25,
              depth: 0.25,

              childMount: {
                x: 0,
                y: 1,
                z: 0,
              },
            },
            value: 0,
          },
        },
      },
    ];
    if (!encoded) {
      return {
        nodes: defaultNode,
        edges: [],
      };
    }

    try {
      return decodeRobotConfig<{
        nodes: SegmentNodeType[];
        edges: Edge[];
      }>(encoded);
    } catch (error) {
      console.error("Invalid robot configuration:", error);
      return {
        nodes: defaultNode,
        edges: [],
      };
    }
  }, [searchParams]);
  return (
    <ReactFlowProvider>
      <SegmentProvider initialEdges={config.edges} initialNodes={config.nodes}>
        <div className="h-screen  ">
          <ResizablePanelView />
        </div>
      </SegmentProvider>
    </ReactFlowProvider>
  );
}
