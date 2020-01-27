<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div 
            class="modal-custom-header">
            This wallet doesn't appear to be registered with Cryptoraves. 
            Select the one that is, or register this one by tweeting:
            <br><br>@cryptoraves #heresmyaddresss            
            <div class="modal-custom-header-address">{{ address }}</div>
          </div>  
          <div class="modal-footer">
            <slot name="footer">
              <button 
                class="modal-custom-button" 
                @click="$emit('registerwallet')">
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
  name: 'RegisterWallet',
  props: {
    address: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
@import '../assets/style/withdrawstyle';
.modal-custom-header {
  font-size: 20px;
  text-align: left;
}
.modal-custom-header-address {
  color: #002466;
  overflow-wrap: break-word;
  cursor: pointer;
}
.modal-custom-header-address:hover {
  text-decoration: underline;
}
</style>
