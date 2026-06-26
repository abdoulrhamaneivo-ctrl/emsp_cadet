/**
 * EMSP - configuration navigation partagee (vitrine statique).
 *
 * URL Aine & Cadet configurable via :
 * 1. meta[name="emsp-aine-cadet-url"]
 * 2. window.EMSPCONFIG.aineCadetBase
 * 3. chemin relatif, compatible deploiement
 */
(function (window) {
  "use strict";

  function cleanBase(value) {
    value = String(value || "").trim();
    if (value === "/") return "";
    return value.replace(/\/$/, "");
  }

  function resolveAineCadetBase() {
    var meta = document.querySelector('meta[name="emsp-aine-cadet-url"]');
    if (meta && meta.content) return cleanBase(meta.content);
    if (window.EMSPCONFIG && window.EMSPCONFIG.aineCadetBase) return cleanBase(window.EMSPCONFIG.aineCadetBase);
    return "";
  }

  var AINE_CADET_BASE = resolveAineCadetBase();

  var ROUTES = {
    accueil: "index.html",
    formations: {
      fsp: "formations-fsp.html",
      fsMenum: "formations-fs-menum.html",
      regnum: "formations-regnum.html",
      continue: "formation-continue.html",
    },
    mediatheque: "mediatheque.html",
    contact: "contact.html",
    espaceEtudiant: AINE_CADET_BASE + "/accounts/login/",
    concours: "concours.html",
    concoursInscription: AINE_CADET_BASE + "/concours/inscription/",
    concoursPreinscription: AINE_CADET_BASE + "/concours/preinscription.json",
    concoursSession: AINE_CADET_BASE + "/concours/session-active.json",
    contactApi: AINE_CADET_BASE + "/api/contact/",
    bibliotheque: AINE_CADET_BASE + "/bibliotheque/",
    bibliothequeLogin: AINE_CADET_BASE + "/accounts/login/?next=/bibliotheque/",
    bibliothequeApi: AINE_CADET_BASE + "/bibliotheque/api/publiques.json",
    planDuSite: "generic.html",
  };

  var ACTIVE_PAGES = [
    ROUTES.accueil,
    ROUTES.formations.fsp,
    ROUTES.formations.fsMenum,
    ROUTES.formations.regnum,
    ROUTES.formations.continue,
    ROUTES.mediatheque,
    ROUTES.contact,
    ROUTES.concours,
  ];

  var CONTACT = {
    email: "contact@emsp.int",
    telephone: "(+225) 27 21 21 45 60 / 61",
    adresse: "18 BP 42 Abidjan 18, Treichville, Cote d'Ivoire",
  };

  var SOCIAL = {
    facebook: "https://www.facebook.com/emspabidjan/",
    linkedin: "https://www.linkedin.com/school/emsp-abidjan/",
    youtube: "https://www.youtube.com/@emspabidjan",
  };

  window.EMSPCONFIG = {
    routes: ROUTES,
    activePages: ACTIVE_PAGES,
    contact: CONTACT,
    social: SOCIAL,
    aineCadetBase: AINE_CADET_BASE,
    parrinnovBase: AINE_CADET_BASE,
  };
})(window);
