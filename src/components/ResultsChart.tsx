import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { SimulationStep } from '../types';
import { formatKRW, formatCompactKRW } from '../utils/formatters';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface Props {
    data: SimulationStep[];
}

export function ResultsChart({ data }: Props) {
    const chartData = {
        labels: data.map(d => {
            const year = Math.floor(d.month / 12);
            const month = d.month % 12;
            return month === 0 ? `Year ${year}` : '';
        }),
        datasets: [
            {
                label: 'Total Portfolio Value',
                data: data.map(d => d.totalValue),
                borderColor: 'hsl(250, 100%, 75%)',
                backgroundColor: 'hsla(250, 100%, 75%, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
                yAxisID: 'y',
            },
            {
                label: 'Total Invested Capital',
                data: data.map(d => d.contributionTotal),
                borderColor: 'hsl(180, 100%, 45%)',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'Market Index Price',
                data: data.map(d => d.assetPrice),
                borderColor: 'hsl(320, 100%, 65%)', // Pink for index
                backgroundColor: 'transparent',
                borderWidth: 1,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 0,
                yAxisID: 'y1', // Secondary Axis
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#e2e8f0',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    },
                    usePointStyle: true,
                }
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                callbacks: {
                    // @ts-ignore
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            if (context.dataset.yAxisID === 'y1') {
                                label += context.parsed.y.toFixed(2);
                            } else {
                                label += formatKRW(context.parsed.y);
                            }
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8',
                    maxTicksLimit: 10,
                }
            },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8',
                    callback: function (value: any) {
                        return formatCompactKRW(value);
                    }
                }
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                grid: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
                ticks: {
                    color: 'hsl(320, 100%, 65%)',
                },
                title: {
                    display: true,
                    text: 'Index Price',
                    color: 'hsl(320, 100%, 65%)',
                    font: {
                        size: 10
                    }
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
        <div className="w-full h-[400px]">
            <Line data={chartData} options={options} />
        </div>
    );
}
