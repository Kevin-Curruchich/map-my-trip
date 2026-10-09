<template>
  <section class="container mx-auto grid items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
    <div>
      <UBadge color="success" variant="subtle" size="lg" class="rounded-full">
        Planes en grupo con IA
      </UBadge>
      <h1 class="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-highlighted sm:text-5xl lg:text-6xl">
        Decidan juntos qué hacer,
        <span class="text-mango-600">sin perderse en el chat</span>
      </h1>
      <p class="mt-5 max-w-xl text-lg text-muted">
        Crea el plan y compártelo en WhatsApp. Cada quien dice cuánto puede
        gastar y qué le gustaría; la IA propone 3 planes con lugares reales y
        el grupo vota.
      </p>
      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <UButton to="/e/new" size="xl" class="justify-center font-extrabold">
          Empieza gratis
        </UButton>
        <UButton
          to="/trips"
          variant="link"
          color="success"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
          class="justify-center font-bold"
        >
          o planea un viaje
        </UButton>
      </div>
      <p class="mt-4 text-sm text-dimmed">
        Tus amigos se unen y votan sin crear cuenta
      </p>
    </div>

    <LandingPhoneDemo />
  </section>
</template>
