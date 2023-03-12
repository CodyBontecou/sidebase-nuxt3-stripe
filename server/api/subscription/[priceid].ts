import initStripe from 'stripe'
import { getServerSession } from '#auth'

const runtimeConfig = useRuntimeConfig()

export default eventHandler(async (event) => {
  const session = await getServerSession(event)
  const userAccount = await event.context.prisma.account.findFirst({
    where: {
      user: {
        email: session?.user?.email
      }
    },
    include: {
      user: true
    }
  })

  const { priceid } = event.context.params
  const stripe = initStripe(runtimeConfig.STRIPE_SECRET_KEY)
  const lineItems = [
    {
      price: priceid,
      quantity: 1
    }
  ]

  const stripeSessions = await stripe.checkout.sessions.create({
    customer: userAccount?.stripe_customer,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: 'http://localhost:3000/payment/success',
    cancel_url: 'http://localhost:3000/payment/cancelled'
  })

  return { userAccount, stripeSessions }
})
