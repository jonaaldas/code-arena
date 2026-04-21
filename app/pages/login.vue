<script setup lang="ts">
import { IconBrandGithub } from '@tabler/icons-vue';
import { toast } from 'vue-sonner';
import { Result } from 'better-result';
import Button from '@/components/ui/button/Button.vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const loading = ref(false);
const mode = ref<'signin' | 'signup'>('signin');

const email = ref('');
const password = ref('');
const name = ref('');

async function continueWithGithub() {
  loading.value = true;
  await userStore.signInWithGithub('/');
}

async function submit() {
  if (!email.value || !password.value) return;
  if (mode.value === 'signup' && !name.value) return;
  loading.value = true;

  const result = await Result.tryPromise({
    try: () =>
      mode.value === 'signup'
        ? userStore.signUpWithEmail(email.value, password.value, name.value)
        : userStore.signInWithEmail(email.value, password.value),
    catch: (e: any) => e?.message || 'Something went wrong',
  });

  loading.value = false;

  result.match({
    ok: async () => {
      await navigateTo('/');
    },
    err: (message) => {
      toast.error(mode.value === 'signup' ? 'Sign up failed' : 'Sign in failed', {
        description: message,
      });
    },
  });
}
</script>

<template>
  <div class="min-h-screen grid place-items-center p-4">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{{ mode === 'signup' ? 'Create an account' : 'Welcome to Code Arena' }}</CardTitle>
        <CardDescription>
          {{ mode === 'signup' ? 'Sign up with email and password' : 'Sign in to continue' }}
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <form class="flex flex-col gap-3" @submit.prevent="submit">
          <div v-if="mode === 'signup'" class="flex flex-col gap-1.5">
            <Label for="name">Name</Label>
            <Input id="name" v-model="name" type="text" autocomplete="name" required />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" autocomplete="email" required />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
              required
            />
          </div>
          <Button type="submit" :disabled="loading">
            {{ loading ? 'Please wait…' : mode === 'signup' ? 'Sign up' : 'Sign in' }}
          </Button>
        </form>

        <button
          type="button"
          class="text-xs text-muted-foreground hover:underline"
          @click="mode = mode === 'signup' ? 'signin' : 'signup'"
        >
          {{ mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up" }}
        </button>

        <div class="relative my-1">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t" />
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
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
