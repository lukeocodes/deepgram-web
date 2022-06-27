export default {
  content: ["./public/**/*.html", "./src/**/*.astro"],
  theme: {
    extend: {
      lineHeight: {
        '11': '2.75rem',
        '12': '3rem',
        '13': '3.25rem',
        '14': '3.5rem',
        '15': '3.75rem',
        '16': '4rem',
        '17': '4.25rem',
      },
      colors: {
        transparent: "transparent",
        current: "currentColor",
        black: "#000000",
        white: "#ffffff",
        blueberry: "#1c4374",
        darkCharcoal: "#141E29",
        midCharcoal: "#1D2630",
        ink: "#1E2C3C",
        steel: "#4F6278",
        casper: "#AAB8CD",
        cloud: "#D7DFEB",
        cloud30: "rgba(215,223,235,.3)",
        shuttleGray: "#6B6E76",
        almostBlack: "#0A121B",
        fireEngine: "#FB3640",
        coral: "#FE5C5C",
        meadow: "#38EDAC",
        grass: "#00A971",
        watercourse: "#008752",
        evergreen: "#025445",
        mintChip: "#DAFFF2",
        mist: "#F7F9FC",
        rock: "#354659",
        lightPurple: "#A8ACFF",
        storm: "#66788D",
        stone: "#758AA2",
        sunflower: "#FFD34B",
        gold: "#FBAC18",
        http: {
          get: "#2B2BFA",
          options: "#2B2BFA",
          patch: "#2B2BFA",
          post: "#00A971",
          put: "#A56FFF",
          delete: "#FB3640",
        },
        language: {
          nodejs: {
            green: "#3C873A",
            grey: "#303030",
          },
          python: {
            yellow: "#FFE873",
            blue: "#306998",
          },
        },
        brand: {
          twilio: "#306998",
          zoom: "#2D8CFF",
          facebook: "#4267B2",
          hackernews: "#f75500",
          linkedin: "#0072b1",
          pocket: "#f83153",
          reddit: "#ff4301",
          slack: "#4a154b",
          twitch: "#9146ff",
          twitter: "#1da1f2",
          vk: "#4a76a8",
          weibo: "#e6162d",
          stackoverflow: "#ff9900",
          github: "#24292e",
          youtube: "#ff0000",
        },
      },
    },
  },
  plugins: [],
};
