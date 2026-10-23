import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { createSharedComposable } from "@vueuse/core";

const _useDashboard = () => {
  const route = useRoute();
  const router = useRouter();

  defineShortcuts({
    "g-h": () => router.push("/"),
    "g-i": () => router.push("/inbox"),
    "g-c": () => router.push("/customers"),
    "g-s": () => router.push("/settings"),
  });

  watch(
    () => route.fullPath,
    () => {},
  );
};

export const useDashboard = createSharedComposable(_useDashboard);
