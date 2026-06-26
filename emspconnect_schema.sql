-- ==============================================================
-- EMSPCONNECT -- Schema de la base de donnees
-- Genere depuis SQLite3 -- Compatible MySQL avec ajustements
-- ==============================================================

-- NOTE MYSQL :
-- 1. Remplacer INTEGER PRIMARY KEY AUTOINCREMENT par INT AUTO_INCREMENT PRIMARY KEY
-- 2. Ajouter CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci aux tables
-- 3. Remplacer BOOLEAN par TINYINT(1), REAL par DOUBLE PRECISION
-- 4. Configurer aine-cadet/.env avec DB_ENGINE=mysql, DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT

-- ---------------------------------------------------------
-- Structures des tables
-- ---------------------------------------------------------

-- Table : django_migrations
CREATE TABLE "django_migrations" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "app" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "applied" datetime NOT NULL);

-- Table : django_content_type
CREATE TABLE "django_content_type" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "app_label" varchar(100) NOT NULL, "model" varchar(100) NOT NULL);

-- Table : auth_group_permissions
CREATE TABLE "auth_group_permissions" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "group_id" integer NOT NULL REFERENCES "auth_group" ("id") DEFERRABLE INITIALLY DEFERRED, "permission_id" integer NOT NULL REFERENCES "auth_permission" ("id") DEFERRABLE INITIALLY DEFERRED);

-- Table : auth_permission
CREATE TABLE "auth_permission" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "content_type_id" integer NOT NULL REFERENCES "django_content_type" ("id") DEFERRABLE INITIALLY DEFERRED, "codename" varchar(100) NOT NULL, "name" varchar(255) NOT NULL);

-- Table : auth_group
CREATE TABLE "auth_group" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "name" varchar(150) NOT NULL UNIQUE);

-- Table : accounts_user
CREATE TABLE "accounts_user" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "password" varchar(128) NOT NULL, "last_login" datetime NULL, "is_superuser" bool NOT NULL, "username" varchar(150) NOT NULL UNIQUE, "first_name" varchar(150) NOT NULL, "last_name" varchar(150) NOT NULL, "is_staff" bool NOT NULL, "is_active" bool NOT NULL, "date_joined" datetime NOT NULL, "email" varchar(254) NOT NULL UNIQUE, "role" varchar(20) NOT NULL, "classe" varchar(50) NOT NULL, "filiere" varchar(120) NOT NULL, "photo" varchar(100) NULL, "attentes" text NOT NULL, "is_suspended" bool NOT NULL);

-- Table : accounts_user_groups
CREATE TABLE "accounts_user_groups" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "user_id" bigint NOT NULL REFERENCES "accounts_user" ("id") DEFERRABLE INITIALLY DEFERRED, "group_id" integer NOT NULL REFERENCES "auth_group" ("id") DEFERRABLE INITIALLY DEFERRED);

-- Table : accounts_user_user_permissions
CREATE TABLE "accounts_user_user_permissions" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "user_id" bigint NOT NULL REFERENCES "accounts_user" ("id") DEFERRABLE INITIALLY DEFERRED, "permission_id" integer NOT NULL REFERENCES "auth_permission" ("id") DEFERRABLE INITIALLY DEFERRED);

-- Table : django_admin_log
CREATE TABLE "django_admin_log" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "object_id" text NULL, "object_repr" varchar(200) NOT NULL, "action_flag" smallint unsigned NOT NULL CHECK ("action_flag" >= 0), "change_message" text NOT NULL, "content_type_id" integer NULL REFERENCES "django_content_type" ("id") DEFERRABLE INITIALLY DEFERRED, "user_id" bigint NOT NULL REFERENCES "accounts_user" ("id") DEFERRABLE INITIALLY DEFERRED, "action_time" datetime NOT NULL);

-- Table : parrainage_badge
CREATE TABLE "parrainage_badge" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "code" varchar(50) NOT NULL UNIQUE, "libelle" varchar(100) NOT NULL, "description" text NOT NULL);

