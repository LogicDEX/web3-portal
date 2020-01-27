<template>
  <div class="container">
    <SectionHeader>Intro to Cryptoraves Web3 Portal</SectionHeader>
    <div class="video-player">
      VIDEO PLACEHOLDER
    </div>
  </div>
</template>

<script>
import SectionHeader from '../components/SectionHeader'
export default {
  name: 'VieoSection',
  components: {
    SectionHeader
  }
}
</script>

<style scoped>
.video-player {
  font-size: 50px;
  margin: 40px auto 40px auto;
  width: 80%;
  height: 600px;
  background-color: grey;
  border-radius: 10px;
}
</style>
