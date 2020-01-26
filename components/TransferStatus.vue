<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div             
            class="modal-custom-header">
            Please wait a few minutes for the next prompt.          
          </div>
          <div class="portfolio-userimg">
            <img
              :src="imageurl"
              :title="imagetitle">
          </div>
          <div class="modal-custom-title">{{ imagetitle }} Token</div>                    
          <div 
            class="loading-image-container">
            <img 
              class="loading-image"
              src="../assets/loading.gif">
          </div>                 
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'TransferStatus',
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
