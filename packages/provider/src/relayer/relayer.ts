import { BigNumberish } from "ethers/utils"
import { ArcadeumTransaction, ArcadeumContext, ArcadeumWalletConfig, MetaTxReceipt } from "../types"
import { TransactionResponse } from "ethers/providers"

export declare abstract class Relayer {
  constructor()
  abstract relay(
    config: ArcadeumWalletConfig,
    context: ArcadeumContext,
    signature: string | Promise<string>,
    ...transactions: ArcadeumTransaction[]
  ): Promise<TransactionResponse>

  abstract estimateGasLimit(
    config: ArcadeumWalletConfig,
    context: ArcadeumContext,
    ...transactions: ArcadeumTransaction[]
  ): Promise<BigNumberish | undefined>

  abstract estimateMetaTxnGasReceipt(
    config: ArcadeumWalletConfig,
    context: ArcadeumContext,
    feeToken: string,
    ...transactions: ArcadeumTransaction[]
  ): Promise<BigNumberish | undefined>

  abstract getMetaTxnReceipt(
    metaTxID: string
  ): Promise<MetaTxReceipt>

  abstract isMetaTxHash(
    metaTxID: string
  ): Promise<boolean>
}
