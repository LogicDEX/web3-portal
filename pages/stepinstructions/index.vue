<template>
  <transition 
    name="fade" 
    mode="out-in">
    <div>
      <VideoSection/>
      <InstructionSection>
        <template v-slot:header>
          <i>Only required once during initial set up!</i>
        </template>
        <template v-slot:step1>
          <div>Step1: Go to Web3 Portal (link)</div>          
        </template>
        <template v-slot:step2>
          <div>Step2: Do this.</div>
        </template>
        <template v-slot:step3>
          <div>Step3: Do that.</div>
        </template>
      </InstructionSection>
    </div>
  </transition>
</template>

<script>
import VideoSection from '../../components/VideoSection'
import InstructionSection from '../../components/InstructionSection'

export default {
  name: 'StepInstructions',
  components: {
    VideoSection,
    InstructionSection
  }
}
</script>
