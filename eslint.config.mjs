// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Agent skills are third-party code installed with `npx skills add`.
  { ignores: ['.agents/**', '.claude/**'] },
)
