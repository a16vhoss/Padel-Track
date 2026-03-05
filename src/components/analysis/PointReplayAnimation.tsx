'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shot, PlayerId, AllPlayerPositions, PlayerCoords } from '@/types/shot';
import { Team } from '@/types/match';
import { getFloorZone } from '@/lib/zones/zone-metadata';
import { ZoneDestination } from '@/types/zones';

interface PointReplayAnimationProps {
  shots: Shot[];
  teams: [Team, Team];
}

const PLAYER_IDS: PlayerId[] = ['J1', 'J2', 'J3', 'J4'];
const RADIUS = 16;
const BALL_RADIUS = 6;

function getTeamColor(player: PlayerId, teams: [Team, Team]): string {
  const isTeam1 = player === 'J1' || player === 'J2';
  return isTeam1 ? (teams[0].color || '#22c55e') : (teams[1].color || '#3b82f6');
}

function getPlayerLabel(player: PlayerId, teams: [Team, Team]): string {
  const isTeam1 = player === 'J1' || player === 'J2';
  const team = isTeam1 ? teams[0] : teams[1];
  const playerIdx = (player === 'J1' || player === 'J3') ? 0 : 1;
  return team.players[playerIdx].shortName.slice(0, 2).toUpperCase();
}

function getZoneCenter(destination: ZoneDestination | null): PlayerCoords | null {
  if (!destination) return null;
  if (destination.type === 'single') {
    const zone = getFloorZone(destination.zone);
    return { x: zone.center.x, y: zone.center.y };
  }
  const z1 = getFloorZone(destination.primary);
  const z2 = getFloorZone(destination.secondary);
  return {
    x: Math.round((z1.center.x + z2.center.x) / 2),
    y: Math.round((z1.center.y + z2.center.y) / 2),
  };
}

function getShotStatusLabel(status: string): string {
  switch (status) {
    case 'W': return 'Winner';
    case 'X': return 'Error';
    case 'N': return 'No llega';
    case 'DF': return 'Doble Falta';
    default: return '';
  }
}

function getShotStatusColor(status: string): string {
  switch (status) {
    case 'W': return '#22c55e';
    case 'X': return '#ef4444';
    case 'N': return '#f59e0b';
    case 'DF': return '#ef4444';
    default: return '#888';
  }
}

