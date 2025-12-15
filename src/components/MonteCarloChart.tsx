import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { HistogramBin } from '../utils/statistics';
import { formatKRW } from '../utils/formatters';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface Props {
    bins: HistogramBin[];
}

export function MonteCarloChart({ bins }: Props) {
    const data = {
        labels: bins.map(b => b.label),
        datasets: [
            {
                label: 'Frequency',
                data: bins.map(b => b.count),
                backgroundColor: bins.map((_) => {
                    // Gradient-ish color or highlight median?
                    // Let's use a nice purple
                    return 'rgba(99, 102, 241, 0.6)';
                }),
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                callbacks: {
                    title: (items: any[]) => {
                        const index = items[0].dataIndex;
                        const bin = bins[index];
                        return `${formatKRW(bin.rangeStart)} ~ ${formatKRW(bin.rangeEnd)}`;
                    },
                    label: (item: any) => `Count: ${item.formatAsValue ? item.formattedValue : item.raw}`
                }
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
                    font: {
                        size: 9
                    },
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#94a3b8'
                }
            }
        }
    };

    return (
        <div className="w-full h-[300px]">
            <Bar data={data} options={options} />
        </div>
    );
}
