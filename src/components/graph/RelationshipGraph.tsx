"use client";

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    Node,
    Edge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    Handle,
    Position,
    ConnectionLineType,
    MarkerType,
    EdgeProps,
    getSmoothStepPath,
    BaseEdge,
    EdgeLabelRenderer,
    addEdge,
    Connection,
    BackgroundVariant,
    NodeChange,
    applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Check, X, Trash2, Database, Table as TableIcon, RefreshCw } from 'lucide-react';
import Dagre from 'dagre';

// --- Custom Node ---
const TableNode = ({ data }: { data: { label: string, columns: string[] } }) => {
    return (
        <div className="bg-[#18181b] border border-white/5 rounded-xl shadow-2xl min-w-[240px] flex items-stretch overflow-hidden group hover:border-[#FC8B28]/50 transition-colors">
            {/* Left: Indicator Strip */}
            <div className="w-1.5 bg-[#FC8B28]"></div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-2 w-full">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#27272a] p-1.5 rounded-md">
                            <TableIcon className="w-4 h-4 text-[#FC8B28]" />
                        </div>
                        <span className="font-semibold text-sm text-white truncate max-w-[140px]" title={data.label}>
                            {data.label}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] uppercase font-bold text-[#a1a1aa] tracking-wider">
                        Table
                    </span>
                    <span className="text-[10px] text-[#52525b] font-mono">
                        {data.label.split('.').pop()?.toUpperCase() || 'CSV'}
                    </span>
                </div>
            </div>

            {/* Handles for connections */}
            <Handle type="target" position={Position.Left} className="!bg-[#71717a] !w-1.5 !h-1.5 !border-none" />
            <Handle type="source" position={Position.Right} className="!bg-[#71717a] !w-1.5 !h-1.5 !border-none" />
        </div>
    );
};

// --- Custom Edge ---
const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    style = {},
    markerEnd,
}: EdgeProps) => {
    // Use SmoothStepPath for Orthogonal lines
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetPosition,
        targetX,
        targetY,
        borderRadius: 20, // Rounded corners
    });

    const isPassive = data?.status === 'passive';

    // Determine visuals based on status
    const edgeColor = isPassive ? '#FC8B28' : '#10B981'; // Project Orange vs Emerald Green
    const strokeWidth = isPassive ? 2 : 2;
    const edgeStrokeDasharray = isPassive ? '4 4' : undefined;

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{ ...style, stroke: edgeColor, strokeWidth, strokeDasharray: edgeStrokeDasharray, opacity: isPassive ? 0.6 : 1 }}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + (isPassive ? -25 : 25)}px)`,
                        pointerEvents: 'all',
                        zIndex: isPassive ? 20 : 10, // Pending gets slight priority
                    }}
                    className="nodrag nopan flex flex-col items-center gap-2 group hover:z-[999] transition-transform duration-200"
                >
                    {/* Status Label (Hidden for cleaner look, only show actions? Or keep small dot?) */}
                    {/* User asked for "like this" (image) -> simplistic lines. Stick to previous style but positioned on step. */}
                    <div className={`rounded-full px-2 py-0.5 flex items-center gap-1.5 shadow-xl border backdrop-blur-md
                        ${isPassive
                            ? 'bg-black/50 border-[#FC8B28]/30 text-[#FC8B28]'
                            : 'bg-black/50 border-[#10B981]/30 text-[#10B981]'
                        }
                    `}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isPassive ? 'bg-[#FC8B28]' : 'bg-[#10B981]'}`} />
                        <span className="text-[10px] font-bold tracking-wide uppercase">
                            {isPassive ? 'Waiting' : 'Link'}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                        {isPassive ? (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); data?.onConfirm(id); }}
                                    className="bg-[#10B981] hover:bg-[#059669] text-white rounded-full p-1.5 shadow-lg transition-transform hover:scale-110"
                                    title="Confirm"
                                >
                                    <Check className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); data?.onReject(id); }}
                                    className="bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-full p-1.5 shadow-lg transition-transform hover:scale-110"
                                    title="Reject"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); data?.onDelete(id); }}
                                className="bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-full p-1.5 shadow-lg transition-transform hover:scale-110"
                                title="Delete"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

const nodeTypes = {
    customTable: TableNode,
};

const edgeTypes = {
    customEdge: CustomEdge,
};

