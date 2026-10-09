<template>
  <section id="viajes" class="scroll-mt-20 bg-elevated/50 py-16 lg:py-24">
    <div class="container mx-auto grid items-center gap-10 px-4 lg:grid-cols-2">
      <div class="reveal">
        <UBadge color="primary" variant="subtle" size="lg" class="rounded-full">
          Viajes con IA
        </UBadge>
        <h2 class="mt-4 text-3xl font-extrabold tracking-tight text-highlighted sm:text-4xl">
          ¿Viaje más largo? Tu itinerario día por día
        </h2>
        <p class="mt-4 text-lg text-muted">
          Cuéntanos la duración, quiénes viajan, el estilo y el presupuesto, y
          recibe un itinerario con cada actividad en el mapa.
        </p>
        <UButton to="/trips" size="lg" class="mt-8 font-extrabold">
          Planear un viaje
        </UButton>
      </div>
      <LandingTripDemo class="reveal" />
    </div>
  </section>
</template>
