// CineTV Paystra Motion Language Configuration & Tokens

export const MOTION_TRANSITIONS = {
  // Paystra Easing: A custom cubic bezier representing ultra-smooth cinematic ease-out
  easing: [0.16, 1, 0.3, 1], // easeOutExpo
  
  // Easing presets
  easeIn: [0.3, 0, 0.8, 0.15],
  easeInOut: [0.76, 0, 0.24, 1],

  // Consistent durations (in seconds)
  duration: {
    fast: 0.2,     // Tooltips, button hover scales
    normal: 0.4,   // Standard transitions, tabs, list item entrances
    slow: 0.65,    // Page transitions, modal transitions, main container enters
    slower: 1.2,   // Background elements, loading animations
  },

  // Physics-based spring config tokens for natural movement
  spring: {
    type: 'spring',
    stiffness: 280,
    damping: 26,
    mass: 0.6,
  },
  
  // Custom spring for cards, menus, and overlays
  springSmooth: {
    type: 'spring',
    stiffness: 140,
    damping: 18,
    mass: 0.8,
  },
};

export const MOTION_VARIANTS = {
  // Page Transition variants
  page: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Parent container stagger controls
  staggerContainer: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  },

  // Child list item entry variants
  staggerItem: {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: MOTION_TRANSITIONS.duration.normal,
        ease: MOTION_TRANSITIONS.easing,
      }
    },
  },

  // Modal overlays and popup dialogues
  modal: {
    hidden: { opacity: 0, scale: 0.96, y: 8 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: MOTION_TRANSITIONS.duration.normal,
        ease: MOTION_TRANSITIONS.easing,
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.96, 
      y: 8,
      transition: {
        duration: MOTION_TRANSITIONS.duration.fast,
        ease: MOTION_TRANSITIONS.easing,
      }
    },
  },

  // General panel transitions (tabs, accordion etc)
  tabContent: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  },
};
