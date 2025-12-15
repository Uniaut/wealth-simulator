import { formatKRW } from '../utils/formatters';

interface Props {
    summary: {
        finalValue: number;
        totalInvested: number;
        profit: number;
        roi: number;
    } | null;
}

export function ResultsDashboard({ summary }: Props) {
    if (!summary) return null;

    return (
        <div className="stat-grid">
            <div className="stat-card">
                <div className="stat-label">Final Value</div>
                <div className="stat-val">{formatKRW(summary.finalValue)}</div>
            </div>

            <div className="stat-card success">
                <div className="stat-label">Total Profit</div>
                <div className="stat-val" style={{ color: 'hsl(var(--accent-green))' }}>
                    +{formatKRW(summary.profit)}
                </div>
            </div>

            <div className="stat-card info">
                <div className="stat-label">Total Return</div>
                <div className="stat-val" style={{ color: 'hsl(var(--accent-cyan))' }}>
                    {summary.roi.toFixed(1)}%
                </div>
            </div>
        </div>
    );
}