// --- Layout Helper (Dagre) ---
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'LR', align: undefined, ranksep: 150, nodesep: 50 }); // Left to Right layout, wider spacing

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) => {
        g.setNode(node.id, { width: 280, height: 80 }); // Adjusted dimensions
    });

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
            const position = g.node(node.id);
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            const x = position.x - 280 / 2;
            const y = position.y - 80 / 2;

            return { ...node, position: { x, y } };
        }),
        edges,
    };
};

// --- Helper: Local Storage Key ---
export const STORAGE_KEY = 'limelight_graph_layout';

export default function RelationshipGraph() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);

    // Save node positions on drag stop
    const onNodeDragStop = useCallback((_: any, node: Node) => {
        setNodes((nds) => {
            const updatedNodes = nds.map((n) => (n.id === node.id ? node : n));
            // Save to LS
            const positions = updatedNodes.reduce((acc, n) => ({ ...acc, [n.id]: n.position }), {});
            localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
            return updatedNodes;
        });
    }, [setNodes]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch tables for nodes
            const tablesData = await api.getTables();

            // Load saved positions
            const savedLayout = localStorage.getItem(STORAGE_KEY);
            const savedPositions = savedLayout ? JSON.parse(savedLayout) : {};
            const hasSavedPositions = Object.keys(savedPositions).length > 0;

            const rawNodes: Node[] = tablesData.map((t: any) => ({
                id: t.id,
                type: 'customTable',
                data: { label: t.original_filename || t.table_name, columns: [] }, // Initially empty columns
                // Use saved position if exists, else default 0,0 (will be layouted if no saved positions)
                position: savedPositions[t.id] || { x: 0, y: 0 },
            }));

            // Fetch Relationships
            const relData = await api.getRelationships();
            const relationships = relData.relationships;

            const rawEdges: Edge[] = relationships
                .filter((r: any) => r.status !== 'rejected') // Hide rejected
                .map((r: any) => ({
                    id: r.id,
                    source: r.from_table_id,
                    target: r.to_table_id,
                    type: 'customEdge',
                    data: {
                        status: r.status,
                        fromCol: r.from_column,
                        toCol: r.to_column,
                        onConfirm: async (id: string) => {
                            try { await api.confirmRelationship(id); toast.success("Confirmed"); fetchData(); }
                            catch { toast.error("Error"); }
                        },
                        onReject: async (id: string) => {
                            try { await api.rejectRelationship(id); toast.success("Rejected"); fetchData(); }
                            catch { toast.error("Error"); }
                        },
                        onDelete: async (id: string) => {
                            try { await api.deleteRelationship(id); toast.success("Deleted"); fetchData(); }
                            catch { toast.error("Error"); }
                        }
                    },
                    markerEnd: { type: MarkerType.ArrowClosed },
                    style: { strokeWidth: 2 }
                }));

            // Smart Layout Logic:
            // If we have saved positions for MOST/sizeable nodes, use them.
            // If we have NO saved positions, use Dagre.
            // What if we have NEW nodes? They will be at (0,0). 
            // We could run Dagre only for them? Too complex.
            // Simple: If `!hasSavedPositions` -> Run Dagre.
            // If `hasSavedPositions` -> Use rawNodes (saved positions apply).

            if (!hasSavedPositions) {
                const layouted = getLayoutedElements(rawNodes, rawEdges);
                setNodes(layouted.nodes);
                setEdges(layouted.edges);
            } else {
                setNodes(rawNodes);
                setEdges(rawEdges);
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to load graph data");
        } finally {
            setLoading(false);
        }
    }, []); // Run once on mount

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading && nodes.length === 0) {
        return <div className="flex items-center justify-center h-full text-muted-foreground animate-pulse">Loading Graph...</div>;
    }

    if (nodes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                <Database className="w-10 h-10 opacity-20" />
                <p>No tables found. Upload data to visualize relationships.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-[#171516] relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDragStop={onNodeDragStop} // Add persistence handler
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                // fitView -> Only fit view if we just auto-layouted? Or generally good?
                // If we load from storage, we might be zoomed in? 
                // Let's keep fitView but maybe with `defaultViewport` logic if saving viewport too?
                // For now fitView is safe enough.
                fitView
                fitViewOptions={{ padding: 0.2 }}
                className="bg-[#171516]"
            >
                <Background color="#1a1a1a" gap={24} size={2} variant={BackgroundVariant.Dots} />
                <Controls />
            </ReactFlow>
        </div>
    );
}
