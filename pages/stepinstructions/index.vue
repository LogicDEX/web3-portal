<template>
  <transition 
    name="fade" 
    mode="out-in">
    <div class="container"> 
      <div class="instruction-page">
        <VideoSection/>
        <!-- Instruction Section 1 -->
        <InstructionSection>
          <template v-slot:title1>
            Initial Set Up (Part 1a):
          </template>
          <template v-slot:title2>
            Hey Cryptoraves, Here's my Address
          </template>
          <template v-slot:header>
            <i>Only required once during initial set up!  Complete this step first!</i>
          </template>
          <template v-slot:step1>
            <div><span>Step1:</span> Send this Tweet from the Twitter account you want to link to the Cryptoraves platform.  Please paste your entire wallet address in the Tweet below:<br><br>@cryptoraves #HeresMyAddress 0x……….
            <br><br></div>          
          </template>
          <template v-slot:step2>
            <div><span>Step2:</span> Wait 3-4 minutes to receive a reply from Cryptoraves.<br><br></div>
          </template>
          <template v-slot:step3>
            <div><span>Step3:</span> Once Reply received, you have successfully initiated the process for Deposit & Withdrawal from the Cryptoraves platform.  Please proceed to the Cryptoraves Web 3 Portal using the link sent in the Tweet reply to complete the Initial Set Up (Part 1b).  Or you can go directly to the 
              <a 
                href="http://web3.cryptoraves.space/" 
                target="_blank">Cryptoraves Web 3 Portal</a>.</div>
          </template>          
        </InstructionSection>
        <!-- Instruction Section 2 -->
        <InstructionSection>
          <template v-slot:title1>
            Initial Set Up (Part 1b):
          </template>
          <template v-slot:title2>
            Link my Address to  Cryptoraves
          </template>
          <template v-slot:header>
            <i>Only required once during initial set up!  Please only complete this step after Initial Set Up (Part 1a) has been completed!</i>
          </template>
          <template v-slot:step1>
            <div><span>Step1:</span> Follow the link from the Cryptoraves Twitter Reply received above, or go directly to the 
              <a 
                href="http://web3.cryptoraves.space/" 
                target="_blank">Cryptoraves Web 3 Portal</a>.<br><br></div>          
          </template>
          <template v-slot:step2>
            <div><span>Step2:</span> A Metamask pop-up window will appear.  Please sign into Metamask & follow the prompts. They will ask you to link your address with Cryptoraves. Click “Sign.”<br><br></div>
          </template>
          <template v-slot:step3>
            <div><span>Step3:</span> You will see a pop-up confirmation stating: Your address is now linked to Cryptoraves.<br><br></div>
          </template>
          <template v-slot:step4>
            <div><span>Step4:</span> You have completed the Initial Set Up.  You are now ready to Deposit & Withdraw.  <b>You do not need to complete these steps again.</b></div>
          </template>
        </InstructionSection>
        <!-- Instruction Section 3 -->
        <InstructionSection>        
          <template v-slot:title2>
            Deposit Tokens Into Cryptoraves for Tweeting
          </template>
          <template v-slot:header>
            <i>Must complete BOTH Initial Set Up steps first!  See above.</i>
          </template>
          <template v-slot:step1>
            <div><span>Step1:</span> Go to the Cryptoraves Web 3 Portal. Select the token you want to Deposit. You should see balances from Cryptoraves and your Metamask wallet populate correctly.<br><br></div>          
          </template>
          <template v-slot:step2>
            <div><span>Step2:</span> Click the green Deposit button. A Cryptoraves pop up window will appear prompting you to enter the token amount you want to deposit, and to sign the Metamask prompt.<br><br></div>
          </template>
          <template v-slot:step3>
            <div><span>Step3:</span> Click “Deposit” and sign the Metamask prompt.<br><br></div>
          </template>
          <template v-slot:step4>
            <div><span>Step4:</span> A pop up window with a spinning circle will appear, indicating the deposit is in process.  <b>It will take approximately 30 minutes to complete the Deposit</b>.<br><br></div>
          </template>
          <template v-slot:step5>            
            <div><span>Step5:</span> A pop up window will appear once the Deposit has completed.  Please wait until the updated balances to appear in the Cryptoraves Web 3 Portal to appear.  These balances will also be reflected in your Cryptoraves Portfolio Page.</div>
          </template> 
        </InstructionSection>
        <!-- Instruction Section 4 -->
        <InstructionSection>        
          <template v-slot:title2>
            Withdraw Tokens from Cryptoraves to Your Wallet
          </template>
          <template v-slot:header>
            <i>Must complete BOTH Initial Set Up steps first!  See above.</i>
          </template>
          <template v-slot:step1>
            <div><span>Step1:</span> Go to the Cryptoraves Web 3 Portal. Select the token you want to Withdraw. You should see balances from Cryptoraves and your Metamask wallet populate correctly.<br><br></div>          
          </template>
          <template v-slot:step2>
            <div><span>Step2:</span> Click the purple Withdraw button. A pop up window will appear prompting you to enter the token amount you want to withdraw, and to sign the next 2 Metamask prompts. Click “Withdraw”.<br><br></div>
          </template>
          <template v-slot:step3>
            <div><span>Step3:</span> Hit “Sign” on the next Metamask prompt.<br><br></div>
          </template>
          <template v-slot:step4>
            <div><span>Step4:</span> Hit “Sign” on the 2nd Metamask prompt.<br><br></div>
          </template>
          <template v-slot:step5>
            <div><span>Step5:</span> A Cryptoraves prompt notifies you to wait a few minutes.<br><br></div>
          </template>
          <template v-slot:step6>
            <div><span>Step6:</span> A 2nd Cryptoraves prompt asks you to confirm the next Metamask transaction.<br><br></div>
          </template>
          <template v-slot:step7>
            <div><span>Step7:</span> Hit “Confirm” on the next Metamask prompt.<br><br></div>
          </template>
          <template v-slot:step8>
            <div><span>Step8:</span> It will take approximately 5 minutes to complete the transaction.  Please wait until the updated balances to appear in the Cryptoraves Web 3 Portal to appear.  These balances will also be reflected in your Cryptoraves Portfolio Page.</div>
          </template>
        </InstructionSection>
      </div>
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

<style scoped>
.instruction-page {
  max-width: 1140px;
  background-color: white;
  box-shadow: 0 0 1em 1px rgba(0, 0, 0, 0.25);
  width: 100%;
  margin: 2em auto 2em auto;
}
</style>
