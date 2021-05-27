<script>
  import {readKey, readMessage, decrypt, verify} from 'openpgp';

  const armoredKey = `
-----BEGIN PGP PUBLIC KEY BLOCK-----

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
Wa3ugGOxPxAsrJaWsWDBA6lC+qLp1CO7en1X
=Rsrt
-----END PGP PUBLIC KEY BLOCK-----`

  const armoredMessage = `
-----BEGIN PGP MESSAGE-----

xA0DAAgBoO3Cj2ncX48By+F0AOIAAAAA5G1haWx0bzpuaWNrQHNhaGziZXIuY+Bv
AMLAXAQAAQgAEAUCYK7RUgkQoO3Cj2ncX48AAMwTCAAgO8XSHnjDgtUCS8JR2IJO
Ql7pTxsiYmdsTNKdBQyStRnV1K8NS17zkbGa+Re0Ic6T027Xp1xQdKRqzT6VHmyj
NKpAtupwHFPq+y/NlXapDKc6VXxNb4ZKyQz2QQNFkWCKE9DA5yaMpBWXRjHcR4B8
aU+ObL1tluWCRr4Uc5u5rFmvSKvVTMoHJ4P+zOajr2+k2GY+SkbIsGhjDvJ3kVEr
Sd2ixgARV0Y1x2QGqncvsmIJzwJw7FskOewFRAxDUjvTI265ztTZdIDt7y63Nkaa
C3d333sCzULrfvlzflJrBovspINrajpdF4UpnTYCxz5Vjsxw3+fxxzrhMudj30Ns
=qy7m
-----END PGP MESSAGE-----`

  const load = async (e) => {
    e.preventDefault()
    const publicKey = await readKey({ armoredKey })
    const message = await readMessage({ armoredMessage })

    const signature = await verify({ message, publicKeys: publicKey })
    const text = signature.data.trim()
    e.target.href = text
    e.target.innerText = text.split(':')[1]
  }
</script>

<footer class="full-width subgrid">
  <div class="contact">
    <span>email</span> 
    <a href="./" on:click={load}>click to reveal</a>
    <span>pgp</span>
    <a href="https://keybase.io/nicksahler">66D8 3E03 39D3 A010</a>
  </div>
  <div class="end">
    <div class="overflow"><span>This frog marks the end of the page.</span></div>
    <div class="frog-wrapper">
      <object title="Frog" class="frog" data="./frog.svg" type="image/svg+xml"></object>
    </div>
  </div>
</footer>

<style lang="scss">
@import '../styles/variables.scss';

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

      &:hover {
        text-decoration: underline;
      }
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
        width: 100%;
        max-width: 50px;
        height: 50px;
        cursor: pointer;
        transition: transform 300ms cubic-bezier(0.65, 0.05, 0.36, 1);
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