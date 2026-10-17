import { createClient } from '@supabase/supabase-js';
import './style.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const app = document.querySelector('#app');
const modalRoot = document.querySelector('#modal-root');
const toastRoot = document.querySelector('#toast-root');

const sampleProjects = [
  { id: 'demo-project-1', demo: true, title: 'Le labo dans la cour', tagline: 'Apprendre les sciences par l’expérience', category: 'Éducation', stage: 'prototype', location: 'Burkina Faso', description: 'Exemple fictif d’un projet qui rend les expériences scientifiques accessibles avec du matériel simple.' },
  { id: 'demo-project-2', demo: true, title: 'Mémoire des quartiers', tagline: 'Des récits locaux pour demain', category: 'Culture', stage: 'idée', location: 'Afrique de l’Ouest', description: 'Exemple fictif d’un carnet numérique pour collecter des histoires orales, des lieux et des savoir-faire.' },
  { id: 'demo-project-3', demo: true, title: 'Un coup de pouce numérique', tagline: 'Des compétences partagées', category: 'Solidarité', stage: 'en développement', location: 'Communauté', description: 'Exemple fictif d’un réseau d’entraide où chacun peut transmettre une compétence concrète.' }
];
const sampleOpportunities = [
  { id: 'demo-opp-1', demo: true, title: 'Rencontre avec un mentor', organization: 'Aperçu de démonstration', opportunity_type: 'mentorat', category: 'Accompagnement', location: 'À distance', deadline: null, description: 'Un exemple de parcours de mentorat pour aider une idée à franchir sa prochaine étape.' },
  { id: 'demo-opp-2', demo: true, title: 'Présenter son idée en 3 minutes', organization: 'Aperçu de démonstration', opportunity_type: 'concours', category: 'Prise de parole', location: 'En ligne', deadline: null, description: 'Un exemple fictif d’appel à projets pour apprendre à formuler et présenter une initiative.' }
];

const state = { user: null, view: 'discover', projects: [], opportunities: [], profiles: [], ownProfile: null, ownProjects: [], ownOpportunities: [], ownApplications: [] };
const e = (value = '') => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const initials = (value = '') => value.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase() || 'A';
const formatDate = (value) => value ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : 'Dates à préciser';
const ownerOf = (item) => Array.isArray(item.talent_profiles) ? item.talent_profiles[0] : item.talent_profiles;
const toTags = (value) => Array.isArray(value) ? value : String(value || '').split(',').map((part) => part.trim()).filter(Boolean);

function toast(message, kind = 'success') {
  toastRoot.innerHTML = '<div class="toast toast-' + e(kind) + '">' + e(message) + '</div>';
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => { toastRoot.innerHTML = ''; }, 4300);
}

function shell(content) {
  const nav = [['discover','Découvrir'],['projects','Projets'],['opportunities','Opportunités'],['workspace','Mon espace']];
  app.innerHTML = `
    <header class="site-header"><div class="header-inner">
      <button class="brand" data-view="discover" aria-label="Accueil Aurore Talents"><span class="talent-sigil">✳</span><span class="brand-copy"><span>AURORE <b>TALENTS</b></span><small>LES LIENS FONT GRANDIR LES IDÉES</small></span></button>
      <nav class="desktop-nav" aria-label="Navigation principale">${nav.map(([id,label]) => `<button class="nav-link ${state.view===id?'active':''}" data-view="${id}">${label}</button>`).join('')}</nav>
      <div class="header-actions">${state.user ? `<button class="user-chip" data-view="workspace"><span class="avatar-mini">${e(initials(state.user.user_metadata?.display_name || state.user.email || 'A'))}</span><span>Mon espace</span></button>` : '<button class="button button-quiet" data-action="auth">Se connecter</button>'}<button class="button button-primary" data-view="workspace">Rejoindre le réseau <span>↗</span></button></div>
      <button class="mobile-menu" data-action="mobile-menu" aria-label="Ouvrir le menu">☰</button>
    </div><div class="mobile-nav" id="mobile-nav">${nav.map(([id,label])=>`<button class="nav-link" data-view="${id}">${label}</button>`).join('')}${state.user?'<button class="nav-link" data-action="signout">Se déconnecter</button>':'<button class="nav-link" data-action="auth">Se connecter</button>'}</div></header>
    <main>${content}</main>
    <footer class="site-footer"><div class="footer-brand"><span class="talent-sigil">✳</span><span><b>Aurore Talents</b><small>Les liens font grandir les idées.</small></span></div><p>Un espace pour révéler les talents, rendre les projets visibles et créer des rencontres utiles.</p><div class="footer-links"><button data-view="projects">Découvrir les projets</button><button data-view="opportunities">Voir les opportunités</button><button data-view="workspace">Créer mon espace</button></div><small class="copyright">© ${new Date().getFullYear()} Aurore · Grandir ensemble, avec attention.</small></footer>`;
}

