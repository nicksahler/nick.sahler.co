<script>
  import { link } from 'svelte-routing'

  export let icon
  export let title
  export let href

  $: anchor = `#${title.toLowerCase().replace(/\s/g, '-')}`
  $: _href = (href || anchor)
</script>

<div class="header full-width subgrid" id={anchor} on:click>
  <a 
    use:link 
    href={_href}
    class="title full-width"
    class:underline={!!href}
  >{title}</a>

  <span class="hint">{icon}</span>
</div>

<style lang="scss">
@import '../styles/variables.scss';

.header {
  background: #F5F5F5;
  align-content: center;
  border-bottom: $border;
  cursor: pointer;

  .title {
    font-weight: normal;
    font-size: 1.14285714rem;
    padding: $padding;
    grid-column: 1 / -2;

    @media screen and (min-width: $tablet) {
      grid-column: 2 / 12;
    }

    &.underline {
      text-decoration: underline;
    }
  }

  .hint {
    display: none;
    display: grid;
    grid-column: -2 / -1;
    align-content: center;
    text-align: center;
    padding-right: $padding;
  }
}
</style>