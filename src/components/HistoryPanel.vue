<template>
  <div>
    <!-- Pretraga i filter -->
    <div class="mb-4 flex flex-col sm:flex-row gap-3">
      <input
          v-model="localSearchQuery"
          :placeholder="$t('dash_search_placeholder')"
          class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
      />
      <select
          v-model="localTypeFilter"
          class="w-full sm:w-48 p-2 border border-gray-600 rounded bg-gray-900 text-white"
      >
        <option value="">{{ $t('dash_filter_all') }}</option>
        <option value="general">{{ $t('dash_type_general') }}</option>
        <option value="offer">{{ $t('dash_type_offer') }}</option>
        <option value="promo">{{ $t('dash_type_promo') }}</option>
        <option value="followup">{{ $t('dash_type_followup') }}</option>
        <option value="technical">{{ $t('dash_type_technical') }}</option>
        <option value="networking">{{ $t('dash_type_networking') }}</option>
        <option value="director">{{ $t('dash_type_director') }}</option>
        <option value="linkedin">{{ $t('dash_type_linkedin') }}</option>
        <option value="hiring">{{ $t('dash_type_hiring') }}</option>
        <option value="reminder">{{ $t('dash_type_reminder') }}</option>
        <option value="apology">{{ $t('dash_type_apology') }}</option>
      </select>
    </div>

    <!-- Lista poruka -->
    <h2 class="text-xl font-semibold mb-3">{{ $t('dash_history') }}</h2>
    <div class="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
      <ul>
        <li
            v-for="msg in messages"
            :key="msg.id"
            class="mb-3 border border-gray-700 rounded p-3"
        >
          <div class="text-sm text-gray-400 mb-1">
            <span class="uppercase tracking-wide">{{ msg.type || 'general' }}</span>
            · {{ new Date(msg.created_at).toLocaleString() }}
          </div>
          <div class="mb-2">
            <strong>{{ msg.full_name }}</strong> ({{ msg.company }}) →
            <em>{{ msg.service }}</em>
          </div>
          <pre class="whitespace-pre-wrap text-sm">{{ msg.offer_text }}</pre>

          <div class="mt-3 flex flex-wrap gap-3 justify-end text-sm">
            <button @click="$emit('edit', msg)" class="text-blue-400 hover:underline">
              {{ $t('dash_edit') }}
            </button>
            <button @click="$emit('copy', msg.offer_text)" class="text-blue-400 hover:underline">
              {{ $t('dash_copy') }}
            </button>
            <button @click="$emit('refine', msg)" class="text-emerald-400 hover:underline">
              {{ $t('dash_edit_ai') }}
            </button>
            <button @click="$emit('delete', msg.id)" class="text-red-400 hover:underline">
              {{ $t('dash_delete') }}
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  messages: { type: Array, required: true },
  searchQuery: { type: String, default: '' },
  typeFilter: { type: String, default: '' },
})

const emit = defineEmits([
  'edit',
  'copy',
  'refine',
  'delete',
  'update:searchQuery',
  'update:typeFilter',
])

const localSearchQuery = computed({
  get: () => props.searchQuery,
  set: (val) => emit('update:searchQuery', val),
})

const localTypeFilter = computed({
  get: () => props.typeFilter,
  set: (val) => emit('update:typeFilter', val),
})
</script>
