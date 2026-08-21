"use client";

import { useState } from "react";

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

import { useSegments } from "@/context/segment";
import SegmentNode from "../flow-node";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

const nodeTypes: NodeTypes = {
  segmentNode: SegmentNode,
};

const BotWorkFlow = () => {
  const router = useRouter();
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

  /* ---------------------------------- */
  /* Connect nodes */
  /* ---------------------------------- */

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

  /* ---------------------------------- */
  /* Add segment */
  /* ---------------------------------- */

  function handleAddSegment() {
    addSegment({
      joint: {
        name: `Joint ${nodes.length + 1}`,
        type: "revolute",
        axis: [0, 0, 1],
        min: -Math.PI,
        max: Math.PI,
      },

      link: {
        name: `Link ${nodes.length + 1}`,

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

  /* ---------------------------------- */
  /* Open import */
  /* ---------------------------------- */

  function openImport() {
    setError("");
    setJson("");
    setShowImport(true);
  }

  /* ---------------------------------- */
  /* Import */
  /* ---------------------------------- */

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

      /* ----------------------------- */
      /* Validate nodes */
      /* ----------------------------- */

      for (const node of parsed.nodes) {
        if (!node.id || !node.type || !node.position) {
          throw new Error("Every node must have id, type and position.");
        }
      }

      /* ----------------------------- */
      /* Validate edges */
      /* ----------------------------- */

      for (const edge of parsed.edges) {
        if (!edge.source || !edge.target) {
          throw new Error("Every edge must have source and target.");
        }
      }

      setNodes(parsed.nodes);
      setEdges(parsed.edges);

      setShowImport(false);
      setJson("");
      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Invalid JSON.");
    }
  }

  /* ---------------------------------- */
  /* Close import */
  /* ---------------------------------- */

  function closeImport() {
    setShowImport(false);
    setJson("");
    setError("");
  }
  function handleUseConfig() {
    try {
      const config = {
        nodes,
        edges,
      };

      const json = JSON.stringify(config);

      // UTF-8 safe Base64
      const base64 = btoa(
        encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(parseInt(p1, 16)),
        ),
      );

      // Make it URL safe
      const encodedConfig = base64
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      router.push(`/?config=${encodedConfig}`);

      setShowImport(false);
    } catch (error) {
      console.error("Failed to encode robot configuration:", error);

      setError("Failed to create configuration.");
    }
  }
  return (
    <div className="h-full">
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

        {/* ================================= */}
        {/* TOOLBAR */}
        {/* ================================= */}

        <Panel position="top-left" className="!m-4 flex gap-2">
          <Button type="button" variant="secondary" onClick={handleAddSegment}>
            + Add Segment
          </Button>

          <Button type="button" variant="secondary" onClick={handleCopyJson}>
            Copy JSON
          </Button>

          <Button type="button" variant="secondary" onClick={openImport}>
            Import JSON
          </Button>

          <Button type="button" onClick={handleUseConfig}>
            Use Config
          </Button>
        </Panel>
      </ReactFlow>

      {/* ================================= */}
      {/* IMPORT DIALOG */}
      {/* ================================= */}

      <Dialog
        open={showImport}
        onOpenChange={(open) => {
          if (!open) {
            closeImport();
          } else {
            setShowImport(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Flow</DialogTitle>

            <DialogDescription>
              Paste React Flow JSON containing nodes and edges.
            </DialogDescription>
          </DialogHeader>

          {/* JSON */}

          <Textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder={`{
  "nodes": [],
  "edges": []
}`}
            spellCheck={false}
            className="nodrag nowheel h-[300px] resize-none font-mono text-xs"
          />

          {/* ERROR */}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* FOOTER */}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeImport}>
              Cancel
            </Button>

            <Button type="button" onClick={handleImport}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BotWorkFlow;
