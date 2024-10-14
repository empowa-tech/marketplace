import { PolicyAsset, PolicyAssetResponse } from '@/graphql/_generated/graphql'
import { ApolloError } from '@apollo/client'
import { MarketplaceConfig } from '@empowa-tech/common'

export enum MarketplaceContext {
  Buyer = 'BUYER',
  Seller = 'SELLER',
  Owner = 'OWNER',
  None = 'NONE',
}

export enum MarketplaceStatus {
  Created = 'CREATED',
  Pending = 'PENDING',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Expired = 'EXPIRED',
  Invalid = 'INVALID',
}

export enum MarketplaceOperationType {
  Buy = 'BUY',
  Sell = 'SELL',
  Update = 'UPDATE',
  Cancel = 'CANCEL',
}

export interface MarketplaceTransactionBaseParams {
  asset: string
}

export interface MarketplaceFormDefaultValues {
  asset: string
  price: number
  type: MarketplaceOperationType
}

export interface MarketplaceSubmitFormData {
  asset: string
  price?: number
  type: MarketplaceOperationType
}

export type ApiDataResponse = PolicyAssetResponse
export type ApiData = PolicyAsset

export interface Data {
  asset: string
  context: MarketplaceContext
  price: number
  sellerAddress: string | undefined
  status: MarketplaceStatus | undefined
  type: MarketplaceOperationType | undefined
}

export interface MarketplaceHook {
  config: MarketplaceConfig | undefined
  data: Data | undefined
  loading: boolean
  error: ApolloError | Error | undefined
  handleSubmit: (formData: MarketplaceSubmitFormData) => void
}