function projectCard(project) {
  const author = ownerOf(project);
  const demo = Boolean(project.demo);
  const palette = ['project-cover-mint','project-cover-lilac','project-cover-gold'][Math.abs((project.title || '').length) % 3];
  return `<article class="project-card">
    <div class="project-cover ${palette}"><div class="project-topline"><span class="project-category">${e(project.category || 'Projet')}</span><span class="cover-mark">✳</span></div><div class="project-monogram">${e((project.title || 'A').trim().slice(0,1).toUpperCase())}</div><span class="project-stage">${demo?'APERÇU FICTIF':e(project.stage || 'En mouvement')}</span></div>
    <div class="project-body"><div class="project-kicker">${demo?'EXEMPLE DE PRÉSENTATION':'PROJET · '+e(project.category || 'INITIATIVE')}</div><h3>${e(project.title)}</h3>${project.tagline?`<p class="project-tagline">${e(project.tagline)}</p>`:''}<p class="project-description">${e(project.description || 'Une initiative portée par une envie de faire avancer les choses.')}</p>
      <div class="project-meta"><span>⌖ ${e(project.location || 'Lieu à préciser')}</span><span>${e(author?.display_name || 'Porteur de projet')}</span></div>
      <div class="project-foot"><span class="small-avatar">${e(initials(author?.display_name || 'AP'))}</span><span class="project-author">${e(author?.headline || (demo ? 'Texte d’illustration' : 'Communauté Aurore'))}</span><button class="icon-button" data-detail-project="${e(project.id)}" aria-label="Découvrir le projet ${e(project.title)}">↗</button></div>
    </div></article>`;
}

function opportunityCard(opportunity) {
  const demo = Boolean(opportunity.demo);
  const typeLabels = { bourse:'Bourse', stage:'Stage', emploi:'Emploi', mentorat:'Mentorat', concours:'Concours', partenariat:'Partenariat', autre:'Autre' };
  const icon = { bourse:'↗', stage:'⌑', emploi:'↗', mentorat:'◎', concours:'✳', partenariat:'⌘', autre:'◇' }[opportunity.opportunity_type] || '✳';
  return `<article class="opportunity-card">
    <div class="opportunity-icon">${icon}</div><div class="opportunity-content"><div class="opportunity-kicker"><span>${demo?'APERÇU FICTIF':e(typeLabels[opportunity.opportunity_type] || opportunity.opportunity_type || 'Opportunité')}</span>${opportunity.deadline?`<span>Jusqu’au ${e(formatDate(opportunity.deadline))}</span>`:''}</div><h3>${e(opportunity.title)}</h3><p class="opportunity-org">${e(opportunity.organization || 'Communauté Aurore')}</p><p class="opportunity-description">${e(opportunity.description || 'Une occasion de rencontre, de progression ou de collaboration.')}</p><div class="opportunity-bottom"><span>⌖ ${e(opportunity.location || 'Lieu à préciser')}</span><button class="text-link" data-apply-id="${e(opportunity.id)}" ${demo?'data-demo="true"':''}>Découvrir <span>↗</span></button></div></div>
  </article>`;
}

