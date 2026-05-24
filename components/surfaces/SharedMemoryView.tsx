'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useStudioStore } from '@/stores';

// ── Knowledge Graph Node ─────────────────────────────────────────────────────

interface GraphNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  rgb: string;
  label: string;
  profileId: string;
}

interface GraphEdge {
  source: string;
  target: string;
}

// ── Force-directed layout (simple) ───────────────────────────────────────────

function createGraphData(profiles: { id: string; name: string; accent: string; accentRGB: string }[], sessionsCount: number): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Profile nodes (larger, central)
  profiles.forEach((p, i) => {
    const angle = (i / profiles.length) * Math.PI * 2 - Math.PI / 2;
    nodes.push({
      id: p.id,
      x: Math.cos(angle) * 120 + 400,
      y: Math.sin(angle) * 120 + 300,
      vx: 0,
      vy: 0,
      radius: 18,
      color: p.accent,
      rgb: p.accentRGB,
      label: p.name,
      profileId: p.id,
    });
  });

  // Memory nodes (smaller, scattered)
  const memoryCount = Math.max(25, sessionsCount * 3 + 15);
  for (let i = 0; i < memoryCount; i++) {
    const profile = profiles[i % profiles.length];
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 200;
    nodes.push({
      id: `mem_${i}`,
      x: 400 + Math.cos(angle) * dist + (Math.random() - 0.5) * 80,
      y: 300 + Math.sin(angle) * dist + (Math.random() - 0.5) * 80,
      vx: 0,
      vy: 0,
      radius: 3 + Math.random() * 6,
      color: profile.accent,
      rgb: profile.accentRGB,
      label: '',
      profileId: profile.id,
    });
  }

  // Connect memory nodes to their profile
  nodes.forEach((n) => {
    if (n.id.startsWith('mem_')) {
      edges.push({ source: n.profileId, target: n.id });
    }
  });

  // Add some inter-node connections
  const memNodes = nodes.filter((n) => n.id.startsWith('mem_'));
  for (let i = 0; i < memNodes.length; i++) {
    if (Math.random() < 0.15) {
      const j = Math.floor(Math.random() * memNodes.length);
      if (i !== j) {
        edges.push({ source: memNodes[i].id, target: memNodes[j].id });
      }
    }
  }

  return { nodes, edges };
}

// ── Knowledge Graph Canvas ───────────────────────────────────────────────────

function KnowledgeGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const profiles = useStudioStore((s) => s.profiles);
  const sessions = useStudioStore((s) => s.sessions);

  const initGraph = useCallback(() => {
    const { nodes, edges } = createGraphData(profiles, Object.keys(sessions).length);
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [profiles, sessions]);

  useEffect(() => {
    initGraph();
  }, [initGraph]);

  // Force simulation + render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      const c = canvasRef.current;
      if (!c) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        c.width = rect.width * window.devicePixelRatio;
        c.height = rect.height * window.devicePixelRatio;
        c.style.width = rect.width + 'px';
        c.style.height = rect.height + 'px';
        const context = c.getContext('2d');
        if (context) context.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    }
    resize();
    window.addEventListener('resize', resize);

    function simulate() {
      const c = canvasRef.current;
      if (!c) return;
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const w = c.width / window.devicePixelRatio;
      const h = c.height / window.devicePixelRatio;

      // Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 800 / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }

      // Attraction along edges
      edges.forEach((edge) => {
        const a = nodes.find((n) => n.id === edge.source);
        const b = nodes.find((n) => n.id === edge.target);
        if (!a || !b) return;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const idealDist = 80;
        const force = (dist - idealDist) * 0.005;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      });

      // Center gravity
      nodes.forEach((n) => {
        n.vx += (w / 2 - n.x) * 0.002;
        n.vy += (h / 2 - n.y) * 0.002;
      });

      // Apply velocity with damping
      nodes.forEach((n) => {
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x += n.vx;
        n.y += n.vy;
        // Bounds
        n.x = Math.max(n.radius, Math.min(w - n.radius, n.x));
        n.y = Math.max(n.radius, Math.min(h - n.radius, n.y));
      });
    }

    function render() {
      const c = canvasRef.current;
      const context = c?.getContext('2d');
      if (!c || !context) return;
      const w = c.width / window.devicePixelRatio;
      const h = c.height / window.devicePixelRatio;
      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      context.clearRect(0, 0, w, h);

      // Draw edges
      edges.forEach((edge) => {
        const a = nodes.find((n) => n.id === edge.source);
        const b = nodes.find((n) => n.id === edge.target);
        if (!a || !b) return;

        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.strokeStyle = 'rgba(255,255,255,0.04)';
        context.lineWidth = 0.5;
        context.stroke();
      });

      // Draw nodes
      nodes.forEach((n) => {
        // Glow
        const gradient = context.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 3);
        gradient.addColorStop(0, `rgba(${n.rgb},0.25)`);
        gradient.addColorStop(1, `rgba(${n.rgb},0)`);
        context.beginPath();
        context.arc(n.x, n.y, n.radius * 3, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();

        // Node body
        const bodyGrad = context.createRadialGradient(
          n.x - n.radius * 0.3, n.y - n.radius * 0.3, 0,
          n.x, n.y, n.radius
        );
        bodyGrad.addColorStop(0, `rgba(${n.rgb},0.9)`);
        bodyGrad.addColorStop(1, `rgba(${n.rgb},0.4)`);
        context.beginPath();
        context.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        context.fillStyle = bodyGrad;
        context.fill();

        // Label for profile nodes
        if (n.label) {
          context.font = `500 ${n.radius > 12 ? 11 : 9}px 'Inter Tight', sans-serif`;
          context.fillStyle = `rgba(${n.rgb},0.8)`;
          context.textAlign = 'center';
          context.fillText(n.label, n.x, n.y + n.radius + 14);
        }
      });
    }

    function tick() {
      simulate();
      render();
      animRef.current = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Hover detection
  function handleMouseMove(e: React.MouseEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const nodes = nodesRef.current;
    let found: GraphNode | null = null;
    for (const n of nodes) {
      const dx = mx - n.x;
      const dy = my - n.y;
      if (dx * dx + dy * dy < (n.radius + 4) * (n.radius + 4)) {
        found = n;
        break;
      }
    }
    setHoveredNode(found);
  }

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl relative overflow-hidden"
      style={{
        height: 'calc(100vh - 320px)',
        minHeight: 400,
        background: 'linear-gradient(140deg, rgba(255,255,255,.03) 0%, rgba(255,255,255,.01) 100%)',
        border: '1px solid rgba(255,255,255,.06)',
        boxShadow: '0 1px 0 rgba(255,255,255,.04) inset, 0 4px 24px rgba(0,0,0,.25)',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredNode(null)}
    >
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-3"
           style={{ background: 'rgba(0,0,0,.3)', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
        <span className="hx-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: '#c9a76c' }}>
          Knowledge Graph • All Profiles
        </span>

        {/* Legend */}
        <div className="flex items-center gap-3">
          {profiles.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: p.accent,
                  boxShadow: `0 0 6px rgba(${p.accentRGB},.5)`,
                }}
              />
              <span className="hx-mono text-[9px] uppercase tracking-wider" style={{ color: '#5a5a52' }}>
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredNode && (
        <div
          className="absolute z-20 px-3 py-2 rounded-lg pointer-events-none"
          style={{
            left: hoveredNode.x + 16,
            top: hoveredNode.y - 10,
            background: 'rgba(15,15,20,.9)',
            border: '1px solid rgba(255,255,255,.1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {hoveredNode.label ? (
            <span className="text-[12px] font-medium" style={{ color: hoveredNode.color }}>
              {hoveredNode.label}
            </span>
          ) : (
            <span className="hx-mono text-[10px]" style={{ color: '#7a7a72' }}>
              Memory node
            </span>
          )}
        </div>
      )}

      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

// ── Main View ────────────────────────────────────────────────────────────────

export default function SharedMemoryView() {
  return (
    <div className="px-10 pb-10 pt-6">
      <KnowledgeGraph />
    </div>
  );
}
