/**
 * Formats a number into Korean currency string with "만/억" units.
 * @param value Number to format
 * @param fractionDigits Number of decimal digits (default 0)
 * @returns formatted string (e.g. "1억 5,000만")
 */
export function formatKRW(value: number, fractionDigits: number = 0): string {
    if (value === 0) return "0";

    const man = 10000;
    const euk = 100000000;
    const jo = 1000000000000;

    // Check for Jo (Trillions)
    if (value >= jo) {
        const jos = value / jo;
        return `${new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 }).format(jos)}조`;
    }

    // Check for Euk (Billions)
    if (value >= euk) {
        const euks = Math.floor(value / euk);
        const remainder = value % euk;
        const mans = Math.round(remainder / man); // Round to nearest man

        let result = `${euks}억`;
        if (mans > 0) {
            result += ` ${new Intl.NumberFormat('ko-KR').format(mans)}만`;
        }
        return result;
    }

    // Check for Man (Ten thousands)
    if (value >= man) {
        const mans = value / man;
        // If it's just Man, we can show decimal like 1.5만 or just integer 1500만?
        // Let's stick to standard integer formatting for simplicity or decimal for compactness
        return `${new Intl.NumberFormat('ko-KR', { maximumFractionDigits: fractionDigits }).format(mans)}만`;
    }

    return new Intl.NumberFormat('ko-KR').format(value);
}

/**
 * Compact formatter for chart axes (e.g., 1.5억, 5000만)
 */
export function formatCompactKRW(value: number): string {
    const man = 10000;
    const euk = 100000000;

    if (value >= euk) {
        return (value / euk).toFixed(1) + '억';
    }
    if (value >= man) {
        return (value / man).toFixed(0) + '만';
    }
    return value.toString();
}
