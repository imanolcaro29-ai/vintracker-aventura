/* Content and progress rules shared by the app and the regression tests. */
(function (root) {
  "use strict";
  const missions = [
    {
      id: "house",
      n: "01",
      title: "Una casa que cuida",
      short: "La casa",
      verb: "Transformá",
      desc: "Aplicá herramientas y reducí posibles refugios.",
      icon: "house",
      color: "gold",
      seal: "Cuidar el entorno",
    },
    {
      id: "night",
      n: "02",
      title: "Mirar con otros ojos",
      short: "La exploración",
      verb: "Explorá",
      desc: "Mové tu linterna virtual y descubrí dónde observar.",
      icon: "search",
      color: "purple",
      seal: "Observar sin tocar",
    },
    {
      id: "lab",
      n: "03",
      title: "Lo que no se ve",
      short: "El laboratorio",
      verb: "Experimentá",
      desc: "Controlá una animación y conocé al vector.",
      icon: "atom",
      color: "blue",
      seal: "Entender la transmisión",
    },
    {
      id: "report",
      n: "04",
      title: "Un hallazgo, un primer paso",
      short: "El puesto de salud",
      verb: "Practicá",
      desc: "Armá un registro ficticio y probá el envío offline.",
      icon: "pin",
      color: "green",
      seal: "Registrar con cuidado",
    },
  ];
  const repairs = [
    {
      id: "wall",
      tool: "Sellador",
      label: "Pared",
      icon: "tool",
      x: 27,
      y: 43,
      explanation:
        "Sellar grietas reduce posibles refugios. Esta tarea corresponde a una persona adulta.",
      done: "Grietas selladas",
    },
    {
      id: "wood",
      tool: "Orden",
      label: "Leñero",
      icon: "layers",
      x: 9,
      y: 58,
      explanation:
        "Ordenar los objetos y separar la leña de la vivienda facilita revisar el entorno.",
      done: "Entorno ordenado",
    },
    {
      id: "roof",
      tool: "Revisión",
      label: "Techo",
      icon: "search",
      x: 48,
      y: 25,
      explanation:
        "Las uniones y los agujeros del techo también necesitan revisión y mantenimiento por adultos.",
      done: "Techo revisado",
    },
    {
      id: "coop",
      tool: "Distancia",
      label: "Gallinero",
      icon: "move",
      x: 92,
      y: 52,
      explanation:
        "Ubicar gallineros y corrales lo más lejos posible de la vivienda ayuda a reducir refugios cercanos.",
      done: "Distancia planificada",
    },
  ];
  const clues = [
    {
      id: "wall",
      label: "Pared",
      x: 27,
      y: 43,
      text: "Las grietas pueden ofrecer refugio. Las manchas oscuras pueden ser una pista, pero una imagen no confirma presencia de vinchucas.",
    },
    {
      id: "wood",
      label: "Objetos apilados",
      x: 9,
      y: 58,
      text: "En objetos apilados pueden quedar huecos para esconderse. Observá a distancia y pedí ayuda adulta para la revisión.",
    },
    {
      id: "coop",
      label: "Refugio de animales",
      x: 92,
      y: 52,
      text: "Los lugares donde duermen animales también requieren vigilancia. Una muda o un insecto sospechoso debe ser revisado por personal capacitado.",
    },
  ];
  const routes = {
    vector: [
      [
        "Vector",
        "Una vinchuca infectada puede portar T. cruzi. No todas están infectadas.",
      ],
      [
        "Deyecciones",
        "Al alimentarse, puede dejar heces infectadas cerca de la picadura.",
      ],
      [
        "Entrada",
        "El parásito puede entrar si esas heces contactan una herida, los ojos o la boca.",
      ],
      [
        "Consulta",
        "El hallazgo de un insecto no es un diagnóstico. Consultar permite recibir orientación.",
      ],
    ],
    congenital: [
      [
        "Durante el embarazo",
        "Una persona con Chagas puede transmitir el parásito durante el embarazo o el parto.",
      ],
      [
        "No siempre ocurre",
        "No todos los bebés de personas con Chagas nacen con la infección.",
      ],
      [
        "Controles",
        "Los análisis y el seguimiento del bebé permiten detectar la infección.",
      ],
      [
        "Atención temprana",
        "El diagnóstico y el tratamiento oportunos son especialmente importantes en la infancia.",
      ],
    ],
    social: [
      [
        "Encuentro",
        "Una persona con Chagas puede participar de la vida de su comunidad.",
      ],
      ["Abrazo", "Los abrazos y dar la mano no transmiten Chagas."],
      [
        "Compartir",
        "Compartir el mate o los cubiertos no lo transmite por la saliva.",
      ],
      ["Acompañar", "Informarnos ayuda a acompañar sin discriminar."],
    ],
  };
  const notes = [
    {
      title: "El insecto y el parásito",
      icon: "atom",
      tag: "ENTENDER",
      text: "La vinchuca es un insecto vector. T. cruzi es el parásito que causa la infección. Ver una vinchuca no demuestra que tenga el parásito ni que una persona esté infectada.",
    },
    {
      title: "Observar con cuidado",
      icon: "search",
      tag: "EXPLORAR",
      text: "Las vinchucas suelen ocultarse durante el día. Grietas, objetos apilados y refugios de animales son lugares a revisar. Las pistas necesitan evaluación de personal capacitado.",
    },
    {
      title: "Una prevención compartida",
      icon: "house",
      tag: "CUIDAR",
      text: "Mejorar la vivienda y ordenar el entorno ayuda. El control con insecticidas corresponde a personal capacitado. La prevención requiere también acompañamiento del Estado; no es responsabilidad exclusiva de las familias.",
    },
    {
      title: "Embarazo e infancia",
      icon: "heart",
      tag: "ACOMPAÑAR",
      text: "El Chagas puede transmitirse durante el embarazo o el parto. Los controles de la persona embarazada y el seguimiento de su bebé son importantes, aunque no haya vinchucas en la zona.",
    },
    {
      title: "Otras vías de transmisión",
      icon: "route",
      tag: "AMPLIAR",
      text: "También puede transmitirse por alimentos contaminados con el parásito, sangre u órganos infectados y accidentes de laboratorio. Son mecanismos distintos del contacto social cotidiano.",
    },
    {
      title: "Convivir sin discriminar",
      icon: "people",
      tag: "COMPARTIR",
      text: "Abrazar, dar la mano y compartir el mate no transmiten Chagas. Una persona puede tener la infección sin síntomas; el diagnóstico se realiza con estudios de salud, no por su apariencia.",
    },
  ];
  function blank() {
    return {
      version: 2,
      completed: [],
      house: [],
      night: [],
      lab: [],
      labCycle: [],
      report: 0,
      settings: { sound: false, motion: false, large: false },
    };
  }
  function clean(raw) {
    const s = blank();
    if (!raw || typeof raw !== "object") return s;
    const allowed = {
      house: repairs.map((x) => x.id),
      night: clues.map((x) => x.id),
      lab: ["vector", "congenital", "social", "cycle"],
      labCycle: [0, 1, 2],
      completed: missions.map((x) => x.id),
    };
    for (const k of Object.keys(allowed))
      s[k] = [
        ...new Set(
          (Array.isArray(raw[k]) ? raw[k] : []).filter((x) =>
            allowed[k].includes(x),
          ),
        ),
      ];
    s.report = Number.isInteger(raw.report)
      ? Math.max(0, Math.min(5, raw.report))
      : 0;
    for (const k of ["sound", "motion", "large"])
      s.settings[k] = raw.settings?.[k] === true;
    s.completed = s.completed.filter((id) => ready(s, id));
    return s;
  }
  function ready(s, id) {
    return id === "house"
      ? s.house.length === 4
      : id === "night"
        ? s.night.length === 3
        : id === "lab"
          ? s.lab.length === 4
          : id === "report"
            ? s.report === 5
            : false;
  }
  function add(s, key, id) {
    if (!s[key].includes(id)) s[key].push(id);
  }
  function complete(s, id) {
    if (!ready(s, id)) return false;
    add(s, "completed", id);
    return true;
  }
  const api = {
    missions,
    repairs,
    clues,
    routes,
    notes,
    blank,
    clean,
    ready,
    add,
    complete,
  };
  root.VTLearning = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
