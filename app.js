(() => {
  "use strict";
  const L = window.VTLearning,
    $ = (s) => document.querySelector(s),
    $$ = (s) => [...document.querySelectorAll(s)];
  // Scene images travel with index.html, so missing asset folders cannot break them.
  let sceneImages = {};
  try { sceneImages = JSON.parse(document.getElementById("vt-image-data")?.textContent || "{}"); } catch {}
  const sceneAsset = (name) => sceneImages[name] || name;
  const KEY = "vintracker_aventura_v2";
  let state,
    activeMission = null,
    dispose = () => {},
    toastTimer,
    audioContext;
  try {
    state = L.clean(JSON.parse(localStorage.getItem(KEY)));
  } catch {
    state = L.blank();
  }
  const icons = {
    map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z"/><path d="M9 3v16M15 5v16"/>',
    book: '<path d="M12 5C8 2 4 3 3 4v16c3-2 6-1 9 1 3-2 6-3 9-1V4c-3-2-6-1-9 1Zm0 0v16"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
    volume:
      '<path d="m4 9 4 0 5-5v16l-5-5H4Z"/><path d="M17 8a6 6 0 0 1 0 8M20 5a10 10 0 0 1 0 14"/>',
    settings:
      '<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3" fill="var(--paper)"/><circle cx="16" cy="17" r="3" fill="var(--paper)"/>',
    heart: '<path d="M12 20 4 12C-2 5 7-1 12 6c5-7 14-1 8 6Z"/>',
    hand: '<path d="M8 12V5a2 2 0 0 1 4 0v6-3a2 2 0 0 1 4 0v4-1a2 2 0 0 1 4 0v4c0 4-2 7-6 7-3 0-5-2-7-4l-3-4c-2-3 1-4 3-2l2 2"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    house: '<path d="m2 10 10-8 10 8M5 9v12h14V9M10 21v-7h4v7"/>',
    search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 7 7"/>',
    atom: '<ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>',
    pin: '<path d="M19 9c0 5-7 12-7 12S5 14 5 9a7 7 0 0 1 14 0Z"/><circle cx="12" cy="9" r="2"/>',
    tool: '<path d="m14 5 5-3c3 4 0 9-4 9L6 21l-3-3 10-9c-2-3-1-5 1-7Z"/>',
    layers: '<path d="m3 7 9-5 9 5-9 5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',
    move: '<path d="M2 12h20M12 2v20m-4-4 4 4 4-4M8 6l4-4 4 4M6 8l-4 4 4 4m12-8 4 4-4 4"/>',
    route:
      '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h8a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h8"/>',
    people:
      '<circle cx="8" cy="7" r="3"/><path d="M2 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m1 4c4 0 5 3 5 7"/>',
    camera:
      '<path d="M3 7h4l2-3h6l2 3h4v14H3Z"/><circle cx="12" cy="13" r="4"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    play: '<path d="m7 3 14 9-14 9Z"/>',
    pause: '<path d="M8 4v16M16 4v16"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  };
  function icon(name) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.compass}</svg>`;
  }
  function hydrate(root = document) {
    root
      .querySelectorAll("[data-icon]")
      .forEach((e) => (e.innerHTML = icon(e.dataset.icon)));
  }
  function toast(text) {
    $("#toast").textContent = text;
    $("#toast").classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => $("#toast").classList.remove("visible"),
      4500,
    );
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch {
      toast(
        "No se pudo guardar el progreso. Podés seguir jugando, pero podría perderse al cerrar.",
      );
      return false;
    }
  }
  function sound() {
    if (!state.settings.sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      audioContext.resume();
      const t = audioContext.currentTime;
      [523, 659, 784].forEach((f, i) => {
        const o = audioContext.createOscillator(),
          g = audioContext.createGain();
        o.type = "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t + i * 0.09);
        g.gain.linearRampToValueAtTime(0.05, t + i * 0.09 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.3);
        o.connect(g).connect(audioContext.destination);
        o.start(t + i * 0.09);
        o.stop(t + i * 0.09 + 0.32);
      });
    } catch {}
  }
  function settings() {
    document.documentElement.classList.toggle(
      "reduced-motion",
      state.settings.motion,
    );
    document.documentElement.classList.toggle(
      "large-text",
      state.settings.large,
    );
    $("#motionToggle").checked = state.settings.motion;
    $("#textToggle").checked = state.settings.large;
    $("#soundBtn").setAttribute("aria-pressed", String(state.settings.sound));
    $("#soundBtn").setAttribute(
      "aria-label",
      state.settings.sound ? "Desactivar sonidos" : "Activar sonidos",
    );
  }
  function show(id) {
    dispose();
    dispose = () => {};
    window.speechSynthesis?.cancel();
    $$(".screen").forEach((e) => {
      e.hidden = e.id !== id;
    });
    $$(".main-nav button").forEach((e) =>
      e.classList.toggle("active", e.dataset.screen === id),
    );
    $$("dialog[open]").forEach((e) => e.close());
    if (id === "world") renderWorld();
    if (id === "notebook") renderNotebook();
    hydrate();
    window.scrollTo({ top: 0, behavior: "instant" });
    $("#main").focus({ preventScroll: true });
  }
  function renderWorld() {
    $("#worldProgress").textContent = `${state.completed.length} de 4 sellos`;
    $("#navCount").textContent = state.completed.length;
    $("#missionList").innerHTML = L.missions
      .map(
        (m) =>
          `<button class="mission-card ${m.color} ${state.completed.includes(m.id) ? "done" : ""}" data-mission="${m.id}"><span class="mission-icon">${icon(m.icon)}</span><span><small>${m.n} · ${m.verb}</small><strong>${m.short}</strong></span><span class="check">${state.completed.includes(m.id) ? "✓" : "›"}</span></button>`,
      )
      .join("");
    $$(".map-pin").forEach((e) =>
      e.classList.toggle("done", state.completed.includes(e.dataset.mission)),
    );
    try {
      $("#legacyNote").hidden = !localStorage.getItem("vintracker_aventura_v1");
    } catch {}
  }
  function renderNotebook() {
    $("#stamps").innerHTML = L.missions
      .map(
        (m) =>
          `<div class="stamp-card ${state.completed.includes(m.id) ? "earned" : ""}"><span>${icon(m.icon)}</span><strong>${m.seal}</strong><small>${state.completed.includes(m.id) ? "SELLO CONSEGUIDO" : "POR DESCUBRIR"}</small></div>`,
      )
      .join("");
    $("#notes").innerHTML = L.notes
      .map(
        (n) =>
          `<article class="note"><span>${icon(n.icon)}</span><p class="eyebrow">${n.tag}</p><h2>${n.title}</h2><p>${n.text}</p></article>`,
      )
      .join("");
  }
  function start(id) {
    const m = L.missions.find((m) => m.id === id);
    if (!m) return;
    show("mission");
    activeMission = id;
    $("#missionTitle").textContent = m.title;
    $("#missionIntro").textContent = m.desc;
    $("#missionNumber").textContent = `${m.n} / 04 · ${m.verb.toUpperCase()}`;
    ({ house: house, night: night, lab: lab, report: report })[id]();
    hydrate($("#missionBody"));
  }
  function meter(current, total, label) {
    return `<div class="progress-head"><span>${label}</span><strong id="activityCount">${current}/${total}</strong></div><div class="progress-track" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${current}"><div class="progress-fill" style="width:${(current / total) * 100}%"></div></div><button id="sealBtn" class="btn full" ${current === total ? "" : "disabled"}>Guardar mi sello ${icon("check")}</button>`;
  }
  function updateMeter(count, total) {
    $("#activityCount").textContent = `${count}/${total}`;
    $(".progress-fill").style.width = `${(count / total) * 100}%`;
    $("[role=progressbar]").setAttribute("aria-valuenow", count);
    $("#sealBtn").disabled = count !== total;
  }
  function finish() {
    if (!L.complete(state, activeMission)) return;
    save();
    renderWorld();
    sound();
    const m = L.missions.find((m) => m.id === activeMission);
    $("#completeTitle").textContent = m.seal;
    $("#completeText").textContent = {
      house:
        "Viste cómo algunas mejoras ayudan a reducir posibles refugios. La prevención se construye entre familias, comunidad y equipos de salud.",
      night:
        "Observar aporta pistas. Ante un hallazgo real, evitá tocarlo y pedí ayuda para consultar.",
      lab: "Distinguiste al insecto del parásito y exploraste cómo ocurre la transmisión. Informarse también ayuda a no discriminar.",
      report:
        "Practicaste un registro y su envío. Un reporte comunitario es un aviso para revisar: no confirma un insecto ni diagnostica Chagas.",
    }[activeMission];
    $("#nextMission").textContent =
      state.completed.length === 4 ? "Ver mi bitácora" : "Siguiente lugar →";
    $("#completeDialog").showModal();
  }
  function house() {
    let selected = null;
    const initial = state.house.length;
    $("#missionBody").innerHTML =
      `<div class="activity-layout"><div><div class="activity-scene ${initial === 4 ? "fixed" : ""}" id="houseScene"><img src="${sceneAsset("assets/casa-antes.webp")}" alt="Casa ilustrada con grietas, leña cercana y gallinero"><img src="${sceneAsset("assets/casa-despues.webp")}" class="house-after" alt="Misma casa con pared reparada y leña reubicada"><div class="scene-stamp">${icon("house")} Tu taller de prevención</div>${L.repairs.map((r, i) => `<button class="target ${state.house.includes(r.id) ? "done" : ""}" data-target="${r.id}" style="left:${r.x}%;top:${r.y}%" aria-label="Aplicar herramienta a ${r.label}"><span class="target-number">${state.house.includes(r.id) ? "✓" : i + 1}</span><span class="target-label">${r.label}</span></button>`).join("")}</div><p class="scene-note">La reparación y revisión reales corresponden a adultos. Si sospechás que hay vinchucas, pedí ayuda; no manipules insectos ni uses insecticidas.</p><div id="compareControl" class="reveal-control" ${initial === 4 ? "" : "hidden"}><label for="compareRange">Antes</label><input type="range" id="compareRange" min="0" max="100" value="100" aria-label="Comparar casa antes y después"><span>Después</span></div></div><aside class="activity-aside"><p class="eyebrow">MANOS A LA ESCENA</p><h2>Elegí una herramienta</h2><p>Tocala y después tocá su lugar en la casa. En computadora también podés arrastrarla.</p><div class="tool-grid">${L.repairs.map((r) => `<button class="tool ${state.house.includes(r.id) ? "used" : ""}" data-tool="${r.id}" draggable="true" aria-pressed="false">${icon(r.icon)}<span>${r.tool}</span></button>`).join("")}</div><div class="feedback" id="houseFeedback" role="status">${initial === 4 ? "Probá deslizar la comparación para ver la pared y la leña antes y después." : "Empezá por la pared: elegí el sellador y aplicalo en la grieta."}</div>${meter(initial, 4, "Mejoras exploradas")}</aside></div>`;
    const apply = (id) => {
      const r = L.repairs.find((x) => x.id === id);
      if (!selected) {
        $("#houseFeedback").textContent =
          `Para ${r.label.toLowerCase()}, primero elegí ${r.tool.toLowerCase()}.`;
        return;
      }
      if (selected !== id) {
        $("#houseFeedback").textContent =
          `Esa herramienta tiene otro destino. Para ${r.label.toLowerCase()}, elegí ${r.tool.toLowerCase()}.`;
        return;
      }
      L.add(state, "house", id);
      save();
      sound();
      const target = $(`[data-target="${id}"]`);
      target.classList.add("done");
      target.querySelector(".target-number").textContent = "✓";
      $(`[data-tool="${id}"]`).classList.add("used");
      $("#houseFeedback").textContent = r.explanation;
      updateMeter(state.house.length, 4);
      if (state.house.length === 4) {
        $("#houseScene").classList.add("fixed");
        $("#compareControl").hidden = false;
      }
      selected = null;
      $$("[data-tool]").forEach((e) => {
        e.classList.remove("selected");
        e.setAttribute("aria-pressed", "false");
      });
    };
    $$("[data-tool]").forEach((e) => {
      const select = () => {
        selected = e.dataset.tool;
        $$("[data-tool]").forEach((b) => {
          b.classList.toggle("selected", b === e);
          b.setAttribute("aria-pressed", String(b === e));
        });
        $("#houseFeedback").textContent =
          `${e.textContent.trim()} seleccionada. Tocá su destino en la escena.`;
      };
      e.addEventListener("click", select);
      e.addEventListener("dragstart", (ev) => {
        select();
        ev.dataTransfer.setData("text/plain", selected);
        ev.dataTransfer.effectAllowed = "copy";
      });
    });
    $$("[data-target]").forEach((e) => {
      e.addEventListener("click", () => apply(e.dataset.target));
      e.addEventListener("dragover", (ev) => {
        ev.preventDefault();
        e.classList.add("ready");
      });
      e.addEventListener("dragleave", () => e.classList.remove("ready"));
      e.addEventListener("drop", (ev) => {
        ev.preventDefault();
        e.classList.remove("ready");
        apply(e.dataset.target);
      });
    });
    $("#compareRange").addEventListener(
      "input",
      (e) => ($(".house-after").style.opacity = Number(e.target.value) / 100),
    );
    $("#sealBtn").onclick = finish;
  }
  function night() {
    $("#missionBody").innerHTML =
      `<div class="activity-layout"><div><div class="activity-scene night-scene" id="nightScene"><img src="${sceneAsset("assets/casa-antes.webp")}" alt="Escena de una vivienda para explorar con linterna virtual"><div class="night-mask" aria-hidden="true"></div><div class="scene-stamp">${icon("search")} Exploración virtual · Sin salir de casa</div>${L.clues.map((c, i) => `<button class="target ${state.night.includes(c.id) ? "done" : ""}" data-clue="${c.id}" style="left:${c.x}%;top:${c.y}%" aria-label="Observar ${c.label}"><span>${state.night.includes(c.id) ? "✓" : i + 1}</span><span class="target-label">${c.label}</span></button>`).join("")}</div><div class="night-controls"><span class="small">Mové el puntero o el dedo. Tocá las tres zonas.</span><button id="lightsBtn" class="btn secondary" aria-pressed="false">${icon("sun")} Encender luz</button></div><p class="scene-note">Los marcadores muestran lugares de observación, no insectos confirmados. En la vida real, no busques ni captures insectos sin ayuda adulta.</p></div><aside class="activity-aside"><p class="eyebrow">UNA MIRADA ATENTA</p><h2>Buscá posibles refugios</h2><p>La linterna te ayuda a mirar. También podés usar Tab y Enter, o encender la luz.</p><div class="clue-list">${L.clues.map((c, i) => `<div class="clue-item ${state.night.includes(c.id) ? "done" : ""}" data-clue-row="${c.id}"><span>${state.night.includes(c.id) ? "✓" : i + 1}</span><span>${c.label}</span></div>`).join("")}</div><div id="clueFeedback" class="feedback" role="status">Durante el día suelen esconderse. De noche, las vinchucas pueden salir para alimentarse.</div>${meter(state.night.length, 3, "Zonas observadas")}</aside></div>`;
    const scene = $("#nightScene");
    scene.addEventListener("pointermove", (ev) => {
      const r = scene.getBoundingClientRect();
      scene.style.setProperty(
        "--mx",
        `${((ev.clientX - r.left) / r.width) * 100}%`,
      );
      scene.style.setProperty(
        "--my",
        `${((ev.clientY - r.top) / r.height) * 100}%`,
      );
    });
    $$("[data-clue]").forEach((e) => {
      const clue = L.clues.find((c) => c.id === e.dataset.clue);
      e.addEventListener("focus", () => {
        scene.style.setProperty("--mx", `${clue.x}%`);
        scene.style.setProperty("--my", `${clue.y}%`);
      });
      e.addEventListener("click", () => {
        L.add(state, "night", clue.id);
        save();
        sound();
        e.classList.add("done");
        e.firstElementChild.textContent = "✓";
        const row = $(`[data-clue-row="${clue.id}"]`);
        row.classList.add("done");
        row.firstElementChild.textContent = "✓";
        $("#clueFeedback").textContent = clue.text;
        updateMeter(state.night.length, 3);
      });
    });
    $("#lightsBtn").onclick = (e) => {
      const on = scene.classList.toggle("lights-on");
      e.currentTarget.setAttribute("aria-pressed", String(on));
      e.currentTarget.innerHTML =
        icon("sun") + (on ? " Apagar luz" : " Encender luz");
    };
    $("#sealBtn").onclick = finish;
  }
  function lab() {
    let tab = "vector",
      step = 0,
      timer = null;
    const visitedCycle = new Set(state.labCycle);
    $("#missionBody").innerHTML =
      `<div class="lab-tabs" aria-label="Experimentos del laboratorio">${[
        ["vector", "La ruta del parásito"],
        ["congenital", "Embarazo y cuidados"],
        ["social", "La vida en comunidad"],
        ["cycle", "Conocer al insecto"],
      ]
        .map(
          ([id, t]) =>
            `<button data-lab="${id}" aria-pressed="${id === tab}" class="${id === tab ? "active" : ""}">${t}</button>`,
        )
        .join(
          "",
        )}</div><div class="activity-layout"><div class="lab-panel" id="labExperiment"></div><aside class="activity-aside lab-aside"><p class="eyebrow">EXPERIMENTÁ A TU RITMO</p><h2>Controlá la historia</h2><p>Mové el control o reproducí la secuencia. Después explorá las otras pestañas.</p><div class="lab-warning">El insecto y el parásito son distintos. La picadura por sí sola no explica la transmisión vectorial.</div><div class="route-progress">${["vector", "congenital", "social", "cycle"].map((id) => `<span data-route-progress="${id}" class="${state.lab.includes(id) ? "done" : ""}"></span>`).join("")}</div>${meter(state.lab.length, 4, "Experimentos explorados")}</aside></div>`;
    function stop() {
      clearInterval(timer);
      timer = null;
      const b = $("#playBtn");
      if (b) b.innerHTML = icon("play") + " Reproducir";
    }
    dispose = stop;
    function mark(id) {
      L.add(state, "lab", id);
      save();
      $(`[data-route-progress="${id}"]`).classList.add("done");
      updateMeter(state.lab.length, 4);
    }
    function drawStep() {
      const steps = L.routes[tab];
      $("#storyScene").dataset.stage = step;
      $$(".flow-step").forEach((e, i) => {
        e.classList.toggle("active", i === step);
        e.classList.toggle("passed", i < step);
      });
      $("#timelineTitle").textContent = steps[step][0];
      $("#timelineText").textContent = steps[step][1];
      $("#timelineRange").value = step;
      $("#timelineRange").setAttribute(
        "aria-valuetext",
        `${step + 1} de 4: ${steps[step][0]}`,
      );
      $("#stepLabel").textContent = `${step + 1}/4`;
      if (step === 3) {
        mark(tab);
        stop();
      }
    }
    function draw() {
      stop();
      $$("[data-lab]").forEach((e) => {
        e.classList.toggle("active", e.dataset.lab === tab);
        e.setAttribute("aria-pressed", String(e.dataset.lab === tab));
      });
      if (tab === "cycle") {
        $("#labExperiment").innerHTML =
          `<p class="eyebrow">RECURSO DEL MINISTERIO DE SALUD</p><h2 style="margin:10px 0 16px">Una vida en etapas</h2><div class="cycle-viewport"><img id="cycleImage" src="${sceneAsset("assets/ciclo-vinchuca-oficial.jpg")}" alt="Ciclo de vida de la vinchuca: huevo, etapas ninfales y adulto. Recurso del Ministerio de Salud argentino."></div><div class="zoom-row"><label for="cycleZoom">Ampliar</label><input id="cycleZoom" type="range" min="100" max="200" value="100" aria-label="Ampliar imagen del ciclo de vida"></div><div class="cycle-buttons">${["Huevos", "Ninfas", "Adultos"].map((t, i) => `<button data-cycle="${i}" class="${visitedCycle.has(i) ? "visited" : ""}" aria-pressed="false">${t}</button>`).join("")}</div><div class="timeline-copy"><h3 id="cycleTitle">Elegí una etapa para observar</h3><p id="cycleText">La imagen oficial permite comparar el desarrollo del insecto. No es una herramienta para confirmar un hallazgo.</p></div><p class="small" style="margin-top:12px">Fuente: Ministerio de Salud de la Nación. Ilustración conservada sin modificaciones.</p>`;
        $("#cycleZoom").oninput = (e) =>
          ($("#cycleImage").style.width = e.target.value + "%");
        $$("[data-cycle]").forEach(
          (b) =>
            (b.onclick = () => {
              const i = Number(b.dataset.cycle);
              visitedCycle.add(i);
              L.add(state, "labCycle", i);
              save();
              b.classList.add("visited");
              $$("[data-cycle]").forEach((e) => {
                e.classList.toggle("active", e === b);
                e.setAttribute("aria-pressed", String(e === b));
              });
              $("#cycleTitle").textContent = ["Huevos", "Ninfas", "Adultos"][i];
              $("#cycleText").textContent = [
                "De los huevos nacen las ninfas. Ver algo parecido a un huevo no confirma que haya vinchucas.",
                "Las ninfas todavía no tienen alas desarrolladas. También se alimentan de sangre y pueden participar de la transmisión si están infectadas.",
                "Los adultos tienen alas desarrolladas. La identificación corresponde a personal capacitado; no depende solo del color o del tamaño.",
              ][i];
              if (visitedCycle.size === 3) mark("cycle");
            }),
        );
        return;
      }
      const story = {
        vector: [
          "layers",
          "Heces infectadas",
          "heart",
          "Herida o mucosa",
          "El recorrido representa contacto con heces infectadas; no transmisión por el aire.",
        ],
        congenital: [
          "people",
          "Persona embarazada con Chagas",
          "heart",
          "Bebé",
          "La transmisión puede ocurrir. No todos los bebés adquieren la infección.",
        ],
        social: [
          "people",
          "Una persona con Chagas",
          "people",
          "Su comunidad",
          "Los abrazos, dar la mano y compartir el mate no transmiten Chagas.",
        ],
      }[tab];
      const visual = `<div class="story-scene route-${tab}" id="storyScene" data-stage="${step}" role="img" aria-label="Esquema educativo. ${story[4]}"><div class="story-world"><div class="story-object"><span>${icon(story[0])}</span><strong>${story[1]}</strong></div><div class="story-bridge" aria-hidden="true">${tab === "social" ? `<span class="story-heart">${icon("heart")}</span>` : '<span class="story-particle"></span>'}</div><div class="story-object"><span>${icon(story[2])}</span><strong>${story[3]}</strong></div></div><p>${story[4]}</p></div>`;
      const rows = L.routes[tab];
      $("#labExperiment").innerHTML =
        `<p class="eyebrow">SECUENCIA INTERACTIVA · ${tab === "vector" ? "TRANSMISIÓN VECTORIAL" : tab === "congenital" ? "TRANSMISIÓN CONGÉNITA" : "CONTACTO COTIDIANO"}</p>${visual}<div class="flow-display">${rows.map((r, i) => `<div class="flow-step"><span class="flow-orb">${i + 1}</span><strong>${r[0]}</strong></div>`).join("")}</div><div class="timeline-copy" aria-live="polite"><h3 id="timelineTitle"></h3><p id="timelineText"></p></div><div class="timeline-controls"><button class="btn" id="playBtn">${icon("play")} Reproducir</button><label for="timelineRange">Explorar</label><input id="timelineRange" type="range" min="0" max="3" value="0" aria-label="Etapa de la secuencia"><span id="stepLabel" class="small"></span></div><p class="small" style="margin-top:18px">${tab === "social" ? "No hay un paso del parásito a través del abrazo o del mate. Esta secuencia muestra la convivencia, no una cadena de transmisión." : "La secuencia es un esquema educativo. No permite saber si una persona tiene Chagas."}</p>`;
      drawStep();
      $("#timelineRange").oninput = (e) => {
        stop();
        step = Number(e.target.value);
        drawStep();
      };
      $("#playBtn").onclick = () => {
        if (timer) {
          stop();
          return;
        }
        if (step === 3) step = 0;
        drawStep();
        $("#playBtn").innerHTML = icon("pause") + " Pausar";
        timer = setInterval(() => {
          step = Math.min(3, step + 1);
          drawStep();
        }, 3400);
      };
    }
    $$("[data-lab]").forEach(
      (e) =>
        (e.onclick = () => {
          tab = e.dataset.lab;
          step = 0;
          draw();
        }),
    );
    $("#sealBtn").onclick = finish;
    draw();
  }
  function report() {
    let online = false;
    let timeout;
    dispose = () => clearTimeout(timeout);
    $("#missionBody").innerHTML =
      `<div class="phone-layout"><div class="phone"><div class="phone-header"><span>VinTracker · PRÁCTICA</span><span id="phoneNetwork">Sin conexión</span></div><div class="phone-content"><span class="sim-tag">SIMULACIÓN · NO ENVÍA DATOS</span><h2>Registro de un hallazgo</h2><div class="viewfinder ${state.report >= 2 ? "captured" : ""}" id="viewfinder"><img id="cameraScene" src="${sceneAsset("assets/casa-antes.webp")}" alt="Escena ilustrada usada para practicar un registro, sin insecto real"></div><div class="zoom-row"><label for="cameraZoom">Encuadre</label><input id="cameraZoom" type="range" min="100" max="160" value="100" aria-label="Ajustar encuadre de práctica"></div><div class="sim-place" id="simPlace">${icon("pin")} ${state.report >= 3 ? "Patio de la casa · Ubicación ficticia" : "Ubicación de práctica sin marcar"}</div><div id="simMessage" class="sim-message" role="status"></div><button id="simAction" class="btn full"></button></div></div><div class="report-info"><p class="eyebrow">APRENDER SIN DATOS REALES</p><h2>Practicá el primer paso</h2><p>En esta escena no se usa tu cámara ni tu ubicación. Primero avisamos a una persona adulta, después registramos el lugar.</p><div class="report-steps">${[
        ["Avisar", "No tocar ni aplastar el insecto."],
        ["Fotografiar", "Una imagen clara puede ayudar a la revisión."],
        ["Ubicar", "Anotar dónde ocurrió el hallazgo."],
        ["Guardar", "Sin red, el registro queda en el dispositivo."],
        ["Conectar", "Con Internet, puede enviarse al servidor."],
      ]
        .map(
          ([t, d], i) =>
            `<div class="report-step ${state.report > i ? "done" : ""}" data-report-step="${i}"><span>${state.report > i ? "✓" : i + 1}</span><div><strong>${t}</strong>${d}</div></div>`,
        )
        .join(
          "",
        )}</div><label class="network-toggle"><span><strong>Internet de práctica</strong><small class="small" style="display:block">Activá después de guardar el registro.</small></span><input type="checkbox" id="simInternet" aria-label="Activar Internet de práctica"></label><p class="small">En un hallazgo real, pedí ayuda a una persona adulta y consultá con el equipo de salud. La revisión del insecto y el diagnóstico de una persona son procesos distintos.</p>${meter(state.report, 5, "Pasos practicados")}</div></div>`;
    const messages = [
      "Primero, avisá a una persona adulta. En esta práctica solo simulamos ese aviso.",
      "Ajustá el encuadre de la escena y guardá una foto de práctica.",
      "Foto de práctica lista. Marcá el patio como lugar del hallazgo.",
      "El registro ficticio está completo. Probá guardarlo sin Internet.",
      "Guardado en este dispositivo de práctica. Todavía no fue recibido por ningún servidor.",
      "Simulación completada: el registro aparece como recibido. No se envió ningún reporte real.",
    ];
    const labels = [
      "Simular aviso a un adulto",
      "Tomar foto de práctica",
      "Marcar el patio",
      "Guardar sin conexión",
      "Esperando conexión",
      "Práctica completada",
    ];
    function draw() {
      const n = state.report;
      $("#simMessage").textContent = messages[n];
      $("#simMessage").classList.toggle("sent", n === 5);
      $("#simAction").textContent = labels[n];
      $("#simAction").disabled = n >= 4;
      $("#viewfinder").classList.toggle("captured", n >= 2);
      $("#simPlace").innerHTML =
        icon("pin") +
        (n >= 3
          ? " Patio de la casa · Ubicación ficticia"
          : " Ubicación de práctica sin marcar");
      $$("[data-report-step]").forEach((e, i) => {
        e.classList.toggle("done", n > i);
        e.firstElementChild.textContent = n > i ? "✓" : i + 1;
      });
      updateMeter(n, 5);
      $("#simInternet").disabled = n < 4 || n === 5;
      if (n === 5) {
        online = true;
        $("#simInternet").checked = true;
        $("#phoneNetwork").textContent = "Recibido · práctica";
      }
    }
    $("#cameraZoom").oninput = (e) =>
      ($("#cameraScene").style.transform =
        `scale(${Number(e.target.value) / 100})`);
    $("#simAction").onclick = () => {
      if (state.report < 4) {
        state.report++;
        save();
        sound();
        draw();
      }
    };
    $("#simInternet").onchange = (e) => {
      online = e.target.checked;
      $("#phoneNetwork").textContent = online ? "Con conexión" : "Sin conexión";
      if (online && state.report === 4) {
        $("#simMessage").textContent = "Simulando el envío…";
        timeout = setTimeout(() => {
          if (!online) return;
          state.report = 5;
          save();
          sound();
          draw();
        }, 1200);
      } else {
        clearTimeout(timeout);
        draw();
      }
    };
    $("#sealBtn").onclick = finish;
    draw();
  }
  function offlineInit() {
    const status = $("#offlineStatus");
    let downloaded = false;
    const label = (t) => {
      status.innerHTML = icon("download") + " " + t;
    };
    const ready = () => {
      downloaded = true;
      label(
        navigator.onLine
          ? "Lista para explorar sin conexión"
          : "Sin conexión · Aventura disponible",
      );
    };
    const failed = () =>
      label("La descarga offline no se completó. Reabrí con Internet.");
    const activated = (worker) =>
      new Promise((resolve, reject) => {
        if (!worker) {
          reject(new Error("No worker"));
          return;
        }
        const check = () => {
          if (worker.state === "activated") {
            worker.removeEventListener("statechange", check);
            resolve();
          } else if (worker.state === "redundant") {
            worker.removeEventListener("statechange", check);
            reject(new Error("Install failed"));
          }
        };
        worker.addEventListener("statechange", check);
        check();
      });
    if (!("serviceWorker" in navigator)) {
      label("Progreso local · Descarga offline no disponible");
      return;
    }
    navigator.serviceWorker
      .register("./sw.js", { updateViaCache: "none" })
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          downloaded = false;
          label("Descargando la actualización…");
          activated(reg.installing).then(ready).catch(failed);
        });
        return activated(reg.installing || reg.waiting || reg.active);
      })
      .then(ready)
      .catch(failed);
    window.addEventListener("offline", () =>
      label(
        downloaded
          ? "Sin conexión · Aventura disponible"
          : "Sin conexión · Descarga pendiente",
      ),
    );
    window.addEventListener("online", () =>
      label(
        downloaded
          ? "Lista para explorar sin conexión"
          : "Con conexión · Reabrí para completar la descarga",
      ),
    );
  }

  document.addEventListener("click", (e) => {
    const mission = e.target.closest("[data-mission]");
    if (mission) {
      start(mission.dataset.mission);
      return;
    }
    const nav = e.target.closest("[data-screen]");
    if (nav) {
      show(nav.dataset.screen);
      return;
    }
    const close = e.target.closest("[data-close]");
    if (close) close.closest("dialog")?.close();
  });
  $("#soundBtn").onclick = () => {
    state.settings.sound = !state.settings.sound;
    settings();
    save();
    sound();
  };
  $("#settingsBtn").onclick = () => $("#settingsDialog").showModal();
  $("#howBtn").onclick = () => $("#helpDialog").showModal();
  $("#motionToggle").onchange = (e) => {
    state.settings.motion = e.target.checked;
    settings();
    save();
  };
  $("#textToggle").onchange = (e) => {
    state.settings.large = e.target.checked;
    settings();
    save();
  };
  $("#resetBtn").onclick = () => ($("#resetConfirm").hidden = false);
  $("#cancelReset").onclick = () => ($("#resetConfirm").hidden = true);
  $("#confirmReset").onclick = () => {
    const preferences = state.settings;
    state = L.blank();
    state.settings = preferences;
    save();
    $("#resetConfirm").hidden = true;
    show("world");
    toast("Expedición reiniciada.");
  };
  $("#nextMission").onclick = () => {
    const next = L.missions.find((m) => !state.completed.includes(m.id));
    if (next) start(next.id);
    else show("notebook");
  };
  $("#readBtn").onclick = () => {
    if (!("speechSynthesis" in window)) {
      toast(
        "Este dispositivo no tiene lectura en voz alta. Las instrucciones están en pantalla.",
      );
      return;
    }
    window.speechSynthesis.cancel();
    const text = [
      $("#missionTitle").textContent,
      $("#missionIntro").textContent,
      ...$$(
        "#missionBody .activity-aside p, #missionBody .feedback, #missionBody .timeline-copy, #missionBody .report-info>p",
      ),
    ]
      .map((e) => (typeof e === "string" ? e : e.textContent))
      .join(". ");
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-AR";
    u.rate = 0.93;
    u.onerror = () =>
      toast(
        "No se pudo reproducir la voz. Podés leer las instrucciones en pantalla.",
      );
    window.speechSynthesis.speak(u);
  };
  settings();
  renderWorld();
  hydrate();
  offlineInit();
})();
