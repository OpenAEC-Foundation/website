// Het forum van OpenAEC: de pagina staat hier, de gegevens en de accounts op de cloud (openaec_cloud.forum).
// Lezen kan iedereen; schrijven met een OpenAEC-account (inloggen via de cloud, OAuth met PKCE, client `forum`).
// Aanmelden vanaf het forum maakt een account zonder omgeving (bron=forum) en komt daarna hier terug.
(function () {
  'use strict';

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
      opmaak: 'Platte tekst. Een lege regel begint een nieuwe alinea, links worden klikbaar en ``` zet code apart.',
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
      verlopen: 'Je bent uitgelogd. Log opnieuw in.'
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
      opmaak: 'Plain text. A blank line starts a new paragraph, links become clickable and ``` sets code apart.',
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
      verlopen: 'You have been logged out. Please log in again.'
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
      opmaak: 'Texte brut. Une ligne vide commence un nouveau paragraphe, les liens deviennent cliquables et ``` isole le code.',
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
      verlopen: 'Vous avez été déconnecté. Reconnectez-vous.'
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
      opmaak: 'Düz metin. Boş satır yeni paragraf başlatır, bağlantılar tıklanabilir olur ve ``` kodu ayırır.',
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
      verlopen: 'Oturumunuz kapandı. Lütfen tekrar giriş yapın.'
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
      opmaak: 'Texto sin formato. Una línea en blanco empieza un párrafo nuevo, los enlaces se vuelven clicables y ``` separa el código.',
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
      verlopen: 'Se ha cerrado tu sesión. Vuelve a iniciarla.'
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

  // ── Weergave ────────────────────────────────────────────────────────────
  var app, balk, ik = null, categorieen = [];

  function melding(tekst) {
    var el = document.getElementById('fo-melding');
    if (!el) return;
    el.textContent = tekst || '';
    el.hidden = !tekst;
  }

  function knop(label, actie, soort, extra) {
    return '<button type="button" class="btn ' + (soort || 'btn-secondary') + ' fo-knop" data-actie="' + actie + '"' + (extra || '') + '>' + esc(label) + '</button>';
  }

  function tekenBalk() {
    var html;
    if (ik) {
      html = '<span class="fo-ik">' + esc(t('ingelogdAls')) + ' <strong>' + esc(ik.naam) + '</strong></span>' +
        knop(t('uitloggen'), 'uitloggen', 'btn-ghost');
    } else {
      html = knop(t('inloggen'), 'inloggen', 'btn-secondary') +
        '<a class="btn btn-primary fo-knop" href="#/aanmelden">' + esc(t('aanmelden')) + '</a>';
    }
    balk.innerHTML = html;
  }

  function zijbalk(huidig) {
    var lijst = categorieen.map(function (c) {
      return '<li><a href="#/c/' + encodeURIComponent(c.slug) + '"' + (c.slug === huidig ? ' aria-current="page"' : '') + '>' +
        '<span>' + esc(catTitel(c)) + '</span><span class="fo-tal">' + c.onderwerpen + '</span></a></li>';
    }).join('');
    var upsell = '<div class="fo-blok fo-upsell"><h3>' + esc(t('upsellKop')) + '</h3><p>' + esc(t('upsell')) + '</p>' +
      '<a class="btn btn-dark fo-knop" href="/supercloud/">' + esc(t('upsellKnop')) + '</a></div>';
    return '<aside class="fo-zij">' +
      '<a class="btn btn-primary fo-knop fo-breed" href="#/nieuw' + (huidig ? '/' + encodeURIComponent(huidig) : '') + '">' + esc(t('nieuw')) + '</a>' +
      '<div class="fo-blok"><h3>' + esc(t('categorieen')) + '</h3><ul class="fo-cats"><li><a href="#/"' + (!huidig ? ' aria-current="page"' : '') + '><span>' + esc(t('alle')) + '</span></a></li>' + lijst + '</ul></div>' +
      upsell +
      '<p class="fo-klein"><a href="#/regels">' + esc(t('regelsKop')) + '</a></p>' +
      '</aside>';
  }

  function onderwerpItem(o) {
    var cat = categorieen.find(function (c) { return c.slug === o.categorie; });
    var labels = (o.vastgezet ? '<span class="fo-label">' + esc(t('vastgezet')) + '</span>' : '') +
      (o.status === 'Gesloten' ? '<span class="fo-label fo-label-grijs">' + esc(t('gesloten').replace(/\.$/, '')) + '</span>' : '') +
      (o.verborgen ? '<span class="fo-label fo-label-rood">' + esc(t('verborgen')) + '</span>' : '');
    return '<li class="fo-item"><div><a class="fo-item-titel" href="#/t/' + encodeURIComponent(o.naam) + '">' + esc(o.titel) + '</a> ' + labels +
      '<span class="fo-meta">' + (cat ? '<span class="fo-cat">' + esc(catTitel(cat)) + '</span>' : '') +
      auteur(o.auteur) + ' · ' + esc(tijd(o.laatste_activiteit)) + '</span></div>' +
      '<span class="fo-tal">' + esc(t('reacties')(o.reacties)) + '</span></li>';
  }

  function lijstScherm(cat) {
    var start = 0;
    var kop = cat
      ? '<h2>' + esc(catTitel(cat)) + '</h2>' + (catUitleg(cat) ? '<p class="fo-uitleg">' + esc(catUitleg(cat)) + '</p>' : '') +
        (cat.alleen_team ? '<p class="fo-klein">' + esc(t('alleenTeam')) + '</p>' : '')
      : '<h2>' + esc(t('recent')) + '</h2>';
    app.innerHTML = '<div class="fo-raster"><div class="fo-hoofd">' + kop + '<ul class="fo-lijst" id="fo-lijst"><li class="fo-leeg">' + esc(t('laden')) + '</li></ul>' +
      '<p><button type="button" class="btn btn-secondary" id="fo-meer" hidden>' + esc(t('meer')) + '</button></p></div>' + zijbalk(cat && cat.slug) + '</div>';
    var lijst = document.getElementById('fo-lijst');
    var meer = document.getElementById('fo-meer');
    async function laad() {
      meer.disabled = true;
      try {
        var data = await api('onderwerpen', Object.assign({ start: start }, cat ? { categorie: cat.slug } : {}));
        if (start === 0) lijst.innerHTML = '';
        lijst.insertAdjacentHTML('beforeend', data.onderwerpen.map(onderwerpItem).join(''));
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
    if (ik && ik.moderator) acties += knop(t(b.verborgen ? 'toon' : 'verberg'), 'modereer', 'btn-ghost', ' data-soort="bericht" data-naam="' + esc(b.naam) + '" data-wat="' + (b.verborgen ? 'toon' : 'verberg') + '"');
    return '<article class="fo-bericht' + (b.verborgen ? ' fo-verborgen' : '') + '" id="b-' + esc(b.naam) + '">' +
      '<header>' + auteur(b.auteur) + ' <span class="fo-meta-inline">' + esc(tijd(b.aangemaakt)) +
      (b.bewerkt ? ' · ' + esc(t('bewerkt')) : '') + (b.verborgen ? ' · ' + esc(t('verborgen')) : '') + '</span></header>' +
      '<div class="fo-tekst">' + opmaak(b.tekst) + '</div>' +
      (acties ? '<footer class="fo-acties">' + acties + '</footer>' : '') + '</article>';
  }

  async function onderwerpScherm(naam) {
    app.innerHTML = '<p class="fo-leeg">' + esc(t('laden')) + '</p>';
    var data;
    try {
      data = await api('onderwerp', { naam: naam });
    } catch (e) {
      app.innerHTML = '<p><a href="#/">' + esc(t('terug')) + '</a></p><p class="fo-leeg">' + esc(e.status === 404 ? t('onbekend') : (e.message || t('fout'))) + '</p>';
      return;
    }
    var o = data.onderwerp;
    var cat = categorieen.find(function (c) { return c.slug === o.categorie; });
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
      reageer = '<p class="fo-klein">' + esc(t('gesloten')) + '</p>';
    } else if (ik) {
      reageer = '<form class="fo-form" id="fo-reageer"><label><span>' + esc(t('jouwReactie')) + '</span>' +
        '<textarea name="tekst" rows="6" required minlength="2" maxlength="20000"></textarea></label>' +
        '<p class="fo-klein">' + esc(t('opmaak')) + '</p><p>' +
        '<button class="btn btn-primary" type="submit">' + esc(t('reageren')) + '</button></p></form>';
    } else {
      reageer = '<div class="fo-blok fo-cta"><p>' + esc(t('logInOmTeReageren')) + '</p><p>' + knop(t('inloggen'), 'inloggen', 'btn-primary') +
        ' <a class="btn btn-secondary fo-knop" href="#/aanmelden">' + esc(t('aanmelden')) + '</a></p></div>';
    }
    app.innerHTML = '<div class="fo-raster"><div class="fo-hoofd">' +
      '<p class="fo-kruimel"><a href="#/">' + esc(t('titel')) + '</a>' + (cat ? ' / <a href="#/c/' + encodeURIComponent(cat.slug) + '">' + esc(catTitel(cat)) + '</a>' : '') + '</p>' +
      '<h2 class="fo-onderwerp-titel">' + esc(o.titel) + '</h2>' + modknoppen +
      data.berichten.map(function (b) { return berichtHtml(b, o); }).join('') +
      reageer + '</div>' + zijbalk(o.categorie) + '</div>';
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
    app.querySelectorAll('[data-actie="bewerk"]').forEach(function (el) {
      el.addEventListener('click', function () {
        var b = data.berichten.find(function (x) { return x.naam === el.dataset.naam; });
        var art = document.getElementById('b-' + b.naam);
        art.querySelector('.fo-tekst').innerHTML = '<form class="fo-form">' +
          (b.eerste ? '<label><span>' + esc(t('titelVeld')) + '</span><input name="titel" required minlength="5" maxlength="140" value="' + esc(o.titel) + '"></label>' : '') +
          '<label><span>' + esc(t('berichtVeld')) + '</span><textarea name="tekst" rows="8" required minlength="2" maxlength="20000">' + esc(b.tekst) + '</textarea></label>' +
          '<p><button class="btn btn-primary" type="submit">' + esc(t('opslaan')) + '</button> <button class="btn btn-ghost" type="button" data-annuleer>' + esc(t('annuleren')) + '</button></p></form>';
        var f = art.querySelector('form');
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

  function nieuwScherm(slug) {
    if (!ik) {
      app.innerHTML = '<div class="fo-raster"><div class="fo-hoofd"><h2>' + esc(t('nieuw')) + '</h2><div class="fo-blok fo-cta"><p>' + esc(t('logInOmTeSchrijven')) + '</p><p>' +
        knop(t('inloggen'), 'inloggen', 'btn-primary') + ' <a class="btn btn-secondary fo-knop" href="#/aanmelden">' + esc(t('aanmelden')) + '</a></p></div></div>' + zijbalk(slug) + '</div>';
      return;
    }
    var keuzes = categorieen.filter(function (c) { return !c.alleen_team || ik.moderator; });
    app.innerHTML = '<div class="fo-raster"><div class="fo-hoofd"><h2>' + esc(t('nieuw')) + '</h2><form class="fo-form" id="fo-nieuw">' +
      '<label><span>' + esc(t('categorieVeld')) + '</span><select name="categorie" required>' +
      keuzes.map(function (c) { return '<option value="' + esc(c.slug) + '"' + (c.slug === slug ? ' selected' : '') + '>' + esc(catTitel(c)) + '</option>'; }).join('') +
      '</select></label>' +
      '<label><span>' + esc(t('titelVeld')) + '</span><input name="titel" required minlength="5" maxlength="140"></label>' +
      '<label><span>' + esc(t('berichtVeld')) + '</span><textarea name="tekst" rows="10" required minlength="2" maxlength="20000"></textarea></label>' +
      '<p class="fo-klein">' + esc(t('opmaak')) + '</p>' +
      '<p><button class="btn btn-primary" type="submit">' + esc(t('plaatsen')) + '</button></p></form></div>' + zijbalk(slug) + '</div>';
    var form = document.getElementById('fo-nieuw');
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
    app.innerHTML = '<div class="fo-raster"><div class="fo-hoofd"><h2>' + esc(t('aanmeldKop')) + '</h2><p class="fo-uitleg">' + esc(t('aanmeldUitleg')) + '</p>' +
      '<form class="fo-form" method="post" action="' + esc(CLOUD) + '/aanmelden/start">' +
      '<input type="hidden" name="taal" value="' + esc(l) + '"><input type="hidden" name="bron" value="forum">' +
      '<input type="hidden" name="terug" value="' + esc(TERUG + '#/') + '">' +
      '<label><span>' + esc(t('naam')) + '</span><input name="naam" autocomplete="name" required maxlength="140"></label>' +
      '<label><span>' + esc(t('email')) + '</span><input type="email" name="email" autocomplete="email" required maxlength="254"></label>' +
      '<label class="fo-honing" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>' +
      '<label class="fo-akkoord"><input type="checkbox" name="akkoord" value="1" required> <span>' + t('akkoord') + '</span></label>' +
      '<p><button class="btn btn-primary" type="submit">' + esc(t('versturen')) + '</button></p></form>' +
      '<p class="fo-klein">' + esc(t('alAccount')) + ' ' + knop(t('inloggen'), 'inloggen', 'btn-ghost') + '</p></div>' + zijbalk(null) + '</div>';
  }

  function regelsScherm() {
    app.innerHTML = '<div class="fo-raster"><div class="fo-hoofd"><h2>' + esc(t('regelsKop')) + '</h2><ul class="fo-regels">' +
      t('regels').map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></div>' + zijbalk(null) + '</div>';
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
      var cat = categorieen.find(function (c) { return c.slug === route[1]; });
      return cat ? lijstScherm(cat) : lijstScherm(null);
    }
    if (route[0] === 'nieuw') return nieuwScherm(route[1] || null);
    if (route[0] === 'aanmelden') return aanmeldScherm();
    if (route[0] === 'regels') return regelsScherm();
    return lijstScherm(null);
  }

  async function laadCategorieen() {
    try { categorieen = await api('categorieen'); } catch (e) { categorieen = []; melding(e.message || t('fout')); }
  }

  async function laadIk() {
    if (!leesSessie()) { ik = null; return; }
    try { ik = await api('ik'); } catch (e) { ik = null; if (e.status === 401 || e.status === 403) bewaarSessie(null); }
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
