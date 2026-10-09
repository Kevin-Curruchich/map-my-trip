<template>
  <div
    class="og-root w-full h-full flex flex-col justify-between p-16"
    style="background-color: #FFA51F; color: #1C1917"
  >
    <div class="flex items-center">
      <svg width="72" height="72" viewBox="0 0 64 64">
        <path
          d="M14 6h36a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H41l-9 12-9-12h-9A10 10 0 0 1 4 38V16A10 10 0 0 1 14 6z"
          fill="#1C1917"
        />
        <circle cx="19" cy="27" r="4.5" fill="#FFA51F" />
        <circle cx="32" cy="27" r="4.5" fill="#12A150" />
        <circle cx="45" cy="27" r="4.5" fill="#FFA51F" />
      </svg>
      <span class="ml-4 text-5xl font-extrabold" style="letter-spacing: -0.03em">MapMyTrip</span>
    </div>
    <h1 class="text-[88px] leading-none font-extrabold" style="letter-spacing: -0.035em">
      Decidan juntos qué hacer
    </h1>
    <p class="text-4xl font-bold" style="color: #2B1A00">
      Planes en grupo con IA · se vota desde WhatsApp
    </p>
  </div>
</template>

<style>
/* nuxt-og-image reads the font family from the SFC style block. */
.og-root {
  font-family: "Manrope", sans-serif;
}
</style>
