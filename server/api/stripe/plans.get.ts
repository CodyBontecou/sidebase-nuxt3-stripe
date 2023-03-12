import loadStripe from 'stripe'

const runtimeConfig = useRuntimeConfig()

export default eventHandler(async (event) => {
  const stripe = await loadStripe(runtimeConfig.STRIPE_SECRET_KEY)
  const { data: prices } = await stripe.prices.list()

  const plans = await Promise.all(
    prices.map(async (price) => {
      const product = await stripe.products.retrieve(price.product)
      return {
        id: price.id,
        name: product.name,
        description: product.description,
        price: price.unit_amount,
        interval: price.recurring.interval,
        currency: price.currency,
        metadata: product.metadata
      }
    })
  )

  return plans
})
