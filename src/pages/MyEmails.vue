<template>
  <div class="min-h-screen bg-black text-white p-6">
    <h1 class="text-2xl font-bold mb-6 text-center">📊 My Sent Emails</h1>

    <!-- Statistika -->
    <div class="flex flex-wrap justify-center gap-6 mb-8">
      <div class="bg-gray-900 border border-gray-700 rounded-lg p-4 w-48 text-center">
        <p class="text-sm text-gray-400">Open rate</p>
        <p class="text-2xl font-semibold text-green-400">{{ openRate }}%</p>
      </div>
      <div class="bg-gray-900 border border-gray-700 rounded-lg p-4 w-48 text-center">
        <p class="text-sm text-gray-400">Total sent</p>
        <p class="text-2xl font-semibold text-blue-400">{{ totalSent }}</p>
      </div>
      <div class="bg-gray-900 border border-gray-700 rounded-lg p-4 w-48 text-center">
        <p class="text-sm text-gray-400">Opened</p>
        <p class="text-2xl font-semibold text-green-400">{{ openedCount }}</p>
      </div>
    </div>

    <!-- Tabela mejlova -->
    <div class="overflow-x-auto">
      <table class="min-w-full bg-gray-900 border border-gray-700 rounded-lg">
        <thead class="bg-gray-800 text-gray-300 uppercase text-xs">
        <tr>
          <th class="py-3 px-4 text-left">Recipient</th>
          <th class="py-3 px-4 text-left">Subject</th>
          <th class="py-3 px-4 text-left">Status</th>
          <th class="py-3 px-4 text-left">Date</th>
          <th class="py-3 px-4 text-center">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="msg in emails"
            :key="msg.id"
            class="border-t border-gray-700 hover:bg-gray-800 transition"
        >
          <td class="py-3 px-4">{{ msg.recipient || "—" }}</td>
          <td class="py-3 px-4">{{ msg.subject || "No subject" }}</td>
          <td class="py-3 px-4">
              <span
                  v-if="openedStatus[msg.tracking_id]"
                  class="text-green-400 font-medium"
              >👁 Opened</span
              >
            <span v-else class="text-gray-400">🕓 Not opened</span>
          </td>
          <td class="py-3 px-4 text-gray-400 text-sm">
            {{ formatDate(msg.created_at) }}
          </td>
          <td class="py-3 px-4 text-center">
            <button
                @click="viewDetails(msg)"
                class="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm"
            >
              🔍 View
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal za detalje -->
    <transition name="fade">
      <div
          v-if="selectedMessage"
          class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      >
        <div
            class="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl relative"
        >
          <button
              @click="selectedMessage = null"
              class="absolute top-3 right-3 text-red-400 text-lg"
          >
            ✕
          </button>

          <h2 class="text-xl font-bold mb-4">{{ selectedMessage.subject }}</h2>
          <p class="text-sm text-gray-400 mb-3">
            To: {{ selectedMessage.recipient }}
          </p>
          <pre class="whitespace-pre-wrap text-gray-200 text-sm mb-4 border-t border-gray-700 pt-2">
{{ selectedMessage.offer_text }}
          </pre>

          <div class="flex gap-4 text-sm text-gray-400">
            <p>📅 Sent: {{ formatDate(selectedMessage.created_at) }}</p>
            <p>
              👁 Status:
              <span
                  v-if="openedStatus[selectedMessage.tracking_id]"
                  class="text-green-400"
              >Opened</span
              >
              <span v-else class="text-gray-400">Not opened</span>
            </p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { supabase } from "@/lib/supabaseClient";

const emails = ref([]);
const openedStatus = ref({});
const selectedMessage = ref(null);
const session = ref(null);

// 🧠 Učitaj podatke
async function loadEmails() {
  const { data: auth } = await supabase.auth.getSession();
  session.value = auth.session;
  if (!session.value?.user) return;

  // 1. Učitaj sve poslate mejlove
  const { data: msgs, error } = await supabase
      .from("outreach_messages")
      .select("id, full_name, company, service, offer_text, type, tone, created_at, tracking_id, recipient, subject")
      .eq("user_id", session.value.user.id)
      .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Greška pri učitavanju mejlova:", error.message);
    return;
  }
  emails.value = msgs || [];

  // 2. Učitaj open statuse
  if (!session.value?.user?.id) return;
  const res = await fetch(
      `https://outreachgenie-production.up.railway.app/api/email-events/status?userId=${session.value.user.id}`
  );
  const data = await res.json();
  openedStatus.value = data.opened || {};

}

// 📊 Statistika
const totalSent = computed(() => emails.value.length);
const openedCount = computed(
    () => Object.keys(openedStatus.value).length
);
const openRate = computed(() =>
    totalSent.value > 0
        ? ((openedCount.value / totalSent.value) * 100).toFixed(1)
        : 0
);

// 📅 Format datuma
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString();
}

// 🔍 View Details
function viewDetails(msg) {
  selectedMessage.value = msg;
}

onMounted(() => {
  loadEmails();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
