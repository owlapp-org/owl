import { MantineThemeOverride } from "@mantine/core";

// A custom theme for this app
const theme: MantineThemeOverride = {
  fontFamily: "Verdana, sans-serif",
  fontFamilyMonospace: "Monaco, Courier, monospace",
  headings: { fontFamily: "Greycliff CF, sans-serif" },
  colors: {
    brand: [
      "#f0f5ff",
      "#d6e4ff",
      "#adc8ff",
      "#84a9ff",
      "#6690ff",
      "#3366ff",
      "#254edb",
      "#1939b7",
      "#102693",
      "#091666",
    ],
    secondary: [
      "#e6fcf5",
      "#c3fae8",
      "#96f2d7",
      "#63e6be",
      "#38d9a9",
      "#20c997",
      "#12b886",
      "#0ca678",
      "#099268",
      "#087f5b",
    ],
    error: [
      "#fff5f5",
      "#ffe3e3",
      "#ffc9c9",
      "#ffa8a8",
      "#ff8787",
      "#ff6b6b",
      "#fa5252",
      "#f03e3e",
      "#e03131",
      "#c92a2a",
    ],
  },
  primaryColor: "brand",
};

export default theme;