-- Table : parrainage_demandeparrainage
CREATE TABLE "parrainage_demandeparrainage" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "statut" varchar(20) NOT NULL, "message_introduction" text NOT NULL, "date_creation" datetime NOT NULL, "date_reponse" datetime NULL, "date_fin" datetime NULL, "filleul_id" bigint NOT NULL REFERENCES "accounts_user" ("id") DEFERRABLE INITIALLY DEFERRED, "parrain_id" bigint NOT NULL REFERENCES "accounts_user" ("id") DEFERRABLE INITIALLY DEFERRED, "annee_academique_id" bigint NULL REFERENCES "parrainage_anneeacademique" ("id") DEFERRABLE INITIALLY DEFERRED);

-- Table : parrainage_avis
CREATE TABLE "parrainage_avis" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "note" smallint unsigned NOT NULL CHECK ("note" >= 0), "commentaire" text NOT NULL, "date_creation" datetime NOT NULL, "auteur_id" bigint NOT NULL REFERENCES "accounts_user" ("id") DEFERRABLE INITIALLY DEFERRED, "parrainage_id" bigint NOT NULL REFERENCES "parrainage_demandeparrainage" ("id") DEFERRABLE INITIALLY DEFERRED);

-- Table : parrainage_evenement
CREATE TABLE "parrainage_evenement" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "titre" varchar(200) NOT NULL, "description" text NOT NULL, "date_heure" datetime NOT NULL, "lieu" varchar(255) NOT NULL, "places_max" integer unsigned NULL CHECK ("places_max" >= 0), "date_creation" datetime NOT NULL, "organisateur_id" bigint NOT NULL REFERENCES "accounts_user" ("id") DEFERRABLE INITIALLY DEFERRED, "annee_academique_id" bigint NULL REFERENCES "parrainage_anneeacademique" ("id") DEFERRABLE INITIALLY DEFERRED);

-- Table : parrainage_inscriptionevenement
CREATE TABLE "parrainage_inscriptionevenement" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "date_inscription" datetime NOT NULL, "evenement_id" bigint NOT NULL REFERENCES "parrainage_evenement" ("id") DEFERRABLE INITIALLY DEFERRED, "participant_id" bigint NOT NULL REFERENCES "accounts_user" ("id") DEFERRABLE INITIALLY DEFERRED);

-- Table : parrainage_message
CREATE TABLE "parrainage_message" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "contenu" text NOT NULL, "date_envoi" datetime NOT NULL, "lu" bool NOT NULL, "expediteur_id" bigint NOT NULL REFERENCES "accounts_user" ("id") DEFERRABLE INITIALLY DEFERRED, "parrainage_id" bigint NOT NULL REFERENCES "parrainage_demandeparrainage" ("id") DEFERRABLE INITIALLY DEFERRED);

-- Table : parrainage_rendezvous
CREATE TABLE "parrainage_rendezvous" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "titre" varchar(200) NOT NULL, "date_heure" datetime NOT NULL, "lieu" varchar(255) NOT NULL, "statut" varchar(30) NOT NULL, "rappel_envoye" bool NOT NULL, "organisateur_id" bigint NOT NULL REFERENCES "accounts_user" ("id") DEFERRABLE INITIALLY DEFERRED, "parrainage_id" bigint NOT NULL REFERENCES "parrainage_demandeparrainage" ("id") DEFERRABLE INITIALLY DEFERRED);

-- Table : parrainage_badgeattribution
CREATE TABLE "parrainage_badgeattribution" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "date_attribution" datetime NOT NULL, "badge_id" bigint NOT NULL REFERENCES "parrainage_badge" ("id") DEFERRABLE INITIALLY DEFERRED, "parrain_id" bigint NOT NULL REFERENCES "accounts_user" ("id") DEFERRABLE INITIALLY DEFERRED);

-- Table : django_session
CREATE TABLE "django_session" ("session_key" varchar(40) NOT NULL PRIMARY KEY, "session_data" text NOT NULL, "expire_date" datetime NOT NULL);

