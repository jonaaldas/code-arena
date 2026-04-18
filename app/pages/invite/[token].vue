<script setup lang="ts">
import { Result } from 'better-result';
import { IconCircleCheck, IconAlertTriangle, IconLoader2 } from '@tabler/icons-vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type VerifyResponse = {
  valid: boolean;
  scheduledAt?: string;
  message?: string;
};

const route = useRoute();
const token = computed(() => String(route.params.token ?? ''));

const loading = ref(true);
const data = ref<VerifyResponse | null>(null);
const errorMessage = ref('');

const scheduledDisplay = computed(() => {
  if (!data.value?.scheduledAt) return '';
  return new Date(data.value.scheduledAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });
});

async function verify() {
  if (!token.value) {
    loading.value = false;
    errorMessage.value = 'Missing token';
    return;
  }
  loading.value = true;
  const result = await Result.tryPromise({
    try: () => $fetch<VerifyResponse>(`/api/invitations/verify/${token.value}`),
    catch: (e: any) => e?.data?.statusMessage || e?.message || 'Invalid or expired invitation',
  });
  loading.value = false;
  result.match({
    ok: (res) => {
      data.value = res;
    },
    err: (m) => {
      errorMessage.value = m;
    },
  });
}

onMounted(verify);
</script>

<template>
  <div class="min-h-screen p-8 flex items-center justify-center">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Interview invitation</CardTitle>
        <CardDescription>
          {{ loading ? 'Verifying your invite…' : 'Your invitation status.' }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex items-center gap-2 text-sm text-muted-foreground">
          <IconLoader2 class="size-4 animate-spin" />
          Verifying…
        </div>

        <div v-else-if="errorMessage" class="flex items-center gap-2 text-sm text-destructive">
          <IconAlertTriangle class="size-4" />
          {{ errorMessage }}
        </div>

        <div v-else-if="data?.valid" class="flex flex-col gap-3 text-sm">
          <div class="flex items-center gap-2 text-green-700">
            <IconCircleCheck class="size-4" />
            Valid invitation
          </div>
          <p v-if="scheduledDisplay">
            Scheduled for <strong>{{ scheduledDisplay }}</strong>
          </p>
        </div>

        <div v-else class="flex items-center gap-2 text-sm text-destructive">
          <IconAlertTriangle class="size-4" />
          {{ data?.message || 'Invalid invitation' }}
        </div>
      </CardContent>
    </Card>
  </div>
</template>
