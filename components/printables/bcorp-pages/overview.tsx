"use client";

import { useEffect, useRef } from "react";
import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";

const CHART_COLORS = {
  blue: "#1D4ED8",
  green: "#16a34a",
  purple: "#9333ea",
  blueMid: "#60a5fa",
  greenMid: "#4ade80",
  purpleMid: "#c084fc"
};

function initCharts(breakdownCanvas: HTMLCanvasElement, impactCanvas: HTMLCanvasElement) {
  // biome-ignore lint/suspicious/noExplicitAny: Chart.js loaded from CDN
  const Chart = (window as any).Chart;
  if (!Chart) return;

  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 14;
  Chart.defaults.font.weight = "400";
  Chart.defaults.color = "#71717A";

  new Chart(breakdownCanvas, {
    type: "bar",
    data: {
      labels: ["Energy", "Transport", "Supply Chain", "Waste", "Buildings", "Other"],
      datasets: [
        {
          data: [30, 22, 18, 15, 10, 5],
          backgroundColor: [
            CHART_COLORS.blue,
            CHART_COLORS.green,
            CHART_COLORS.purple,
            CHART_COLORS.blueMid,
            CHART_COLORS.greenMid,
            CHART_COLORS.purpleMid
          ],
          borderRadius: 4
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
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

export function Overview(_props: BcorpPageProps) {
  const breakdownRef = useRef<HTMLCanvasElement>(null);
  const impactRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const breakdown = breakdownRef.current;
    const impact = impactRef.current;
    if (!breakdown || !impact) return;

    // Load Chart.js from CDN if not already loaded
    // biome-ignore lint/suspicious/noExplicitAny: Chart.js loaded from CDN
    if ((window as any).Chart) {
      document.fonts.ready.then(() => initCharts(breakdown, impact));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4";
    script.onload = () => {
      document.fonts.ready.then(() => initCharts(breakdown, impact));
    };
    document.head.appendChild(script);
  }, []);

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
