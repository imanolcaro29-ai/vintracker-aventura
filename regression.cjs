/* Deterministic DOM and worker simulations. These do NOT render a real browser. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { JSDOM, VirtualConsole } = require("jsdom");
const root = path.resolve(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const L = require("../learning.js");
const KEY = "vintracker_aventura_v2";

test("Embedded scenery retains the complete original image bytes", () => {
  const dom = new JSDOM(read("index.html"));
  const d = dom.window.document;
  const images = JSON.parse(d.querySelector("#vt-image-data").textContent);
  images["assets/comunidad.webp"] = d.querySelector(".world-image").getAttribute("src");
  assert.equal(Object.keys(images).length, 4);
  for (const [name, data] of Object.entries(images)) {
    assert.match(data, /^data:image\/(webp|jpeg);base64,/);
    assert.deepEqual(Buffer.from(data.split(",")[1], "base64"), fs.readFileSync(path.join(root, name)));
  }
  dom.window.close();
});

test("All four scenes load their pictures without external assets folder requests", () => {
  const a = app();
  for (const mission of ["house", "night", "lab", "report"]) {
    a.click(`[data-mission="${mission}"]`);
    if (mission === "lab") a.click('[data-lab="cycle"]');
    const images = [...a.d.querySelectorAll("#missionBody img,.world-image")];
    assert.ok(images.length >= 2);
    for (const image of images) assert.match(image.getAttribute("src"), /^data:image\//);
    a.click(".back-btn");
  }
  assert.deepEqual(a.requests, []);
  a.close();
});

function app(seed = {}, options = {}) {
  const errors = [],
    requests = [],
    sounds = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (e) => errors.push(e.message));
  const dom = new JSDOM(read("index.html"), {
    url: "https://aventura.example/",
    runScripts: "outside-only",
    virtualConsole,
  });
  const w = dom.window,
    d = w.document;
  w.scrollTo = () => {};
  w.HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  w.addEventListener("error", (e) => errors.push(e.message));
  for (const [key, value] of Object.entries(seed))
    w.localStorage.setItem(key, value);
  if (options.blockStorage)
    w.Storage.prototype.setItem = () => {
      throw new Error("Quota exceeded");
    };
  if (options.serviceWorker)
    Object.defineProperty(w.navigator, "serviceWorker", {
      value: options.serviceWorker,
    });
  w.fetch = (...a) => {
    requests.push(a);
    throw new Error("Unexpected network request");
  };
  w.navigator.geolocation = { getCurrentPosition: () => requests.push("GPS") };
  w.navigator.mediaDevices = { getUserMedia: () => requests.push("camera") };
  w.AudioContext = function () {
    sounds.push("context");
    throw new Error("Audio device not simulated");
  };
  let now = 0,
    next = 0;
  const jobs = new Map();
  w.setTimeout = (fn, ms = 0) => {
    jobs.set(++next, { fn, due: now + ms, every: 0 });
    return next;
  };
  w.setInterval = (fn, ms) => {
    jobs.set(++next, { fn, due: now + ms, every: ms });
    return next;
  };
  w.clearTimeout = w.clearInterval = (id) => jobs.delete(id);
  const tick = (ms) => {
    const end = now + ms;
    for (let guard = 0; guard < 1000; guard++) {
      const item = [...jobs]
        .sort((a, b) => a[1].due - b[1].due)
        .find(([, j]) => j.due <= end);
      if (!item) break;
      const [id, j] = item;
      now = j.due;
      if (j.every) j.due += j.every;
      else jobs.delete(id);
      j.fn();
    }
    now = end;
  };
  w.eval(read("learning.js"));
  w.eval(read("app.js"));
  const $ = (s) => {
    const e = d.querySelector(s);
    assert.ok(e, `Missing ${s}`);
    return e;
  };
  const click = (s) => $(s).click();
  const input = (s, value) => {
    const e = $(s);
    e.value = value;
    e.dispatchEvent(new w.Event("input", { bubbles: true }));
  };
  const check = (s, value) => {
    const e = $(s);
    e.checked = value;
    e.dispatchEvent(new w.Event("change", { bubbles: true }));
  };
  const store = () =>
    Object.fromEntries(
      Array.from({ length: w.localStorage.length }, (_, i) => {
        const key = w.localStorage.key(i);
        return [key, w.localStorage.getItem(key)];
      }),
    );
  const progress = () => JSON.parse(w.localStorage.getItem(KEY) || "{}");
  const close = () => {
    assert.deepEqual(errors, [], "Uncaught application errors");
    dom.window.close();
  };
  return {
    w,
    d,
    $,
    click,
    input,
    check,
    tick,
    store,
    progress,
    close,
    errors,
    requests,
    sounds,
    jobs,
  };
}

function repair(a, id) {
  a.click(`[data-tool="${id}"]`);
  a.click(`[data-target="${id}"]`);
}
function exploreLab(a) {
  for (const id of ["vector", "congenital", "social"]) {
    a.click(`[data-lab="${id}"]`);
    a.input("#timelineRange", 3);
  }
  a.click('[data-lab="cycle"]');
  for (const n of [0, 1, 2]) a.click(`[data-cycle="${n}"]`);
}
function fillReport(a) {
  for (let n = 0; n < 4; n++) a.click("#simAction");
  a.check("#simInternet", true);
  a.tick(1200);
}

test("Saved state is sanitized, deduplicated and detached from its input", () => {
  const raw = {
    house: ["wall", "wall", "bad"],
    night: "wrong",
    labCycle: [0, 0, 9],
    report: 99,
    completed: ["house", "report", "other"],
    settings: { sound: "true", large: true },
  };
  const s = L.clean(raw);
  assert.deepEqual(s.house, ["wall"]);
  assert.deepEqual(s.night, []);
  assert.deepEqual(s.labCycle, [0]);
  assert.equal(s.report, 5);
  assert.deepEqual(s.completed, ["report"]);
  assert.equal(s.settings.sound, false);
  assert.equal(s.settings.large, true);
  raw.house.push("roof");
  assert.deepEqual(s.house, ["wall"]);
  for (const invalid of [undefined, null, "text", 3])
    assert.deepEqual(L.clean(invalid), L.blank());
});

test("Every seal requires its own finished activity and can be earned only once", () => {
  const s = L.blank();
  for (const m of L.missions) assert.equal(L.complete(s, m.id), false);
  s.house = L.repairs.map((x) => x.id);
  s.night = L.clues.map((x) => x.id);
  s.lab = ["vector", "congenital", "social", "cycle"];
  s.report = 5;
  for (const m of L.missions) {
    assert.equal(L.complete(s, m.id), true);
    L.complete(s, m.id);
  }
  assert.equal(s.completed.length, 4);
  assert.equal(L.complete(s, "unknown"), false);
});

test("Map, notebook and instructions are accessible before completing a mission", () => {
  const a = app();
  assert.equal(a.d.querySelectorAll(".mission-card").length, 4);
  a.click('.main-nav [data-screen="notebook"]');
  assert.equal(a.$("#notebook").hidden, false);
  assert.equal(a.d.querySelectorAll(".note").length, 6);
  a.click(".brand");
  a.click("#howBtn");
  assert.equal(a.$("#helpDialog").open, true);
  a.click("#helpDialog .btn");
  assert.equal(a.$("#helpDialog").open, false);
  assert.deepEqual(a.sounds, []);
  a.close();
});

test("House: wrong tool, repeated action, reload, remaining repairs and comparison", () => {
  let a = app();
  a.click('[data-mission="house"]');
  assert.equal(a.$("#sealBtn").disabled, true);
  a.click('[data-target="wall"]');
  assert.match(a.$("#houseFeedback").textContent, /primero elegí/);
  a.click('[data-tool="roof"]');
  a.click('[data-target="wall"]');
  assert.equal(a.$("#activityCount").textContent, "0/4");
  repair(a, "wall");
  repair(a, "wood");
  repair(a, "wall");
  assert.deepEqual(a.progress().house, ["wall", "wood"]);
  const saved = a.store();
  a.close();
  a = app(saved);
  a.click('[data-mission="house"]');
  assert.equal(a.$("#activityCount").textContent, "2/4");
  repair(a, "roof");
  repair(a, "coop");
  assert.equal(a.$("#sealBtn").disabled, false);
  assert.equal(a.$("#compareControl").hidden, false);
  a.input("#compareRange", 0);
  assert.equal(a.$(".house-after").style.opacity, "0");
  a.input("#compareRange", 100);
  assert.equal(a.$(".house-after").style.opacity, "1");
  a.click("#sealBtn");
  assert.deepEqual(a.progress().completed, ["house"]);
  assert.equal(a.$("#completeDialog").open, true);
  a.close();
});

test("House: the drag/drop event path applies the selected tool", () => {
  const a = app();
  a.click('[data-mission="house"]');
  const drag = new a.w.Event("dragstart", { bubbles: true });
  Object.defineProperty(drag, "dataTransfer", {
    value: { setData() {}, effectAllowed: "" },
  });
  a.$('[data-tool="wall"]').dispatchEvent(drag);
  a.$('[data-target="wall"]').dispatchEvent(
    new a.w.Event("drop", { bubbles: true, cancelable: true }),
  );
  assert.deepEqual(a.progress().house, ["wall"]);
  a.close();
});

test("Night: focus moves the light, the light switch works and clues are deduplicated", () => {
  const a = app();
  a.click('[data-mission="night"]');
  a.$('[data-clue="wall"]').focus();
  assert.equal(a.$("#nightScene").style.getPropertyValue("--mx"), "27%");
  a.click("#lightsBtn");
  assert.equal(a.$("#lightsBtn").getAttribute("aria-pressed"), "true");
  assert.ok(a.$("#nightScene").classList.contains("lights-on"));
  a.click("#lightsBtn");
  assert.equal(a.$("#lightsBtn").getAttribute("aria-pressed"), "false");
  for (const id of ["wall", "wall", "wood", "coop"])
    a.click(`[data-clue="${id}"]`);
  assert.equal(a.progress().night.length, 3);
  assert.equal(a.$("#sealBtn").disabled, false);
  a.close();
});

test("Lab: playback, pause, restart, scrubbing and leaving dispose the timer", () => {
  const a = app();
  a.click('[data-mission="lab"]');
  a.click("#playBtn");
  a.tick(3400);
  assert.equal(a.$("#stepLabel").textContent, "2/4");
  a.click("#playBtn");
  a.tick(10000);
  assert.equal(a.$("#stepLabel").textContent, "2/4");
  a.input("#timelineRange", 2);
  assert.equal(a.$("#storyScene").dataset.stage, "2");
  a.click("#playBtn");
  a.tick(3400);
  assert.equal(a.$("#stepLabel").textContent, "4/4");
  assert.deepEqual(a.progress().lab, ["vector"]);
  a.click("#playBtn");
  assert.equal(a.$("#stepLabel").textContent, "1/4");
  a.click(".back-btn");
  a.tick(20000);
  assert.equal(a.jobs.size, 0);
  a.close();
});

test("Lab: partial insect-cycle work survives reload and four experiments enable the seal", () => {
  let a = app();
  a.click('[data-mission="lab"]');
  a.click('[data-lab="cycle"]');
  a.click('[data-cycle="0"]');
  a.click('[data-cycle="1"]');
  a.input("#cycleZoom", 180);
  assert.equal(a.$("#cycleImage").style.width, "180%");
  assert.equal(a.progress().lab.length, 0);
  const saved = a.store();
  a.close();
  a = app(saved);
  a.click('[data-mission="lab"]');
  a.click('[data-lab="cycle"]');
  assert.equal(a.d.querySelectorAll(".cycle-buttons .visited").length, 2);
  a.click('[data-cycle="2"]');
  assert.deepEqual(a.progress().lab, ["cycle"]);
  for (const id of ["vector", "congenital", "social"]) {
    a.click(`[data-lab="${id}"]`);
    a.input("#timelineRange", 3);
  }
  assert.equal(a.$("#sealBtn").disabled, false);
  assert.equal(a.$("#storyScene").classList.contains("route-social"), true);
  assert.equal(a.d.querySelectorAll(".route-social .story-particle").length, 0);
  a.close();
});

test("Report: offline save, canceled connection, completion and no real data access", () => {
  const a = app();
  a.click('[data-mission="report"]');
  assert.equal(a.$("#simInternet").disabled, true);
  a.input("#cameraZoom", 150);
  assert.equal(a.$("#cameraScene").style.transform, "scale(1.5)");
  for (let n = 0; n < 4; n++) a.click("#simAction");
  assert.equal(a.progress().report, 4);
  assert.equal(a.$("#sealBtn").disabled, true);
  a.check("#simInternet", true);
  a.tick(600);
  a.check("#simInternet", false);
  a.tick(1200);
  assert.equal(a.progress().report, 4);
  a.check("#simInternet", true);
  a.tick(1200);
  assert.equal(a.progress().report, 5);
  assert.match(
    a.$("#simMessage").textContent,
    /No se envió ningún reporte real/,
  );
  assert.equal(a.$("#sealBtn").disabled, false);
  assert.deepEqual(a.requests, []);
  a.close();
});

test("Report: reloading a pending practice and leaving during send cannot auto-complete it", () => {
  let a = app();
  a.click('[data-mission="report"]');
  for (let n = 0; n < 4; n++) a.click("#simAction");
  const saved = a.store();
  a.close();
  a = app(saved);
  a.click('[data-mission="report"]');
  assert.equal(a.$("#simInternet").checked, false);
  a.check("#simInternet", true);
  a.click(".back-btn");
  a.tick(2000);
  assert.equal(a.progress().report, 4);
  a.click('[data-mission="report"]');
  a.check("#simInternet", true);
  a.tick(1200);
  assert.equal(a.progress().report, 5);
  a.close();
});

test("A full expedition, four seals and notebook survive a reload", () => {
  let a = app();
  a.click('[data-mission="house"]');
  for (const r of L.repairs) repair(a, r.id);
  a.click("#sealBtn");
  a.click("#nextMission");
  assert.match(a.$("#missionTitle").textContent, /Mirar/);
  for (const c of L.clues) a.click(`[data-clue="${c.id}"]`);
  a.click("#sealBtn");
  a.click("#nextMission");
  exploreLab(a);
  a.click("#sealBtn");
  a.click("#nextMission");
  fillReport(a);
  a.click("#sealBtn");
  assert.equal(a.$("#nextMission").textContent, "Ver mi bitácora");
  a.click("#nextMission");
  assert.equal(a.d.querySelectorAll(".stamp-card.earned").length, 4);
  assert.equal(a.$("#navCount").textContent, "4");
  const saved = a.store();
  a.close();
  a = app(saved);
  assert.equal(a.$("#worldProgress").textContent, "4 de 4 sellos");
  a.close();
});

test("Reset requires confirmation, preserves preferences and leaves v1 data intact", () => {
  const a = app({ vintracker_aventura_v1: '{"old":"progress"}' });
  assert.equal(a.$("#legacyNote").hidden, false);
  a.click('[data-mission="night"]');
  a.click('[data-clue="wall"]');
  a.click("#settingsBtn");
  a.check("#motionToggle", true);
  a.check("#textToggle", true);
  a.click("#resetBtn");
  a.click("#cancelReset");
  assert.equal(a.progress().night.length, 1);
  a.click("#resetBtn");
  a.click("#confirmReset");
  assert.equal(a.progress().night.length, 0);
  assert.equal(a.progress().settings.motion, true);
  assert.equal(a.progress().settings.large, true);
  assert.equal(a.store().vintracker_aventura_v1, '{"old":"progress"}');
  assert.ok(a.d.documentElement.classList.contains("reduced-motion"));
  assert.ok(a.d.documentElement.classList.contains("large-text"));
  a.close();
});

test("Storage failure reports the problem while the activity remains usable", () => {
  const a = app({}, { blockStorage: true });
  a.click('[data-mission="house"]');
  repair(a, "wall");
  assert.equal(a.$("#activityCount").textContent, "1/4");
  assert.match(a.$("#toast").textContent, /No se pudo guardar/);
  for (const id of ["wood", "roof", "coop"]) repair(a, id);
  assert.equal(a.$("#sealBtn").disabled, false);
  a.close();
});

test("Broken saved JSON recovers and unavailable speech has a readable fallback", () => {
  const a = app({ [KEY]: "{broken" });
  assert.equal(a.$("#worldProgress").textContent, "0 de 4 sellos");
  a.click('[data-mission="lab"]');
  a.click("#readBtn");
  assert.match(a.$("#toast").textContent, /no tiene lectura en voz alta/);
  a.close();
});

test("Sounds remain opt-in and the preference survives reload", () => {
  let a = app();
  assert.deepEqual(a.sounds, []);
  a.click("#soundBtn");
  assert.equal(a.$("#soundBtn").getAttribute("aria-pressed"), "true");
  assert.equal(a.sounds.length, 1);
  const saved = a.store();
  a.close();
  a = app(saved);
  assert.equal(
    a.$("#soundBtn").getAttribute("aria-label"),
    "Desactivar sonidos",
  );
  assert.deepEqual(a.sounds, []);
  a.close();
});

test("DOM semantics: unique IDs, named controls and labeled images in every activity", () => {
  const a = app();
  for (const m of L.missions) {
    a.click(`[data-mission="${m.id}"]`);
    const ids = [...a.d.querySelectorAll("[id]")].map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const b of a.d.querySelectorAll("button"))
      assert.ok(
        b.textContent.trim() || b.getAttribute("aria-label"),
        `Unnamed button ${b.id}`,
      );
    for (const img of a.d.querySelectorAll("img"))
      assert.ok(img.hasAttribute("alt"));
    for (const svg of a.d.querySelectorAll("svg")) {
      assert.ok(svg.getAttribute("width"));
      assert.ok(svg.getAttribute("height"));
      assert.equal(svg.getAttribute("stroke"), "currentColor");
    }
    for (const input of a.d.querySelectorAll("input"))
      assert.ok(
        input.getAttribute("aria-label") ||
          input.closest("label") ||
          a.d.querySelector(`label[for="${input.id}"]`),
      );
    a.click(".back-btn");
  }
  a.close();
});

test("Offline label waits for worker activation and rejects a failed download", async () => {
  const worker = new EventTarget();
  worker.state = "installing";
  const serviceWorker = {
    register: async () => ({ installing: worker, addEventListener() {} }),
  };
  const a = app({}, { serviceWorker });
  await new Promise((r) => setImmediate(r));
  assert.doesNotMatch(a.$("#offlineStatus").textContent, /Lista para/);
  worker.state = "activated";
  worker.dispatchEvent(new Event("statechange"));
  await new Promise((r) => setImmediate(r));
  assert.match(a.$("#offlineStatus").textContent, /Lista para explorar/);
  a.close();
  const badWorker = new EventTarget();
  badWorker.state = "redundant";
  const b = app(
    {},
    {
      serviceWorker: {
        register: async () => ({
          installing: badWorker,
          addEventListener() {},
        }),
      },
    },
  );
  await new Promise((r) => setImmediate(r));
  assert.match(b.$("#offlineStatus").textContent, /no se completó/);
  b.w.dispatchEvent(new b.w.Event("offline"));
  assert.match(b.$("#offlineStatus").textContent, /Descarga pendiente/);
  b.close();
});

function workerEnvironment({ failInstall = false, offline = false } = {}) {
  const listeners = {},
    entries = new Map(),
    removed = [],
    network = [];
  const origin = "https://aventura.example";
  const base = origin + "/sub/";
  let skipped = false,
    claimed = false;
  const caches = {
    open: async (name) => {
      if (!entries.has(name)) entries.set(name, new Map());
      const values = entries.get(name);
      return {
        addAll: async (requests) => {
          if (failInstall) throw new Error("Offline install");
          for (const r of requests) {
            const u = new URL(r.url);
            const f = u.pathname.slice("/sub/".length) || "index.html";
            assert.ok(
              fs.existsSync(path.join(root, f)),
              `Precache asset missing: ${f}`,
            );
            values.set(r.url, new Response("cached:" + f));
          }
        },
        match: async (r, options = {}) => {
          const url = new URL(typeof r === "string" ? r : r.url, base);
          for (const [key, response] of values) {
            const k = new URL(key);
            if (
              options.ignoreSearch
                ? k.origin + k.pathname === url.origin + url.pathname
                : key === url.href
            )
              return response;
          }
        },
      };
    },
    keys: async () => [...entries.keys()],
    delete: async (name) => {
      removed.push(name);
      return entries.delete(name);
    },
  };
  const self = {
    location: { href: base + "sw.js", origin },
    addEventListener: (name, fn) => {
      listeners[name] = fn;
    },
    skipWaiting: async () => {
      skipped = true;
    },
    clients: {
      claim: async () => {
        claimed = true;
      },
    },
  };
  function ScopedRequest(input, options) {
    return new Request(new URL(input, base), options);
  }
  const context = {
    self,
    caches,
    URL,
    Request: ScopedRequest,
    Response,
    fetch: async (r) => {
      network.push(r.url);
      if (offline) throw new Error("Offline");
      return new Response("network");
    },
  };
  vm.runInNewContext(read("sw.js"), context);
  const event = async (name) => {
    let promise;
    listeners[name]({
      waitUntil(p) {
        promise = p;
      },
    });
    return promise;
  };
  const request = async (pathname, method = "GET", mode = "cors") => {
    let promise;
    const r = { url: new URL(pathname, base).href, method, mode };
    listeners.fetch({
      request: r,
      respondWith(p) {
        promise = p;
      },
    });
    return promise;
  };
  return {
    event,
    request,
    entries,
    removed,
    network,
    skipped: () => skipped,
    claimed: () => claimed,
  };
}

test("Worker install precaches every required file and only then activates", async () => {
  const s = workerEnvironment();
  await s.event("install");
  assert.equal(s.skipped(), true);
  const cache = [...s.entries.values()][0];
  assert.equal(cache.size, 10);
  for (const f of [
    "index.html",
    "app.js?v=201",
    "learning.js?v=201",
    "icon-192.png",
    "manifest.json",
  ])
    assert.ok([...cache.keys()].some((k) => k.endsWith("/" + f)));
  const fail = workerEnvironment({ failInstall: true });
  await assert.rejects(fail.event("install"), /Offline install/);
  assert.equal(fail.skipped(), false);
});

test("Worker upgrade removes old Aventura caches while preserving unrelated caches", async () => {
  const s = workerEnvironment();
  await s.event("install");
  s.entries.set("vintracker-aventura-v1", new Map());
  s.entries.set("another-app-cache", new Map());
  await s.event("activate");
  assert.deepEqual(s.removed, ["vintracker-aventura-v1"]);
  assert.equal(s.entries.has("another-app-cache"), true);
  assert.equal(s.claimed(), true);
});

test("Offline worker serves cached scripts/assets and navigation; never HTML for missing images", async () => {
  const s = workerEnvironment({ offline: true });
  await s.event("install");
  const script = await s.request("app.js?v=201");
  assert.match(await script.text(), /cached:app.js/);
  const image = await s.request("icon-192.png");
  assert.match(await image.text(), /cached:icon-192/);
  const page = await s.request("some-route", "GET", "navigate");
  assert.equal(await page.text(), "cached:index.html");
  const missing = await s.request("missing.webp");
  assert.equal(missing.type, "error");
  assert.deepEqual(s.network, [
    "https://aventura.example/sub/some-route",
    "https://aventura.example/sub/missing.webp",
  ]);
});

test("Worker ignores foreign origins and mutations, and uses the network for uncached GETs", async () => {
  const s = workerEnvironment();
  await s.event("install");
  assert.equal(await s.request("https://www.argentina.gob.ar/"), undefined);
  assert.equal(await s.request("report", "POST"), undefined);
  const response = await s.request("other.txt");
  assert.equal(await response.text(), "network");
  assert.equal(s.network.length, 1);
});

test("HTML, generated activities, manifest and root icons have valid local resources", () => {
  const a = app();
  const references = new Set();
  function collect() {
    for (const e of a.d.querySelectorAll("[src],link[href]"))
      references.add(e.getAttribute("src") || e.getAttribute("href"));
  }
  collect();
  for (const m of L.missions) {
    a.click(`[data-mission="${m.id}"]`);
    if (m.id === "lab") a.click('[data-lab="cycle"]');
    collect();
  }
  const manifest = JSON.parse(read("manifest.json"));
  for (const i of manifest.icons) references.add(i.src);
  for (const ref of references)
    if (!ref.startsWith("data:")) assert.ok(
      fs.existsSync(path.join(root, ref.split("?")[0])),
      `Missing ${ref}`,
    );
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.ok(
    JSON.parse(read("vercel.json")).headers.some((h) => h.source === "/sw.js"),
  );
  a.close();
});
