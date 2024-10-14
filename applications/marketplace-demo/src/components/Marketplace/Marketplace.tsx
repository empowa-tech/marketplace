import { MarketplaceContext, MarketplaceOperationType } from './types'
import { useMarketplace } from './hooks'
import Box from '@mui/material/Box'
import SellForm from '@/components/Marketplace/_internal/SellForm'
import EditSaleForm from '@/components/Marketplace/_internal/EditSaleForm'
import BuyForm from '@/components/Marketplace/_internal/BuyForm'
import Status from '@/components/Marketplace/_internal/Status'
import Typography from '@mui/material/Typography'

interface MarketplaceProps {
  asset: string
}

function Marketplace({ asset }: MarketplaceProps) {
  const { data, loading, error, handleSubmit } = useMarketplace({ asset })

  if (loading) return <>Getting Marketplace information...</>
  if (error) return <>Error getting Marketplace information</>
  if (data) {
    return (
      <>
        {data.context === MarketplaceContext.Seller ? (
          <EditSaleForm
            feePercentage={0.2}
            defaultValues={{
              asset: data.asset,
              price: data.price,
              type: MarketplaceOperationType.Update,
            }}
            lastKnownType={data.type!}
            submitting={false}
            disabled={false}
            handleSubmit={handleSubmit}
          />
        ) : data.context === MarketplaceContext.Buyer ? (
          <BuyForm
            defaultValues={{ asset: data.asset, price: data.price, type: MarketplaceOperationType.Buy }}
            submitting={false}
            disabled={false}
            handleSubmit={handleSubmit}
          />
        ) : data.context === MarketplaceContext.Owner ? (
          <SellForm
            feePercentage={0.2}
            defaultValues={{ asset: data.asset, price: data.price, type: MarketplaceOperationType.Sell }}
            submitting={false}
            disabled={false}
            onSubmit={handleSubmit}
          />
        ) : (
          <Typography>This Asset is not for sale yet.</Typography>
        )}
        {data.status && (
          <Box>
            <Status status={data.status} />
          </Box>
        )}
      </>
    )
  }

  return <>Error displaying marketplace information</>
}

export default Marketplace
