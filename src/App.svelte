<script>
	import Project from './Project.svelte'
	import Footer from './Footer.svelte'
	import project_sections from './project_sections.json'

  const toggle = ( section ) => {
    project_sections[section].hide = !project_sections[section].hide
  }
</script>

<div class="wrapper">
  <header class="description subgrid">
    <p><strong>Nick Sahler</strong> is a <a class="jiggle" href="#">machine learning engineer</a> at <a class="jiggle" href="https://squarespace.com">Squarespace</a>, and is helping organize <a class="jiggle" href="https://nativesintech.org/">Natives in Tech</a> as a contributor and board member. In his free time he advocates for <a class="jiggle" href="#indigenous">Indigenous language preservation</a> and works on assorted <a class="jiggle" href="#">game dev projects</a>.</p>
  </header>
  <main class="full-width subgrid">
  	{#each project_sections as { title, projects, href, hide }, i }
  		<div class="header full-width subgrid" on:click={toggle.bind(null, i)}>
        {#if projects}
    			<div class="title full-width">{title}</div>
          <span class="hint">{#if !!hide}⊕{:else}⊗{/if}</span>
        {:else if href }
          <a class="title full-width" {href}>{title}</a>
          <span class="hint">&rarr;</span>
        {/if}
      </div>
      {#if !hide && projects }
    		{#each projects as project}
    			<Project {...project}/>
    		{/each}
      {/if}
  	{/each}
  </main>
  <Footer/>
</div>

<style lang="scss">
@import './styles/variables.scss';

.wrapper {
  display: grid;
  grid-template-columns: 150px repeat(11, 1fr);
  grid-template-rows: auto 1fr auto;
  border: 1px solid;
  column-gap: $padding;
  min-height: 100%;
  flex: 1;
}

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
}

header a:nth-of-type(1) { color: crimson; }
header a:nth-of-type(2) { color: tomato; }
header a:nth-of-type(3) { color: #8e7fd9; }
header a:nth-of-type(4) { color: skyblue; }
header a:nth-of-type(5) { color: teal; }

main {
  grid-auto-rows: min-content;

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
    }

    a.title {
      text-decoration: underline;
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
}
</style>