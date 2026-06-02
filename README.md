# Dodge Blocks (PWA)

Um jogo simples em HTML5 Canvas: mova o bloco e desvie dos obstáculos que caem. Funciona offline como PWA.

## Como jogar
- Teclado: setas ← → ou A / D.
- Toque: toque/arraste no lado desejado.
- Ganhe pontos sobrevivendo mais tempo. Colidiu, acabou.

## Rodar localmente
1. Baixe/clonar este repositório.
2. Abra um servidor local (ex.: VS Code Live Server) para evitar bloqueios de SW.
3. Acesse [localhost](http://localhost:5500) ou similar.
4. A página registrará o Service Worker; recarregue uma vez para cache completo.

## Publicar no GitHub Pages
1. Crie um repositório e envie estes arquivos.
2. Em Settings → Pages, selecione a branch `main` e a pasta `/root` (ou `/docs` se desejar mover os arquivos).
3. Aguarde a URL ficar ativa.
4. Abra no celular e “Adicionar à tela inicial” para instalar como app.

## Estrutura
- index.html — markup e registro do SW.
- style.css — visual.
- script.js — lógica do jogo.
- manifest.webmanifest — metadados PWA.
- sw.js — cache offline.
- icons/ — ícones PWA (192 e 512 px).
