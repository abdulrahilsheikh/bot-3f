"use client"

import { useSegments } from '@/context/segment';
import {
    addEdge,
    Background,
    Connection,
    Controls,
    NodeTypes,
    ReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import SegmentNode from '../flow-node';


const nodeTypes: NodeTypes = {
    segmentNode: SegmentNode,
};

const BotWorkFlow = () => {
    const { nodes, edges, setEdges, onEdgesChange, onNodesChange } = useSegments()

    function onConnect(
        connection: Connection,
    ) {
        setEdges((current) =>
            addEdge(connection, current),
        );
    }
    return (
        <div style={{ height: '100%' }}>
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
            </ReactFlow>
        </div>
    );
}

export default BotWorkFlow