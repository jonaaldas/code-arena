<script setup lang="ts">
import { IconBrandGithub } from "@tabler/icons-vue";
import Button from "@/components/ui/button/Button.vue";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

const loading = ref(false);

async function continueWithGithub() {
  loading.value = true;
  await authClient.signIn.social({
    provider: "github",
    callbackURL: "/",
  });
}
</script>

<template>
  <div class="min-h-screen grid place-items-center p-4">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome to Code Arena</CardTitle>
        <CardDescription>Sign in to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          class="w-full"
          :disabled="loading"
          @click="continueWithGithub"
        >
          <IconBrandGithub class="size-4" />
          Continue with GitHub
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