function renderDiscover() {
  const projects = state.projects.length ? state.projects : sampleProjects;
  const opportunities = state.opportunities.length ? state.opportunities : sampleOpportunities;
  shell(`
    <section class="hero-wrap"><div class="hero container">
      <div class="hero-copy"><div class="eyebrow"><span class="eyebrow-dot"></span> Le réseau des possibles</div>
        <h1>Le talent est un départ.<br><em>Le lien fait la suite.</em></h1>
        <p class="hero-lead">Aurore Talents rapproche celles et ceux qui ont une idée, une compétence ou une envie d’agir. Faites connaître votre projet, trouvez un mentor et avancez avec les bonnes personnes.</p>
        <div class="hero-actions"><button class="button button-primary button-large" data-view="workspace">Créer mon profil <span>↗</span></button><button class="button button-outline button-large" data-view="projects">Explorer les projets <span>↓</span></button></div>
        <div class="hero-proof"><span class="proof-stamp">✳</span><span><strong>Votre potentiel mérite un espace.</strong><small>Profils · Projets · Opportunités · Mentorat</small></span></div>
      </div>
      <div class="hero-art"><div class="art-ring ring-a"></div><div class="art-ring ring-b"></div><div class="art-star">✳</div>
        <article class="hero-profile hero-profile-main"><div class="profile-avatar profile-avatar-green">P<span>✳</span></div><div class="profile-label">UNE IDÉE EN MOUVEMENT</div><h2>Un projet grandit<br>quand il rencontre<br><em>les bonnes personnes.</em></h2><div class="profile-divider"></div><div class="profile-tags"><span>Curiosité</span><span>Transmission</span><span>Impact</span></div><div class="profile-byline"><span class="tiny-dot"></span><span>Les prochaines rencontres commencent ici.</span></div></article>
        <div class="floating-badge badge-top"><span class="badge-icon">◎</span><span><b>Mentorat</b><small>Partager l’expérience</small></span></div><div class="floating-badge badge-bottom"><span class="badge-icon badge-icon-lime">↗</span><span><b>Projets visibles</b><small>Donner de l’élan</small></span></div>
      </div>
    </div></section>
    <section class="pill-strip"><div class="container pill-inner"><span><b>01</b> Révéler son talent</span><i></i><span><b>02</b> Faire connaître son projet</span><i></i><span><b>03</b> Trouver de l’accompagnement</span><i></i><span><b>04</b> Créer des liens durables</span></div></section>
    <section class="section container"><div class="section-heading"><div><div class="eyebrow">UN RÉSEAU QUI AGIT</div><h2>Trois façons d’avancer.</h2><p>Les opportunités naissent des rencontres. Aurore Talents donne de la place aux personnes, aux idées et aux liens qui les font progresser.</p></div></div>
      <div class="pillar-grid"><article class="pillar-card pillar-dark"><span class="pillar-index">01 / PROFILS</span><span class="pillar-icon">◉</span><h3>Montrez ce qui vous rend unique.</h3><p>Présentez votre parcours, vos compétences et ce que vous souhaitez apprendre ou transmettre.</p><button class="pillar-link" data-view="workspace">Créer un profil <span>↗</span></button><span class="pillar-bg">P</span></article><article class="pillar-card pillar-lime"><span class="pillar-index">02 / PROJETS</span><span class="pillar-icon">✳</span><h3>Faites sortir vos idées du carnet.</h3><p>Partagez une initiative, cherchez du soutien et rendez visibles les étapes déjà franchies.</p><button class="pillar-link" data-view="projects">Explorer les projets <span>↗</span></button><span class="pillar-bg">✳</span></article><article class="pillar-card pillar-cream"><span class="pillar-index">03 / OPPORTUNITÉS</span><span class="pillar-icon">↗</span><h3>Rencontrez le prochain possible.</h3><p>Repérez les appels, les mentors et les collaborations susceptibles de vous faire avancer.</p><button class="pillar-link" data-view="opportunities">Voir les opportunités <span>↗</span></button><span class="pillar-bg">↗</span></article></div>
    </section>
    <section class="section project-section"><div class="container"><div class="section-heading"><div><div class="eyebrow">DES IDÉES QUI PRENNENT FORME</div><h2>Les projets à découvrir.</h2><p>Un aperçu du type d’initiatives que la communauté pourra présenter après validation.</p></div><button class="text-link" data-view="projects">Tous les projets <span>↗</span></button></div>
      ${state.projects.length ? '<div class="live-note"><span class="live-dot"></span> Projets publiés et visibles sur Aurore Talents</div>' : '<div class="live-note demo-note"><span class="live-dot"></span> Aperçus fictifs — les premiers projets réels apparaîtront après validation.</div>'}
      <div class="project-grid">${projects.slice(0,3).map(projectCard).join('')}</div>
    </div></section>
    <section class="section container opportunity-section"><div class="section-heading"><div><div class="eyebrow">LA BONNE RENCONTRE AU BON MOMENT</div><h2>De nouvelles portes à ouvrir.</h2><p>Mentorat, accompagnement, concours et partenariats auront leur espace, sans transformer les exemples en fausses offres.</p></div><button class="text-link" data-view="opportunities">Toutes les opportunités <span>↗</span></button></div>
      ${state.opportunities.length ? '' : '<div class="notice notice-demo">Les éléments marqués « Aperçu fictif » sont des exemples de présentation, pas des offres ouvertes.</div>'}
      <div class="opportunity-list">${opportunities.slice(0,2).map(opportunityCard).join('')}</div>
    </section>
    <section class="closing-band container"><div class="closing-mark">✳</div><div><p class="eyebrow">TOUT COMMENCE PAR UN PREMIER LIEN</p><h2>Faites de la place à la suite.</h2><p>Créez votre profil. Les prochaines étapes se construiront avec vous.</p></div><button class="button button-dark-light button-large" data-view="workspace">Rejoindre Aurore Talents <span>↗</span></button><div class="closing-orbit"></div></section>
  `);
}

function renderProjects() {
  const projects = state.projects.length ? state.projects : sampleProjects;
  shell(`
    <section class="page-hero container"><div class="eyebrow"><span class="eyebrow-dot"></span> PROJETS EN MOUVEMENT</div><h1>Les idées méritent<br><em>de prendre forme.</em></h1><p>Découvrez des initiatives, leurs besoins et les personnes qui les font avancer.</p><button class="button button-primary button-large" data-view="workspace">Présenter mon projet <span>↗</span></button></section>
    <section class="section container page-listing"><div class="results-heading"><div><div class="eyebrow">LA COMMUNAUTÉ</div><h2>${state.projects.length?'Projets publiés':'Un aperçu de la galerie'}</h2></div><span class="result-count">${projects.length} ${projects.length===1?'projet':'projets'}</span></div>
      ${state.projects.length?'':'<div class="notice notice-demo">Les projets ci-dessous sont des exemples fictifs pour montrer la présentation. Les projets réels apparaîtront après validation.</div>'}<div class="project-grid">${projects.map(projectCard).join('')}</div>
    </section>`);
}

function renderOpportunities() {
  const opportunities = state.opportunities.length ? state.opportunities : sampleOpportunities;
  shell(`
    <section class="page-hero container"><div class="eyebrow"><span class="eyebrow-dot"></span> OPPORTUNITÉS & ACCOMPAGNEMENT</div><h1>La prochaine porte<br><em>est peut-être ici.</em></h1><p>Des occasions d’apprendre, de collaborer, de se faire accompagner ou de financer une idée.</p><button class="button button-primary button-large" data-view="workspace">Proposer une opportunité <span>↗</span></button></section>
    <section class="section container page-listing"><div class="results-heading"><div><div class="eyebrow">À EXPLORER</div><h2>${state.opportunities.length?'Opportunités ouvertes':'Exemples de présentation'}</h2></div><span class="result-count">${opportunities.length} éléments</span></div>
      ${state.opportunities.length?'':'<div class="notice notice-demo">Les cartes sont des exemples fictifs — aucune candidature n’est ouverte pour le moment.</div>'}<div class="opportunity-list">${opportunities.map(opportunityCard).join('')}</div>
    </section>`);
}

