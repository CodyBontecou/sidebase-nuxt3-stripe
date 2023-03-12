<script setup>
const { data: plans } = await useFetch('/api/stripe/plans')
</script>

<template>
  <section class="">
    <div class="mx-auto max-w-screen-xl py-8 px-4 lg:py-16 lg:px-6">
      <div class="mx-auto mb-8 max-w-screen-md text-center lg:mb-12">
        <h2 class="mb-4 text-4xl font-extrabold tracking-tight text-white">
          Stripe + Nuxt 3
        </h2>
        <p class="mb-5 font-light text-gray-400 sm:text-xl">
          Here's a simple template to showcase how you can integrate Stripe alongside Nuxt.
        </p>
      </div>
      <div
        class="space-y-8 sm:gap-6 lg:grid lg:grid-cols-3 lg:space-y-0 xl:gap-10"
      >
        <PricingCard v-for="plan in plans" :key="plan.id" :plan="plan" />
      </div>
    </div>
  </section>
</template>
