module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    backgroundSize: {
      auto: 'auto',
      cover: 'cover',
      contain: 'contain',
      350: '350px 350px',
    },
    extend: {
      backgroundImage: {
        bubble: "url('/images/bubble.svg')",
        'chat-bubble': "url('/images/chat-bubble.svg')",
        circle: "url('/images/circle.svg')",
        'scratch-line': "url('/images/scratch-line.svg')",
        ink: "url('/images/ink.svg')",
        'ink-blot': "url('/images/ink-blot.svg')",
        'ink-splatter': "url('/images/ink-splatter.svg')",
      },
    },
  },
  plugins: [],
};
