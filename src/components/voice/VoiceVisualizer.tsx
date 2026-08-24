'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceStore } from '@/store/voiceStore';
import { cn } from '@/lib/utils';

interface VoiceVisualizerProps {
  className?: string;
}

// Pre-compute stable random values for the waveform to avoid impure renders
const WAVEFORM_HEIGHTS = Array.from({ length: 20 }, (_, i) => 3 + ((i * 7 + 3) % 18));
const WAVEFORM_DURATIONS = Array.from({ length: 20 }, (_, i) => 0.5 + ((i * 3 + 1) % 5) / 10);

export function VoiceVisualizer({ className }: VoiceVisualizerProps) {
  const { voiceState, transcript, interimTranscript } = useVoiceStore();

  const isActive = voiceState === 'listening';
  const isProcessing = voiceState === 'processing';

  const waveformData = useMemo(() => WAVEFORM_HEIGHTS.map((height, i) => ({
    height,
    duration: WAVEFORM_DURATIONS[i],
    delay: i * 0.05,
  })), []);

  return (
    <AnimatePresence mode="wait">
      {(isActive || isProcessing) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={cn('text-center space-y-4', className)}
        >
          {/* Waveform */}
          {isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-[3px] h-6"
            >
              {waveformData.map((bar, i) => (
                <motion.div
                  key={i}
                  className="w-[2px] rounded-full bg-primary/40"
                  animate={{
                    height: [3, bar.height, 3],
                  }}
                  transition={{
                    duration: bar.duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: bar.delay,
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* Status text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-text-muted"
          >
            {isActive ? 'Listening...' : isProcessing ? 'Understanding...' : ''}
          </motion.p>

          {/* Transcript */}
          {(transcript || interimTranscript) && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-sm mx-auto"
            >
              <div className="relative inline-block">
                {interimTranscript && (
                  <p className="text-lg text-text-primary/50 italic">
                    &ldquo;{interimTranscript}&rdquo;
                  </p>
                )}
                {transcript && (
                  <p className="text-lg text-text-primary font-medium">
                    &ldquo;{transcript}&rdquo;
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
