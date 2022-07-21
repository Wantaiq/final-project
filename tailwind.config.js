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
    },
    extend: {
      boxShadow: {
        reviewBox: '0px 10.1px 8px 1px rgba (0,0,0)',
      },
      backgroundImage: {
        ink: "url('/images/ink.svg')",
        'ink-blot': "url('/images/ink-blot.svg')",
        'ink-splatter': "url('/images/ink-splatter.svg')",
        'ink-light': "url('/images/ink-light.svg')",
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
};
