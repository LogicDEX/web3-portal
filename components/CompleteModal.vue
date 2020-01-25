<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div 
            v-if="stillbusy"           
            class="modal-custom-header">
            Please wait up to 30 mins for deposit to complete
          </div>
          <div 
            v-else
            class="modal-custom-header">{{ imagetitle }} Deposit Awaiting Confirmation</div>            
          <div class="portfolio-userimg">
            <img
              :src="imageurl"
              :title="imagetitle">
          </div>
          <div class="modal-custom-title">{{ imagetitle }} Token</div>                    
          <div 
            v-if="stillbusy"
            class="loading-image-container">
            <img 
              class="loading-image"
              src="../assets/loading.gif">
          </div>          
          <div 
            v-else
            class="modal-footer">
            <slot name="footer">
              <button 
                class="modal-custom-button" 
                @click="$emit('complete')">
                Complete
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
  name: 'CompleteModal',
  props: {
    imageurl: {
      type: String,
      default: ''
    },
    imagetitle: {
      type: String,
      default: ''
    },
    stillbusy: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
@import '../assets/style/modalstyle';
.loading-image {
  margin: auto;
}
.loading-image-container {
  display: flex;
}
</style>
