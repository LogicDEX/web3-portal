<template lang="html">
  <v-container
    grid-list-md
    text-xs-center
  >
    <div 
      class="display-2"
    >
      I Want To:      
    </div>
    <v-layout row>
      <v-flex>
        <nuxt-link to="/mapping?iwantto=withdraw"> Withdraw Tokens</nuxt-link>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex>
        <nuxt-link to="/mapping?iwantto=deposit">Deposit Tokens</nuxt-link>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Web3 from 'web3'
import { ethers } from 'ethers'

export default {
  data() {
    return {
      ready: false,
      ethereumProvider: null,
      ethereumWalletAddr: null
    }
  },
  async mounted() {
    await this.initWeb3()
  },
  methods: {
    async initWeb3() {
      let web3js
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        web3js = new Web3(ethereum)
        await ethereum.enable()
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
        web3js = new Web3(window.web3.currentProvider)
      } else {
        alert(
          'Metamask is not Enabled. Please Use Metamask and Select the Account You Wish to Use.'
        )
      }
      if (web3js) {
        this.web3js = web3js
        this.ethereumProvider = new ethers.providers.Web3Provider(
          web3js.currentProvider
        )
        this.ethereumWalletAddr = (await this.ethereumProvider.listAccounts())[0]
      }
    }
  }
}
</script>
