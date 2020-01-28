<template lang="html">
  <div v-if="user">
    <div class="user-title">
      <div class="user-title-1">Withdrawal of $VYA & $CRYPTORAVES Tokens Now Available!</div>
      <a 
        class="user-title-link" 
        href="/">
        What about my personalized tokens?</a>
    </div>
    <div class="container">
      <div class="portfolio-user">
        <div
          class="portfolio-userwelcome"
        >Welcome {{ user.platformHandle }}</div>
        <div class="portfolio-userimg">
          <img
            :src="user.imgUrl"
            :title="user.platformHandle"
          >
        </div>
      </div>
      <div class="token-list-title">Token for Deposit/Withdrawal</div>
      <div 
        class="token-list"
        @click="toggle"         
      >{{ ticker }}
        <div 
          v-show="isOpen"
          class="token-options"
        >
          <div
            v-for="(option, index) in tickers"
            :key="index"
            class="token-option"
            @click="tickerSelect(option)"
          >{{ option }}</div>
        </div>
      </div>
      <div class="row user-transaction-section">
        <div class="col-lg-4 col-md-12">
          <BalancePanel
            :selected-ticker="ticker" 
            :address="loomWalletAddr"
            :url="loomBlockexplorerUrl"
            :balance="loomBalance"
            :type="true"/>
        </div>
        <div class="user-transaction-section-buttons col-lg-4 col-md-12">
          <button 
            type="button"
            class="btn btn-danger btn-arrow-right"
            @click="showWithdraw">
            Withdraw
          </button>                               
          <div class="portfolio-userimg">
            <img
              :src="TOKEN_IMAGE_URL"
              :title="ticker">
          </div>
          <button 
            type="button"
            class="btn btn-success btn-arrow-left"
            @click="showDeposit">
            Deposit
          </button>
          <button 
            type="button"
            class="btn btn-success btn-arrow-left"
            @click="resumeWithdrawal">
            ResumeWithdraw
          </button>
        </div>
        <div class="col-lg-4 col-md-12">
          <BalancePanel 
            :selected-ticker="ticker"
            :address="ethereumAddress"
            :url="ethBlockexplorerUrl"
            :balance="ethereumBalance"/>                        
        </div>
      </div>
      <div class="instruction-link"><nuxt-link to="/stepinstructions">Step-by-Step Instructions</nuxt-link></div>
    </div>
    <DepositModal 
      v-if="showDepoistModal" 
      :imageurl="TOKEN_IMAGE_URL"
      :imagetitle="ticker"
      :maxamount="ethereumBalance"
      @deposit="onDeposit"
      @closeDeposit="showDepoistModal=false"/>
    <ConfirmModal
      v-if="showConfirmModal"
      :imageurl="TOKEN_IMAGE_URL"
      :imagetitle="ticker"
      @confirm="onConfirm"/>
    <CompleteModal
      v-if="showCompleteModal"
      :imageurl="TOKEN_IMAGE_URL"
      :imagetitle="ticker"
      :stillbusy.sync="busy"
      @complete="onComplete"/>
    <WithdrawModal
      v-if="showWithdrawModal"
      :imageurl="TOKEN_IMAGE_URL"
      :imagetitle="ticker"
      :maxamount="loomBalance"
      @withdraw="onWithdraw"
      @closeWithdraw="showWithdrawModal=false"/>
    <TransferStatus 
      v-if="showTransferStatus"    
      :imageurl="TOKEN_IMAGE_URL"
      :imagetitle="ticker"/>
    <ConfirmWithdraw
      v-if="showConfirmWithdraw"
      :imageurl="TOKEN_IMAGE_URL"
      :imagetitle="ticker"
      @confirmwithdraw="onConfirmWithdraw"/>
    <ConfirmWithdrawComplete
      v-if="showConfirmWithdrawComplete"
      :imageurl="TOKEN_IMAGE_URL"
      :imagetitle="ticker"
      :stillbusy.sync="busy"
      @withdrawcomplete="onWithdrawComplete"/>
    <SignForeign
      v-if="showSignForeign"
      :username="user.platformHandle"
      :imageurl="user.imgUrl"
      @signforeign="onSignForeign"/>      
    <WaitMappingConfirm
      v-if="showWaitMappingConfirm"
      :username="user.platformHandle"
      :imageurl="user.imgUrl"
      :stillbusy.sync="busy"
      @mappingconfirm="onMappingConfirm"/>    
  </div>
  <div 
    v-else
    class="register-wallet">
    <RegisterWallet
      v-if="showRegisterWallet"
      :address="ethereumAddress"
      @registerwallet="onRegisterWallet"/>
  </div>      
</template>

