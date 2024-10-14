import type { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { gql } from '@apollo/client'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import collectionsData from '@/data/collections.json'
import { PolicyAsset } from '@/graphql/_generated/graphql'
import { POLICY_ASSETS_FIELDS } from '@/graphql/fragments/policyAssets'
import client from '@/services/apollo-client'
import { replaceIpfsWithGatewayUrl } from '@/utils'
import { Layout } from '@/components'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import dynamic from 'next/dynamic'
import { ErrorBoundary } from 'react-error-boundary'
import AuthWall from '@/components/AuthWall'

const Marketplace = dynamic(() => import('@/components/Marketplace'), {
  loading: () => <Typography>Loading Marketplace Content...</Typography>,
  ssr: false, // Disable SSR for this component if it relies on browser APIs
})

function AssetPage({ asset, onchain_metadata }: PolicyAsset) {
  return (
    <>
      <Head>
        <title>{onchain_metadata?.name} | Marketplace Demo</title>
      </Head>
      <Layout>
        <Container>
          <Grid container py={5} spacing={6}>
            <Grid size={{ xs: 12, md: 6 }}>
              {onchain_metadata?.image && (
                <Box sx={{ position: 'relative', height: '100%', pb: '100%' }}>
                  <Image
                    src={replaceIpfsWithGatewayUrl(onchain_metadata?.image)}
                    alt="Policy Asset thumbnail image"
                    fill={true}
                  />
                </Box>
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} py={2}>
              <Box mb={5}>
                <Typography variant="h4" component="h1" lineHeight={1.2} mb={1}>
                  {onchain_metadata?.name}
                </Typography>
                <Typography>{onchain_metadata?.description}</Typography>
              </Box>

              <Card>
                <CardContent>
                  <ErrorBoundary fallback={<Typography>Failed to load marketplace content</Typography>}>
                    <Typography variant="h6" component="h2" lineHeight={1.2} mb={4}>
                      Sale Information
                    </Typography>
                    <AuthWall>
                      <Marketplace asset={asset!} />
                    </AuthWall>
                  </ErrorBoundary>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Layout>
    </>
  )
}

export const getStaticPaths = (async () => {
  const policyIds = collectionsData.collections.map((collection) => collection.policyId)

  const { data } = await client.query({
    query: gql`
      query GetPolicyAssets($policyIds: [String]) {
        policy_assets(limit: 20000, and: [{ key: "policy_id", values: $policyIds, operator: IN }]) {
          results {
            asset
          }
        }
      }
    `,
    variables: {
      policyIds,
    },
  })

  const ids = data.policy_assets.results
    .map((policyAsset: PolicyAsset) => policyAsset?.asset?.toString())
    .filter(Boolean) as string[]

  const paths = ids.map((id) => ({ params: { id } }))

  return {
    fallback: false,
    paths,
  }
}) satisfies GetStaticPaths

export const getStaticProps = (async (context) => {
  const id = context?.params?.id

  const { data: policyAssetApiData } = await client.query({
    query: gql`
      ${POLICY_ASSETS_FIELDS}
      query GetPolicyAssets($id: String) {
        policy_assets(limit: 1, and: [{ key: "asset", value: $id, operator: EQUALS }]) {
          results {
            ...PolicyAssetParts
          }
        }
      }
    `,
    variables: {
      id,
    },
  })

  const policyAsset = policyAssetApiData.policy_assets.results[0]

  return {
    props: {
      ...policyAsset,
    },
  }
}) satisfies GetStaticProps

export default AssetPage
