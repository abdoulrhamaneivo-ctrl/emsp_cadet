/**
 * Contrat de données partagé — SOURCE UNIQUE (doc 02 §5).
 * JSDoc pur (projet JS). Les specs de pages référencent ces formes.
 * Exemples JSON alignés sur le futur DRF (backend à partir de T3).
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} prenom
 * @property {string} nom
 * @property {string} email            // doit finir par @emsp.int (RG4)
 * @property {boolean} isAdmin                  // RG5 : accès administration (RO)
 * @property {"L1"|"L2"|"L3"|"M1"|"M2"|"alumni"} niveauEtude  // RG7/RG10/RG15
 * @property {"master"|"alumni"|"inconnu"} intentionAnneeSuivante  // déclaratif fin de cycle (doc 15)
 * @property {{matchingEnrichi: boolean, copilot: boolean}} preferencesIA  // RG12 : opt-in strict (doc 17)
 * @property {string|null} anneePromotion           // ex "2026" — rempli à la bascule alumni
 * @property {boolean} candidatureAineOuverte   // RG8 : pilote la casquette Aîné
 * @property {string} classe           // ex: "L1", "L2 SI"
 * @property {string} filiere          // ex: "Digitalisation des services"
 * @property {string|null} photoUrl
 * @property {string|null} attentes    // free-text cadet
 * @property {boolean} emailVerifie
 * @property {string} dateInscription  // ISO 8601
 */

/** @typedef {Object} Badge @property {string} code @property {string} libelle @property {string} dateObtention */

/**
 * @typedef {Object} ProfilAine — enrichit User côté GET /api/parrains/:id/
 * @property {{code:string,libelle:string,dateObtention:string}[]} badges
 * @property {string[]} ambitions @property {string[]} projets
 * @property {string[]} pointsForts @property {string[]} pointsFaibles
 * @property {number} nbCadetsActifs   // 0..5 (RG2)
 * @property {number|null} scoreFiabilite // moyenne avis 0..5, null si 0 avis (§3.6)
 * @property {number} nbAvis
 */

/**
 * @typedef {"en_attente"|"acceptee"|"refusee"|"annulee"|"terminee"} StatutDemande
 * @typedef {Object} DemandeParrainage
 * @property {number} id @property {User} cadet @property {User} aine
 * @property {StatutDemande} statut
 * @property {string} dateDemande @property {string|null} dateReponse
 * @property {string|null} motifRefus
 */

/**
 * @typedef {Object} MonParrainage — GET /api/me/parrainage/
 * @property {boolean} binomeActif         // RG1 : un seul Aîné actif
 * @property {User|null} aineActif
 * @property {DemandeParrainage|null} demandeEnAttente // une attente compte comme engagement (RG1)
 * @property {DemandeParrainage[]} historique
 */

/**
 * @typedef {Object} Conversation
 * @property {number} id
 * @property {"prive"|"groupe_famille"|"groupe_cercle"} type
 * @property {User|null} interlocuteur          // prive seulement
 * @property {{titre:string, iconeCode:string, membres:User[], proprietaireId:number}|null} groupe  // familles/cercles (doc 13)
 * @property {{contenu:string,dateEnvoi:string}|null} dernierMessage
 * @property {number} nonLus
 */
/** @typedef {Object} Message @property {number} id @property {number} conversationId @property {boolean} envoyeParMoi @property {string} contenu @property {string} dateEnvoi */

/**
 * @typedef {"propose"|"confirme"|"refuse"|"contre_propose"|"annule"|"passe"} StatutRDV
 * @typedef {Object} RendezVous
 * @property {number} id
 * @property {User} organisateur @property {User} invite   // binôme des deux sens possibles
 * @property {string} titre @property {string|null} description
 * @property {string} dateHeure          // ISO local ISO 8601
 * @property {string} lieu
 * @property {"presentiel"|"visio"} mode
 * @property {StatutRDV} statut
 * @property {{dateHeure:string,lieu:string}|null} contreProposition
 */

/** §3.6
 * @typedef {Object} Avis
 * @property {number} id @property {number} parrainageId @property {number} auteurId
 * @property {number} note               // entier 1..5
 * @property {string} commentaire        // 20..600 chars
 * @property {string} dateAvis
 */

/** §3.7
 * @typedef {Object} Evenement
 * @property {number} id @property {string} titre @property {string} description
 * @property {string} dateDebut @property {string} lieu
 * @property {User} organisateur         // aîné OU admin
 * @property {number} capaciteMax @property {number} nbInscrits
 * @property {boolean} inscritMoi
 */
