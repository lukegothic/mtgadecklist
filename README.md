<h1>AutoMagic Arena Decklists</h1>
Javascript plugin that automatically converts a MTGA decklist into a fancier version of it.

<h2>Version</h2>
Not-even-alpha

<h2>Demo</h2>
<a href="https://lukegothic.github.io/mtgadecklist/">Demo</a>

<h2>How to use</h2>
<ol>
  <li>Create a div node in your html document</li>
  <li>Add the attribute data-decklist="custom" to the node</li>
  <li>Copy the MTGA decklist inside the node</li>
  <li>Include a script tag at the end of the html body to use the lib <pre><script src="https://lukegothic.github.io/mtgadecklist/mtgadecklist.js"></script></pre>
  <li>???</li>
  <li>Magic!</li>
</ol>

<h2>TO-DO</h2>
<ul>
  <li>Deck header with deck name, colors and total cards</li>
  <li>Get decklist from remote source (mtggoldfish,tappedout...etc.)</li>
  <li>Better sorting (should sort each group by card type, cmc, color, name)</li>
  <li>Button to export decklist to MTGA</li>
  <li>Sideboard cards</li>
  <li>Settings
    <ul>
      <li>Show header (yes|no)</li>
      <li>Show footer (yes|no)</li>
      <li>Theme (light|dark|custom)</li>
      <li>Show cards as images (yes|no)</li>
      <li>Layout (single|multiple columns)</li>
      <li>Card grouping (ungrouped|light grouping (Creatures, Spells, Lands)|full (All card types))</li>
      <li>Position of the card preview (inside|aside|none)</li>
    </ul>
  </li>
</ul>
