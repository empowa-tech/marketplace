import { LOVELACE_AMOUNT } from '../constants'
import { Network } from '@meshsdk/core'

export const calcToLovelace = (amount: number) => {
  return amount * LOVELACE_AMOUNT
}

export const calcFromLovelace = (lovelaceAmount: number) => {
  return lovelaceAmount / LOVELACE_AMOUNT
}

export const calcFeeAmount = (price: number, feePercentage: number): number => {
  const feeMultiplier = feePercentage / 100
  const priceInLovelace = calcToLovelace(price)
  const feePriceInLovelace = priceInLovelace * feeMultiplier

  return calcFromLovelace(feePriceInLovelace)
}

export const calcSellerAmount = (price: number, feePercentage: number): number => {
  const feeMultiplier = feePercentage / 100
  const priceLovelace = calcToLovelace(price)
  const feePriceLovelace = priceLovelace * feeMultiplier

  return calcFromLovelace(priceLovelace - feePriceLovelace)
}

export const replaceIpfsWithGatewayUrl = (ipfsUrl: string, gatewayUrl: string) => {
  return ipfsUrl.replace('ipfs://', gatewayUrl + '/')
}
