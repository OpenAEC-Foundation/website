// Feedback dialog for open-aec.com.
//
// The "Feedback" button in the nav (and any [data-feedback-open]) opens this dialog instead of the
// separate feedback page (its href stays as the no-JS fallback). A report is sent to Open Feedback
// Studio: /api/feedback opens a GitHub issue in the repo mapped to the chosen app (D1 table
// app_repos, app id = page slug), exactly like Open Planner Studio does. Apps whose repo is private
// say so in the dialog and show no GitHub link; IFCCAD always goes to /api/private-feedback.
(function () {
  'use strict';
  var API = 'https://open-feedback-studio.pages.dev/api/';
  var ICONS = '/shared/icons.svg?v=20261016#i-';

  // [app id (= slug, key in app_repos), name, repo, visibility] — keep in sync with app_repos.
  // visibility: 'public' (issue + link), 'team' (private repo: issue only the team sees), 'private' (no issue)
  var APPS = [
    ['website', null, 'OpenAEC-Foundation/website', 'public'],
    ['open-pdf-studio', 'Open PDF Studio', 'OpenAEC-Foundation/open-pdf-studio', 'public'],
    ['open-planner-studio', 'Open Planner Studio', 'OpenAEC-Foundation/open-planner-studio', 'public'],
    ['open-calc-studio', 'Open Calc Studio', 'OpenAEC-Foundation/open-calc-studio', 'public'],
    ['open-pile-plan-studio', 'Open Pile Plan Studio', 'OpenAEC-Foundation/pile-plan-studio', 'public'],
    ['open-pointcloud-studio', 'Open Pointcloud Studio', 'OpenAEC-Foundation/open-pointcloud-studio', 'public'],
    ['open-frame-studio', 'Open Frame Studio', 'OpenAEC-Foundation/open-frame-studio', 'public'],
    ['open-heatloss-studio', 'Open Heatloss Studio', 'OpenAEC-Foundation/open-heatloss-studio', 'public'],
    ['open-energy-studio', 'Open Energy Studio', 'OpenAEC-Foundation/open-energy-studio', 'public'],
    ['open-field-studio', 'Open Field Studio', 'OpenAEC-Foundation/Open-Field-Studio', 'public'],
    ['open-speech-studio', 'Open Speech Studio', 'OpenAEC-Foundation/open-speech-studio', 'public'],
    ['open-geotechniek-studio', 'Open Geotechniek Studio', 'OpenAEC-Foundation/open-geotechniek-studio', 'public'],
    ['monty-ifc-viewer', 'Monty IFC Viewer', 'OpenAEC-Foundation/monty-ifc-viewer', 'public'],
    ['bim-validator', 'BIM Validator', 'OpenAEC-Foundation/OpenAEC-BIM-validator', 'public'],
    ['bcf-manager-studio', 'BCF Manager Studio', 'OpenAEC-Foundation/openaec-bcf-platform', 'public'],
    ['openaec-docs', 'OpenAEC Docs', 'OpenAEC-Foundation/openaec-docs', 'public'],
    ['openaec-cloud', 'OpenAEC SuperCloud', 'OpenAEC-Foundation/openaec-cloud', 'public'],
    ['openaec-installer', 'OpenAEC Installer', 'OpenAEC-Foundation/openaec-installer', 'public'],
    ['open-books', 'OpenBooks', 'OpenAEC-Foundation/open-books', 'public'],
    ['ext-drawing-statistics', 'Drawing Statistics', 'OpenAEC-Foundation/ext-drawing-statistics', 'public'],
    ['y-app', 'Y-app', 'OpenAEC-Foundation/Y-app', 'team'],
    ['open-calculations-studio', 'Open Calculations Studio', 'OpenAEC-Foundation/Open-Calculations-Studio', 'team'],
    ['open-safety-studio', 'Open Safety Studio', 'OpenAEC-Foundation/open-safety-studio', 'team'],
    ['open-3d-viewer', 'Open 3D Viewer', 'OpenAEC-Foundation/open-3d-viewer', 'team'],
    ['ifccad', 'IFCCAD', null, 'private']
  ];

  var T = {
    nl: { title: 'Feedback geven', close: 'Sluiten', app: 'Over welke app gaat het?', general: 'Website / algemeen', kind: 'Soort melding',
      bug: 'Iets werkt niet', feature: 'Idee', other: 'Vraag of opmerking', subject: 'Titel', subjectPh: 'Bijv. Meetlijn verspringt na opslaan',
      text: 'Omschrijving', textPh: 'Wat deed je, wat verwachtte je en wat gebeurde er?', mail: 'E-mailadres', mailOpt: '(optioneel, alleen als je een reactie wilt)',
      pub: 'Je melding wordt een <strong>openbaar issue op GitHub</strong> in <code>{repo}</code>. Zet er niets in wat je niet wilt delen. Je e-mailadres komt niet in het issue.',
      team: 'Je melding gaat naar <strong>het team van deze app</strong> en is <strong>niet openbaar</strong>.',
      sent: 'Meegestuurd', needTitle: 'Vul een titel in.', needText: 'Schrijf in titel en omschrijving samen minstens 10 tekens.', badMail: 'Dit e-mailadres klopt niet.',
      cancel: 'Annuleren', send: 'Versturen', sending: 'Bezig met versturen…', thanks: 'Bedankt, je melding is verstuurd.',
      madeIssue: 'Er is een issue voor gemaakt in <strong>{repo}</strong>.', toTeam: 'Het team van deze app heeft je melding ontvangen.', stored: 'De makers zien je melding in hun overzicht.',
      onGithub: 'Bekijk op GitHub', rate: 'Je hebt in korte tijd veel meldingen verstuurd. Probeer het over een uur opnieuw.', dup: 'Deze melding is al bij ons binnen.',
      rejected: 'De melding is niet geaccepteerd. Controleer de tekst en het e-mailadres.', failed: 'Versturen is niet gelukt. Controleer je verbinding en probeer het opnieuw.' },
    en: { title: 'Give feedback', close: 'Close', app: 'Which app is it about?', general: 'Website / general', kind: 'Type of report',
      bug: 'Something is broken', feature: 'Idea', other: 'Question or comment', subject: 'Title', subjectPh: 'E.g. Measurement line shifts after saving',
      text: 'Description', textPh: 'What did you do, what did you expect and what happened?', mail: 'Email address', mailOpt: '(optional, only if you want a reply)',
      pub: 'Your report becomes a <strong>public issue on GitHub</strong> in <code>{repo}</code>. Do not include anything you do not want to share. Your email address is not added to the issue.',
      team: 'Your report goes to <strong>the team of this app</strong> and is <strong>not public</strong>.',
      sent: 'Included', needTitle: 'Enter a title.', needText: 'Write at least 10 characters in title and description together.', badMail: 'This email address is not valid.',
      cancel: 'Cancel', send: 'Send', sending: 'Sending…', thanks: 'Thank you, your report has been sent.',
      madeIssue: 'An issue has been created in <strong>{repo}</strong>.', toTeam: 'The team of this app has received your report.', stored: 'The makers will see your report in their overview.',
      onGithub: 'View on GitHub', rate: 'You have sent many reports in a short time. Please try again in an hour.', dup: 'We have already received this report.',
      rejected: 'The report was not accepted. Check the text and the email address.', failed: 'Sending failed. Check your connection and try again.' },
    fr: { title: 'Donner un avis', close: 'Fermer', app: 'De quelle application s’agit-il ?', general: 'Site web / général', kind: 'Type de signalement',
      bug: 'Quelque chose ne marche pas', feature: 'Idée', other: 'Question ou remarque', subject: 'Titre', subjectPh: 'Ex. La ligne de mesure se décale après l’enregistrement',
      text: 'Description', textPh: 'Qu’avez-vous fait, qu’attendiez-vous et que s’est-il passé ?', mail: 'Adresse e-mail', mailOpt: '(facultatif, seulement si vous souhaitez une réponse)',
      pub: 'Votre signalement devient un <strong>ticket public sur GitHub</strong> dans <code>{repo}</code>. N’y mettez rien que vous ne souhaitez pas partager. Votre adresse e-mail n’apparaît pas dans le ticket.',
      team: 'Votre signalement est transmis à <strong>l’équipe de cette application</strong> et n’est <strong>pas public</strong>.',
      sent: 'Joint', needTitle: 'Saisissez un titre.', needText: 'Écrivez au moins 10 caractères au total dans le titre et la description.', badMail: 'Cette adresse e-mail n’est pas valide.',
      cancel: 'Annuler', send: 'Envoyer', sending: 'Envoi en cours…', thanks: 'Merci, votre signalement a été envoyé.',
      madeIssue: 'Un ticket a été créé dans <strong>{repo}</strong>.', toTeam: 'L’équipe de cette application a bien reçu votre signalement.', stored: 'Les développeurs verront votre signalement dans leur tableau de bord.',
      onGithub: 'Voir sur GitHub', rate: 'Vous avez envoyé beaucoup de signalements en peu de temps. Réessayez dans une heure.', dup: 'Nous avons déjà reçu ce signalement.',
      rejected: 'Le signalement n’a pas été accepté. Vérifiez le texte et l’adresse e-mail.', failed: 'L’envoi a échoué. Vérifiez votre connexion et réessayez.' },
    tr: { title: 'Geri bildirim ver', close: 'Kapat', app: 'Hangi uygulama hakkında?', general: 'Web sitesi / genel', kind: 'Bildirim türü',
      bug: 'Bir şey çalışmıyor', feature: 'Fikir', other: 'Soru veya yorum', subject: 'Başlık', subjectPh: 'Örn. Ölçü çizgisi kaydettikten sonra kayıyor',
      text: 'Açıklama', textPh: 'Ne yaptınız, ne bekliyordunuz ve ne oldu?', mail: 'E-posta adresi', mailOpt: '(isteğe bağlı, yalnızca yanıt istiyorsanız)',
      pub: 'Bildiriminiz <code>{repo}</code> içinde <strong>GitHub’da herkese açık bir issue</strong> olur. Paylaşmak istemediğiniz bir şey yazmayın. E-posta adresiniz issue’ya eklenmez.',
      team: 'Bildiriminiz <strong>bu uygulamanın ekibine</strong> gider ve <strong>herkese açık değildir</strong>.',
      sent: 'Eklenen', needTitle: 'Bir başlık girin.', needText: 'Başlık ve açıklamaya toplam en az 10 karakter yazın.', badMail: 'Bu e-posta adresi geçerli değil.',
      cancel: 'İptal', send: 'Gönder', sending: 'Gönderiliyor…', thanks: 'Teşekkürler, bildiriminiz gönderildi.',
      madeIssue: '<strong>{repo}</strong> içinde bir issue oluşturuldu.', toTeam: 'Bu uygulamanın ekibi bildiriminizi aldı.', stored: 'Geliştiriciler bildiriminizi kendi panellerinde görecek.',
      onGithub: 'GitHub’da görüntüle', rate: 'Kısa sürede çok sayıda bildirim gönderdiniz. Bir saat sonra tekrar deneyin.', dup: 'Bu bildirimi zaten aldık.',
      rejected: 'Bildirim kabul edilmedi. Metni ve e-posta adresini kontrol edin.', failed: 'Gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin.' },
    es: { title: 'Enviar comentarios', close: 'Cerrar', app: '¿Sobre qué aplicación es?', general: 'Sitio web / general', kind: 'Tipo de aviso',
      bug: 'Algo no funciona', feature: 'Idea', other: 'Pregunta o comentario', subject: 'Título', subjectPh: 'P. ej. La línea de medida se desplaza al guardar',
      text: 'Descripción', textPh: '¿Qué hiciste, qué esperabas y qué ocurrió?', mail: 'Correo electrónico', mailOpt: '(opcional, solo si quieres una respuesta)',
      pub: 'Tu aviso se convierte en una <strong>incidencia pública en GitHub</strong> en <code>{repo}</code>. No incluyas nada que no quieras compartir. Tu correo no aparece en la incidencia.',
      team: 'Tu aviso llega al <strong>equipo de esta aplicación</strong> y <strong>no es público</strong>.',
      sent: 'Se incluye', needTitle: 'Escribe un título.', needText: 'Escribe al menos 10 caracteres entre el título y la descripción.', badMail: 'Este correo electrónico no es válido.',
      cancel: 'Cancelar', send: 'Enviar', sending: 'Enviando…', thanks: 'Gracias, tu aviso se ha enviado.',
      madeIssue: 'Se ha creado una incidencia en <strong>{repo}</strong>.', toTeam: 'El equipo de esta aplicación ha recibido tu aviso.', stored: 'Los desarrolladores verán tu aviso en su panel.',
      onGithub: 'Ver en GitHub', rate: 'Has enviado muchos avisos en poco tiempo. Vuelve a intentarlo dentro de una hora.', dup: 'Ya hemos recibido este aviso.',
      rejected: 'El aviso no se ha aceptado. Revisa el texto y el correo electrónico.', failed: 'No se ha podido enviar. Comprueba tu conexión e inténtalo de nuevo.' }
  };
  var TYPES = [['bug', 'bug', 'warning'], ['feature', 'feature', 'bolt'], ['general', 'other', 'chat']];

  var CSS = '' +
    '.fb-dialog{margin:auto;border:0;padding:0;border-radius:var(--radius-lg);width:min(560px,calc(100vw - 32px));max-height:calc(100vh - 32px);background:linear-gradient(180deg,#FFFFFF,var(--blueprint-white));box-shadow:0 30px 80px -20px rgba(0,0,0,.55);color:var(--deep-forge)}' +
    '.fb-dialog::backdrop{background:rgba(20,20,26,.55);backdrop-filter:blur(3px)}' +
    '.fb-head{display:flex;align-items:center;gap:12px;padding:var(--sp-5) var(--sp-6);border-bottom:1px solid rgba(42,42,50,.08)}' +
    '.fb-head h2{font-size:1.25rem;margin:0;flex:1;color:var(--deep-forge)}' +
    '.fb-close{background:none;border:0;cursor:pointer;font-size:1.4rem;line-height:1;color:var(--text-on-light);padding:4px 8px;border-radius:var(--radius-sm)}' +
    '.fb-close:hover{background:rgba(42,42,50,.06)}' +
    '.fb-body{padding:var(--sp-5) var(--sp-6);display:flex;flex-direction:column;gap:var(--sp-4)}' +
    '.fb-body label,.fb-legend{display:block;font-weight:600;font-size:.9rem;margin-bottom:6px;color:var(--deep-forge)}' +
    '.fb-body .opt{font-weight:400;color:var(--text-on-light)}' +
    '.fb-body input,.fb-body textarea,.fb-body select{width:100%;font:inherit;font-size:.95rem;color:var(--deep-forge);background:#FFFFFF;border:1px solid rgba(42,42,50,.16);border-radius:var(--radius-md);padding:10px 12px}' +
    '.fb-body textarea{min-height:120px;resize:vertical}' +
    '.fb-body input:focus,.fb-body textarea:focus,.fb-body select:focus{outline:none;border-color:var(--amber);box-shadow:0 0 0 3px rgba(217,119,6,.15)}' +
    '.fb-types{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}' +
    '.fb-type{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border:1px solid rgba(42,42,50,.12);border-radius:var(--radius-md);background:#FFFFFF;cursor:pointer;font:inherit;font-size:.85rem;font-weight:600;color:var(--deep-forge);text-align:center;transition:border-color .15s,box-shadow .15s}' +
    '.fb-type .ico{width:22px;height:22px;color:var(--amber)}' +
    '.fb-type:hover{border-color:rgba(217,119,6,.5)}' +
    '.fb-type[aria-pressed="true"]{border-color:var(--amber);box-shadow:0 0 0 1px var(--amber) inset;background:rgba(217,119,6,.06)}' +
    '.fb-note{display:flex;gap:10px;align-items:flex-start;font-size:.85rem;line-height:1.5;color:var(--text-on-light);background:rgba(217,119,6,.07);border-left:3px solid var(--amber);border-radius:var(--radius-md);padding:10px 12px;margin:0}' +
    '.fb-note .ico{flex:none;width:18px;height:18px;color:var(--amber);margin-top:1px}' +
    '.fb-note code{font-family:var(--font-code);font-size:.8rem;overflow-wrap:anywhere}' +
    '.fb-meta{font-family:var(--font-code);font-size:.75rem;color:var(--text-on-light);opacity:.8;margin:0}' +
    '.fb-hint{font-size:.85rem;color:#B45309;min-height:1.2em;margin:0}' +
    '.fb-foot{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:10px;padding:var(--sp-4) var(--sp-6) var(--sp-5);border-top:1px solid rgba(42,42,50,.08)}' +
    '.fb-foot .btn{display:inline-flex;align-items:center;gap:8px}' +
    '.fb-foot .btn[disabled]{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}' +
    '.fb-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}' +
    '.fb-done{text-align:center;padding:var(--sp-8) var(--sp-6) var(--sp-2)}' +
    '.fb-done .icon-tile{margin:0 auto var(--sp-4)}' +
    '.fb-done h3{font-size:1.2rem;margin-bottom:6px;color:var(--deep-forge)}' +
    '.fb-done p{color:var(--text-on-light)}' +
    '.fb-done .fb-foot{border:0;justify-content:center}' +
    '@media (max-width:520px){.fb-types{grid-template-columns:1fr}.fb-type{flex-direction:row;justify-content:flex-start}}';

  function lang() {
    var l = '';
    try { l = (window.getCurrentLang && window.getCurrentLang()) || ''; } catch (e) { /* not loaded */ }
    l = (l || document.documentElement.lang || 'nl').slice(0, 2).toLowerCase();
    return T[l] ? l : 'en';
  }
  function app(id) { for (var i = 0; i < APPS.length; i++) if (APPS[i][0] === id) return APPS[i]; return APPS[0]; }
  function fromPath() {
    var seg = location.pathname.replace(/^\/(en|fr|tr|es)(\/|$)/, '/').split('/').filter(Boolean)[0] || '';
    for (var i = 0; i < APPS.length; i++) if (APPS[i][0] === seg) return seg;
    return 'website';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ico(k) { return '<svg class="ico" aria-hidden="true"><use href="' + ICONS + k + '"/></svg>'; }

  var dlg, t, type;
  function q(s) { return dlg.querySelector(s); }

  function render() {
    t = T[lang()];
    dlg.innerHTML =
      '<form class="fb-form" novalidate>' +
      '<div class="fb-head"><h2 id="fb-title">' + t.title + '</h2><button type="button" class="fb-close" aria-label="' + t.close + '">&times;</button></div>' +
      '<div class="fb-body">' +
      '<div><label for="fb-app">' + t.app + '</label><select id="fb-app">' +
      APPS.map(function (a) { return '<option value="' + a[0] + '">' + esc(a[1] || t.general) + '</option>'; }).join('') + '</select></div>' +
      '<div><span class="fb-legend">' + t.kind + '</span><div class="fb-types" role="group" aria-label="' + t.kind + '">' +
      TYPES.map(function (x) { return '<button type="button" class="fb-type" data-type="' + x[0] + '" aria-pressed="false">' + ico(x[2]) + '<span>' + t[x[1]] + '</span></button>'; }).join('') + '</div></div>' +
      '<div><label for="fb-subject">' + t.subject + '</label><input id="fb-subject" maxlength="120" placeholder="' + esc(t.subjectPh) + '"></div>' +
      '<div><label for="fb-text">' + t.text + '</label><textarea id="fb-text" maxlength="4500" placeholder="' + esc(t.textPh) + '"></textarea></div>' +
      '<div><label for="fb-mail">' + t.mail + ' <span class="opt">' + t.mailOpt + '</span></label><input id="fb-mail" type="email" autocomplete="email"></div>' +
      '<div class="fb-hp" aria-hidden="true"><label>Website<input id="fb-website" tabindex="-1" autocomplete="off"></label></div>' +
      '<p class="fb-note">' + ico('globe') + '<span class="fb-note-text"></span></p>' +
      '<p class="fb-meta"></p>' +
      '<p class="fb-hint" aria-live="polite"></p>' +
      '</div>' +
      '<div class="fb-foot"><button type="button" class="btn btn-line fb-cancel">' + t.cancel + '</button><button type="submit" class="btn btn-glow fb-send" disabled>' + ico('arrow-right') + '<span>' + t.send + '</span></button></div>' +
      '</form>' +
      '<div class="fb-done" hidden></div>';

    dlg.querySelectorAll('.fb-type').forEach(function (b) {
      b.addEventListener('click', function () { setType(b.dataset.type); });
    });
    ['#fb-app', '#fb-subject', '#fb-text', '#fb-mail'].forEach(function (s) {
      q(s).addEventListener('input', refresh);
      q(s).addEventListener('change', refresh);
    });
    q('.fb-close').addEventListener('click', function () { dlg.close(); });
    q('.fb-cancel').addEventListener('click', function () { dlg.close(); });
    q('.fb-form').addEventListener('submit', submit);
  }

  function setType(v) {
    type = v;
    dlg.querySelectorAll('.fb-type').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.type === v)); });
  }

  function validity() {
    var s = q('#fb-subject').value.trim(), d = q('#fb-text').value.trim(), m = q('#fb-mail');
    if (!s) return t.needTitle;
    if ((s + d).length < 10) return t.needText;
    if (m.value.trim() && !m.checkValidity()) return t.badMail;
    return '';
  }

  function refresh() {
    var a = app(q('#fb-app').value);
    q('.fb-note-text').innerHTML = a[3] === 'public' ? t.pub.replace('{repo}', esc(a[2])) : t.team;
    q('.fb-meta').textContent = t.sent + ': open-aec.com' + location.pathname + ' · ' + lang();
    var problem = validity();
    q('.fb-hint').textContent = (q('#fb-subject').value || q('#fb-text').value) ? problem : '';
    q('.fb-send').disabled = !!problem;
  }

  function submit(e) {
    e.preventDefault();
    if (validity() || q('#fb-website').value) return; // honeypot: silently ignore
    var a = app(q('#fb-app').value);
    var fields = {
      app: a[0],
      category: type,
      message: q('#fb-subject').value.trim() + '\n\n' + q('#fb-text').value.trim() + '\n\n_Via open-aec.com' + location.pathname + ' · ' + lang() + '_',
      appVersion: 'website'
    };
    var mail = q('#fb-mail').value.trim();
    if (mail) fields.email = mail;
    var send = q('.fb-send');
    send.disabled = true;
    q('.fb-hint').textContent = t.sending;
    fetch(API + (a[3] === 'private' ? 'private-feedback' : 'feedback'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields)
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { r: r, j: j }; }); })
      .then(function (x) {
        if (x.r.ok && x.j.success) return done(a, a[3] === 'public' ? x.j.githubIssueUrl : null);
        q('.fb-hint').textContent = x.r.status === 429 ? t.rate : x.r.status === 409 ? t.dup : x.r.status === 400 ? t.rejected : t.failed;
        send.disabled = false;
      })
      .catch(function () { q('.fb-hint').textContent = t.failed; send.disabled = false; });
  }

  function done(a, url) {
    q('.fb-form').hidden = true;
    var box = q('.fb-done');
    box.hidden = false;
    box.innerHTML = '<div class="icon-tile">' + ico('check') + '</div><h3>' + t.thanks + '</h3>' +
      '<p>' + (url ? t.madeIssue.replace('{repo}', esc(a[2])) : a[3] === 'public' ? t.stored : t.toTeam) + '</p>' +
      '<div class="fb-foot">' + (url ? '<a class="btn btn-glow" href="' + esc(url) + '" target="_blank" rel="noopener">' + ico('external') + '<span>' + t.onGithub + '</span></a>' : '') +
      '<button type="button" class="btn btn-line fb-again">' + t.close + '</button></div>';
    box.querySelector('.fb-again').addEventListener('click', function () { dlg.close(); });
  }

  function open(e) {
    if (typeof HTMLDialogElement === 'undefined') return; // very old browser: follow the link
    if (e) e.preventDefault();
    if (!dlg) {
      var st = document.createElement('style');
      st.textContent = CSS;
      document.head.appendChild(st);
      dlg = document.createElement('dialog');
      dlg.className = 'fb-dialog';
      dlg.setAttribute('aria-labelledby', 'fb-title');
      dlg.addEventListener('click', function (ev) { if (ev.target === dlg) dlg.close(); });
      document.body.appendChild(dlg);
    }
    render(); // fresh form in the current language
    q('#fb-app').value = fromPath();
    setType('bug');
    refresh();
    dlg.showModal();
    q('#fb-subject').focus();
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.nav-feedback-btn, [data-feedback-open]');
    if (a && !e.ctrlKey && !e.metaKey && !e.shiftKey) open(e);
  });
  window.openFeedback = open;
})();
