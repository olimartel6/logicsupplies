// ============================================================================
//  MODELE DE DEMO 2.0 — VERTICALE GYM
//  ---------------------------------------------------------------------------
//  Contenu par defaut d'une demo de gym. Un nouveau prospect n'a besoin que
//  d'un bloc court dans config.js : marque, couleurs, et les quelques champs
//  reellement specifiques (succursales, horaire, recompenses). Tout le reste
//  est herite d'ici via buildGym().
//
//  Fonctionnalites couvertes (equivalent app Anytime Fitness + nos ajouts) :
//    AF  : bibliotheque d'entrainements filtrable, plan personnalise,
//          coaching a distance, historique de visites, reseau de succursales,
//          statut d'adhesion, reservation de cours, synchro Apple Sante
//    NOUS: points de fidelite, recompenses locales, serie hebdomadaire,
//          achalandage en direct, journal d'entrainement personnel,
//          records personnels, mesures, defi avec classement, parrainage
// ============================================================================

const IMG = (p) => import.meta.env.BASE_URL + p;

export const GYM_DEFAULTS = {
  // --- Adhesion -------------------------------------------------------------
  membership: {
    planName: "Accès illimité 24/7",
    price: "59,99 $",
    period: "par mois",
    status: "Actif",
    nextBilling: "1er octobre 2026",
    memberSince: "janvier 2025",
    contract: "Engagement de 12 mois — renouvellement automatique",
    freezeNote: "Une suspension de 30 jours reste disponible cette année",
    accessNote: "Accès aux deux succursales, 24 heures sur 24",
  },

  // --- Succursales ----------------------------------------------------------
  locations: [
    {
      id: "st-roch",
      name: "Saint-Roch",
      address: "Rue Saint-Joseph Est, Québec",
      hours: "Ouvert 24 h — personnel de 6 h à 21 h",
      capacity: 120,
      equipment: ["Plateau de force", "Cardio", "Zone fonctionnelle", "Sauna"],
    },
    {
      id: "ste-foy",
      name: "Sainte-Foy",
      address: "Route de l'Église, Québec",
      hours: "Ouvert 24 h — personnel de 6 h à 20 h",
      capacity: 95,
      equipment: ["Plateau de force", "Cardio", "Studio de cours", "Boxe"],
    },
  ],
  homeLocation: "st-roch",

  // --- Achalandage en direct (12 h a 22 h) ---------------------------------
  occupancy: {
    now: 34,
    capacity: 120,
    updatedAt: "il y a 4 minutes",
    byHour: [
      { h: "6 h", pct: 22 }, { h: "7 h", pct: 41 }, { h: "8 h", pct: 34 },
      { h: "9 h", pct: 25 }, { h: "10 h", pct: 19 }, { h: "11 h", pct: 23 },
      { h: "12 h", pct: 48 }, { h: "13 h", pct: 37 }, { h: "14 h", pct: 21 },
      { h: "15 h", pct: 26 }, { h: "16 h", pct: 52 }, { h: "17 h", pct: 84 },
      { h: "18 h", pct: 96 }, { h: "19 h", pct: 71 }, { h: "20 h", pct: 44 },
      { h: "21 h", pct: 28 }, { h: "22 h", pct: 14 },
    ],
  },

  // --- Objectif et serie ----------------------------------------------------
  goal: {
    sessionsPerWeek: 3,
    thisWeek: 2,
    streakWeeks: 7,
    bestStreak: 11,
    weeks: [3, 3, 4, 3, 2, 3, 5, 3, 3, 4, 3, 2], // 12 dernieres semaines
  },

  // --- Coachs ---------------------------------------------------------------
  coaches: [
    {
      id: "maxime",
      name: "Maxime Tremblay",
      role: "Entraîneur-chef — force et hypertrophie",
      photo: IMG("images/demo-gym/coach-maxime.jpg"),
      credentials: "Kinésiologue, 9 ans d'expérience",
    },
    {
      id: "sarah",
      name: "Sarah Bouchard",
      role: "Cours de groupe — yoga et mobilité",
      photo: IMG("images/demo-gym/coach-sarah.jpg"),
      credentials: "Certifiée RYT-500 et Animatrice cardio-vélo",
    },
  ],

  // --- Messages avec le coach ----------------------------------------------
  thread: [
    { id: 1, from: "coach", who: "maxime", at: "Hier, 19 h 12", text: "J'ai revu ta semaine. Ton développé couché plafonne parce qu'on a très peu de volume sur le haut du dos. Je te rajoute deux séries de tirage horizontal le mercredi." },
    { id: 2, from: "me", at: "Hier, 20 h 04", text: "Parfait. J'ai encore un peu d'inconfort à l'épaule droite sur les mouvements au-dessus de la tête." },
    { id: 3, from: "coach", who: "maxime", at: "Aujourd'hui, 7 h 41", text: "On remplace le développé militaire par du développé incliné avec haltères cette semaine, et on garde la mobilité d'épaule en échauffement. Écris-moi vendredi si la sensation change." },
  ],

  // --- Horaire des cours (day : 0 = lundi) ---------------------------------
  classes: [
    { id: "c1", day: 0, time: "6 h 15", duration: 45, name: "Force — Haut du corps", coach: "maxime", location: "st-roch", room: "Plateau de force", type: "Force", intensity: 3, capacity: 14, taken: 9, image: IMG("images/demo-gym/c-force.jpg") },
    { id: "c2", day: 0, time: "12 h 10", duration: 30, name: "HIIT Express", coach: "maxime", location: "st-roch", room: "Zone fonctionnelle", type: "HIIT", intensity: 3, capacity: 16, taken: 16, image: IMG("images/demo-gym/c-hiit.jpg") },
    { id: "c3", day: 0, time: "17 h 30", duration: 50, name: "Cycle Endurance", coach: "sarah", location: "st-roch", room: "Studio cycle", type: "Cycle", intensity: 2, capacity: 20, taken: 17, image: IMG("images/demo-gym/c-cycle.jpg") },
    { id: "c4", day: 0, time: "19 h 00", duration: 60, name: "Yoga Vinyasa", coach: "sarah", location: "ste-foy", room: "Studio de cours", type: "Yoga", intensity: 1, capacity: 18, taken: 11, image: IMG("images/demo-gym/c-yoga.jpg") },

    { id: "c5", day: 1, time: "6 h 15", duration: 45, name: "Cardio Intervalles", coach: "maxime", location: "st-roch", room: "Cardio", type: "Cardio", intensity: 3, capacity: 14, taken: 6, image: IMG("images/demo-gym/c-cardio.jpg") },
    { id: "c6", day: 1, time: "12 h 10", duration: 30, name: "Core et gainage", coach: "sarah", location: "st-roch", room: "Studio de cours", type: "Core", intensity: 2, capacity: 16, taken: 12, image: IMG("images/demo-gym/c-core.jpg") },
    { id: "c7", day: 1, time: "18 h 00", duration: 60, name: "Boxe technique", coach: "maxime", location: "ste-foy", room: "Zone boxe", type: "Boxe", intensity: 3, capacity: 12, taken: 12, image: IMG("images/demo-gym/c-boxe.jpg") },
    { id: "c8", day: 1, time: "20 h 00", duration: 45, name: "Mobilité et étirements", coach: "sarah", location: "st-roch", room: "Studio de cours", type: "Mobilité", intensity: 1, capacity: 18, taken: 7, image: IMG("images/demo-gym/c-mobilite.jpg") },

    { id: "c9", day: 2, time: "6 h 15", duration: 45, name: "Force — Bas du corps", coach: "maxime", location: "st-roch", room: "Plateau de force", type: "Force", intensity: 3, capacity: 14, taken: 10, image: IMG("images/demo-gym/c-force.jpg") },
    { id: "c10", day: 2, time: "12 h 10", duration: 30, name: "HIIT Express", coach: "maxime", location: "ste-foy", room: "Zone fonctionnelle", type: "HIIT", intensity: 3, capacity: 16, taken: 13, image: IMG("images/demo-gym/c-hiit.jpg") },
    { id: "c11", day: 2, time: "17 h 30", duration: 50, name: "Cycle Puissance", coach: "sarah", location: "st-roch", room: "Studio cycle", type: "Cycle", intensity: 3, capacity: 20, taken: 19, image: IMG("images/demo-gym/c-cycle.jpg") },
    { id: "c12", day: 2, time: "19 h 00", duration: 60, name: "Yoga réparateur", coach: "sarah", location: "st-roch", room: "Studio de cours", type: "Yoga", intensity: 1, capacity: 18, taken: 8, image: IMG("images/demo-gym/c-yoga.jpg") },

    { id: "c13", day: 3, time: "6 h 15", duration: 45, name: "Circuit complet", coach: "maxime", location: "st-roch", room: "Zone fonctionnelle", type: "HIIT", intensity: 3, capacity: 14, taken: 8, image: IMG("images/demo-gym/c-hiit.jpg") },
    { id: "c14", day: 3, time: "12 h 10", duration: 30, name: "Core et gainage", coach: "sarah", location: "st-roch", room: "Studio de cours", type: "Core", intensity: 2, capacity: 16, taken: 10, image: IMG("images/demo-gym/c-core.jpg") },
    { id: "c15", day: 3, time: "18 h 00", duration: 60, name: "Boxe cardio", coach: "maxime", location: "ste-foy", room: "Zone boxe", type: "Boxe", intensity: 3, capacity: 12, taken: 9, image: IMG("images/demo-gym/c-boxe.jpg") },
    { id: "c16", day: 3, time: "20 h 00", duration: 45, name: "Mobilité et étirements", coach: "sarah", location: "st-roch", room: "Studio de cours", type: "Mobilité", intensity: 1, capacity: 18, taken: 5, image: IMG("images/demo-gym/c-mobilite.jpg") },

    { id: "c17", day: 4, time: "6 h 15", duration: 45, name: "Force — Corps complet", coach: "maxime", location: "st-roch", room: "Plateau de force", type: "Force", intensity: 3, capacity: 14, taken: 11, image: IMG("images/demo-gym/c-force.jpg") },
    { id: "c18", day: 4, time: "12 h 10", duration: 30, name: "HIIT Express", coach: "maxime", location: "st-roch", room: "Zone fonctionnelle", type: "HIIT", intensity: 3, capacity: 16, taken: 15, image: IMG("images/demo-gym/c-hiit.jpg") },
    { id: "c19", day: 4, time: "17 h 30", duration: 50, name: "Cycle Endurance", coach: "sarah", location: "ste-foy", room: "Studio cycle", type: "Cycle", intensity: 2, capacity: 20, taken: 14, image: IMG("images/demo-gym/c-cycle.jpg") },

    { id: "c20", day: 5, time: "8 h 30", duration: 60, name: "Circuit du samedi", coach: "maxime", location: "st-roch", room: "Zone fonctionnelle", type: "HIIT", intensity: 2, capacity: 20, taken: 16, image: IMG("images/demo-gym/c-hiit.jpg") },
    { id: "c21", day: 5, time: "10 h 00", duration: 60, name: "Yoga Vinyasa", coach: "sarah", location: "st-roch", room: "Studio de cours", type: "Yoga", intensity: 2, capacity: 18, taken: 13, image: IMG("images/demo-gym/c-yoga.jpg") },
    { id: "c22", day: 5, time: "11 h 15", duration: 45, name: "Boxe technique", coach: "maxime", location: "ste-foy", room: "Zone boxe", type: "Boxe", intensity: 3, capacity: 12, taken: 7, image: IMG("images/demo-gym/c-boxe.jpg") },

    { id: "c23", day: 6, time: "9 h 30", duration: 50, name: "Cardio Intervalles", coach: "maxime", location: "st-roch", room: "Cardio", type: "Cardio", intensity: 2, capacity: 14, taken: 5, image: IMG("images/demo-gym/c-cardio.jpg") },
    { id: "c24", day: 6, time: "10 h 45", duration: 60, name: "Yoga réparateur", coach: "sarah", location: "st-roch", room: "Studio de cours", type: "Yoga", intensity: 1, capacity: 18, taken: 9, image: IMG("images/demo-gym/c-yoga.jpg") },
    { id: "c25", day: 6, time: "16 h 00", duration: 45, name: "Mobilité et étirements", coach: "sarah", location: "ste-foy", room: "Studio de cours", type: "Mobilité", intensity: 1, capacity: 18, taken: 6, image: IMG("images/demo-gym/c-mobilite.jpg") },
  ],

  // Cours deja reserves par le membre de demo
  booked: ["c3", "c12"],

  // --- Rendez-vous prives ---------------------------------------------------
  appointments: {
    intro: "Une évaluation de 30 minutes est incluse chaque trimestre avec votre abonnement.",
    slots: [
      { id: "a1", coach: "maxime", label: "Évaluation de la condition physique", duration: 30, day: "Mardi", time: "16 h 00", included: true },
      { id: "a2", coach: "maxime", label: "Séance privée — technique de levée", duration: 60, day: "Mercredi", time: "13 h 30", price: "70 $" },
      { id: "a3", coach: "sarah", label: "Plan d'entraînement personnalisé", duration: 45, day: "Jeudi", time: "11 h 00", price: "55 $" },
      { id: "a4", coach: "maxime", label: "Séance privée — technique de levée", duration: 60, day: "Samedi", time: "9 h 00", price: "70 $" },
    ],
  },

  // --- Bibliotheque d'entrainements -----------------------------------------
  workoutFilters: {
    durations: [10, 20, 30, 45],
    types: ["Force", "HIIT", "Cardio", "Mobilité", "Core", "Yoga"],
    levels: ["Débutant", "Intermédiaire", "Avancé"],
  },
  workouts: [
    {
      id: "w1", name: "HIIT sans équipement", type: "HIIT", duration: 20, level: "Intermédiaire",
      intensity: 3, equipment: "Aucun", image: IMG("images/demo-gym/w-hiit.jpg"),
      summary: "Quatre tours en 40 secondes d'effort et 20 secondes de repos. À faire au gym comme à la maison.",
      blocks: [
        { name: "Échauffement — 3 min", items: ["Rotations d'épaules et de hanches", "Montées de genoux légères", "Fentes marchées"] },
        { name: "Bloc principal — 4 tours", items: ["Burpees — 40 s", "Squats sautés — 40 s", "Planche dynamique — 40 s", "Fentes alternées — 40 s"] },
        { name: "Retour au calme — 3 min", items: ["Marche lente", "Étirement des quadriceps", "Respiration 4-7-8"] },
      ],
    },
    {
      id: "w2", name: "Force — Haut du corps", type: "Force", duration: 45, level: "Intermédiaire",
      intensity: 3, equipment: "Barre et haltères", image: IMG("images/demo-gym/w-haut.jpg"),
      summary: "Séance de poussée et de tirage construite autour du développé couché, avec un volume suffisant sur le haut du dos.",
      blocks: [
        { name: "Échauffement — 6 min", items: ["Rameur — 3 min", "Rotations externes à la bande — 2 × 15", "Barre à vide — 2 × 10"] },
        { name: "Bloc principal", items: ["Développé couché — 4 × 6 à 75 kg", "Tirage horizontal — 4 × 10", "Développé incliné aux haltères — 3 × 10", "Tirage vertical — 3 × 12"] },
        { name: "Finisseur", items: ["Élévations latérales — 3 × 15", "Extensions de triceps — 3 × 15"] },
      ],
    },
    {
      id: "w3", name: "Force — Bas du corps", type: "Force", duration: 45, level: "Avancé",
      intensity: 3, equipment: "Barre et rack", image: IMG("images/demo-gym/w-bas.jpg"),
      summary: "Squat lourd, puis travail unilatéral pour corriger le déséquilibre entre les deux jambes.",
      blocks: [
        { name: "Échauffement — 8 min", items: ["Vélo — 4 min", "Mobilité de cheville — 2 × 10", "Squat au poids du corps — 2 × 12"] },
        { name: "Bloc principal", items: ["Squat arrière — 5 × 5 à 110 kg", "Soulevé de terre roumain — 4 × 8", "Fentes bulgares — 3 × 10 par jambe"] },
        { name: "Finisseur", items: ["Extensions de mollets — 4 × 15", "Gainage latéral — 3 × 45 s"] },
      ],
    },
    {
      id: "w4", name: "Core en 10 minutes", type: "Core", duration: 10, level: "Débutant",
      intensity: 2, equipment: "Tapis", image: IMG("images/demo-gym/w-core.jpg"),
      summary: "Un circuit court à glisser à la fin de n'importe quelle séance.",
      blocks: [
        { name: "Circuit — 2 tours", items: ["Planche — 45 s", "Gainage latéral — 30 s par côté", "Ciseaux — 30 s", "Pont fessier — 20 répétitions"] },
      ],
    },
    {
      id: "w5", name: "Mobilité du matin", type: "Mobilité", duration: 15, level: "Débutant",
      intensity: 1, equipment: "Rouleau de mousse", image: IMG("images/demo-gym/w-mobilite.jpg"),
      summary: "Séquence d'ouverture des hanches et des épaules, idéale les jours de repos.",
      blocks: [
        { name: "Rouleau — 5 min", items: ["Quadriceps — 45 s par jambe", "Fessiers — 45 s par côté", "Dorsaux — 60 s"] },
        { name: "Mobilité — 10 min", items: ["Fente avec rotation — 8 par côté", "Chien tête en bas — 60 s", "Ouverture de poitrine au mur — 60 s", "Posture de l'enfant — 90 s"] },
      ],
    },
    {
      id: "w6", name: "Cardio progressif", type: "Cardio", duration: 30, level: "Intermédiaire",
      intensity: 2, equipment: "Tapis roulant", image: IMG("images/demo-gym/w-cardio.jpg"),
      summary: "Trente minutes en zone 2 avec quatre accélérations, pour bâtir le fond sans épuiser les jambes.",
      blocks: [
        { name: "Progression", items: ["10 min à allure facile", "4 × 90 s en zone 4 avec 2 min de récupération", "6 min de retour au calme"] },
      ],
    },
    {
      id: "w7", name: "Corps complet pour débuter", type: "Force", duration: 30, level: "Débutant",
      intensity: 2, equipment: "Haltères", image: IMG("images/demo-gym/w-fullbody.jpg"),
      summary: "La première séance à faire quand on recommence après une pause. Trois tours, aucun matériel compliqué.",
      blocks: [
        { name: "Échauffement — 5 min", items: ["Marche rapide", "Cercles de bras", "Squats au poids du corps — 2 × 10"] },
        { name: "Circuit — 3 tours", items: ["Squat aux haltères — 12", "Développé aux haltères — 12", "Tirage penché — 12", "Pont fessier — 15", "Planche — 30 s"] },
      ],
    },
    {
      id: "w8", name: "Force maximale", type: "Force", duration: 45, level: "Avancé",
      intensity: 3, equipment: "Barre olympique", image: IMG("images/demo-gym/w-force.jpg"),
      summary: "Bloc de force pure sur trois levées, séries lourdes et repos longs.",
      blocks: [
        { name: "Échauffement — 10 min", items: ["Mobilité générale", "Montée progressive en charge sur la levée du jour"] },
        { name: "Bloc principal", items: ["Soulevé de terre — 5 × 3 à 145 kg", "Squat avant — 4 × 5", "Tractions lestées — 4 × 5"] },
        { name: "Repos", items: ["3 minutes complètes entre chaque série lourde"] },
      ],
    },
  ],

  // --- Journal d'entrainement (ce que l'app du concurrent ne fait pas) ------
  journal: [
    {
      id: "j1", date: "2026-09-10", name: "Force — Haut du corps", duration: 52, location: "st-roch", points: 75,
      exercises: [
        { name: "Développé couché", sets: "4 × 6", load: "75 kg", note: "Dernière série difficile" },
        { name: "Tirage horizontal", sets: "4 × 10", load: "60 kg" },
        { name: "Développé incliné", sets: "3 × 10", load: "24 kg" },
      ],
    },
    {
      id: "j2", date: "2026-09-08", name: "Cycle Endurance", duration: 50, location: "st-roch", points: 75,
      exercises: [{ name: "Cours de groupe", sets: "50 min", load: "Zone 2 à 3", note: "Fréquence moyenne 142 bpm" }],
    },
    {
      id: "j3", date: "2026-09-05", name: "Force — Bas du corps", duration: 58, location: "st-roch", points: 75,
      exercises: [
        { name: "Squat arrière", sets: "5 × 5", load: "110 kg", note: "Nouveau record de série" },
        { name: "Soulevé de terre roumain", sets: "4 × 8", load: "90 kg" },
        { name: "Fentes bulgares", sets: "3 × 10", load: "20 kg" },
      ],
    },
  ],

  // --- Records personnels ---------------------------------------------------
  records: [
    { lift: "Développé couché", value: 82.5, unit: "kg", date: "22 août 2026", delta: "+5 kg en 3 mois", history: [65, 70, 72.5, 75, 77.5, 80, 82.5] },
    { lift: "Squat arrière", value: 120, unit: "kg", date: "5 septembre 2026", delta: "+12,5 kg en 3 mois", history: [95, 100, 105, 107.5, 112.5, 115, 120] },
    { lift: "Soulevé de terre", value: 152.5, unit: "kg", date: "29 août 2026", delta: "+10 kg en 3 mois", history: [125, 130, 135, 140, 142.5, 147.5, 152.5] },
    { lift: "Tractions", value: 12, unit: "répétitions", date: "1er septembre 2026", delta: "+4 depuis juin", history: [6, 7, 8, 9, 10, 11, 12] },
  ],

  // --- Mesures --------------------------------------------------------------
  measures: [
    { label: "Poids", value: "78,4 kg", delta: "-2,1 kg depuis juin", trend: "down", good: true },
    { label: "Tour de taille", value: "84 cm", delta: "-3 cm depuis juin", trend: "down", good: true },
    { label: "Masse grasse estimée", value: "16,2 %", delta: "-1,8 point depuis juin", trend: "down", good: true },
    { label: "Fréquence cardiaque au repos", value: "54 bpm", delta: "-4 bpm depuis juin", trend: "down", good: true },
  ],

  // --- Plan de la semaine ---------------------------------------------------
  plan: {
    weekLabel: "Semaine du 7 au 13 septembre",
    intro: "Construit avec Maxime après votre évaluation du 2 septembre.",
    tasks: [
      { id: "p1", kind: "training", label: "Force — Haut du corps", detail: "Lundi ou mardi, 45 minutes", done: true },
      { id: "p2", kind: "training", label: "Cycle Endurance", detail: "Cours de groupe, lundi 17 h 30", done: true },
      { id: "p3", kind: "training", label: "Force — Bas du corps", detail: "Jeudi, 45 minutes", done: false },
      { id: "p4", kind: "nutrition", label: "130 g de protéines par jour", detail: "5 jours sur 7 atteints", done: false },
      { id: "p5", kind: "nutrition", label: "2,5 litres d'eau par jour", detail: "6 jours sur 7 atteints", done: true },
      { id: "p6", kind: "recovery", label: "Mobilité du matin", detail: "Deux fois cette semaine", done: false },
      { id: "p7", kind: "recovery", label: "7 heures de sommeil", detail: "Moyenne actuelle : 6 h 48", done: false },
    ],
  },

  // --- Defi du mois ---------------------------------------------------------
  challenge: {
    name: "Défi 12 séances en septembre",
    description: "Douze entraînements enregistrés avant le 30 septembre. Les finissants reçoivent 500 points et une serviette signature.",
    endsOn: "30 septembre",
    myProgress: 8,
    target: 12,
    participants: 64,
    leaderboard: [
      { rank: 1, name: "Julien P.", value: 14 },
      { rank: 2, name: "Camille R.", value: 13 },
      { rank: 3, name: "Marc-André L.", value: 12 },
      { rank: 4, name: "Vous", value: 8, isMe: true },
      { rank: 5, name: "Sophie G.", value: 8 },
    ],
  },

  // --- Synchro Apple Sante --------------------------------------------------
  health: {
    connected: true,
    note: "Vos données sont partagées avec Maxime uniquement, et vous pouvez couper la connexion en tout temps.",
    metrics: [
      { label: "Pas aujourd'hui", value: "8 420" },
      { label: "Sommeil cette nuit", value: "6 h 48" },
      { label: "Fréquence au repos", value: "54 bpm" },
      { label: "Minutes actives", value: "47 min" },
    ],
  },

  // --- Fil d'activite recente ----------------------------------------------
  activity: [
    { id: 1, kind: "entry", label: "Entrée au gym", detail: "Saint-Roch — 52 minutes", date: "10 septembre", points: 50 },
    { id: 2, kind: "class", label: "Cours de groupe", detail: "Cycle Endurance avec Sarah", date: "8 septembre", points: 75 },
    { id: 3, kind: "entry", label: "Entrée au gym", detail: "Saint-Roch — 58 minutes", date: "5 septembre", points: 50 },
    { id: 4, kind: "redemption", label: "Récompense échangée", detail: "Smoothie protéiné au bar", date: "4 septembre", points: -200 },
    { id: 5, kind: "class", label: "Cours de groupe", detail: "HIIT Express à Sainte-Foy", date: "3 septembre", points: 75 },
    { id: 6, kind: "referral", label: "Parrainage confirmé", detail: "Sophie G. s'est inscrite", date: "1er septembre", points: 300 },
  ],

  // --- Historique de visites -----------------------------------------------
  visits: [
    { date: "2026-09-10", time: "18 h 12", location: "st-roch", duration: 52, kind: "Entraînement libre" },
    { date: "2026-09-08", time: "17 h 28", location: "st-roch", duration: 50, kind: "Cycle Endurance" },
    { date: "2026-09-05", time: "6 h 08", location: "st-roch", duration: 58, kind: "Entraînement libre" },
    { date: "2026-09-03", time: "12 h 05", location: "ste-foy", duration: 32, kind: "HIIT Express" },
    { date: "2026-09-01", time: "18 h 41", location: "st-roch", duration: 46, kind: "Entraînement libre" },
    { date: "2026-08-29", time: "7 h 15", location: "st-roch", duration: 61, kind: "Entraînement libre" },
    { date: "2026-08-27", time: "19 h 02", location: "ste-foy", duration: 60, kind: "Boxe technique" },
    { date: "2026-08-25", time: "17 h 55", location: "st-roch", duration: 44, kind: "Entraînement libre" },
  ],
  visitStats: {
    thisMonth: 8,
    lastMonth: 11,
    total: 186,
    avgDuration: 49,
    byMonth: [
      { m: "Avr", n: 9 }, { m: "Mai", n: 12 }, { m: "Juin", n: 10 },
      { m: "Juil", n: 7 }, { m: "Août", n: 11 }, { m: "Sept", n: 8 },
    ],
  },
};

// Fusion peu profonde, cle par cle : un prospect ne remplace que ce qu'il change.
export function buildGym(overrides) {
  if (!overrides) return GYM_DEFAULTS;
  const out = { ...GYM_DEFAULTS };
  for (const [k, v] of Object.entries(overrides)) {
    const base = GYM_DEFAULTS[k];
    if (v && !Array.isArray(v) && typeof v === "object" && base && !Array.isArray(base) && typeof base === "object") {
      out[k] = { ...base, ...v };
    } else {
      out[k] = v;
    }
  }
  return out;
}

export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
export const DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default GYM_DEFAULTS;
