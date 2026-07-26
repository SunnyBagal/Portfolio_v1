import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/*
 * Split-flap (Vestaboard) board adapted from Aceternity UI's "Text Flipping
 * Board". Ported to this stack: React 17 + framer-motion (v6), plain JS, and
 * the Tailwind-v4-only bits (perspective / transform-3d / backface-hidden /
 * mask / aspect ratios) reimplemented as inline styles. Aceternity's dark-mode
 * colours are kept (the site is dark-only).
 */

const FLAP_CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*!@#$→()-+&=;:\'"%,./?°’';

const BOARD_ROWS = 6;
const BOARD_COLS = 22;

const BASE_COL_DELAY = 80;
const BASE_ROW_DELAY = 80;
const BASE_STEP_MS = 35;
const BASE_FLIP_S = 0.25;
const BASE_TOTAL_S =
  ((BOARD_COLS - 1) * BASE_COL_DELAY + (BOARD_ROWS - 1) * BASE_ROW_DELAY + 8 * BASE_STEP_MS) / 1000;

// Aceternity accent palette (dark-mode values).
const ACCENT_COLORS = [
  { top: '#dc2626', bottom: '#b91c1c', text: '#ffffff' }, // red-600/700
  { top: '#f97316', bottom: '#ea580c', text: '#ffffff' }, // orange-500/600
  { top: '#facc15', bottom: '#eab308', text: '#171717' }, // yellow-400/500
  { top: '#16a34a', bottom: '#15803d', text: '#ffffff' }, // green-600/700
  { top: '#2563eb', bottom: '#1d4ed8', text: '#ffffff' }, // blue-600/700
  { top: '#7c3aed', bottom: '#6d28d9', text: '#ffffff' }, // violet-600/700
  { top: '#ffffff', bottom: '#f5f5f5', text: '#171717' }, // white/neutral-100
];

// Aceternity dark-mode base colours.
const FLAP_BG = '#171717'; // neutral-900
const FLAP_PREV_BG = '#262626'; // neutral-800
const FLAP_TEXT = '#ffffff';
const CELL_BORDER = '#000000';
const SEAM = 'rgba(0,0,0,0.5)';
const BOARD_BG = '#171717'; // neutral-900

const CELL_TEXT_STYLE = { fontSize: 'clamp(6px, 2vw, 22px)', lineHeight: 1 };

const charBase = {
  position: 'absolute',
  left: 0,
  right: 0,
  height: '200%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none',
  fontFamily: 'var(--font-mono)',
  fontWeight: 700,
  letterSpacing: '0.05em',
  ...CELL_TEXT_STYLE,
};

// ── Individual Split-Flap Character ───────────────────────────────────

