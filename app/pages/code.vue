<script setup lang="ts">
import { Result } from 'better-result';
const route = useRoute();
const token = computed(() => String(route.params.token ?? ''));

type VerifyResponse = {
  valid: boolean;
  scheduledAt?: string;
  message?: string;
};

const loading = ref(true);
const data = ref<VerifyResponse | null>(null);
const errorMessage = ref('');

async function verify() {
  if (!token.value) {
    loading.value = false;
    errorMessage.value = 'Missing token';
    return;
  }
  loading.value = true;
  const result = await Result.tryPromise({
    try: () => $fetch<VerifyResponse>(`/api/invitations/room/${token.value}`),
    catch: (e: any) => e?.data?.statusMessage || e?.message || 'Invalid or expired invitation',
  });
  loading.value = false;
  result.match({
    ok: async (res) => {
      data.value = res;
    },
    err: async (m) => {
      errorMessage.value = m;
    },
  });
}

onMounted(verify);
</script>
<template>
  <h1>Welcome</h1>
</template>
