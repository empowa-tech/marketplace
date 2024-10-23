import {
  BlockfrostProvider,
  MeshTxBuilder,
  parseAssetUnit,
  BrowserWallet,
  UTxO,
  mConStr0,
  resolvePaymentKeyHash,
  serializeAddressObj,
  deserializeDatum,
  mConStr1,
} from '@meshsdk/core'
import type { MarketplaceContract as MarketplaceContractModel } from './MarketplaceContract.model'
import { calcToLovelace, calcFeeAmount, calcSellerAmount, MarketplaceConfig } from '@empowa-tech/common'
import { constructDatumData, getNetworkId } from './MarketplaceContract.utils'

class MarketplaceContract implements MarketplaceContractModel {
  private wallet: BrowserWallet
  private readonly config: MarketplaceConfig
  private readonly provider: BlockfrostProvider

  constructor(config: MarketplaceConfig, provider: BlockfrostProvider, wallet: BrowserWallet) {
    this.config = config
    this.provider = provider
    this.wallet = wallet
  }

  private getTxBuilder() {
    return new MeshTxBuilder({
      fetcher: this.provider,
      submitter: this.provider,
      evaluator: this.provider,
    })
  }

  private async getUTxOs(providedUTxOsSrc: string | UTxO[] = [], asset?: string) {
    let utxos: UTxO[] = []

    if (typeof providedUTxOsSrc === 'string') {
      utxos = await this.provider.fetchAddressUTxOs(providedUTxOsSrc, asset)
    } else if (providedUTxOsSrc.length > 0) {
      if (asset) {
        utxos = providedUTxOsSrc.filter((u) => u.output.amount.find((a: any) => a.unit === asset))
      } else {
        utxos = providedUTxOsSrc
      }
    } else {
      throw new Error('No UTXOs or UTXOs source address provided to get UTxOs')
    }

    return utxos
  }

  private async getWalletInfo() {
    try {
      const utxos = await this.wallet.getUtxos()
      const walletAddress = await this.wallet.getUsedAddresses().then((addresses) => addresses[0])
      const stakeAddress = await this.wallet.getRewardAddresses().then((addresses) => addresses[0])
      const changeAddress = await this.wallet.getChangeAddress()
      const collateralUTxO = await this.wallet.getCollateral().then((utxos) => utxos[0])
      const networkId = await this.wallet.getNetworkId()

      if (!collateralUTxO) throw new Error('No collateral found in connected wallet. Please setup collateral first.')

      return {
        utxos,
        networkId,
        changeAddress,
        collateralUTxO,
        walletAddress,
        stakeAddress,
      }
    } catch (error) {
      throw error as Error
    }
  }

  public async list(asset: string, price: number) {
    try {
      // Get all required information
      const txBuilder = this.getTxBuilder()
      const { scriptAddress, network } = this.config
      const { policyId: assetPolicyId, assetName: assetAssetName } = parseAssetUnit(asset)
      const { utxos, stakeAddress, changeAddress, walletAddress: sellerAddress } = await this.getWalletInfo()
      const assetUTxO = await this.getUTxOs(utxos, asset).then((utxos) => utxos[0])
      const datumData = constructDatumData(+price, assetPolicyId, assetAssetName, sellerAddress, stakeAddress)

      // validate
      if (!assetUTxO) throw new Error('No asset UTxO found in users wallet')

      // build, sign & submit tx
      const unsignedTx = await txBuilder
        .setNetwork(network)
        .txIn(assetUTxO.input.txHash, assetUTxO.input.outputIndex)
        .txOut(scriptAddress, [{ unit: asset, quantity: '1' }])
        .txOutInlineDatumValue(JSON.stringify(datumData), 'JSON')
        .changeAddress(changeAddress)
        .selectUtxosFrom(utxos)
        .complete()

      const signedTx = await this.wallet.signTx(unsignedTx, false)
      return this.wallet.submitTx(signedTx)
    } catch (error) {
      throw error as Error
    }
  }

