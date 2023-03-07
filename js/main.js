console.log("Loading")

var width = 500;
var height = 500;

var selector_boxes = []

function getColor(){
  return "hsl(" + 360 * Math.random() + ',' +
    (25 + 70 * Math.random()) + '%,' +
    (85 + 10 * Math.random()) + '%)'
}

function delete_box(id) {
  let i = selector_boxes.indexOf(id);
  console.log("Deleting Box", i, selector_boxes[i]);
  document.getElementById(`${id}-container`).remove();
  selector_box = document.getElementById(id);
  selector_box.remove();
  selector_boxes.splice(i, 1);

  console.log("Selector Boxes", selector_boxes);
}

function add_settings(id) {
  let sb = document.createElement("div")
  sb.id = `${id}-container`
  sb.className += "setting"
  sb.innerHTML = `
    <div class="sub-setting">
      <span id="${id + 'segment'}">Divisions: 2:2</span>
      <span id="${id + 'position'}">Position: ??:??</span>
      <span id="${id + 'strength'}">Strength: ??</span>
    </div>
    <div class="options">
      <button onclick="delete_box('${id}')">🗑️</button>
<!--      <button>▲</button>-->
    </div>
`

  sb.style.background = document.getElementById(id).style.background

  document.getElementById('settings').appendChild(sb)
}

function get_box_info(id) {
  let selector_box = document.getElementById(id);
  let fixed_top = parseInt(selector_box.style.top.replace("px", ""));
  fixed_top += selector_boxes.indexOf(id) * 250;
  return [
    selector_box.getAttribute('data-x') || 0,
    selector_box.getAttribute('data-y') || 0,
    parseInt(selector_box.style.height.replace("px", "")),
    parseInt(selector_box.style.width.replace("px", "")),
    parseFloat(selector_box.style.opacity)
  ]
}

function adjust_information(id) {
  if(document.getElementById(id) === null) {
    return
  }

  let [x, y, w, h, str] = get_box_info(id);
  console.log("Box Changed", [x, y, w, h]);
  let s_h = Math.trunc((width / w) * 100) / 100;
  let s_v = Math.trunc((height / h) * 100) / 100;
  let p_h = Math.trunc(((x / height) * s_h) * 100) / 100;
  let p_v = Math.trunc(((y / width) * s_v) * 100) / 100;

  document.getElementById(id + 'segment').innerHTML = `Divisions: ${s_h}:${s_v}`
  document.getElementById(id + 'position').innerHTML = `Position: ${p_h}:${p_v}`
  document.getElementById(id + 'strength').innerHTML = `Weight: ${str}`

  document.getElementById(`info-${id}`).innerHTML = `[${s_h}:${s_v}] [${p_h}:${p_v}] [${str}]`

  updateBoxValues()
}

function updateBoxValues() {
  let div = document.getElementById("div");
  let pos = document.getElementById("pos");
  let str = document.getElementById("str");
  let steps = document.getElementById("steps");
  let _div = [];
  let _pos = [];
  let _str = [];
  selector_boxes.forEach(id => {
    let [x, y, w, h, str] = get_box_info(id);
    let s_h = Math.trunc((width / w) * 100) / 100;
    let s_v = Math.trunc((height / h) * 100) / 100;
    let p_h = Math.trunc(((x / height) * s_h) * 100) / 100;
    let p_v = Math.trunc(((y / width) * s_v) * 100) / 100;
    _div.push(`${s_h}:${s_v}`);
    _pos.push(`${p_h}:${p_v}`);
    _str.push(str);
  })
  div.value = _div.join(", ");
  pos.value = _pos.join(", ");
  str.value = _str.join(", ");


  // divisions=1:1,2:2,2:1 positions=0:0,0.4:0.4,1:0 weights=0.2,0.8,0.8 end at step=20
  document.getElementById("egp").value = `divisions=${_div.join(",")} positions=${_pos.join(",")} weights=${_str.join(",")} end at step=${steps.value}`
}

function add_selector_box() {
  const bb = document.getElementById("bb");
  let selector_box = document.createElement("div")
  selector_box.id = `selector-${selector_boxes.length}`
  selector_box.style.height = `${height / 2}px`;
  selector_box.style.width = `${width / 2}px`;

  selector_box.style.background = getColor();
  selector_box.style.top = `${bb.getBoundingClientRect().top}px`;
  selector_box.style.left = `${bb.getBoundingClientRect().left}px`;
  selector_box.style.opacity = "0.5";

  selector_box.className += " selector-box";

  selector_box.innerHTML = `
        <span id="info-${selector_box.id}" class="info"></span>
    `

  selector_box.addEventListener('wheel', (e) => {
    let current_opacity = parseFloat(selector_box.style.opacity);
    let delta  = e.deltaY;
    if (delta > 0) {
      console.log("Mouse Scroll Down")
      current_opacity -= 0.05
    } else {
      console.log("Mouse Scroll Up")
      current_opacity += 0.05
    }
    console.log("Setting current opacity to", current_opacity)
    selector_box.style.opacity = current_opacity;
    adjust_information(selector_box.id)
  })


  function dragMoveListener (event) {
    var target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
      target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    adjust_information(selector_box.id);
  }


  interact(`#${selector_box.id}`)
    .draggable({
      onmove: dragMoveListener
    })
    .resizable({
      edges: { left: true, right: true, bottom: true, top: true }
    })
    .on('resizemove', function (event) {
      var target = event.target;
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

      // update the element's style
      target.style.width  = event.rect.width + 'px';
      target.style.height = event.rect.height + 'px';

      // translate when resizing from top or left edges
      x += event.deltaRect.left;
      y += event.deltaRect.top;

      target.style.webkitTransform = target.style.transform =
        'translate(' + x + 'px,' + y + 'px)';

      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
      adjust_information(selector_box.id);
    });

  bb.appendChild(selector_box);
  add_settings(selector_box.id);
  adjust_information(selector_box.id)
  selector_boxes.push(selector_box.id);
}

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});


async function updateBackground() {
  let bgref = document.getElementById("bg-ref");
  console.log("Background File", bgref.files);
  let data = await toBase64(bgref.files[0]);
  console.log(data);
  document.getElementById("bb").style.backgroundImage = `url(${data})`;
}

function copytoclipboard() {
  let egpText = document.getElementById("egp").value;
  console.log("Copying", egpText);
  navigator.clipboard.writeText(egpText).then(function() {
    document.getElementById("copyToClipboard").innerHTML = "Copied!";
    setTimeout(() => {
      document.getElementById("copyToClipboard").innerHTML = "✂";
    }, 3000)
  });
}
