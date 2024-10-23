import { ApolloError, useQuery } from '@apollo/client'
import { POLICY_ASSETS_QUERY } from '@/queries'
import { OperationType, PolicyAssetsQuery } from '@/gql/graphql'

interface UsePolicyAssets {
  data: PolicyAssetsQuery | undefined
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
        operator: OperationType.Equals,
      },
      limit: 100,
    },
  })

  return {
    data,
    loading,
    error,
  }
}
