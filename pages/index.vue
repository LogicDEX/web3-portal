<template lang="html">
  <v-container fluid>
    <span 
      class="display-2"
    >
      Welcome {{ user.platformHandle }}
    </span>
    <div class="portfolio-userimg">
      <img
        :src="user.imgUrl"
        :title="user.platformHandle"
      >
    </div>
    <span 
      class="display-2"
    >
      Please Select Token for Import/Export:
    </span>
    <v-select
      id="tickerSelector"
      v-model="ticker"
      :items="tickers"
      label="Selected Ticker:"
      @change="tickerSelect"
    >Ticker
    </v-select>
    <div class="portfolio-userimg">
      <img
        :src="TOKEN_IMAGE_URL"
        :title="ticker"
      >
    </div>
    <v-layout
      row
      pb-5
    >
      <v-flex
        v-if="hasAccountMapping"
      >
        <v-card>
          <v-card-title>
            <span 
              v-if="live" 
              class="display-1"
            >
              Your Cryptoraves Balance {{ ticker }}
            </span>
            <span 
              v-else 
              class="display-1"
            >
              Your Cryptoraves Balance {{ ticker }} - Extdev
            </span>
            <v-card-text 
              class="address-link subheading"
              title="Link to Loomnetwork's Block Explorer"
              @click="goBlockExplorer(loomBlockexplorerUrl)">{{ loomWalletAddr }}</v-card-text>
          </v-card-title>
          <v-card-text class="display-2">{{ loomBalance }}</v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs6>
        <v-card>
          <v-card-title>
            <span 
              v-if="live" 
              class="display-1"
            >
              Your Wallet Balance {{ ticker }}
            </span>
            <span 
              v-else 
              class="display-1"
            >
              Your Wallet Balance {{ ticker }} - Rinkeby
            </span>
            <v-card-text 
              class="address-link subheading"
              title="Link to Etherscan.io"
              @click="goBlockExplorer(ethBlockexplorerUrl)">{{ ethereumAddress }}</v-card-text>
          </v-card-title>
          <v-card-text class="display-2">{{ ethereumBalance }}</v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex>
        <v-btn
          :disabled="busy"
          @click="checkAccountMappingButton"
        >
          Check Account Mapping
        </v-btn>
        <v-btn
          :disabled="busy"
          @click="checkContractMapping"
        >
          Check Contract Mapping
        </v-btn>
        <v-btn
          v-if="hasAccountMapping"
          :disabled="busy"
          @click="deposit"
        >
          Deposit To Cryptoraves
        </v-btn>
        <v-btn
          v-if="hasAccountMapping"
          :disabled="busy"
          @click="withdrawERC20"
        >
          Withdraw To Wallet
        </v-btn>
        <v-btn
          v-if="hasAccountMapping"
          :disabled="busy"
          @click="resumeWithdrawal"
        >
          Resume Withdrawal
        </v-btn>
      </v-flex>
      
    </v-layout>
  </v-container>
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
  getMetamaskSigner
} from 'loom-js'
import { ethers } from 'ethers'
import BN from 'bn.js'
import { AddressMapper } from 'loom-js/dist/contracts'

