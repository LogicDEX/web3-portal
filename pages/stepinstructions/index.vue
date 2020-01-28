<template>
  <transition 
    name="fade" 
    mode="out-in">
    <div>
      <VideoSection/>
      <InstructionSection>
        <template v-slot:title1>
          Initial Set Up:
        </template>
        <template v-slot:title2>
          Hey Cryptoraves, here's My Layer 1 Wallet
        </template>
        <template v-slot:header>
          <i>Only required once during initial set up!</i>
        </template>
        <template v-slot:step1>
          <div>Step1: Send this Tweet</div>          
        </template>
        <template v-slot:step2>
          <div>Step2: Do this.</div>
        </template>
        <template v-slot:step3>
          <div>Step3: Do that.</div>
        </template>
        <template v-slot:step4>
          <div>Step4: Do that.</div>
        </template>
      </InstructionSection>
      <InstructionSection>
        <template v-slot:title1>
          Initial Set Up:
        </template>
        <template v-slot:title2>
          Link My Layer 1 Wallet to my Cryptoraves Layer 2 Wallet
        </template>
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
        <template v-slot:step4>
          <div>Step4: Do that.</div>
        </template>
      </InstructionSection>
      <InstructionSection>        
        <template v-slot:title2>
          Deposit Tokens into Cryptoraves for Tweeting
        </template>
        <template v-slot:header>
          <i>Must complete initial Set Up Steps First!</i>
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
        <template v-slot:step4>
          <div>Step4: Do that.</div>
        </template>
      </InstructionSection>
      <InstructionSection>        
        <template v-slot:title2>
          Withdraw Tokens from Cryptoraves to Layer 1
        </template>
        <template v-slot:header>
          <i>Must Complete initial Set Up Steps First!</i>
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
        <template v-slot:step4>
          <div>Step4: Do that.</div>
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
