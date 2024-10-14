import { resolvePaymentKeyHash, resolveStakeKeyHash, pubKeyAddress, Network } from '@meshsdk/core'
import { calcToLovelace } from '@empowa-tech/common'

export const getNetworkId = (network: Network) => {
  switch (true) {
    case network === 'mainnet':
      return 1
    default:
      return 0
  }
}

export const constructDatumData = (
  price: number,
  policyId: string,
  assetName: string,
  receiverAddress: string,
  stakeAddress?: string,
): any => {
  const pubKeyHash = resolvePaymentKeyHash(receiverAddress)
  const stakeKeyHash = stakeAddress ? resolveStakeKeyHash(stakeAddress) : undefined

  return {
    constructor: 0,
    fields: [
      { int: calcToLovelace(price) },
      pubKeyAddress(pubKeyHash, stakeKeyHash),
      { bytes: policyId },
      { bytes: assetName },
    ],
  }
}
