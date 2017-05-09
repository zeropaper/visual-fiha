module.exports = `
<ul>
  <li>
    <label>ctx.</label>
    (for more look at <a href="https://simon.html5.org/dump/html5-canvas-cheat-sheet.html" target="_blank">Canvas Cheat Sheet</a>)
    <ul>
      <li class="ctx color fillStyle">
        <span class="property">fillStyle</span> [= 'hsla(175, 50, 60, 0.1)']
      </li>
      <li class="ctx color strokeStyle">
        <span class="property">strokeStyle</span> [= 'hsla(175, 50, 60, 0.1)']
      </li>
      <li class="ctx line path lineWidth">
        <span class="property">lineWidth</span> (= 1)
      </li>
      <li class="ctx line path shape position moveTo">
        <span class="function">moveTo</span>(x, y)
      </li>
      <li class="ctx line path shape beginPath">
        <span class="function">beginPath</span>()
      </li>
      <li class="ctx line path shape position lineTo">
        <span class="function">lineTo</span>(x, y)
      </li>
      <li class="ctx line path shape closePath">
        <span class="function">closePath</span>()
      </li>
      <li class="ctx line path shpe stroke">
        <span class="function">stroke</span>()
      </li>
      <li class="ctx line path shpe fill">
        <span class="function">fill</span>()
      </li>
      <li class="ctx line path arc">
        <span class="function">arc</span>(x, y, radius[, startAngle[, endAngle[, anticlockwise]]])
      </li>
      <li class="ctx line path rect">
        <span class="function">rect</span>(x, y, width, height)
      </li>
      <li class="ctx text rect fillRect">
        <span class="function">fillRect</span>(x, y, width, height)
      </li>
      <li class="ctx text rect line path strokeRect">
        <span class="function">strokeRect</span>(x, y, width, height)
      </li>
      <li class="ctx text fillText">
        <span class="function">fillText</span>(text, x, y[, maxWidth])
      </li>
      <li class="ctx text line path strokeText">
        <span class="function">strokeText</span>(text, x, y[, maxWidth])
      </li>
    </ul>
  </li>
  <li>
    <label>Global</label>
    <ul>
      <li class="utils txt text">
        <span class="function">txt</span>(text = '', x = width / 2, h = width / 2)
      </li>
      <li class="utils dot text">
        <span class="function">dot</span>(x = width / 2, h = width / 2, r = 10, start = 0, end = Math.PI * 2)
      </li>
      <li class="utils shape circle text">
        <span class="function">circle</span>(x = width / 2, h = width / 2, r = 10, start = 0, end = Math.PI * 2)
      </li>
      <li class="utils line text">
        <span class="function">line</span>([x, y])
      </li>
      <li class="utils shape polygone text">
        <span class="function">polygone</span>(x = width / 2, h = width / 2, size = 30, sides = 3)
      </li>
      <li class="utils position grid">
        <span class="function">grid</span>(width, height, itemsCount, rows, process = function(x,y))
      </li>
      <li class="utils position distribute">
        <span class="function">distribute</span>(x, y, itemsCount, r, tilt = 0, process = function(x,y))
      </li>
      <li class="utils math random">
        <span class="function">random</span>(multi = 100)
      </li>
      <li class="utils math between">
        <span class="function">between</span>(val, min, max)
      </li>
      <li class="utils math midiMinMax midi">
        <span class="function">midiMinMax</span>(val, min, max)
      </li>
      <li class="utils math midi2Rad angle midi">
        <span class="function">midi2Rad</span>(val)
      </li>
      <li class="utils midi2Prct percent midi">
        <span class="function">midi2Prct</span>(val)
      </li>
    </ul>
  </li>
</ul>
`;