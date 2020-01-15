export const state = () => ({
  I_WANT_TO: null,
  LOOM_CONTRACT_ADDR: '0x98bf1efec96ea484dcbf410cfc54076ed13d6784',
  ETHEREUM_CONTRACT_ADDR: '0x703dc0231B321D4BB5C35f90E867e195FDFE07f7',
  NUM_DECIMALS: 8
})
export const mutations = {
  SET_VAR_1(state, value) {
    console.log('SET_VAR_1', value)
    state.var1 = value
  },
  SET_VAR_2(state, value) {
    console.log('SET_VAR_2', value)
    state.var2 = value
  }
}