function profileForm() {
  const p = state.ownProfile || {};
  return `<section class="workspace-card"><div class="panel-heading"><div><span class="eyebrow">01 / MON IDENTITÉ</span><h2>Mon profil</h2><p>Présentez-vous sans vous enfermer dans une seule étiquette.</p></div><span class="panel-icon">◉</span></div>
    <form id="profile-form" class="workspace-form">
      <div class="field-grid"><label>Nom affiché<input name="display_name" maxlength="100" required value="${e(p.display_name || state.user?.user_metadata?.display_name || '')}" placeholder="Nom ou nom d’usage"></label><label>Identifiant public<input name="handle" pattern="[a-z0-9][a-z0-9_-]{2,29}" required value="${e(p.handle || '')}" placeholder="ex. awa-sciences"><small>Minuscules, chiffres, tirets ; au moins 3 caractères.</small></label></div>
      <label>Votre titre<input name="headline" maxlength="160" value="${e(p.headline || '')}" placeholder="Étudiant·e en sciences, mentor, créateur…"></label>
      <label>Présentation<textarea name="bio" rows="3" maxlength="1200" placeholder="Ce qui vous motive, ce que vous construisez, ce que vous souhaitez apprendre…">${e(p.bio || '')}</textarea></label>
      <div class="field-grid"><label>Ville / zone<input name="location" maxlength="100" value="${e(p.location || '')}" placeholder="Bobo-Dioulasso, Ouagadougou…"></label><label>Votre profil<select name="profile_type"><option value="student" ${(p.profile_type||'student')==='student'?'selected':''}>Élève / étudiant·e</option><option value="mentor" ${p.profile_type==='mentor'?'selected':''}>Mentor / accompagnateur</option><option value="professional" ${p.profile_type==='professional'?'selected':''}>Professionnel·le</option><option value="organization" ${p.profile_type==='organization'?'selected':''}>Organisation / structure</option></select></label></div>
      <label>Compétences <span class="optional">séparées par des virgules</span><input name="skills" value="${e((p.skills||[]).join(', '))}" placeholder="Écriture, sciences, programmation…"></label>
      <label>Centres d’intérêt <span class="optional">séparés par des virgules</span><input name="interests" value="${e((p.interests||[]).join(', '))}" placeholder="Innovation, mentorat, culture…"></label>
      <div class="form-actions"><button class="button button-primary" name="intent" value="save" type="submit">Enregistrer mon profil <span>↗</span></button><button class="button button-outline" name="intent" value="submit" type="submit">Soumettre à la validation</button></div>
      <p class="form-hint">La soumission déclenche une demande de validation ; elle ne publie pas automatiquement le profil.</p>
    </form>
    ${state.ownProfile ? `<div class="profile-status"><span class="status-pill ${state.ownProfile.publication_status==='published'?'status-published':state.ownProfile.submission_requested_at?'status-pending':'status-draft'}">${state.ownProfile.publication_status==='published'?'Profil publié':state.ownProfile.submission_requested_at?'En attente de validation':'Profil privé — brouillon'}</span></div>` : ''}
  </section>`;
}

function projectForm() {
  return `<section class="workspace-card"><div class="panel-heading"><div><span class="eyebrow">02 / FAIRE AVANCER UNE IDÉE</span><h2>Présenter un projet</h2><p>Expliquez ce que vous voulez construire et ce qui vous aiderait à avancer.</p></div><span class="panel-icon panel-icon-lime">✳</span></div>
    <form id="project-form" class="workspace-form">
      <label>Titre du projet<input name="title" required maxlength="140" placeholder="Un titre court et clair"></label>
      <label>Phrase de présentation<input name="tagline" maxlength="180" placeholder="Une phrase pour donner envie d’en savoir plus"></label>
      <label>Description<textarea name="description" rows="4" maxlength="3000" required placeholder="Le besoin, l’idée, les personnes concernées et la prochaine étape…"></textarea></label>
      <div class="field-grid"><label>Catégorie<input name="category" maxlength="80" required placeholder="Éducation, culture, technologie…"></label><label>Étape<select name="stage"><option value="idée">Idée</option><option value="prototype">Prototype</option><option value="en développement">En développement</option><option value="en activité">En activité</option><option value="recherche de soutien">Recherche de soutien</option></select></label></div>
      <div class="field-grid"><label>Lieu<input name="location" maxlength="100" placeholder="Ville ou zone"></label><label>Compétences recherchées<input name="skills" placeholder="Design, sciences…"></label></div>
      <div class="form-actions"><button class="button button-primary" name="intent" value="save" type="submit">Enregistrer le brouillon</button><button class="button button-outline" name="intent" value="submit" type="submit">Soumettre à la validation</button></div><p class="form-hint">Les projets ne deviennent visibles qu’après validation éditoriale.</p>
    </form>
  </section>`;
}