  public async buy(asset: string) {
    try {
      // Get all required information
      const {
        scriptAddress,
        feeOracleAddress,
        feeOracleAsset,
        protocolOwnerAddress,
        network,
        feePercentage,
        tokenAsset = 'lovelace',
      } = this.config
      const txBuilder = this.getTxBuilder()
      const {
        utxos,
        collateralUTxO,
        changeAddress,
        walletAddress: buyerAddress,
        networkId,
      } = await this.getWalletInfo()
      const assetUTxO = await this.getUTxOs(scriptAddress, asset).then((utxos) => utxos[0])
      const feeOracleAssetUTxO = await this.getUTxOs(feeOracleAddress, feeOracleAsset).then((utxos) => utxos[0])
      const scriptRefUTxO = await this.getUTxOs(scriptAddress).then((utxos) => utxos[0])
      const pubKeyHash = resolvePaymentKeyHash(buyerAddress)

      const inputDatum = deserializeDatum(assetUTxO.output.plutusData!)
      const sellerAddress = serializeAddressObj(inputDatum.fields[0], networkId)

      // calculate fee & seller amount
      const price = assetUTxO.output.amount.find((a) => a.unit === tokenAsset)!.quantity
      const feeAmountInLovelace = Math.round(calcToLovelace(calcFeeAmount(+price, feePercentage)))
      const sellerAmountInLovelace = Math.round(calcToLovelace(calcSellerAmount(+price, feePercentage)))

      // validate
      if (!assetUTxO) throw new Error('No asset UTxO found from script address')
      if (!scriptRefUTxO) throw new Error('No script reference UTxO found from script address')
      if (!feeOracleAssetUTxO) throw new Error('No fee oracle UTxO found from fee oracle address')

      // build, sign & submit tx
      const unsignedTx = await txBuilder
        .setNetwork(network)

        .txInCollateral(collateralUTxO.input.txHash, collateralUTxO.input.outputIndex)
        .readOnlyTxInReference(feeOracleAssetUTxO.input.txHash, feeOracleAssetUTxO.input.outputIndex) // REFERENCING ORACLE UTXO

        .spendingPlutusScriptV2()
        .txIn(assetUTxO.input.txHash, assetUTxO.input.outputIndex)
        .txInInlineDatumPresent()
        .txInRedeemerValue(mConStr0([]))
        .spendingTxInReference(scriptRefUTxO.input.txHash, scriptRefUTxO.input.outputIndex)

        // protocol pays full price
        .txOut(buyerAddress, [{ unit: asset, quantity: '1' }])
        // seller gets amount - fee
        .txOut(sellerAddress, [{ unit: tokenAsset, quantity: sellerAmountInLovelace.toString() }])
        // protocol owner gets fee
        .txOut(protocolOwnerAddress, [{ unit: tokenAsset, quantity: feeAmountInLovelace.toString() }])

        .changeAddress(changeAddress)
        .selectUtxosFrom(utxos)
        .requiredSignerHash(pubKeyHash)
        .complete()

      const signedTx = await this.wallet.signTx(unsignedTx, true)
      return this.wallet.submitTx(signedTx)
    } catch (error) {
      throw new Error()
    }
  }

  public async update(asset: string, price: number) {
    try {
      // Get all required information
      const { scriptAddress, network } = this.config
      const { policyId: assetPolicyId, assetName: assetAssetName } = parseAssetUnit(asset)
      const { utxos, collateralUTxO, changeAddress, walletAddress: sellerAddress } = await this.getWalletInfo()

      const txBuilder = this.getTxBuilder()
      const assetUTxO = await this.getUTxOs(scriptAddress, asset).then((utxos) => utxos[0])
      const scriptRefUTxO = await this.getUTxOs(scriptAddress).then((utxos) => utxos[0])
      const stakeAddress = await this.wallet.getRewardAddresses().then((addresses) => addresses[0])
      const pubKeyHash = resolvePaymentKeyHash(sellerAddress)
      const datumData = constructDatumData(+price, assetPolicyId, assetAssetName, sellerAddress, stakeAddress)

      // validate
      if (!assetUTxO) throw new Error('No asset UTxO found in script address')
      if (!scriptRefUTxO) throw new Error('No script reference UTxO found from script address')

      // build, sign & submit tx
      const unsignedTx = await txBuilder
        .setNetwork(network)
        .txInCollateral(collateralUTxO.input.txHash, collateralUTxO.input.outputIndex)
        .spendingPlutusScriptV2()
        .txIn(assetUTxO.input.txHash, assetUTxO.input.outputIndex)
        .txInInlineDatumPresent()
        .txInRedeemerValue(mConStr1([]))
        .spendingTxInReference(scriptRefUTxO.input.txHash, scriptRefUTxO.input.outputIndex)
        .txOut(scriptAddress, [{ unit: asset, quantity: '1' }])
        .txOutInlineDatumValue(JSON.stringify(datumData), 'JSON')
        .changeAddress(changeAddress)
        .selectUtxosFrom(utxos)
        .requiredSignerHash(pubKeyHash)
        .complete()
      const signedTx = await this.wallet.signTx(unsignedTx, true)
      const txHash = this.wallet.submitTx(signedTx)

      return txHash
    } catch (error) {
      throw error
    }
  }

  public async cancel(asset: string) {
    try {
      // setup
      const { scriptAddress, network } = this.config
      const txBuilder = this.getTxBuilder()
      const { utxos, collateralUTxO, changeAddress, walletAddress: sellerAddress } = await this.getWalletInfo()
      const assetUTxO = await this.getUTxOs(scriptAddress, asset).then((utxos) => utxos[0])
      const scriptRefUTxO = await this.getUTxOs(scriptAddress).then((utxos) => utxos[0])
      const pubKeyHash = resolvePaymentKeyHash(sellerAddress)

      // validate
      if (!assetUTxO) throw new Error('No asset found in script address')
      if (!scriptRefUTxO) throw new Error('No script reference UTxO found from script address')

      // build, sign & submit tx
      const unsignedTx = await txBuilder
        .setNetwork(network)
        .spendingPlutusScriptV2()
        .txIn(assetUTxO.input.txHash, assetUTxO.input.outputIndex)
        .txInInlineDatumPresent()
        .txInRedeemerValue(mConStr1([]))
        .spendingTxInReference(scriptRefUTxO.input.txHash, scriptRefUTxO.input.outputIndex)
        .changeAddress(changeAddress)
        .txInCollateral(
          collateralUTxO.input.txHash,
          collateralUTxO.input.outputIndex,
          collateralUTxO.output.amount,
          collateralUTxO.output.address,
        )
        .selectUtxosFrom(utxos)
        .requiredSignerHash(pubKeyHash)
        .complete()
      const signedTx = await this.wallet.signTx(unsignedTx)
      return await this.wallet.submitTx(signedTx)
    } catch (error) {
      throw error
    }
  }
}

export default MarketplaceContract
