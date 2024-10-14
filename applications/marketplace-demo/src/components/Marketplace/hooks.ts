import { useQuery } from '@apollo/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAddress, useAssets, useWallet } from '@meshsdk/react'
import { BlockfrostProvider } from '@meshsdk/core'
import { MarketplaceContract } from '@empowa-tech/marketplace-contract'
import { blockfrostApiKey } from '@/constants'
import { MARKETPLACE_CONFIG_QUERY, POLICY_ASSETS_SALE_ACTIVITY_QUERY } from './queries'
import {
  Data,
  MarketplaceSubmitFormData,
  MarketplaceHook,
  MarketplaceOperationType,
  // MarketplaceTransactionBaseParams,
  // MarketplaceStatus,
} from './types'
import {
  // getExpirationDate,
  mutateApiData,
} from './utils'
// import { MarketplaceAppConfig } from '@/graphql/_generated/graphql'

interface UseMarketplaceProps {
  asset: string
}

function useFetchMarketplaceConfig() {
  const response = useQuery(MARKETPLACE_CONFIG_QUERY)

  return response?.data?.marketplace_config
}

function useMarketplaceContract() {
  const config = useFetchMarketplaceConfig()
  const { wallet } = useWallet()

  return useMemo(() => {
    if (config && wallet) {
      const provider = new BlockfrostProvider(blockfrostApiKey)
      return new MarketplaceContract(
        {
          scriptAddress: config.script_address,
          feeOracleAddress: config.fee_oracle_address,
          feeOracleAsset: config.fee_oracle_asset,
          protocolOwnerAddress: config.protocol_owner_address,
          tokenAsset: '171163f05e4f30b6be3c22668c37978e7d508b84f83558e523133cdf74454d50',
          feePercentage: 2.5,
          network: 'preprod',
        },
        provider,
        wallet,
      )
    }
  }, [config, wallet])
}

export function useMarketplace({ asset }: UseMarketplaceProps): MarketplaceHook {
  const [data, setData] = useState<Data | undefined>(undefined)
  const { wallet } = useWallet()
  const config = useFetchMarketplaceConfig()
  const contract = useMarketplaceContract()
  const walletAddress = useAddress()
  const walletAssets = useAssets()

  console.log(contract)

  /* queries & mutations */
  const {
    data: apiData,
    loading,
    error,
  } = useQuery(POLICY_ASSETS_SALE_ACTIVITY_QUERY, {
    variables: {
      and: [{ key: 'asset', value: asset, operator: 'EQUALS' }],
    },
    pollInterval: 30000,
  })

  // const [onSubmitMutationHandler] = useMutation(mutation, {
  //   onCompleted: () => {
  //     void refetch()
  //   },
  // })

  /* handlers */
  const buildTransaction = useCallback(
    (formData: MarketplaceSubmitFormData) => {
      console.log(contract)
      if (!contract) throw new Error('Contract is not available')

      const { asset, price, type } = formData

      switch (type) {
        case MarketplaceOperationType.Sell:
          return contract.list(asset, price!)
        case MarketplaceOperationType.Buy:
          return contract.buy(asset)
        case MarketplaceOperationType.Cancel:
          return contract.cancel(asset)
        case MarketplaceOperationType.Update:
          return contract.update(asset, price!)
        default:
          throw new Error('Could not determine marketplace operation type')
      }
    },
    [contract],
  )

  const handleSubmit = useCallback(
    async (formData: MarketplaceSubmitFormData) => {
      try {
        if (!wallet) throw new Error('BrowserWallet is not available')

        const transactionId = await buildTransaction(formData)

        if (!transactionId) throw new Error('Transaction ID is not valid')

        // const { asset, price, type } = formData

        // const mutationData = {
        //   ada_expiry: getExpirationDate(),
        //   ada_transaction_hash: transactionId,
        //   price: +price!,
        //   receiver_address: walletAddress,
        //   status: MarketplaceStatus.Created,
        //   type,
        //   policy_asset: {
        //     link: asset,
        //   },
        // }
        //
        // await onSubmitMutationHandler({
        //   variables: {
        //     data: mutationData,
        //   },
        // })
      } catch (e) {
        let error = 'An error occurred while signing the transaction'

        if (typeof e === 'string') {
          error = e as unknown as Error['message']
        } else {
          const errorObj = e as Error
          error = errorObj?.message
        }

        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    [
      // onSubmitMutationHandler,
      buildTransaction,
      contract,
      wallet,
      walletAddress,
    ],
  )

  useEffect(() => {
    if (apiData && contract && walletAddress && walletAssets) {
      const data = mutateApiData(apiData.policy_assets.results[0], walletAddress, walletAssets)
      setData(data)
    }
  }, [apiData, contract, walletAddress, walletAssets])

  return {
    config,
    data,
    loading,
    error,
    handleSubmit,
  }
}