function opportunityForm() {
  return `<section class="workspace-card"><div class="panel-heading"><div><span class="eyebrow">03 / OUVRIR UNE PORTE</span><h2>Proposer une opportunité</h2><p>Partagez une possibilité utile : mentorat, stage, concours, bourse ou partenariat.</p></div><span class="panel-icon">↗</span></div>
    <form id="opportunity-form" class="workspace-form">
      <label>Intitulé<input name="title" required maxlength="160" placeholder="Nom de l’opportunité"></label>
      <div class="field-grid"><label>Organisation<input name="organization" required maxlength="120" placeholder="Structure responsable"></label><label>Type<select name="opportunity_type"><option value="mentorat">Mentorat</option><option value="bourse">Bourse</option><option value="stage">Stage</option><option value="emploi">Emploi</option><option value="concours">Concours</option><option value="partenariat">Partenariat</option><option value="autre">Autre</option></select></label></div>
      <label>Description<textarea name="description" required rows="3" maxlength="3000" placeholder="À qui s’adresse cette opportunité ? Quelles sont les étapes ?"></textarea></label>
      <div class="field-grid"><label>Lieu<input name="location" maxlength="120" placeholder="Sur place, à distance…"></label><label>Date limite<input name="deadline" type="date"></label></div>
      <label>Lien officiel <span class="optional">facultatif</span><input name="external_url" type="url" placeholder="https://…"></label>
      <div class="form-actions"><button class="button button-primary" name="intent" value="save" type="submit">Enregistrer le brouillon</button><button class="button button-outline" name="intent" value="submit" type="submit">Soumettre à la validation</button></div><p class="form-hint">Seules les opportunités vérifiées et encore ouvertes seront affichées publiquement.</p>
    </form>
  </section>`;
}

function ownItemList(items, type) {
  if (!items.length) return '<div class="mini-empty">Vos premières contributions apparaîtront ici dès leur enregistrement.</div>';
  return `<div class="own-list">${items.map((item) => {
    const pending = item.submission_requested_at;
    const label = item.publication_status==='published'?'Publié':pending?'En attente de validation':item.publication_status==='rejected'?'À corriger':'Brouillon';
    const cls = item.publication_status==='published'?'status-published':pending?'status-pending':item.publication_status==='rejected'?'status-rejected':'status-draft';
    return `<div class="own-item"><span class="own-icon">${type==='project'?'✳':'↗'}</span><div class="own-item-copy"><strong>${e(item.title)}</strong><small>${e(item.category || item.organization || 'Contribution')} · ${e(formatDate(item.updated_at || item.created_at))}</small><span class="status-pill ${cls}">${label}</span></div></div>`;
  }).join('')}</div>`;
}

function renderWorkspace() {
  if (!state.user) {
    shell(`<section class="workspace-guest container"><div class="workspace-decoration"><span class="decor-big">✳</span><span class="decor-small">↗</span></div><div class="eyebrow"><span class="eyebrow-dot"></span> MON ESPACE AURORE</div><h1>Votre talent mérite<br><em>un réseau qui l’écoute.</em></h1><p>Créez votre profil, gardez une trace de vos projets et soumettez vos idées à une communauté qui grandit avec attention.</p><div class="workspace-benefits"><span>✓ Un profil à votre image</span><span>✓ Des projets à faire connaître</span><span>✓ Une publication validée</span></div><button class="button button-primary button-large" data-action="auth">Créer mon espace <span>↗</span></button><p class="fine-print">Aucun profil ou projet n’est publié automatiquement.</p></section>`);
    return;
  }
  shell(`<section class="workspace-header"><div class="container workspace-title-row"><div><div class="eyebrow"><span class="eyebrow-dot"></span> MON ESPACE</div><h1>Les prochaines étapes commencent ici.</h1><p>Développez votre profil, puis faites connaître vos initiatives.</p></div><button class="button button-outline" data-action="signout">Se déconnecter</button></div></section>
    <section class="container workspace-layout"><div class="workspace-main">${profileForm()}${projectForm()}${opportunityForm()}</div><aside class="workspace-side"><div class="side-card side-welcome"><span class="side-sigil">✳</span><div class="eyebrow">VOTRE ESPACE</div><h2>Un petit pas<br>fait avancer l’idée.</h2><p>Commencez par un profil clair. Vous pourrez ensuite présenter plusieurs projets ou opportunités.</p><div class="side-steps"><span><b>01</b> Profil</span><span><b>02</b> Projet</span><span><b>03</b> Relecture</span></div></div><div class="side-card"><div class="side-heading"><h3>Mes projets</h3><span class="count-pill">${state.ownProjects.length}</span></div>${ownItemList(state.ownProjects,'project')}</div><div class="side-card"><div class="side-heading"><h3>Mes opportunités</h3><span class="count-pill">${state.ownOpportunities.length}</span></div>${ownItemList(state.ownOpportunities,'opportunity')}</div><div class="notice notice-info">Les états de validation sont gérés séparément afin d’éviter qu’un utilisateur ne publie lui-même son contenu.</div></aside></section>`);
}

function render() {
  if (state.view === 'projects') renderProjects();
  else if (state.view === 'opportunities') renderOpportunities();
  else if (state.view === 'workspace') renderWorkspace();
  else renderDiscover();
}

