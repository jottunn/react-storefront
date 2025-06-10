import localFont from "next/font/local";

// Explicitly type the font configurations
const openSans = localFont({
  src: [
    {
      path: "../../public/fonts/OpenSans-VariableFont_wdth,wght.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-opensans",
  adjustFontFallback: "Arial",
});

const raleway = localFont({
  src: [
    {
      path: "../../public/fonts/Raleway-VariableFont_wght.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-raleway",
  adjustFontFallback: "Arial",
});

// Export the class names directly
export const fontVariables = {
  openSans: openSans.variable,
  raleway: raleway.variable,
};
