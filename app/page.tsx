"use client";
import IkCalculator from "@/components/ik-calculator";
import { SegmentFormData, SegmentNodeType } from "@/interfaces/segment";
import { getConnectedSegments } from "@/utils/bot";
import { decodeRobotConfig } from "@/utils/helper";
import { Edge } from "@xyflow/react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function Home() {
  const searchParams = useSearchParams();

  const list = useMemo(() => {
    const encoded = searchParams.get("config");

    if (!encoded) {
      return [] as SegmentFormData[];
    }

    try {
      const items = decodeRobotConfig<{
        nodes: SegmentNodeType[];
        edges: Edge[];
      }>(encoded);

      return getConnectedSegments(items.nodes, items.edges, "root");
    } catch (error) {
      console.error("Invalid robot configuration:", error);
      return [] as SegmentFormData[];
    }
  }, [searchParams]);
  return <IkCalculator segments={list} />;
}
