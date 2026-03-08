'use client';

import { motion } from 'framer-motion';
import TrayMenuPreview from '@/components/menu/TrayMenuPreview';

export default function MenuSection() {
  return (
    <section className="py-32 px-8 relative z-[1]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-4xl md:text-5xl font-extrabold mb-5"
            style={{ letterSpacing: '-0.02em' }}
          >
            Your{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--accent-light), var(--accent-tip))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Command Center
            </span>
          </h2>
          <p className="text-xl max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(var(--card-text-rgb), 0.5)' }}>
            Your clipboard, timers, notes, themes and integrations — all in one beautiful tray menu.
          </p>
        </motion.div>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TrayMenuPreview />
        </motion.div>
      </div>
    </section>
  );
}
