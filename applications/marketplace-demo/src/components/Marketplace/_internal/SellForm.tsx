import { useCallback, ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { object, string, number, mixed } from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { LoadingButton } from '@mui/lab'
import { Box, FormControl, InputLabel, OutlinedInput } from '@mui/material'
import { AccountBalanceWallet as AccountBalanceWalletIcon } from '@mui/icons-material'
import PriceCalculation from '@/components/Marketplace/_internal/PriceCalculation'
import {
  MarketplaceFormDefaultValues,
  MarketplaceOperationType,
  MarketplaceSubmitFormData,
} from '@/components/Marketplace/types'

const schema = object({
  asset: string().required(),
  price: number().min(0.1).required(),
  type: mixed<MarketplaceOperationType>().oneOf(Object.values(MarketplaceOperationType)).required(),
})

interface ListFormProps {
  feePercentage: number
  defaultValues: MarketplaceFormDefaultValues
  submitting: boolean
  disabled: boolean
  onSubmit: (data: MarketplaceSubmitFormData) => void
}

function SellForm({ feePercentage, defaultValues, submitting, disabled, onSubmit }: ListFormProps) {
  const {
    register,
    handleSubmit: submitHandler,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  })

  const { price } = defaultValues
  const defaultPrice = submitting ? price : 0

  const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const value = event.currentTarget.value
    const cleanValue = value.replace(/[^1-9]/g, '')

    if (cleanValue) {
      return cleanValue
    }
  }, [])

  return (
    <form onSubmit={submitHandler(onSubmit)}>
      <Box mb={2}>
        <FormControl fullWidth={true}>
          <InputLabel htmlFor="outlined-adornment-amount">Price</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            type="text"
            label="Price"
            min={0.1}
            placeholder="Enter the price"
            disabled={disabled}
            defaultValue={defaultPrice}
            {...register('price', {
              valueAsNumber: true,
              onChange: handleChange,
              minLength: 1,
              maxLength: 1000000,
            })}
          />
        </FormControl>
      </Box>
      {watch('price') > 0 && <PriceCalculation price={watch('price')} feePercentage={feePercentage} />}
      <Box>
        <LoadingButton
          loadingPosition="start"
          startIcon={<AccountBalanceWalletIcon />}
          variant="contained"
          type="submit"
          loading={submitting}
          disabled={disabled}
          loadingIndicator={'Submitting...'}
        >
          Submit
        </LoadingButton>
      </Box>
    </form>
  )
}

export default SellForm
