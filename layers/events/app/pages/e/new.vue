<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

useSeoMeta({
  title: "Crear un plan en grupo",
  description:
    "Crea un evento, comparte el link en tu grupo de WhatsApp y decidan juntos qué hacer.",
});

const schema = z.object({
  title: z.string().trim().min(3, "Mínimo 3 caracteres").max(80),
  city: z.string().trim().min(2, "¿En qué ciudad?").max(80),
  date: z.string().trim().max(40).optional(),
  description: z.string().trim().max(500).optional(),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  title: "",
  city: "",
  date: "",
  description: "",
});
const isLoading = ref(false);
const toast = useToast();

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true;
  try {
    const { slug } = await $fetch("/api/events", {
      method: "POST",
      body: event.data,
    });
    await navigateTo(`/e/${slug}`);
  } catch (error) {
    console.error("Error creating event:", error);
    toast.add({
      title: "No pudimos crear el evento",
      description: "Inténtalo de nuevo en un momento.",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <UContainer class="max-w-xl py-10">
    <h1 class="text-2xl font-bold mb-2">¿Qué hacemos?</h1>
    <p class="text-muted mb-6">
      Crea el evento y comparte el link en tu grupo. Cada quien dice qué quiere
      y cuánto puede gastar, sin instalar nada.
    </p>

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Nombre del plan" name="title" required>
        <UInput
          v-model="state.title"
          placeholder="Salida del sábado"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Ciudad" name="city" required>
        <UInput
          v-model="state.city"
          placeholder="Ciudad de Guatemala"
          class="w-full"
        />
      </UFormField>

      <UFormField label="¿Cuándo?" name="date">
        <UInput
          v-model="state.date"
          placeholder="Este sábado en la tarde"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Detalles" name="description">
        <UTextarea
          v-model="state.description"
          placeholder="Cumpleaños de Ana, somos como 6"
          :rows="3"
          class="w-full"
        />
      </UFormField>

      <UButton type="submit" size="lg" block :loading="isLoading">
        Crear y compartir
      </UButton>
    </UForm>
  </UContainer>
</template>
