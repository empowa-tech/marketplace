import moment from 'moment'
import {
  Data,
  ApiData,
  MarketplaceContext,
  MarketplaceOperationType,
  MarketplaceStatus,
} from '@/components/Marketplace/types'
import { Asset } from '@meshsdk/core'
import { defaultPolicyAssetExtend, defaultPolicyAssetLastActivity } from '@/components/Marketplace/constants'
import { calcToLovelace, calcFromLovelace } from '@empowa-tech/common'

export function calculateFeeAmount(price: number, feePercentage: number) {
  const priceInLovelace = calcToLovelace(price)
  const feePriceInLovelace = priceInLovelace * feePercentage

  return calcFromLovelace(feePriceInLovelace)
}

export function calculateSellerAmount(price: number, feePercentage: number) {
  const priceLovelace = calcToLovelace(price)
  const feePriceLovelace = priceLovelace * feePercentage
  return calcFromLovelace(priceLovelace - feePriceLovelace)
}

/**
 * Get Expiration Date
 * @param hours
 */
export const getExpirationDate = (hours = 6): string => {
  return moment().utc().add(hours, 'hour').toISOString()
}

/**
 * Get Context Type
 * seller = UI - update / cancel
 * buyer = UI - buy
 * owner  = UI - sell (listing)
 * not_available = UI shows nothing (message)
 * @param isOwnerOfAsset
 * @param isSellerOfAsset
 * @param isBuyerOfAsset
 */
export const getContextType = (
  isOwnerOfAsset: boolean,
  isSellerOfAsset: boolean,
  isBuyerOfAsset: boolean,
): MarketplaceContext => {
  switch (true) {
    case isSellerOfAsset:
      return MarketplaceContext.Seller
    case isBuyerOfAsset:
      return MarketplaceContext.Buyer
    case isOwnerOfAsset:
      return MarketplaceContext.Owner
    default:
      return MarketplaceContext.None
  }
}

export const mutateApiData = (apiData: ApiData, walletAddress: string, walletAssets: Asset[]): Data => {
  const apiDataExtend = apiData?.extend?.[0] || defaultPolicyAssetExtend
  const apiDataLastActivity = apiData?.last_activity || defaultPolicyAssetLastActivity

  const asset = apiData.asset || ''
  const isSale = apiDataExtend.is_sale
  const sellerAddress = apiDataExtend.seller_address as string
  const status = apiDataLastActivity.status as MarketplaceStatus
  const type = apiDataLastActivity.type as MarketplaceOperationType
  const receiverAddress = apiDataLastActivity.receiver_address
  let price = apiDataExtend.price || 0
  const priceFromLastActivity = apiDataLastActivity.price

  const statusInProgress = [MarketplaceStatus.Pending, MarketplaceStatus.Created].includes(status as MarketplaceStatus)
  const typeBuyerInProgress = [MarketplaceOperationType.Buy].includes(type as MarketplaceOperationType)
  const typeSellerInProgress = [MarketplaceOperationType.Update, MarketplaceOperationType.Cancel].includes(
    type as MarketplaceOperationType,
  )
  const typeOwnerInProgress = [MarketplaceOperationType.Sell].includes(type as MarketplaceOperationType)

  // if listed on marketplace: extend is always available and updated
  const isAssetOfOwnerDefault = !!walletAssets.find((a) => a.unit === asset)
  const isAssetOfOwnerInProgress = typeOwnerInProgress && statusInProgress && walletAddress === receiverAddress
  const isAssetOfSellerOnMarketplace = isSale && walletAddress === sellerAddress
  const isAssetOfSellerInProgress = typeSellerInProgress && statusInProgress && walletAddress === receiverAddress
  const isAssetOfBuyerOnMarketplace = isSale && walletAddress !== receiverAddress
  const isAssetOfBuyerInProgress =
    isSale && walletAddress === receiverAddress && typeBuyerInProgress && statusInProgress

  // Define context
  const isOwnerOfAsset = isAssetOfOwnerDefault || isAssetOfOwnerInProgress
  const isSellerOfAsset = isAssetOfSellerOnMarketplace || isAssetOfSellerInProgress
  const isBuyerOfAsset = isAssetOfBuyerOnMarketplace || isAssetOfBuyerInProgress
  const context = getContextType(isOwnerOfAsset, isSellerOfAsset, isBuyerOfAsset)

  if (isAssetOfSellerInProgress || isAssetOfOwnerInProgress) {
    price = priceFromLastActivity!
  }

  return {
    asset,
    context,
    price,
    sellerAddress,
    status,
    type,
  }
}
