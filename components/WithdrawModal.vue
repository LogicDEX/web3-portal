<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-custom-header">
            Enter Amount of            
          </div>
          <div class="portfolio-userimg">
            <img
              :src="imageurl"
              :title="imagetitle">
          </div>
          <div class="modal-custom-title">{{ imagetitle }} Token</div>          
          <div class="modal-custom-description">That You Would Like to Withdraw from <br> Cryptoraves Into Your Wallet:</div>
          <div class="modal-custom-input">
            <div 
              class="modal-custom-input-button"
              @click="setMaxAmount(maxamount)">MAX</div> 
            <input 
              v-model="amount"              
              type="number"
              class="modal-custom-input-input"
              placeholder="0">       
          </div>
          <div class="modal-custom-alert">Then Sign the Next TWO Metamask Prompts.</div>
         
          <div class="modal-footer">
            <slot name="footer">
              <button 
                class="modal-custom-button" 
                @click="$emit('closeWithdraw')">
                Cancel
              </button>
              <button 
                class="modal-custom-button" 
                @click="$emit('withdraw', amount)">
                Withdraw
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'WithdrawModal',
  props: {
    imageurl: {
      type: String,
      default: ''
    },
    imagetitle: {
      type: String,
      default: ''
    },
    maxamount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      amount: 0
    }
  },
  methods: {
    setMaxAmount(amount) {
      this.amount = amount
    }
  }
}
</script>

<style scoped>
@import '../assets/style/withdrawstyle';
</style>
