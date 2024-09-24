import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { cookieStorage, createStorage, http } from 'wagmi'
import { mainnet, sepolia, bscTestnet, bsc, avalanche, avalancheFuji, polygon, polygonMumbai } from 'wagmi/chains'

export const projectId = "80bf1c032a09be33ea76ff96fa785944"

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'Rev3al X CCIP',
  description: 'Take your tokens cross-chain!',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const config = defaultWagmiConfig({
  chains: [bsc, avalanche],

  transports: {
    // [sepolia.id]: http(),
    // [bscTestnet.id]: http(),
    // [mainnet.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
    // [avalancheFuji.id]: http(),
    // [polygon.id]: http(),
    // [polygonMumbai.id]: http()
  },
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
})