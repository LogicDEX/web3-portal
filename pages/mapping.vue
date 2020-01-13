<template lang="html">
  <v-container
    v-if="ready"
    grid-list-md
    text-xs-center
  >
    <div 
      class="display-2"
    >
      Web3 Portal
      
    </div>
    <v-layout
      row
      pb-5
    >
      <v-flex> <!-- xs6> -->
        <v-card>
          <v-card-title>
            <span 
              v-if="live" 
              class="display-1"
            >
              Your Wallet Balance
            </span>
            <span 
              v-else 
              class="display-1"
            >
              Rinkeby Balance
            </span>
            <v-card-text class="subheading">{{ ethereumAddress }}</v-card-text>
          </v-card-title>
          <v-card-text class="display-2">{{ ethereumBalance }}</v-card-text>
        </v-card>
      </v-flex>
      <v-flex
        v-if="hasAccountMapping"
      >
        <v-card>
          <v-card-title>
            <span 
              v-if="live" 
              class="display-1"
            >
              Tokens Ready To Export
            </span>
            <span 
              v-else 
              class="display-1"
            >
              Extdev Tokens Ready To Export
            </span>
            <v-card-text class="subheading">{{ loomWalletAddr }}</v-card-text>
          </v-card-title>
          <v-card-text class="display-2">{{ loomBalance }}</v-card-text>
        </v-card>
      </v-flex> 
    </v-layout>
    <v-layout row>
      <v-flex>
        <v-btn
          v-if="hasAccountMapping"
          :disabled="busy"
          @click="deposit"
        >
          Deposit To Loom
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
      hasContractMapping: false
    }
  },

  async mounted() {
    alert(this.$route.query.iWantTo)
    await this.initWeb3()
    await this.initLoom()
    //await this.initContracts()
    //await this.mapAddresses()
    //await this.addEventListeners()
    //await this.updateBalances()
    //await this.checkContractMapping()
  },

  methods: {
    async manageAccountMapping() {
      const signer = getMetamaskSigner(this.web3js.currentProvider)
      const ethereumAddress = Address.fromString(`eth:${this.ethereumAddress}`)
      const plasmaEthSigner = new EthersSigner(signer)
      const privateKey = CryptoUtils.generatePrivateKey()
      const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
      this.loomClient.txMiddleware = createDefaultTxMiddleware(
        this.loomClient,
        privateKey
      )
      const provider = new LoomProvider(this.loomClient, privateKey)
      const web3Provider = new Web3(provider)
      this.loomProvider = new ethers.providers.Web3Provider(
        web3Provider.currentProvider
      )
      const loomWalletAddr = new Address(
        this.loomClient.chainId,
        LocalAddress.fromPublicKey(publicKey)
      )
      this.hasAccountMapping = await this.checkAccountMapping(
        ethereumAddress,
        loomWalletAddr
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
    async checkAccountMapping(ethAddr, loomAddr) {
      try {
        const mapper = await AddressMapper.createAsync(
          this.loomClient,
          loomAddr
        )
        var hasAccountMapping = await mapper.hasMappingAsync(ethAddr)
        if (hasAccountMapping) {
          var mappings = await mapper.getMappingAsync(ethAddr)
          this.loomWalletAddr = mappings.to.toString().split(':')[1]
        }
        return hasAccountMapping
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
        alert('Metamask is not Enabled')
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

      this.ready = await this.manageAccountMapping()
    },

    //added fucntions
    /*async mapContracts() {
      const ownerExtdevAddr = Address.fromString(
        `${this.loomClient.chainId}:${this.$store.state.LOOM_WALLET_CONTRACT_OWNER_ADDRESS}` //`${client.chainId}:${ownerExtdevAddress}`
      )
      const gatewayContract = await Contracts.TransferGateway.createAsync(
        this.loomClient,
        ownerExtdevAddr
      ) //const gatewayContract = await TransferGateway.createAsync(client,ownerExtdevAddr)
      const foreignContract = Address.fromString(
        `eth:${this.$store.state.ETHEREUM_CONTRACT_ADDR}` //`eth:${tokenRinkebyAddress}`
      )
      const localContract = Address.fromString(
        `${this.loomClient.chainId}:${this.$store.state.LOOM_CONTRACT_ADDR}` //`${client.chainId}:${tokenExtdevAddress}`
      )
      const hash = soliditySha3(
        { type: 'address', value: this.$store.state.ETHEREUM_CONTRACT_ADDR.slice(2) },
        { type: 'address', value: this.$store.state.LOOM_CONTRACT_ADDR.slice(2) }
      )
      const foreignContractCreatorTxHash = Buffer.from(
        this.$store.state.ETHEREUM_CONTRACT_TXN_HASH.slice(2), //rinkebyTxHash.slice(2),
        'hex'
      )
      var signer = new EthersSigner(this.ethereumProvider.getSigner())
      const foreignContractCreatorSig = await signer.signAsync(hash)
      console.log
      var res = await gatewayContract.addContractMappingAsync({
        localContract,
        foreignContract,
        foreignContractCreatorSig,
        foreignContractCreatorTxHash
      })
    },*/
    async foreignContractSigner() {
      const hash = soliditySha3(
        {
          type: 'address',
          value: this.$store.state.ETHEREUM_CONTRACT_ADDR.slice(2)
        },
        {
          type: 'address',
          value: this.$store.state.LOOM_CONTRACT_ADDR.slice(2)
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
            this.$store.state.ETH_WALLET_CONTRACT_OWNER_ADDRESS
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
    async checkContractMapping() {
      const ownerExtdevAddr = Address.fromString(
        `${this.loomClient.chainId}:${
          this.$store.state.LOOM_WALLET_CONTRACT_OWNER_ADDRESS
        }` //`${client.chainId}:${ownerExtdevAddress}`
      )
      const gatewayContract = await Contracts.TransferGateway.createAsync(
        this.loomClient,
        ownerExtdevAddr
      )
      const foreignContract = Address.fromString(
        `eth:${this.$store.state.ETHEREUM_CONTRACT_ADDR}`
      )
      var res = await gatewayContract.getContractMappingAsync(foreignContract)
      if (res) {
        if (!res.pending) {
          this.hasContractMapping = true
        }
      }
    },
    // Returns a new wrapper for the Ethereum Gateway contract
    async getEthereumGatewayContract() {
      const networkId = await this.web3js.eth.net.getId()
      let version
      switch (networkId) {
        case 1: // Ethereum Mainnet
          version = 1
          break

        case 4: // Rinkeby
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
        this.$store.state.TRANSFER_GATEWAY_ADDR, // In this example, we're instantiating the Rinkeby transfer gateway
        this.ethereumProvider.getSigner()
      )
      return ethereumGatewayContract
    },
    async initContracts() {
      const tokenABI = [
        'function balanceOf(address who) external view returns (uint256)',
        'function approve(address spender, uint256 value) external returns (bool) @50000',
        'function transfer(address to, uint256 value) external returns (bool) @30000',
        'event Transfer(address indexed from, address indexed to, uint256 value)'
      ]

      const payABI = ['function pay(uint256 amount) external @50000']

      this.ethereumToken = new ethers.Contract(
        this.$store.state.ETHEREUM_CONTRACT_ADDR,
        tokenABI,
        this.ethereumProvider.getSigner()
      )

      this.loomToken = new ethers.Contract(
        this.$store.state.LOOM_CONTRACT_ADDR,
        tokenABI,
        this.loomProvider.getSigner()
      )
      this.ethereumGateway = await this.getEthereumGatewayContract()
      const loomAddress = Address.fromString(
        `${this.loomClient.chainId}:${this.loomWalletAddr}`
      )
      this.loomGateway = await Contracts.TransferGateway.createAsync(
        this.loomClient,
        loomAddress
      )
    },

    async addEventListeners() {
      let rinkebyReceiveFilter = this.ethereumToken.filters.Transfer(
        null,
        this.ethereumAddress
      )
      this.ethereumToken.on(rinkebyReceiveFilter, (from, to, value) => {
        this.updateBalances()
      })

      let rinkebySendFilter = this.ethereumToken.filters.Transfer(
        this.ethereumAddress,
        null
      )
      this.ethereumToken.on(rinkebySendFilter, (from, to, value) => {
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
        this.$store.state.NUM_DECIMALS
      )
      const loomBalance = await this.loomToken.balanceOf(this.loomWalletAddr, {
        from: this.loomWalletAddr
      })
      this.loomBalance = ethers.utils.formatUnits(
        loomBalance.toString(),
        this.$store.state.NUM_DECIMALS
      )
    },
    async deposit() {
      this.busy = true

      const weiAmount = ethers.utils.parseUnits(
        //this.ethereumBalance,
        '1',
        this.$store.state.NUM_DECIMALS
      )
      var res = await this.ethereumToken.approve(
        this.ethereumGateway.contract.address,
        weiAmount.toString()
      )
      res = await this.ethereumGateway.contract.depositERC20(
        weiAmount,
        this.$store.state.ETHEREUM_CONTRACT_ADDR
      )
      this.busy = false
    },

    async withdraw() {
      this.busy = true
      var res = ''
      this.loomGateway.once(
        Contracts.TransferGateway.EVENT_TOKEN_WITHDRAWAL,
        async event => {
          const tokenEthAddr = Address.fromString(
            `eth:${this.$store.state.ETHEREUM_CONTRACT_ADDR}`
          )
          const ownerRinkebyAddr = Address.fromString(
            `eth:${this.ethereumAddress}`
          )

          if (
            event.tokenContract.toString() === tokenEthAddr.toString() &&
            event.tokenOwner.toString() === ownerRinkebyAddr.toString()
          ) {
            res = await this.ethereumGateway.contract.withdrawERC20(
              ethers.utils
                .parseUnits(this.loomBalance, NUM_DECIMALS)
                .toString(),
              event.sig,
              this.$store.state.ETHEREUM_CONTRACT_ADDR
            )
            console.log(res)
            this.busy = false
          }
        }
      )

      const gwAddress = this.loomGateway.address.local.toString()
      console.log(gwAddress)
      const tokenAddress = Address.fromString(
        `${this.loomClient.chainId}:${this.$store.state.LOOM_CONTRACT_ADDR}`
      )
      const weiAmount = ethers.utils
        .parseUnits(this.loomBalance, NUM_DECIMALS)
        .toString()

      await this.loomToken.approve(gwAddress, weiAmount)
      res = await this.loomGateway.withdrawERC20Async(
        new BN(weiAmount),
        tokenAddress
      )
      console.log(res)
    }
  }
}
</script>
