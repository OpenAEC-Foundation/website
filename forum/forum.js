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
      aanmeldUitleg: 'Met één account schrijf je op het forum en gebruik je straks ook de OpenAEC-tools en de SuperCloud. Je krijgt een mail om je adres te bevestigen en een wachtwoord te kiezen; daarna kom je hier terug.',
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
      profiel: 'Mijn profiel', lidSinds: 'Lid sinds', mijnOnderwerpen: 'Mijn onderwerpen', geenEigen: 'Je hebt nog geen onderwerp gestart.', logInVoorProfiel: 'Log in om je profiel te zien.', upsellKnopIn: 'Open je SuperCloud'
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
      aanmeldUitleg: 'One account lets you post on the forum and later use the OpenAEC tools and the SuperCloud too. You will get an email to confirm your address and choose a password; then you come back here.',
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
      profiel: 'My profile', lidSinds: 'Member since', mijnOnderwerpen: 'My topics', geenEigen: 'You have not started a topic yet.', logInVoorProfiel: 'Log in to see your profile.', upsellKnopIn: 'Open your SuperCloud'
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
      aanmeldUitleg: 'Un seul compte pour écrire sur le forum et, bientôt, utiliser les outils OpenAEC et le SuperCloud. Vous recevrez un e-mail pour confirmer votre adresse et choisir un mot de passe, puis vous reviendrez ici.',
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
      profiel: 'Mon profil', lidSinds: 'Membre depuis', mijnOnderwerpen: 'Mes sujets', geenEigen: 'Vous n’avez pas encore lancé de sujet.', logInVoorProfiel: 'Connectez-vous pour voir votre profil.', upsellKnopIn: 'Ouvrir votre SuperCloud'
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
      aanmeldUitleg: 'Tek bir hesapla forumda yazar, yakında OpenAEC araçlarını ve SuperCloud’u da kullanırsınız. Adresinizi onaylamanız ve bir parola seçmeniz için bir e-posta alacaksınız; ardından buraya dönersiniz.',
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
      profiel: 'Profilim', lidSinds: 'Üyelik başlangıcı', mijnOnderwerpen: 'Konularım', geenEigen: 'Henüz bir konu başlatmadınız.', logInVoorProfiel: 'Profilinizi görmek için giriş yapın.', upsellKnopIn: 'SuperCloud’unuzu açın'
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
      aanmeldUitleg: 'Con una sola cuenta escribes en el foro y pronto usas también las herramientas OpenAEC y el SuperCloud. Recibirás un correo para confirmar tu dirección y elegir una contraseña; después vuelves aquí.',
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
      profiel: 'Mi perfil', lidSinds: 'Miembro desde', mijnOnderwerpen: 'Mis temas', geenEigen: 'Todavía no has empezado ningún tema.', logInVoorProfiel: 'Inicia sesión para ver tu perfil.', upsellKnopIn: 'Abrir tu SuperCloud'
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
      aanmeldUitleg: 'Mit einem einzigen Konto schreiben Sie im Forum und nutzen bald auch die OpenAEC-Tools und die SuperCloud. Sie erhalten eine E-Mail, um Ihre Adresse zu bestätigen und ein Passwort zu wählen; danach kehren Sie hierher zurück.',
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
      profiel: 'Mein Profil', lidSinds: 'Mitglied seit', mijnOnderwerpen: 'Meine Themen', geenEigen: 'Sie haben noch kein Thema eröffnet.', logInVoorProfiel: 'Melden Sie sich an, um Ihr Profil zu sehen.', upsellKnopIn: 'Ihre SuperCloud öffnen'
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

  // Platte tekst veilig naar HTML: alinea's, regeleinden, klikbare links en codeblokken (```).
  function opmaak(tekst) {
    var delen = String(tekst).split(/```/);
    return delen.map(function (deel, i) {
      if (i % 2 === 1) return '<pre><code>' + esc(deel.replace(/^\w*\n/, '').replace(/\n$/, '')) + '</code></pre>';
      return deel.split(/\n{2,}/).map(function (alinea) {
        alinea = alinea.trim();
        if (!alinea) return '';
        var html = esc(alinea).replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"]/g, function (url) {
          return '<a href="' + url + '" rel="nofollow ugc noopener" target="_blank">' + url + '</a>';
        });
        // Alleen afbeeldingen die het forum zelf bewaarde (openaec_cloud.forum.afbeelding).
        html = html.replace(/!\[\]\((\/files\/forum-[a-z0-9]{16}\.webp)\)/g, function (_, pad) {
          return '<a class="fo-beeld" href="' + CLOUD + pad + '" target="_blank" rel="noopener"><img src="' + CLOUD + pad + '" alt="' + esc(t('afbeeldingAlt')) + '" loading="lazy"></a>';
        });
        return '<p>' + html.replace(/\n/g, '<br>') + '</p>';
      }).join('');
    }).join('');
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
    return '<span class="fo-auteur">' + esc(a.naam) + (a.team ? ' <span class="fo-team">' + esc(t('team')) + '</span>' : '') + '</span>';
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

  async function login() {
    var verifier = willekeurig(48);
    var state = willekeurig(16);
    var hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    sessionStorage.setItem(PKCE, JSON.stringify({ verifier: verifier, state: state, terug: location.hash || '#/' }));
    var q = new URLSearchParams({
      client_id: CLIENT, response_type: 'code', redirect_uri: TERUG, scope: SCOPE, state: state,
      code_challenge: b64url(new Uint8Array(hash)), code_challenge_method: 'S256'
    });
    location.assign(OAUTH + 'authorize?' + q.toString());
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
    if (!antwoord.ok) {
      var fout = new Error(foutmelding(data));
      fout.status = antwoord.status;
      fout.soort = data.exc_type;
      throw fout;
    }
    return data.message;
  }

  async function uploadAfbeelding(bestand) {
    var token = await toegangstoken();
    var lijf = new FormData();
    lijf.append('bestand', bestand, bestand.name || 'afbeelding.png');
    var antwoord = await fetch(API + 'afbeelding', {
      method: 'POST', headers: Object.assign({ Accept: 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}), body: lijf
    });
    var data = {};
    try { data = await antwoord.json(); } catch (e) {}
    if (!antwoord.ok) throw new Error(foutmelding(data));
    return data.message.pad;
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
  function avatar(naam, groot) {
    return '<span class="fo-av' + (groot ? ' fo-av-groot' : '') + '" style="background:' + kleurVan(naam) + '" aria-hidden="true">' + esc(initialen(naam)) + '</span>';
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
      (o.verborgen ? '<span class="fo-label fo-label-rood">' + esc(t('verborgen')) + '</span>' : '');
  }

  function onderwerpRij(o, zonderCat) {
    var cat = zonderCat ? null : zoekCat(o.categorie);
    return '<li class="fo-rij">' + avatar(o.auteur.naam) +
      '<div class="fo-rij-hoofd"><a class="fo-item-titel" href="#/t/' + encodeURIComponent(o.naam) + '">' + esc(o.titel) + '</a>' + labels(o) +
      '<span class="fo-meta">' + catChip(cat) + auteur(o.auteur) + '</span></div>' +
      '<div class="fo-rij-tal"><strong title="' + esc(t('reacties')(o.reacties)) + '">' + o.reacties + '</strong><span>' + esc(tijd(o.laatste_activiteit)) + '</span></div></li>';
  }

  // Onder de startpagina: andere fora, de badges van de Academy en meer met je account.
  function onderblokken() {
    var fora = FORA.map(function (f) {
      return '<li><a href="' + f.url + '" target="_blank" rel="noopener"><span class="fo-forum-merk" style="background:' + f.kleur + '" aria-hidden="true">' + esc(f.naam.charAt(0)) + '</span>' +
        '<span class="fo-forum-tekst"><strong>' + esc(f.naam) + '</strong><span>' + esc(t(f.sleutel)) + '</span></span><span class="fo-uit" aria-hidden="true">↗</span></a></li>';
    }).join('');
    return '<div class="fo-onder">' +
      '<section class="fo-kaart"><h3>' + esc(t('foraKop')) + '</h3><p>' + esc(t('foraUitleg')) + '</p><ul class="fo-fora">' + fora + '</ul></section>' +
      '<section class="fo-kaart fo-badges"><h3>' + esc(t('badgesKop')) + ' <span class="fo-label">' + esc(t('binnenkort')) + '</span></h3><p>' + esc(t('badgesUitleg')) + '</p>' +
      '<div class="fo-badgerij" aria-hidden="true"><span class="fo-badge">IFC</span><span class="fo-badge">PDF</span><span class="fo-badge">CAD</span><span class="fo-badge fo-badge-goud">★</span></div>' +
      '<a class="fo-meer-link" href="/academy/">' + esc(t('naarAcademy')) + ' →</a></section>' +
      '<section class="fo-kaart fo-upsell"><h3>' + esc(t('upsellKop')) + '</h3><p>' + esc(t('upsell')) + '</p>' +
      (ik ? '<a class="btn btn-dark fo-knop" href="' + esc(CLOUD) + '/start">' + esc(t('upsellKnopIn')) + '</a>'
        : '<a class="btn btn-dark fo-knop" href="/supercloud/">' + esc(t('upsellKnop')) + '</a>') +
      '<p class="fo-klein"><a href="#/regels">' + esc(t('regelsKop')) + '</a></p></section>' +
      '</div>';
  }

  function startScherm() {
    var cats = categorieen.map(function (c) {
      return '<a class="fo-catrij" href="#/c/' + encodeURIComponent(c.slug) + '" style="--kleur:' + catKleur(c.slug) + '">' +
        '<span class="fo-catrij-tekst"><strong>' + esc(catTitel(c)) + '</strong>' + (catUitleg(c) ? '<span>' + esc(catUitleg(c)) + '</span>' : '') +
        (c.alleen_team ? '<em>' + esc(t('alleenTeamKort')) + '</em>' : '') + '</span><span class="fo-catrij-tal">' + c.onderwerpen + '</span></a>';
    }).join('');
    app.innerHTML = tabs('cats') +
      '<div class="fo-twee">' +
      '<section class="fo-paneel"><div class="fo-paneel-kop"><span>' + esc(t('categorie')) + '</span><span>' + esc(t('onderwerpenKop')) + '</span></div>' +
      (cats || '<p class="fo-leeg">' + esc(t('fout')) + '</p>') + '</section>' +
      '<section class="fo-paneel"><div class="fo-paneel-kop"><span>' + esc(t('recent')) + '</span></div>' +
      '<ul class="fo-rijen" id="fo-recent"><li class="fo-leeg">' + esc(t('laden')) + '</li></ul>' +
      '<a class="fo-meer-link fo-paneel-voet" href="#/recent">' + esc(t('alleRecent')) + ' →</a></section>' +
      '</div>' + onderblokken();
    var lijst = document.getElementById('fo-recent');
    api('onderwerpen', { start: 0 }).then(function (data) {
      var rijen = data.onderwerpen.slice(0, 8).map(function (o) { return onderwerpRij(o); }).join('');
      lijst.innerHTML = rijen || '<li class="fo-leeg">' + esc(t('geen')) + '</li>';
    }).catch(function (e) {
      lijst.innerHTML = '<li class="fo-leeg">' + esc(e.message || t('fout')) + '</li>';
    });
  }

  function lijstScherm(cat) {
    var start = 0;
    var kop = cat
      ? '<div class="fo-catkop" style="--kleur:' + catKleur(cat.slug) + '"><h2>' + esc(catTitel(cat)) + '</h2>' +
        (catUitleg(cat) ? '<p>' + esc(catUitleg(cat)) + '</p>' : '') +
        (cat.alleen_team ? '<p class="fo-klein">' + esc(t('alleenTeam')) + '</p>' : '') + '</div>'
      : '';
    app.innerHTML = tabs(cat ? '' : 'recent', cat && cat.slug) + kop +
      '<section class="fo-paneel"><div class="fo-paneel-kop"><span>' + esc(t('onderwerpKop')) + '</span><span>' + esc(t('reactiesKop')) + ' · ' + esc(t('activiteit')) + '</span></div>' +
      '<ul class="fo-rijen" id="fo-lijst"><li class="fo-leeg">' + esc(t('laden')) + '</li></ul></section>' +
      '<p class="fo-meer"><button type="button" class="btn btn-secondary" id="fo-meer" hidden>' + esc(t('meer')) + '</button></p>';
    var lijst = document.getElementById('fo-lijst');
    var meer = document.getElementById('fo-meer');
    async function laad() {
      meer.disabled = true;
      try {
        var data = await api('onderwerpen', Object.assign({ start: start }, cat ? { categorie: cat.slug } : {}));
        if (start === 0) lijst.innerHTML = '';
        lijst.insertAdjacentHTML('beforeend', data.onderwerpen.map(function (o) { return onderwerpRij(o, !!cat); }).join(''));
        if (!lijst.children.length) lijst.innerHTML = '<li class="fo-leeg">' + esc(t('geen')) + '</li>';
        start += data.onderwerpen.length;
        meer.hidden = !data.meer;
      } catch (e) {
        lijst.innerHTML = '<li class="fo-leeg">' + esc(e.message || t('fout')) + '</li>';
      } finally {
        meer.disabled = false;
      }
    }
    meer.addEventListener('click', laad);
    laad();
  }

  function berichtHtml(b, onderwerp) {
    var acties = '';
    var magBewerken = ik && (b.eigen || ik.moderator) && (onderwerp.status === 'Open' || ik.moderator);
    if (magBewerken) acties += knop(t('bewerken'), 'bewerk', 'btn-ghost', ' data-naam="' + esc(b.naam) + '"');
    if (magBewerken) acties += knop(t('verwijderen'), 'verwijder', 'btn-ghost', ' data-naam="' + esc(b.naam) + '"');
    if (ik && ik.moderator) acties += knop(t(b.verborgen ? 'toon' : 'verberg'), 'modereer', 'btn-ghost', ' data-soort="bericht" data-naam="' + esc(b.naam) + '" data-wat="' + (b.verborgen ? 'toon' : 'verberg') + '"');
    return '<article class="fo-post' + (b.verborgen ? ' fo-verborgen' : '') + '" id="b-' + esc(b.naam) + '">' + avatar(b.auteur.naam, true) +
      '<div class="fo-post-lijf"><header>' + auteur(b.auteur) + '<span class="fo-post-tijd">' + esc(tijd(b.aangemaakt)) +
      (b.bewerkt ? ' · ' + esc(t('bewerkt')) : '') + (b.verborgen ? ' · ' + esc(t('verborgen')) : '') + '</span></header>' +
      '<div class="fo-tekst">' + opmaak(b.tekst) + '</div>' +
      (acties ? '<footer class="fo-acties">' + acties + '</footer>' : '') + '</div></article>';
  }

  async function onderwerpScherm(naam) {
    app.innerHTML = tabs('') + '<p class="fo-leeg">' + esc(t('laden')) + '</p>';
    var data;
    try {
      data = await api('onderwerp', { naam: naam });
    } catch (e) {
      app.innerHTML = tabs('') + '<p><a href="#/">' + esc(t('terug')) + '</a></p><p class="fo-leeg">' + esc(e.status === 404 ? t('onbekend') : (e.message || t('fout'))) + '</p>';
      return;
    }
    var o = data.onderwerp;
    var cat = zoekCat(o.categorie);
    document.title = o.titel + ' — ' + t('titel') + ' — OpenAEC';
    var modknoppen = '';
    if (ik && ik.moderator) {
      modknoppen = '<div class="fo-acties fo-mod">' +
        knop(t(o.vastgezet ? 'maakLos' : 'zetVast'), 'modereer', 'btn-ghost', ' data-soort="onderwerp" data-naam="' + esc(o.naam) + '" data-wat="' + (o.vastgezet ? 'maak_los' : 'zet_vast') + '"') +
        knop(t(o.status === 'Open' ? 'sluit' : 'open'), 'modereer', 'btn-ghost', ' data-soort="onderwerp" data-naam="' + esc(o.naam) + '" data-wat="' + (o.status === 'Open' ? 'sluit' : 'open') + '"') +
        knop(t(o.verborgen ? 'toon' : 'verberg'), 'modereer', 'btn-ghost', ' data-soort="onderwerp" data-naam="' + esc(o.naam) + '" data-wat="' + (o.verborgen ? 'toon' : 'verberg') + '"') +
        '</div>';
    }
    var reageer;
    if (o.status !== 'Open' && !(ik && ik.moderator)) {
      reageer = '<p class="fo-klein fo-dicht">' + esc(t('gesloten')) + '</p>';
    } else if (ik) {
      reageer = '<form class="fo-post fo-reageer" id="fo-reageer">' + avatar(ik.naam, true) + '<div class="fo-post-lijf fo-form">' +
        '<label><span>' + esc(t('jouwReactie')) + '</span><textarea name="tekst" rows="6" required minlength="2" maxlength="20000"></textarea></label>' +
        '<p class="fo-klein">' + esc(t('opmaak')) + '</p><p><button class="btn btn-primary" type="submit">' + esc(t('reageren')) + '</button></p></div></form>';
    } else {
      reageer = '<div class="fo-kaart fo-cta"><p>' + esc(t('logInOmTeReageren')) + '</p><p>' + knop(t('inloggen'), 'inloggen', 'btn-primary') +
        ' <a class="btn btn-secondary fo-knop" href="#/aanmelden">' + esc(t('aanmelden')) + '</a></p></div>';
    }
    app.innerHTML = tabs('', o.categorie) +
      '<div class="fo-onderwerp">' +
      '<p class="fo-kruimel"><a href="#/">' + esc(t('titel')) + '</a>' + (cat ? ' / <a href="#/c/' + encodeURIComponent(cat.slug) + '">' + esc(catTitel(cat)) + '</a>' : '') + '</p>' +
      '<h2 class="fo-onderwerp-titel">' + esc(o.titel) + labels(o) + '</h2>' +
      '<p class="fo-meta">' + catChip(cat) + '<span>' + esc(t('reacties')(o.reacties)) + '</span></p>' + modknoppen +
      '<div class="fo-posts">' + data.berichten.map(function (b) { return berichtHtml(b, o); }).join('') + '</div>' +
      reageer + '</div>';
    var form = document.getElementById('fo-reageer');
    if (form) {
      form.addEventListener('submit', async function (ev) {
        ev.preventDefault();
        var knopEl = form.querySelector('button');
        knopEl.disabled = true;
        try {
          await api('reageer', { onderwerp: o.naam, tekst: form.tekst.value }, true);
          melding('');
          onderwerpScherm(naam);
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
          else onderwerpScherm(naam);
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
        f.querySelector('[data-annuleer]').addEventListener('click', function () { onderwerpScherm(naam); });
        f.addEventListener('submit', async function (ev) {
          ev.preventDefault();
          try {
            await api('bewerk', Object.assign({ bericht: b.naam, tekst: f.tekst.value }, f.titel ? { titel: f.titel.value } : {}), true);
            melding('');
            onderwerpScherm(naam);
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
      keuzes.map(function (c) { return '<option value="' + esc(c.slug) + '"' + (c.slug === slug ? ' selected' : '') + '>' + esc(catTitel(c)) + '</option>'; }).join('') +
      '</select></label>' +
      '<label><span>' + esc(t('titelVeld')) + '</span><input name="titel" required minlength="5" maxlength="140"></label>' +
      '<label><span>' + esc(t('berichtVeld')) + '</span><textarea name="tekst" rows="10" required minlength="2" maxlength="20000"></textarea></label>' +
      '<p class="fo-klein">' + esc(t('opmaak')) + '</p>' +
      '<p><button class="btn btn-primary" type="submit">' + esc(t('plaatsen')) + '</button></p></form>');
    var form = document.getElementById('fo-nieuw');
    metAfbeeldingen(form.tekst);
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      var knopEl = form.querySelector('button');
      knopEl.disabled = true;
      try {
        var data = await api('nieuw_onderwerp', { categorie: form.categorie.value, titel: form.titel.value, tekst: form.tekst.value }, true);
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
    enkel(null, '<h2>' + esc(t('aanmeldKop')) + '</h2><p class="fo-uitleg">' + esc(t('aanmeldUitleg')) + '</p>' +
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
    enkel(null, '<p class="fo-leeg">' + esc(t('laden')) + '</p>');
    var p;
    try { p = await api('profiel'); } catch (e) { enkel(null, '<p class="fo-leeg">' + esc(e.message || t('fout')) + '</p>'); return; }
    var sinds = new Date(p.lid_sinds);
    var rijen = p.recent.map(function (o) { return onderwerpRij(o); }).join('');
    app.innerHTML = tabs('') + '<div class="fo-enkel">' +
      '<section class="fo-kaart fo-profiel"><div class="fo-profiel-kop">' + avatar(p.naam, true) +
      '<div><h2>' + esc(p.naam) + (p.moderator ? ' <span class="fo-team">' + esc(t('team')) + '</span>' : '') + '</h2>' +
      '<p class="fo-klein">' + esc(p.email) + '</p></div></div>' +
      '<dl class="fo-cijfers"><div><dt>' + esc(t('lidSinds')) + '</dt><dd>' + esc(isNaN(sinds) ? '' : sinds.toLocaleDateString(taal(), { year: 'numeric', month: 'long', day: 'numeric' })) + '</dd></div>' +
      '<div><dt>' + esc(t('onderwerpenKop')) + '</dt><dd>' + p.onderwerpen + '</dd></div>' +
      '<div><dt>' + esc(t('reactiesKop')) + '</dt><dd>' + p.reacties + '</dd></div></dl>' +
      '<p class="fo-profiel-knoppen"><a class="btn btn-dark fo-knop" href="' + esc(CLOUD) + '/start">' + esc(t('upsellKnopIn')) + '</a> ' +
      knop(t('uitloggen'), 'uitloggen', 'btn-secondary') + '</p></section>' +
      '<section class="fo-paneel fo-profiel-lijst"><div class="fo-paneel-kop"><span>' + esc(t('mijnOnderwerpen')) + '</span></div>' +
      '<ul class="fo-rijen">' + (rijen || '<li class="fo-leeg">' + esc(t('geenEigen')) + '</li>') + '</ul></section></div>';
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
    window.scrollTo(0, 0);
    if (route[0] === 't' && route[1]) return onderwerpScherm(route[1]);
    if (route[0] === 'c' && route[1]) {
      var cat = zoekCat(route[1]);
      return cat ? lijstScherm(cat) : lijstScherm(null);
    }
    if (route[0] === 'recent') return lijstScherm(null);
    if (route[0] === 'nieuw') return nieuwScherm(route[1] || null);
    if (route[0] === 'aanmelden') return aanmeldScherm();
    if (route[0] === 'regels') return regelsScherm();
    if (route[0] === 'profiel') return profielScherm();
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
      if (actie === 'inloggen') login();
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
    window.addEventListener('hashchange', function () { melding(''); toon(); });
    await verwerkTerugkeer();
    await Promise.all([laadCategorieen(), laadIk()]);
    toon();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
