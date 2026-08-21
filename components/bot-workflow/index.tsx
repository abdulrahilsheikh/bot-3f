"use client";

import { useSegments } from "@/context/segment";
import {
  addEdge,
  Background,
  Connection,
  Controls,
  MarkerType,
  NodeTypes,
  Panel,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import SegmentNode from "../flow-node";
import { useState } from "react";

const nodeTypes: NodeTypes = {
  segmentNode: SegmentNode,
};

const BotWorkFlow = () => {
  const [showImport, setShowImport] = useState(false);

  const [json, setJson] = useState("");

  const [error, setError] = useState("");
  const {
    nodes,
    edges,
    setEdges,
    onEdgesChange,
    onNodesChange,
    addSegment,
    handleCopyJson,
    setNodes,
  } = useSegments();

  function onConnect(connection: Connection) {
    setEdges((current) =>
      addEdge(
        {
          ...connection,
          type: "step",
          animated: true,
          style: {
            strokeWidth: 4,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 10,
            height: 10,
            color: "#64748b",
          },
        },
        current,
      ),
    );
  }
  function handleAddSegment() {
    addSegment({
      joint: {
        name: "Joint " + (nodes.length + 1),
        type: "revolute",
        axis: [0, 0, 1],
        min: -Math.PI,
        max: Math.PI,
      },

      link: {
        name: "Link " + (nodes.length + 1),

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
    });
  }
  function handleImport() {
    setError("");

    try {
      const parsed = JSON.parse(json);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("JSON must be an object.");
      }

      if (!Array.isArray(parsed.nodes)) {
        throw new Error("`nodes` must be an array.");
      }

      if (!Array.isArray(parsed.edges)) {
        throw new Error("`edges` must be an array.");
      }

      /*
       * Basic node validation
       */
      for (const node of parsed.nodes) {
        if (!node.id || !node.type || !node.position) {
          throw new Error("Every node must have id, type and position.");
        }
      }

      /*
       * Basic edge validation
       */
      for (const edge of parsed.edges) {
        if (!edge.source || !edge.target) {
          throw new Error("Every edge must have source and target.");
        }
      }

      setNodes(parsed.nodes);
      setEdges(parsed.edges);

      setShowImport(false);
      setJson("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Invalid JSON.");
    }
  }
  return (
    <div style={{ height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        colorMode="dark"
        nodeTypes={nodeTypes}
      >
        <Background />
        <Controls />
        <Panel position="top-left" className="!m-4 space-x-4">
          <button
            type="button"
            onClick={handleAddSegment}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-lg ring-1 ring-gray-200 transition hover:bg-gray-50 active:scale-95"
          >
            + Add Segment
          </button>
          <button
            type="button"
            onClick={handleCopyJson}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-lg ring-1 ring-gray-200 transition hover:bg-gray-50 active:scale-95"
          >
            Copy JSON
          </button>
          <button
            type="button"
            onClick={() => {
              setError("");
              setShowImport(true);
            }}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-lg ring-1 ring-gray-200 transition hover:bg-gray-50 active:scale-95"
          >
            Import JSON
          </button>
        </Panel>
        {showImport && (
          <Panel position="top-center" className="!m-0">
            <div className="w-[500px] rounded-xl border bg-white p-4 shadow-2xl">
              <div className="mb-3">
                <h2 className="font-semibold text-gray-900">Import Flow</h2>

                <p className="text-xs text-gray-500">
                  Paste React Flow JSON containing nodes and edges.
                </p>
              </div>

              <textarea
                value={json}
                onChange={(e) => setJson(e.target.value)}
                placeholder={`{
  "nodes": [],
  "edges": []
}`}
                spellCheck={false}
                className="nodrag nowheel h-[300px] w-full resize-none rounded-lg border bg-gray-50 p-3 font-mono text-xs text-gray-900 outline-none focus:border-black"
              />

              {error && (
                <div className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowImport(false);
                    setJson("");
                    setError("");
                  }}
                  className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleImport}
                  className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                >
                  Import
                </button>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export default BotWorkFlow;
