<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";

const session = authClient.useSession();

async function signOut() {
  await authClient.signOut();
  await navigateTo("/login");
}
</script>

<template>
  <div class="min-h-screen p-8 flex flex-col gap-6">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Code Arena</h1>
      <div v-if="session.data?.user" class="flex items-center gap-3">
        <Avatar>
          <AvatarImage
            v-if="session.data.user.image"
            :src="session.data.user.image"
            :alt="session.data.user.name"
          />
          <AvatarFallback>
            {{ session.data.user.name?.[0]?.toUpperCase() ?? "?" }}
          </AvatarFallback>
        </Avatar>
        <span class="text-sm">{{ session.data.user.name }}</span>
        <Button variant="outline" size="sm" @click="signOut">Sign out</Button>
      </div>
      <NuxtLink v-else to="/login">
        <Button variant="outline">Sign in</Button>
      </NuxtLink>
    </header>

    <main v-if="session.data?.user">
      <p>Welcome back, {{ session.data.user.name }}.</p>
    </main>
    <main v-else>
      <p>You are not signed in.</p>
    </main>
  </div>
</template>