-- Table : accounts_profilparrain
CREATE TABLE "accounts_profilparrain" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "ambitions" text NOT NULL, "motivations" text NOT NULL, "projets" text NOT NULL, "points_forts" text NOT NULL, "points_faibles" text NOT NULL, "centres_interet" varchar(255) NOT NULL, "disponible" bool NOT NULL, "score_fiabilite" decimal NOT NULL, "date_mise_a_jour" datetime NOT NULL, "utilisateur_id" bigint NOT NULL UNIQUE REFERENCES "accounts_user" ("id") DEFERRABLE INITIALLY DEFERRED, "reconduction_confirmee" bool NOT NULL);

-- Table : parrainage_anneeacademique
CREATE TABLE "parrainage_anneeacademique" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "libelle" varchar(20) NOT NULL, "date_debut" date NOT NULL, "date_fin" date NOT NULL, "est_active" bool NOT NULL);

-- Table : concours_anneeconcours
CREATE TABLE "concours_anneeconcours" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "annee" varchar(30) NOT NULL, "date_limite" date NOT NULL, "frais_fcfa" integer unsigned NOT NULL CHECK ("frais_fcfa" >= 0), "active" bool NOT NULL);

-- Table : bibliotheque_ressourcedocument
CREATE TABLE "bibliotheque_ressourcedocument" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "titre" varchar(200) NOT NULL, "categorie" varchar(20) NOT NULL, "resume" text NOT NULL, "fichier" varchar(100) NULL, "lien_externe" varchar(200) NOT NULL, "publie" bool NOT NULL, "reserve_etudiants" bool NOT NULL, "ordre" smallint unsigned NOT NULL CHECK ("ordre" >= 0), "date_publication" datetime NOT NULL, "date_mise_a_jour" datetime NOT NULL);

-- Table : bibliotheque_mediabibliotheque
CREATE TABLE "bibliotheque_mediabibliotheque" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "titre" varchar(200) NOT NULL, "type_media" varchar(10) NOT NULL, "fichier" varchar(100) NULL, "video_url" varchar(200) NOT NULL, "legende" text NOT NULL, "ordre" smallint unsigned NOT NULL CHECK ("ordre" >= 0), "publie" bool NOT NULL, "date_creation" datetime NOT NULL);

-- Table : concours_inscriptionconcours
CREATE TABLE "concours_inscriptionconcours" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(120) NOT NULL, "prenom" varchar(120) NOT NULL, "moyenne_examen" decimal NOT NULL, "identite_collante_bac" varchar(80) NOT NULL, "filiere_choix_1" varchar(120) NOT NULL, "filiere_choix_2" varchar(120) NOT NULL, "filiere_choix_3" varchar(120) NOT NULL, "email" varchar(254) NOT NULL, "date_inscription" datetime NOT NULL, "annee_academique_id" bigint NULL REFERENCES "parrainage_anneeacademique" ("id") DEFERRABLE INITIALLY DEFERRED, "cni_document" varchar(100) NULL, "collante_bac" varchar(100) NULL, "photo_candidat" varchar(100) NULL, "statut" varchar(20) NOT NULL, "type_piece_cni" varchar(20) NOT NULL);

-- Table : formations_filiere
CREATE TABLE "formations_filiere" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "slug" varchar(80) NOT NULL UNIQUE, "nom" varchar(200) NOT NULL, "code" varchar(30) NOT NULL, "type_formation" varchar(10) NOT NULL, "duree" varchar(120) NOT NULL, "resume" text NOT NULL, "description" text NOT NULL, "conditions_admission" text NOT NULL, "debouches" text NOT NULL, "image" varchar(100) NULL, "image_hero" varchar(100) NULL, "ordre" smallint unsigned NOT NULL CHECK ("ordre" >= 0), "publie" bool NOT NULL, "date_mise_a_jour" datetime NOT NULL, "cours" text NOT NULL);

