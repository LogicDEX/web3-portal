<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-custom-header">
            Now confirm the next transaction to get your tokens.
          </div>
          <div class="portfolio-userimg">
            <img
              :src="imageurl"
              :title="imagetitle">
          </div>
          <div class="modal-custom-title">{{ imagetitle }} Token</div>                    
          <div class="modal-footer">
            <slot name="footer">
              <button 
                class="modal-custom-button" 
                @click="$emit('confirmwithdraw')">
                OK
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
  name: 'ConfirmWithdraw',
  props: {
    imageurl: {
      type: String,
      default: ''
    },
    imagetitle: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
@import '../assets/style/withdrawstyle';
</style>