const FlapCell = React.memo(
  function FlapCell({ target, delay, stepMs, flipDuration, reducedMotion }) {
    const [current, setCurrent] = useState(' ');
    const [prev, setPrev] = useState(' ');
    const [flipId, setFlipId] = useState(0);
    const [accent, setAccent] = useState(null);
    const [prevAccent, setPrevAccent] = useState(null);
    const curRef = useRef(' ');
    const tgtRef = useRef(null);
    const accentRef = useRef(null);
    const startTimer = useRef(null);
    const stepTimer = useRef(null);

    useEffect(() => {
      if (startTimer.current) clearTimeout(startTimer.current);
      if (stepTimer.current) clearTimeout(stepTimer.current);
      startTimer.current = null;
      stepTimer.current = null;

      const normalized = FLAP_CHARS.includes(target.toUpperCase()) ? target.toUpperCase() : ' ';
      if (normalized === tgtRef.current) return undefined;
      tgtRef.current = normalized;

      // Reduced motion: snap straight to the target, no scramble / flip.
      if (reducedMotion) {
        curRef.current = normalized;
        setCurrent(normalized);
        setAccent(null);
        return undefined;
      }

      if (normalized === ' ' && curRef.current === ' ') return undefined;

      const scrambleCount =
        normalized === ' ' ? 3 + Math.floor(Math.random() * 3) : 7 + Math.floor(Math.random() * 6);

      const runStep = i => {
        const isLast = i === scrambleCount;
        const ch = isLast
          ? normalized
          : FLAP_CHARS[1 + Math.floor(Math.random() * (FLAP_CHARS.length - 1))];

        const newAccent = isLast
          ? null
          : Math.random() < 0.2
          ? ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)]
          : null;

        setPrev(curRef.current);
        setPrevAccent(accentRef.current);
        curRef.current = ch;
        accentRef.current = newAccent;
        setCurrent(ch);
        setAccent(newAccent);
        setFlipId(n => n + 1);

        if (!isLast) {
          stepTimer.current = setTimeout(() => runStep(i + 1), stepMs);
        }
      };

      startTimer.current = setTimeout(() => runStep(1), delay);

      return () => {
        if (startTimer.current) clearTimeout(startTimer.current);
        if (stepTimer.current) clearTimeout(stepTimer.current);
        startTimer.current = null;
        stepTimer.current = null;
        tgtRef.current = null;
      };
    }, [target, delay, stepMs, reducedMotion]);

    const show = current === ' ' ? ' ' : current;
    const showPrev = prev === ' ' ? ' ' : prev;

    const topBg = accent ? accent.top : FLAP_BG;
    const bottomBg = accent ? accent.bottom : FLAP_BG;
    const textColor = accent ? accent.text : FLAP_TEXT;
    const flapTopBg = prevAccent ? prevAccent.top : FLAP_PREV_BG;
    const flapTextColor = prevAccent ? prevAccent.text : FLAP_TEXT;
    const bottomDelay = flipDuration * 0.5;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          aspectRatio: '3 / 6',
          borderRadius: 3,
          border: `1px solid ${CELL_BORDER}`,
        }}>
        {/* Flap content area */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            perspective: '100px',
            transformStyle: 'preserve-3d',
          }}>
          {/* Static top – new character top half */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 'calc(50% - 0.5px)',
              overflow: 'hidden',
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
              background: topBg,
            }}>
            <div style={{ ...charBase, color: textColor, top: 0 }}>{show}</div>
          </div>

          {/* Static bottom – new character bottom half */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 'calc(50% - 0.5px)',
              overflow: 'hidden',
              borderBottomLeftRadius: 3,
              borderBottomRightRadius: 3,
              background: bottomBg,
            }}>
            <div style={{ ...charBase, color: textColor, bottom: 0 }}>{show}</div>
            {flipId > 0 && (
              <motion.div
                key={`s${flipId}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 60%)',
                }}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0 }}
                transition={{ duration: flipDuration * 1.3, ease: 'easeOut' }}
              />
            )}
          </div>

          {/* Flipping top flap – old character top half, drops down */}
          {flipId > 0 && (
            <motion.div
              key={flipId}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                zIndex: 10,
                height: 'calc(50% - 0.5px)',
                transformOrigin: 'bottom',
                overflow: 'hidden',
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
                background: flapTopBg,
              }}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: -100 }}
              transition={{ duration: flipDuration, ease: [0.55, 0.055, 0.675, 0.19] }}>
              <div style={{ ...charBase, color: flapTextColor, top: 0 }}>{showPrev}</div>
              <motion.div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1))',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: flipDuration }}
              />
            </motion.div>
          )}

          {/* Flipping bottom flap – new character bottom half, rises up */}
          {flipId > 0 && (
            <motion.div
              key={`b${flipId}`}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10,
                height: 'calc(50% - 0.5px)',
                transformOrigin: 'top',
                overflow: 'hidden',
                borderBottomLeftRadius: 3,
                borderBottomRightRadius: 3,
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
                background: bottomBg,
              }}
              initial={{ rotateX: 90 }}
              animate={{ rotateX: 0 }}
              transition={{
                duration: flipDuration * 0.85,
                delay: bottomDelay,
                ease: [0.33, 1.55, 0.64, 1],
              }}>
              <div style={{ ...charBase, color: textColor, bottom: 0 }}>{show}</div>
              <motion.div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: 'linear-gradient(to top, rgba(0,0,0,0), rgba(0,0,0,0.6))',
                }}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 0 }}
                transition={{ duration: flipDuration * 0.85, delay: bottomDelay }}
              />
            </motion.div>
          )}

          {/* Split line */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              zIndex: 20,
              height: 1,
              transform: 'translateY(-0.5px)',
              background: SEAM,
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Bottom stripes – decorative */}
        <div
          style={{
            height: 8,
            width: '100%',
            color: '#000000',
            background:
              'repeating-linear-gradient(to bottom, currentColor 0, currentColor 1px, transparent 1px, transparent 0.15rem)',
            WebkitMaskImage: 'linear-gradient(to top, #000 50%, transparent)',
            maskImage: 'linear-gradient(to top, #000 50%, transparent)',
          }}
        />
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.target === nextProps.target &&
    prevProps.delay === nextProps.delay &&
    prevProps.stepMs === nextProps.stepMs &&
    prevProps.flipDuration === nextProps.flipDuration &&
    prevProps.reducedMotion === nextProps.reducedMotion,
);

FlapCell.propTypes = {
  target: PropTypes.string.isRequired,
  delay: PropTypes.number.isRequired,
  stepMs: PropTypes.number.isRequired,
  flipDuration: PropTypes.number.isRequired,
  reducedMotion: PropTypes.bool.isRequired,
};

// ── Color Tile ────────────────────────────────────────────────────────

const COLOR_MAP = {
  '{R}': '#D32F2F',
  '{O}': '#F57C00',
  '{Y}': '#FBC02D',
  '{G}': '#43A047',
  '{B}': '#1E88E5',
  '{V}': '#8E24AA',
  '{W}': '#FAFAFA',
};

const ColorCell = React.memo(function ColorCell({ color }) {
  return (
    <div
      style={{
        aspectRatio: '3 / 5',
        borderRadius: 3,
        border: `2px solid ${CELL_BORDER}`,
        backgroundColor: color,
      }}
    />
  );
});

ColorCell.propTypes = { color: PropTypes.string.isRequired };

// ── Row Parser + Word Wrap ────────────────────────────────────────────

function parseRow(row) {
  const cells = [];
  let i = 0;
  while (i < row.length) {
    if (row[i] === '{' && i + 2 < row.length && row[i + 2] === '}') {
      const code = row.substring(i, i + 3);
      if (COLOR_MAP[code]) {
        cells.push({ type: 'color', hex: COLOR_MAP[code] });
        i += 3;
        continue;
      }
    }
    cells.push({ type: 'char', value: row[i] });
    i += 1;
  }
  return cells;
}

function wrapParagraph(paragraph, maxCols) {
  const lines = [];
  const words = paragraph.split(/[ \t]+/).filter(Boolean);
  let currentLine = '';

  words.forEach(word => {
    if (word.length > maxCols) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }
      lines.push(word.slice(0, maxCols));
      return;
    }
    if (!currentLine) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxCols) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

function wrapText(input, maxCols) {
  return input
    .split('\n')
    .flatMap(paragraph => (paragraph.trim() === '' ? [''] : wrapParagraph(paragraph, maxCols)));
}

// ── Main TextFlippingBoard Component ──────────────────────────────────

export function TextFlippingBoard({ rows, text, className, duration, reducedMotion }) {
  const scale = duration / BASE_TOTAL_S;
  const colDelay = BASE_COL_DELAY * scale;
  const rowDelay = BASE_ROW_DELAY * scale;
  const stepMs = BASE_STEP_MS * scale;
  const flipDur = Math.min(0.6, Math.max(0.15, BASE_FLIP_S * scale));

  const board = useMemo(() => {
    const grid = Array.from({ length: BOARD_ROWS }, () =>
      Array.from({ length: BOARD_COLS }, () => ({ type: 'char', value: ' ' })),
    );

    if (text) {
      const lines = wrapText(text, BOARD_COLS).slice(0, BOARD_ROWS);
      const startRow = Math.max(0, Math.floor((BOARD_ROWS - lines.length) / 2));
      lines.forEach((line, i) => {
        const row = startRow + i;
        if (row >= BOARD_ROWS) return;
        const parsed = parseRow(line);
        const startCol = Math.max(0, Math.floor((BOARD_COLS - parsed.length) / 2));
        parsed.forEach((cell, c) => {
          if (startCol + c < BOARD_COLS) grid[row][startCol + c] = cell;
        });
      });
    } else if (rows) {
      rows.forEach((row, r) => {
        if (r >= BOARD_ROWS) return;
        parseRow(row).forEach((cell, c) => {
          if (c < BOARD_COLS) grid[r][c] = cell;
        });
      });
    }
    return grid;
  }, [rows, text]);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        margin: '0 auto',
        width: '100%',
        maxWidth: '48rem',
        borderRadius: 16,
        background: BOARD_BG,
        padding: 16,
        boxShadow: '0 20px 70px -15px rgba(0,0,0,0.6)',
      }}>
      <div style={{ display: 'grid', gap: 3, gridTemplateColumns: `repeat(${BOARD_COLS}, 1fr)` }}>
        {board.map((row, r) =>
          row.map((cell, c) =>
            cell.type === 'color' ? (
              <ColorCell key={`${r}-${c}`} color={cell.hex} />
            ) : (
              <FlapCell
                key={`${r}-${c}`}
                target={cell.value}
                delay={c * colDelay + r * rowDelay}
                stepMs={stepMs}
                flipDuration={flipDur}
                reducedMotion={reducedMotion}
              />
            ),
          ),
        )}
      </div>
    </div>
  );
}

TextFlippingBoard.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.string),
  text: PropTypes.string,
  className: PropTypes.string,
  duration: PropTypes.number,
  reducedMotion: PropTypes.bool,
};

TextFlippingBoard.defaultProps = {
  rows: undefined,
  text: undefined,
  className: undefined,
  duration: BASE_TOTAL_S,
  reducedMotion: false,
};

export default TextFlippingBoard;
