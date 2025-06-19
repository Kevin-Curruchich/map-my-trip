// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  // Your custom configs here
  {
    extends: [
      "plugin:nuxt/recommended",
      "plugin:vue/vue3-recommended",
      "plugin:prettier/recommended",
    ],
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off",
      "vue/require-default-prop": "off",
      "vue/no-unused-vars": "warn",
    },
  }
);
