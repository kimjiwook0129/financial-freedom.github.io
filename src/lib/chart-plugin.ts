export const verticalLinePlugin = {
  id: 'verticalLines',
  afterDraw(chart: any) {
    const lines = chart.options.plugins?.verticalLines?.lines;
    if (!lines || lines.length === 0) return;
    const ctx = chart.ctx;
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;
    const yTop = yScale.top;
    const yBottom = yScale.bottom;
    const chartLeft = chart.chartArea.left;
    const chartRight = chart.chartArea.right;

    const dark = document.documentElement.classList.contains('dark');

    // Collect drawable lines with pixel positions
    const items: { x: number; label: string; color: string; colorDark: string }[] = [];
    lines.forEach((line: any) => {
      const idx = chart.data.labels!.indexOf(line.value.toString());
      if (idx === -1) return;
      items.push({
        x: xScale.getPixelForValue(idx),
        label: line.label || '',
        color: line.colorLight || line.color || '#475569',
        colorDark: line.color || '#fff',
      });
    });

    items.sort((a, b) => a.x - b.x);

    // Draw dashed vertical lines
    items.forEach((d) => {
      const c = dark ? d.colorDark : d.color;
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = c + '80';
      ctx.lineWidth = 1;
      ctx.moveTo(d.x, yTop);
      ctx.lineTo(d.x, yBottom);
      ctx.stroke();
      ctx.restore();
    });

    // Draw badge-style labels with overlap avoidance & edge clamping
    ctx.save();
    const fontSize = 10;
    ctx.font = `500 ${fontSize}px Pretendard, sans-serif`;
    const padH = 6;
    const padV = 3;
    const badgeH = fontSize + padV * 2;
    const MIN_GAP = 100;
    let prevX = -Infinity;
    let prevRow = 0;
    items.forEach((d) => {
      if (!d.label) return;

      let row = 0;
      if (d.x - prevX < MIN_GAP) {
        row = prevRow === 0 ? 1 : 0;
      }
      const yPos = yTop - 6 - row * (badgeH + 4);

      const textW = ctx.measureText(d.label).width;
      const totalW = textW + padH * 2;
      const legendBox = chart.legend?.legendHitBoxes?.[0];
      const legendRight = legendBox ? legendBox.left + legendBox.width + 12 : chartLeft;
      const minLeft = Math.max(chartLeft, legendRight);
      let labelX = d.x;
      if (labelX - totalW / 2 < minLeft) labelX = minLeft + totalW / 2;
      if (labelX + totalW / 2 > chartRight) labelX = chartRight - totalW / 2;

      const c = dark ? d.colorDark : d.color;
      const rx = labelX - totalW / 2;
      const ry = yPos - badgeH;
      const radius = 4;
      ctx.fillStyle = c + (dark ? '1A' : '20');
      ctx.beginPath();
      ctx.roundRect(rx, ry, totalW, badgeH, radius);
      ctx.fill();
      ctx.strokeStyle = c + (dark ? '40' : '50');
      ctx.lineWidth = 0.5;
      ctx.setLineDash([]);
      ctx.stroke();

      ctx.fillStyle = c;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.label, labelX, ry + badgeH / 2);

      if (Math.abs(labelX - d.x) > 2) {
        ctx.beginPath();
        ctx.strokeStyle = c + '40';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 2]);
        ctx.moveTo(d.x, yTop);
        ctx.lineTo(labelX, ry + badgeH);
        ctx.stroke();
      }

      prevX = d.x;
      prevRow = row;
    });
    ctx.restore();
  }
};
