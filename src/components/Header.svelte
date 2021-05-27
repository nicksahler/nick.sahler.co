<header class="description subgrid">
  <p><strong>Nick Sahler</strong> is a <a class="jiggle" href="#">machine learning engineer</a> at <a class="jiggle" href="https://squarespace.com">Squarespace</a>, and is helping organize <a class="jiggle" href="https://nativesintech.org/">Natives in Tech</a> as a contributor and board member. In his free time he advocates for <a class="jiggle" href="#indigenous">Indigenous language preservation</a>.

  <!-- One day. -->
  <!--  and works on assorted <a class="jiggle" href="#">game dev projects</a>.</p> -->
</header>

<style lang="scss">
@import '../styles/variables.scss';

header {
  border-bottom: $border;
  padding: $padding;
  grid-column: 1 / -1;

  p {
    grid-column: 1 / -1;
    @media screen and (min-width: $tablet) {
      grid-column: 2 / span 6;
    }
  }

  a:nth-of-type(1) { color: crimson; }
  a:nth-of-type(2) { color: tomato; }
  a:nth-of-type(3) { color: #8e7fd9; }
  a:nth-of-type(4) { color: skyblue; }
  a:nth-of-type(5) { color: teal; }
}
</style>