import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { SimulationStep } from '../types';
import { formatCompactKRW, formatKRW } from '../utils/formatters';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface Props {
    paths: SimulationStep[][];
    medianIndex: number;
}

export function MonteCarloPathsChart({ paths, medianIndex }: Props) {
    if (paths.length === 0) return null;

    // Use labels from the first path (assuming all have same months)
    const labels = paths[0].map(d => `${Math.floor(d.month / 12)}y`);

    const datasets = paths.map((path, index) => {
        const isMedian = index === medianIndex;

        return {
            label: isMedian ? 'Median Scenario' : `Run ${index + 1}`,
            data: path.map(d => d.totalValue),
            borderColor: isMedian
                ? 'rgba(34, 211, 238, 1)' // Cyan for Median
                : 'rgba(99, 102, 241, 0.1)', // Low opacity Indigo for others
            borderWidth: isMedian ? 3 : 1,
            pointRadius: 0, // No dots for smooth lines
            tension: 0.4, // Smooth curve
            order: 10, // Default order (will be updated)
        };
    });

    const investedDataset = {
        label: 'Invested Capital',
        data: paths[0].map(d => d.contributionTotal), // Deterministic, so path[0] is fine
        borderColor: '#94a3b8', // Gray
        borderWidth: 2,
        borderDash: [5, 5], // Dashed line
        pointRadius: 0,
        tension: 0.1,
        order: 0 // Top priority (draws last usually, or first? ChartJS 'order' property: lower is top. default is 0)
        // Wait, default order is 0. If I set others to 1/2, 0 will be top.
    };

    // Prepare final datasets
    // Filter out median first
    const medianDataset = datasets[medianIndex];
    const otherDatasets = datasets.filter((_, i) => i !== medianIndex);

    // Combine: Others (Background) -> Median (Highlight) -> Invested (Reference)
    // Note: ChartJS draws in array order IF order prop is same.
    // If order prop is used, Lower order is drawn ON TOP (z-index essentially).
    // Let's rely on array order for simplicity and remove 'order' prop confusion if possible, 
    // or just set strict orders.
    // Others: order 10
    // Median: order 5
    // Invested: order 1 (Topmost)

    datasets.forEach(d => { d.order = 10; }); // Default background
    medianDataset.order = 5;
    investedDataset.order = 1;

    const finalDatasets = [...otherDatasets, medianDataset, investedDataset];

    const data = {
        labels,
        datasets: finalDatasets
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: '#94a3b8',
                    filter: (item: any) => item.text === 'Median Scenario' // Only show Median in legend
                }
            },
            tooltip: {
                enabled: true,
                mode: 'nearest' as const,
                intersect: false,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#e2e8f0',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                callbacks: {
                    title: (context: any) => `Year ${Math.floor(context[0].parsed.x / 12)}`, // Approximate
                    label: (context: any) => {
                        // Only show detailed tooltip for Median to reduce clutter? 
                        // Or show all but formatted.
                        if (context.dataset.label === 'Median Scenario') {
                            return `Median: ${formatKRW(context.raw)}`;
                        }
                        return ''; // Hide others
                    }
                },
                filter: (item: any) => item.dataset.label === 'Median Scenario' // Only show tooltip for median
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#94a3b8',
                    maxTicksLimit: 10,
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#94a3b8',
                    callback: (value: any) => formatCompactKRW(value)
                }
            }
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        }
    };

    return (
        <div style={{ width: '100%', height: '400px' }}>
            <Line data={data} options={options} />
        </div>
    );
}