<script>
import axios from 'axios'
import Web3 from 'web3'
import {
  Address,
  Client,
  Contracts,
  CryptoUtils,
  EthersSigner,
  LocalAddress,
  LoomProvider,
  NonceTxMiddleware,
  SignedEthTxMiddleware,
  createEthereumGatewayAsync,
  createDefaultTxMiddleware,
  getMetamaskSigner,
  soliditySha3
} from 'loom-js'
import { ethers } from 'ethers'
import BN from 'bn.js'
import { AddressMapper } from 'loom-js/dist/contracts'
import SectionHeader from '../components/SectionHeader'
import BalancePanel from '../components/BalancePanel'
import DepositModal from '../components/DepositModal'
import ConfirmModal from '../components/ConfirmModal'
import CompleteModal from '../components/CompleteModal'
import WithdrawModal from '../components/WithdrawModal'
import TransferStatus from '../components/TransferStatus'
import ConfirmWithdraw from '../components/ConfirmWithdraw'
import ConfirmWithdrawComplete from '../components/ConfirmWithdrawComplete'
import SignForeign from '../components/SignForeign'
import WaitMappingConfirm from '../components/WaitMappingConfirm'
import RegisterWallet from '../components/RegisterWallet'

export default {
  components: {
    SectionHeader,
    BalancePanel,
    DepositModal,
    ConfirmModal,
    CompleteModal,
    WithdrawModal,
    TransferStatus,
    ConfirmWithdraw,
    ConfirmWithdrawComplete,
    SignForeign,
    WaitMappingConfirm,
    RegisterWallet
  },
  data() {
    return {
      I_WANT_TO: this.$route.query['iWantTo'],
      TOKEN_IMAGE_URL: '',
      weiAmount: null,
      depositReceipt: null,
      withdrawReceipt: null,
      showDepoistModal: false,
      showConfirmModal: false,
      showCompleteModal: false,
      showWithdrawModal: false,
      showTransferStatus: false,
      showConfirmWithdraw: false,
      showConfirmWithdrawComplete: false,
      showSignForeign: false,
      showWaitMappingConfirm: false,
      showRegisterWallet: false,
      user: {},
      tickers: [],
      balances: [],
      ticker: null,
      isOpen: false,
      live: false,
      ready: false,
      hasAccountMapping: null,
      ethereumProvider: null,
      ethereumToken: null,
      ethereumGateway: null,
      ethereumAddress: null,
      ethereumBalance: 0,
      loomClient: null,
      loomProvider: null,
      loomToken: null,
      loomGateway: null,
      loomWalletAddr: null,
      loomBalance: 0,
      busy: false,
      hasContractMapping: false,
      eth2loomGatewayAddress: null,
      gas: 350000,
      loomBlockexplorerUrl: null,
      ethBlockexplorerUrl: null,
      amount: '0',
      withdrawalHash: null,
      depositHash: null,
      iteration: 0,
      coinMultiplier: 0
    }
  },

  async mounted() {
    await this.initWeb3()
    await this.loadWebData()
    await this.initLoom()
    if (!this.user) {
      return 0
    }
    if (!this.loomWalletAddr) {
      return 0
    }
    await this.initContracts()
    //await this.mapAddresses()
    await this.addEventListeners()
    await this.updateBalances()
    this.ready = true
    //await this.checkContractMapping()
  },

  methods: {
    toggle: function() {
      this.isOpen = !this.isOpen
    },
    showDeposit: function() {
      this.showDepoistModal = true
    },
    onDeposit: function(amount) {
      this.showDepoistModal = false
      this.amount = amount
      if (this.amount) {
        this.deposit()
      }
    },
    async onConfirm() {
      this.showConfirmModal = false
      this.depositReceipt = await this.ethereumGateway.contract.depositERC20(
        this.weiAmount,
        this.ETHEREUM_CONTRACT_ADDR,
        { gasLimit: this.gas }
      )
      this.putTxHash(this.depositReceipt.hash, 'deposit')
      // alert('Please wait up to 30min for deposit to complete.') //Modal 3 -- While this.busy add status bar here after clicking ok: $TICKER Deposit Awaiting Confirmation
      this.showCompleteModal = true
    },
    onComplete: function() {
      this.showCompleteModal = false
      this.depositHash = this.depositReceipt.hash
    },
    showWithdraw: function() {
      this.showWithdrawModal = true
    },
    onWithdraw: function(amount) {
      this.showWithdrawModal = false
      this.amount = amount
      if (this.amount) {
        this.withdrawERC20()
      }
    },
    async onConfirmWithdraw() {
      this.showConfirmWithdraw = false
      await this._withdrawCoinsFromMainNetGateway(this.withdrawReceipt)
    },
    onWithdrawComplete: function() {
      this.showConfirmWithdrawComplete = false
      this.withdrawalHash = this.withdrawReceipt.hash
    },
    async onSignForeign() {
      this.showSignForeign = false
      const signer = getMetamaskSigner(this.web3js.currentProvider)
      const plasmaEthSigner = new EthersSigner(signer)
      const hash = soliditySha3(
        {
          type: 'address',
          value: this.user.dappchainAddress.toLowerCase().slice(2)
        },
        {
          type: 'address',
          value: this.ethereumAddress.slice(2)
        }
      )
      //console.log(this.ethereumAddress + ' <-- Ethereum Address')
      //console.log(this.user.dappchainAddress + ' <-- Loom Address')
      //console.log(hash + ' <-- hash produced from addresses')
      //console.log('PlasmaEthSigner containing the current Ethereum address:')
      //console.log(plasmaEthSigner)
      const foreignAccountSig = await plasmaEthSigner.signAsync(hash)
      const signatureString = foreignAccountSig.toString('hex')
      //sendHexSig(signatureString)
      console.log('Hex Signature passed to backend')
      //console.log(signatureString)
      await this.sendHexSig(signatureString)
    },
    onMappingConfirm: function() {
      this.showWaitMappingConfirm = false
      window.location.reload(true)
    },
    onRegisterWallet: function() {
      this.showRegisterWallet = false
      window.location.reload(true)
    },
    async putTxHash(hash, method) {
      var webDataUrl =
        'https://4mjt8xbsni.execute-api.us-east-1.amazonaws.com/prod?pageType=putTxHash&txHash=' +
        hash +
        '&method=' +
        method
      axios
        .get(webDataUrl)
        .then(response => {
          if (response.data.toLowerCase() == 'Txn Hash Saved 1 None') {
            //refresh
            console.log('Tx Hash Saved')
          }
        })
        .catch(e => {
          throw new Error(e)
        })
    },
    async confirmLocalMapping() {
      const sleep = milliseconds => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
      }
      const delayAndTryAgain = async () => {
        await sleep(30000)
        //do stuff
        if (this.iteration <= 10) {
          this.iteration++
          this.confirmLocalMapping()
        }
      }
      var webDataUrl =
        'https://4mjt8xbsni.execute-api.us-east-1.amazonaws.com/prod?pageType=pingForLocalMappingConfirmation&ethAddress=' +
        this.ethereumAddress
      axios
        .get(webDataUrl)
        .then(response => {
          if (response.data.toLowerCase() == 'address mapping confirmed!') {
            //refresh
            console.log(response.data)
            this.busy = false
          }
        })
        .catch(e => {
          throw new Error(e)
        })
      //wait and try again
      console.log('Waiting For Mapping Confirmation ' + this.iteration)
      delayAndTryAgain()
    },
    async sendHexSig(sig) {
      var webDataUrl =
        'https://4mjt8xbsni.execute-api.us-east-1.amazonaws.com/prod?pageType=localAccountSigner&u=' +
        this.user.platformHandle +
        '&s=' +
        sig
      axios
        .get(webDataUrl)
        .then(response => {
          this.showWaitMappingConfirm = true
          console.log(response.data)
          this.confirmLocalMapping()
        })
        .catch(e => {
          throw new Error(e)
        })
    },
    async signForeign() {
      this.busy = true
      this.showSignForeign = true //Modal 7
    },
    async manageAccountMapping() {
      const client = this.loomClient
      client.on('error', console.error)
      const callerAddress = await this._setupSigner(
        client,
        this.web3js.currentProvider
      )
      let loomProvider = await this._createLoomProvider(client, callerAddress)
      this.web3Loom = new Web3(loomProvider)
      this.loomProvider = new ethers.providers.Web3Provider(
        this.web3Loom.currentProvider
      )
      const signer = getMetamaskSigner(this.web3js.currentProvider)
      const ethAddress = await signer.getAddress()
      let accountMapping = await this._loadMapping(callerAddress, client)
      if (accountMapping) {
        this.loomWalletAddr = accountMapping.loom.toString().split(':')[1]
        this.hasAccountMapping = true
      } else {
        //sign new mapping and send to server
        await this.signForeign()
      }
    },
    async _loadMapping(ethereumAccount, client) {
      const mapper = await AddressMapper.createAsync(client, ethereumAccount)
      let accountMapping = { ethereum: null, plasma: null }
      try {
        const mapping = await mapper.getMappingAsync(ethereumAccount)
        accountMapping = {
          ethereum: mapping.from,
          loom: mapping.to
        }
      } catch (error) {
        if (!error.data.toString().includes('failed to map address')) {
          console.error(error)
        }
        accountMapping = null
      } finally {
        mapper.removeAllListeners()
      }
      return accountMapping
    },
    async _createLoomProvider(client, callerAddress) {
      const dummyKey = CryptoUtils.generatePrivateKey()
      const publicKey = CryptoUtils.publicKeyFromPrivateKey(dummyKey)
      const dummyAccount = LocalAddress.fromPublicKey(publicKey).toString()
      const loomProvider = new LoomProvider(
        client,
        dummyKey,
        () => client.txMiddleware
      )
      loomProvider.setMiddlewaresForAddress(
        callerAddress.local.toString(),
        client.txMiddleware
      )
      loomProvider.callerChainId = callerAddress.chainId
      // remove dummy account
      loomProvider.accounts.delete(dummyAccount)
      loomProvider._accountMiddlewares.delete(dummyAccount)
      return loomProvider
    },
    async _setupSigner(plasmaClient, provider) {
      const signer = getMetamaskSigner(provider)
      const ethAddress = await signer.getAddress()
      const callerAddress = new Address(
        'eth',
        LocalAddress.fromHexString(ethAddress)
      )
      plasmaClient.txMiddleware = [
        new NonceTxMiddleware(callerAddress, plasmaClient),
        new SignedEthTxMiddleware(signer)
      ]
      return callerAddress
    },
    async manageAccountMappingOld() {
      const signer = getMetamaskSigner(this.web3js.currentProvider)
      const ethereumAddress = Address.fromString(`eth:${this.ethereumAddress}`)
      const plasmaEthSigner = new EthersSigner(signer)
      const privateKey = CryptoUtils.generatePrivateKey()
      const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
      const loomWalletAddr = new Address(
        this.loomClient.chainId,
        LocalAddress.fromPublicKey(publicKey)
      )
      this.hasAccountMapping = await this.checkAccountMapping(
        ethereumAddress,
        loomWalletAddr
      )
      this.loomClient.txMiddleware = createDefaultTxMiddleware(
        this.loomClient,
        CryptoUtils.B64ToUint8Array(privateKey)
      )
      const provider = new LoomProvider(this.loomClient, privateKey)
      const web3Provider = new Web3(provider)
      this.loomProvider = new ethers.providers.Web3Provider(
        web3Provider.currentProvider
      )
      if (this.hasAccountMapping) {
        return true
      }
      alert(
        'Step 1: Sign the next transaction to link your wallet to Cryptoraves'
      )
      try {
        const mapper = await AddressMapper.createAsync(
          this.loomClient,
          loomWalletAddr
        )
        await mapper.addIdentityMappingAsync(
          ethereumAddress,
          loomWalletAddr,
          plasmaEthSigner
        )
        this.loomClient.disconnect()
      } catch (e) {
        if (e.message.includes('Identity mapping already exists.')) {
        } else {
          console.error(e)
        }
        this.loomClient.disconnect()
        return false
      }
    },
    async checkContractMapping() {
      const ownerLoomAddr = Address.fromString(
        `${this.loomClient.chainId}:${this.loomWalletAddr}`
      )
      const gatewayContract = await Contracts.TransferGateway.createAsync(
        this.loomClient,
        ownerLoomAddr
      )
      const foreignContract = Address.fromString(
        `eth:${this.ETHEREUM_CONTRACT_ADDR}`
      )
      var res = await gatewayContract.getContractMappingAsync(foreignContract)
      if (res) {
        alert(
          'Mapped! Ethereum Contract: ' +
            this.ETHEREUM_CONTRACT_ADDR +
            ' is mapped to ' +
            res.to.toString() +
            ' with status pending: ' +
            res.pending
        )
      } else {
        alert(
          'Ethereum Contract: ' +
            this.ETHEREUM_CONTRACT_ADDR +
            ' is not mapped.'
        )
      }
    },
    async checkAccountMappingButton() {
      const ethereumAddress = Address.fromString(`eth:${this.ethereumAddress}`)
      const loomWalletAddr = new Address(
        this.loomClient.chainId,
        this.loomWalletAddr
      )
      await this.checkAccountMapping(ethereumAddress, loomWalletAddr, true)
    },
    async checkAccountMapping(ethAddr, loomAddr, msg = false) {
      try {
        const mapper = await AddressMapper.createAsync(
          this.loomClient,
          loomAddr
        )
        var hasAccountMapping = await mapper.hasMappingAsync(ethAddr)
        if (hasAccountMapping) {
          var mappings = await mapper.getMappingAsync(ethAddr)
          if (msg) {
            alert(
              'Loom address: ' +
                this.loomWalletAddr +
                ' is mapped to Eth Address: ' +
                mappings.from.toString().split(':')[1]
            )
          } else {
            this.loomWalletAddr = mappings.to.toString().split(':')[1]
          }
        }
        return this.loomWalletAddr
      } catch (e) {
        console.error(e)
      }
      return false
    },
    async initWeb3() {
      /*if (this.$store.state.LIVE) {
        if (window.ethereum.networkVersion != 1) {
          alert('Please switch Metamask to Mainnet')
        }
      } else {
        if (window.ethereum.networkVersion != 4) {
          alert('Please switch Metamask to Rinkeby Network')
        }
      }*/
      let web3js
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        web3js = new Web3(ethereum)
        await ethereum.enable()
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
        web3js = new Web3(window.web3.currentProvider)
      } else {
        throw new Error('Please enable Metamask and refresh.')
      }

      if (web3js) {
        this.web3js = web3js
        this.ethereumProvider = new ethers.providers.Web3Provider(
          web3js.currentProvider
        )
        this.ethereumAddress = (await this.ethereumProvider.listAccounts())[0]

        window.ethereum.on('accountsChanged', function(accounts) {
          location.reload()
        })
      }
    },

    async initLoom() {
      if (window.ethereum.networkVersion == 1) {
        this.live = true
        var client = new Client(
          'default',
          'wss://plasma.dappchains.com/websocket',
          'wss://plasma.dappchains.com/queryws'
        )
      } else {
        this.live = false
        var client = new Client(
          'extdev-plasma-us1',
          'wss://extdev-plasma-us1.dappchains.com/websocket',
          'wss://extdev-plasma-us1.dappchains.com/queryws'
        )
      }
      this.loomClient = client

      await this.manageAccountMapping()
    },
    async initContracts() {
      const tokenABI = [
        'function balanceOf(address who) external view returns (uint256)',
        'function approve(address spender, uint256 value) external returns (bool) @50000',
        'function transfer(address to, uint256 value) external returns (bool) @30000',
        'event Transfer(address indexed from, address indexed to, uint256 value)'
      ]
      try {
        this.ethereumToken = new ethers.Contract(
          this.ETHEREUM_CONTRACT_ADDR,
          tokenABI,
          this.ethereumProvider.getSigner()
        )
      } catch (e) {
        window.location.reload(true)
      }
      this.loomToken = new ethers.Contract(
        this.LOOM_CONTRACT_ADDR,
        tokenABI,
        this.loomProvider.getSigner()
      )
      this.ethereumGateway = await this.getEthereumGatewayContract()
      const loomAddress = Address.fromString(
        `${this.loomClient.chainId}:${this.loomWalletAddr}`
      )
      this.loomGateway = await Contracts.TransferGateway.createAsync(
        this.loomClient,
        Address.fromString('eth:' + this.ethereumAddress)
      )
    },
    async transportIndicator(verified) {
      var webDataUrl =
        'https://4mjt8xbsni.execute-api.us-east-1.amazonaws.com/prod?pageType=depWithdrawindicator&p=' +
        this.user.platformHandle +
        '&t=' +
        this.user.ticker +
        '&v=' +
        verified
      axios
        .get(webDataUrl)
        .then(response => {
          console.log(response.data)
        })
        .catch(e => {
          throw new Error(e)
        })
    },
    async loadWebData() {
      var webDataUrl =
        'https://4mjt8xbsni.execute-api.us-east-1.amazonaws.com/prod?pageType=getweb3PortalData&ethAddress=' +
        this.ethereumAddress
      axios
        .get(webDataUrl)
        .then(response => {
          let res = response.data
          // JSON responses are automatically parsed.
          this.user = res.user
          if (!this.user) {
            this.showRegisterWallet = true
            return 0
          }
          this.balances = res.balances
          this.tickers = res.tickers
          if (this.tickers) {
            this.ticker = this.tickers[0]
            this.tickerSelect(this.ticker)
          }
        })
        .catch(e => {
          throw new Error(e)
        })
    },
    async tickerSelect(option) {
      event.stopPropagation()
      this.isOpen = false
      this.ticker = option
      for (var i = 0; i < this.tickers.length; i++) {
        if (this.balances[i].ticker == this.ticker) {
          this.ETHEREUM_CONTRACT_ADDR = this.balances[i].ethContractAddress
          this.ETHEREUM_CONTRACT_OWNER_ADDR = this.balances[
            i
          ].ethContractOwnerAddress
          this.LOOM_CONTRACT_ADDR = this.balances[i].loomContractAddress
          this.NUM_DECIMALS = this.balances[i].decimals
          this.TOTAL_SUPPLY = this.balances[i].totalSupply
          this.TOKEN_IMAGE_URL = this.balances[i].tokenImgUrl
          this.coinMultiplier = new BN(10).pow(new BN(this.NUM_DECIMALS))
          if (this.ready) {
            await this.initContracts()
            await this.updateBalances()
          }
        }
      }
    },
    async goBlockExplorer(link) {
      window.open(link)
    },
    // Returns a new wrapper for the Ethereum Gateway contract
    async getEthereumGatewayContract() {
      const networkId = await this.web3js.eth.net.getId()
      let version
      switch (networkId) {
        case 1: // Ethereum Mainnet
          this.eth2loomGatewayAddress =
            '0xe080079ac12521d57573f39543e1725ea3e16dcc'
          this.ethBlockexplorerUrl =
            'https://etherscan.io/address/' + this.ethereumAddress
          this.loomBlockexplorerUrl =
            'https://basechain-blockexplorer.dappchains.com/address/' +
            this.loomWalletAddr +
            '/transactions'
          version = 1
          break

        case 4: // Rinkeby
          this.eth2loomGatewayAddress =
            '0x9c67fD4eAF0497f9820A3FBf782f81D6b6dC4Baa'
          this.ethBlockexplorerUrl =
            'https://rinkeby.etherscan.io/address/' + this.ethereumAddress
          this.loomBlockexplorerUrl =
            'https://extdev-blockexplorer.dappchains.com/address/' +
            this.loomWalletAddr +
            '/transactions'
          version = 2
          break

        default:
          throw new Error(
            'Ethereum Gateway is not deployed on network ' + networkId
          )
      }
      /*
      * If you're running `loom-js` in Node.js, change the following line to something like:
      * const signer = new OfflineWeb3Signer(web3, account)
      */
      const ethereumGatewayContract = await createEthereumGatewayAsync(
        version,
        this.eth2loomGatewayAddress, // In this example, we're instantiating the Ethereum transfer gateway
        this.ethereumProvider.getSigner()
      )
      return ethereumGatewayContract
    },
    async addEventListeners() {
      let ethereumReceiveFilter = this.ethereumToken.filters.Transfer(
        null,
        this.ethereumAddress
      )
      this.ethereumToken.on(ethereumReceiveFilter, (from, to, value) => {
        this.updateBalances()
        if (this.withdrawalHash) {
          this.busy = false
          this.withdrawalHash = null
        }
      })

      let ethereumSendFilter = this.ethereumToken.filters.Transfer(
        this.ethereumAddress,
        null
      )
      this.ethereumToken.on(ethereumSendFilter, (from, to, value) => {
        this.updateBalances()
      })

      let loomReceiveFilter = this.loomToken.filters.Transfer(
        null,
        this.loomWalletAddr
      )
      this.loomToken.on(loomReceiveFilter, (from, to, value) => {
        this.updateBalances()
        console.log('From: ' + from + ' to: ' + to + ' val: ' + value)
        console.log(loomReceiveFilter)
        if (this.depositHash) {
          this.busy = false
          this.depositHash = null
        }
      })
      let loomSendFilter = this.loomToken.filters.Transfer(
        this.loomWalletAddr,
        null
      )
      this.loomToken.on(loomSendFilter, (from, to, value) => {
        this.updateBalances()
      })
    },

    async updateBalances() {
      const ethereumBalance = await this.ethereumToken.balanceOf(
        this.ethereumAddress,
        { from: this.ethereumAddress }
      )
      this.ethereumBalance = Number(
        ethers.utils.formatUnits(ethereumBalance.toString(), this.NUM_DECIMALS)
      )
      const loomBalance = await this.loomToken.balanceOf(this.loomWalletAddr)
      this.loomBalance = Number(
        ethers.utils.formatUnits(loomBalance.toString(), this.NUM_DECIMALS)
      )
    },
    async deposit() {
      this.busy = true
      this.weiAmount = ethers.utils.parseUnits(this.amount, this.NUM_DECIMALS)
      var res = await this.ethereumToken.approve(
        this.ethereumGateway.contract.address,
        this.weiAmount.toString(),
        { gasLimit: this.gas }
      )
      this.showConfirmModal = true
    },
    async resumeWithdrawal() {
      // const receipt = await this._getWithdrawalReceipt()
      // if (receipt !== undefined) {
      //   await this._withdrawCoinsFromMainNetGateway(receipt)
      // }
      try {
        this.withdrawReceipt = await this._getWithdrawalReceipt()
        if (this.withdrawReceipt !== undefined) {
          await this._withdrawCoinsFromMainNetGateway(this.withdrawReceipt)
        }
      } catch (e) {
        console.log('-- Withdrawal Timeout --')
      }
    },
    async withdrawERC20() {
      this.busy = true
      const amount = this.amount
      //this._approveFee()
      console.log('Transferring to Loom Gateway.')
      const res = await this._transferCoinsToLoomGateway(amount)
      if (res == 'Resume Withdrawal') {
        return false
      }
      this.showTransferStatus = false
      console.log('Getting withdrawal receipt')
      try {
        this.withdrawReceipt = await this._getWithdrawalReceipt()
      } catch (e) {
        console.log('-- Delayed Withdrawal? -- ')
        console.log(e)
      }
      // alert('Now confirm the next transaction to get your tokens.') //Modal 6
      this.showConfirmWithdraw = true
      console.log('Withdrawing from MainNet Gateway')
      this.busy = false
      // await this._withdrawCoinsFromMainNetGateway(receipt)
      // this.withdrawalHash = receipt.hash
    },
    async _approveFee() {
      const EthCoin = Contracts.EthCoin
      this.ethCoin = await EthCoin.createAsync(
        this.loomClient,
        Address.fromString('eth:' + this.ethereumAddress)
      )
      await this.ethCoin.approveAsync(
        this.loomGateway.address,
        new BN(this.gas)
      )
    },
    async _withdrawCoinsFromMainNetGateway(receipt) {
      const gatewayContract = this.ethereumGateway
      const tx = await gatewayContract.withdrawAsync(receipt, {
        gasLimit: this.gas
      })
      console.log(`Tokens withdrawn from MainNet Gateway.`)
      console.log(`Ethereum tx hash: ${tx.hash}`)
      // alert(
      //   'Token withdraw request processed. Please allow up to 30 min for tokens to arrive in your account.' //While this.busy status bar here after clcking ok: $TICKER Withdraw Awaiting Confirmation
      // )
      this.showConfirmWithdrawComplete = true
    },
    async _getWithdrawalReceipt() {
      const userLocalAddr = Address.fromString(
        this.loomClient.chainId + ':' + this.loomWalletAddr
      )
      const gatewayContract = this.loomGateway
      const receipt = await gatewayContract.withdrawalReceiptAsync(
        userLocalAddr
      )
      return receipt
    },
    async _transferCoinsToLoomGateway(amount) {
      const amountInWei = ethers.utils
        .parseUnits(amount, this.NUM_DECIMALS)
        .toString()

      const ethAddress = this.ethereumAddress
      const ownerMainnetAddr = Address.fromString('eth:' + ethAddress)
      var gatewayContract = this.loomGateway
      const dAppChainGatewayAddr = this.web3Loom.utils.toChecksumAddress(
        this.loomGateway.address.local.toString()
      )

      console.log('Approving Loom Transfer Gateway to take the coins.')
      var res = await this.loomToken.approve(dAppChainGatewayAddr, amountInWei)
      this.withdrawalHash = res.hash
      const timeout = 60 * 5000
      const loomCoinContractAddress = this.LOOM_CONTRACT_ADDR
      const tokenAddress = Address.fromString(
        this.loomClient.chainId + ':' + loomCoinContractAddress
      )
      const mainNetContractAddress = this.ETHEREUM_CONTRACT_ADDR
      const receiveSignedWithdrawalEvent = new Promise((resolve, reject) => {
        let timer = setTimeout(
          () =>
            reject(
              new Error('Timeout while waiting for withdrawal to be signed')
            ),
          timeout
        )
        const listener = event => {
          const tokenEthAddress = Address.fromString(
            'eth:' + mainNetContractAddress
          )
          if (
            event.tokenContract.toString() === tokenEthAddress.toString() &&
            event.tokenOwner.toString() === ownerMainnetAddr.toString()
          ) {
            clearTimeout(timer)
            timer = null
            gatewayContract.removeAllListeners(
              Contracts.TransferGateway.EVENT_TOKEN_WITHDRAWAL
            )
            console.log(
              'Oracle signed tx ',
              CryptoUtils.bytesToHexAddr(event.sig)
            )
            resolve(event)
          }
        }
        gatewayContract.on(
          Contracts.TransferGateway.EVENT_TOKEN_WITHDRAWAL,
          listener
        )
      })
      try {
        await gatewayContract.withdrawERC20Async(
          new BN(amountInWei, 10),
          tokenAddress,
          ownerMainnetAddr
        )
      } catch (e) {
        console.log('-- Pending Withdrawal Already Exists --')
        alert(
          'The blockchain says hold up.  Please sign the next transaction to unclog it and wait 30 minutes before the next withdraw attempt.'
        )
        this.busy = false
        await this.resumeWithdrawal()
        return 'Resume Withdrawal'
      }
      // Note for Bryan : We got res1 = Undefined Value here//
      // alert('Please wait a few minutes for the next prompt.') //Modal 5 -- show a status bar while waiting
      // alert(this.busy)
      this.showTransferStatus = true
      console.log('Logging withdrawal.')
      await this.putTxHash(this.withdrawalHash, 'withdraw')
      this.busy = true
      await receiveSignedWithdrawalEvent
    }
  }
}
</script>
<style scoped>
/* Banner */
.user-title {
  position: absolute;
  margin-top: 20px;
  right: 10px;
  text-align: center;
}
.user-title-1 {
  font-size: 20px;
  font-family: 'Montserrat';
  font-style: italic;
  font-weight: bold;
  color: rgb(0, 38, 101);
}
.user-title-link {
  font-size: 16px;
  color: rgb(0, 38, 101);
  font-family: 'Montserrat';
  text-align: center;
  line-height: 1.2em;
  margin: 20px auto auto auto;
}
/* Token List */
.token-list-title {
  margin-top: 40px;
  margin-bottom: 10px;
  font-size: 2rem;
  font-family: 'Roboto Condensed';
  color: rgb(0, 38, 101);
  line-height: 1.6;
  text-align: center;
}
.token-list {
  position: relative;
  margin: auto;
  z-index: 2;
  display: block;
  width: 200px;
  height: 40px;
  padding: 0 20px;
  background: #0085a9;
  border-radius: 10px;
  font: 1.25rem/40px 'Ubuntu', Helvetica, Arial, sans-serif;
  font-weight: bold;
  color: white;
  cursor: pointer;
}
.token-list:after {
  opacity: 0.5;
  float: right;
  content: '▼';
}
.token-list:hover:after {
  opacity: 1;
}
.token-options {
  position: absolute;
  z-index: 1;
  margin-top: 3px;
  left: 0;
  width: 200px;
  background: #0085a9;
  color: white;
  border-radius: 10px;
}
.token-option {
  cursor: pointer;
  padding: 5px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.25);
  font: 1.2rem 'Vollkorn', Georgia, Times, serif;
}

