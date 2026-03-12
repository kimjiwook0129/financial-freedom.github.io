export interface ChartThemeColors {
  textColor: string;
  gridColor: string;
  legendColor: string;
  tooltipBg: string;
  tooltipTitle: string;
  tooltipBody: string;
  tooltipBorder: string;
  hoverBorder: string;
}

export function getChartThemeColors(isDark: boolean): ChartThemeColors {
  return {
    textColor: isDark ? '#64748b' : '#94a3b8',
    gridColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(100,116,139,0.1)',
    legendColor: isDark ? '#94a3b8' : '#475569',
    tooltipBg: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(30, 41, 59, 0.9)',
    tooltipTitle: isDark ? '#e2e8f0' : '#f1f5f9',
    tooltipBody: isDark ? '#94a3b8' : '#cbd5e1',
    tooltipBorder: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(56, 189, 248, 0.3)',
    hoverBorder: isDark ? '#0f172a' : '#f1f5f9',
  };
}
