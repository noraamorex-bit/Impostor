import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "node_modules/**", "*.local.mjs", "*.check.mjs"] },
  ...coreWebVitals,
  ...typescript,
];

export default config;
