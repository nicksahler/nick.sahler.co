<script>
  import Project from '../components/Project.svelte'
  import SectionHeader from '../components/SectionHeader.svelte'
</script>

<SectionHeader title='Home' icon='←' href='/' />
<SectionHeader title='Reading List' icon='↓'/>
<Project
  title="A New Program for Graphic Design"
  date='2020 Nov 25'
  info="Three semesters worth of miscellaneous design wisdom. Meant to be a textbook, still fun to read casually."
  image={{src: 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1568586059l/51572616._SX318_SY475_.jpg'}}
  url='https://www.goodreads.com/book/show/51572616-a-new-program-for-graphic-design'
/>