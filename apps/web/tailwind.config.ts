import sharedConfig from "@repo/ui/tailwind.config"
import type { Config } from "tailwindcss"

const config: Pick<Config, "content" | "presets"> = {
  content: [
    "./app/**/*.tsx",
    "./components/**/*.tsx",
    "./lib/**/*.tsx",
    "../../packages/ui/src/**/*.{tsx,ts}"
  ],
  presets: [sharedConfig],
}

export default config
