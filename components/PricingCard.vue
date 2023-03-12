<script setup lang="ts">
import { loadStripe } from '@stripe/stripe-js'

const { data, signIn } = useSession()

const runtimeConfig = useRuntimeConfig()
const { plan } = defineProps(['plan'])

async function login () {
  await signIn()
}

const showSubscribeButton = computed(
  () => !!data.value?.user && !data.value.is_subscribed
)
const showCreateAccountButton = computed(() => !data.value?.user)
const showManageSubscriptionButton = computed(
  () => !!data.value?.user && data.value?.is_subscribed
)

async function processSubscription (priceId: number) {
  const { data: stripeSessionData } = await useFetch(
    `api/subscription/${priceId}`
  )

  const stripe = await loadStripe(runtimeConfig.public.STRIPE_PUBLISHABLE_KEY)
  await stripe.redirectToCheckout({
    sessionId: stripeSessionData.value.stripeSessions.id
  })
}

const portalUrl = ref('')

onMounted(async () => {
  await nextTick(async () => {
    const { data } = await useFetch('/api/stripe/portal')
    portalUrl.value = data.value.url
  })
})
</script>

<template>
  <div
    class="mx-auto flex max-w-lg flex-col rounded-lg border border-gray-600 bg-gray-800 p-6 text-center text-white shadow xl:p-8"
  >
    <h3 class="mb-4 text-2xl font-semibold">
      {{ plan.name }}
    </h3>
    <p class="font-light text-gray-400 sm:text-lg">
      {{ plan.description }}
    </p>
    <div class="my-8 flex items-baseline justify-center">
      <span class="mr-2 text-5xl font-extrabold">${{ plan.price / 100 }}</span>
      <span class="text-gray-400">/{{ plan.interval }}</span>
    </div>
    <!-- List -->
    <ul role="list" class="mb-8 space-y-4 text-left">
      <li
        class="flex items-center space-x-3"
      >
        <!-- Icon -->
        <Checkmark />
        <span>Feature text here</span>
      </li>
      <li
        class="flex items-center space-x-3"
      >
        <!-- Icon -->
        <Checkmark />
        <span>And another feature</span>
      </li>
      <li
        class="flex items-center space-x-3"
      >
        <!-- Icon -->
        <Checkmark />
        <span>Featuuuures</span>
      </li>
      <li
        class="flex items-center space-x-3"
      >
        <!-- Icon -->
        <Checkmark />
        <span>$$$</span>
      </li>
    </ul>
    <button
      v-if="showSubscribeButton"
      class="btn"
      @click="processSubscription(plan.id)"
    >
      Subscribe
    </button>
    <button v-else-if="showCreateAccountButton" class="btn" @click="login">
      Create Account
    </button>
    <a
      v-else-if="showManageSubscriptionButton"
      :href="portalUrl"
      class="btn"
    >
      Manage Subscription
    </a>
  </div>
</template>

<style scoped>
.btn {
  @apply rounded-lg bg-indigo-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-900;
}
</style>
