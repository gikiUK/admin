"use client";

import { useEffect, useRef } from "react";
import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";
import type { Plan } from "@/lib/bcorp/types";

const CHART_COLORS = {
  blue: "#1D4ED8",
  green: "#16a34a",
  purple: "#9333ea",
  blueMid: "#60a5fa",
  greenMid: "#4ade80",
  purpleMid: "#c084fc",
  gray: "#71717A"
};

function buildScopeBreakdown(plan: Plan): { labels: string[]; data: number[] } {
  const counts: Record<string, number> = {};
  for (const action of plan) {
    const scopes = action.tal_action.ghg_scope ?? [];
    const normalised = new Set<string>();
    for (const s of scopes) {
      if (s.startsWith("Scope 1") || s.startsWith("Scope 2")) {
        normalised.add("Scope 1 & 2");
      } else if (s.startsWith("Scope 3")) {
        normalised.add("Scope 3");
      } else {
        normalised.add(s);
      }
    }
    for (const cat of normalised) {
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted.length <= 7) {
    return { labels: sorted.map(([l]) => l), data: sorted.map(([, v]) => v) };
  }
  const top = sorted.slice(0, 6);
  const otherTotal = sorted.slice(6).reduce((sum, [, v]) => sum + v, 0);
  return {
    labels: [...top.map(([l]) => l), "Other"],
    data: [...top.map(([, v]) => v), otherTotal]
  };
}

// biome-ignore lint/suspicious/noExplicitAny: Chart.js loaded from CDN
function initCharts(Chart: any, breakdownCanvas: HTMLCanvasElement, impactCanvas: HTMLCanvasElement, plan: Plan) {
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 14;
  Chart.defaults.font.weight = "400";
  Chart.defaults.color = "#71717A";

  const breakdown = buildScopeBreakdown(plan);

  const dpr = 3;

  new Chart(breakdownCanvas, {
    type: "bar",
    data: {
      labels: breakdown.labels,
      datasets: [
        {
          data: breakdown.data,
          backgroundColor: Object.values(CHART_COLORS).slice(0, breakdown.labels.length),
          borderRadius: 4
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      devicePixelRatio: dpr,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          title: { display: true, text: "Number of Actions", font: { size: 13, weight: "600" }, color: "#71717A" },
          grid: { color: "#f0f0f0" },
          ticks: { font: { size: 13 }, color: "#71717A" }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 14, weight: "500" }, color: "#71717A" }
        }
      }
    }
  });

  new Chart(impactCanvas, {
    type: "doughnut",
    data: {
      labels: ["Enabling action", "Large", "Transformative", "Medium", "Long term potential", "Small"],
      datasets: [
        {
          data: [35, 25, 12, 15, 8, 5],
          backgroundColor: [
            CHART_COLORS.blue,
            CHART_COLORS.green,
            CHART_COLORS.purple,
            CHART_COLORS.blueMid,
            CHART_COLORS.greenMid,
            CHART_COLORS.purpleMid
          ],
          borderColor: "#ffffff",
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      devicePixelRatio: dpr,
      cutout: "55%",
      layout: { padding: { left: 40, right: -30 } },
      plugins: {
        legend: {
          position: "left",
          labels: {
            font: { size: 14, weight: "500" },
            padding: 8,
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 8
          }
        }
      }
    }
  });
}

export function Overview({ plan }: BcorpPageProps) {
  const breakdownRef = useRef<HTMLCanvasElement>(null);
  const impactRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const breakdown = breakdownRef.current;
    const impact = impactRef.current;
    if (!breakdown || !impact) return;

    // biome-ignore lint/suspicious/noExplicitAny: Chart.js loaded from CDN
    const run = (C: any) => document.fonts.ready.then(() => initCharts(C, breakdown, impact, plan));

    // Load Chart.js from CDN if not already loaded
    // biome-ignore lint/suspicious/noExplicitAny: Chart.js loaded from CDN
    if ((window as any).Chart) {
      // biome-ignore lint/suspicious/noExplicitAny: Chart.js loaded from CDN
      run((window as any).Chart);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4";
    // biome-ignore lint/suspicious/noExplicitAny: Chart.js loaded from CDN
    script.onload = () => run((window as any).Chart);
    document.head.appendChild(script);
  }, [plan]);

  return (
    <div className="ui-page">
      <div className="ui-section">
        <h2>Overview</h2>
        <p>
          The following charts provide an initial overview of our climate action strategy illustrating how our actions
          are distributed across key areas and the potential impact these actions can deliver. However, climate action
          is a long-term endeavour, and this plan will evolve over time as we learn, adapt, and respond to new
          challenges and opportunities.
        </p>
        <div className="chart-block no-break">
          <h3>Actions Breakdown by Group</h3>
          <div className="chart-container" style={{ height: "68mm" }}>
            <canvas ref={breakdownRef} />
          </div>
        </div>
        <div className="chart-block no-break" style={{ marginTop: "5mm" }}>
          <h3>Potential Impact of Actions</h3>
          <div className="chart-container" style={{ height: "68mm" }}>
            <canvas ref={impactRef} />
          </div>
        </div>
        <p className="chart-note">
          These charts illustrate the distribution and potential impact of our planned climate actions. Actual outcomes
          will be measured and reported as implementation progresses.
        </p>
      </div>
    </div>
  );
}
