import type { AthleteBody, AthleteStats } from "@/data/measurements";

type Props = {
  body: AthleteBody;
  stats: AthleteStats;
  accent?: string;
};

const VB_W = 220;
const VB_H = 440;
const PAD_TOP = 12;
const PAD_BOTTOM = 18;
const SCALE = 1.85;

type P = [number, number];

export default function AthleteSilhouette({ body, stats, accent = "#818cf8" }: Props) {
  const totalH = body.height * SCALE;
  const baseY = VB_H - PAD_BOTTOM;
  const topAvail = baseY - totalH;
  const yShift = topAvail < PAD_TOP ? PAD_TOP - topAvail : 0;
  const feetY = baseY + yShift;
  const cx = VB_W / 2;

  const shoulderHW = (body.shoulderWidth / 2) * SCALE;
  const chestHW = (body.chest / (2 * Math.PI)) * SCALE;
  const waistHW = (body.waist / (2 * Math.PI)) * SCALE;
  const hipHW = (body.hip / (2 * Math.PI)) * SCALE;
  const headHW = body.height * 0.043 * SCALE;
  const neckHW = headHW * 0.55;
  const kneeHW = hipHW * 0.5;
  const ankleHW = hipHW * 0.3;
  const upperArmHW = chestHW * 0.18;
  const wristHW = upperArmHW * 0.55;

  const lvl = (frac: number) => feetY - frac * totalH;

  const yFoot = feetY;
  const yAnkle = lvl(0.04);
  const yCalf = lvl(0.15);
  const yKnee = lvl(0.27);
  const yMidThigh = lvl(0.38);
  const yCrotch = lvl(0.5);
  const yHip = lvl(0.52);
  const yWaist = lvl(0.62);
  const yChest = lvl(0.74);
  const yShoulder = lvl(0.83);
  const yNeck = lvl(0.86);
  const yChin = lvl(0.88);
  const yEye = lvl(0.95);
  const yTop = lvl(1.0);

  const torsoRight: P[] = [
    [cx + hipHW, yHip],
    [cx + waistHW, yWaist],
    [cx + chestHW, yChest],
    [cx + shoulderHW, yShoulder],
    [cx + neckHW, yNeck],
  ];
  const torsoLeft: P[] = torsoRight.map(([x, y]) => [2 * cx - x, y]);
  const torsoPath: P[] = [
    ...torsoLeft.slice().reverse(),
    ...torsoRight,
    [cx + hipHW * 0.9, yCrotch],
    [cx, yCrotch + 4],
    [cx - hipHW * 0.9, yCrotch],
  ];

  const rightLeg: P[] = [
    [cx + 1, yCrotch + 2],
    [cx + hipHW * 0.9, yCrotch],
    [cx + kneeHW * 1.05, yMidThigh],
    [cx + kneeHW, yKnee],
    [cx + kneeHW * 0.9, yCalf],
    [cx + ankleHW, yAnkle],
    [cx + ankleHW * 1.2, yFoot],
    [cx + 1, yFoot],
  ];
  const leftLeg: P[] = rightLeg.map(([x, y]) => [2 * cx - x, y]);

  const armDrop = stats.wingspan
    ? ((stats.wingspan - body.shoulderWidth) / 2) * SCALE
    : (body.height * 0.42) * SCALE;
  const yArmTop = yShoulder + upperArmHW * 0.6;
  const yElbow = yArmTop + armDrop * 0.5;
  const yWrist = yArmTop + armDrop;
  const xShoulderEdgeR = cx + shoulderHW;
  const xShoulderInR = cx + chestHW * 0.95;

  const rightArm: P[] = [
    [xShoulderEdgeR, yShoulder + 1],
    [xShoulderEdgeR + upperArmHW * 0.3, yArmTop + armDrop * 0.1],
    [xShoulderEdgeR + upperArmHW * 0.15, yElbow],
    [xShoulderEdgeR - upperArmHW * 0.1, yWrist - wristHW * 0.5],
    [xShoulderEdgeR - upperArmHW * 0.1 + wristHW * 1.6, yWrist + wristHW * 0.8],
    [xShoulderEdgeR - upperArmHW * 0.1 - wristHW * 0.3, yWrist + wristHW * 1.4],
    [xShoulderEdgeR - upperArmHW * 0.4 - wristHW, yWrist - wristHW * 0.2],
    [xShoulderInR - upperArmHW * 0.2, yElbow - armDrop * 0.05],
    [xShoulderInR, yArmTop],
  ];
  const leftArm: P[] = rightArm.map(([x, y]) => [2 * cx - x, y]);

  const head: P[] = [
    [cx + neckHW * 0.95, yChin + 2],
    [cx + headHW * 0.85, yChin],
    [cx + headHW * 1.0, yEye],
    [cx + headHW * 0.6, yTop + headHW * 0.1],
    [cx, yTop],
    [cx - headHW * 0.6, yTop + headHW * 0.1],
    [cx - headHW * 1.0, yEye],
    [cx - headHW * 0.85, yChin],
    [cx - neckHW * 0.95, yChin + 2],
  ];

  const annotations = [
    { y: yShoulder, label: "Shoulder", value: `${body.shoulderWidth} cm`, hw: shoulderHW },
    { y: yChest, label: "Chest", value: `${body.chest} cm`, hw: chestHW },
    { y: yWaist, label: "Waist", value: `${body.waist} cm`, hw: waistHW },
    { y: yHip, label: "Hip", value: `${body.hip} cm`, hw: hipHW },
  ];

  const darkAccent = shiftHex(accent, -0.32);
  const midAccent = shiftHex(accent, -0.1);
  const skin = "#e9d5b8";
  const skinDark = shiftHex(skin, -0.18);
  const idSafe = `${Math.round(accent.charCodeAt(1) + body.height + body.chest)}`;
  const clipLeftId = `clip-left-${idSafe}`;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full text-[var(--foreground)]"
      role="img"
      aria-label={`Body silhouette: ${body.height} cm, ${body.weight} kg`}
    >
      <defs>
        <clipPath id={clipLeftId}>
          <rect x="0" y="0" width={cx} height={VB_H} />
        </clipPath>
      </defs>

      {annotations.map((a) => (
        <g key={a.label}>
          <line
            x1={cx - a.hw - 4}
            y1={a.y}
            x2={cx + a.hw + 4}
            y2={a.y}
            stroke={midAccent}
            strokeWidth={0.6}
            strokeDasharray="2 3"
            opacity={0.45}
          />
          <line
            x1={cx + a.hw + 6}
            y1={a.y}
            x2={VB_W - 6}
            y2={a.y}
            stroke={midAccent}
            strokeWidth={0.5}
            opacity={0.35}
          />
          <text
            x={VB_W - 6}
            y={a.y - 2}
            textAnchor="end"
            fontSize="7"
            fontFamily="var(--font-mono), monospace"
            fill="currentColor"
            opacity={0.75}
          >
            {a.label} · {a.value}
          </text>
        </g>
      ))}

      <g>
        <polygon points={toPoints(rightLeg)} fill={midAccent} stroke={darkAccent} strokeWidth={0.6} strokeLinejoin="round" />
        <polygon points={toPoints(leftLeg)} fill={midAccent} stroke={darkAccent} strokeWidth={0.6} strokeLinejoin="round" />
        <polygon points={toPoints(torsoPath)} fill={accent} stroke={darkAccent} strokeWidth={0.7} strokeLinejoin="round" />
        <polygon points={toPoints(rightArm)} fill={midAccent} stroke={darkAccent} strokeWidth={0.6} strokeLinejoin="round" />
        <polygon points={toPoints(leftArm)} fill={midAccent} stroke={darkAccent} strokeWidth={0.6} strokeLinejoin="round" />
        <polygon points={toPoints(head)} fill={skin} stroke={skinDark} strokeWidth={0.6} strokeLinejoin="round" />
      </g>

      <g clipPath={`url(#${clipLeftId})`} opacity={0.55}>
        <polygon points={toPoints(rightLeg)} fill={darkAccent} />
        <polygon points={toPoints(leftLeg)} fill={darkAccent} />
        <polygon points={toPoints(torsoPath)} fill={darkAccent} />
        <polygon points={toPoints(rightArm)} fill={darkAccent} />
        <polygon points={toPoints(leftArm)} fill={darkAccent} />
        <polygon points={toPoints(head)} fill={skinDark} />
      </g>

      <line
        x1={cx}
        y1={yTop - 4}
        x2={cx}
        y2={yFoot + 6}
        stroke="currentColor"
        strokeWidth={0.3}
        strokeDasharray="1 3"
        opacity={0.2}
      />

      <g>
        <line x1={10} y1={yTop} x2={18} y2={yTop} stroke="currentColor" strokeWidth={0.6} opacity={0.5} />
        <line x1={10} y1={yFoot} x2={18} y2={yFoot} stroke="currentColor" strokeWidth={0.6} opacity={0.5} />
        <line x1={14} y1={yTop} x2={14} y2={yFoot} stroke="currentColor" strokeWidth={0.4} opacity={0.35} />
        <text
          x={20}
          y={(yTop + yFoot) / 2}
          fontSize="7"
          fontFamily="var(--font-mono), monospace"
          fill="currentColor"
          opacity={0.6}
          dominantBaseline="middle"
        >
          {body.height} cm
        </text>
      </g>
    </svg>
  );
}

function toPoints(pts: P[]): string {
  return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

function shiftHex(hex: string, amount: number) {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const apply = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c + (amount > 0 ? 255 - c : c) * amount)));
  return `#${[apply(r), apply(g), apply(b)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}
