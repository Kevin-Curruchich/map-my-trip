<script setup lang="ts">
// Asks for Google sign-in right when an action needs an account, then brings
// the person back to `redirect` to finish it.
const open = defineModel<boolean>("open", { required: true });
const { title, description, redirect } = defineProps<{
  title: string;
  description: string;
  redirect: string;
}>();

// Fired right before leaving for Google, so the page can keep unsaved work.
const emit = defineEmits<{ "sign-in": [] }>();

const { signInWithGoogle, isRedirecting } = useGoogleLogin();

function continueWithGoogle() {
  emit("sign-in");
  signInWithGoogle(redirect);
}
</script>

<template>
  <UModal v-model:open="open" :title="title" :description="description">
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton variant="ghost" color="neutral" @click="open = false">
          Ahora no
        </UButton>
        <UButton
          icon="i-simple-icons-google"
          :loading="isRedirecting"
          @click="continueWithGoogle"
        >
          Continuar con Google
        </UButton>
      </div>
    </template>
  </UModal>
</template>
