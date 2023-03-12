import GithubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { NuxtAuthHandler } from '#auth'

const runtimeConfig = useRuntimeConfig()
const prisma = new PrismaClient()

export default NuxtAuthHandler({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn ({ user }) {
      await $fetch('/api/stripe/customer', {
        method: 'POST',
        query: {
          API_ROUTE_SECRET: runtimeConfig.API_ROUTE_SECRET
        },
        body: {
          record: {
            email: user.email,
            id: user.id
          }
        }
      })
      return true
    },
    async session ({ session }) {
      const account = await $fetch('/api/me', {
        method: 'POST',
        query: {
          API_ROUTE_SECRET: runtimeConfig.API_ROUTE_SECRET
        },
        body: {
          record: {
            email: session?.user?.email
          }
        }
      })
      ;(session as any).is_subscribed = account?.is_subscribed
      ;(session as any).interval = account?.interval
      return Promise.resolve(session)
    }
  },
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    GithubProvider.default({
      clientId: runtimeConfig.public.GITHUB_CLIENT_ID,
      clientSecret: runtimeConfig.GITHUB_CLIENT_SECRET
    })
  ]
})
