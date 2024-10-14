import { usePolicyAssets } from '@/components/PolicyAssets/hooks'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import CardActionArea from '@mui/material/CardActionArea'
import CardMedia from '@mui/material/CardMedia'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import React from 'react'
import { replaceIpfsWithGatewayUrl } from '@/utils'
import { NextLinkComposed } from '@/components'
import { PolicyAsset } from '@/graphql/_generated/graphql'

function PolicyAssetsItem({ onchain_metadata }: PolicyAsset) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea>
        {onchain_metadata?.image && (
          <CardMedia sx={{ position: 'relative', height: 300 }}>
            <Image
              src={replaceIpfsWithGatewayUrl(onchain_metadata.image)}
              alt="Policy Asset thumbnail image"
              fill={true}
              style={{ objectFit: 'cover' }}
            />
          </CardMedia>
        )}
        <CardContent>
          <Typography variant="h6" component="h2" lineHeight={1.2} mb={1}>
            {onchain_metadata?.name}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

interface PolicyAssetsProps {
  policyId: string
}

function PolicyAssets({ policyId }: PolicyAssetsProps) {
  const { data, loading, error } = usePolicyAssets({ policyId })

  if (loading) return <>Fetching policy assets...</>

  if (error) throw error

  const total = data?.policyAssets?.total || 0
  const assets = data?.policyAssets?.results as PolicyAsset[]

  return (
    <>
      <Typography variant="h6" mb={2}>
        {total} total
      </Typography>
      <Grid container spacing={4}>
        {assets.map((asset) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={asset._id}>
            <Box component={'article'} sx={{ height: '100%' }}>
              <NextLinkComposed to={`/asset/${asset.asset}`} sx={{ textDecoration: 'none' }}>
                <PolicyAssetsItem {...asset} />
              </NextLinkComposed>
            </Box>
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export default PolicyAssets
