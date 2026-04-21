<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import Button from '@/components/ui/button/Button.vue';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const userStore = useUserStore();
await userStore.fetchUser();

if (!userStore.user) {
  await navigateTo('/login');
}

const deleting = ref(false);

async function handleDelete() {
  deleting.value = true;
  try {
    await userStore.deleteAccount();
    await navigateTo('/login');
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen p-8 flex flex-col gap-6">
    <Header />

    <main v-if="userStore.user" class="max-w-2xl w-full mx-auto flex flex-col gap-6">
      <div>
        <h2 class="text-2xl font-semibold">Settings</h2>
        <p class="text-sm text-muted-foreground">Manage your account.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information.</CardDescription>
        </CardHeader>
        <CardContent class="flex items-center gap-4">
          <Avatar class="size-16">
            <AvatarImage
              v-if="userStore.user.image"
              :src="userStore.user.image"
              :alt="userStore.user.name"
            />
            <AvatarFallback>
              {{ userStore.user.name?.[0]?.toUpperCase() ?? '?' }}
            </AvatarFallback>
          </Avatar>
          <div class="flex flex-col">
            <span class="font-medium">{{ userStore.user.name }}</span>
            <span class="text-sm text-muted-foreground">{{ userStore.user.email }}</span>
          </div>
        </CardContent>
      </Card>

      <Card class="border-destructive/40">
        <CardHeader>
          <CardTitle class="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <Button variant="destructive" :disabled="deleting">
                {{ deleting ? 'Deleting…' : 'Delete account' }}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove your account. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" @click="handleDelete">
                  Delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </main>
  </div>
</template>
