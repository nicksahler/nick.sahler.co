<footer class="full-width subgrid">
  <div class="contact">
    <span>twitter</span> <a href="https://twitter.com/nicksahler">nicksahler</a>
    <span>pgp</span> <a href="https://keybase.io/nicksahler">66D8 3E03 39D3 A010</a>
  </div>
  <div class="end">
    <div class="overflow"><span>This frog marks the end of the page.</span></div>
    <div class="frog-wrapper">
      <object class="frog" data="./frog.svg" type="image/svg+xml"></object>
    </div>
  </div>
</footer>

<style lang="scss">
@import './styles/variables.scss';

footer {
  justify-content: space-between;
  width: 100%;
  border-top: $border;
  margin-top: -1px;

  .contact {
    align-content: center;
    display: grid;
    grid-template-columns: min-content 1fr;
    grid-auto-rows: max-content;
    grid-column-gap: inherit;
    grid-column: 1 / -1;
    padding: $padding;
    border-bottom: $border;

    @media screen and (min-width: $phone-xl) {
      grid-template-columns: 150px 1fr;
      grid-column: 1 / span 7;
      padding: 0;
      border-bottom: 0;
    }

    span {
      grid-column: 1 / span 1;
      margin-right: $padding;
      @media screen and (min-width: $phone-xl) {
        text-align: right;
        padding: 0 $padding;
      }
    }

    a {
      padding-left: $padding;
      grid-column: 2 / -1;
      color: $black;
    }
  }

  .end {
    grid-column: 1 / -1;
    grid-row-start: 2;

    display: grid;
    grid-template-columns: 1fr;

    grid-column-gap: inherit;
    align-items: center;
    justify-content: center;

    @media screen and (min-width: $phone-xl) {
      grid-column: 8 / -1;
      grid-row-start: unset;
      grid-template-columns: 150px 1fr;
    }

    &:hover > .overflow span,
    &:active > .overflow span {
      transform: unset;
      opacity: 1;
    }

    .overflow {
      overflow: hidden;
      grid-column: 1 / span 2;
      text-align: center;
      padding-left: $padding;

      span {
        font-size: 12px;
        display: inline-block;
      }

      @media screen and (min-width: $phone-xl) {
        text-align: right;
        span {
          margin-right: $padding;
          transition: 
            transform 300ms cubic-bezier(.65,.05,.36,1),
            opacity 500ms cubic-bezier(.65,.05,.36,1);
          transform: translate3d(0, 100%, 0);
          opacity: 0;
        }
      }
    }

    .frog-wrapper {
      grid-column: 3 / span 1;
      padding: $padding;
      justify-content: center;
      display: flex;
      box-sizing: border-box;
      border-left: $border;
      margin-right: -1.5px;

      .frog {
        margin-bottom: -5px;
        width: 50px;
        height: 50px;
        cursor: pointer;
        transition: transform 300ms cubic-bezier(0.65, 0.05, 0.36, 1);
      }

      .frog svg g {
        fill: $black;
      }

      .frog:hover {
        transform: rotate3d(0, 0, 1, 20deg);
      }

      .frog:active {
        transform: rotate3d(0, 0, 1, 20deg) scale(.9);
      }
    }
  }
}
</style>