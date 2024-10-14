import React, { FC, ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import { CardanoWallet, useNetwork, useWallet } from '@meshsdk/react'
import { AlertTitle } from '@mui/material'

interface Props {
  children: ReactNode
}

const Loading: FC = () => (
  <>
    <Typography component="h3" variant="body1" fontWeight="bold">
      Authenticating
    </Typography>
    <p>Checking wallet connection...</p>
  </>
)

const TestnetAlert: FC = () => {
  return (
    <Snackbar open={true}>
      <Alert severity="error">
        You are currently connected to <strong>TESTNET</strong>
      </Alert>
    </Snackbar>
  )
}

function Connected({ children }: Props) {
  return <>{children}</>
}

function Disconnected() {
  return (
    <>
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>Restricted Access</AlertTitle>
        <Typography mb={2}>Please connect your wallet to continue.</Typography>
        <CardanoWallet />
      </Alert>
    </>
  )
}

const AuthWall: FC<Props> = ({ children }) => {
  const { connected, connecting: loading } = useWallet()
  const walletNetwork = useNetwork()

  if (loading) return <Loading />
  if (!connected) return <Disconnected />
  return (
    <>
      <Connected>
        {children}
        {walletNetwork === 0 && <TestnetAlert />}
      </Connected>
    </>
  )
}

export default AuthWall