async function loadPublicData() {
  if (!supabase) return;
  const [projectResult, opportunityResult, profileResult] = await Promise.all([
    supabase.from('talent_projects').select('id,title,tagline,description,category,stage,location,skills,created_at,owner_id,talent_profiles(display_name,headline,handle,location,skills)').eq('publication_status','published').order('created_at',{ascending:false}).limit(18),
    supabase.from('talent_opportunities').select('id,title,organization,description,category,opportunity_type,location,deadline,external_url,created_at,owner_id,talent_profiles(display_name,headline,handle)').eq('publication_status','published').order('created_at',{ascending:false}).limit(18),
    supabase.from('talent_profiles').select('id,display_name,handle,headline,bio,location,skills,interests,profile_type,created_at').eq('publication_status','published').order('created_at',{ascending:false}).limit(12)
  ]);
  if (!projectResult.error) state.projects = projectResult.data || [];
  else console.warn('Aurore Talents projects', projectResult.error.message);
  if (!opportunityResult.error) state.opportunities = opportunityResult.data || [];
  else console.warn('Aurore Talents opportunities', opportunityResult.error.message);
  if (!profileResult.error) state.profiles = profileResult.data || [];
  else console.warn('Aurore Talents profiles', profileResult.error.message);
}

async function loadWorkspaceData() {
  if (!supabase || !state.user) return;
  const [profile, projects, opportunities, applications] = await Promise.all([
    supabase.from('talent_profiles').select('id,display_name,handle,headline,bio,location,skills,interests,profile_type,publication_status,submission_requested_at,updated_at').eq('id',state.user.id).maybeSingle(),
    supabase.from('talent_projects').select('id,title,category,stage,publication_status,submission_requested_at,created_at,updated_at').eq('owner_id',state.user.id).order('updated_at',{ascending:false}).limit(30),
    supabase.from('talent_opportunities').select('id,title,organization,category,opportunity_type,publication_status,submission_requested_at,created_at,updated_at').eq('owner_id',state.user.id).order('updated_at',{ascending:false}).limit(30),
    supabase.from('talent_applications').select('id,opportunity_id,application_status,created_at').eq('applicant_id',state.user.id).order('created_at',{ascending:false}).limit(30)
  ]);
  if (profile.error && profile.error.code !== 'PGRST116') console.warn('Aurore Talents profile', profile.error.message);
  state.ownProfile = profile.data || null;
  state.ownProjects = projects.data || [];
  state.ownOpportunities = opportunities.data || [];
  state.ownApplications = applications.data || [];
}

function showAuth(mode = 'signin') {
  if (!supabase) {
    modalRoot.innerHTML = '<div class="modal-backdrop" id="auth-overlay"><section class="auth-modal"><button class="modal-close" data-action="close-modal" aria-label="Fermer">×</button><span class="talent-sigil modal-sigil">✳</span><h2>Encore un réglage.</h2><p>Les variables Supabase ne sont pas configurées. Consultez le README du dépôt pour terminer le raccordement.</p><button class="button button-primary full-width" data-action="close-modal">Compris</button></section></div>';
    return;
  }
  modalRoot.innerHTML = `<div class="modal-backdrop" id="auth-overlay"><section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button class="modal-close" data-action="close-modal" aria-label="Fermer">×</button><span class="talent-sigil modal-sigil">✳</span><div class="eyebrow">AURORE TALENTS</div><h2 id="auth-title">${mode==='signup'?'Faites grandir votre réseau.':'Heureux de vous retrouver.'}</h2><p>${mode==='signup'?'Créez un espace pour votre profil, vos projets et vos futures rencontres.':'Retrouvez votre espace et poursuivez vos projets.'}</p><form id="auth-form" data-mode="${mode}" class="auth-form">${mode==='signup'?'<label>Nom affiché<input name="display_name" autocomplete="name" required maxlength="100" placeholder="Comment vous appeler ?"></label>':''}<label>Adresse e-mail<input name="email" type="email" autocomplete="email" required placeholder="vous@exemple.com"></label><label>Mot de passe<input name="password" type="password" minlength="8" autocomplete="${mode==='signup'?'new-password':'current-password'}" required placeholder="8 caractères minimum"></label><button class="button button-primary button-large full-width" type="submit">${mode==='signup'?'Créer mon espace':'Me connecter'} <span>↗</span></button><p class="auth-message" id="auth-message"></p></form><div class="auth-switch">${mode==='signup'?'Vous avez déjà un compte ?':'Nouveau dans le réseau ?'} <button data-auth-mode="${mode==='signup'?'signin':'signup'}">${mode==='signup'?'Se connecter':'Créer un compte'}</button></div><small class="auth-privacy">Vos données privées ne sont accessibles qu’à votre compte.</small></section></div>`;
  document.querySelector('#auth-overlay input')?.focus();
}

