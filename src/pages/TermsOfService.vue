<template>
  <HeaderLanding/>
    <section class="bg-black text-white min-h-screen py-20 px-6 leading-relaxed">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
      <p class="mb-4">
        Welcome to OutreachGenie. By using our platform, you agree to these Terms of Service. Please read them carefully.
      </p>

      <h2 class="text-2xl font-semibold mt-8 mb-3">1. Use of Service</h2>
      <p class="mb-4">
        You may use our platform only in compliance with applicable laws and regulations. You agree not to use OutreachGenie for spam, phishing, or illegal activities.
      </p>

      <h2 class="text-2xl font-semibold mt-8 mb-3">2. Accounts</h2>
      <p class="mb-4">
        You are responsible for maintaining the confidentiality of your account credentials. We reserve the right to suspend or terminate accounts that violate these terms.
      </p>

      <h2 class="text-2xl font-semibold mt-8 mb-3">3. Payments</h2>
      <p class="mb-4">
        Paid subscriptions are processed securely via Stripe. By purchasing a subscription, you agree to automatic renewals unless canceled before the renewal date.
      </p>

      <h2 class="text-2xl font-semibold mt-8 mb-3">4. AI-Generated Content</h2>
      <p class="mb-4">
        OutreachGenie may use AI-generated content to assist your communication. You remain solely responsible for reviewing and approving all outgoing messages.
      </p>

      <h2 class="text-2xl font-semibold mt-8 mb-3">5. Liability</h2>
      <p class="mb-4">
        OutreachGenie is not responsible for any damages arising from misuse of the service. Our maximum liability shall not exceed the total fees paid for the current subscription period.
      </p>

      <h2 class="text-2xl font-semibold mt-8 mb-3">6. Termination</h2>
      <p class="mb-4">
        We may suspend or terminate your access if you violate these terms or abuse the platform. Upon termination, all obligations under the Free or Paid plan cease immediately.
      </p>

      <h2 class="text-2xl font-semibold mt-8 mb-3">7. Changes</h2>
      <p class="mb-4">
        We may update these Terms from time to time. Continued use of the platform constitutes acceptance of the updated terms.
      </p>

      <p>
        Questions? Contact us at
        <a href="mailto:legal@outreachgenie.com" class="text-[#00C786]">legal@outreachgenie.com</a>
      </p>

      <p class="pt-10 text-sm text-gray-500 text-center">
        {{ t('last_updated') }}: 01.09.2025.
      </p>
    </div>
  </section>
  <Footer/>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import HeaderLanding from "@/components/HeaderLanding.vue";
import Footer from "@/components/Footer.vue";
const { t } = useI18n()
</script>
