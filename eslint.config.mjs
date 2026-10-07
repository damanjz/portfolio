// Next 16 ships its lint presets as native flat configs; import them directly.
// (Wrapping them in FlatCompat made ESLint 9 crash with "Converting circular structure to JSON".)
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  // static export: next/image cannot optimise here; scripts/sizes.mjs writes the srcset copies instead
  { rules: { "@next/next/no-img-element": "off" } },
  { ignores: [".next/**", "out/**", "node_modules/**", ".design-*/**", "ds-bundle/**", ".design-sync/**", ".ds-sync/**", "next-env.d.ts"] },
];

export default eslintConfig;
