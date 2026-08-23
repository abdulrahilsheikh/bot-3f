"use client";
import IkCalculator from "@/components/ik-calculator";
import { ROOT_ID } from "@/constants/shared";
import { SegmentFormData, SegmentNodeType } from "@/interfaces/segment";
import { getConnectedSegments } from "@/utils/bot";
import { decodeRobotConfig } from "@/utils/helper";
import { Edge } from "@xyflow/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function Home() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("config");
  const router = useRouter();
  const list = useMemo(() => {
    if (!encoded) {
      return [] as SegmentFormData[];
    }

    try {
      const items = decodeRobotConfig<{
        nodes: SegmentNodeType[];
        edges: Edge[];
      }>(encoded);

      return getConnectedSegments(items.nodes, items.edges, ROOT_ID);
    } catch (error) {
      console.error("Invalid robot configuration:", error);
      return [] as SegmentFormData[];
    }
  }, [encoded]);

  useEffect(() => {
    if (!encoded) router.replace(`/bot-setup`);
  }, [encoded, router]);

  return !!encoded && <IkCalculator segments={list} />;
}