function showApply(opportunity) {
  if (opportunity.demo) {
    modalRoot.innerHTML = `<div class="modal-backdrop" id="info-overlay"><section class="auth-modal"><button class="modal-close" data-action="close-modal" aria-label="Fermer">×</button><span class="talent-sigil modal-sigil">✳</span><div class="eyebrow">EXEMPLE FICTIF</div><h2>Ce n’est pas encore une offre réelle.</h2><p>Cette carte sert uniquement à présenter le futur espace. Les candidatures s’ouvriront lorsqu’une opportunité vérifiée sera publiée.</p><button class="button button-primary full-width" data-action="close-modal">Compris</button></section></div>`;
    return;
  }
  if (!state.user) { showAuth('signin'); return; }
  if (!state.ownProfile) { toast('Créez d’abord votre profil depuis « Mon espace ».', 'error'); state.view='workspace'; render(); return; }
  modalRoot.innerHTML = `<div class="modal-backdrop" id="apply-overlay"><section class="auth-modal" role="dialog" aria-modal="true"><button class="modal-close" data-action="close-modal" aria-label="Fermer">×</button><span class="talent-sigil modal-sigil">↗</span><div class="eyebrow">CANDIDATURE</div><h2>Présentez votre motivation.</h2><p>${e(opportunity.title)}</p><form id="application-form" data-opportunity-id="${e(opportunity.id)}" class="auth-form"><label>Pourquoi cette opportunité ?<textarea name="motivation" rows="5" minlength="20" maxlength="2400" required placeholder="Expliquez ce qui vous intéresse et ce que vous pourriez apporter…"></textarea></label><label>Portfolio ou lien utile <span class="optional">facultatif</span><input name="portfolio_url" type="url" placeholder="https://…"></label><button class="button button-primary button-large full-width" type="submit">Envoyer ma candidature <span>↗</span></button><p class="auth-message" id="application-message"></p></form><small class="auth-privacy">Votre candidature sera liée à votre profil.</small></section></div>`;
}

function openProjectDetail(id) {
  const project = state.projects.find((item)=>item.id===id) || sampleProjects.find((item)=>item.id===id);
  if (!project) return;
  modalRoot.innerHTML = `<div class="modal-backdrop" id="detail-overlay"><section class="detail-modal" role="dialog" aria-modal="true"><button class="modal-close" data-action="close-modal" aria-label="Fermer">×</button><div class="detail-cover"><span class="project-category">${e(project.category||'Projet')}</span><span class="detail-star">✳</span></div>${project.demo?'<div class="notice notice-demo">Exemple fictif de présentation.</div>':''}<div class="eyebrow">UN PROJET À DÉCOUVRIR</div><h2>${e(project.title)}</h2>${project.tagline?`<p class="detail-tagline">${e(project.tagline)}</p>`:''}<p class="detail-description">${e(project.description||'')}</p><div class="detail-meta"><span>⌖ ${e(project.location||'Lieu à préciser')}</span><span>Étape : ${e(project.stage||'non précisée')}</span></div><button class="button button-primary full-width" data-action="close-modal">Continuer à explorer</button></section></div>`;
}

app.addEventListener('click', async (event) => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) {
    state.view = viewButton.dataset.view;
    render();
    if (state.view === 'workspace' && state.user) { await loadWorkspaceData(); render(); }
    if (state.view !== 'workspace') await loadPublicData();
    if (state.view !== 'workspace') render();
    return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'auth') showAuth('signin');
  if (action === 'mobile-menu') document.querySelector('#mobile-nav')?.classList.toggle('mobile-nav-open');
  if (action === 'close-modal') modalRoot.innerHTML = '';
  if (action === 'signout' && supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) toast('La déconnexion n’a pas abouti.', 'error');
    else { state.user=null;state.ownProfile=null;state.ownProjects=[];state.ownOpportunities=[];state.view='discover';render();toast('Vous êtes déconnecté.'); }
  }
  const applyButton = event.target.closest('[data-apply-id]');
  if (applyButton) {
    const opportunity = state.opportunities.find((item)=>item.id===applyButton.dataset.applyId) || sampleOpportunities.find((item)=>item.id===applyButton.dataset.applyId);
    if (opportunity) showApply({ ...opportunity, demo: Boolean(opportunity.demo || applyButton.dataset.demo) });
  }
  const projectButton = event.target.closest('[data-detail-project]');
  if (projectButton) openProjectDetail(projectButton.dataset.detailProject);
  const authMode = event.target.closest('[data-auth-mode]');
  if (authMode) showAuth(authMode.dataset.authMode);
  if (event.target.id==='auth-overlay' || event.target.id==='apply-overlay' || event.target.id==='detail-overlay' || event.target.id==='info-overlay') modalRoot.innerHTML='';
});
modalRoot.addEventListener('click',(event)=>{if(event.target===modalRoot.firstElementChild)modalRoot.innerHTML='';});

