"use client";
import IkCalculator from "@/components/ik-calculator";
import { SegmentFormData, SegmentNodeType } from "@/interfaces/segment";
import { getConnectedSegments } from "@/utils/bot";
import { decodeRobotConfig } from "@/utils/helper";
import { Edge } from "@xyflow/react";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";

const initialNodes: SegmentNodeType[] = [
  {
    id: "root",
    type: "segmentNode",
    position: {
      x: -40.146644818813485,
      y: 94.27972878290552,
    },
    data: {
      segment: {
        joint: {
          name: "Joint 1",
          type: "revolute",
          axis: [0, 1, 0],
          min: 0,
          max: 3.141592653589793,
        },
        link: {
          name: "Link 1",
          length: 0.25,
          width: 0.25,
          depth: 0.25,
          childMount: {
            x: 0,
            y: 0.25,
            z: 0,
          },
        },
        value: 1.5707963267948966,
      },
    },
    measured: {
      width: 300,
      height: 627,
    },
    selected: false,
    dragging: false,
  },
  {
    id: "14692967-3476-4932-9370-ca14d6ced25f",
    type: "segmentNode",
    position: {
      x: 331.6930981694076,
      y: 93.18155667082253,
    },
    data: {
      segment: {
        joint: {
          name: "Joint 2",
          type: "revolute",
          axis: [0, 0, 1],
          min: -1.5707963267948966,
          max: 1.5707963267948966,
        },
        link: {
          name: "Link 2",
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
    measured: {
      width: 300,
      height: 627,
    },
    selected: false,
    dragging: false,
  },
  {
    id: "cf125f46-63c1-40a2-a7c9-ac262c048205",
    type: "segmentNode",
    position: {
      x: 676.1356634057956,
      y: 98.32518702498315,
    },
    data: {
      segment: {
        joint: {
          name: "Joint 3",
          type: "revolute",
          axis: [0, 0, 1],
          min: -1.5707963267948966,
          max: 1.5707963267948966,
        },
        link: {
          name: "Link 3",
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
    measured: {
      width: 300,
      height: 627,
    },
    selected: false,
    dragging: false,
  },
  {
    id: "c925c688-f698-4e74-ae16-5f094a0cfa91",
    type: "segmentNode",
    position: {
      x: 1019.9999999999999,
      y: 102,
    },
    data: {
      segment: {
        joint: {
          name: "Joint 4",
          type: "revolute",
          axis: [0, 0, 1],
          min: -1.5707963267948966,
          max: 1.5707963267948966,
        },
        link: {
          name: "Link 4",
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
    measured: {
      width: 300,
      height: 627,
    },
    selected: false,
    dragging: false,
  },
  {
    id: "071ebdb2-edac-454e-888a-132282000b78",
    type: "segmentNode",
    position: {
      x: 1409.738427784463,
      y: 94.39335872257132,
    },
    data: {
      segment: {
        joint: {
          name: "Joint 5",
          type: "revolute",
          axis: [0, 0, 1],
          min: -1.5707963267948966,
          max: 1.5707963267948966,
        },
        link: {
          name: "Link 5",
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
    measured: {
      width: 300,
      height: 627,
    },
    selected: true,
    dragging: false,
  },
];
const initialEdges: Edge[] = [
  {
    source: "root",
    target: "14692967-3476-4932-9370-ca14d6ced25f",
    type: "step",
    animated: true,
    style: {
      strokeWidth: 4,
    },
    markerEnd: {
      type: "arrowclosed",
      width: 10,
      height: 10,
      color: "#64748b",
    },
    id: "xy-edge__root-14692967-3476-4932-9370-ca14d6ced25f",
  },
  {
    source: "14692967-3476-4932-9370-ca14d6ced25f",
    target: "cf125f46-63c1-40a2-a7c9-ac262c048205",
    type: "step",
    animated: true,
    style: {
      strokeWidth: 4,
    },
    markerEnd: {
      type: "arrowclosed",
      width: 10,
      height: 10,
      color: "#64748b",
    },
    id: "xy-edge__14692967-3476-4932-9370-ca14d6ced25f-cf125f46-63c1-40a2-a7c9-ac262c048205",
  },
  {
    source: "cf125f46-63c1-40a2-a7c9-ac262c048205",
    target: "c925c688-f698-4e74-ae16-5f094a0cfa91",
    type: "step",
    animated: true,
    style: {
      strokeWidth: 4,
    },
    markerEnd: {
      type: "arrowclosed",
      width: 10,
      height: 10,
      color: "#64748b",
    },
    id: "xy-edge__cf125f46-63c1-40a2-a7c9-ac262c048205-c925c688-f698-4e74-ae16-5f094a0cfa91",
  },
  {
    source: "c925c688-f698-4e74-ae16-5f094a0cfa91",
    target: "071ebdb2-edac-454e-888a-132282000b78",
    type: "step",
    animated: true,
    style: {
      strokeWidth: 4,
    },
    markerEnd: {
      type: "arrowclosed",
      width: 10,
      height: 10,
      color: "#64748b",
    },
    id: "xy-edge__c925c688-f698-4e74-ae16-5f094a0cfa91-071ebdb2-edac-454e-888a-132282000b78",
  },
];
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
      console.log(items);

      return getConnectedSegments(items.nodes, items.edges, "root");
    } catch (error) {
      console.error("Invalid robot configuration:", error);
      return [] as SegmentFormData[];
    }
  }, [searchParams]);
  return <IkCalculator segments={list} />;
}