/* Hover state */
.token-option:hover {
  opacity: 0.7;
}

/* Reset last child for a nice layout */
.token-option:last-child {
  border-bottom: none;
}

.user-transaction-section {
  margin-top: 100px;
}
.portfolio-user {
  margin-top: 100px;
}
.portfolio-userwelcome {
  margin-bottom: 10px;
  font-size: 3rem;
  font-family: 'Roboto Condensed';
  color: rgb(0, 38, 101);
  font-weight: bold;
  line-height: 1.6;
  text-align: center;
}
.portfolio-userimg {
  background: white;
  display: flex;
  margin: auto;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 1px solid lightgrey;
  animation: avatar-from-effect 2s infinite;
  transition: all 0.5s ease-out;
}
@keyframes avatar-from-effect {
  0% {
    box-shadow: 0 0 0 0px rgb(43, 96, 222, 0.8);
  }
  100% {
    box-shadow: 0 0 0 15px rgb(43, 96, 222, 0);
  }
}

.portfolio-userimg img {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  margin: auto;
}

.portfolio-userimg img:hover {
  cursor: pointer;
  opacity: 0.7;
}

.address-link:hover {
  cursor: pointer;
  text-decoration: underline;
}
.user-transaction-section-buttons {
  font-family: 'Roboto Condensed';
  text-align: center;
  display: flex;
  flex-direction: column;
}

