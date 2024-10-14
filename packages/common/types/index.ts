import { BlockfrostSupportedNetworks } from '@meshsdk/core'

export interface MarketplaceConfig {
  feePercentage: number
  protocolOwnerAddress: string
  scriptAddress: string
  feeOracleAddress: string
  feeOracleAsset: string
  tokenAsset?: string
  network: BlockfrostSupportedNetworks
}
