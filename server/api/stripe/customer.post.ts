import loadStripe from 'stripe'

export default eventHandler(async (event) => {
  const body = await readBody(event)
  const query = await getQuery(event)
  const runtimeConfig = useRuntimeConfig()

  if (query.API_ROUTE_SECRET !== runtimeConfig.API_ROUTE_SECRET) {
    throw createError({
      statusCode: 401,
      statusMessage: 'You are not authorized to call this API.'
    })
  }

  const userAccount = await event.context.prisma.account.findFirst({
    where: {
      userId: body.record.id
    }
  })

  const stripe = await loadStripe(runtimeConfig.STRIPE_SECRET_KEY)

  if (!userAccount?.stripe_customer) {
    const customer = await stripe.customers.create({
      email: body.record.email
    })

    await event.context.prisma.account.update({
      where: {
        userId: body.record.id
      },
      data: { stripe_customer: customer.id }
    })

    return { message: `stripe customer created: ${customer.id}` }
  } else {
    return { message: `stripe customer exists: ${userAccount.stripe_customer}` }
  }
})
