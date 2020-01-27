<template>
  <div class="container">
    <SectionHeader>Initial Set Up: Hey Cryptoraves, here's My Layer 1 Wallet</SectionHeader>
    <div class="instruction-header">
      <slot name="header"/>      
    </div>
    <div class="instruction-steps">
      <slot name="step1"/>
      <slot name="step2"/>
      <slot name="step3"/>
    </div>
  </div>
</template>

<script>
import SectionHeader from '../components/SectionHeader'
export default {
  name: 'InstructionSection',
  components: {
    SectionHeader
  }
}
</script>

<style scoped>
.instruction-header {
  margin-top: 50px;
  font-size: 20px;
  font-family: 'Montserrat';
  color: rgb(0, 38, 101);
  line-height: 1.4;
  text-align: center;
}
.instruction-steps {
  display: block;
  font-size: 20px;
  font-family: 'Montserrat';
  color: rgb(0, 38, 101);
  line-height: 2;
}
</style>
