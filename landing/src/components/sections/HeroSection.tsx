'use client';

import { motion } from 'framer-motion';
import MascotSVG from '@/components/mascot/MascotSVG';
import DownloadButton from '@/components/ui/DownloadButton';
import GitHubButton from '@/components/ui/GitHubButton';

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center relative z-[1]">
      <div className="flex flex-col items-center text-center gap-6 px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <MascotSVG />
        </motion.div>

        <motion.h1
          className="font-extrabold leading-[1.1] tracking-tight"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Meet{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, var(--accent-light), var(--accent-tip))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Fleeble
          </span>
          .<br />
          Your AI&apos;s<br />new best friend.
        </motion.h1>

        <motion.p
          className="font-bold max-w-[380px] leading-relaxed"
          style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'rgba(var(--card-text-rgb), 0.55)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Approve actions, answer questions & stay in the loop with your AI coding tools — without switching windows.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col items-center gap-4"
        >
          <DownloadButton />
          <GitHubButton />
        </motion.div>
      </div>
    </section>
  );
}