-- Table : formations_specialite
CREATE TABLE "formations_specialite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "code" varchar(20) NOT NULL, "nom" varchar(200) NOT NULL, "description" text NOT NULL, "debouches" text NOT NULL, "ordre" smallint unsigned NOT NULL CHECK ("ordre" >= 0), "filiere_id" bigint NOT NULL REFERENCES "formations_filiere" ("id") DEFERRABLE INITIALLY DEFERRED, "cours" text NOT NULL);

-- ---------------------------------------------------------
-- Index
-- ---------------------------------------------------------

-- Index : django_content_type_app_label_model_76bd3d3b_uniq
CREATE UNIQUE INDEX "django_content_type_app_label_model_76bd3d3b_uniq" ON "django_content_type" ("app_label", "model");

-- Index : auth_group_permissions_group_id_permission_id_0cd325b0_uniq
CREATE UNIQUE INDEX "auth_group_permissions_group_id_permission_id_0cd325b0_uniq" ON "auth_group_permissions" ("group_id", "permission_id");

-- Index : auth_group_permissions_group_id_b120cbf9
CREATE INDEX "auth_group_permissions_group_id_b120cbf9" ON "auth_group_permissions" ("group_id");

-- Index : auth_group_permissions_permission_id_84c5c92e
CREATE INDEX "auth_group_permissions_permission_id_84c5c92e" ON "auth_group_permissions" ("permission_id");

-- Index : auth_permission_content_type_id_codename_01ab375a_uniq
CREATE UNIQUE INDEX "auth_permission_content_type_id_codename_01ab375a_uniq" ON "auth_permission" ("content_type_id", "codename");

-- Index : auth_permission_content_type_id_2f476e4b
CREATE INDEX "auth_permission_content_type_id_2f476e4b" ON "auth_permission" ("content_type_id");

-- Index : accounts_user_groups_user_id_group_id_59c0b32f_uniq
CREATE UNIQUE INDEX "accounts_user_groups_user_id_group_id_59c0b32f_uniq" ON "accounts_user_groups" ("user_id", "group_id");

-- Index : accounts_user_groups_user_id_52b62117
CREATE INDEX "accounts_user_groups_user_id_52b62117" ON "accounts_user_groups" ("user_id");

-- Index : accounts_user_groups_group_id_bd11a704
CREATE INDEX "accounts_user_groups_group_id_bd11a704" ON "accounts_user_groups" ("group_id");

-- Index : accounts_user_user_permissions_user_id_permission_id_2ab516c2_uniq
CREATE UNIQUE INDEX "accounts_user_user_permissions_user_id_permission_id_2ab516c2_uniq" ON "accounts_user_user_permissions" ("user_id", "permission_id");

-- Index : accounts_user_user_permissions_user_id_e4f0a161
CREATE INDEX "accounts_user_user_permissions_user_id_e4f0a161" ON "accounts_user_user_permissions" ("user_id");

-- Index : accounts_user_user_permissions_permission_id_113bb443
CREATE INDEX "accounts_user_user_permissions_permission_id_113bb443" ON "accounts_user_user_permissions" ("permission_id");

-- Index : django_admin_log_content_type_id_c4bce8eb
CREATE INDEX "django_admin_log_content_type_id_c4bce8eb" ON "django_admin_log" ("content_type_id");

-- Index : django_admin_log_user_id_c564eba6
CREATE INDEX "django_admin_log_user_id_c564eba6" ON "django_admin_log" ("user_id");

-- Index : unique_demande_en_attente
CREATE UNIQUE INDEX "unique_demande_en_attente" ON "parrainage_demandeparrainage" ("filleul_id", "parrain_id") WHERE "statut" = 'en_attente';

-- Index : parrainage_inscriptionevenement_evenement_id_participant_id_1867bff8_uniq
CREATE UNIQUE INDEX "parrainage_inscriptionevenement_evenement_id_participant_id_1867bff8_uniq" ON "parrainage_inscriptionevenement" ("evenement_id", "participant_id");

