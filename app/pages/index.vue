<script setup lang="ts">
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
await userStore.fetchUser();
</script>

<template>
  <div class="min-h-screen p-8 flex flex-col gap-6">
    <Header />

    <main v-if="userStore.user">
      <p>Welcome back, {{ userStore.user.name }}.</p>
    </main>
    <main v-else>
      <p>You are not signed in.</p>
    </main>
  </div>
</template>
