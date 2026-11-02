# Renando Cinematic Portfolio (free template)

A black-and-red film portfolio you build by pasting **one prompt** into an AI coding agent. You don't need to code. Template gratis: tempel satu prompt ke AI coding agent, tanpa perlu coding.

![Preview](https://www.duingzforge.site/kit/portfolio/Asset/img/renando-portrait.png)

Live example: https://renando.duingzcreative.site

## How to use (simple)

1. Open an empty folder in an AI coding agent (Codex, Claude Code, or Cursor).
2. Copy everything in [`prompt.md`](prompt.md), paste it into the agent, and write what you want underneath (your name, photo, projects, accent colour).
3. Wait. The agent builds the site and tells you its address, usually `http://localhost:4173`. Open it in Chrome.
4. Happy with it? Upload `index.html` and the `Asset/` folder to any static host.

Step-by-step guides: [Indonesia](https://www.duingzforge.site/learn/portfolio-sinematik-ai-copy-prompt) · [English](https://www.duingzforge.site/learn/portfolio-sinematik-ai-copy-prompt?lang=en)

> **Note / Catatan:** coding agents like Codex (ChatGPT) and Claude Code usually need a paid plan or API credit. The free ChatGPT can't build and run this project. Agent seperti ini umumnya butuh paket berbayar; ChatGPT gratis tidak cukup. Check each service's pricing page.

## The "built by a swarm of agents" animation

After your site is built, the agent plays an animation **once**: dozens of named cursors rebuild your page from blank while it scrolls down by itself (about one to two minutes), then it goes back to normal. You don't have to watch localhost while the site is being built; it plays at the end.

- If your agent has a browser, it plays it for you. Watch that window (start screen recording first if you want a video).
- If it doesn't: open your site in Chrome, press **F12**, open **Console**, paste the one line from section 10 of `prompt.md`, press Enter. If Chrome asks, type `allow pasting`.
- No extension needed. Nothing is added to your site's code.

## Credits

The animation uses Swarm Rebuild by DhvanilPatel, inspired by Swarm by Joel Califa.

## License

You may use and modify the code for your own portfolio, including commercial use. You may not resell it or share it as a template, theme, prompt pack or course material. The photos, certificates, brand logos and personal data in the example belong to Renando and may not be reused. See [LICENSE](LICENSE).