export default {
  data() {
    return {
      I_WANT_TO: this.$route.query['iWantTo'],
      TOKEN_IMAGE_URL: '',
      user: {},
      tickers: [],
      balances: [],
      ticker: null,
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
      ethBlockexplorerUrl: null
    }
  },

  async mounted() {
    await this.initWeb3()
    await this.loadWebData()
    await this.initLoom()
    await this.initContracts()
    //await this.mapAddresses()
    await this.addEventListeners()
    await this.updateBalances()
    this.ready = true
    //await this.checkContractMapping()
  },

  methods: {
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
        //sign new mapping
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
        console.error(error)
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
        privateKey
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
      this.ethereumToken = new ethers.Contract(
        this.ETHEREUM_CONTRACT_ADDR,
        tokenABI,
        this.ethereumProvider.getSigner()
      )
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
          this.balances = res.balances
          this.tickers = res.tickers
          if (this.tickers) {
            this.ticker = this.tickers[0]
            this.tickerSelect()
          }
        })
        .catch(e => {
          throw new Error(e)
        })
    },
    async tickerSelect() {
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
          if (this.ready) {
            await this.updateBalances()
          }
        }
      }
    },
    async goBlockExplorer(link) {
      window.open(link)
    },
    async foreignContractSigner() {
      const hash = soliditySha3(
        {
          type: 'address',
          value: this.ETHEREUM_CONTRACT_ADDR.slice(2)
        },
        {
          type: 'address',
          value: this.LOOM_CONTRACT_ADDR.slice(2)
        }
      )
      var signer = new EthersSigner(this.ethereumProvider.getSigner())
      const foreignContractCreatorSig = await signer.signAsync(hash)
      //console.log(foreignContractCreatorSig)
      const signatureString = foreignContractCreatorSig.toString('hex')
      //provide the partner signature string
      //console.log(signatureString)

      axios
        .get(
          'https://4mjt8xbsni.execute-api.us-east-1.amazonaws.com/prod?pageType=web3portal&hash=' +
            signatureString +
            '&ethContractOwnerAddress=' +
            this.ETHEREUM_CONTRACT_OWNER_ADDR
        )
        .then(response => {
          // JSON responses are automatically parsed.
          let res = response.data
          if (res != 'Signature accepted. Cryptoraves will now process.') {
            alert('Issue with signature: ' + res)
          } else {
            alert(res)
          }
          console.log(res)
        })
        .catch(e => {
          console.log(e)
        })
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
        {
          from: this.ethereumAddress
        }
      )
      this.ethereumBalance = ethers.utils.formatUnits(
        ethereumBalance.toString(),
        this.NUM_DECIMALS
      )
      const loomBalance = await this.loomToken.balanceOf(this.loomWalletAddr)
      this.loomBalance = ethers.utils.formatUnits(
        loomBalance.toString(),
        this.NUM_DECIMALS
      )
    },
    async deposit() {
      this.busy = true

      const weiAmount = ethers.utils.parseUnits(
        //this.ethereumBalance,
        '1000000',
        this.NUM_DECIMALS
      )
      var res = await this.ethereumToken.approve(
        this.ethereumGateway.contract.address,
        weiAmount.toString(),
        { gasLimit: this.gas }
      )
      res = await this.ethereumGateway.contract.depositERC20(
        weiAmount,
        this.ETHEREUM_CONTRACT_ADDR,
        { gasLimit: this.gas }
      )
      this.busy = false
    },
    async resumeWithdrawal() {
      const receipt = await this._getWithdrawalReceipt()
      if (receipt !== undefined) {
        await this._withdrawCoinsFromMainNetGateway(receipt)
      }
    },
    async withdrawERC20() {
      this.busy = true
      const amount = '10000'
      //this._approveFee()
      console.log('Transferring to Loom Gateway.')
      await this._transferCoinsToLoomGateway(amount)
      console.log('Getting withdrawal receipt')
      const receipt = await this._getWithdrawalReceipt()
      console.log('Withdrawing from MainNet Gateway')
      await this._withdrawCoinsFromMainNetGateway(receipt)

      this.busy = false
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
      alert(
        'Token withdraw request processed. Please allow up to 15 min for tokens to arrive in your account.'
      )
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
      await this.loomToken.approve(dAppChainGatewayAddr, amountInWei)
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
      await gatewayContract.withdrawERC20Async(
        new BN(amountInWei, 10),
        tokenAddress,
        ownerMainnetAddr
      )
      await receiveSignedWithdrawalEvent
    }
  }
}
</script>
<style scoped>
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
.portfolio-userimg img {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  margin: auto;
}
.address-link:hover {
  cursor: pointer;
  text-decoration: underline;
}
</style>
