import { deployArcadeum } from './utils/arcadeum_config'
import { ethers, Signer, Wallet } from 'ethers'
import * as Ganache from 'ganache-cli'

import { CallReceiverMock } from 'arcadeum-wallet/typings/contracts/CallReceiverMock'
import { HookCallerMock } from 'arcadeum-wallet/typings/contracts/HookCallerMock'

import * as arcadeum from '../src'
import { LocalRelayer, RpcRelayer } from '../src'
import { ArcadeumContext } from '../src/types'
import { AsyncSendable, Web3Provider, JsonRpcProvider } from 'ethers/providers'
import { Signer as AbstractSigner } from 'ethers'

import * as chaiAsPromised from 'chai-as-promised'
import * as chai from 'chai'
import { isValidSignature, isValidEthSignSignature, encodeMessageData, isValidWalletSignature, isValidArcadeumDeployedWalletSignature, isValidArcadeumUndeployedWalletSignature, addressOf } from '../src/utils'
import { Relayer } from '../src/relayer/relayer'

const CallReceiverMockArtifact = require('arcadeum-wallet/artifacts/CallReceiverMock.json')
const HookCallerMockArtifact = require('arcadeum-wallet/artifacts/HookCallerMock.json')

const Web3 = require('web3')
const { expect } = chai.use(chaiAsPromised)

const ARCADEUM_CONTEXT = {
  factory: '0x52f0F4258c69415567b21dfF085C3fd5505D5155',
  mainModule: '0x621821390a694d4cBfc5892C52145B8D93ACcdEE',
  mainModuleUpgradable: '0xC7cE8a07f69F226E52AEfF57085d8C915ff265f7',
  guestModule: '0xffa0c8c4d133a26a4a9a0633ce27bf2d7563d998'
}

const pk = '0x3bef99c2910c4bf539520b4809aeaa7b68c487dd9fbbe76365f62b4ad6ba8347'
const eth_rpc = 'http://192.168.86.32:8576/'
const relayer_rpc = 'http://localhost:4422'

if (process.env.ONLY_E2E) {
  describe.only('Arcadeum wallet integration', function () {
    let relayer: Relayer

    let wallet: arcadeum.Wallet
    let signer: Signer

    let callReceiver: CallReceiverMock

    (this as any).timeout(0)

    before(async () => {
      // Deploy Ganache test env
      const provider = new ethers.providers.JsonRpcProvider(eth_rpc, 4)
      signer = new ethers.Wallet(pk).connect(provider)

      // Deploy local relayer
      relayer = new RpcRelayer(relayer_rpc, false, provider)

      // Create wallet
      wallet = await arcadeum.Wallet.singleOwner(ARCADEUM_CONTEXT, ethers.utils.randomBytes(32))
      wallet = wallet.connect(eth_rpc, relayer)

      // Deploy wallet
      let deployWallet = await arcadeum.Wallet.singleOwner(ARCADEUM_CONTEXT, ethers.utils.randomBytes(32))
      deployWallet = deployWallet.connect(eth_rpc, relayer)

      // Deploy call receiver mock
      callReceiver = (await new ethers.ContractFactory(
        CallReceiverMockArtifact.abi,
        CallReceiverMockArtifact.bytecode,
        deployWallet
      ).deploy()) as CallReceiverMock
      await callReceiver.deployTransaction.wait()
    })

    describe('Send transactions', () => {
      it('Should wait for transaction receipt', async () => {
        const transaction = [
          {
            gasPrice: '20000000000',
            gas: '121000',
            to: callReceiver.address,
            value: 0,
            data: callReceiver.interface.functions.testCall.encode([24123, '0x'])
          }
        ]

        const tx = await wallet.sendTransaction(transaction)
        const receipt = await tx.wait()
        expect(receipt.to).to.exist
        expect(receipt.from).to.exist
        expect(receipt.gasUsed).to.exist
        expect(receipt.blockHash).to.exist
        expect(receipt.transactionHash).to.exist
        expect(receipt.logs).to.exist
        expect(receipt.blockNumber).to.exist
        expect(receipt.confirmations).to.exist
        expect(receipt.cumulativeGasUsed).to.exist
        expect(receipt.status).to.exist

        expect(await callReceiver.lastValA()).to.equal(24123)
      })
      it('Should get use the nonce of the relayer', async () => {
        const addr = ethers.utils.getAddress(ethers.utils.hexlify(ethers.utils.randomBytes(20)))
        const data = ethers.utils.randomBytes(64)
        const transaction = [
          {
            gasPrice: '20000000000',
            gas: '121000',
            to: addr,
            value: 0,
            data: data
          }
        ]

        const tx = await wallet.sendTransaction(transaction)
        const receipt = await tx.wait()


      })
    })
  })
}
