import React, { ChangeEvent, useCallback, useMemo, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { mixed, number, object, string } from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { AccountBalanceWallet as AccountBalanceWalletIcon } from '@mui/icons-material'
import { Box, Button, ButtonGroup, FormControl, InputLabel, OutlinedInput } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { MarketplaceOperationType, MarketplaceSubmitFormData, MarketplaceFormDefaultValues } from '../types'
import PriceCalculation from './PriceCalculation'

interface EditSaleFormProps {
  feePercentage: number
  defaultValues: MarketplaceFormDefaultValues
  lastKnownType: MarketplaceOperationType
  submitting: boolean
  disabled: boolean
  handleSubmit: (data: MarketplaceSubmitFormData) => void
}

const updateSchema = object({
  price: number().min(0.1).required(),
  asset: string().required(),
  type: mixed<MarketplaceOperationType>().oneOf(Object.values(MarketplaceOperationType)).required(),
})

function CancelOrUpdateSaleForm({
  defaultValues,
  submitting,
  disabled,
  handleSubmit,
  handleEdit,
}: Omit<EditSaleFormProps, 'lastKnownType'> & { handleEdit: () => void }) {
  const { handleSubmit: submitHandler } = useForm({
    defaultValues: {
      ...defaultValues,
      type: MarketplaceOperationType.Cancel,
    },
  })

  const { price } = defaultValues

  const onSubmit = useCallback(
    (data: FieldValues): void => {
      handleSubmit(data as MarketplaceSubmitFormData)
    },
    [handleSubmit],
  )

  return (
    <form onSubmit={submitHandler(onSubmit)}>
      <Box mb={2}>{price}</Box>

      <ButtonGroup variant="contained" aria-label="outlined primary button group">
        <Button variant="contained" onClick={handleEdit} disabled={disabled}>
          Edit Price
        </Button>
        <LoadingButton
          loadingPosition="start"
          startIcon={<AccountBalanceWalletIcon />}
          variant="contained"
          type="submit"
          loading={submitting}
          disabled={disabled}
        >
          Remove NFT from Sale
        </LoadingButton>
      </ButtonGroup>
    </form>
  )
}

function UpdateSaleForm({
  defaultValues,
  feePercentage,
  submitting,
  disabled,
  handleSubmit,
  handleCancelEdit,
}: Omit<EditSaleFormProps, 'lastKnownType'> & { handleCancelEdit: () => void }) {
  const {
    register,
    handleSubmit: submitHandler,
    watch,
  } = useForm({
    resolver: yupResolver(updateSchema),
    defaultValues: {
      ...defaultValues,
      type: MarketplaceOperationType.Update,
    },
  })

  const { asset, price } = defaultValues

  const onSubmit = useCallback(
    (data: FieldValues): void => {
      handleSubmit(data as MarketplaceSubmitFormData)
    },
    [handleSubmit],
  )

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
            type="number"
            label="Price"
            placeholder="Enter the new price"
            disabled={disabled}
            defaultValue={price}
            {...register('price')}
            onChange={handleChange}
          />
          <input type="hidden" value={price} {...register('price')} />
          <input type="hidden" value={asset} {...register('asset')} />
          <input type="hidden" value={MarketplaceOperationType.Update} {...register('type')} />
        </FormControl>
      </Box>
      {watch('price') > 0 && <PriceCalculation price={price} feePercentage={feePercentage} />}
      <Box>
        <ButtonGroup variant="contained" aria-label="outlined primary button group">
          <LoadingButton
            loadingPosition="start"
            startIcon={<AccountBalanceWalletIcon />}
            variant="contained"
            type="submit"
            loading={submitting}
            disabled={disabled}
          >
            Update Price
          </LoadingButton>
          <Button disabled={disabled} onClick={handleCancelEdit}>
            Cancel
          </Button>
        </ButtonGroup>
      </Box>
    </form>
  )
}

function EditSaleForm({ lastKnownType, submitting, defaultValues, ...props }: EditSaleFormProps) {
  const defaultEditMode = useMemo(() => {
    const isUpdating = lastKnownType === MarketplaceOperationType.Update
    return isUpdating && submitting
  }, [lastKnownType, submitting])

  const [editMode, setEditMode] = useState(defaultEditMode)

  const handleEdit = useCallback(() => {
    setEditMode(true)
  }, [setEditMode])

  const handleCancelEdit = useCallback(() => {
    setEditMode(false)
  }, [setEditMode])

  if (editMode) {
    return (
      <UpdateSaleForm
        defaultValues={{ ...defaultValues, type: MarketplaceOperationType.Update }}
        submitting={submitting}
        handleCancelEdit={handleCancelEdit}
        {...props}
      />
    )
  }
  return (
    <CancelOrUpdateSaleForm
      defaultValues={{ ...defaultValues, type: MarketplaceOperationType.Cancel }}
      submitting={submitting}
      handleEdit={handleEdit}
      {...props}
    />
  )
}

export default EditSaleForm
