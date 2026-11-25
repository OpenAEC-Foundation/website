// Het forum van OpenAEC: de pagina staat hier, de gegevens en de accounts op de cloud (openaec_cloud.forum).
// Lezen kan iedereen; schrijven met een OpenAEC-account (inloggen via de cloud, OAuth met PKCE, client `forum`).
// Aanmelden vanaf het forum maakt een account zonder omgeving (bron=forum) en komt daarna hier terug.
(function () {
  'use strict';

  // De cloud kent alleen https://open-aec.com/forum/ als terugadres: op www zou inloggen een 400 geven.
  if (location.hostname === 'www.open-aec.com') {
    location.replace('https://open-aec.com' + location.pathname + location.search + location.hash);
    return;
  }

  var LOKAAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  // Lokaal (npx serve) de ontwikkelbench; met `openaec-forum-cloud` in localStorage een andere (bijvoorbeeld een
  // tweede server met nieuwe code).
  var CLOUD = 'https://cloud.open-aec.eu';
  if (LOKAAL) {
    try { CLOUD = localStorage.getItem('openaec-forum-cloud') || 'http://cloud.open-aec.localhost:8000'; } catch (e) { CLOUD = 'http://cloud.open-aec.localhost:8000'; }
  }
  var API = CLOUD + '/api/method/openaec_cloud.forum.';
  var OAUTH = CLOUD + '/api/method/frappe.integrations.oauth2.';
  var CLIENT = 'forum';
  var SCOPE = 'openid email profile forum';
  var TERUG = location.origin + '/forum/';
  var SESSIE = 'openaec-forum-sessie';
  var PKCE = 'openaec-forum-pkce';
  // De SuperCloud is nog niet publiek: het forum noemt hem niet zolang dit uit staat.
  var TOON_SUPERCLOUD = false;

  // ── Teksten ─────────────────────────────────────────────────────────────
  var T = {
    nl: {
      titel: 'Forum', label: 'Community',
      lead: 'Stel een vraag, deel een idee of laat zien wat je met de OpenAEC-tools maakt.',
      inloggen: 'Inloggen', uitloggen: 'Uitloggen', aanmelden: 'Account maken',
      ingelogdAls: 'Ingelogd als', nieuw: 'Nieuw onderwerp', categorieen: 'Categorieën',
      recent: 'Recente onderwerpen', alle: 'Alle onderwerpen', geen: 'Nog geen onderwerpen. Begin het eerste!',
      reacties: function (n) { return n === 1 ? '1 reactie' : n + ' reacties'; },
      onderwerpen: function (n) { return n === 1 ? '1 onderwerp' : n + ' onderwerpen'; },
      meer: 'Meer laden', terug: '← Terug naar het forum', reageren: 'Reageren', plaatsen: 'Plaatsen',
      jouwReactie: 'Jouw reactie', titelVeld: 'Titel', berichtVeld: 'Bericht', categorieVeld: 'Categorie',
      opmaak: 'Platte tekst. Een lege regel begint een nieuwe alinea, links worden klikbaar en ``` zet code apart. Een afbeelding voeg je toe met de knop of plak je met Ctrl+V.',
      logInOmTeReageren: 'Log in met je OpenAEC-account om te reageren.',
      logInOmTeSchrijven: 'Log in met je OpenAEC-account om een onderwerp te beginnen.',
      gesloten: 'Dit onderwerp is gesloten.', vastgezet: 'Vastgezet', verborgen: 'Verborgen', team: 'Team',
      bewerken: 'Bewerken', opslaan: 'Opslaan', annuleren: 'Annuleren', bewerkt: 'bewerkt',
      verberg: 'Verbergen', toon: 'Tonen', sluit: 'Sluiten', open: 'Heropenen', zetVast: 'Vastzetten', maakLos: 'Losmaken',
      laden: 'Laden…', fout: 'Er ging iets mis. Probeer het opnieuw.', onbekend: 'Dit onderwerp bestaat niet (meer).',
      alleenTeam: 'Hier beginnen alleen teamleden een onderwerp.',
      aanmeldKop: 'Maak je gratis OpenAEC-account',
      aanmeldUitleg: 'Met één account schrijf je op het forum en gebruik je straks ook de OpenAEC-tools. Je krijgt een mail om je adres te bevestigen en een wachtwoord te kiezen; daarna kom je hier terug.',
      naam: 'Naam', email: 'E-mailadres',
      akkoord: 'Ik ga akkoord met de <a href="/supercloud/privacy/">privacyverklaring</a> en de <a href="/forum/#/regels">forumregels</a>.',
      versturen: 'Account maken', alAccount: 'Heb je al een OpenAEC-account?',
      regelsKop: 'Forumregels',
      regels: ['Wees vriendelijk en help elkaar; iedereen is ooit begonnen.', 'Blijf bij het onderwerp: open source in de bouw en de OpenAEC-tools.', 'Geen reclame, spam of persoonsgegevens van anderen.', 'Een bug in een tool? Meld hem ook op GitHub, met de versie en wat je deed.', 'Moderatoren kunnen berichten verbergen en onderwerpen sluiten.'],
      upsellKop: 'Meer met je account',
      upsell: 'Met hetzelfde account gebruik je de OpenAEC-tools in de browser en de SuperCloud.',
      upsellKnop: 'Bekijk de SuperCloud',
      categorie: 'Categorie',
      onderwerpenKop: 'Onderwerpen',
      onderwerpKop: 'Onderwerp',
      reactiesKop: 'Reacties',
      activiteit: 'Activiteit',
      alleRecent: 'Alle recente onderwerpen',
      alleenTeamKort: 'Alleen het team start hier',
      foraKop: 'Andere fora',
      foraUitleg: 'Open source in de bouw is groter dan wij. Hier praten we ook mee:',
      foraOsarch: 'Open source in de bouw: Bonsai, IfcOpenShell en meer',
      foraSpeckle: 'Modellen delen tussen ontwerpprogramma\'s',
      foraFrappe: 'ERPNext en Frappe Framework',
      foraBlender: 'De grote community van Blender-gebruikers',
      badgesKop: 'Badges via de Academy',
      badgesUitleg: 'Rond je een cursus van de OpenAEC Academy af met een examen, dan krijg je een badge op je profiel. Met een verzameling badges word je allround kennisgoeroe.',
      binnenkort: 'Binnenkort',
      naarAcademy: 'Naar de Academy',
      verlopen: 'Je bent uitgelogd. Log opnieuw in.',
      verwijderen: 'Verwijderen', verwijderVraag: 'Dit bericht verwijderen? Dat kan niet ongedaan worden gemaakt.', verwijderOnderwerpVraag: 'Dit onderwerp met alle reacties verwijderen? Dat kan niet ongedaan worden gemaakt.',
      afbeelding: 'Afbeelding toevoegen', afbeeldingBezig: 'Afbeelding uploaden…', afbeeldingAlt: 'Afbeelding bij het bericht',
      profiel: 'Mijn profiel', lidSinds: 'Lid sinds', mijnOnderwerpen: 'Mijn onderwerpen', geenEigen: 'Je hebt nog geen onderwerp gestart.', logInVoorProfiel: 'Log in om je profiel te zien.', upsellKnopIn: 'Open je SuperCloud',
      landenKop: 'Forum per land', landenUitleg: 'In je eigen taal, met de tools voor jouw land', landLead: 'Praat in je eigen taal over bouwen in dit land. Hier staan ook de tools die vooral in dit land van pas komen.', landTools: 'Tools voor dit land',
      toolsKop: 'Tools', opGithub: 'Bekijk op GitHub', toolsUitleg: 'Met de issues van GitHub',
      ookOpGithub: 'Dit onderwerp hoort bij een issue op GitHub. Je bericht komt daar ook te staan, met je forumnaam; een GitHub-account heb je niet nodig.',
      discussie: 'Discussie', discussies: 'Discussies', githubMirror: 'GitHub Mirror', herkomstUitleg: 'Discussies zijn gesprekken op het forum. GitHub Mirror is de ontwikkeling: de issues van deze tool op GitHub.', geenDiscussies: 'Nog geen discussies over deze tool. Begin de eerste!', soortOnderwerp: 'Wat voor onderwerp is dit?', soortDiscussie: 'Discussie', soortDiscussieUitleg: 'Een vraag, idee of gesprek. Blijft op het forum.', soortIssue: 'Melding voor de ontwikkelaars', soortIssueUitleg: 'Een bug of een concrete wens. Wordt ook een issue op GitHub, met je forumnaam; een GitHub-account heb je niet nodig.', maakIssue: 'Maak er een issue van',
      community: 'Community',
      ontwikkeling: 'Ontwikkeling en AI',
      alles: 'Alles',
      soortUitleg: 'Community: gesprekken van mensen. Ontwikkeling en AI: werk van het team op GitHub, bots en teksten met AI.',
      metAi: 'Ik heb dit met AI geschreven',
      fotoKiezen: 'Foto kiezen',
      fotoWeg: 'Foto verwijderen',
      mijnReacties: 'Mijn reacties',
      overJou: 'Over jou', pBeroep: 'Beroepsgroepen', beroepUitleg: 'Kies er één of meer: ze staan als labels bij je naam op het forum.', pBedrijf: 'Bedrijf', pFunctie: 'Functie', pPlaats: 'Plaats', pOver: 'Over mij', pWebsite: 'Website', pLinkedin: 'LinkedIn', pGithub: 'GitHub-account', toonAnderen: 'Zichtbaar voor anderen', zichtbaarUitleg: 'Anderen zien alleen wat je aanvinkt. Je naam en foto staan altijd bij je berichten; je e-mailadres tonen we nooit.', profielBewaard: 'Je profiel is bewaard.', openbaarProfiel: 'Bekijk je openbare profiel', profielVan: 'Profiel', geenOnderwerpenLid: 'Nog geen onderwerpen.', geenReactiesLid: 'Nog geen reacties.', linkedinHulp: 'De link naar je profiel, of alleen je LinkedIn-naam.',
      geenReacties: 'Je hebt nog niet gereageerd.',
      githubAccount: 'GitHub-account',
      githubKoppelen: 'Koppel je GitHub-account',
      githubUitleg: 'Wat je op GitHub schrijft, staat dan onder je naam en in je geschiedenis.',
      opmaakMd: 'Markdown werkt: **vet**, *cursief*, lijsten met -, kopjes met # en ``` voor code. Een afbeelding voeg je toe met de knop of plak je met Ctrl+V.',
      inlogKop: 'Inloggen bij OpenAEC', verderMet: 'Verder met', ofMail: 'of', metWachtwoord: 'Met e-mail en wachtwoord', nogGeenAccount: 'Nog geen account?', ofMetMail: 'of maak een account met je e-mailadres', gekoppeldMet: 'Inloggen met',
      inlogUitleg: 'Met Google, GitHub of Apple heb je geen apart wachtwoord nodig. Een nieuw adres wordt meteen een OpenAEC-account.'
    },
    en: {
      titel: 'Forum', label: 'Community',
      lead: 'Ask a question, share an idea or show what you make with the OpenAEC tools.',
      inloggen: 'Log in', uitloggen: 'Log out', aanmelden: 'Create account',
      ingelogdAls: 'Logged in as', nieuw: 'New topic', categorieen: 'Categories',
      recent: 'Recent topics', alle: 'All topics', geen: 'No topics yet. Start the first one!',
      reacties: function (n) { return n === 1 ? '1 reply' : n + ' replies'; },
      onderwerpen: function (n) { return n === 1 ? '1 topic' : n + ' topics'; },
      meer: 'Load more', terug: '← Back to the forum', reageren: 'Reply', plaatsen: 'Post',
      jouwReactie: 'Your reply', titelVeld: 'Title', berichtVeld: 'Message', categorieVeld: 'Category',
      opmaak: 'Plain text. A blank line starts a new paragraph, links become clickable and ``` sets code apart. Add an image with the button or paste it with Ctrl+V.',
      logInOmTeReageren: 'Log in with your OpenAEC account to reply.',
      logInOmTeSchrijven: 'Log in with your OpenAEC account to start a topic.',
      gesloten: 'This topic is closed.', vastgezet: 'Pinned', verborgen: 'Hidden', team: 'Team',
      bewerken: 'Edit', opslaan: 'Save', annuleren: 'Cancel', bewerkt: 'edited',
      verberg: 'Hide', toon: 'Show', sluit: 'Close', open: 'Reopen', zetVast: 'Pin', maakLos: 'Unpin',
      laden: 'Loading…', fout: 'Something went wrong. Please try again.', onbekend: 'This topic does not exist (any more).',
      alleenTeam: 'Only team members start topics here.',
      aanmeldKop: 'Create your free OpenAEC account',
      aanmeldUitleg: 'One account lets you post on the forum and later use the OpenAEC tools too. You will get an email to confirm your address and choose a password; then you come back here.',
      naam: 'Name', email: 'Email address',
      akkoord: 'I agree to the <a href="/supercloud/en/privacy/">privacy statement</a> and the <a href="/forum/#/regels">forum rules</a>.',
      versturen: 'Create account', alAccount: 'Already have an OpenAEC account?',
      regelsKop: 'Forum rules',
      regels: ['Be kind and help each other; everyone was a beginner once.', 'Stay on topic: open source in construction and the OpenAEC tools.', 'No advertising, spam or other people’s personal data.', 'Found a bug in a tool? Report it on GitHub too, with the version and what you did.', 'Moderators can hide posts and close topics.'],
      upsellKop: 'More with your account',
      upsell: 'The same account gives you the OpenAEC tools in the browser and the SuperCloud.',
      upsellKnop: 'Discover the SuperCloud',
      categorie: 'Category',
      onderwerpenKop: 'Topics',
      onderwerpKop: 'Topic',
      reactiesKop: 'Replies',
      activiteit: 'Activity',
      alleRecent: 'All recent topics',
      alleenTeamKort: 'Only the team starts topics here',
      foraKop: 'Other forums',
      foraUitleg: 'Open source in construction is bigger than us. We also take part here:',
      foraOsarch: 'Open source in construction: Bonsai, IfcOpenShell and more',
      foraSpeckle: 'Sharing models between design tools',
      foraFrappe: 'ERPNext and Frappe Framework',
      foraBlender: 'The large community of Blender users',
      badgesKop: 'Badges through the Academy',
      badgesUitleg: 'Finish a course of the OpenAEC Academy with an exam and you get a badge on your profile. Collect enough badges and you become an all-round expert.',
      binnenkort: 'Coming soon',
      naarAcademy: 'Go to the Academy',
      verlopen: 'You have been logged out. Please log in again.',
      verwijderen: 'Delete', verwijderVraag: 'Delete this post? This cannot be undone.', verwijderOnderwerpVraag: 'Delete this topic with all its replies? This cannot be undone.',
      afbeelding: 'Add image', afbeeldingBezig: 'Uploading image…', afbeeldingAlt: 'Image in the post',
      profiel: 'My profile', lidSinds: 'Member since', mijnOnderwerpen: 'My topics', geenEigen: 'You have not started a topic yet.', logInVoorProfiel: 'Log in to see your profile.', upsellKnopIn: 'Open your SuperCloud',
      landenKop: 'Forum by country', landenUitleg: 'In your own language, with the tools for your country', landLead: 'Talk in your own language about building in this country. The tools that are mainly useful here live here too.', landTools: 'Tools for this country',
      toolsKop: 'Tools', opGithub: 'View on GitHub', toolsUitleg: 'With the issues from GitHub',
      ookOpGithub: 'This topic belongs to an issue on GitHub. Your post appears there too, with your forum name; you do not need a GitHub account.',
      discussie: 'Discussion', discussies: 'Discussions', githubMirror: 'GitHub Mirror', herkomstUitleg: 'Discussions are conversations on the forum. GitHub Mirror is the development work: this tool’s issues on GitHub.', geenDiscussies: 'No discussions about this tool yet. Start the first one!', soortOnderwerp: 'What kind of topic is this?', soortDiscussie: 'Discussion', soortDiscussieUitleg: 'A question, idea or conversation. Stays on the forum.', soortIssue: 'Report for the developers', soortIssueUitleg: 'A bug or a concrete request. Also becomes an issue on GitHub, with your forum name; you do not need a GitHub account.', maakIssue: 'Turn into an issue',
      community: 'Community',
      ontwikkeling: 'Development and AI',
      alles: 'All',
      soortUitleg: 'Community: conversations between people. Development and AI: work by the team on GitHub, bots and texts written with AI.',
      metAi: 'I wrote this with AI',
      fotoKiezen: 'Choose photo',
      fotoWeg: 'Remove photo',
      mijnReacties: 'My replies',
      overJou: 'About you', pBeroep: 'Professions', beroepUitleg: 'Pick one or more: they appear as labels next to your name on the forum.', pBedrijf: 'Company', pFunctie: 'Role', pPlaats: 'Location', pOver: 'About me', pWebsite: 'Website', pLinkedin: 'LinkedIn', pGithub: 'GitHub account', toonAnderen: 'Visible to others', zichtbaarUitleg: 'Others only see what you tick. Your name and photo always appear with your posts; we never show your email address.', profielBewaard: 'Your profile has been saved.', openbaarProfiel: 'View your public profile', profielVan: 'Profile', geenOnderwerpenLid: 'No topics yet.', geenReactiesLid: 'No replies yet.', linkedinHulp: 'The link to your profile, or just your LinkedIn name.',
      geenReacties: 'You have not replied yet.',
      githubAccount: 'GitHub account',
      githubKoppelen: 'Link your GitHub account',
      githubUitleg: 'What you write on GitHub then appears under your name and in your history.',
      opmaakMd: 'Markdown works: **bold**, *italic*, lists with -, headings with # and ``` for code. Add an image with the button or paste it with Ctrl+V.',
      inlogKop: 'Log in to OpenAEC', verderMet: 'Continue with', ofMail: 'or', metWachtwoord: 'With email and password', nogGeenAccount: 'No account yet?', ofMetMail: 'or create an account with your email address', gekoppeldMet: 'Sign-in with',
      inlogUitleg: 'With Google, GitHub or Apple you need no separate password. A new address becomes an OpenAEC account right away.'
    },
    fr: {
      titel: 'Forum', label: 'Communauté',
      lead: 'Posez une question, partagez une idée ou montrez ce que vous réalisez avec les outils OpenAEC.',
      inloggen: 'Se connecter', uitloggen: 'Se déconnecter', aanmelden: 'Créer un compte',
      ingelogdAls: 'Connecté en tant que', nieuw: 'Nouveau sujet', categorieen: 'Catégories',
      recent: 'Sujets récents', alle: 'Tous les sujets', geen: 'Pas encore de sujets. Lancez le premier !',
      reacties: function (n) { return n === 1 ? '1 réponse' : n + ' réponses'; },
      onderwerpen: function (n) { return n === 1 ? '1 sujet' : n + ' sujets'; },
      meer: 'Charger plus', terug: '← Retour au forum', reageren: 'Répondre', plaatsen: 'Publier',
      jouwReactie: 'Votre réponse', titelVeld: 'Titre', berichtVeld: 'Message', categorieVeld: 'Catégorie',
      opmaak: 'Texte brut. Une ligne vide commence un nouveau paragraphe, les liens deviennent cliquables et ``` isole le code. Ajoutez une image avec le bouton ou collez-la avec Ctrl+V.',
      logInOmTeReageren: 'Connectez-vous avec votre compte OpenAEC pour répondre.',
      logInOmTeSchrijven: 'Connectez-vous avec votre compte OpenAEC pour lancer un sujet.',
      gesloten: 'Ce sujet est fermé.', vastgezet: 'Épinglé', verborgen: 'Masqué', team: 'Équipe',
      bewerken: 'Modifier', opslaan: 'Enregistrer', annuleren: 'Annuler', bewerkt: 'modifié',
      verberg: 'Masquer', toon: 'Afficher', sluit: 'Fermer', open: 'Rouvrir', zetVast: 'Épingler', maakLos: 'Désépingler',
      laden: 'Chargement…', fout: 'Une erreur s’est produite. Réessayez.', onbekend: 'Ce sujet n’existe pas (ou plus).',
      alleenTeam: 'Seule l’équipe lance des sujets ici.',
      aanmeldKop: 'Créez votre compte OpenAEC gratuit',
      aanmeldUitleg: 'Un seul compte pour écrire sur le forum et, bientôt, utiliser les outils OpenAEC. Vous recevrez un e-mail pour confirmer votre adresse et choisir un mot de passe, puis vous reviendrez ici.',
      naam: 'Nom', email: 'Adresse e-mail',
      akkoord: 'J’accepte la <a href="/supercloud/fr/confidentialite/">déclaration de confidentialité</a> et les <a href="/forum/#/regels">règles du forum</a>.',
      versturen: 'Créer un compte', alAccount: 'Vous avez déjà un compte OpenAEC ?',
      regelsKop: 'Règles du forum',
      regels: ['Soyez bienveillant et entraidez-vous ; tout le monde a été débutant.', 'Restez dans le sujet : l’open source dans la construction et les outils OpenAEC.', 'Pas de publicité, de spam ni de données personnelles d’autrui.', 'Un bug dans un outil ? Signalez-le aussi sur GitHub, avec la version et ce que vous avez fait.', 'Les modérateurs peuvent masquer des messages et fermer des sujets.'],
      upsellKop: 'Plus avec votre compte',
      upsell: 'Le même compte vous donne les outils OpenAEC dans le navigateur et le SuperCloud.',
      upsellKnop: 'Découvrir le SuperCloud',
      categorie: 'Catégorie',
      onderwerpenKop: 'Sujets',
      onderwerpKop: 'Sujet',
      reactiesKop: 'Réponses',
      activiteit: 'Activité',
      alleRecent: 'Tous les sujets récents',
      alleenTeamKort: 'Seule l’équipe lance des sujets ici',
      foraKop: 'Autres forums',
      foraUitleg: 'L’open source dans la construction dépasse notre cadre. Nous participons aussi ici :',
      foraOsarch: 'L’open source dans la construction : Bonsai, IfcOpenShell et plus',
      foraSpeckle: 'Partager des modèles entre logiciels de conception',
      foraFrappe: 'ERPNext et Frappe Framework',
      foraBlender: 'La grande communauté des utilisateurs de Blender',
      badgesKop: 'Des badges via l’Academy',
      badgesUitleg: 'Terminez un cours de l’OpenAEC Academy par un examen et vous obtenez un badge sur votre profil. Avec assez de badges, vous devenez un expert polyvalent.',
      binnenkort: 'Bientôt',
      naarAcademy: 'Vers l’Academy',
      verlopen: 'Vous avez été déconnecté. Reconnectez-vous.',
      verwijderen: 'Supprimer', verwijderVraag: 'Supprimer ce message ? Cette action est irréversible.', verwijderOnderwerpVraag: 'Supprimer ce sujet et toutes ses réponses ? Cette action est irréversible.',
      afbeelding: 'Ajouter une image', afbeeldingBezig: 'Envoi de l’image…', afbeeldingAlt: 'Image du message',
      profiel: 'Mon profil', lidSinds: 'Membre depuis', mijnOnderwerpen: 'Mes sujets', geenEigen: 'Vous n’avez pas encore lancé de sujet.', logInVoorProfiel: 'Connectez-vous pour voir votre profil.', upsellKnopIn: 'Ouvrir votre SuperCloud',
      landenKop: 'Forum par pays', landenUitleg: 'Dans votre langue, avec les outils pour votre pays', landLead: 'Échangez dans votre langue sur la construction dans ce pays. Les outils surtout utiles ici s’y trouvent aussi.', landTools: 'Outils pour ce pays',
      toolsKop: 'Outils', opGithub: 'Voir sur GitHub', toolsUitleg: 'Avec les issues de GitHub',
      ookOpGithub: 'Ce sujet est lié à une issue sur GitHub. Votre message y apparaît aussi, avec votre nom du forum ; aucun compte GitHub n’est nécessaire.',
      discussie: 'Discussion', discussies: 'Discussions', githubMirror: 'GitHub Mirror', herkomstUitleg: 'Les discussions sont des conversations sur le forum. GitHub Mirror, c’est le développement : les issues de cet outil sur GitHub.', geenDiscussies: 'Pas encore de discussion sur cet outil. Lancez la première !', soortOnderwerp: 'De quel type de sujet s’agit-il ?', soortDiscussie: 'Discussion', soortDiscussieUitleg: 'Une question, une idée ou un échange. Reste sur le forum.', soortIssue: 'Signalement pour les développeurs', soortIssueUitleg: 'Un bug ou une demande concrète. Devient aussi une issue sur GitHub, avec votre nom du forum ; un compte GitHub n’est pas nécessaire.', maakIssue: 'Transformer en issue',
      community: 'Communauté',
      ontwikkeling: 'Développement et IA',
      alles: 'Tout',
      soortUitleg: 'Communauté : conversations entre personnes. Développement et IA : travail de l’équipe sur GitHub, bots et textes écrits avec l’IA.',
      metAi: 'J’ai écrit ceci avec l’IA',
      fotoKiezen: 'Choisir une photo',
      fotoWeg: 'Supprimer la photo',
      mijnReacties: 'Mes réponses',
      overJou: 'À propos de vous', pBeroep: 'Professions', beroepUitleg: 'Choisissez-en une ou plusieurs : elles s’affichent comme étiquettes à côté de votre nom sur le forum.', pBedrijf: 'Entreprise', pFunctie: 'Fonction', pPlaats: 'Lieu', pOver: 'À propos de moi', pWebsite: 'Site web', pLinkedin: 'LinkedIn', pGithub: 'Compte GitHub', toonAnderen: 'Visible par les autres', zichtbaarUitleg: 'Les autres ne voient que ce que vous cochez. Votre nom et votre photo accompagnent toujours vos messages ; nous n’affichons jamais votre adresse e-mail.', profielBewaard: 'Votre profil a été enregistré.', openbaarProfiel: 'Voir votre profil public', profielVan: 'Profil', geenOnderwerpenLid: 'Pas encore de sujets.', geenReactiesLid: 'Pas encore de réponses.', linkedinHulp: 'Le lien vers votre profil, ou seulement votre nom LinkedIn.',
      geenReacties: 'Vous n’avez pas encore répondu.',
      githubAccount: 'Compte GitHub',
      githubKoppelen: 'Lier votre compte GitHub',
      githubUitleg: 'Ce que vous écrivez sur GitHub apparaît alors sous votre nom et dans votre historique.',
      opmaakMd: 'Markdown fonctionne : **gras**, *italique*, listes avec -, titres avec # et ``` pour le code. Ajoutez une image avec le bouton ou collez-la avec Ctrl+V.',
      inlogKop: 'Se connecter à OpenAEC', verderMet: 'Continuer avec', ofMail: 'ou', metWachtwoord: 'Avec e-mail et mot de passe', nogGeenAccount: 'Pas encore de compte ?', ofMetMail: 'ou créez un compte avec votre adresse e-mail', gekoppeldMet: 'Connexion avec',
      inlogUitleg: 'Avec Google, GitHub ou Apple, pas besoin de mot de passe séparé. Une nouvelle adresse devient aussitôt un compte OpenAEC.'
    },
    tr: {
      titel: 'Forum', label: 'Topluluk',
      lead: 'Bir soru sorun, bir fikir paylaşın ya da OpenAEC araçlarıyla yaptıklarınızı gösterin.',
      inloggen: 'Giriş yap', uitloggen: 'Çıkış yap', aanmelden: 'Hesap oluştur',
      ingelogdAls: 'Giriş yapan', nieuw: 'Yeni konu', categorieen: 'Kategoriler',
      recent: 'Son konular', alle: 'Tüm konular', geen: 'Henüz konu yok. İlkini siz başlatın!',
      reacties: function (n) { return n + ' yanıt'; },
      onderwerpen: function (n) { return n + ' konu'; },
      meer: 'Daha fazla yükle', terug: '← Foruma dön', reageren: 'Yanıtla', plaatsen: 'Gönder',
      jouwReactie: 'Yanıtınız', titelVeld: 'Başlık', berichtVeld: 'Mesaj', categorieVeld: 'Kategori',
      opmaak: 'Düz metin. Boş satır yeni paragraf başlatır, bağlantılar tıklanabilir olur ve ``` kodu ayırır. Görseli düğmeyle ekleyin ya da Ctrl+V ile yapıştırın.',
      logInOmTeReageren: 'Yanıtlamak için OpenAEC hesabınızla giriş yapın.',
      logInOmTeSchrijven: 'Konu başlatmak için OpenAEC hesabınızla giriş yapın.',
      gesloten: 'Bu konu kapatıldı.', vastgezet: 'Sabitlendi', verborgen: 'Gizli', team: 'Ekip',
      bewerken: 'Düzenle', opslaan: 'Kaydet', annuleren: 'İptal', bewerkt: 'düzenlendi',
      verberg: 'Gizle', toon: 'Göster', sluit: 'Kapat', open: 'Yeniden aç', zetVast: 'Sabitle', maakLos: 'Sabitlemeyi kaldır',
      laden: 'Yükleniyor…', fout: 'Bir şeyler ters gitti. Lütfen tekrar deneyin.', onbekend: 'Bu konu yok (artık).',
      alleenTeam: 'Burada yalnızca ekip üyeleri konu başlatır.',
      aanmeldKop: 'Ücretsiz OpenAEC hesabınızı oluşturun',
      aanmeldUitleg: 'Tek bir hesapla forumda yazar, yakında OpenAEC araçlarını da kullanırsınız. Adresinizi onaylamanız ve bir parola seçmeniz için bir e-posta alacaksınız; ardından buraya dönersiniz.',
      naam: 'Ad', email: 'E-posta adresi',
      akkoord: '<a href="/supercloud/tr/gizlilik/">Gizlilik bildirimini</a> ve <a href="/forum/#/regels">forum kurallarını</a> kabul ediyorum.',
      versturen: 'Hesap oluştur', alAccount: 'Zaten bir OpenAEC hesabınız var mı?',
      regelsKop: 'Forum kuralları',
      regels: ['Nazik olun ve birbirinize yardım edin; herkes bir zamanlar acemiydi.', 'Konudan sapmayın: inşaatta açık kaynak ve OpenAEC araçları.', 'Reklam, spam ya da başkalarının kişisel verileri yok.', 'Bir araçta hata mı buldunuz? Sürümü ve ne yaptığınızı belirterek GitHub’da da bildirin.', 'Moderatörler mesajları gizleyebilir ve konuları kapatabilir.'],
      upsellKop: 'Hesabınızla daha fazlası',
      upsell: 'Aynı hesapla tarayıcıda OpenAEC araçlarını ve SuperCloud’u kullanırsınız.',
      upsellKnop: 'SuperCloud’u keşfedin',
      categorie: 'Kategori',
      onderwerpenKop: 'Konular',
      onderwerpKop: 'Konu',
      reactiesKop: 'Yanıtlar',
      activiteit: 'Etkinlik',
      alleRecent: 'Tüm son konular',
      alleenTeamKort: 'Burada yalnızca ekip konu başlatır',
      foraKop: 'Diğer forumlar',
      foraUitleg: 'İnşaatta açık kaynak bizden büyük. Buralarda da varız:',
      foraOsarch: 'İnşaatta açık kaynak: Bonsai, IfcOpenShell ve daha fazlası',
      foraSpeckle: 'Tasarım programları arasında model paylaşımı',
      foraFrappe: 'ERPNext ve Frappe Framework',
      foraBlender: 'Blender kullanıcılarının büyük topluluğu',
      badgesKop: 'Academy ile rozetler',
      badgesUitleg: 'OpenAEC Academy\'de bir kursu sınavla bitirin, profilinize bir rozet eklensin. Yeterince rozet toplayan çok yönlü bir uzman olur.',
      binnenkort: 'Yakında',
      naarAcademy: 'Academy\'ye git',
      verlopen: 'Oturumunuz kapandı. Lütfen tekrar giriş yapın.',
      verwijderen: 'Sil', verwijderVraag: 'Bu mesaj silinsin mi? Bu işlem geri alınamaz.', verwijderOnderwerpVraag: 'Bu konu tüm yanıtlarıyla silinsin mi? Bu işlem geri alınamaz.',
      afbeelding: 'Görsel ekle', afbeeldingBezig: 'Görsel yükleniyor…', afbeeldingAlt: 'Mesajdaki görsel',
      profiel: 'Profilim', lidSinds: 'Üyelik başlangıcı', mijnOnderwerpen: 'Konularım', geenEigen: 'Henüz bir konu başlatmadınız.', logInVoorProfiel: 'Profilinizi görmek için giriş yapın.', upsellKnopIn: 'SuperCloud’unuzu açın',
      landenKop: 'Ülkeye göre forum', landenUitleg: 'Kendi dilinizde, ülkenize özel araçlarla', landLead: 'Bu ülkede yapı hakkında kendi dilinizde konuşun. Özellikle burada işe yarayan araçlar da burada.', landTools: 'Bu ülke için araçlar',
      toolsKop: 'Araçlar', opGithub: 'GitHub’da görüntüle', toolsUitleg: 'GitHub kayıtlarıyla birlikte',
      ookOpGithub: 'Bu konu GitHub’daki bir kayda bağlı. Mesajınız forum adınızla orada da görünür; GitHub hesabı gerekmez.',
      discussie: 'Tartışma', discussies: 'Tartışmalar', githubMirror: 'GitHub Mirror', herkomstUitleg: 'Tartışmalar forumdaki konuşmalardır. GitHub Mirror geliştirme tarafıdır: bu aracın GitHub’daki kayıtları.', geenDiscussies: 'Bu araç hakkında henüz tartışma yok. İlkini siz başlatın!', soortOnderwerp: 'Bu nasıl bir konu?', soortDiscussie: 'Tartışma', soortDiscussieUitleg: 'Bir soru, fikir veya sohbet. Forumda kalır.', soortIssue: 'Geliştiricilere bildirim', soortIssueUitleg: 'Bir hata veya somut bir istek. Forum adınızla GitHub’da da bir kayıt olur; GitHub hesabı gerekmez.', maakIssue: 'GitHub kaydına dönüştür',
      community: 'Topluluk',
      ontwikkeling: 'Geliştirme ve YZ',
      alles: 'Tümü',
      soortUitleg: 'Topluluk: insanlar arasındaki konuşmalar. Geliştirme ve YZ: ekibin GitHub’daki çalışmaları, botlar ve YZ ile yazılan metinler.',
      metAi: 'Bunu YZ ile yazdım',
      fotoKiezen: 'Fotoğraf seç',
      fotoWeg: 'Fotoğrafı kaldır',
      mijnReacties: 'Yanıtlarım',
      overJou: 'Hakkınızda', pBeroep: 'Meslek grupları', beroepUitleg: 'Bir veya daha fazlasını seçin: forumda adınızın yanında etiket olarak görünürler.', pBedrijf: 'Şirket', pFunctie: 'Görev', pPlaats: 'Konum', pOver: 'Hakkımda', pWebsite: 'Web sitesi', pLinkedin: 'LinkedIn', pGithub: 'GitHub hesabı', toonAnderen: 'Başkalarına görünür', zichtbaarUitleg: 'Başkaları yalnızca işaretlediklerinizi görür. Adınız ve fotoğrafınız her zaman gönderilerinizde görünür; e-posta adresinizi asla göstermeyiz.', profielBewaard: 'Profiliniz kaydedildi.', openbaarProfiel: 'Herkese açık profilinizi görün', profielVan: 'Profil', geenOnderwerpenLid: 'Henüz konu yok.', geenReactiesLid: 'Henüz yanıt yok.', linkedinHulp: 'Profilinizin bağlantısı veya yalnızca LinkedIn adınız.',
      geenReacties: 'Henüz yanıt yazmadınız.',
      githubAccount: 'GitHub hesabı',
      githubKoppelen: 'GitHub hesabınızı bağlayın',
      githubUitleg: 'GitHub’da yazdıklarınız adınızla ve geçmişinizde görünür.',
      opmaakMd: 'Markdown çalışır: **kalın**, *italik*, - ile listeler, # ile başlıklar ve kod için ```. Görseli düğmeyle ekleyin ya da Ctrl+V ile yapıştırın.',
      inlogKop: 'OpenAEC’ye giriş yap', verderMet: 'Şununla devam et:', ofMail: 'veya', metWachtwoord: 'E-posta ve parola ile', nogGeenAccount: 'Henüz hesabınız yok mu?', ofMetMail: 'veya e-posta adresinizle hesap oluşturun', gekoppeldMet: 'Giriş yöntemi',
      inlogUitleg: 'Google, GitHub veya Apple ile ayrı bir parolaya gerek yok. Yeni bir adres hemen bir OpenAEC hesabı olur.'
    },
    es: {
      titel: 'Foro', label: 'Comunidad',
      lead: 'Haz una pregunta, comparte una idea o muestra lo que haces con las herramientas OpenAEC.',
      inloggen: 'Iniciar sesión', uitloggen: 'Cerrar sesión', aanmelden: 'Crear cuenta',
      ingelogdAls: 'Sesión iniciada como', nieuw: 'Nuevo tema', categorieen: 'Categorías',
      recent: 'Temas recientes', alle: 'Todos los temas', geen: 'Todavía no hay temas. ¡Empieza el primero!',
      reacties: function (n) { return n === 1 ? '1 respuesta' : n + ' respuestas'; },
      onderwerpen: function (n) { return n === 1 ? '1 tema' : n + ' temas'; },
      meer: 'Cargar más', terug: '← Volver al foro', reageren: 'Responder', plaatsen: 'Publicar',
      jouwReactie: 'Tu respuesta', titelVeld: 'Título', berichtVeld: 'Mensaje', categorieVeld: 'Categoría',
      opmaak: 'Texto sin formato. Una línea en blanco empieza un párrafo nuevo, los enlaces se vuelven clicables y ``` separa el código. Añade una imagen con el botón o pégala con Ctrl+V.',
      logInOmTeReageren: 'Inicia sesión con tu cuenta OpenAEC para responder.',
      logInOmTeSchrijven: 'Inicia sesión con tu cuenta OpenAEC para empezar un tema.',
      gesloten: 'Este tema está cerrado.', vastgezet: 'Fijado', verborgen: 'Oculto', team: 'Equipo',
      bewerken: 'Editar', opslaan: 'Guardar', annuleren: 'Cancelar', bewerkt: 'editado',
      verberg: 'Ocultar', toon: 'Mostrar', sluit: 'Cerrar', open: 'Reabrir', zetVast: 'Fijar', maakLos: 'Desfijar',
      laden: 'Cargando…', fout: 'Algo salió mal. Inténtalo de nuevo.', onbekend: 'Este tema no existe (o ya no existe).',
      alleenTeam: 'Aquí solo el equipo empieza temas.',
      aanmeldKop: 'Crea tu cuenta OpenAEC gratuita',
      aanmeldUitleg: 'Con una sola cuenta escribes en el foro y pronto usas también las herramientas OpenAEC. Recibirás un correo para confirmar tu dirección y elegir una contraseña; después vuelves aquí.',
      naam: 'Nombre', email: 'Correo electrónico',
      akkoord: 'Acepto la <a href="/supercloud/es/privacidad/">declaración de privacidad</a> y las <a href="/forum/#/regels">normas del foro</a>.',
      versturen: 'Crear cuenta', alAccount: '¿Ya tienes una cuenta OpenAEC?',
      regelsKop: 'Normas del foro',
      regels: ['Sé amable y ayuda a los demás; todos fuimos principiantes.', 'Céntrate en el tema: código abierto en la construcción y las herramientas OpenAEC.', 'Nada de publicidad, spam ni datos personales de otros.', '¿Un error en una herramienta? Notifícalo también en GitHub, con la versión y lo que hiciste.', 'Los moderadores pueden ocultar mensajes y cerrar temas.'],
      upsellKop: 'Más con tu cuenta',
      upsell: 'La misma cuenta te da las herramientas OpenAEC en el navegador y el SuperCloud.',
      upsellKnop: 'Descubre el SuperCloud',
      categorie: 'Categoría',
      onderwerpenKop: 'Temas',
      onderwerpKop: 'Tema',
      reactiesKop: 'Respuestas',
      activiteit: 'Actividad',
      alleRecent: 'Todos los temas recientes',
      alleenTeamKort: 'Aquí solo el equipo empieza temas',
      foraKop: 'Otros foros',
      foraUitleg: 'El código abierto en la construcción es más grande que nosotros. También participamos aquí:',
      foraOsarch: 'Código abierto en la construcción: Bonsai, IfcOpenShell y más',
      foraSpeckle: 'Compartir modelos entre programas de diseño',
      foraFrappe: 'ERPNext y Frappe Framework',
      foraBlender: 'La gran comunidad de usuarios de Blender',
      badgesKop: 'Insignias a través de la Academy',
      badgesUitleg: 'Termina un curso de la OpenAEC Academy con un examen y obtienes una insignia en tu perfil. Con suficientes insignias te conviertes en un experto integral.',
      binnenkort: 'Próximamente',
      naarAcademy: 'Ir a la Academy',
      verlopen: 'Se ha cerrado tu sesión. Vuelve a iniciarla.',
      verwijderen: 'Eliminar', verwijderVraag: '¿Eliminar este mensaje? No se puede deshacer.', verwijderOnderwerpVraag: '¿Eliminar este tema con todas sus respuestas? No se puede deshacer.',
      afbeelding: 'Añadir imagen', afbeeldingBezig: 'Subiendo imagen…', afbeeldingAlt: 'Imagen del mensaje',
      profiel: 'Mi perfil', lidSinds: 'Miembro desde', mijnOnderwerpen: 'Mis temas', geenEigen: 'Todavía no has empezado ningún tema.', logInVoorProfiel: 'Inicia sesión para ver tu perfil.', upsellKnopIn: 'Abrir tu SuperCloud',
      landenKop: 'Foro por país', landenUitleg: 'En tu idioma, con las herramientas para tu país', landLead: 'Habla en tu idioma sobre la construcción en este país. Aquí están también las herramientas que son útiles sobre todo aquí.', landTools: 'Herramientas para este país',
      toolsKop: 'Herramientas', opGithub: 'Ver en GitHub', toolsUitleg: 'Con las incidencias de GitHub',
      ookOpGithub: 'Este tema pertenece a una incidencia de GitHub. Tu mensaje aparece también allí, con tu nombre del foro; no necesitas cuenta de GitHub.',
      discussie: 'Debate', discussies: 'Debates', githubMirror: 'GitHub Mirror', herkomstUitleg: 'Los debates son conversaciones en el foro. GitHub Mirror es el desarrollo: las incidencias de esta herramienta en GitHub.', geenDiscussies: 'Aún no hay debates sobre esta herramienta. ¡Empieza el primero!', soortOnderwerp: '¿Qué tipo de tema es?', soortDiscussie: 'Debate', soortDiscussieUitleg: 'Una pregunta, idea o conversación. Se queda en el foro.', soortIssue: 'Aviso para los desarrolladores', soortIssueUitleg: 'Un error o una petición concreta. También se convierte en una incidencia de GitHub, con tu nombre del foro; no necesitas una cuenta de GitHub.', maakIssue: 'Convertir en incidencia',
      community: 'Comunidad',
      ontwikkeling: 'Desarrollo e IA',
      alles: 'Todo',
      soortUitleg: 'Comunidad: conversaciones entre personas. Desarrollo e IA: trabajo del equipo en GitHub, bots y textos escritos con IA.',
      metAi: 'He escrito esto con IA',
      fotoKiezen: 'Elegir foto',
      fotoWeg: 'Quitar foto',
      mijnReacties: 'Mis respuestas',
      overJou: 'Sobre ti', pBeroep: 'Profesiones', beroepUitleg: 'Elige una o varias: aparecen como etiquetas junto a tu nombre en el foro.', pBedrijf: 'Empresa', pFunctie: 'Cargo', pPlaats: 'Lugar', pOver: 'Sobre mí', pWebsite: 'Sitio web', pLinkedin: 'LinkedIn', pGithub: 'Cuenta de GitHub', toonAnderen: 'Visible para los demás', zichtbaarUitleg: 'Los demás solo ven lo que marcas. Tu nombre y tu foto siempre aparecen junto a tus mensajes; nunca mostramos tu correo electrónico.', profielBewaard: 'Tu perfil se ha guardado.', openbaarProfiel: 'Ver tu perfil público', profielVan: 'Perfil', geenOnderwerpenLid: 'Todavía no hay temas.', geenReactiesLid: 'Todavía no hay respuestas.', linkedinHulp: 'El enlace a tu perfil, o solo tu nombre de LinkedIn.',
      geenReacties: 'Todavía no has respondido.',
      githubAccount: 'Cuenta de GitHub',
      githubKoppelen: 'Vincula tu cuenta de GitHub',
      githubUitleg: 'Lo que escribes en GitHub aparece entonces con tu nombre y en tu historial.',
      opmaakMd: 'Markdown funciona: **negrita**, *cursiva*, listas con -, títulos con # y ``` para código. Añade una imagen con el botón o pégala con Ctrl+V.',
      inlogKop: 'Iniciar sesión en OpenAEC', verderMet: 'Continuar con', ofMail: 'o', metWachtwoord: 'Con correo y contraseña', nogGeenAccount: '¿Aún no tienes cuenta?', ofMetMail: 'o crea una cuenta con tu correo electrónico', gekoppeldMet: 'Inicio de sesión con',
      inlogUitleg: 'Con Google, GitHub o Apple no necesitas una contraseña aparte. Una dirección nueva se convierte al instante en una cuenta OpenAEC.'
    },
    de: {
      titel: 'Forum', label: 'Community',
      lead: 'Stellen Sie eine Frage, teilen Sie eine Idee oder zeigen Sie, was Sie mit den OpenAEC-Tools machen.',
      inloggen: 'Anmelden', uitloggen: 'Abmelden', aanmelden: 'Konto erstellen',
      ingelogdAls: 'Angemeldet als', nieuw: 'Neues Thema', categorieen: 'Kategorien',
      recent: 'Neueste Themen', alle: 'Alle Themen', geen: 'Noch keine Themen. Eröffnen Sie das erste!',
      reacties: function (n) { return n === 1 ? '1 Antwort' : n + ' Antworten'; },
      onderwerpen: function (n) { return n === 1 ? '1 Thema' : n + ' Themen'; },
      meer: 'Mehr laden', terug: '← Zurück zum Forum', reageren: 'Antworten', plaatsen: 'Veröffentlichen',
      jouwReactie: 'Ihre Antwort', titelVeld: 'Titel', berichtVeld: 'Nachricht', categorieVeld: 'Kategorie',
      opmaak: 'Reiner Text. Eine Leerzeile beginnt einen neuen Absatz, Links werden anklickbar und ``` grenzt Code ab. Ein Bild fügen Sie mit der Schaltfläche hinzu oder mit Strg+V ein.',
      logInOmTeReageren: 'Melden Sie sich mit Ihrem OpenAEC-Konto an, um zu antworten.',
      logInOmTeSchrijven: 'Melden Sie sich mit Ihrem OpenAEC-Konto an, um ein Thema zu eröffnen.',
      gesloten: 'Dieses Thema ist geschlossen.', vastgezet: 'Angeheftet', verborgen: 'Ausgeblendet', team: 'Team',
      bewerken: 'Bearbeiten', opslaan: 'Speichern', annuleren: 'Abbrechen', bewerkt: 'bearbeitet',
      verberg: 'Ausblenden', toon: 'Einblenden', sluit: 'Schließen', open: 'Wieder öffnen', zetVast: 'Anheften', maakLos: 'Lösen',
      laden: 'Wird geladen…', fout: 'Etwas ist schiefgegangen. Versuchen Sie es erneut.', onbekend: 'Dieses Thema existiert nicht (mehr).',
      alleenTeam: 'Hier eröffnet nur das Team Themen.',
      aanmeldKop: 'Erstellen Sie Ihr kostenloses OpenAEC-Konto',
      aanmeldUitleg: 'Mit einem einzigen Konto schreiben Sie im Forum und nutzen bald auch die OpenAEC-Tools. Sie erhalten eine E-Mail, um Ihre Adresse zu bestätigen und ein Passwort zu wählen; danach kehren Sie hierher zurück.',
      naam: 'Name', email: 'E-Mail-Adresse',
      akkoord: 'Ich akzeptiere die <a href="/supercloud/de/datenschutz/">Datenschutzerklärung</a> und die <a href="/forum/#/regels">Forenregeln</a>.',
      versturen: 'Konto erstellen', alAccount: 'Sie haben bereits ein OpenAEC-Konto?',
      regelsKop: 'Forenregeln',
      regels: ['Bleiben Sie freundlich und helfen Sie anderen; jeder hat einmal angefangen.', 'Bleiben Sie beim Thema: Open Source im Bauwesen und die OpenAEC-Tools.', 'Keine Werbung, kein Spam und keine personenbezogenen Daten anderer.', 'Ein Fehler in einem Tool? Melden Sie ihn auch auf GitHub, mit der Version und dem, was Sie getan haben.', 'Moderatoren können Beiträge ausblenden und Themen schließen.'],
      upsellKop: 'Mehr mit Ihrem Konto',
      upsell: 'Mit demselben Konto nutzen Sie die OpenAEC-Tools im Browser und die SuperCloud.',
      upsellKnop: 'SuperCloud entdecken',
      categorie: 'Kategorie',
      onderwerpenKop: 'Themen',
      onderwerpKop: 'Thema',
      reactiesKop: 'Antworten',
      activiteit: 'Aktivität',
      alleRecent: 'Alle neuesten Themen',
      alleenTeamKort: 'Hier eröffnet nur das Team Themen',
      foraKop: 'Andere Foren',
      foraUitleg: 'Open Source im Bauwesen ist größer als wir. Hier sind wir auch dabei:',
      foraOsarch: 'Open Source im Bauwesen: Bonsai, IfcOpenShell und mehr',
      foraSpeckle: 'Modelle zwischen Entwurfsprogrammen teilen',
      foraFrappe: 'ERPNext und Frappe Framework',
      foraBlender: 'Die große Community der Blender-Nutzer',
      badgesKop: 'Badges über die Academy',
      badgesUitleg: 'Schließen Sie einen Kurs der OpenAEC Academy mit einer Prüfung ab, erhalten Sie ein Badge in Ihrem Profil. Mit genügend Badges werden Sie zum Allround-Experten.',
      binnenkort: 'Demnächst',
      naarAcademy: 'Zur Academy',
      verlopen: 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',
      verwijderen: 'Löschen', verwijderVraag: 'Diesen Beitrag löschen? Das lässt sich nicht rückgängig machen.', verwijderOnderwerpVraag: 'Dieses Thema mit allen Antworten löschen? Das lässt sich nicht rückgängig machen.',
      afbeelding: 'Bild hinzufügen', afbeeldingBezig: 'Bild wird hochgeladen…', afbeeldingAlt: 'Bild im Beitrag',
      profiel: 'Mein Profil', lidSinds: 'Mitglied seit', mijnOnderwerpen: 'Meine Themen', geenEigen: 'Sie haben noch kein Thema eröffnet.', logInVoorProfiel: 'Melden Sie sich an, um Ihr Profil zu sehen.', upsellKnopIn: 'Ihre SuperCloud öffnen',
      landenKop: 'Forum nach Land', landenUitleg: 'In Ihrer Sprache, mit den Tools für Ihr Land', landLead: 'Sprechen Sie in Ihrer Sprache über das Bauen in diesem Land. Hier finden Sie auch die Tools, die vor allem hier nützlich sind.', landTools: 'Tools für dieses Land',
      toolsKop: 'Tools', opGithub: 'Auf GitHub ansehen', toolsUitleg: 'Mit den Issues von GitHub',
      ookOpGithub: 'Dieses Thema gehört zu einem Issue auf GitHub. Ihr Beitrag erscheint auch dort, mit Ihrem Forennamen; ein GitHub-Konto brauchen Sie nicht.',
      discussie: 'Diskussion', discussies: 'Diskussionen', githubMirror: 'GitHub Mirror', herkomstUitleg: 'Diskussionen sind Gespräche im Forum. GitHub Mirror ist die Entwicklung: die Issues dieses Tools auf GitHub.', geenDiscussies: 'Noch keine Diskussionen zu diesem Tool. Starten Sie die erste!', soortOnderwerp: 'Was für ein Thema ist das?', soortDiscussie: 'Diskussion', soortDiscussieUitleg: 'Eine Frage, Idee oder ein Gespräch. Bleibt im Forum.', soortIssue: 'Meldung für die Entwickler', soortIssueUitleg: 'Ein Fehler oder ein konkreter Wunsch. Wird auch ein Issue auf GitHub, mit Ihrem Forennamen; ein GitHub-Konto brauchen Sie nicht.', maakIssue: 'In ein Issue umwandeln',
      community: 'Community',
      ontwikkeling: 'Entwicklung und KI',
      alles: 'Alle',
      soortUitleg: 'Community: Gespräche zwischen Menschen. Entwicklung und KI: Arbeit des Teams auf GitHub, Bots und mit KI geschriebene Texte.',
      metAi: 'Ich habe dies mit KI geschrieben',
      fotoKiezen: 'Foto wählen',
      fotoWeg: 'Foto entfernen',
      mijnReacties: 'Meine Antworten',
      overJou: 'Über Sie', pBeroep: 'Berufsgruppen', beroepUitleg: 'Wählen Sie eine oder mehrere: Sie erscheinen als Labels neben Ihrem Namen im Forum.', pBedrijf: 'Unternehmen', pFunctie: 'Funktion', pPlaats: 'Ort', pOver: 'Über mich', pWebsite: 'Website', pLinkedin: 'LinkedIn', pGithub: 'GitHub-Konto', toonAnderen: 'Für andere sichtbar', zichtbaarUitleg: 'Andere sehen nur, was Sie ankreuzen. Ihr Name und Ihr Foto stehen immer bei Ihren Beiträgen; Ihre E-Mail-Adresse zeigen wir nie.', profielBewaard: 'Ihr Profil wurde gespeichert.', openbaarProfiel: 'Ihr öffentliches Profil ansehen', profielVan: 'Profil', geenOnderwerpenLid: 'Noch keine Themen.', geenReactiesLid: 'Noch keine Antworten.', linkedinHulp: 'Der Link zu Ihrem Profil oder nur Ihr LinkedIn-Name.',
      geenReacties: 'Sie haben noch nicht geantwortet.',
      githubAccount: 'GitHub-Konto',
      githubKoppelen: 'GitHub-Konto verknüpfen',
      githubUitleg: 'Was Sie auf GitHub schreiben, erscheint dann unter Ihrem Namen und in Ihrem Verlauf.',
      opmaakMd: 'Markdown funktioniert: **fett**, *kursiv*, Listen mit -, Überschriften mit # und ``` für Code. Ein Bild fügen Sie mit der Schaltfläche hinzu oder mit Strg+V ein.',
      inlogKop: 'Bei OpenAEC anmelden', verderMet: 'Weiter mit', ofMail: 'oder', metWachtwoord: 'Mit E-Mail und Passwort', nogGeenAccount: 'Noch kein Konto?', ofMetMail: 'oder erstellen Sie ein Konto mit Ihrer E-Mail-Adresse', gekoppeldMet: 'Anmeldung mit',
      inlogUitleg: 'Mit Google, GitHub oder Apple brauchen Sie kein eigenes Passwort. Eine neue Adresse wird sofort ein OpenAEC-Konto.'
    }
  };

  function taal() {
    var l = (window.getCurrentLang && window.getCurrentLang()) || 'en';
    return T[l] ? l : 'en';
  }
  function t(sleutel) { return T[taal()][sleutel]; }

  // ── Hulp ────────────────────────────────────────────────────────────────
  function esc(tekst) {
    return String(tekst == null ? '' : tekst).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Afbeeldingen komen alleen van het forum zelf, van GitHub of van Open Feedback Studio; al het andere blijft een link.
  function beeldAdres(adres) {
    if (/^\/files\/forum-[a-z0-9]{16}\.webp$/.test(adres)) return CLOUD + adres;
    return /^https:\/\/(github\.com\/user-attachments\/|[a-z0-9-]+\.githubusercontent\.com\/|open-feedback-studio\.pages\.dev\/api\/images\/)/.test(adres) ? adres : '';
  }

  // Opmaak binnen een regel: code, afbeeldingen, links, vet, cursief en doorgehaald. Alles wordt eerst ontsnapt.
  function regelOpmaak(tekst) {
    var vast = [];
    function bewaar(html) { vast.push(html); return '\u0000' + (vast.length - 1) + '\u0000'; }
    var uit = String(tekst).replace(/`([^`\n]+)`/g, function (_, code) { return bewaar('<code>' + esc(code) + '</code>'); });
    // Opmaaktags uit GitHub-teksten (<details>, <b>, …) laten we weg; de tekst ertussen blijft.
    uit = esc(uit.replace(/<\/?(details|summary|p|div|sub|sup|kbd|b|i|u|strong|em|span|center)\b[^>]*>/gi, ''))
      .replace(/!\[([^\]\n]*)\]\(([^)\s]+)\)/g, function (heel, alt, adres) {
        var bron = beeldAdres(adres);
        if (bron) return bewaar('<a class="fo-beeld" href="' + bron + '" target="_blank" rel="noopener"><img src="' + bron + '" alt="' + (alt || esc(t('afbeeldingAlt'))) + '" loading="lazy" referrerpolicy="no-referrer"></a>');
        return /^https?:\/\//.test(adres) ? bewaar('<a href="' + adres + '" rel="nofollow ugc noopener" target="_blank">' + (alt || adres) + '</a>') : heel;
      })
      .replace(/\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g, function (_, label, adres) {
        return bewaar('<a href="' + adres + '" rel="nofollow ugc noopener" target="_blank">' + label + '</a>');
      })
      .replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"]/g, function (adres) {
        return bewaar('<a href="' + adres + '" rel="nofollow ugc noopener" target="_blank">' + adres + '</a>');
      })
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^\w*])\*([^*\s][^*\n]*)\*(?!\w)/g, '$1<em>$2</em>')
      .replace(/(^|[^\w])__([^_\n]+)__(?!\w)/g, '$1<strong>$2</strong>')
      .replace(/(^|[^\w])_([^_\s][^_\n]*)_(?!\w)/g, '$1<em>$2</em>')
      .replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
    return uit.replace(/\u0000(\d+)\u0000/g, function (_, n) { return vast[+n]; });
  }

  // Markdown (zoals op GitHub) veilig naar HTML: kopjes, lijsten, citaten, tabellen, codeblokken en alinea's.
  function opmaak(tekst) {
    // HTML uit GitHub-teksten: opmerkingen weg, <img> en <br> als Markdown; binnen codeblokken blijft alles staan.
    var regels = String(tekst == null ? '' : tekst).replace(/\r\n?/g, '\n').split(/(^[ \t]*```[\s\S]*?^[ \t]*```[ \t]*$)/m).map(function (deel, n) {
      return n % 2 ? deel : deel.replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<img\b[^>]*?\bsrc=["']([^"'\s]+)["'][^>]*>/gi, '![]($1)')
        .replace(/<br\s*\/?>/gi, '\n');
    }).join('').split('\n');
    var uit = [], i = 0, m;
    var LIJST = /^\s*([-*+]|\d+[.)])\s+(.*)$/;
    function blokStart(r) { return /^\s*```/.test(r) || /^#{1,6}\s/.test(r) || /^\s*>/.test(r) || LIJST.test(r); }
    while (i < regels.length) {
      var r = regels[i];
      if (/^\s*```/.test(r)) {
        var code = [];
        for (i++; i < regels.length && !/^\s*```/.test(regels[i]); i++) code.push(regels[i]);
        i++;
        uit.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>');
      } else if (!r.trim()) {
        i++;
      } else if ((m = /^(#{1,6})\s+(.*)$/.exec(r))) {
        var niveau = Math.min(6, m[1].length + 2);
        uit.push('<h' + niveau + '>' + regelOpmaak(m[2].replace(/\s+#+\s*$/, '')) + '</h' + niveau + '>');
        i++;
      } else if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(r)) {
        uit.push('<hr>');
        i++;
      } else if (/^\s*>/.test(r)) {
        var citaat = [];
        for (; i < regels.length && /^\s*>/.test(regels[i]); i++) citaat.push(regels[i].replace(/^\s*>\s?/, ''));
        uit.push('<blockquote>' + opmaak(citaat.join('\n')) + '</blockquote>');
      } else if (LIJST.test(r)) {
        var genummerd = /^\s*\d/.test(r), punten = [];
        for (; i < regels.length; i++) {
          if ((m = LIJST.exec(regels[i]))) punten.push(m[2]);
          else if (/^\s{2,}\S/.test(regels[i]) && punten.length) punten[punten.length - 1] += '\n' + regels[i].trim();
          else break;
        }
        uit.push('<' + (genummerd ? 'ol' : 'ul') + '>' + punten.map(function (punt) {
          var taak = /^\[([ xX])\]\s+/.exec(punt);
          return '<li' + (taak ? ' class="fo-taak"' : '') + '>' + (taak ? '<input type="checkbox" disabled' + (taak[1] === ' ' ? '' : ' checked') + '> ' : '') +
            regelOpmaak(taak ? punt.slice(taak[0].length) : punt).replace(/\n/g, '<br>') + '</li>';
        }).join('') + '</' + (genummerd ? 'ol' : 'ul') + '>');
      } else if (r.indexOf('|') >= 0 && /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(regels[i + 1] || '')) {
        var cellen = function (regel) { return regel.trim().replace(/^\||\|$/g, '').split('|').map(function (c) { return regelOpmaak(c.trim()); }); };
        var tabel = '<thead><tr>' + cellen(r).map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
        for (i += 2; i < regels.length && regels[i].indexOf('|') >= 0 && regels[i].trim(); i++) {
          tabel += '<tr>' + cellen(regels[i]).map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
        }
        uit.push('<div class="fo-tabel"><table>' + tabel + '</tbody></table></div>');
      } else {
        var alinea = [r];
        for (i++; i < regels.length && regels[i].trim() && !blokStart(regels[i]); i++) alinea.push(regels[i]);
        uit.push('<p>' + regelOpmaak(alinea.join('\n').trim()).replace(/\n/g, '<br>') + '</p>');
      }
    }
    return uit.join('');
  }

  function tijd(waarde) {
    var d = new Date(waarde);
    if (isNaN(d)) return '';
    var sec = (d.getTime() - Date.now()) / 1000;
    var stappen = [[60, 'second'], [3600, 'minute'], [86400, 'hour'], [604800, 'day'], [2629800, 'week'], [31557600, 'month'], [Infinity, 'year']];
    var deler = [1, 60, 3600, 86400, 604800, 2629800, 31557600];
    for (var i = 0; i < stappen.length; i++) {
      if (Math.abs(sec) < stappen[i][0]) {
        try {
          return new Intl.RelativeTimeFormat(taal(), { numeric: 'auto' }).format(Math.round(sec / deler[i]), stappen[i][1]);
        } catch (e) { return d.toLocaleDateString(); }
      }
    }
    return d.toLocaleDateString();
  }

  function catTitel(cat) { return taal() === 'nl' ? cat.titel : cat.titel_en; }
  function catUitleg(cat) { return taal() === 'nl' ? cat.beschrijving : cat.beschrijving_en; }

  function auteur(a) {
    var naam = /^[a-z0-9]{6,20}$/.test(a.id || '') ? '<a class="fo-auteur-link" href="#/lid/' + a.id + '">' + esc(a.naam) + '</a>' : esc(a.naam);
    return '<span class="fo-auteur">' + naam + (a.team ? ' <span class="fo-team">' + esc(t('team')) + '</span>' : '') +
      beroepenVan(a).map(function (b) { return ' <i class="fo-beroep fo-beroep-lid">' + esc(beroepNaam(b)) + '</i>'; }).join('') +
      (a.github ? ' <span class="fo-gh">GitHub</span>' : '') + '</span>';
  }

  // ── Sessie (OAuth met PKCE) ─────────────────────────────────────────────
  function leesSessie() {
    try { return JSON.parse(localStorage.getItem(SESSIE) || 'null'); } catch (e) { return null; }
  }
  function bewaarSessie(s) {
    try { if (s) localStorage.setItem(SESSIE, JSON.stringify(s)); else localStorage.removeItem(SESSIE); } catch (e) {}
  }

  function willekeurig(lengte) {
    var bytes = new Uint8Array(lengte);
    crypto.getRandomValues(bytes);
    return b64url(bytes);
  }
  function b64url(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // Waar de bezoeker was toen hij op Inloggen klikte: daar komt hij na het inloggen terug.
  var TERUGNAAR = 'openaec-forum-terugnaar';
  function onthoudPlek() {
    if (/^#\/(inloggen|aanmelden)/.test(location.hash)) return;
    try { sessionStorage.setItem(TERUGNAAR, location.hash || '#/'); } catch (e) {}
  }
  function onthoudenPlek() {
    try { return sessionStorage.getItem(TERUGNAAR) || '#/'; } catch (e) { return '#/'; }
  }

  // Inloggen via de cloud (OAuth met PKCE). Met `aanbieder` (google, github, apple) meteen bij die aanbieder, zonder
  // eerst de inlogpagina van de cloud; zonder: de inlogpagina met e-mail en wachtwoord.
  async function login(aanbieder) {
    var verifier = willekeurig(48);
    var state = willekeurig(16);
    var hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    var plek = /^#\/(inloggen|aanmelden)/.test(location.hash) ? onthoudenPlek() : (location.hash || '#/');
    sessionStorage.setItem(PKCE, JSON.stringify({ verifier: verifier, state: state, terug: plek }));
    var q = new URLSearchParams({
      client_id: CLIENT, response_type: 'code', redirect_uri: TERUG, scope: SCOPE, state: state,
      code_challenge: b64url(new Uint8Array(hash)), code_challenge_method: 'S256'
    });
    var pad = '/api/method/frappe.integrations.oauth2.authorize?' + q.toString();
    if (aanbieder) location.assign(CLOUD + '/api/method/openaec_cloud.sociaal.start?' + new URLSearchParams({ aanbieder: aanbieder, verder: pad }).toString());
    else location.assign(CLOUD + pad);
  }

  async function tokenAanvraag(velden) {
    var antwoord = await fetch(OAUTH + 'get_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(velden).toString()
    });
    if (!antwoord.ok) throw new Error('token ' + antwoord.status);
    var data = await antwoord.json();
    return {
      toegang: data.access_token,
      verversen: data.refresh_token,
      verloopt: Date.now() + ((data.expires_in || 900) - 30) * 1000
    };
  }

  // Terug van de cloud met ?code=…&state=…: inwisselen en het adres opschonen.
  async function verwerkTerugkeer() {
    var q = new URLSearchParams(location.search);
    if (!q.has('code') && !q.has('error')) return;
    var opgeslagen = null;
    try { opgeslagen = JSON.parse(sessionStorage.getItem(PKCE) || 'null'); } catch (e) {}
    sessionStorage.removeItem(PKCE);
    var hash = (opgeslagen && opgeslagen.terug) || '#/';
    history.replaceState(null, '', '/forum/' + hash);
    if (!opgeslagen || q.get('state') !== opgeslagen.state || !q.has('code')) return;
    try {
      var s = await tokenAanvraag({
        grant_type: 'authorization_code', code: q.get('code'), redirect_uri: TERUG,
        client_id: CLIENT, code_verifier: opgeslagen.verifier
      });
      bewaarSessie(s);
    } catch (e) {
      melding(t('fout'));
    }
  }

  var verversBezig = null;
  async function toegangstoken() {
    var s = leesSessie();
    if (!s) return null;
    if (Date.now() < s.verloopt) return s.toegang;
    if (!s.verversen) { bewaarSessie(null); return null; }
    verversBezig = verversBezig || tokenAanvraag({ grant_type: 'refresh_token', refresh_token: s.verversen, client_id: CLIENT })
      .then(function (nieuw) { if (!nieuw.verversen) nieuw.verversen = s.verversen; bewaarSessie(nieuw); return nieuw.toegang; })
      .catch(function () { bewaarSessie(null); ik = null; melding(t('verlopen')); return null; })
      .finally(function () { verversBezig = null; });
    return verversBezig;
  }

  async function logout() {
    var s = leesSessie();
    bewaarSessie(null);
    ik = null;
    bewaarAccount(null);
    if (s && s.verversen) {
      fetch(OAUTH + 'revoke_token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: s.verversen, client_id: CLIENT }).toString()
      }).catch(function () {});
    }
    toon();
  }

  // ── API ─────────────────────────────────────────────────────────────────
  function foutmelding(data) {
    try {
      var berichten = JSON.parse(data._server_messages || '[]');
      if (berichten.length) {
        var m = JSON.parse(berichten[0]).message;
        if (m) return String(m).replace(/<[^>]*>/g, '');
      }
    } catch (e) {}
    return data.exception ? String(data.exception).split(':').slice(1).join(':').trim() || t('fout') : t('fout');
  }

  async function api(methode, velden, post, opnieuw) {
    var token = await toegangstoken();
    var koppen = { Accept: 'application/json' };
    if (token) koppen.Authorization = 'Bearer ' + token;
    var url = API + methode;
    var opties = { method: post ? 'POST' : 'GET', headers: koppen };
    var q = new URLSearchParams(velden || {}).toString();
    if (post) { koppen['Content-Type'] = 'application/x-www-form-urlencoded'; opties.body = q; }
    else if (q) url += '?' + q;
    var antwoord = await fetch(url, opties);
    var data = {};
    try { data = await antwoord.json(); } catch (e) {}
    if (antwoord.status === 401 && token && !opnieuw) {
      // Ingetrokken of verlopen: één keer verversen, anders als gast verder.
      var s = leesSessie();
      if (s) { s.verloopt = 0; bewaarSessie(s); }
      return api(methode, velden, post, true);
    }
    if (post) vergeetBuffer();
    if (!antwoord.ok) {
      var fout = new Error(foutmelding(data));
      fout.status = antwoord.status;
      fout.soort = data.exc_type;
      throw fout;
    }
    return data.message;
  }

  // Wat al eens is opgehaald, staat er bij een klik meteen; op de achtergrond halen we het verse antwoord.
  var buffer = {}, VERS_MS = 20000;
  function bufferSleutel(methode, velden) { return methode + '?' + new URLSearchParams(velden || {}).toString(); }
  function bekend(methode, velden) { var b = buffer[bufferSleutel(methode, velden)]; return b && b.data; }
  function haal(methode, velden, altijd) {
    var k = bufferSleutel(methode, velden), b = buffer[k] || (buffer[k] = {});
    if (b.belofte) return b.belofte;
    if (!altijd && b.data && Date.now() - b.tijd < VERS_MS) return Promise.resolve(b.data);
    b.belofte = api(methode, velden).then(function (data) {
      buffer[k] = { data: data, tijd: Date.now() };
      return data;
    }, function (fout) { b.belofte = null; throw fout; });
    return b.belofte;
  }
  function vergeetBuffer() { buffer = {}; }
  // Toon `methode` op het scherm: meteen uit de buffer als het er is, daarna het verse antwoord (alleen als het
  // scherm nog hetzelfde is en het antwoord anders is). `teken(data)` tekent, `mislukt(fout)` meldt een fout.
  var beurt = 0;
  function toonMet(methode, velden, teken, mislukt) {
    var mijnBeurt = beurt, oud = bekend(methode, velden), b = buffer[bufferSleutel(methode, velden)];
    if (oud) teken(oud);
    if (oud && Date.now() - b.tijd < VERS_MS) return Promise.resolve(oud);
    return haal(methode, velden, true).then(function (data) {
      if (mijnBeurt === beurt && (!oud || JSON.stringify(oud) !== JSON.stringify(data))) teken(data);
      return data;
    }, function (fout) { if (mijnBeurt === beurt && !oud) mislukt(fout); });
  }

  async function uploadAfbeelding(bestand, methode) {
    var token = await toegangstoken();
    var lijf = new FormData();
    lijf.append('bestand', bestand, bestand.name || 'afbeelding.png');
    var antwoord = await fetch(API + (methode || 'afbeelding'), {
      method: 'POST', headers: Object.assign({ Accept: 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}), body: lijf
    });
    var data = {};
    try { data = await antwoord.json(); } catch (e) {}
    if (!antwoord.ok) throw new Error(foutmelding(data));
    return methode ? data.message : data.message.pad;
  }

  // Onder een tekstvak: de knop "Afbeelding toevoegen", en plakken (Ctrl+V) of slepen in het vak zelf.
  function metAfbeeldingen(vak) {
    if (!vak) return;
    var rij = document.createElement('p');
    rij.className = 'fo-beeldrij';
    rij.innerHTML = '<button type="button" class="btn btn-secondary fo-knop">' + esc(t('afbeelding')) + '</button>' +
      '<input type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden><span class="fo-klein" role="status"></span>';
    vak.closest('label').insertAdjacentElement('afterend', rij);
    var knopEl = rij.querySelector('button'), kies = rij.querySelector('input'), stand = rij.querySelector('span');
    async function voegToe(bestanden) {
      var lijst = Array.prototype.filter.call(bestanden || [], function (b) { return /^image\//.test(b.type); });
      if (!lijst.length) return;
      knopEl.disabled = true;
      stand.textContent = t('afbeeldingBezig');
      try {
        for (var i = 0; i < lijst.length; i++) {
          var pad = await uploadAfbeelding(lijst[i]);
          var voor = vak.value.slice(0, vak.selectionStart), na = vak.value.slice(vak.selectionEnd);
          var stuk = (voor && !/\n\n$/.test(voor) ? '\n\n' : '') + '![](' + pad + ')\n\n';
          vak.value = voor + stuk + na.replace(/^\n+/, '');
          vak.selectionStart = vak.selectionEnd = (voor + stuk).length;
        }
        melding('');
      } catch (e) { melding(e.message || t('fout')); }
      stand.textContent = '';
      knopEl.disabled = false;
      vak.focus();
    }
    knopEl.addEventListener('click', function () { kies.click(); });
    kies.addEventListener('change', function () { voegToe(kies.files).then(function () { kies.value = ''; }); });
    vak.addEventListener('paste', function (ev) {
      var bestanden = ev.clipboardData && ev.clipboardData.files;
      if (bestanden && bestanden.length) { ev.preventDefault(); voegToe(bestanden); }
    });
    vak.addEventListener('dragover', function (ev) { ev.preventDefault(); });
    vak.addEventListener('drop', function (ev) {
      var bestanden = ev.dataTransfer && ev.dataTransfer.files;
      if (bestanden && bestanden.length) { ev.preventDefault(); voegToe(bestanden); }
    });
  }

  // ── Weergave ────────────────────────────────────────────────────────────
  var app, balk, ik = null, categorieen = [];
  // Kleuren voor categorieën en avatars (vast per categorie en per naam).
  var KLEUREN = ['#D97706', '#2563EB', '#16A34A', '#9333EA', '#DC2626', '#0891B2', '#CA8A04', '#DB2777'];
  // Wie ingelogd is, onthoudt het forum hier (alleen de naam): de navigatie van de hele site toont dan rechtsboven het account.
  var ACCOUNT = 'openaec-forum-account';
  var FORA = [
    { naam: 'OSArch Community', url: 'https://community.osarch.org/', sleutel: 'foraOsarch', kleur: '#16A34A' },
    { naam: 'Speckle Community', url: 'https://speckle.community/', sleutel: 'foraSpeckle', kleur: '#2563EB' },
    { naam: 'Frappe Forum', url: 'https://discuss.frappe.io/', sleutel: 'foraFrappe', kleur: '#0891B2' },
    { naam: 'Blender Artists', url: 'https://blenderartists.org/', sleutel: 'foraBlender', kleur: '#EA580C' }
  ];

  function bewaarAccount(a) {
    try {
      if (a && a.naam) localStorage.setItem(ACCOUNT, JSON.stringify({ naam: a.naam }));
      else localStorage.removeItem(ACCOUNT);
    } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('openaec:account')); } catch (e) {}
  }

  function melding(tekst) {
    var el = document.getElementById('fo-melding');
    if (!el) return;
    el.textContent = tekst || '';
    el.hidden = !tekst;
  }

  function knop(label, actie, soort, extra) {
    return '<button type="button" class="btn ' + (soort || 'btn-secondary') + ' fo-knop" data-actie="' + actie + '"' + (extra || '') + '>' + esc(label) + '</button>';
  }

  function kleurVan(tekst) {
    var h = 0;
    tekst = String(tekst || '');
    for (var i = 0; i < tekst.length; i++) h = (h * 31 + tekst.charCodeAt(i)) >>> 0;
    return KLEUREN[h % KLEUREN.length];
  }
  function catKleur(slug) {
    var i = categorieen.findIndex(function (c) { return c.slug === slug; });
    return KLEUREN[(i < 0 ? 0 : i) % KLEUREN.length];
  }
  function initialen(naam) {
    var d = String(naam || '?').trim().split(/\s+/);
    return ((d[0] || '?').charAt(0) + (d.length > 1 ? d[d.length - 1].charAt(0) : '')).toUpperCase();
  }
  // Een schrijver: zijn foto (van het forum, anders die van zijn GitHub-account), met de initialen eronder als
  // de foto er niet is of niet laadt. `a` is een naam of {naam, foto, github}.
  function avatar(a, groot) {
    if (typeof a === 'string') a = { naam: a };
    var bron = '';
    if (/^\/files\/forum-[a-z0-9]{16}\.webp$/.test(a.foto || '')) bron = CLOUD + a.foto;
    else if (/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(a.github || '')) bron = 'https://github.com/' + a.github + '.png?size=96';
    return '<span class="fo-av' + (groot ? ' fo-av-groot' : '') + '" style="background:' + kleurVan(a.naam) + '" aria-hidden="true">' + esc(initialen(a.naam)) +
      (bron ? '<img src="' + esc(bron) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">' : '') + '</span>';
  }
  // Het logo van een tool bij zijn categorie.
  var TOOLLOGO = {
    'open-cad-studio': 'openCad.svg', 'open-pdf-studio': 'openPdf.png', 'open-planner-studio': 'openPlanner.png', 'open-infra-studio': 'openInfra.svg',
    'open-calcsheet-studio': 'openCalculations.png', 'open-calc-studio': 'openCalc.png', 'open-bim-studio': 'openBim.svg', 'open-3d-viewer': 'open3dViewer.png',
    'monty-ifc-viewer': 'montyIfc.png', 'ifccad': 'ifccad.svg', 'open-energy-studio': 'openEnergy.png', 'open-heatloss-studio': 'openHeatloss.png',
    'open-field-studio': 'openField.png', 'open-geotechniek-studio': 'cptViewer.png', 'open-pile-plan-studio': 'openPilePlan.png',
    'open-pointcloud-studio': 'openPointcloud.png', 'open-office-studio': 'openOffice.png', 'open-paint-studio': 'openPaint.png',
    'open-speech-studio': 'openSpeech.png', 'bcf-manager-studio': 'bcfManager.svg', 'open-books': 'openBooks.svg'
  };
  function toolLogo(slug) {
    var bestand = TOOLLOGO[slug];
    return '<img class="fo-toollogo" src="' + (bestand ? '/shared/assets/app-icons/' + bestand : '/shared/assets/logo/openaec-symbol-v2-transparent.svg') + '" alt="" width="28" height="28" loading="lazy">';
  }
  // Inloggen met Google, GitHub of Apple: welke aan staan, zegt de cloud (forum.inlogaanbieders).
  var aanbieders = [];
  var AANBIEDER = {
    google: { naam: 'Google', icoon: '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>' },
    github: { naam: 'GitHub', icoon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>' },
    apple: { naam: 'Apple', icoon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>' }
  };
  function aanbiederKnoppen() {
    return aanbieders.filter(function (a) { return AANBIEDER[a]; }).map(function (a) {
      return '<button type="button" class="fo-aanbieder" data-actie="inloggen-met" data-aanbieder="' + a + '">' + AANBIEDER[a].icoon +
        '<span>' + esc(t('verderMet')) + ' ' + AANBIEDER[a].naam + '</span></button>';
    }).join('');
  }

  // Community of ontwikkeling: welke onderwerpen een lijst toont (onthouden per bezoeker).
  var SOORT = 'openaec-forum-soort';
  function soort() {
    var s = 'community';
    try { s = localStorage.getItem(SOORT) || s; } catch (e) {}
    return s === 'ontwikkeling' || s === 'alles' ? s : 'community';
  }
  function soortVelden(velden) { return soort() === 'alles' ? velden : Object.assign({ soort: soort() }, velden); }
  function soortKnoppen() {
    return '<span class="fo-soort" role="group" title="' + esc(t('soortUitleg')) + '">' + ['community', 'ontwikkeling', 'alles'].map(function (s) {
      return '<button type="button" data-actie="soort" data-soort="' + s + '"' + (soort() === s ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>' + esc(t(s)) + '</button>';
    }).join('') + '</span>';
  }
  // De fora per land: een categorie met `land` staat in het forum van dat land. De naam van het land per taal.
  var LANDEN = {
    nl: { nl: 'Nederland', en: 'Netherlands', fr: 'Pays-Bas', tr: 'Hollanda', es: 'Países Bajos', de: 'Niederlande' },
    es: { nl: 'Spanje', en: 'Spain', fr: 'Espagne', tr: 'İspanya', es: 'España', de: 'Spanien' }
  };
  function landNaam(code) { var l = LANDEN[code]; return l ? (l[taal()] || l.en) : String(code).toUpperCase(); }
  function landMerk(code) { return '<span class="fo-landcode" aria-hidden="true">' + esc(String(code).toUpperCase()) + '</span>'; }
  // De labels van beroepsgroepen bij een categorie (`beroepen` van de cloud): de naam per taal.
  var BEROEPEN = {
    'constructeur': { nl: 'Constructeur', en: 'Structural engineer', fr: 'Ingénieur structure', tr: 'Yapı mühendisi', es: 'Ingeniero estructural', de: 'Tragwerksplaner' },
    'geotechnisch-adviseur': { nl: 'Geotechnisch adviseur', en: 'Geotechnical engineer', fr: 'Géotechnicien', tr: 'Geoteknik mühendisi', es: 'Ingeniero geotécnico', de: 'Geotechniker' },
    'installatieadviseur': { nl: 'Installatieadviseur', en: 'Building services engineer', fr: 'Ingénieur fluides', tr: 'Tesisat mühendisi', es: 'Ingeniero de instalaciones', de: 'TGA-Planer' },
    'energieadviseur': { nl: 'Energieadviseur', en: 'Energy assessor', fr: 'Conseiller en énergie', tr: 'Enerji danışmanı', es: 'Asesor energético', de: 'Energieberater' },
    'civiel-ontwerper': { nl: 'Civiel ontwerper', en: 'Civil designer', fr: 'Projeteur VRD', tr: 'Altyapı tasarımcısı', es: 'Proyectista de obra civil', de: 'Tiefbauplaner' },
    'tekenaar': { nl: 'Tekenaar', en: 'Drafter', fr: 'Dessinateur', tr: 'Teknik ressam', es: 'Delineante', de: 'Bauzeichner' },
    'architect': { nl: 'Architect', en: 'Architect', fr: 'Architecte', tr: 'Mimar', es: 'Arquitecto', de: 'Architekt' },
    'bouwkundige': { nl: 'Bouwkundige', en: 'Building engineer', fr: 'Ingénieur bâtiment', tr: 'İnşaat teknikeri', es: 'Arquitecto técnico', de: 'Bauingenieur' },
    'bouwfysicus': { nl: 'Bouwfysicus', en: 'Building physicist', fr: 'Thermicien du bâtiment', tr: 'Yapı fizikçisi', es: 'Especialista en física de la construcción', de: 'Bauphysiker' },
    'bim-modelleur': { nl: 'BIM-modelleur', en: 'BIM modeller', fr: 'Modeleur BIM', tr: 'BIM modelleyici', es: 'Modelador BIM', de: 'BIM-Modellierer' },
    'werkvoorbereider': { nl: 'Werkvoorbereider', en: 'Site planner', fr: 'Préparateur de chantier', tr: 'İş hazırlık uzmanı', es: 'Jefe de oficina técnica', de: 'Arbeitsvorbereiter' },
    'projectleider': { nl: 'Projectleider', en: 'Project manager', fr: 'Chef de projet', tr: 'Proje yöneticisi', es: 'Jefe de proyecto', de: 'Projektleiter' },
    'aannemer': { nl: 'Aannemer', en: 'Contractor', fr: 'Entrepreneur', tr: 'Yüklenici', es: 'Contratista', de: 'Bauunternehmer' },
    'calculator': { nl: 'Calculator', en: 'Cost estimator', fr: 'Métreur', tr: 'Maliyet uzmanı', es: 'Presupuestador', de: 'Kalkulator' },
    'landmeter': { nl: 'Landmeter', en: 'Surveyor', fr: 'Géomètre', tr: 'Harita mühendisi', es: 'Topógrafo', de: 'Vermesser' },
    'softwareontwikkelaar': { nl: 'Softwareontwikkelaar', en: 'Software developer', fr: 'Développeur', tr: 'Yazılım geliştirici', es: 'Desarrollador de software', de: 'Softwareentwickler' },
    'docent': { nl: 'Docent', en: 'Teacher', fr: 'Enseignant', tr: 'Öğretmen', es: 'Docente', de: 'Dozent' },
    'student': { nl: 'Student', en: 'Student', fr: 'Étudiant', tr: 'Öğrenci', es: 'Estudiante', de: 'Student' },
    'administrateur': { nl: 'Administrateur', en: 'Bookkeeper', fr: 'Comptable', tr: 'Muhasebeci', es: 'Contable', de: 'Buchhalter' }
  };
  var BEROEPKEUZE = ['architect', 'bouwkundige', 'constructeur', 'geotechnisch-adviseur', 'installatieadviseur', 'energieadviseur', 'bouwfysicus',
    'civiel-ontwerper', 'tekenaar', 'bim-modelleur', 'werkvoorbereider', 'projectleider', 'aannemer', 'calculator', 'landmeter', 'administrateur',
    'softwareontwikkelaar', 'docent', 'student'];
  var VOORWIE = { nl: ['Voor wie?', 'Iedereen'], en: ['For whom?', 'Everyone'], fr: ['Pour qui ?', 'Tout le monde'], tr: ['Kimin için?', 'Herkes'], es: ['¿Para quién?', 'Todos'], de: ['Für wen?', 'Alle'] };
  var beroepKeuze = '';
  function beroepNaam(code) { var b = BEROEPEN[code]; return b ? (b[taal()] || b.en) : String(code).replace(/-/g, ' '); }
  // De beroepsgroepen van een lid: `beroepen` (een lijst), of `beroep` (één code) van de vorige versie van de cloud.
  function beroepenVan(a) { return a.beroepen || (a.beroep ? [a.beroep] : []); }
  function beroepLabels(c) {
    return (c.beroepen || []).length ? '<span class="fo-beroepen">' + c.beroepen.map(function (b) { return '<i class="fo-beroep">' + esc(beroepNaam(b)) + '</i>'; }).join('') + '</span>' : '';
  }
  // Boven de categorieën van een land: kies een beroepsgroep en zie alleen wat daarvoor is.
  function beroepKnoppen(lijst) {
    var codes = [];
    lijst.forEach(function (c) { (c.beroepen || []).forEach(function (b) { if (codes.indexOf(b) < 0) codes.push(b); }); });
    if (!codes.length) return '';
    if (codes.indexOf(beroepKeuze) < 0) beroepKeuze = '';
    var w = VOORWIE[taal()] || VOORWIE.en;
    return '<div class="fo-beroeprij"><span>' + esc(w[0]) + '</span>' + [''].concat(codes).map(function (b) {
      return '<button type="button" class="fo-beroep" data-actie="beroep" data-beroep="' + esc(b) + '" aria-pressed="' + (beroepKeuze === b) + '">' + esc(b ? beroepNaam(b) : w[1]) + '</button>';
    }).join('') + '</div>';
  }
  function catRij(c) {
    return '<a class="fo-catrij' + (c.github_repo ? ' fo-catrij-tool' : '') + '" href="#/c/' + encodeURIComponent(c.slug) + '" style="--kleur:' + catKleur(c.slug) + '">' +
      (c.github_repo ? toolLogo(c.slug) : '') +
      '<span class="fo-catrij-tekst"><strong>' + esc(catTitel(c)) + '</strong>' + (catUitleg(c) && !c.github_repo ? '<span>' + esc(catUitleg(c)) + '</span>' : '') + beroepLabels(c) +
      (c.alleen_team ? '<em>' + esc(t('alleenTeamKort')) + '</em>' : '') + '</span><span class="fo-catrij-tal">' + c.onderwerpen + '</span></a>';
  }
  // De linkerkolom: eerst de gewone categorieën, dan de tools in twee kolommen.
  function catLijst(lijst, toolsKop, toolsUitleg) {
    var tools = lijst.filter(function (c) { return c.github_repo; });
    return lijst.filter(function (c) { return !c.github_repo; }).map(catRij).join('') +
      (tools.length ? '<div class="fo-paneel-kop fo-toolskop"><span>' + esc(toolsKop) + '</span><span>' + esc(toolsUitleg) + '</span></div>' +
        '<div class="fo-tools">' + tools.map(catRij).join('') + '</div>' : '');
  }
  var HERKOMST = 'openaec-forum-herkomst';
  var ICOON_GH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>';
  var ICOON_DIS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-7.6l-4.7 3.7A1 1 0 0 1 6 20.9V18H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>';
  // Een onderwerp is een losse discussie op het forum of hoort bij GitHub (de GitHub Mirror).
  function herkomstVan(o) { return o.herkomst || (o.github ? 'github' : 'discussie'); }
  function herkomstMerk(o) {
    return herkomstVan(o) === 'github'
      ? '<span class="fo-herkomst fo-herkomst-gh">' + ICOON_GH + esc(t('githubMirror')) + (o.github ? ' #' + o.github.nummer : '') + '</span>'
      : '<span class="fo-herkomst fo-herkomst-dis">' + ICOON_DIS + esc(t('discussie')) + '</span>';
  }
  function herkomst() {
    var h = 'alles';
    try { h = localStorage.getItem(HERKOMST) || h; } catch (e) {}
    return h === 'discussie' || h === 'github' ? h : 'alles';
  }
  // De keuze boven de lijst van een tool: alles, alleen de discussies of alleen de GitHub Mirror.
  function herkomstKnoppen(cat) {
    var tal = cat ? { alles: cat.onderwerpen, discussie: cat.discussies, github: cat.onderwerpen - cat.discussies } : {};
    var label = { alles: t('alles'), discussie: t('discussies'), github: t('githubMirror') };
    var icoon = { alles: '', discussie: ICOON_DIS, github: ICOON_GH };
    return '<div class="fo-herkomstrij"><div class="fo-herkomsttabs" role="group">' + ['alles', 'discussie', 'github'].map(function (h) {
      return '<button type="button" class="fo-herkomsttab fo-herkomsttab-' + h + '" data-actie="herkomst" data-herkomst="' + h + '" aria-pressed="' + (herkomst() === h) + '">' +
        icoon[h] + esc(label[h]) + (tal[h] >= 0 ? ' <span>' + tal[h] + '</span>' : '') + '</button>';
    }).join('') + '</div><p class="fo-klein">' + esc(t('herkomstUitleg')) + '</p></div>';
  }
  function zoekCat(slug) { return categorieen.find(function (c) { return c.slug === slug; }); }
  function catChip(cat) {
    return cat ? '<a class="fo-chip" href="#/c/' + encodeURIComponent(cat.slug) + '"><i style="background:' + catKleur(cat.slug) + '"></i>' + esc(catTitel(cat)) + '</a>' : '';
  }

  function tekenBalk() {
    // Ingelogd staan het profiel en uitloggen rechtsboven in de navigatie (shared/nav.js), niet in de kop.
    balk.hidden = !!ik;
    balk.innerHTML = ik ? '' : knop(t('inloggen'), 'inloggen', 'btn-secondary') +
      '<a class="btn btn-primary fo-knop" href="#/aanmelden">' + esc(t('aanmelden')) + '</a>';
  }

  // De rij met tabbladen boven elk scherm, met rechts de knop voor een nieuw onderwerp.
  function tabs(actief, slug) {
    function tab(id, href, label) {
      return '<a class="fo-tab" href="' + href + '"' + (actief === id ? ' aria-current="page"' : '') + '>' + esc(label) + '</a>';
    }
    return '<div class="fo-tabs"><nav class="fo-tabrij" aria-label="' + esc(t('titel')) + '">' +
      tab('cats', '#/', t('categorieen')) + tab('recent', '#/recent', t('recent')) + '</nav>' +
      '<a class="btn btn-primary fo-knop fo-nieuw" href="#/nieuw' + (slug ? '/' + encodeURIComponent(slug) : '') + '">+ ' + esc(t('nieuw')) + '</a></div>';
  }

  function labels(o) {
    return (o.vastgezet ? '<span class="fo-label">' + esc(t('vastgezet')) + '</span>' : '') +
      (o.status === 'Gesloten' ? '<span class="fo-label fo-label-grijs">' + esc(t('gesloten').replace(/\.$/, '')) + '</span>' : '') +
      (o.verborgen ? '<span class="fo-label fo-label-rood">' + esc(t('verborgen')) + '</span>' : '') + aiLabel(o);
  }
  function aiLabel(x) { return x.ai ? '<span class="fo-label fo-label-ai" title="' + esc(t('ontwikkeling')) + '">AI</span>' : ''; }

  function onderwerpRij(o, zonderCat) {
    var cat = zonderCat ? null : zoekCat(o.categorie);
    return '<li class="fo-rij fo-rij-' + herkomstVan(o) + '">' + avatar(o.auteur) +
      '<div class="fo-rij-hoofd"><a class="fo-item-titel" href="#/t/' + encodeURIComponent(o.naam) + '">' + esc(o.titel) + '</a>' + labels(o) +
      '<span class="fo-meta">' + herkomstMerk(o) + catChip(cat) + auteur(o.auteur) + '</span></div>' +
      '<div class="fo-rij-tal"><strong title="' + esc(t('reacties')(o.reacties)) + '">' + o.reacties + '</strong><span>' + esc(tijd(o.laatste_activiteit)) + '</span></div></li>';
  }

  // Onder de startpagina: andere fora, de badges van de Academy en meer met je account.
  function onderblokken() {
    var fora = FORA.map(function (f) {
      return '<li><a href="' + f.url + '" target="_blank" rel="noopener"><span class="fo-forum-merk" style="background:' + f.kleur + '" aria-hidden="true">' + esc(f.naam.charAt(0)) + '</span>' +
        '<span class="fo-forum-tekst"><strong>' + esc(f.naam) + '</strong><span>' + esc(t(f.sleutel)) + '</span></span><span class="fo-uit" aria-hidden="true">↗</span></a></li>';
    }).join('');
    return '<div class="fo-onder' + (TOON_SUPERCLOUD ? '' : ' fo-onder-twee') + '">' +
      '<section class="fo-kaart"><h3>' + esc(t('foraKop')) + '</h3><p>' + esc(t('foraUitleg')) + '</p><ul class="fo-fora">' + fora + '</ul></section>' +
      '<section class="fo-kaart fo-badges"><h3>' + esc(t('badgesKop')) + ' <span class="fo-label">' + esc(t('binnenkort')) + '</span></h3><p>' + esc(t('badgesUitleg')) + '</p>' +
      '<div class="fo-badgerij" aria-hidden="true"><span class="fo-badge">IFC</span><span class="fo-badge">PDF</span><span class="fo-badge">CAD</span><span class="fo-badge fo-badge-goud">★</span></div>' +
      '<a class="fo-meer-link" href="/academy/">' + esc(t('naarAcademy')) + ' →</a>' +
      '<p class="fo-klein fo-regels-link"><a href="#/regels">' + esc(t('regelsKop')) + '</a></p></section>' +
      (!TOON_SUPERCLOUD ? '' : '<section class="fo-kaart fo-upsell"><h3>' + esc(t('upsellKop')) + '</h3><p>' + esc(t('upsell')) + '</p>' +
      (ik ? '<a class="btn btn-dark fo-knop" href="' + esc(CLOUD) + '/start">' + esc(t('upsellKnopIn')) + '</a>'
        : '<a class="btn btn-dark fo-knop" href="/supercloud/">' + esc(t('upsellKnop')) + '</a>') +
      '</section>') +
      '</div>';
  }

  function startScherm() {
    var cats = catLijst(categorieen.filter(function (c) { return !c.land; }), t('toolsKop'), t('toolsUitleg'));
    var landen = [];
    categorieen.forEach(function (c) { if (c.land && landen.indexOf(c.land) < 0) landen.push(c.land); });
    if (landen.length) {
      cats += '<div class="fo-paneel-kop fo-toolskop"><span>' + esc(t('landenKop')) + '</span><span>' + esc(t('landenUitleg')) + '</span></div>' +
        landen.map(function (code) {
          var van = categorieen.filter(function (c) { return c.land === code; });
          return '<a class="fo-catrij fo-catrij-land" href="#/land/' + encodeURIComponent(code) + '">' + landMerk(code) +
            '<span class="fo-catrij-tekst"><strong>' + esc(landNaam(code)) + '</strong><span>' + esc(van.map(catTitel).join(' · ')) + '</span></span>' +
            '<span class="fo-catrij-tal">' + van.reduce(function (som, c) { return som + c.onderwerpen; }, 0) + '</span></a>';
        }).join('');
    }
    app.innerHTML = tabs('cats') + tweeKolommen(cats, '#/recent') + onderblokken();
    vulRecent({});
  }

  // Links de categorieën, rechts de recente onderwerpen (van alles, of van één land).
  function tweeKolommen(cats, meerLink) {
    return '<div class="fo-twee">' +
      '<section class="fo-paneel"><div class="fo-paneel-kop"><span>' + esc(t('categorie')) + '</span><span>' + esc(t('onderwerpenKop')) + '</span></div>' +
      (cats || '<p class="fo-leeg">' + esc(t('fout')) + '</p>') + '</section>' +
      '<section class="fo-paneel"><div class="fo-paneel-kop"><span>' + esc(t('recent')) + '</span>' + soortKnoppen() + '</div>' +
      '<ul class="fo-rijen" id="fo-recent"><li class="fo-leeg">' + esc(t('laden')) + '</li></ul>' +
      (meerLink ? '<a class="fo-meer-link fo-paneel-voet" href="' + meerLink + '">' + esc(t('alleRecent')) + ' →</a>' : '') + '</section>' +
      '</div>';
  }
  function vulRecent(extra) {
    var lijst = document.getElementById('fo-recent');
    toonMet('onderwerpen', soortVelden(Object.assign({ start: 0 }, extra)), function (data) {
      var rijen = data.onderwerpen.slice(0, 8).map(function (o) { return onderwerpRij(o); }).join('');
      lijst.innerHTML = rijen || '<li class="fo-leeg">' + esc(t('geen')) + '</li>';
    }, function (e) {
      lijst.innerHTML = '<li class="fo-leeg">' + esc(e.message || t('fout')) + '</li>';
    });
  }

  // Het forum van één land: zijn eigen categorieën en tools, met de recente onderwerpen van dat land.
  function landScherm(code) {
    var van = categorieen.filter(function (c) { return c.land === code; });
    if (!van.length) return startScherm();
    document.title = landNaam(code) + ' — ' + t('titel') + ' — OpenAEC';
    app.innerHTML = tabs('') +
      '<p class="fo-kruimel"><a href="#/">' + esc(t('titel')) + '</a> / ' + esc(landNaam(code)) + '</p>' +
      '<div class="fo-catkop"><h2>' + landMerk(code) + esc(landNaam(code)) + '</h2><p>' + esc(t('landLead')) + '</p></div>' + beroepKnoppen(van);
    var gekozen = beroepKeuze ? van.filter(function (c) { return (c.beroepen || []).indexOf(beroepKeuze) >= 0; }) : van;
    app.innerHTML += tweeKolommen(catLijst(gekozen, t('landTools'), t('toolsUitleg')), '');
    vulRecent({ land: code });
  }

  function lijstScherm(cat) {
    var start = 0;
    var kop = cat
      ? (cat.land ? '<p class="fo-kruimel"><a href="#/">' + esc(t('titel')) + '</a> / <a href="#/land/' + encodeURIComponent(cat.land) + '">' + esc(landNaam(cat.land)) + '</a></p>' : '') +
        '<div class="fo-catkop" style="--kleur:' + catKleur(cat.slug) + '"><h2>' + (cat.github_repo ? toolLogo(cat.slug) : '') + esc(catTitel(cat)) + '</h2>' +
        (catUitleg(cat) ? '<p>' + esc(catUitleg(cat)) + '</p>' : '') + beroepLabels(cat) +
        (cat.alleen_team ? '<p class="fo-klein">' + esc(t('alleenTeam')) + '</p>' : '') + '</div>'
      : '';
    var metHerkomst = !cat || (cat.github_repo && cat.discussies >= 0);
    app.innerHTML = tabs(cat ? '' : 'recent', cat && cat.slug) + kop + (metHerkomst ? herkomstKnoppen(cat) : '') +
      '<section class="fo-paneel"><div class="fo-paneel-kop"><span>' + esc(t('onderwerpKop')) + '</span>' + soortKnoppen() + '</div>' +
      '<ul class="fo-rijen" id="fo-lijst"><li class="fo-leeg">' + esc(t('laden')) + '</li></ul></section>' +
      '<p class="fo-meer"><button type="button" class="btn btn-secondary" id="fo-meer" hidden>' + esc(t('meer')) + '</button></p>';
    var lijst = document.getElementById('fo-lijst');
    var meer = document.getElementById('fo-meer');
    var kies = metHerkomst && herkomst() !== 'alles' ? { herkomst: herkomst() } : {};
    function velden(vanaf) { return soortVelden(Object.assign({ start: vanaf }, kies, cat ? { categorie: cat.slug } : {})); }
    function teken(data) {
      lijst.innerHTML = data.onderwerpen.map(function (o) { return onderwerpRij(o, !!cat); }).join('') ||
        '<li class="fo-leeg">' + esc(t(cat && kies.herkomst === 'discussie' ? 'geenDiscussies' : 'geen')) + '</li>';
      start = data.onderwerpen.length;
      meer.hidden = !data.meer;
    }
    async function laadMeer() {
      meer.disabled = true;
      try {
        var data = await haal('onderwerpen', velden(start));
        lijst.insertAdjacentHTML('beforeend', data.onderwerpen.map(function (o) { return onderwerpRij(o, !!cat); }).join(''));
        start += data.onderwerpen.length;
        meer.hidden = !data.meer;
      } catch (e) { melding(e.message || t('fout')); }
      meer.disabled = false;
    }
    meer.addEventListener('click', laadMeer);
    toonMet('onderwerpen', velden(0), teken, function (e) {
      lijst.innerHTML = '<li class="fo-leeg">' + esc(e.message || t('fout')) + '</li>';
    });
  }

  // Alleen echte GitHub-adressen worden een link.
  function githubAdres(adres) { return /^https:\/\/github\.com\//.test(adres || '') ? adres : ''; }

  function berichtHtml(b, onderwerp) {
    var acties = '';
    var magBewerken = ik && (b.eigen || ik.moderator) && (onderwerp.status === 'Open' || ik.moderator);
    if (magBewerken) acties += knop(t('bewerken'), 'bewerk', 'btn-ghost', ' data-naam="' + esc(b.naam) + '"');
    if (magBewerken) acties += knop(t('verwijderen'), 'verwijder', 'btn-ghost', ' data-naam="' + esc(b.naam) + '"');
    if (ik && ik.moderator) acties += knop(t(b.verborgen ? 'toon' : 'verberg'), 'modereer', 'btn-ghost', ' data-soort="bericht" data-naam="' + esc(b.naam) + '" data-wat="' + (b.verborgen ? 'toon' : 'verberg') + '"');
    return '<article class="fo-post' + (b.verborgen ? ' fo-verborgen' : '') + '" id="b-' + esc(b.naam) + '">' + avatar(b.auteur, true) +
      '<div class="fo-post-lijf"><header><span>' + auteur(b.auteur) + aiLabel(b) + '</span>' + '<span class="fo-post-tijd">' + esc(tijd(b.aangemaakt)) +
      (b.bewerkt ? ' · ' + esc(t('bewerkt')) : '') + (b.verborgen ? ' · ' + esc(t('verborgen')) : '') +
      (githubAdres(b.github_url) ? ' · <a href="' + esc(b.github_url) + '" target="_blank" rel="noopener">GitHub ↗</a>' : '') + '</span></header>' +
      '<div class="fo-tekst">' + opmaak(b.tekst) + '</div>' +
      (acties ? '<footer class="fo-acties">' + acties + '</footer>' : '') + '</div></article>';
  }

  function onderwerpScherm(naam, opnieuw) {
    if (opnieuw) vergeetBuffer();
    if (!bekend('onderwerp', { naam: naam })) app.innerHTML = tabs('') + '<p class="fo-leeg">' + esc(t('laden')) + '</p>';
    return toonMet('onderwerp', { naam: naam }, function (data) {
      // Wie al aan het typen of bewerken is, houdt zijn scherm: het verse antwoord komt bij de volgende keer.
      var vak = app.querySelector('#fo-reageer textarea');
      if ((vak && vak.value) || app.querySelector('.fo-tekst form')) return;
      tekenOnderwerp(naam, data);
    }, function (e) {
      app.innerHTML = tabs('') + '<p><a href="#/">' + esc(t('terug')) + '</a></p><p class="fo-leeg">' + esc(e.status === 404 ? t('onbekend') : (e.message || t('fout'))) + '</p>';
    });
  }

  function tekenOnderwerp(naam, data) {
    var o = data.onderwerp;
    var cat = zoekCat(o.categorie);
    document.title = o.titel + ' — ' + t('titel') + ' — OpenAEC';
    var modknoppen = '';
    if (ik && ik.moderator) {
      modknoppen = '<div class="fo-acties fo-mod">' +
        knop(t(o.vastgezet ? 'maakLos' : 'zetVast'), 'modereer', 'btn-ghost', ' data-soort="onderwerp" data-naam="' + esc(o.naam) + '" data-wat="' + (o.vastgezet ? 'maak_los' : 'zet_vast') + '"') +
        knop(t(o.status === 'Open' ? 'sluit' : 'open'), 'modereer', 'btn-ghost', ' data-soort="onderwerp" data-naam="' + esc(o.naam) + '" data-wat="' + (o.status === 'Open' ? 'sluit' : 'open') + '"') +
        knop(t(o.verborgen ? 'toon' : 'verberg'), 'modereer', 'btn-ghost', ' data-soort="onderwerp" data-naam="' + esc(o.naam) + '" data-wat="' + (o.verborgen ? 'toon' : 'verberg') + '"') +
        (o.herkomst === 'discussie' && cat && cat.github_schrijven ? knop(t('maakIssue'), 'modereer', 'btn-ghost', ' data-soort="onderwerp" data-naam="' + esc(o.naam) + '" data-wat="naar_github"') : '') +
        '</div>';
    }
    var reageer;
    if (o.status !== 'Open' && !(ik && ik.moderator)) {
      reageer = '<p class="fo-klein fo-dicht">' + esc(t('gesloten')) + '</p>';
    } else if (ik) {
      reageer = '<form class="fo-post fo-reageer" id="fo-reageer">' + avatar(ik, true) + '<div class="fo-post-lijf fo-form">' +
        '<label><span>' + esc(t('jouwReactie')) + '</span><textarea name="tekst" rows="6" required minlength="2" maxlength="20000"></textarea></label>' +
        '<p class="fo-klein">' + esc(t('opmaakMd')) + '</p>' + (cat && cat.github_schrijven && o.github ? '<p class="fo-klein fo-gh-uitleg">' + esc(t('ookOpGithub')) + '</p>' : '') +
        '<label class="fo-akkoord"><input type="checkbox" name="ai" value="1"> <span>' + esc(t('metAi')) + '</span></label>' +
        '<p><button class="btn btn-primary" type="submit">' + esc(t('reageren')) + '</button></p></div></form>';
    } else {
      reageer = '<div class="fo-kaart fo-cta"><p>' + esc(t('logInOmTeReageren')) + '</p><p>' + knop(t('inloggen'), 'inloggen', 'btn-primary') +
        ' <a class="btn btn-secondary fo-knop" href="#/aanmelden">' + esc(t('aanmelden')) + '</a></p></div>';
    }
    app.innerHTML = tabs('', o.categorie) +
      '<div class="fo-onderwerp">' +
      '<p class="fo-kruimel"><a href="#/">' + esc(t('titel')) + '</a>' + (cat && cat.land ? ' / <a href="#/land/' + encodeURIComponent(cat.land) + '">' + esc(landNaam(cat.land)) + '</a>' : '') + (cat ? ' / <a href="#/c/' + encodeURIComponent(cat.slug) + '">' + esc(catTitel(cat)) + '</a>' : '') + '</p>' +
      '<h2 class="fo-onderwerp-titel">' + esc(o.titel) + labels(o) + '</h2>' +
      '<p class="fo-meta">' + herkomstMerk(o) + catChip(cat) + '<span>' + esc(t('reacties')(o.reacties)) + '</span>' +
      (o.github && githubAdres(o.github.url) ? '<a class="fo-meer-link" href="' + esc(o.github.url) + '" target="_blank" rel="noopener">' + esc(t('opGithub')) + ' #' + o.github.nummer + ' ↗</a>' : '') + '</p>' + modknoppen +
      '<div class="fo-posts">' + data.berichten.map(function (b) { return berichtHtml(b, o); }).join('') + '</div>' +
      reageer + '</div>';
    var form = document.getElementById('fo-reageer');
    if (form) {
      form.addEventListener('submit', async function (ev) {
        ev.preventDefault();
        var knopEl = form.querySelector('button');
        knopEl.disabled = true;
        try {
          await api('reageer', { onderwerp: o.naam, tekst: form.tekst.value, ai: form.ai.checked ? 1 : 0 }, true);
          melding('');
          form.tekst.value = '';
          onderwerpScherm(naam, true);
        } catch (e) {
          melding(e.message);
          knopEl.disabled = false;
        }
      });
    }
    metAfbeeldingen(form && form.tekst);
    app.querySelectorAll('[data-actie="verwijder"]').forEach(function (el) {
      el.addEventListener('click', async function () {
        var b = data.berichten.find(function (x) { return x.naam === el.dataset.naam; });
        if (!b || !window.confirm(t(b.eerste ? 'verwijderOnderwerpVraag' : 'verwijderVraag'))) return;
        el.disabled = true;
        try {
          var uit = await api('verwijder', { bericht: b.naam }, true);
          melding('');
          if (uit.onderwerp_weg) { await laadCategorieen(); location.hash = '#/'; }
          else onderwerpScherm(naam, true);
        } catch (e) { melding(e.message); el.disabled = false; }
      });
    });
    app.querySelectorAll('[data-actie="bewerk"]').forEach(function (el) {
      el.addEventListener('click', function () {
        var b = data.berichten.find(function (x) { return x.naam === el.dataset.naam; });
        var art = document.getElementById('b-' + b.naam);
        art.querySelector('.fo-tekst').innerHTML = '<form class="fo-form">' +
          (b.eerste ? '<label><span>' + esc(t('titelVeld')) + '</span><input name="titel" required minlength="5" maxlength="140" value="' + esc(o.titel) + '"></label>' : '') +
          '<label><span>' + esc(t('berichtVeld')) + '</span><textarea name="tekst" rows="8" required minlength="2" maxlength="20000">' + esc(b.tekst) + '</textarea></label>' +
          '<p><button class="btn btn-primary" type="submit">' + esc(t('opslaan')) + '</button> <button class="btn btn-ghost" type="button" data-annuleer>' + esc(t('annuleren')) + '</button></p></form>';
        var f = art.querySelector('form');
        metAfbeeldingen(f.tekst);
        f.querySelector('[data-annuleer]').addEventListener('click', function () { f.remove(); tekenOnderwerp(naam, data); });
        f.addEventListener('submit', async function (ev) {
          ev.preventDefault();
          try {
            await api('bewerk', Object.assign({ bericht: b.naam, tekst: f.tekst.value }, f.titel ? { titel: f.titel.value } : {}), true);
            melding('');
            f.remove();
            onderwerpScherm(naam, true);
          } catch (e) { melding(e.message); }
        });
      });
    });
  }

  // Een scherm met één kolom: nieuw onderwerp, account maken, regels.
  function enkel(slug, html) {
    app.innerHTML = tabs('', slug) + '<div class="fo-enkel"><section class="fo-kaart">' + html + '</section></div>';
  }

  function nieuwScherm(slug) {
    if (!ik) {
      enkel(slug, '<h2>' + esc(t('nieuw')) + '</h2><p>' + esc(t('logInOmTeSchrijven')) + '</p><p>' +
        knop(t('inloggen'), 'inloggen', 'btn-primary') + ' <a class="btn btn-secondary fo-knop" href="#/aanmelden">' + esc(t('aanmelden')) + '</a></p>');
      return;
    }
    var keuzes = categorieen.filter(function (c) { return !c.alleen_team || ik.moderator; });
    enkel(slug, '<h2>' + esc(t('nieuw')) + '</h2><form class="fo-form" id="fo-nieuw">' +
      '<label><span>' + esc(t('categorieVeld')) + '</span><select name="categorie" required>' +
      keuzes.map(function (c) { return '<option value="' + esc(c.slug) + '"' + (c.slug === slug ? ' selected' : '') + '>' + esc((c.land ? landNaam(c.land) + ' · ' : '') + catTitel(c)) + '</option>'; }).join('') +
      '</select></label>' +
      '<label><span>' + esc(t('titelVeld')) + '</span><input name="titel" required minlength="5" maxlength="140"></label>' +
      '<label><span>' + esc(t('berichtVeld')) + '</span><textarea name="tekst" rows="10" required minlength="2" maxlength="20000"></textarea></label>' +
      '<p class="fo-klein">' + esc(t('opmaakMd')) + '</p>' +
      '<fieldset class="fo-soortkeuze" id="fo-wordt-issue" hidden><legend>' + esc(t('soortOnderwerp')) + '</legend>' +
      '<label class="fo-soortoptie fo-soortoptie-dis"><input type="radio" name="issue" value="0" checked><span>' + ICOON_DIS + '<strong>' + esc(t('soortDiscussie')) + '</strong><em>' + esc(t('soortDiscussieUitleg')) + '</em></span></label>' +
      '<label class="fo-soortoptie fo-soortoptie-gh"><input type="radio" name="issue" value="1"><span>' + ICOON_GH + '<strong>' + esc(t('soortIssue')) + '</strong><em>' + esc(t('soortIssueUitleg')) + '</em></span></label></fieldset>' +
      '<label class="fo-akkoord"><input type="checkbox" name="ai" value="1"> <span>' + esc(t('metAi')) + '</span></label>' +
      '<p><button class="btn btn-primary" type="submit">' + esc(t('plaatsen')) + '</button></p></form>');
    var form = document.getElementById('fo-nieuw');
    function toonIssueUitleg() {
      var gekozen = zoekCat(form.categorie.value);
      document.getElementById('fo-wordt-issue').hidden = !(gekozen && gekozen.github_schrijven);
    }
    form.categorie.addEventListener('change', toonIssueUitleg);
    toonIssueUitleg();
    metAfbeeldingen(form.tekst);
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      var knopEl = form.querySelector('button');
      knopEl.disabled = true;
      try {
        var data = await api('nieuw_onderwerp', { categorie: form.categorie.value, titel: form.titel.value, tekst: form.tekst.value, ai: form.ai.checked ? 1 : 0, issue: !document.getElementById('fo-wordt-issue').hidden && form.issue.value === '1' ? 1 : 0 }, true);
        melding('');
        await laadCategorieen();
        location.hash = '#/t/' + data.naam;
      } catch (e) {
        melding(e.message);
        knopEl.disabled = false;
      }
    });
  }

  function aanmeldScherm() {
    var l = taal();
    // Gewone formulier-POST naar de cloud (zoals /supercloud/…/sign-up), met bron=forum: een account zonder omgeving,
    // en terug naar het forum na de verificatie.
    enkel(null, '<h2>' + esc(t('aanmeldKop')) + '</h2>' +
      (aanbieders.length ? '<div class="fo-aanbieders">' + aanbiederKnoppen() + '</div><p class="fo-of"><span>' + esc(t('ofMetMail')) + '</span></p>' : '') +
      '<p class="fo-uitleg">' + esc(t('aanmeldUitleg')) + '</p>' +
      '<form class="fo-form" method="post" action="' + esc(CLOUD) + '/aanmelden/start">' +
      '<input type="hidden" name="taal" value="' + esc(l) + '"><input type="hidden" name="bron" value="forum">' +
      '<input type="hidden" name="terug" value="' + esc(TERUG + '#/') + '">' +
      '<label><span>' + esc(t('naam')) + '</span><input name="naam" autocomplete="name" required maxlength="140"></label>' +
      '<label><span>' + esc(t('email')) + '</span><input type="email" name="email" autocomplete="email" required maxlength="254"></label>' +
      '<label class="fo-honing" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>' +
      '<label class="fo-akkoord"><input type="checkbox" name="akkoord" value="1" required> <span>' + t('akkoord') + '</span></label>' +
      '<p><button class="btn btn-primary" type="submit">' + esc(t('versturen')) + '</button></p></form>' +
      '<p class="fo-klein">' + esc(t('alAccount')) + ' ' + knop(t('inloggen'), 'inloggen', 'btn-ghost') + '</p>');
  }

  async function profielScherm() {
    if (!ik) {
      enkel(null, '<h2>' + esc(t('profiel')) + '</h2><p>' + esc(t('logInVoorProfiel')) + '</p><p>' + knop(t('inloggen'), 'inloggen', 'btn-primary') + '</p>');
      return;
    }
    if (!bekend('profiel')) enkel(null, '<p class="fo-leeg">' + esc(t('laden')) + '</p>');
    toonMet('profiel', null, tekenProfiel, function (e) { enkel(null, '<p class="fo-leeg">' + esc(e.message || t('fout')) + '</p>'); });
  }

  function tekenProfiel(p) {
    ik.foto = p.foto;
    ik.github = p.github;
    var sinds = new Date(p.lid_sinds);
    var rijen = p.recent.map(function (o) { return onderwerpRij(o); }).join('');
    var reacties = (p.recente_reacties || []).map(function (r) {
      return '<li class="fo-rij fo-reactierij"><div class="fo-rij-hoofd"><a class="fo-item-titel" href="#/t/' + encodeURIComponent(r.onderwerp) + '">' + esc(r.titel) + '</a>' +
        '<span class="fo-fragment">' + esc(r.fragment) + '</span></div><div class="fo-rij-tal"><span>' + esc(tijd(r.aangemaakt)) + '</span>' +
        (githubAdres(r.github_url) ? '<span class="fo-gh">GitHub</span>' : '') + '</div></li>';
    }).join('');
    var github = p.github
      ? '<p class="fo-profiel-gh"><span class="fo-gh">GitHub</span> <a href="https://github.com/' + encodeURIComponent(p.github) + '" target="_blank" rel="noopener">@' + esc(p.github) + '</a></p>'
      : (githubAdres(p.github_koppelen) ? '<p class="fo-profiel-gh"><a class="btn btn-secondary fo-knop" href="' + esc(p.github_koppelen) + '">' + esc(t('githubKoppelen')) + '</a> <span class="fo-klein">' + esc(t('githubUitleg')) + '</span></p>' : '');
    app.innerHTML = tabs('') + '<div class="fo-enkel">' +
      '<section class="fo-kaart fo-profiel"><div class="fo-profiel-kop">' + avatar(p, true) +
      '<div><h2>' + esc(p.naam) + (p.moderator ? ' <span class="fo-team">' + esc(t('team')) + '</span>' : '') + '</h2>' +
      '<p class="fo-klein">' + esc(p.email) + '</p></div></div>' + github +
      ((p.inlogmethodes || []).length ? '<p class="fo-klein fo-methodes">' + esc(t('gekoppeldMet')) + ': ' + p.inlogmethodes.filter(function (a) { return AANBIEDER[a]; }).map(function (a) {
        return '<span class="fo-methode">' + AANBIEDER[a].icoon + AANBIEDER[a].naam + '</span>';
      }).join(' ') + '</p>' : '') +
      '<dl class="fo-cijfers"><div><dt>' + esc(t('lidSinds')) + '</dt><dd>' + esc(isNaN(sinds) ? '' : sinds.toLocaleDateString(taal(), { year: 'numeric', month: 'long', day: 'numeric' })) + '</dd></div>' +
      '<div><dt>' + esc(t('onderwerpenKop')) + '</dt><dd>' + p.onderwerpen + '</dd></div>' +
      '<div><dt>' + esc(t('reactiesKop')) + '</dt><dd>' + p.reacties + '</dd></div></dl>' +
      '<p class="fo-profiel-knoppen">' + (TOON_SUPERCLOUD ? '<a class="btn btn-dark fo-knop" href="' + esc(CLOUD) + '/start">' + esc(t('upsellKnopIn')) + '</a> ' : '') +
      '<button type="button" class="btn btn-secondary fo-knop" id="fo-foto-kies">' + esc(t('fotoKiezen')) + '</button>' +
      '<input type="file" id="fo-foto" accept="image/png,image/jpeg,image/gif,image/webp" hidden>' +
      (p.foto ? '<button type="button" class="btn btn-ghost fo-knop" id="fo-foto-weg">' + esc(t('fotoWeg')) + '</button>' : '') +
      knop(t('uitloggen'), 'uitloggen', 'btn-ghost') + '</p></section>' +
      profielFormulier(p) +
      '<section class="fo-paneel fo-profiel-lijst"><div class="fo-paneel-kop"><span>' + esc(t('mijnOnderwerpen')) + '</span></div>' +
      '<ul class="fo-rijen">' + (rijen || '<li class="fo-leeg">' + esc(t('geenEigen')) + '</li>') + '</ul></section>' +
      '<section class="fo-paneel fo-profiel-lijst"><div class="fo-paneel-kop"><span>' + esc(t('mijnReacties')) + '</span></div>' +
      '<ul class="fo-rijen">' + (reacties || '<li class="fo-leeg">' + esc(t('geenReacties')) + '</li>') + '</ul></section></div>';
    var kies = document.getElementById('fo-foto');
    function klaar(werk) {
      werk.then(function () { melding(''); vergeetBuffer(); profielScherm(); }, function (e) { melding(e.message || t('fout')); });
    }
    document.getElementById('fo-foto-kies').addEventListener('click', function () { kies.click(); });
    kies.addEventListener('change', function () { if (kies.files[0]) klaar(uploadAfbeelding(kies.files[0], 'profielfoto')); });
    var weg = document.getElementById('fo-foto-weg');
    if (weg) weg.addEventListener('click', function () { klaar(api('profielfoto', { weg: 1 }, true)); });
    var formulier = document.getElementById('fo-profiel-form');
    if (formulier) formulier.addEventListener('submit', function (e) {
      e.preventDefault();
      var gekozen = [].filter.call(formulier.querySelectorAll('input[name="beroepen"]'), function (i) { return i.checked; }).map(function (i) { return i.value; });
      // `beroep` erbij voor de vorige versie van de cloud, die er één bewaart.
      var gegevens = { beroepen: gekozen, beroep: gekozen[0] || '' }, zichtbaar = {};
      PROFIELVELDEN.forEach(function (v) {
        if (formulier.elements[v]) gegevens[v] = formulier.elements[v].value;
        if (formulier.elements['toon_' + v]) zichtbaar[v] = formulier.elements['toon_' + v].checked ? 1 : 0;
      });
      api('profiel_bewaar', { gegevens: JSON.stringify(gegevens), zichtbaar: JSON.stringify(zichtbaar) }, true).then(function () {
        profielScherm().then(function () { melding(t('profielBewaard')); });
      }, function (e2) { melding(e2.message || t('fout')); });
    });
  }

  // Wat je over jezelf invult, met per veld of anderen het zien (forum.profiel_bewaar).
  var PROFIELVELDEN = ['bedrijf', 'functie', 'plaats', 'over', 'website', 'linkedin', 'github'];
  var PROFIELLABEL = { bedrijf: 'pBedrijf', functie: 'pFunctie', plaats: 'pPlaats', over: 'pOver', website: 'pWebsite', linkedin: 'pLinkedin', github: 'pGithub' };
  function profielFormulier(p) {
    if (!p.gegevens || !p.zichtbaar) return '';
    var velden = PROFIELVELDEN.map(function (v) {
      if (v === 'github' && !p.github) return '';
      var id = 'fo-p-' + v, waarde = v === 'github' ? '@' + p.github : (p.gegevens[v] || '');
      var invoer = v === 'github' ? '<input id="' + id + '" value="' + esc(waarde) + '" disabled>'
        : v === 'over' ? '<textarea id="' + id + '" name="over" maxlength="500" rows="3">' + esc(waarde) + '</textarea>'
        : '<input id="' + id + '" name="' + v + '" value="' + esc(waarde) + '" maxlength="' + (v === 'website' || v === 'linkedin' ? 200 : 140) + '"' +
          (v === 'linkedin' ? ' placeholder="linkedin.com/in/…"' : v === 'website' ? ' placeholder="https://"' : '') + ' autocomplete="off">';
      return '<div class="fo-pveld"><label for="' + id + '">' + esc(t(PROFIELLABEL[v])) + '</label>' + invoer +
        '<label class="fo-toon"><input type="checkbox" name="toon_' + v + '"' + (p.zichtbaar[v] ? ' checked' : '') + '> ' + esc(t('toonAnderen')) + '</label></div>';
    }).join('');
    var beroepen = beroepenVan(p.gegevens);
    var keuze = '<fieldset class="fo-pveld fo-beroepkeus"><legend>' + esc(t('pBeroep')) + '</legend><span class="fo-klein">' + esc(t('beroepUitleg')) + '</span><div>' +
      BEROEPKEUZE.map(function (b) {
        return '<label class="fo-beroep"><input type="checkbox" name="beroepen" value="' + b + '"' + (beroepen.indexOf(b) >= 0 ? ' checked' : '') + '> ' + esc(beroepNaam(b)) + '</label>';
      }).join('') + '</div></fieldset>';
    return '<section class="fo-kaart fo-profiel-over"><h3>' + esc(t('overJou')) + '</h3><p class="fo-klein">' + esc(t('zichtbaarUitleg')) + '</p>' +
      '<form class="fo-form fo-pform" id="fo-profiel-form">' + keuze + velden +
      '<p class="fo-profiel-knoppen"><button type="submit" class="btn btn-primary fo-knop">' + esc(t('opslaan')) + '</button>' +
      (/^[a-z0-9]{6,20}$/.test(p.id || '') ? '<a class="btn btn-ghost fo-knop" href="#/lid/' + p.id + '">' + esc(t('openbaarProfiel')) + '</a>' : '') + '</p></form></section>';
  }

  // Het openbare profiel van een forumlid (forum.lid): alleen wat de persoon zelf zichtbaar maakte.
  function lidScherm(id) {
    if (!/^[a-z0-9]{6,20}$/.test(id || '')) return startScherm();
    var velden = { naam: id };
    if (!bekend('lid', velden)) enkel(null, '<p class="fo-leeg">' + esc(t('laden')) + '</p>');
    toonMet('lid', velden, tekenLid, function (e) { enkel(null, '<p class="fo-leeg">' + esc(e.message || t('fout')) + '</p>'); });
  }
  function veiligeLink(adres, begin) { return typeof adres === 'string' && adres.indexOf(begin) === 0 && !/[\s"'<>]/.test(adres) ? adres : ''; }
  function tekenLid(p) {
    var sinds = new Date(p.lid_sinds);
    var website = veiligeLink(p.website, 'https://'), linkedin = veiligeLink(p.linkedin, 'https://www.linkedin.com/');
    var github = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(p.github || '') ? p.github : '';
    var werk = [p.functie, p.bedrijf].filter(Boolean).join(' · ');
    var links = (website ? '<a href="' + esc(website) + '" target="_blank" rel="noopener nofollow ugc">' + esc(website.replace(/^https:\/\//, '').replace(/\/$/, '')) + '</a>' : '') +
      (linkedin ? '<a href="' + esc(linkedin) + '" target="_blank" rel="noopener nofollow ugc">LinkedIn</a>' : '') +
      (github ? '<a href="https://github.com/' + github + '" target="_blank" rel="noopener">GitHub @' + esc(github) + '</a>' : '');
    var rijen = (p.recent || []).map(function (o) { return onderwerpRij(o); }).join('');
    var reacties = (p.recente_reacties || []).map(function (r) {
      return '<li class="fo-rij fo-reactierij"><div class="fo-rij-hoofd"><a class="fo-item-titel" href="#/t/' + encodeURIComponent(r.onderwerp) + '">' + esc(r.titel) + '</a>' +
        '<span class="fo-fragment">' + esc(r.fragment) + '</span></div><div class="fo-rij-tal"><span>' + esc(tijd(r.aangemaakt)) + '</span></div></li>';
    }).join('');
    app.innerHTML = tabs('') + '<div class="fo-enkel">' +
      '<section class="fo-kaart fo-profiel"><div class="fo-profiel-kop">' + avatar(p, true) +
      '<div><h2>' + esc(p.naam) + (p.team ? ' <span class="fo-team">' + esc(t('team')) + '</span>' : '') + '</h2>' +
      (beroepenVan(p).length ? '<p class="fo-beroepen">' + beroepenVan(p).map(function (b) { return '<i class="fo-beroep">' + esc(beroepNaam(b)) + '</i>'; }).join('') + '</p>' : '') +
      (werk ? '<p>' + esc(werk) + '</p>' : '') + (p.plaats ? '<p class="fo-klein">' + esc(p.plaats) + '</p>' : '') + '</div></div>' +
      (p.over ? '<p class="fo-lid-over">' + esc(p.over) + '</p>' : '') +
      (links ? '<p class="fo-lid-links">' + links + '</p>' : '') +
      '<dl class="fo-cijfers"><div><dt>' + esc(t('lidSinds')) + '</dt><dd>' + esc(isNaN(sinds) ? '' : sinds.toLocaleDateString(taal(), { year: 'numeric', month: 'long', day: 'numeric' })) + '</dd></div>' +
      '<div><dt>' + esc(t('onderwerpenKop')) + '</dt><dd>' + p.onderwerpen + '</dd></div>' +
      '<div><dt>' + esc(t('reactiesKop')) + '</dt><dd>' + p.reacties + '</dd></div></dl></section>' +
      '<section class="fo-paneel fo-profiel-lijst"><div class="fo-paneel-kop"><span>' + esc(t('onderwerpenKop')) + '</span></div>' +
      '<ul class="fo-rijen">' + (rijen || '<li class="fo-leeg">' + esc(t('geenOnderwerpenLid')) + '</li>') + '</ul></section>' +
      '<section class="fo-paneel fo-profiel-lijst"><div class="fo-paneel-kop"><span>' + esc(t('reactiesKop')) + '</span></div>' +
      '<ul class="fo-rijen">' + (reacties || '<li class="fo-leeg">' + esc(t('geenReactiesLid')) + '</li>') + '</ul></section></div>';
  }

  // Inloggen: de aanbieders die aan staan, en e-mail met wachtwoord (de inlogpagina van de cloud).
  function inlogScherm() {
    if (ik) { location.hash = onthoudenPlek(); return; }
    if (!aanbieders.length) { login(); return; }
    enkel(null, '<h2>' + esc(t('inlogKop')) + '</h2><p class="fo-uitleg">' + esc(t('inlogUitleg')) + '</p>' +
      '<div class="fo-aanbieders">' + aanbiederKnoppen() + '</div><p class="fo-of"><span>' + esc(t('ofMail')) + '</span></p>' +
      '<div class="fo-aanbieders"><button type="button" class="fo-aanbieder" data-actie="inloggen-met" data-aanbieder="">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M3 6h18v12H3zM3 7l9 6 9-6"/></svg>' +
      '<span>' + esc(t('metWachtwoord')) + '</span></button></div>' +
      '<p class="fo-klein fo-inlog-voet">' + esc(t('nogGeenAccount')) + ' <a href="#/aanmelden">' + esc(t('aanmelden')) + '</a></p>');
  }

  function regelsScherm() {
    enkel(null, '<h2>' + esc(t('regelsKop')) + '</h2><ul class="fo-regels">' +
      t('regels').map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>');
  }

  function toon() {
    document.title = t('titel') + ' — OpenAEC Foundation';
    document.getElementById('fo-label').textContent = t('label');
    document.getElementById('fo-kop').textContent = t('titel');
    document.getElementById('fo-lead').textContent = t('lead');
    tekenBalk();
    var route = (location.hash || '#/').slice(1).split('/').filter(Boolean).map(decodeURIComponent);
    beurt++;
    // Buiten de startpagina een lage kop, zodat de inhoud meteen in beeld staat.
    var kop = document.querySelector('.fo-head');
    if (kop) kop.classList.toggle('fo-compact', route.length > 0);
    window.scrollTo(0, 0);
    if (route[0] === 't' && route[1]) return onderwerpScherm(route[1]);
    if (route[0] === 'c' && route[1]) {
      var cat = zoekCat(route[1]);
      return cat ? lijstScherm(cat) : lijstScherm(null);
    }
    if (route[0] === 'land' && route[1]) return landScherm(route[1]);
    if (route[0] === 'recent') return lijstScherm(null);
    if (route[0] === 'nieuw') return nieuwScherm(route[1] || null);
    if (route[0] === 'aanmelden') return aanmeldScherm();
    if (route[0] === 'regels') return regelsScherm();
    if (route[0] === 'profiel') return profielScherm();
    if (route[0] === 'lid' && route[1]) return lidScherm(route[1]);
    if (route[0] === 'inloggen') return inlogScherm();
    // De knop Uitloggen rechtsboven in de navigatie (ook vanaf andere pagina's van de site).
    if (route[0] === 'uitloggen') { history.replaceState(null, '', '/forum/#/'); return logout(); }
    return startScherm();
  }

  async function laadCategorieen() {
    try { categorieen = await api('categorieen'); } catch (e) { categorieen = []; melding(e.message || t('fout')); }
  }

  async function laadIk() {
    if (!leesSessie()) { ik = null; bewaarAccount(null); return; }
    try { ik = await api('ik'); bewaarAccount(ik); } catch (e) { ik = null; if (e.status === 401 || e.status === 403) { bewaarSessie(null); bewaarAccount(null); } }
  }

  async function start() {
    app = document.getElementById('fo-app');
    balk = document.getElementById('fo-balk');
    document.addEventListener('click', function (ev) {
      var el = ev.target.closest && ev.target.closest('[data-actie]');
      if (!el) return;
      var actie = el.dataset.actie;
      if (actie === 'soort') {
        try { localStorage.setItem(SOORT, el.dataset.soort); } catch (e) {}
        toon();
      }
      else if (actie === 'beroep') { beroepKeuze = el.dataset.beroep || ''; toon(); }
      else if (actie === 'herkomst') {
        try { localStorage.setItem(HERKOMST, el.dataset.herkomst); } catch (e) {}
        toon();
      }
      else if (actie === 'inloggen') {
        // Met aanbieders eerst de keuze; anders meteen naar de inlogpagina van de cloud.
        if (aanbieders.length) { onthoudPlek(); location.hash = '#/inloggen'; } else login();
      }
      else if (actie === 'inloggen-met') { el.disabled = true; login(el.dataset.aanbieder || ''); }
      else if (actie === 'uitloggen') logout();
      else if (actie === 'modereer') {
        el.disabled = true;
        api('modereer', { soort: el.dataset.soort, naam: el.dataset.naam, actie: el.dataset.wat }, true)
          .then(function () { melding(''); return laadCategorieen(); })
          .then(toon)
          .catch(function (e) { melding(e.message); el.disabled = false; });
      }
    });
    // De taalknoppen in de navigatie (shared/i18n.js): daarna opnieuw tekenen in de nieuwe taal.
    document.addEventListener('click', function (ev) {
      if (ev.target.closest && ev.target.closest('.lang-btn')) setTimeout(toon, 0);
    });
    document.addEventListener('click', function (ev) {
      if (ev.target.closest && ev.target.closest('a[href="#/aanmelden"]')) onthoudPlek();
    }, true);
    window.addEventListener('hashchange', function () { melding(''); toon(); });
    // Wijs of tik je een onderwerp of categorie aan, dan halen we het alvast op: bij de klik staat het er.
    function alvast(ev) {
      var a = ev.target.closest && ev.target.closest('a[href^="#/t/"], a[href^="#/c/"]');
      if (!a) return;
      var delen = a.getAttribute('href').slice(2).split('/').map(decodeURIComponent);
      if (delen[0] === 't') haal('onderwerp', { naam: delen[1] }).catch(function () {});
      else haal('onderwerpen', soortVelden({ start: 0, categorie: delen[1] })).catch(function () {});
    }
    document.addEventListener('pointerover', alvast);
    document.addEventListener('touchstart', alvast, { passive: true });
    await verwerkTerugkeer();
    // De lijst van de startpagina alvast, tegelijk met de categorieën.
    if (!/^#\/(t|c|nieuw|profiel|lid|aanmelden|regels|inloggen)/.test(location.hash)) haal('onderwerpen', soortVelden({ start: 0 })).catch(function () {});
    await Promise.all([laadCategorieen(), laadIk(), haal('inlogaanbieders').then(function (lijst) { aanbieders = lijst || []; }, function () { aanbieders = []; })]);
    toon();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
