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
    fixed_top,
    parseInt(selector_box.style.left.replace("px", "")),
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
  document.getElementById(id + 'strength').innerHTML = `Strength: ${str}`

  document.getElementById(`info-${id}`).innerHTML = `[${s_h}:${s_v}] [${p_h}:${p_v}] [${str}]`

  updateBoxValues()
}

function updateBoxValues() {
  let div = document.getElementById("div");
  let pos = document.getElementById("pos");
  let str = document.getElementById("str");
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
}

function add_selector_box() {
  const bb = document.getElementById("bb");
  let selector_box = document.createElement("div")
  selector_box.id = `selector-${selector_boxes.length}`
  selector_box.style.height = `${height / 2}px`;
  selector_box.style.width = `${width / 2}px`;

  selector_box.style.background = getColor();
  selector_box.style.top = `-${selector_boxes.length * 250}px`;
  selector_box.style.left = `0px`;
  selector_box.style.opacity = "0.5";

  selector_box.className += " selector-box";
  selector_box.draggable = true;

  selector_box.innerHTML = `
        <span id="info-${selector_box.id}" class="info"></span>
    `

  let initial_drag_x = 0;
  let initial_drag_y = 0;
  function get_box_coords() {
    return [
      parseInt(selector_box.style.top.replace("px", "")),
      parseInt(selector_box.style.left.replace("px", ""))
    ]
  }

  selector_box.addEventListener('dragstart', (e) => {
    initial_drag_x = e.x;
    initial_drag_y = e.y;
  });
  selector_box.addEventListener('dragend', (e) => {
    let [box_x, box_y] = get_box_coords();
    selector_box.style.top = `${box_x - initial_drag_y + e.y}px`;
    selector_box.style.left = `${box_y - initial_drag_x + e.x}px`;
    adjust_information(selector_box.id);
  })
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

  new ResizeObserver((e) => {
    adjust_information(selector_box.id);
  }).observe(selector_box)

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
