<template>
  <div>
    <AppHeader />
    <nuxt />
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../components/AppHeader'
import AppFooter from '../components/AppFooter'
export default {
  components: {
    AppHeader,
    AppFooter
  },
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
