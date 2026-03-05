import { DetectedPose, CourtCalibration, PoseLandmark } from '@/types/video';

// MediaPipe Pose landmark indices
const POSE = {
  NOSE: 0,
  LEFT_EYE_INNER: 1, LEFT_EYE: 2, LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4, RIGHT_EYE: 5, RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7, RIGHT_EAR: 8,
  MOUTH_LEFT: 9, MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
  LEFT_WRIST: 15, RIGHT_WRIST: 16,
  LEFT_PINKY: 17, RIGHT_PINKY: 18,
  LEFT_INDEX: 19, RIGHT_INDEX: 20,
  LEFT_THUMB: 21, RIGHT_THUMB: 22,
  LEFT_HIP: 23, RIGHT_HIP: 24,
  LEFT_KNEE: 25, RIGHT_KNEE: 26,
  LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
  LEFT_HEEL: 29, RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31, RIGHT_FOOT_INDEX: 32,
};

const SKELETON_CONNECTIONS: [number, number][] = [
  // Torso
  [POSE.LEFT_SHOULDER, POSE.RIGHT_SHOULDER],
  [POSE.LEFT_SHOULDER, POSE.LEFT_HIP],
  [POSE.RIGHT_SHOULDER, POSE.RIGHT_HIP],
  [POSE.LEFT_HIP, POSE.RIGHT_HIP],
  // Left arm
  [POSE.LEFT_SHOULDER, POSE.LEFT_ELBOW],
  [POSE.LEFT_ELBOW, POSE.LEFT_WRIST],
  // Right arm
  [POSE.RIGHT_SHOULDER, POSE.RIGHT_ELBOW],
  [POSE.RIGHT_ELBOW, POSE.RIGHT_WRIST],
  // Left leg
  [POSE.LEFT_HIP, POSE.LEFT_KNEE],
  [POSE.LEFT_KNEE, POSE.LEFT_ANKLE],
  // Right leg
  [POSE.RIGHT_HIP, POSE.RIGHT_KNEE],
  [POSE.RIGHT_KNEE, POSE.RIGHT_ANKLE],
  // Face
  [POSE.LEFT_EAR, POSE.LEFT_EYE],
  [POSE.RIGHT_EAR, POSE.RIGHT_EYE],
  [POSE.LEFT_EYE, POSE.NOSE],
  [POSE.RIGHT_EYE, POSE.NOSE],
];

