const getSpacing = (base /* number */, unit /* "px" | "rem" */, values /* number[] */) =>
  values.reduce((acc, value) => ({ ...acc, [value]: base * value + unit }), {});

const spacing = getSpacing(
  0.4,
  "rem",
  [
    0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 6.5, 7, 8, 10, 11, 12, 14, 16, 15, 18, 19, 21, 22, 28, 85,
    256, 350,
  ]
);

module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  mode: "jit",
  theme: {
    extend: {
      screens: {
        xs: "375px",
      },
      container: {
        center: true,
        padding: "1.6rem",
        screens: {
          "2xl": "1440px",
        },
      },
      colors: {
        action: {
          1: "#0b9446",
          2: "rgba(11, 148, 70, 0.8)",
          3: "rgba(11, 148, 70, 0.6)",
          4: "rgba(11, 148, 70, 0.4)",
          5: "rgba(11, 148, 70, 0.2)",
        },
        disabled: {
          DEFAULT: "#B2CCC0",
        },
        brand: {
          DEFAULT: "#0b9446",
        },
        main: {
          DEFAULT: "#000000",
          1: "#394052",
          2: "#8A919F",
          3: "#B9C1CF",
          4: "rgba(57, 64, 82, 0.15)",
          5: "#EEF1F7",
          6: "rgb(240,240,240)",
        },
      },
      spacing: {
        px: "1px",
        ...spacing,
      },
      borderWidth: {
        DEFAULT: "1px",
      },
      fontFamily: {
        sans: ["Open Sans"],
      },
      fontWeight: {
        normal: 400,
        regular: 500,
        semibold: 600,
        bold: 800,
      },
      fontSize: {
        xs: ["1.2rem", "1.6rem"],
        sm: ["1.3rem", "2.1rem"],
        base: ["1.5rem", "2rem"],
        md: ["1.6rem", "2.5rem"],
        lg: ["2.4rem", "3.2rem"],
        xl: ["3.2rem", "4.6rem"],
      },
      borderRadius: {
        DEFAULT: "4px",
        full: "50%",
      },
      boxShadow: {
        "decorative-center": "0 32px 0 -16px #394052",
        decorative: "16px 16px 0 #394052",
        modal: "0px 4px 20px 0px rgba(0, 0, 0, 0.12)",
      },
      gridTemplateColumns: {
        listing: "250px auto",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"), // eslint-disable-line
    require("@tailwindcss/typography"), // eslint-disable-line
    require("@tailwindcss/aspect-ratio"), // eslint-disable-line
    require("tailwind-scrollbar-hide"), // eslint-disable-line
  ],
};