export function PointReplayAnimation({ shots, teams }: PointReplayAnimationProps) {
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if shots have position data
  const hasPositions = shots.some((s) => s.playerPositions);
  if (!hasPositions || shots.length === 0) return null;

  const currentShot = shots[currentShotIndex];

  // Get positions for current shot (fallback to previous or default)
  const getPositionsForShot = (index: number): AllPlayerPositions => {
    for (let i = index; i >= 0; i--) {
      if (shots[i].playerPositions) return shots[i].playerPositions!;
    }
    return {
      J1: { x: 300, y: 100 }, J2: { x: 100, y: 100 },
      J3: { x: 300, y: 400 }, J4: { x: 100, y: 400 },
    };
  };

  const currentPositions = getPositionsForShot(currentShotIndex);
  const ballPos = getZoneCenter(currentShot?.destination) || { x: 200, y: 250 };

  // Playback control
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const delay = (900 / speed);
    timerRef.current = setTimeout(() => {
      if (currentShotIndex < shots.length - 1) {
        setCurrentShotIndex((i) => i + 1);
      } else {
        setIsPlaying(false);
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentShotIndex, shots.length, speed]);

  const handlePlay = () => {
    if (currentShotIndex >= shots.length - 1) {
      setCurrentShotIndex(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentShotIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentShotIndex((i) => Math.min(shots.length - 1, i + 1));
  };

  const transitionDuration = 0.6 / speed;

  return (
    <div className="space-y-3">
      {/* Court with animated players */}
      <div className="relative w-full max-w-md mx-auto">
        <svg
          viewBox="0 0 400 500"
          className="w-full h-auto rounded-lg overflow-hidden"
          style={{ background: '#0a1f12' }}
        >
          {/* Court lines */}
          <rect x="0" y="0" width="400" height="500" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          <line x1="200" y1="0" x2="200" y2="500" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="0" y1="140" x2="400" y2="140" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="0" y1="315" x2="400" y2="315" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Zone labels */}
          <text x="200" y="70" textAnchor="middle" fill="rgba(255,255,255,0.08)" fontSize="14">RED</text>
          <text x="200" y="228" textAnchor="middle" fill="rgba(255,255,255,0.08)" fontSize="14">MEDIA</text>
          <text x="200" y="408" textAnchor="middle" fill="rgba(255,255,255,0.08)" fontSize="14">FONDO</text>

          {/* Ball trajectory line */}
          {currentShotIndex > 0 && (() => {
            const prevBall = getZoneCenter(shots[currentShotIndex - 1]?.destination);
            if (!prevBall) return null;
            return (
              <motion.line
                x1={prevBall.x}
                y1={prevBall.y}
                x2={ballPos.x}
                y2={ballPos.y}
                stroke="rgba(255,255,0,0.3)"
                strokeWidth="2"
                strokeDasharray="4,4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: transitionDuration * 0.5 }}
              />
            );
          })()}

          {/* Ball */}
          <motion.circle
            cx={ballPos.x}
            cy={ballPos.y}
            r={BALL_RADIUS}
            fill="#fbbf24"
            stroke="white"
            strokeWidth={1.5}
            animate={{ cx: ballPos.x, cy: ballPos.y }}
            transition={{ duration: transitionDuration, ease: 'easeInOut' }}
          />

          {/* Players */}
          {PLAYER_IDS.map((pid) => {
            const pos = currentPositions[pid];
            const color = getTeamColor(pid, teams);
            const label = getPlayerLabel(pid, teams);
            const isActive = currentShot?.player === pid;

            return (
              <g key={pid}>
                {/* Active player glow */}
                {isActive && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={RADIUS + 6}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    opacity={0.5}
                    animate={{
                      cx: pos.x,
                      cy: pos.y,
                      r: [RADIUS + 4, RADIUS + 8, RADIUS + 4],
                    }}
                    transition={{
                      cx: { duration: transitionDuration, ease: 'easeInOut' },
                      cy: { duration: transitionDuration, ease: 'easeInOut' },
                      r: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
                    }}
                  />
                )}

                {/* Player circle */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isActive ? RADIUS + 2 : RADIUS}
                  fill={color}
                  stroke="white"
                  strokeWidth={isActive ? 3 : 2}
                  opacity={isActive ? 1 : 0.8}
                  animate={{ cx: pos.x, cy: pos.y }}
                  transition={{ duration: transitionDuration, ease: 'easeInOut' }}
                />

                {/* Player label */}
                <motion.text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={10}
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                  animate={{ x: pos.x, y: pos.y }}
                  transition={{ duration: transitionDuration, ease: 'easeInOut' }}
                >
                  {label}
                </motion.text>
              </g>
            );
          })}

          {/* Shot info label */}
          {currentShot && (
            <g>
              <rect
                x="120"
                y="4"
                width="160"
                height="28"
                rx="6"
                fill="rgba(0,0,0,0.7)"
              />
              <text
                x="200"
                y="22"
                textAnchor="middle"
                fill={currentShot.status ? getShotStatusColor(currentShot.status) : 'white'}
                fontSize="11"
                fontWeight="bold"
              >
                {getPlayerLabel(currentShot.player, teams)} - {currentShot.type}
                {currentShot.status ? ` (${getShotStatusLabel(currentShot.status)})` : ''}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Progress */}
        <span className="text-xs text-muted font-mono w-16">
          {currentShotIndex + 1}/{shots.length}
        </span>

        {/* Playback buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={currentShotIndex === 0}
            className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {isPlaying ? (
            <button
              onClick={handlePause}
              className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handlePlay}
              className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={currentShotIndex >= shots.length - 1}
            className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-1">
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                speed === s
                  ? 'bg-primary text-black border-primary font-bold'
                  : 'bg-card border-border text-muted hover:text-foreground'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-1">
        <div className="flex gap-0.5">
          {shots.map((shot, i) => (
            <button
              key={shot.id}
              onClick={() => { setIsPlaying(false); setCurrentShotIndex(i); }}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i === currentShotIndex
                  ? 'bg-primary'
                  : i < currentShotIndex
                    ? 'bg-primary/40'
                    : 'bg-border'
              }`}
              title={`Golpe ${i + 1}: ${shot.player} ${shot.type}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
