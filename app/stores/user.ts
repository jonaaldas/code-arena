import { defineStore } from "pinia";
import { authClient } from "@/lib/auth-client";

type Session = Awaited<ReturnType<typeof authClient.getSession>>["data"];

export const useUserStore = defineStore("user", () => {
  const session = ref<Session | null>(null);
  const loading = ref(false);

  const user = computed(() => session.value?.user ?? null);
  const isAuthenticated = computed(() => !!session.value?.user);

  async function fetchUser() {
    loading.value = true;
    try {
      session.value = await $fetch<Session>("/api/me", {
        headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
      });
    } finally {
      loading.value = false;
    }
  }

  async function signInWithGithub(callbackURL = "/") {
    await authClient.signIn.social({ provider: "github", callbackURL });
  }

  async function signOut() {
    await authClient.signOut();
    session.value = null;
  }

  async function deleteAccount() {
    await authClient.deleteUser();
    session.value = null;
  }

  return {
    session,
    user,
    isAuthenticated,
    loading,
    fetchUser,
    signInWithGithub,
    signOut,
    deleteAccount,
  };
});
