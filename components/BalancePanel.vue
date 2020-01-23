<template>
  <div class="balancepanel">
    <div class="balancepanel-title">
      Your Cryptoraves $VYA Balance
    </div>
    <a href="">
      0xfhjdksfhdjksfhdjsk1234
    </a>
    <div class="balancepanel-balance">
      123456.00
    </div>
  </div>  
</template>

<script>
export default {
  name: 'BalancePanel'
}
</script>

<style scoped>
.balancepanel {
  width: 500px;
  height: 500px;
  background-color: lightgrey;
  text-align: center;
  margin: auto;
  font-family: 'Montserrat';
  color: rgb(0, 38, 101);
  display: flex;
  flex-direction: column;
}
.balancepanel-title {
  font-size: 30px;
  margin: auto;
}
.balancepanel-balance {
  font-size: 70px;
  margin: auto;
}
</style>
