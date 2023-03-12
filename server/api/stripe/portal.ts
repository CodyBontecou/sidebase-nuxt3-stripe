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

  const stripe = initStripe(runtimeConfig.STRIPE_SECRET_KEY)

  const stripeSession = await stripe.billingPortal.sessions.create({
    customer: userAccount?.stripe_customer,
    return_url: 'http://localhost:3000/dashboard'
  })

  return { url: stripeSession.url }
})
