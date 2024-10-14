import { ApolloError, useQuery } from '@apollo/client'
import { POLICY_ASSETS_QUERY } from './queries'
import { PolicyAssetResponse } from '@/graphql/_generated/graphql'

interface Data {
  policyAssets: PolicyAssetResponse
}

interface UsePolicyAssets {
  data: Data
  loading: boolean
  error: ApolloError | Error | undefined
}

interface UsePolicyAssetsProps {
  policyId: string
}

export function usePolicyAssets({ policyId }: UsePolicyAssetsProps): UsePolicyAssets {
  const { data, loading, error } = useQuery(POLICY_ASSETS_QUERY, {
    variables: {
      and: {
        key: 'policy_id',
        value: policyId,
        operator: 'EQUALS',
      },
      limit: 1000,
    },
  })

  return {
    data: data!.policyAssets!.results,
    loading,
    error,
  }
}