modalRoot.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form=event.target;
  if(form.id==='auth-form'){
    if(!supabase)return;
    const fd=new FormData(form),mode=form.dataset.mode,message=document.querySelector('#auth-message'),submit=form.querySelector('button[type="submit"]');
    submit.disabled=true;submit.textContent='Un instant…';
    try{
      const result=mode==='signup'
        ? await supabase.auth.signUp({email:String(fd.get('email')),password:String(fd.get('password')),options:{data:{display_name:String(fd.get('display_name')||'').trim()}}})
        : await supabase.auth.signInWithPassword({email:String(fd.get('email')),password:String(fd.get('password'))});
      if(result.error)throw result.error;
      if(mode==='signup'&&!result.data.session){if(message)message.textContent='Compte créé. Vérifiez votre e-mail pour confirmer votre adresse, puis revenez vous connecter.';submit.disabled=false;submit.textContent='Créer mon espace ↗';return;}
      state.user=result.data.user||result.data.session?.user||null;modalRoot.innerHTML='';
      state.view='workspace';await loadWorkspaceData();render();toast(mode==='signup'?'Votre espace est prêt. Bienvenue !':'Vous voilà de retour.');
    }catch(error){if(message)message.textContent=error.message||'Connexion impossible.';submit.disabled=false;submit.textContent=mode==='signup'?'Créer mon espace ↗':'Me connecter ↗';}
    return;
  }
  if(form.id==='application-form'){
    if(!supabase||!state.user)return;
    const fd=new FormData(form),message=document.querySelector('#application-message'),submit=form.querySelector('button[type="submit']);
    submit.disabled=true;submit.textContent='Envoi en cours…';
    const {error}=await supabase.from('talent_applications').insert({applicant_id:state.user.id,opportunity_id:form.dataset.opportunityId,motivation:String(fd.get('motivation')||'').trim(),portfolio_url:String(fd.get('portfolio_url')||'').trim()||null});
    if(error){if(message)message.textContent=error.code==='23505'?'Vous avez déjà candidaté à cette opportunité.':error.message;submit.disabled=false;submit.textContent='Envoyer ma candidature ↗';}
    else{modalRoot.innerHTML='';toast('Candidature enregistrée.');await loadWorkspaceData();}
  }
});

app.addEventListener('submit', async (event) => {
  const form=event.target;
  if(!['profile-form','project-form','opportunity-form'].includes(form.id))return;
  event.preventDefault();
  if(!supabase||!state.user){showAuth('signin');return;}
  const fd=new FormData(form),intent=event.submitter?.value||'save',submitting=intent==='submit',buttonList=[...form.querySelectorAll('button[type="submit"]')];
  buttonList.forEach((button)=>button.disabled=true);
  const submittedAt=submitting?new Date().toISOString():null;
  try{
    let error=null;
    if(form.id==='profile-form'){
      const rawHandle=String(fd.get('handle')||'').trim().toLowerCase();
      const payload={display_name:String(fd.get('display_name')||'').trim(),handle:rawHandle,headline:String(fd.get('headline')||'').trim(),bio:String(fd.get('bio')||'').trim(),location:String(fd.get('location')||'').trim(),profile_type:String(fd.get('profile_type')||'student'),skills:toTags(fd.get('skills')),interests:toTags(fd.get('interests')),updated_at:new Date().toISOString(),...(submitting?{submission_requested_at:submittedAt}:{})};
      const query=state.ownProfile
        ? supabase.from('talent_profiles').update(payload).eq('id',state.user.id)
        : supabase.from('talent_profiles').insert({id:state.user.id,...payload});
      ({error}=await query);
    }else if(form.id==='project-form'){
      if(!state.ownProfile){throw new Error('Enregistrez d’abord votre profil avant de créer un projet.');}
      const payload={owner_id:state.user.id,title:String(fd.get('title')||'').trim(),tagline:String(fd.get('tagline')||'').trim(),description:String(fd.get('description')||'').trim(),category:String(fd.get('category')||'').trim(),stage:String(fd.get('stage')||'idée'),location:String(fd.get('location')||'').trim(),skills:toTags(fd.get('skills')),updated_at:new Date().toISOString(),...(submitting?{submission_requested_at:submittedAt}:{})};
      ({error}=await supabase.from('talent_projects').insert(payload));
    }else{
      if(!state.ownProfile){throw new Error('Enregistrez d’abord votre profil avant de proposer une opportunité.');}
      const rawDate=String(fd.get('deadline')||'');
      const external=String(fd.get('external_url')||'').trim();
      const payload={owner_id:state.user.id,title:String(fd.get('title')||'').trim(),organization:String(fd.get('organization')||'').trim(),description:String(fd.get('description')||'').trim(),category:'Opportunité communautaire',opportunity_type:String(fd.get('opportunity_type')||'autre'),location:String(fd.get('location')||'').trim(),deadline:rawDate||null,external_url:external||null,updated_at:new Date().toISOString(),...(submitting?{submission_requested_at:submittedAt}:{})};
      ({error}=await supabase.from('talent_opportunities').insert(payload));
    }
    if(error)throw error;
    toast(submitting?'Votre contribution a été envoyée à la file de validation.':'Votre contribution a été enregistrée.');
    await loadWorkspaceData();await loadPublicData();render();
  }catch(error){toast(error.message||'Enregistrement impossible.','error');buttonList.forEach((button)=>button.disabled=false);}
});

if(supabase){
  supabase.auth.onAuthStateChange((_event,session)=>{
    state.user=session?.user||null;
    Promise.resolve().then(async()=>{
      if(state.user)await loadWorkspaceData();
      else{state.ownProfile=null;state.ownProjects=[];state.ownOpportunities=[];state.ownApplications=[];}
      await loadPublicData();render();
    });
  });
  supabase.auth.getSession().then(async({data})=>{state.user=data.session?.user||null;if(state.user)await loadWorkspaceData();await loadPublicData();render();}).catch(()=>render());
}else render();
