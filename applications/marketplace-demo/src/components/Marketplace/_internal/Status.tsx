import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import { MarketplaceStatus } from '@/components/Marketplace/types'

interface StatusProps {
  status: MarketplaceStatus
}

function Status({ status }: StatusProps) {
  return (
    <>
      {/*{walletStatus === WalletSigningStatus.signTransaction && (*/}
      {/*  <Box mt={2}>*/}
      {/*    <Alert severity="info">Waiting for a response back from the wallet.</Alert>*/}
      {/*  </Box>*/}
      {/*)}*/}
      {/*{walletStatus === WalletSigningStatus.signTransactionFailed && (*/}
      {/*  <Box mt={2}>*/}
      {/*    <Alert severity="error">Transaction has failed to build. Please try again.</Alert>*/}
      {/*  </Box>*/}
      {/*)}*/}
      {status === MarketplaceStatus.Created && (
        <Box mt={2}>
          <Alert severity="info">Waiting for the transaction to be processed...</Alert>
        </Box>
      )}
      {status === MarketplaceStatus.Pending && (
        <Box mt={2}>
          <Alert severity="info">Waiting for the transaction to be confirmed on the blockchain...</Alert>
        </Box>
      )}
      {status === MarketplaceStatus.Invalid && (
        <Box mt={2}>
          <Alert severity="error">Transaction has failed to process. Please contact support.</Alert>
        </Box>
      )}
    </>
  )
}

export default Status
