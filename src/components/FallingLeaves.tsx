interface FallingLeaf {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
  opacity: number;
  shape: string;
}

interface FallingLeavesProps {
  count?: number;
}

const LEAF_COLORS = [
  '#DC2626', // червоний
  '#B91C1C', // темночервоний
  '#EA580C', // помаранчевий
  '#C2410C', // темнопомаранчевий
  '#F59E0B', // жовто-помаранчевий
  '#D97706', // золотисто-жовтий
  '#78350F', // темножовто-коричневий
  '#9A3412', // темний памфірний
];

const LEAF_SHAPES = [
  'rounded-[60%_40%_70%_30%/50%_60%_50%_50%]',
  'rounded-[55%_45%_65%_35%/45%_55%_45%_55%]',
  'rounded-[70%_30%_50%_50%/60%_40%_40%_60%]',
];

export default function FallingLeaves({ count = 24 }: FallingLeavesProps) {
  const leaves: FallingLeaf[] = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: Math.random() * 12 + 4,
    delay: Math.random() * 20,
    duration: Math.random() * 12 + 10,
    color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
    opacity: Math.random() * 0.4 + 0.35,
    shape: LEAF_SHAPES[Math.floor(Math.random() * LEAF_SHAPES.length)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className={`absolute will-change-transform drop-shadow-sm animate-fall-sway ${leaf.shape}`}
          style={{
            left: `${leaf.left}%`,
            top: `-${leaf.size}px`,
            width: `${leaf.size}px`,
            height: `${leaf.size}px`,
            backgroundColor: leaf.color,
            animationDuration: `${leaf.duration}s`,
            animationDelay: `-${leaf.delay}s`,
            '--leaf-opacity': leaf.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
