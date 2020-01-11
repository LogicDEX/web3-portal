<template>
  <v-app id="inspire">
    <v-toolbar
      color="white"
      dark
      fixed
      app
    >
      <img 
        src="~/assets/cryptoraves_Horozontal Alignment_Full Color_JPG.png"
        alt
      >
      <v-toolbar-title
        class="display-2 blue--text"
      >Cryptoraves Web3 Portal
      </v-toolbar-title>
    </v-toolbar>
    <v-content>
      <v-container
        fluid
        fill-height
      >
        <v-layout
          justify-center
          align-center
        >
          <v-flex text-xs-center>
            <nuxt/>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer
      color="#002966"
      app
    >
      <span class="white--text">Cryptoraves &copy; 2020</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  props: {
    source: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    drawer: null
  }),
  methods: {
    foo() {}
  }
}
</script>
