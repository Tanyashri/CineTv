import React from 'react';
import { motion } from 'framer-motion';

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  onComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 0,
  onComplete,
}) => {
  const words = text.split(' ');

  // Accessibility: Check for prefers-reduced-motion
  const [shouldReduceMotion, setShouldReduceMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setShouldReduceMotion(event.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  if (shouldReduceMotion) {
    return <h1 className={className}>{text}</h1>;
  }

  // Animation variants for container
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08, // Stagger each word by 0.08 seconds
        delayChildren: delay,
      },
    },
  };

  // Animation variants for each word (Cinematic Reveal)
  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 25,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1], // Smooth cinematic easing curve
      },
    },
  };

  return (
    <motion.h1
      className={`flex flex-wrap items-center justify-center gap-x-[0.25em] gap-y-1 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={text}
      onAnimationComplete={onComplete}
    >
      {words.map((word, idx) => (
        <span
          key={idx}
          className="inline-block overflow-hidden"
          aria-hidden="true"
        >
          <motion.span
            className="inline-block"
            variants={wordVariants}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
};
