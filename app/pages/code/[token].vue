<script setup lang="ts">
import { Result } from 'better-result';
import {
  IconLoader2,
  IconAlertTriangle,
  IconPlayerPlay,
  IconSend,
  IconClock,
  IconUser,
  IconTerminal2,
} from '@tabler/icons-vue';
import Button from '@/components/ui/button/Button.vue';
import { Card, CardContent } from '@/components/ui/card';

type Role = 'owner' | 'guest';

type VerifyResponse = {
  valid: boolean;
  role?: Role;
  hasAccepted?: boolean;
  scheduledAt?: string;
  message?: string;
};

const route = useRoute();
const token = computed(() => String(route.params.token ?? ''));

const loading = ref(true);
const verified = ref(false);
const errorMessage = ref('');
const role = ref<Role | null>(null);
const loadingMessage = computed(() => {
  if (role.value === 'owner') return 'Opening your room…';
  if (role.value === 'guest') return 'Joining interview…';
  return 'Verifying access…';
});

const language = ref('javascript');
const code = ref(`// Start writing your solution here
function twoSum(nums, target) {
  // TODO
}
`);
const output = ref('');
const running = ref(false);
const submitting = ref(false);

const languages = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
];

const elapsed = ref(0);
let timerId: ReturnType<typeof setInterval> | null = null;
const formattedElapsed = computed(() => {
  const m = Math.floor(elapsed.value / 60);
  const s = elapsed.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

async function verify() {
  if (!token.value) {
    loading.value = false;
    errorMessage.value = 'Missing token';
    return;
  }

  const verifyResult = await Result.tryPromise({
    try: () => $fetch<VerifyResponse>(`/api/invitations/room/${token.value}`),
    catch: (e: any) => e?.data?.statusMessage || e?.message || 'Invalid or expired invitation',
  });

  if (verifyResult.isErr()) {
    loading.value = false;
    errorMessage.value = verifyResult.error;
    return;
  }

  const res = verifyResult.value;
  if (!res.valid) {
    loading.value = false;
    errorMessage.value = res.message || 'Invalid invitation';
    return;
  }

  role.value = res.role ?? null;

  if (res.role === 'guest' && !res.hasAccepted) {
    const accept = await Result.tryPromise({
      try: () => $fetch(`/api/invitations/guest/accept/${token.value}`, { method: 'POST' }),
      catch: (e: any) => e?.data?.statusMessage || e?.message || 'Failed to join interview',
    });
    if (accept.isErr()) {
      loading.value = false;
      errorMessage.value = accept.error;
      return;
    }
  }

  loading.value = false;
  verified.value = true;
  timerId = setInterval(() => (elapsed.value += 1), 1000);
}

async function runCode() {
  running.value = true;
  output.value = 'Running…\n';
  // TODO: wire to a real runner
  await new Promise((r) => setTimeout(r, 400));
  output.value = `> Ran ${language.value}\n(no runner wired yet)\n`;
  running.value = false;
}

async function submitCode() {
  submitting.value = true;
  // TODO: wire to a real submit endpoint
  await new Promise((r) => setTimeout(r, 500));
  output.value += '\n✓ Submitted (placeholder)\n';
  submitting.value = false;
}

onMounted(verify);
onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId);
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center text-sm text-muted-foreground">
      <IconLoader2 class="size-4 animate-spin mr-2" />
      {{ loadingMessage }}
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage || !verified" class="flex-1 flex items-center justify-center p-8">
      <Card class="w-full max-w-md">
        <CardContent class="flex items-center gap-2 text-sm text-destructive py-6">
          <IconAlertTriangle class="size-4" />
          {{ errorMessage || 'Invalid invitation' }}
        </CardContent>
      </Card>
    </div>

    <!-- Interview UI -->
    <template v-else>
      <!-- Top bar -->
      <header class="border-b px-4 h-14 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-4">
          <h1 class="font-semibold text-sm">Two Sum</h1>
          <span class="text-xs rounded-md bg-amber-100 text-amber-800 px-2 py-0.5 font-medium"> Medium </span>
        </div>

        <div class="flex items-center gap-4 text-sm">
          <div class="flex items-center gap-1.5 text-muted-foreground">
            <IconClock class="size-4" />
            <span class="tabular-nums">{{ formattedElapsed }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-muted-foreground">
            <IconUser class="size-4" />
            Candidate
          </div>
        </div>
      </header>

      <!-- Two-pane body -->
      <div class="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">
        <!-- Problem -->
        <section class="border-r p-6 overflow-auto">
          <h2 class="text-lg font-semibold mb-2">Two Sum</h2>
          <p class="text-sm text-muted-foreground mb-4">
            Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two
            numbers such that they add up to <code>target</code>.
          </p>
          <p class="text-sm text-muted-foreground mb-4">
            You may assume that each input would have exactly one solution, and you may not use the same element twice.
          </p>

          <h3 class="text-sm font-semibold mt-6 mb-2">Example 1</h3>
          <pre class="text-xs bg-muted rounded-md p-3 font-mono">
Input:  nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] == 9</pre
          >

          <h3 class="text-sm font-semibold mt-6 mb-2">Constraints</h3>
          <ul class="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>2 ≤ nums.length ≤ 10<sup>4</sup></li>
            <li>-10<sup>9</sup> ≤ nums[i] ≤ 10<sup>9</sup></li>
            <li>Only one valid answer exists.</li>
          </ul>
        </section>

        <!-- Editor + console -->
        <section class="flex flex-col min-h-0">
          <!-- Editor toolbar -->
          <div class="h-10 border-b flex items-center justify-between px-3 shrink-0">
            <select v-model="language" class="text-sm border rounded-md px-2 py-1 bg-background">
              <option v-for="l in languages" :key="l.id" :value="l.id">
                {{ l.label }}
              </option>
            </select>

            <div class="flex items-center gap-2">
              <Button variant="outline" size="sm" :disabled="running" @click="runCode">
                <IconPlayerPlay class="size-4" />
                {{ running ? 'Running…' : 'Run' }}
              </Button>
              <Button size="sm" :disabled="submitting" @click="submitCode">
                <IconSend class="size-4" />
                {{ submitting ? 'Submitting…' : 'Submit' }}
              </Button>
            </div>
          </div>

          <!-- Editor -->
          <div class="flex-1 min-h-0">
            <textarea
              v-model="code"
              spellcheck="false"
              class="w-full h-full p-4 font-mono text-sm bg-background resize-none outline-none"
            />
          </div>

          <!-- Console -->
          <div class="border-t shrink-0 h-40 flex flex-col">
            <div class="h-8 px-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground border-b">
              <IconTerminal2 class="size-3.5" />
              Output
            </div>
            <pre class="flex-1 overflow-auto p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap">{{
              output || '// Run your code to see output here'
            }}</pre>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>
