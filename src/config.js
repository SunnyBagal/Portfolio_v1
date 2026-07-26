module.exports = {
  email: 'sunnybagal.1110@gmail.com',

  // ─── Decorative tech-stack backdrop ───────────────────────────────────────
  // Single switch that controls the entire background icon layer (About section).
  //   enabled: false  -> render nothing (no layout shift, clean original site)
  //   style: 'clean'  -> crisp original logos, force-tinted to one accent color
  //   style: 'sketch' -> DORMANT Rough.js hand-drawn path (kept for reversibility;
  //                      dropped as the shipped look — it can't render these logos
  //                      crisply). Flip here to A/B it; nothing was deleted.
  // Reverting the feature = flip these values and reload. Nothing to delete.
  TECH_ICONS: {
    enabled: true,
    style: 'clean', // 'clean' | 'sketch'
  },

  socialMedia: [
    {
      name: 'GitHub',
      url: 'https://github.com/SunnyBagal',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/sunny_11.10/',
    },
    {
      name: 'Twitter',
      url: 'https://x.com/Sunny_Bagal_11',
    },
    {
      name: 'Linkedin',
      url: 'https://www.linkedin.com/in/sunnybagal/',
    },
    {
      name: 'LeetCode',
      url: 'https://leetcode.com/u/SunnyBagal/',
    },
  ],

  navLinks: [
    {
      name: 'About',
      url: '/#about',
    },
    {
      name: 'Experience',
      url: '/#jobs',
    },
    {
      name: 'Work',
      url: '/#projects',
    },
    {
      name: 'Contact',
      url: '/#contact',
    },
  ],

  colors: {
    green: '#ffc44d',
    navy: '#100e0a',
    darkNavy: '#0a0906',
  },

  srConfig: (delay = 0, viewFactor = 0.1) => ({
    origin: 'bottom',
    distance: '20px',
    duration: 350,
    delay,
    rotate: { x: 0, y: 0, z: 0 },
    opacity: 0,
    scale: 1,
    easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    mobile: true,
    reset: false,
    useDelay: 'always',
    viewFactor,
    viewOffset: { top: 0, right: 0, bottom: 0, left: 0 },
  }),
};
