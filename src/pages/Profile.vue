<template>
  <div v-if="session?.user" class="p-6 w-full mx-auto bg-black text-white min-h-screen">
    <div class="max-w-6xl mx-auto text-white">
      <!-- Naslov -->
      <h2 class="text-1xl font-bold mb-4">
        <span class="text-gray-400">{{ t('profile_greeting') }}, {{ name }}</span>
      </h2>

      <!-- Kartica sa planom -->
      <div class="bg-gray-900 border border-gray-700 rounded p-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-400">{{ t('profile_plan') }}</div>
            <div class="text-xl font-semibold">{{ planLabel }}</div>
          </div>
          <SubscribeButton class="bg-yellow-500 hover:bg-yellow-600 text-white text-base py-2 px-4 rounded-md font-semibold transition duration-200" />
        </div>

        <!-- Limit -->
        <div class="mt-6">
          <div class="flex items-center justify-between text-sm text-gray-400 mb-1">
            <span>{{ t('profile_daily_limit') }}</span>
            <span>{{ usedToday }} / {{ dailyLimit }}</span>
          </div>

          <!-- Ukupno poslate poruke -->
          <div class="flex items-center justify-between text-sm text-gray-400 mt-2">
            <span>{{ t('profile_total_sent') }}</span>
            <span>{{ totalMessages }}</span>
          </div>

          <!-- Progress bar -->
          <div class="w-full h-2 bg-gray-800 rounded mt-2">
            <div
                class="h-2 rounded transition-all duration-300"
                :style="{
                width: Math.min(100, Math.round((usedToday / dailyLimit) * 100)) + '%',
                backgroundColor: '#00C786'
              }"
            ></div>
          </div>

          <div class="text-xs text-gray-500 mt-2">
            {{ t('profile_reset_info') }}
          </div>
        </div>
      </div>

      <!-- Podešavanja -->
      <div class="bg-gray-900 border border-gray-700 rounded p-4">
        <h3 class="font-semibold mb-2">{{ t('profile_settings') }}</h3>
        <ul class="text-sm text-gray-300 space-y-2">
          <li>• {{ t('profile_email') }}: <span class="text-gray-400">{{ email }}</span></li>
          <li>• {{ t('profile_user_id') }}: <span class="text-gray-400">{{ userId }}</span></li>
          <li>• {{ t('profile_created_at') }}:
            <span class="text-gray-400">{{ formattedCreatedAt }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { supabase } from '../supabase.js'
import SubscribeButton from "../components/SubscribeButton.vue"
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  session: { type: Object, required: true }
})

const name = ref('-')
const email = ref('—')
const plan = ref('free')
const usedToday = ref(0)
const dailyLimit = ref(999)
const totalMessages = ref(0)

const userId = computed(() => props.session?.user?.id || '—')
const formattedCreatedAt = computed(() =>
    props.session?.user?.created_at
        ? new Date(props.session.user.created_at).toLocaleDateString()
        : '—'
)

const planLabel = computed(() => {
  switch (plan.value) {
    case 'pro': return 'PRO'
    case 'agency': return 'Agency'
    case 'enterprise': return 'Enterprise'
    default: return 'Free'
  }
})

const loadProfile = async (uid) => {
  const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('plan, first_name, email')
      .eq('id', uid)
      .single()

  if (!profileError && profile) {
    plan.value = profile.plan || 'free'
    name.value = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    email.value = profile.email || '—'
  }

  // Ukupno poslate poruke
  const { count: total, error: totalError } = await supabase
      .from('outreach_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', uid)

  if (!totalError) {
    totalMessages.value = total || 0
  }

  // Poslate danas
  const todayIso = new Date().toISOString().split('T')[0]
  const { count, error } = await supabase
      .from('outreach_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', uid)
      .gte('created_at', todayIso)

  if (!error) {
    usedToday.value = count || 0
  }

  dailyLimit.value = ['pro', 'agency', 'enterprise'].includes(plan.value) ? 999999 : 999
}

watch(() => props.session, async (newSession) => {
  if (newSession?.user) {
    await loadProfile(newSession.user.id)
  }
}, { immediate: true })
</script>
