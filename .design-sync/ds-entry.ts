/**
 * Design-sync bundle entry — re-exports the app's default-exported components
 * as the named exports the DS bundle assigns onto window.DamanPortfolio.
 */
export { default as Stage } from "./shims/stage";
export { default as Hero } from "../src/components/Hero";
export { default as StatusBar } from "../src/components/StatusBar";
export { default as Work } from "../src/components/Work";
export { default as Principles } from "../src/components/Principles";
export { default as Stack } from "../src/components/Stack";
export { default as Contact } from "../src/components/Contact";
export { default as Footer } from "../src/components/Footer";
export { default as CommandPalette } from "../src/components/CommandPalette";
export { default as Gallery } from "../src/components/Gallery";
export { default as DetailBar } from "../src/components/DetailBar";
