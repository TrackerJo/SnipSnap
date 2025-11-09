import { motion } from "motion/react";
import { Camera, Scissors, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface TodoItemProps {
  todo: {
    id: string;
    text: string;
    completed: boolean;
    imageUrl?: string;
  };
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onComplete, onDelete }: TodoItemProps) {
  if (todo.completed) {
    const numPieces = 5;
    const pieceWidth = 100 / numPieces;

    return (
      <div className="relative overflow-visible mb-24" style={{ height: '80px', width: '100%' }}>
        {/* Multiple vertical pieces */}
        {[...Array(numPieces)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
            animate={{
              y: i % 2 === 0 ? -150 - Math.random() * 50 : 150 + Math.random() * 50,
              x: (i - Math.floor(numPieces / 2)) * 30 + (Math.random() - 0.5) * 40,
              rotate: (i % 2 === 0 ? -1 : 1) * (15 + Math.random() * 25),
              opacity: 0,
              scale: 0.9
            }}
            transition={{
              duration: 0.9 + Math.random() * 0.3,
              delay: 0.2 + i * 0.05,
              ease: [0.4, 0.0, 0.2, 1]
            }}
            onAnimationComplete={i === numPieces - 1 ? () => onDelete(todo.id) : undefined}
            className="absolute top-0 bottom-0 overflow-hidden"
            style={{
              left: `${i * pieceWidth}%`,
              width: `${pieceWidth}%`,
              originX: 0.5,
              originY: 0.5
            }}
          >
            <div
              className="h-full w-full relative"
              style={{
                transform: `translateX(-${i * 100}%)`
              }}
            >
              <Card className="p-4 bg-green-50 border-green-200 shadow-md" style={{ width: `${numPieces * 100}%`, height: '80px' }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <span className="line-through text-muted-foreground">{todo.text}</span>
                </div>
              </Card>
            </div>

            {/* Jagged left edge (except for first piece) */}
            {i > 0 && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-2"
                  style={{
                    background: 'linear-gradient(to right, #f0fdf4 0%, transparent 100%)',
                    clipPath: 'polygon(0 0, 80% 3%, 20% 6%, 90% 9%, 10% 12%, 85% 15%, 15% 18%, 75% 21%, 25% 24%, 95% 27%, 5% 30%, 80% 33%, 20% 36%, 90% 39%, 10% 42%, 85% 45%, 15% 48%, 75% 51%, 25% 54%, 95% 57%, 5% 60%, 80% 63%, 20% 66%, 90% 69%, 10% 72%, 85% 75%, 15% 78%, 75% 81%, 25% 84%, 95% 87%, 5% 90%, 80% 93%, 20% 96%, 90% 100%, 0 100%, 0 0)'
                  }}
                />
                <div className="absolute left-0 top-0 bottom-0 w-1 opacity-30"
                  style={{
                    background: 'linear-gradient(to right, #000 0%, transparent 100%)',
                    clipPath: 'polygon(0 0, 80% 3%, 20% 6%, 90% 9%, 10% 12%, 85% 15%, 15% 18%, 75% 21%, 25% 24%, 95% 27%, 5% 30%, 80% 33%, 20% 36%, 90% 39%, 10% 42%, 85% 45%, 15% 48%, 75% 51%, 25% 54%, 95% 57%, 5% 60%, 80% 63%, 20% 66%, 90% 69%, 10% 72%, 85% 75%, 15% 78%, 75% 81%, 25% 84%, 95% 87%, 5% 90%, 80% 93%, 20% 96%, 90% 100%, 0 100%, 0 0)'
                  }}
                />
              </>
            )}

            {/* Jagged right edge (except for last piece) */}
            {i < numPieces - 1 && (
              <>
                <div className="absolute right-0 top-0 bottom-0 w-2"
                  style={{
                    background: 'linear-gradient(to left, #f0fdf4 0%, transparent 100%)',
                    clipPath: 'polygon(100% 0, 20% 3%, 80% 6%, 10% 9%, 90% 12%, 15% 15%, 85% 18%, 25% 21%, 75% 24%, 5% 27%, 95% 30%, 20% 33%, 80% 36%, 10% 39%, 90% 42%, 15% 45%, 85% 48%, 25% 51%, 75% 54%, 5% 57%, 95% 60%, 20% 63%, 80% 66%, 10% 69%, 90% 72%, 15% 75%, 85% 78%, 25% 81%, 75% 84%, 5% 87%, 95% 90%, 20% 93%, 80% 96%, 10% 100%, 100% 100%, 100% 0)'
                  }}
                />
                <div className="absolute right-0 top-0 bottom-0 w-1 opacity-30"
                  style={{
                    background: 'linear-gradient(to left, #000 0%, transparent 100%)',
                    clipPath: 'polygon(100% 0, 20% 3%, 80% 6%, 10% 9%, 90% 12%, 15% 15%, 85% 18%, 25% 21%, 75% 24%, 5% 27%, 95% 30%, 20% 33%, 80% 36%, 10% 39%, 90% 42%, 15% 45%, 85% 48%, 25% 51%, 75% 54%, 5% 57%, 95% 60%, 20% 63%, 80% 66%, 10% 69%, 90% 72%, 15% 75%, 85% 78%, 25% 81%, 75% 84%, 5% 87%, 95% 90%, 20% 93%, 80% 96%, 10% 100%, 100% 100%, 100% 0)'
                  }}
                />
              </>
            )}
          </motion.div>
        ))}

        {/* Vertical flash effects at cut lines */}
        {[...Array(numPieces - 1)].map((_, i) => (
          <motion.div
            key={`flash-${i}`}
            initial={{ scaleY: 0, opacity: 0, originY: 0.5 }}
            animate={{
              scaleY: [0, 1, 1],
              opacity: [0, 0.7, 0]
            }}
            transition={{
              duration: 0.3,
              delay: 0.1 + i * 0.05,
              times: [0, 0.4, 1],
              ease: "easeInOut"
            }}
            className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white to-transparent blur-sm"
            style={{ left: `${(i + 1) * pieceWidth}%`, transform: "translateX(-50%)", zIndex: 10 }}
          />
        ))}

        {/* Paper fiber particles along vertical cuts */}
        {[...Array(16)].map((_, i) => {
          const cutLineIndex = Math.floor(i / 4);
          const xPosition = ((cutLineIndex + 1) * pieceWidth) + (Math.random() - 0.5) * 8;
          const yStart = 25 + (i % 4) * 15;

          return (
            <motion.div
              key={i}
              initial={{
                x: `${xPosition}%`,
                y: `${yStart}%`,
                opacity: 0,
                scale: 0,
                rotate: 0
              }}
              animate={{
                x: `${xPosition + (Math.random() - 0.5) * 60}%`,
                y: `${yStart + (Math.random() > 0.5 ? -80 : 80) + (Math.random() - 0.5) * 40}%`,
                opacity: [0, 0.9, 0.7, 0],
                scale: [0, 1.3, 0.9, 0.2],
                rotate: Math.random() * 1080 - 540
              }}
              transition={{
                duration: 1.1 + Math.random() * 0.4,
                delay: 0.15 + i * 0.025,
                ease: [0.4, 0.0, 0.2, 1]
              }}
              className="absolute rounded-sm"
              style={{
                zIndex: 15,
                width: Math.random() > 0.5 ? '4px' : '3px',
                height: Math.random() * 8 + 6 + 'px',
                background: i % 3 === 0
                  ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
                  : i % 3 === 1
                    ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                    : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
              }}
            />
          );
        })}

        {/* Sparkle effects along vertical cut lines */}
        {[...Array(numPieces - 1)].map((_, cutIndex) => (
          [...Array(3)].map((_, sparkleIndex) => (
            <motion.div
              key={`sparkle-${cutIndex}-${sparkleIndex}`}
              initial={{
                x: `${(cutIndex + 1) * pieceWidth}%`,
                y: `${25 + sparkleIndex * 25}%`,
                opacity: 0,
                scale: 0
              }}
              animate={{
                x: [`${(cutIndex + 1) * pieceWidth}%`, `${(cutIndex + 1) * pieceWidth + (Math.random() - 0.5) * 15}%`],
                y: [`${25 + sparkleIndex * 25}%`, `${15 + sparkleIndex * 20}%`],
                opacity: [0, 0.9, 0],
                scale: [0, 1.4, 0]
              }}
              transition={{
                duration: 0.6,
                delay: 0.1 + cutIndex * 0.05 + sparkleIndex * 0.08,
                ease: "easeOut"
              }}
              className="absolute"
              style={{ zIndex: 25 }}
            >
              <div className="text-sm" style={{
                color: (cutIndex + sparkleIndex) % 2 === 0 ? '#fbbf24' : '#a7f3d0',
                filter: 'drop-shadow(0 0 2px rgba(251, 191, 36, 0.5))'
              }}>✨</div>
            </motion.div>
          ))
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4 hover:shadow-md transition-shadow border-2 border-dashed" style={{ borderColor: '#A7C7E7', backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px 0 rgba(31, 41, 55, 0.10)' }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#A7C7E7' }}>
              <Scissors className="h-5 w-5 text-white" />
            </div>
            <span className="text-foreground">{todo.text}</span>
          </div>

          <Button
            onClick={() => onComplete(todo.id)}
            size="sm"
            style={{
              backgroundColor: '#A7C7E7',
              color: '#1F2937'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7FB2E5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#A7C7E7';
            }}
          >
            <Camera className="h-4 w-4 mr-2" />
            Snap to Complete
          </Button>
        </div>

        {/* Decorative dashed lines */}
        <div className="absolute top-2 right-2" style={{ color: '#A7C7E7' }}>
          <svg width="20" height="20" viewBox="0 0 20 20">
            <line x1="0" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="2" strokeDasharray="2,2" />
            <line x1="10" y1="0" x2="10" y2="20" stroke="currentColor" strokeWidth="2" strokeDasharray="2,2" />
          </svg>
        </div>
      </Card>
    </motion.div>
  );
}
