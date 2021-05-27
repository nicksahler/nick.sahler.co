<script>
  import Footer from '../components/Footer.svelte'
  import Header from '../components/Header.svelte'
  import Project from '../components/Project.svelte'
  import SectionHeader from '../components/SectionHeader.svelte'

  import project_sections from '../project_sections.json'

  const toggle = ( section, e ) => {
    project_sections[section].hide = !project_sections[section].hide
  }

  const icon = ( href, hide ) => {
    return href ? '→' : (
      !!hide ? '⊕' : '⊗' 
    )
  }
</script>

<Header/>
<main class="full-width subgrid">
  {#each project_sections as { title, projects, href, hide }, i }
    <SectionHeader 
      on:click={toggle.bind(null, i)}
      icon={icon(href, hide)}
      {...{title, href}}
    />
    {#if !hide && projects }
      {#each projects as project}
        <Project {...project}/>
      {/each}
    {/if}
  {/each}
</main>
<Footer/>

<style lang="scss">
main {
  grid-auto-rows: min-content;
  flex: 1;
}
</style>