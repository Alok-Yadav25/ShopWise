'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceStore } from '@/store/voiceStore';

interface VoiceButtonProps {
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceButton({ onClick, size = 'lg' }: VoiceButtonProps) {
  const { voiceState } = useVoiceStore();

  // Pre-compute wave bar heights to avoid Math.random() in render
  const waveHeights = useMemo(() =>
    [1, 2, 3, 4, 5].map((i) => [4, (i * 3 + 7) % 16 + 8, 4]),
    []
  );

  const isActive = voiceState === 'listening' || voiceState === 'processing';
  const isIdle = voiceState === 'idle';
  const isSuccess = voiceState === 'speaking';
  const isError = voiceState === 'error';

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSize = size === 'lg' ? 28 : size === 'md' ? 22 : 18;

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings when listening */}
      <AnimatePresence>
        {(isActive || isIdle) && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isActive ? [0.3, 0] : 0,
                scale: isActive ? [1, 1.8] : 1,
              }}
              transition={{
                duration: 1.5,
                repeat: isActive ? Infinity : 0,
                ease: 'easeOut',
              }}
              className={cn(
                'absolute rounded-full',
                size === 'lg' ? 'w-20 h-20' : size === 'md' ? 'w-16 h-16' : 'w-12 h-12',
                'bg-primary/20',
              )}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isActive ? [0.2, 0] : 0,
                scale: isActive ? [1, 2.2] : 1,
              }}
              transition={{
                duration: 1.5,
                repeat: isActive ? Infinity : 0,
                ease: 'easeOut',
                delay: 0.3,
              }}
              className={cn(
                'absolute rounded-full',
                size === 'lg' ? 'w-20 h-20' : size === 'md' ? 'w-16 h-16' : 'w-12 h-12',
                'bg-primary/10',
              )}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.92 }}
        animate={{
          scale: isActive ? [1, 1.05, 1] : 1,
        }}
        transition={{
          scale: {
            duration: isActive ? 1 : 0.2,
            repeat: isActive ? Infinity : 0,
            ease: 'easeInOut',
          },
        }}
        className={cn(
          'relative z-10 rounded-full flex items-center justify-center',
          'transition-all duration-300 shadow-lg cursor-pointer',
          sizeClasses[size],
          isActive && 'bg-primary text-white shadow-primary/30',
          isIdle && 'bg-primary text-white hover:bg-primary-dark hover:shadow-primary/40',
          isSuccess && 'bg-success text-white',
          isError && 'bg-danger/90 text-white hover:bg-danger',
        )}
        aria-label={
          isActive ? 'Stop listening' : isError ? 'Retry voice input' : 'Start voice input'
        }
      >
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex items-center gap-[3px]"
            >
              {waveHeights.map((heights, i) => (
                <motion.div
                  key={i}
                  className="wave-bar"
                  animate={{
                    height: heights,
                  }}
                  transition={{
                    duration: 0.6 + (i * 0.08),
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.1,
                  }}
                  style={{ width: 3, borderRadius: 2 }}
                />
              ))}
            </motion.div>
          )}
          {isIdle && (
            <motion.div
              key="mic"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <Mic size={iconSize} />
            </motion.div>
          )}
          {voiceState === 'speaking' && (
            <motion.div
              key="check"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <Check size={iconSize} />
            </motion.div>
          )}
          {isError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <AlertCircle size={iconSize} />
            </motion.div>
          )}
          {voiceState === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <Mic size={iconSize} className="animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
