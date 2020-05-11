// import Tone from '/web_modules/tone.js'

const lerp = (a, b, t) => a * ( 1 - t ) + b * t

window.addEventListener('DOMContentLoaded', () => {
  /*
  var distortion = new Tone.Distortion(0.6)
  var tremolo = new Tone.Tremolo().start()
  var bits = new  Tone.BitCrusher(4)

  var synth = new Tone.Synth({
      envelope : {
        attack: 0.05,
        decay: 0.1,
        sustain: 0.3,
        release: 0.02
      } 
    }).toMaster().chain(bits, Tone.Master)

    synth.volume.value = -10

    let $frog = document.querySelector('.frog')

    $frog.addEventListener('mousedown', () => {
      // synth.triggerAttack(2000);
    })

    $frog.addEventListener('mouseup', () => {
      // synth.triggerRelease()
    })
  */
  const $texts = document.querySelectorAll( '.jiggle' )

  let A_FROM = 0, A_TO = 0
  let TIME = performance.now()
  const SLOWDOWN = 1 / 100
  const Y = ( i ) => Math.sin( i + performance.now() * SLOWDOWN )

  Array.from( $texts ).forEach(( $text ) => {
    $text.addEventListener('mouseenter', (e) => {
      $text.dataset.from = 0
      $text.dataset.to = 2
      $text.dataset.time = performance.now()
    })

    $text.addEventListener('mouseleave', (e) => {
      $text.dataset.from = 2
      $text.dataset.to = 0
      $text.dataset.time = performance.now()
    })
  })

  const jiggle = () => {
    requestAnimationFrame( jiggle )
    // console.log(lerp(0, AMPLITUDE, TIME - performance.now()))
    Array.from( $texts ).forEach(( $text ) => {
      Array.from( $text.children ).forEach(( $a, i ) => (
        $a.style.transform = `translate3d(0, ${ Y( i ) * lerp($text.dataset.from || 0, $text.dataset.to || 0, Math.min((performance.now() - $text.dataset.time ) / 300, 1)) }px, 0 )`
      ))
    })
  }

  Array.from( $texts ).forEach(( $text ) => { 
    const chars = [...( $text.innerText )]
    $text.innerHTML = chars.map( c => `<span>${c.replace(/\s/g, '&nbsp;')}</span>` ).join( '' )
  })

  jiggle()
})