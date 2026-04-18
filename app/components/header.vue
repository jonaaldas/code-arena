<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

async function signOut() {
  await userStore.signOut();
  await navigateTo('/login');
}
</script>

<template>
  <header class="flex items-center justify-between">
    <h1 class="text-2xl font-semibold">Code Arena</h1>
    <div v-if="userStore.user" class="flex items-center gap-3">
      <Avatar>
        <AvatarImage v-if="userStore.user.image" :src="userStore.user.image" :alt="userStore.user.name" />
        <AvatarFallback>
          {{ userStore.user.name?.[0]?.toUpperCase() ?? '?' }}
        </AvatarFallback>
      </Avatar>
      <span class="text-sm">{{ userStore.user.name }}</span>
      <Button variant="outline" size="sm" @click="signOut">Sign out</Button>
    </div>
    <NuxtLink v-else to="/login">
      <Button variant="outline">Sign in</Button>
    </NuxtLink>
  </header>
</template>