-- Index : parrainage_demandeparrainage_filleul_id_e615dea8
CREATE INDEX "parrainage_demandeparrainage_filleul_id_e615dea8" ON "parrainage_demandeparrainage" ("filleul_id");

-- Index : parrainage_demandeparrainage_parrain_id_d929b166
CREATE INDEX "parrainage_demandeparrainage_parrain_id_d929b166" ON "parrainage_demandeparrainage" ("parrain_id");

-- Index : parrainage_avis_auteur_id_40190fe7
CREATE INDEX "parrainage_avis_auteur_id_40190fe7" ON "parrainage_avis" ("auteur_id");

-- Index : parrainage_avis_parrainage_id_ee22c66e
CREATE INDEX "parrainage_avis_parrainage_id_ee22c66e" ON "parrainage_avis" ("parrainage_id");

-- Index : parrainage_evenement_organisateur_id_299d1c79
CREATE INDEX "parrainage_evenement_organisateur_id_299d1c79" ON "parrainage_evenement" ("organisateur_id");

-- Index : parrainage_inscriptionevenement_evenement_id_42ca1946
CREATE INDEX "parrainage_inscriptionevenement_evenement_id_42ca1946" ON "parrainage_inscriptionevenement" ("evenement_id");

-- Index : parrainage_inscriptionevenement_participant_id_610713bd
CREATE INDEX "parrainage_inscriptionevenement_participant_id_610713bd" ON "parrainage_inscriptionevenement" ("participant_id");

-- Index : parrainage_message_expediteur_id_fead47aa
CREATE INDEX "parrainage_message_expediteur_id_fead47aa" ON "parrainage_message" ("expediteur_id");

-- Index : parrainage_message_parrainage_id_b362c9d0
CREATE INDEX "parrainage_message_parrainage_id_b362c9d0" ON "parrainage_message" ("parrainage_id");

-- Index : parrainage_rendezvous_organisateur_id_3c0b2631
CREATE INDEX "parrainage_rendezvous_organisateur_id_3c0b2631" ON "parrainage_rendezvous" ("organisateur_id");

-- Index : parrainage_rendezvous_parrainage_id_6d0b56f1
CREATE INDEX "parrainage_rendezvous_parrainage_id_6d0b56f1" ON "parrainage_rendezvous" ("parrainage_id");

-- Index : parrainage_badgeattribution_parrain_id_badge_id_21dab88c_uniq
CREATE UNIQUE INDEX "parrainage_badgeattribution_parrain_id_badge_id_21dab88c_uniq" ON "parrainage_badgeattribution" ("parrain_id", "badge_id");

-- Index : parrainage_badgeattribution_badge_id_902bd7b2
CREATE INDEX "parrainage_badgeattribution_badge_id_902bd7b2" ON "parrainage_badgeattribution" ("badge_id");

-- Index : parrainage_badgeattribution_parrain_id_65f6c747
CREATE INDEX "parrainage_badgeattribution_parrain_id_65f6c747" ON "parrainage_badgeattribution" ("parrain_id");

-- Index : django_session_expire_date_a5c62663
CREATE INDEX "django_session_expire_date_a5c62663" ON "django_session" ("expire_date");

-- Index : parrainage_demandeparrainage_annee_academique_id_d9e6404a
CREATE INDEX "parrainage_demandeparrainage_annee_academique_id_d9e6404a" ON "parrainage_demandeparrainage" ("annee_academique_id");

-- Index : parrainage_evenement_annee_academique_id_017c17d9
CREATE INDEX "parrainage_evenement_annee_academique_id_017c17d9" ON "parrainage_evenement" ("annee_academique_id");

-- Index : concours_inscriptionconcours_annee_academique_id_08c3f99f
CREATE INDEX "concours_inscriptionconcours_annee_academique_id_08c3f99f" ON "concours_inscriptionconcours" ("annee_academique_id");

-- Index : formations_specialite_filiere_id_14708241
CREATE INDEX "formations_specialite_filiere_id_14708241" ON "formations_specialite" ("filiere_id");

