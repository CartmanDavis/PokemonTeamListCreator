# VGC Teamsheet Generator

Generates Open and Staff Team Lists for Pokémon VGC (Pokémon Champions) from a Pokémon Showdown paste. Everything runs in the browser.

## Development

```sh
pnpm install
pnpm dev      # start dev server
pnpm build    # type-check and build to dist/
pnpm lint     # run oxlint
pnpm test     # run unit tests
```

## Credits

Based on [DhSufi's Pokémon Team List Creator](https://github.com/DhSufi/PokemonTeamListCreator).

Libraries used:

- [Koffing](https://github.com/itsjavi/koffing) for parsing Showdown pastes
- [jsPDF](https://github.com/parallax/jsPDF) for generating the PDFs
- [Tesseract.js](https://github.com/naptha/tesseract.js) for reading text from game screenshots
