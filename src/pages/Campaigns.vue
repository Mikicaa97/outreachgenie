<template>
  <section class="max-w-6xl mx-auto py-10 px-6 text-gray-300">
    <h1 class="text-2xl font-bold mb-6">Campaigns</h1>

    <!-- ✅ Forma za dodavanje kampanje -->
    <form @submit.prevent="addCampaign" class="flex flex-wrap gap-3 mb-6">
      <input
          v-model="name"
          placeholder="Campaign name"
          class="bg-gray-800 p-2 rounded flex-1 min-w-[200px]"
      />
      <input
          v-model="description"
          placeholder="Description"
          class="bg-gray-800 p-2 rounded flex-1 min-w-[200px]"
      />
      <button class="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700">
        Add
      </button>
    </form>

    <!-- ✅ Lista kampanja -->
    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-700 rounded">
        <thead class="bg-gray-800 text-gray-400">
        <tr>
          <th class="py-3 px-4 text-left">Name</th>
          <th class="py-3 px-4 text-left">Description</th>
          <th class="py-3 px-4 text-left">Status</th>
          <th class="py-3 px-4 text-left">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="c in campaigns"
            :key="c.id"
            class="border-t border-gray-700 hover:bg-gray-800 transition"
        >
          <td class="py-2 px-4 font-semibold">{{ c.name }}</td>
          <td class="py-2 px-4">{{ c.description || "—" }}</td>
          <td class="py-2 px-4 capitalize">
              <span
                  :class="{
                  'text-yellow-400': c.status === 'draft',
                  'text-green-400': c.status === 'active',
                  'text-gray-400': !c.status
                }"
              >
                {{ c.status || "draft" }}
              </span>
          </td>
          <td class="py-2 px-4 flex flex-wrap gap-2">
            <button
                @click="openAddContactsModal(c)"
                class="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-500"
            >
              ➕ Add Contacts
            </button>
            <button
                @click="sendCampaign(c)"
                class="bg-green-600 px-3 py-1 rounded text-sm hover:bg-green-500"
            >
              🚀 Send
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- ✅ Modal za dodavanje kontakata -->
    <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    >
      <div class="bg-gray-900 rounded-lg p-6 w-[90%] max-w-lg">
        <h2 class="text-xl font-bold mb-4">Add Contacts to {{ selectedCampaign.name }}</h2>

        <div class="max-h-64 overflow-y-auto border border-gray-700 rounded p-2 mb-4">
          <div
              v-for="contact in contacts"
              :key="contact.id"
              class="flex items-center justify-between py-1 px-2 hover:bg-gray-800 rounded"
          >
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                  type="checkbox"
                  v-model="selectedContacts"
                  :value="contact.id"
              />
              {{ contact.first_name }} {{ contact.last_name }} ({{ contact.email }})
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button
              @click="saveContactsToCampaign"
              class="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
          >
            Save
          </button>
          <button
              @click="closeModal"
              class="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/supabase.js";

const campaigns = ref([]);
const contacts = ref([]);
const name = ref("");
const description = ref("");

const showModal = ref(false);
const selectedCampaign = ref(null);
const selectedContacts = ref([]);

// ✅ Učitaj sve kampanje korisnika
const loadCampaigns = async () => {
  const user = (await supabase.auth.getUser()).data.user;
  const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
  campaigns.value = data || [];
};

// ✅ Učitaj sve kontakte korisnika
const loadContacts = async () => {
  const user = (await supabase.auth.getUser()).data.user;
  const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.id);
  contacts.value = data || [];
};

// ✅ Dodaj kampanju
const addCampaign = async () => {
  const user = (await supabase.auth.getUser()).data.user;
  await supabase.from("campaigns").insert([
    {
      user_id: user.id,
      name: name.value,
      description: description.value,
    },
  ]);
  await loadCampaigns();
  name.value = "";
  description.value = "";
};

// ✅ Otvori modal za dodavanje kontakata
const openAddContactsModal = (campaign) => {
  selectedCampaign.value = campaign;
  showModal.value = true;
  selectedContacts.value = [];
  loadContacts();
};

// ✅ Sačuvaj odabrane kontakte u campaign_contacts
const saveContactsToCampaign = async () => {
  if (!selectedCampaign.value || selectedContacts.value.length === 0) return;

  const rows = selectedContacts.value.map((contactId) => ({
    campaign_id: selectedCampaign.value.id,
    contact_id: contactId,
  }));

  const { error } = await supabase.from("campaign_contacts").insert(rows);

  if (error) {
    alert("❌ Error adding contacts: " + error.message);
  } else {
    alert("✅ Contacts added to campaign!");
    showModal.value = false;
  }
};

// ✅ Zatvori modal
const closeModal = () => {
  showModal.value = false;
};

// ✅ Pošalji mejlove iz kampanje
const sendCampaign = async (campaign) => {
  const user = (await supabase.auth.getUser()).data.user;
  const res = await fetch(
      "https://outreachgenie-production.up.railway.app/api/campaigns/send",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          userId: user.id,
          subject: `Campaign: ${campaign.name}`,
          body: campaign.description || "Hello, this is your campaign!",
        }),
      }
  );

  const data = await res.json();
  if (data.success) alert("✅ Campaign sent successfully!");
  else alert("❌ Error sending campaign.");
};

onMounted(loadCampaigns);
</script>
