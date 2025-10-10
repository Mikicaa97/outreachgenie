<template>
  <HeaderLanding/>
  <section class="text-gray-300 py-16 px-6 leading-relaxed bg-black text-white min-h-screen py-20 px-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
      <p class="mb-4">
        OutreachGenie (“we”, “our”, or “us”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when using our services.
      </p>

      <h2 class="text-2xl font-semibold mt-8 mb-3">1. Information We Collect</h2>
      <p class="mb-4">
        We collect personal information such as your name, email address, company name, and usage data. We may also collect anonymized analytics data to improve our platform.
      </p>

      <h2 class="text-2xl font-semibold mt-8 mb-3">2. How We Use Information</h2>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>To provide and maintain our services</li>
        <li>To send transactional or marketing emails</li>
        <li>To improve AI email generation and user experience</li>
        <li>To comply with legal requirements</li>
      </ul>

      <h2 class="text-2xl font-semibold mt-8 mb-3">3. Data Storage and Security</h2>
      <p class="mb-4">
        Your data is securely stored in Supabase and protected using encryption, access control, and secure communication protocols (TLS/SSL). We never sell your data to third parties.
      </p>

      <h2 class="text-2xl font-semibold mt-8 mb-3">4. Third-Party Services</h2>
      <p class="mb-4">
        We use trusted services like OpenAI (for AI generation), Google (for Gmail API), and Stripe (for payments). These services comply with GDPR and other global standards.
      </p>

      <h2 class="text-2xl font-semibold mt-8 mb-3">5. Your Rights</h2>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Access, update, or delete your personal data</li>
        <li>Withdraw consent at any time</li>
        <li>Request data portability</li>
      </ul>

      <h2 class="text-2xl font-semibold mt-8 mb-3">6. Contact</h2>
      <p>
        For questions or data requests, please contact us at
        <a href="mailto:support@outreachgenie.com" class="text-[#00C786]">support@outreachgenie.com</a>
      </p>
    </div>
  </section>
  <Footer/>
</template>


<script setup>
import { useI18n } from 'vue-i18n'
import HeaderWeboro from "@/components/HeaderWeboro.vue";
import HeaderLanding from "@/components/HeaderLanding.vue";
import Footer from "@/components/Footer.vue";
const { t } = useI18n()
</script>