.btn {
  margin: 30px auto 30px auto;
  width: 150px;
  font-size: 15px;
  font-weight: bold;
}
.btn-arrow-right,
.btn-arrow-left {
  position: relative;
  padding-left: 18px;
  padding-right: 18px;
}
.btn-arrow-right {
  padding-left: 36px;
}
.btn-arrow-left {
  padding-right: 36px;
}
.btn-arrow-right:before,
.btn-arrow-right:after,
.btn-arrow-left:before,
.btn-arrow-left:after {
  /* make two squares (before and after), looking similar to the button */
  content: '';
  position: absolute;
  top: 5px; /* move it down because of rounded corners */
  width: 22px; /* same as height */
  height: 22px; /* button_outer_height / sqrt(2) */
  background: inherit; /* use parent background */
  border: inherit; /* use parent border */
  border-left-color: transparent; /* hide left border */
  border-bottom-color: transparent; /* hide bottom border */
  border-radius: 0px 4px 0px 0px; /* round arrow corner, the shorthand property doesn't accept "inherit" so it is set to 4px */
  -webkit-border-radius: 0px 4px 0px 0px;
  -moz-border-radius: 0px 4px 0px 0px;
}
.btn-arrow-right:before,
.btn-arrow-right:after {
  transform: rotate(
    45deg
  ); /* rotate right arrow squares 45 deg to point right */
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -o-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
}
.btn-arrow-left:before,
.btn-arrow-left:after {
  transform: rotate(
    225deg
  ); /* rotate left arrow squares 225 deg to point left */
  -webkit-transform: rotate(225deg);
  -moz-transform: rotate(225deg);
  -o-transform: rotate(225deg);
  -ms-transform: rotate(225deg);
}
.btn-arrow-right:before,
.btn-arrow-left:before {
  /* align the "before" square to the left */
  left: -11px;
}
.btn-arrow-right:after,
.btn-arrow-left:after {
  /* align the "after" square to the right */
  right: -11px;
}
.btn-arrow-right:after,
.btn-arrow-left:before {
  /* bring arrow pointers to front */
  z-index: 1;
}
.btn-arrow-right:before,
.btn-arrow-left:after {
  /* hide arrow tails background */
  background-color: white;
}
.instruction-link {
  cursor: pointer;
  text-decoration: underline;
  font-size: 16px;
  color: rgb(0, 38, 101);
  font-family: 'Montserrat';
  text-align: center;
  line-height: 1.2em;
  margin: 50px auto 20px auto;
}
.register-wallet {
  height: calc(100vh - 225px);
}
@media only screen and (max-width: 1263px) {
}
</style>
