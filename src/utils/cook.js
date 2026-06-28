// ------------------------------------------------------------
//  Build the temperature curve geometry from the probe log.
//  Returns SVG path strings + label/end-point coordinates,
//  all in the 300x160 viewBox the card's <svg> uses.
// ------------------------------------------------------------
export function buildCurve(temps) {
  const W = 300, H = 160, padT = 20, padB = 18;
  const n = temps.length;
  const min = Math.min(...temps), max = Math.max(...temps);
  const span = Math.max(max - min, 1);
  const x = (i) => (i / (n - 1)) * W;
  const y = (t) => padT + (1 - (t - min) / span) * (H - padT - padB);

  let line = `M ${x(0).toFixed(1)} ${y(temps[0]).toFixed(1)}`;
  for (let i = 1; i < n; i++) {
    const xc = (x(i - 1) + x(i)) / 2;
    line += ` Q ${xc.toFixed(1)} ${y(temps[i - 1]).toFixed(1)} ${x(i).toFixed(1)} ${y(temps[i]).toFixed(1)}`;
  }
  const area = line + ` L ${W} ${H} L 0 ${H} Z`;

  // find the stall (longest near-flat run) and label it
  let bestStart = 0, bestLen = 0, curStart = 0, curLen = 0;
  for (let i = 1; i < n; i++) {
    if (Math.abs(temps[i] - temps[i - 1]) <= 3) {
      if (curLen === 0) curStart = i - 1;
      curLen++;
    } else {
      if (curLen > bestLen) { bestLen = curLen; bestStart = curStart; }
      curLen = 0;
    }
  }
  if (curLen > bestLen) { bestLen = curLen; bestStart = curStart; }
  const mid = bestStart + bestLen / 2;

  return {
    line,
    area,
    stall: {
      x: Math.min(Math.max(x(mid) - 12, 4), W - 44),
      y: y(temps[Math.round(mid)]) - 8,
    },
    end: { x: x(n - 1), y: y(temps[n - 1]) },
  };
}