const PLAYER_COLORS = [
  '#22c55e', // green
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
];

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  poses: DetectedPose[],
  width: number,
  height: number
) {
  poses.forEach((pose, poseIndex) => {
    const color = PLAYER_COLORS[poseIndex % PLAYER_COLORS.length];
    const lm = pose.landmarks;
    if (!lm || lm.length < 33) return;

    // Draw connections
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';

    for (const [a, b] of SKELETON_CONNECTIONS) {
      const la = lm[a];
      const lb = lm[b];
      if (la.visibility < 0.5 || lb.visibility < 0.5) continue;

      ctx.beginPath();
      ctx.moveTo(la.x * width, la.y * height);
      ctx.lineTo(lb.x * width, lb.y * height);
      ctx.stroke();
    }

    // Draw joints
    for (let i = 0; i < lm.length; i++) {
      if (lm[i].visibility < 0.5) continue;
      const x = lm[i].x * width;
      const y = lm[i].y * height;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Player label
    const nose = lm[POSE.NOSE];
    if (nose.visibility > 0.5) {
      ctx.font = 'bold 14px system-ui';
      ctx.fillStyle = color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      const label = `J${poseIndex + 1}`;
      ctx.strokeText(label, nose.x * width - 10, nose.y * height - 20);
      ctx.fillText(label, nose.x * width - 10, nose.y * height - 20);
    }
  });
}

export function drawBoundingBoxes(
  ctx: CanvasRenderingContext2D,
  poses: DetectedPose[],
  width: number,
  height: number
) {
  poses.forEach((pose, poseIndex) => {
    const color = PLAYER_COLORS[poseIndex % PLAYER_COLORS.length];
    const lm = pose.landmarks;
    if (!lm || lm.length < 33) return;

    const visible = lm.filter((l) => l.visibility > 0.5);
    if (visible.length < 6) return;

    const xs = visible.map((l) => l.x * width);
    const ys = visible.map((l) => l.y * height);

    const pad = 15;
    const minX = Math.min(...xs) - pad;
    const minY = Math.min(...ys) - pad;
    const maxX = Math.max(...xs) + pad;
    const maxY = Math.max(...ys) + pad;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    ctx.setLineDash([]);

    // Label
    ctx.font = 'bold 13px system-ui';
    ctx.fillStyle = '#000';
    ctx.fillRect(minX, minY - 20, 30, 18);
    ctx.fillStyle = color;
    ctx.fillText(`J${poseIndex + 1}`, minX + 4, minY - 5);
  });
}

export function drawPaddleEstimate(
  ctx: CanvasRenderingContext2D,
  poses: DetectedPose[],
  width: number,
  height: number
) {
  poses.forEach((pose, poseIndex) => {
    const color = PLAYER_COLORS[poseIndex % PLAYER_COLORS.length];
    const lm = pose.landmarks;
    if (!lm || lm.length < 33) return;

    // Calculate body scale (shoulder to hip distance) for proportional paddle
    const lShoulder = lm[POSE.LEFT_SHOULDER];
    const lHip = lm[POSE.LEFT_HIP];
    const rShoulder = lm[POSE.RIGHT_SHOULDER];
    const rHip = lm[POSE.RIGHT_HIP];

    let torsoLen = 0;
    if (lShoulder.visibility > 0.4 && lHip.visibility > 0.4) {
      const dx = (lShoulder.x - lHip.x) * width;
      const dy = (lShoulder.y - lHip.y) * height;
      torsoLen = Math.sqrt(dx * dx + dy * dy);
    } else if (rShoulder.visibility > 0.4 && rHip.visibility > 0.4) {
      const dx = (rShoulder.x - rHip.x) * width;
      const dy = (rShoulder.y - rHip.y) * height;
      torsoLen = Math.sqrt(dx * dx + dy * dy);
    }
    if (torsoLen < 10) return; // Body too small to estimate paddle

    // Paddle length proportional to torso (~60% of torso)
    const maxPaddleLen = torsoLen * 0.6;
    const headRadius = Math.max(6, torsoLen * 0.08);

    // Only draw paddle for the dominant hand (the wrist furthest from body center)
    const hands: { wrist: PoseLandmark; index: PoseLandmark; elbow: PoseLandmark; label: string }[] = [
      { wrist: lm[POSE.LEFT_WRIST], index: lm[POSE.LEFT_INDEX], elbow: lm[POSE.LEFT_ELBOW], label: 'L' },
      { wrist: lm[POSE.RIGHT_WRIST], index: lm[POSE.RIGHT_INDEX], elbow: lm[POSE.RIGHT_ELBOW], label: 'R' },
    ];

    // Pick the hand with higher wrist (more likely holding paddle up)
    const validHands = hands.filter((h) => h.wrist.visibility > 0.5 && h.elbow.visibility > 0.4);
    if (validHands.length === 0) return;

    // Choose the hand whose wrist is higher (lower y = higher on screen)
    const hand = validHands.reduce((a, b) => (a.wrist.y < b.wrist.y ? a : b));

    const wx = hand.wrist.x * width;
    const wy = hand.wrist.y * height;
    const ex = hand.elbow.x * width;
    const ey = hand.elbow.y * height;

    // Direction: elbow -> wrist, extended beyond wrist
    const dx = wx - ex;
    const dy = wy - ey;
    const armLen = Math.sqrt(dx * dx + dy * dy);
    if (armLen < 3) return;

    const nx = dx / armLen;
    const ny = dy / armLen;

    const endX = wx + nx * maxPaddleLen;
    const endY = wy + ny * maxPaddleLen;

    // Paddle handle line
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, torsoLen * 0.02);
    ctx.lineCap = 'round';
    ctx.stroke();

    // Paddle head (oval at the end)
    const angle = Math.atan2(ny, nx);
    ctx.save();
    ctx.translate(endX, endY);
    ctx.rotate(angle);
    ctx.scale(1, 0.65);
    ctx.beginPath();
    ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
    ctx.restore();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(endX, endY);
    ctx.rotate(angle);
    ctx.scale(1, 0.65);
    ctx.beginPath();
    ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
    ctx.restore();
    ctx.fillStyle = color + '25';
    ctx.fill();
  });
}

