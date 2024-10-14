import { gql } from '@apollo/client'

export const MARKETPLACE_CONFIG_QUERY = gql`
  query GetMarketplaceConfig {
    marketplace_config {
      protocol_owner_address
      script_address
      fee_oracle_address
      fee_oracle_asset
    }
  }
`

export const POLICY_ASSETS_SALE_ACTIVITY_QUERY = gql`
  query GetPolicyAssetSale($and: [WhereInput]) {
    policy_assets(and: $and, limit: 1) {
      results {
        asset
        extend {
          price
          is_sale
          seller_address
        }
        last_activity {
          status
          type
          price
          receiver_address
        }
      }
    }
  }
`
