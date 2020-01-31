<template>
  <div class="app-header">
    <div class="container">
      <div class="row">
        <div class="d-flex col-sm-12 col-lg-4 app-header-logo">
          <a href="/">
            <img src="../assets/cryptoraves_Horozontal Alignment_Full Color_JPG.png" >
          </a>
        </div>
        <div class="d-flex col-sm-12 col-lg-8">
          <div class="app-header-title">
            Cryptoraves Web 3 Portal
          </div>          
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppHeader'
}
</script>

<style scoped>
.app-header {
  background-color: white;
  width: 100%;
  height: 125px;
  display: flex;
  box-shadow: 2.5px 4.33px 24px rgba(0, 0, 1, 0.11);
}
img {
  width: 270px;
  height: 70px;
  margin: auto;
}
.app-header-title {
  font-size: 2.5rem;
  font-family: 'Montserrat';
  color: rgb(42, 192, 236);
  font-weight: bold;
  line-height: 2.5;
}

@media only screen and (max-width: 991px) {
  .app-header {
    height: 200px;
  }
  .app-header-title,
  .app-header-logo {
    text-align: center;
  }
}
@media only screen and (max-width: 499px) {
  .app-header-title {
    margin-top: 2.5rem;
    font-size: 2rem;
    line-height: 1;
  }
}
</style>
