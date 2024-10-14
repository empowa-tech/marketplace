import { gql } from '@apollo/client'
import { POLICY_ASSETS_FIELDS } from '@/graphql/fragments/policyAssets'

export const POLICY_ASSETS_QUERY = gql`
  ${POLICY_ASSETS_FIELDS}
  query GetPolicyAssetsOverview($and: [WhereInput], $or: [WhereInput], $limit: Int, $page: Int) {
    policyAssets: policy_assets(and: $and, or: $or, limit: $limit, page: $page) {
      total
      results {
        ...PolicyAssetParts
      }
    }
  }
`

// export const POLICY_ASSETS_FILTERS_QUERY_OWNED_SELLING_LIST = gql`
//   query GetPolicyAssetsOwnedAndOnSale($and: [WhereInput]) {
//     policyAssetsOwnedAndOnSale: policy_assets(and: $and, limit: 99999) {
//       results {
//         asset
//         extend {
//           seller_address
//           is_sale
//         }
//       }
//     }
//   }
// `
//
// export const POLICY_ASSETS_FILTERS_QUERY = gql`
//   query GetPolicyAssetsOverviewFilterOptions($and: [WhereInput]) {
//     impactProjects: impact_projects(and: $and) {
//       results {
//         nft_collections {
//           has_reward
//           filter_attributes {
//             key
//             name
//             value {
//               key
//               name
//               value
//             }
//           }
//         }
//       }
//     }
//   }
// `