export function drawCourtOverlay(
  ctx: CanvasRenderingContext2D,
  calibration: CourtCalibration,
  width: number,
  height: number
) {
  const { topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl } = calibration;

  // Convert normalized coords to pixel coords
  const p = (pt: { x: number; y: number }) => ({
    x: pt.x * width,
    y: pt.y * height,
  });

  const ptl = p(tl);
  const ptr = p(tr);
  const pbr = p(br);
  const pbl = p(bl);

  // Draw court outline
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(ptl.x, ptl.y);
  ctx.lineTo(ptr.x, ptr.y);
  ctx.lineTo(pbr.x, pbr.y);
  ctx.lineTo(pbl.x, pbl.y);
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  // Fill with translucent overlay
  ctx.fillStyle = '#22c55e10';
  ctx.beginPath();
  ctx.moveTo(ptl.x, ptl.y);
  ctx.lineTo(ptr.x, ptr.y);
  ctx.lineTo(pbr.x, pbr.y);
  ctx.lineTo(pbl.x, pbl.y);
  ctx.closePath();
  ctx.fill();

  // Draw net line (midpoint of sides)
  const midLeft = { x: (ptl.x + pbl.x) / 2, y: (ptl.y + pbl.y) / 2 };
  const midRight = { x: (ptr.x + pbr.x) / 2, y: (ptr.y + pbr.y) / 2 };
  ctx.strokeStyle = '#ffffff80';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(midLeft.x, midLeft.y);
  ctx.lineTo(midRight.x, midRight.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Service line markers
  const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });

  // Service lines at ~25% and ~75% from top
  for (const t of [0.25, 0.75]) {
    const left = lerp(ptl, pbl, t);
    const right = lerp(ptr, pbr, t);
    ctx.strokeStyle = '#ffffff40';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(left.x, left.y);
    ctx.lineTo(right.x, right.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Center line
  const topMid = { x: (ptl.x + ptr.x) / 2, y: (ptl.y + ptr.y) / 2 };
  const botMid = { x: (pbl.x + pbr.x) / 2, y: (pbl.y + pbr.y) / 2 };
  ctx.strokeStyle = '#ffffff30';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(topMid.x, topMid.y);
  ctx.lineTo(botMid.x, botMid.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Corner labels
  const labels = ['TL', 'TR', 'BR', 'BL'];
  const points = [ptl, ptr, pbr, pbl];
  ctx.font = 'bold 11px system-ui';
  ctx.fillStyle = '#22c55e';
  points.forEach((pt, i) => {
    ctx.fillText(labels[i], pt.x - 8, pt.y - 8);
  });
}

export function drawCalibrationGuide(
  ctx: CanvasRenderingContext2D,
  step: number,
  calibration: CourtCalibration | null,
  width: number,
  height: number
) {
  const cornerNames = ['Esquina Superior Izq', 'Esquina Superior Der', 'Esquina Inferior Der', 'Esquina Inferior Izq'];

  // Draw already placed points
  if (calibration) {
    const corners: (keyof CourtCalibration)[] = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
    ctx.fillStyle = '#22c55e';
    for (let i = 0; i < step; i++) {
      const pt = calibration[corners[i]];
      if (pt.x === 0 && pt.y === 0) continue;
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw lines between placed points
    if (step > 1) {
      ctx.strokeStyle = '#22c55e80';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < step; i++) {
        const pt = calibration[corners[i]];
        if (i === 0) ctx.moveTo(pt.x * width, pt.y * height);
        else ctx.lineTo(pt.x * width, pt.y * height);
      }
      ctx.stroke();
    }
  }

  // Instruction text
  ctx.fillStyle = '#000000aa';
  ctx.fillRect(0, height - 50, width, 50);
  ctx.font = 'bold 16px system-ui';
  ctx.fillStyle = '#22c55e';
  ctx.textAlign = 'center';
  ctx.fillText(
    `Toca: ${cornerNames[step]} (${step + 1}/4)`,
    width / 2,
    height - 20
  );
  ctx.textAlign = 'start';
}

export function drawAnnotationMarkers(
  ctx: CanvasRenderingContext2D,
  annotations: { timestamp: number; player: string; shotType: string; status: string }[],
  currentTime: number,
  width: number,
  height: number,
  duration: number
) {
  if (duration <= 0) return;

  // Draw timeline bar at top
  const barY = 8;
  const barH = 4;
  ctx.fillStyle = '#ffffff20';
  ctx.fillRect(20, barY, width - 40, barH);

  for (const ann of annotations) {
    const x = 20 + ((ann.timestamp / duration) * (width - 40));
    const isNear = Math.abs(ann.timestamp - currentTime) < 1;

    ctx.fillStyle = isNear ? '#f59e0b' : '#22c55e80';
    ctx.beginPath();
    ctx.arc(x, barY + barH / 2, isNear ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();

    if (isNear) {
      ctx.font = 'bold 11px system-ui';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`${ann.player}:${ann.shotType}${ann.status}`, x - 15, barY + barH + 16);
    }
  }
}
