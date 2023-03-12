import initStripe from 'stripe'
import { getServerSession } from '#auth'

const runtimeConfig = useRuntimeConfig()

export default eventHandler(async (event) => {
  const body = await readRawBody(event, false)
  const session = await getServerSession(event)
  const stripe = initStripe(runtimeConfig.STRIPE_SECRET_KEY)
  const headers = getHeaders(event)
  const signature = headers['stripe-signature']
  let stripeEvent

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      runtimeConfig.STRIPE_SIGNING_SECRET
    )
  } catch (e) {
    const error = createError({
      statusCode: 400,
      statusMessage: `Webhook error: ${e}`
    })
    return sendError(event, error)
  }

  const user = await event.context.prisma.user.findFirst({
    where: {
      email: session?.user?.email
    }
  })

  switch (stripeEvent.type) {
    case 'customer.subscription.created':
      await event.context.prisma.account.update({
        where: {
          userId: user?.id
        },
        data: {
          is_subscribed: true,
          interval: stripeEvent.data.object.items.data[0].plan.interval
        }
      })
      break
    case 'customer.subscription.updated':
      await event.context.prisma.account.update({
        where: {
          userId: user?.id
        },
        data: {
          is_subscribed: true,
          interval: stripeEvent.data.object.items.data[0].plan.interval
        }
      })
      break
    case 'customer.subscription.deleted':
      await event.context.prisma.account.update({
        where: {
          userId: user?.id
        },
        data: {
          is_subscribed: false,
          interval: null
        }
      })
      break
  }

  return { received: true }
})
