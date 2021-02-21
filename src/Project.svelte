<script>
  export let url
  export let title
  export let info
  export let date
  export let image
  export let hide

  $: wide = hide || !image
</script>

<a href={url} class="example subgrid" >
  <time>{@html date}</time>
  <div class="info" class:wide>
    <span class="title">{title}</span>
    {#if info}<p>{@html info}</p>{/if}
  </div>
  {#if !wide }
    <img class="thumbnail" src={image.src} />
  {/if}
</a>

<style lang="scss">
@import './styles/variables.scss';
@import './styles/grid.scss';

.example {
  grid-column: 1 / 13;
  display: grid;
  border-bottom: $border;
  margin-bottom: -1px;
  z-index: 1;

  time {
    color: #AAA;
    padding: $padding;
    grid-column: 1 / -1;
    grid-row-start: 3;

    @media screen and (min-width: $tablet) {
      grid-column: 1 / span 1;
      grid-row-start: auto;
      border-bottom: none;
      border-right: $border;
      margin-right: $padding;
      text-align: right;
    }

    /* writing-mode: vertical-rl;
    text-orientation: mixed; */
  }

  .info {
    grid-column: 1 / -1;
    padding: $padding;
    padding-bottom: 0;

    @media screen and (min-width: $phone-xl) {
      grid-column: 2 / span 6;
      border-left: 1px solid;
      padding: $padding;

      &.wide {
        grid-column: 2 / -2;
        border-right: $border;
      }
    }


    .title  {
      font-weight: bold;

      &::before {
        content: "↑ ";

        @media screen and (min-width: $phone-xl) {
          content: "";
        }
      }
    }

    &.wide .title::before {
      content: "";
    }
  }

  .thumbnail {
    padding: $padding;
    grid-column: 1 / -1;
    grid-row-start: 1;
    border-bottom: $border;

    @media screen and (min-width: $tablet) {
      grid-column: 8 / -2;
      border-bottom: none;
      border-left: $border;
      border-right: $border;
    }
  }
}
</style>