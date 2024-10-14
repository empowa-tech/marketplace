import { useCallback } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { LoadingButton } from '@mui/lab'
import { AccountBalanceWallet as AccountBalanceWalletIcon } from '@mui/icons-material'
import { Box } from '@mui/material'
import { MarketplaceFormDefaultValues, MarketplaceSubmitFormData } from '../types'

interface BuyFormProps {
  defaultValues: MarketplaceFormDefaultValues
  submitting: boolean
  disabled: boolean
  handleSubmit: (data: MarketplaceSubmitFormData) => void
}

function BuyForm({ defaultValues, submitting, disabled, handleSubmit }: BuyFormProps) {
  const { price } = defaultValues
  const { handleSubmit: submitHandler } = useForm({
    defaultValues,
  })

  const onSubmit = useCallback(
    (data: FieldValues): void => {
      handleSubmit(data as MarketplaceSubmitFormData)
    },
    [handleSubmit],
  )

  return (
    <form onSubmit={submitHandler(onSubmit)}>
      <Box mb={2}>{price}</Box>
      <LoadingButton
        loadingPosition="start"
        startIcon={<AccountBalanceWalletIcon />}
        variant="contained"
        type="submit"
        disabled={disabled}
        loading={submitting}
        loadingIndicator="Buying..."
      >
        Buy
      </LoadingButton>
    </form>
  )
}

export default BuyForm
