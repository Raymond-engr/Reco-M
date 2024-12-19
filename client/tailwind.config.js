module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          1: 'hsl(205, 86%, 17%)',
          2: 'hsl(205, 77%, 27%)',
          3: 'hsl(205, 72%, 37%)',
          4: 'hsl(205, 63%, 48%)',
          5: 'hsl(205, 78%, 60%)',
          6: 'hsl(205, 89%, 70%)',
          7: 'hsl(205, 90%, 76%)',
          8: 'hsl(205, 86%, 81%)',
          9: 'hsl(205, 90%, 88%)',
          10: 'hsl(205, 100%, 96%)',
        },
        grey: {
          1: 'hsl(209, 61%, 16%)',
          2: 'hsl(211, 39%, 23%)',
          3: 'hsl(209, 34%, 30%)',
          4: 'hsl(209, 28%, 39%)',
          5: 'hsl(210, 22%, 49%)',
          6: 'hsl(209, 23%, 60%)',
          7: 'hsl(211, 27%, 70%)',
          8: 'hsl(210, 31%, 80%)',
          9: 'hsl(212, 33%, 89%)',
          10: 'hsl(210, 36%, 96%)',
        },
        white: '#ffffff',
        black: '#222',
        red: {
          dark: 'hsl(360, 67%, 44%)',
          light: 'hsl(360, 71%, 66%)',
        },
        green: {
          dark: 'hsl(125, 67%, 44%)',
          light: 'hsl(125, 71%, 66%)',
        },
      },
      borderRadius: {
        DEFAULT: '0.25rem', // Match var(--radius)
      },
      spacing: {
        sm: '0.1rem', // Match var(--spacing)
      },
      boxShadow: {
        light: '0 5px 15px rgba(0, 0, 0, 0.1)', // Match var(--light-shadow)
        dark: '0 5px 15px rgba(0, 0, 0, 0.2)', // Match var(--dark-shadow)
      },
      maxWidth: {
        'screen-xl': '1170px', // Match var(--max-width)
        'fixed': '620px', // Match var(--fixed-width)
      },
    },
  },
  plugins: [],
};
