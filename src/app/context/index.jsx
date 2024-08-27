'use client'

import React from 'react'
import { config, projectId } from '@/app/config'

import { createWeb3Modal } from '@web3modal/wagmi/react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { WagmiProvider } from 'wagmi'

const queryClient = new QueryClient()

if (!projectId) throw new Error('Project ID is not defined')

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, 
  enableOnramp: true,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': ""
  }
})

export default function Web3ModalProvider({
  children,
  initialState
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}