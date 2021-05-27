<script>
  import Home from './pages/Home.svelte'
  import Reading from './pages/Reading.svelte'
  import { Router, Link, Route } from 'svelte-routing'
  export let url = ''
</script>

<Router url={url}>
<div class="wrapper">
  <Route path="/" component="{Home}"/>
  <Route path="/reading-list" component="{Reading}"/>
</div>
</Router>

<style lang="scss">
@import '../styles/variables.scss';

.wrapper {
  display: flex;
  flex-flow: column;
  grid-template-columns: 150px repeat(11, 1fr);
  grid-template-rows: auto 1fr auto;
  border: 1px solid;
  column-gap: $padding;
  min-height: 100%;
  flex: 1;
}
</style>