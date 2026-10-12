// Tailwind's lg breakpoint. False on the server and until mounted, so the
// mobile layout is what renders first.
export default function useIsDesktop() {
  const isDesktop = ref(false);

  onMounted(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => (isDesktop.value = query.matches);
    update();
    query.addEventListener("change", update);
    onBeforeUnmount(() => query.removeEventListener("change", update));
  });

  return isDesktop;
}
