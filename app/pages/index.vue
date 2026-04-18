<script setup lang="ts">
import {
  CalendarDate,
  today,
  getLocalTimeZone,
  type DateValue,
} from '@internationalized/date';
import { IconCalendar, IconPencil, IconTrash } from '@tabler/icons-vue';
import { toast } from 'vue-sonner';
import { Result } from 'better-result';
import { useUserStore } from '@/stores/user';
import Button from '@/components/ui/button/Button.vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Invitation = {
  id: string;
  link: string;
  sent: boolean;
  scheduledAt: string;
  createdAt: string;
  updatedAt: string;
};

const userStore = useUserStore();
await userStore.fetchUser();

const open = ref(false);
const editingId = ref<string | null>(null);
const editingSent = ref(false);
const inviteLink = ref('');
const interviewDate = ref<DateValue>();
const interviewTime = ref('');
const copied = ref(false);
const saving = ref(false);

const invitations = ref<Invitation[]>([]);
const loadingList = ref(false);

const deleteTarget = ref<Invitation | null>(null);
const deleting = ref(false);

const isEditing = computed(() => editingId.value !== null);
const linkLocked = computed(() => isEditing.value && editingSent.value);

const formattedDate = computed(() =>
  interviewDate.value
    ? interviewDate.value.toDate(getLocalTimeZone()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''
);

const interviewUtcIso = computed(() => {
  if (!interviewDate.value || !interviewTime.value) return '';
  const [h, m] = interviewTime.value.split(':').map(Number);
  const d = interviewDate.value as CalendarDate;
  return new Date(d.year, d.month - 1, d.day, h, m).toISOString();
});

const localTimezone = computed(() => getLocalTimeZone());

function formatLocalDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function formatRowDate(iso: string) {
  return formatLocalDateTime(iso);
}

function generateLink() {
  const token = crypto.randomUUID().replace(/-/g, '');
  const origin = import.meta.client ? window.location.origin : '';
  inviteLink.value = `${origin}/invite/${token}`;
  copied.value = false;
}

function prefill() {
  generateLink();
  interviewDate.value = today(getLocalTimeZone()).add({ days: 1 });
  interviewTime.value = '14:00';
}

async function copyLink() {
  if (!inviteLink.value) return;
  await navigator.clipboard.writeText(inviteLink.value);
  copied.value = true;
}

async function fetchInvitations() {
  loadingList.value = true;
  const result = await Result.tryPromise({
    try: () => $fetch<Invitation[]>('/api/invitations'),
    catch: (e: any) => e?.data?.statusMessage || e?.message || 'Something went wrong',
  });
  loadingList.value = false;

  result.match({
    ok: (rows) => {
      invitations.value = rows;
    },
    err: (message) => {
      console.log(message);
      toast.error('Failed to load invitations');
    },
  });
}

function openCreate() {
  editingId.value = null;
  editingSent.value = false;
  inviteLink.value = '';
  interviewDate.value = undefined;
  interviewTime.value = '';
  copied.value = false;
  open.value = true;
}

function openEdit(row: Invitation) {
  editingId.value = row.id;
  editingSent.value = row.sent;
  inviteLink.value = row.link;
  const d = new Date(row.scheduledAt);
  interviewDate.value = new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
  interviewTime.value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  copied.value = false;
  open.value = true;
}

async function handleSave() {
  if (!interviewUtcIso.value) return;
  if (!isEditing.value && !inviteLink.value) return;
  saving.value = true;

  const result = await Result.tryPromise({
    try: () =>
      isEditing.value
        ? $fetch(`/api/invitations/${editingId.value}`, {
            method: 'PATCH',
            body: {
              ...(linkLocked.value ? {} : { link: inviteLink.value }),
              scheduledAt: interviewUtcIso.value,
            },
          })
        : $fetch('/api/save_link', {
            method: 'POST',
            body: { link: inviteLink.value, scheduledAt: interviewUtcIso.value },
          }),
    catch: (e: any) => e?.data?.statusMessage || e?.message || 'Something went wrong',
  });

  saving.value = false;

  result.match({
    ok: () => {
      toast.success(isEditing.value ? 'Invite updated' : 'Invite saved');
      open.value = false;
      fetchInvitations();
    },
    err: (message) => {
      console.log(message);
      toast.error('There was an error please try again.');
    },
  });
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  const id = deleteTarget.value.id;

  const result = await Result.tryPromise({
    try: () => $fetch(`/api/invitations/${id}`, { method: 'DELETE' }),
    catch: (e: any) => e?.data?.statusMessage || e?.message || 'Something went wrong',
  });

  deleting.value = false;

  result.match({
    ok: () => {
      toast.success('Invite deleted');
      deleteTarget.value = null;
      fetchInvitations();
    },
    err: (message) => {
      console.log(message);
      toast.error('Failed to delete');
    },
  });
}

watch(open, (value) => {
  if (!value) {
    editingId.value = null;
    editingSent.value = false;
    inviteLink.value = '';
    interviewDate.value = undefined;
    interviewTime.value = '';
    copied.value = false;
  }
});

if (userStore.user) {
  await fetchInvitations();
}
</script>

<template>
  <div class="min-h-screen p-8 flex flex-col gap-6">
    <Header />

    <main v-if="userStore.user" class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <p>Welcome back, {{ userStore.user.name }}.</p>
        <Button @click="openCreate">Invite people</Button>
      </div>

      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scheduled</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead class="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="row in invitations" :key="row.id">
              <TableCell>{{ formatRowDate(row.scheduledAt) }}</TableCell>
              <TableCell class="font-mono text-xs truncate max-w-[320px]">{{ row.link }}</TableCell>
              <TableCell>
                <span
                  class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                  :class="row.sent ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'"
                >
                  {{ row.sent ? 'Sent' : 'Pending' }}
                </span>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" @click="openEdit(row)">
                    <IconPencil class="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" @click="deleteTarget = row">
                    <IconTrash class="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableEmpty v-if="!loadingList && invitations.length === 0" :col-span="4">
              No invitations yet.
            </TableEmpty>
          </TableBody>
        </Table>
      </div>

      <Dialog v-model:open="open">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ isEditing ? 'Edit invitation' : 'Invite people' }}</DialogTitle>
            <DialogDescription>
              {{
                isEditing
                  ? 'Update the invitation details.'
                  : 'Generate an invite link and set the interview time.'
              }}
            </DialogDescription>
            <Button
              v-if="!isEditing"
              type="button"
              variant="ghost"
              size="sm"
              class="w-fit mt-2"
              @click="prefill"
            >
              Prefill (dev)
            </Button>
          </DialogHeader>

          <div class="flex flex-col gap-4 py-2">
            <div class="flex flex-col gap-2">
              <Label for="invite-link">
                Invite link
                <span v-if="linkLocked" class="text-xs text-muted-foreground ml-1">
                  (locked — already sent)
                </span>
              </Label>
              <div class="flex gap-2">
                <Input
                  id="invite-link"
                  v-model="inviteLink"
                  readonly
                  placeholder="Click generate to create a link"
                />
                <Button type="button" variant="outline" :disabled="!inviteLink" @click="copyLink">
                  {{ copied ? 'Copied' : 'Copy' }}
                </Button>
              </div>
              <Button
                v-if="!linkLocked"
                type="button"
                variant="secondary"
                @click="generateLink"
              >
                {{ isEditing ? 'Regenerate link' : 'Generate link' }}
              </Button>
            </div>

            <div class="flex flex-col gap-2">
              <Label>
                Interview date
                <span class="text-xs text-muted-foreground ml-1">({{ localTimezone }})</span>
              </Label>
              <Popover>
                <PopoverTrigger as-child>
                  <Button
                    variant="outline"
                    class="justify-start text-left font-normal"
                    :class="!interviewDate && 'text-muted-foreground'"
                  >
                    <IconCalendar class="size-4 mr-2" />
                    {{ formattedDate || 'Pick a date' }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0">
                  <Calendar v-model="interviewDate" />
                </PopoverContent>
              </Popover>
            </div>

            <div class="flex flex-col gap-2">
              <Label for="interview-time">
                Interview time
                <span class="text-xs text-muted-foreground ml-1">({{ localTimezone }})</span>
              </Label>
              <Input id="interview-time" v-model="interviewTime" type="time" />
            </div>

            <p v-if="interviewUtcIso" class="text-xs text-muted-foreground">
              Scheduled: {{ formatLocalDateTime(interviewUtcIso) }}
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="open = false">Cancel</Button>
            <Button
              :disabled="!inviteLink || !interviewUtcIso || saving"
              @click="handleSave"
            >
              {{ saving ? 'Saving…' : 'Save' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog :open="!!deleteTarget" @update:open="(v) => !v && (deleteTarget = null)">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the invitation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel :disabled="deleting">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              :disabled="deleting"
              @click="confirmDelete"
            >
              {{ deleting ? 'Deleting…' : 'Delete' }}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
    <main v-else>
      <p>You are not signed in.</p>
    </main>
  </div>
</template>
