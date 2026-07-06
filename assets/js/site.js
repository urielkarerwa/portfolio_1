  // --- theme: respect stored choice, then system preference ---
  (function(){
    var root = document.documentElement;
    var stored = null;
    try{ stored = localStorage.getItem('theme'); }catch(e){}
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    root.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if(btn){
      btn.addEventListener('click', function(){
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try{ localStorage.setItem('theme', next); }catch(e){}
      });
    }
  })();

  // --- language: EN default, FR translations swapped in place ---
  (function(){
    var root = document.documentElement;
    var FR = {
      "__title": `Uriel Karerwa — Recherche UX et conception d'interaction IA`,
      "nav_work": `Travaux`,
      "nav_email": `Courriel`,
      "seemore": `Voir plus de projets →`,
      "hero_badge": `<span class="dot" aria-hidden="true"></span>Ouvert aux postes en recherche UX, recherche-opérations et conception d'IA`,
      "hero_h1": `Je recherche et conçois la façon dont les gens <span class="accent">interagissent</span> avec les systèmes d'<span class="accent">IA</span>.`,
      "hero_sub": `Chercheur UX centré sur l'humain et guidé par les données, j'aide à personnaliser et à intégrer une IA responsable — et à concevoir de meilleurs systèmes.`,
      "hero_meta": `<span>Montréal</span><span>M. Sc. Expérience utilisateur, HEC Montréal</span><span>CAPM</span>`,
      "intro_lead": ` <span class="hl">Une bonne recherche vous fait gagner du temps</span> en réduisant le risque de dépenses excessives en refontes.`,
      "intro_em1": `Je suis un chercheur UX centré sur l'humain, fort de trois ans d'expérience dans les secteurs public, sans but lucratif et privé.`,
      "intro_em2": `Je détiens un certificat en gestion de projet (CAPM) et une maîtrise en UX, avec une formation en neurosciences et en IA centrée sur l'humain.`,
      "intro_d1": `Je mobilise tout l'éventail des méthodes qualitatives et quantitatives, en reliant les données comportementales, auto-déclarées et physiologiques pour éclairer les décisions de conception. Je m'intéresse à la conception de systèmes d'IA accessibles et responsables qui font avancer les objectifs d'affaires et résolvent de vrais problèmes humains.`,
      "intro_d2": `Découvrez une partie de mon travail ci-dessous, à commencer par mon projet de recherche de maîtrise au Tech3Lab de HEC Montréal, le plus grand laboratoire de recherche UX au Canada, où nous avons utilisé des outils de pointe, comme l'EEG et la pupillométrie, pour étudier les différences dans la façon dont les gens apprennent avec des tuteurs d'IA.`,
      "pb_cap1": `<span class="pb-dot" aria-hidden="true"></span>Présentation d'un rapport de recherche inclusive et animation d'un atelier`,
      "pb_cap2": `<span class="pb-dot" aria-hidden="true"></span>Modération d'une étude en direct depuis la salle d'observation`,
      "sh_selected": `Travaux choisis`,
      "sh_selected_count": `04 études de cas`,
      "sh_more": `Autres travaux`,
      "tag_convdesign": `Conception conversationnelle`,
      "tag_humanai": `Interaction humain–IA`,
      "tag_applied": `Recherche appliquée`,
      "tag_aiimpl": `Implémentation d'IA`,
      "tag_public": `Secteur public`,
      "tag_uxr": `Recherche UX`,
      "tag_resops": `Recherche-opérations`,
      "tag_osbl": `OSBL et secteur public`,
      "tag_usability": `Évaluation d'utilisabilité`,
      "tag_private": `Secteur privé`,
      "lbl_problem": `Le problème`,
      "lbl_did": `Ce que j'ai fait`,
      "lbl_changed": `Ce qui a changé`,
      "c1_h3": `Quelle est l'importance du style de communication d'un tuteur d'IA dans l'expérience de l'apprenant?`,
      "c1_m1": `<b>Rôle</b> Chercheur principal`,
      "c1_m2": `<b>Labo</b> Tech3Lab, HEC Montréal`,
      "c1_m3": `<b>Période</b> 2024–2026`,
      "c1_m4": `<b>Méthode</b> EEG · Pupillométrie · Comportemental · 40 participants`,
      "c1_p1": `Les tuteurs d'IA sont adoptés plus vite que quiconque n'a mesuré leur effet sur l'apprenant. Je voulais savoir si adapter la personnalité du tuteur au style d'apprentissage préféré de l'utilisateur changerait la façon dont les gens apprennent les mathématiques. Nous voulions savoir s'il y avait un changement dans l'expérience subjective, vécue et mesurée de l'utilisateur en comparant un tuteur d'IA personnalisé à un tuteur non personnalisé.`,
      "c1_p2": `Grâce à l'ingénierie des invites, j'ai créé des tuteurs qui adaptaient leur prestation à chaque apprenant : plus concrets et illustrés d'exemples pour certains, plus abstraits et axés sur les motifs pour d'autres, selon les profils d'apprenant de Felder-Silverman et entièrement intégrés dans l'invite système. Ce choix compte pour l'industrie : manipuler l'invite système ne coûte rien. Quarante participants ont suivi une séance de mathématiques entièrement menée par l'utilisateur et tutorée par l'IA, portant sur les diagrammes de Venn, les logarithmes et les paraboles, suivie d'un quiz. Nous avons enregistré les journaux d'interaction, des mesures subjectives (au moyen d'échelles validées), la pupillométrie et l'EEG.`,
      "c1_p3": `Les résultats au quiz n'ont montré aucun changement entre les conditions; les données physiologiques, en revanche, ont révélé des résultats significatifs. La dilatation pupillaire pendant le tutorat était nettement plus faible avec le tuteur personnalisé, ce qui suggère que les apprenants traitaient le même contenu avec une charge cognitive moindre, comme le corroborent les résultats EEG. Ils se sont aussi davantage engagés, sautant moins de questions et écrivant plus de notation en travaillant avec l'IA. Bien que les scores (mesures de résultat) soient restés inchangés, l'expérience d'interaction sous-jacente a pu être influencée par la personnalisation du tutorat. Pour quiconque conçoit des technologies éducatives : une expérience plus personnalisée peut faire une différence, et si l'on ne mesure que les résultats, on passe à côté de l'essentiel (les gains d'efficacité cognitive). Nos travaux ont été présentés et publiés à la conférence annuelle de la Florida AI Research Society (FLAIRS).`,
      "c1_k1": `participants · 3 séances chacun`,
      "c1_v2": `↓ Charge cognitive`,
      "c1_k2": `dilatation pupillaire et indices EEG plus faibles`,
      "c1_k3": `thêta frontal / alpha pariétal`,
      "c1_k4": `publié et présenté`,
      "c2_h3": `Usage responsable de l'IA au gouvernement : formation et sensibilisation.`,
      "c2_m1": `<b>Rôle</b> Conception et recherche UX`,
      "c2_m2": `<b>Client</b> Emploi et Développement social Canada`,
      "c2_m3": `<b>Période</b> 2024–présent`,
      "c2_m4": `<b>Méthode</b> Entrevues et sondages internes auprès des membres de l'équipe`,
      "c2_p1": `EDSC adoptait les outils d'IA plus vite que ses gens ne pouvaient les utiliser efficacement. L'équipe de la Santé mentale en milieu de travail (SMMT) voulait une IA capable d'aider les fonctionnaires à trouver beaucoup plus rapidement les services et programmes de santé mentale, sans créer de nouveaux risques ni de confusion dans un domaine sensible. <em>Elle souhaitait aussi trouver des façons d'améliorer ses propres livrables à l'aide de l'IA au sein de l'équipe SMMT, mais ne savait pas comment.</em>`,
      "c2_p2": `J'ai affiné et testé un système de génération augmentée par récupération (RAG) destiné à un large usage interne afin d'améliorer l'accès aux ressources en santé mentale. J'ai conçu des solutions personnalisées et agentielles pour accroître la productivité et rédigé des ressources de formation et des guides de référence pour aider les collègues à utiliser les outils. J'ai conseillé sur la stratégie d'implémentation de l'IA, en cohérence avec les 13 facteurs psychologiques d'un milieu de travail sain, lors des réunions du groupe d'action d'EDSC.`,
      "c2_p3": `L'équipe est passée d'une expérimentation ponctuelle à une pratique documentée. J'ai bâti une trousse de ressources et de guides de référence pour démocratiser les connaissances sur l'IA et offrir un point de départ pour l'utilisation des agents. Les exemples et cas d'usage étaient ancrés dans de vraies tâches.`,
      "c2_k1": `modules d'apprentissage personnalisés`,
      "c2_k2": `agents créés pour l'équipe`,
      "c2_k3": `système de santé mentale (RAG) testé et affiné`,
      "c2_k4": `facteurs psychologiques conseillés`,
      "c3_h3": `L'équité numérique et la conception inclusive commencent par des pratiques de recherche inclusives.`,
      "c3_m1": `<b>Rôle</b> Chef de projet, recherche-opérations`,
      "c3_m2": `<b>Partenaire</b> IncluCity × Ville de Calgary`,
      "c3_m3": `<b>Période</b> 2023–2024`,
      "c3_m4": `<b>Portée</b> 7 services · 4 groupes d'équité · 35 participants`,
      "c3_p1": `L'équipe numérique de la Ville de Calgary testait ses services numériques depuis des années, mais les testeurs n'étaient pas les personnes les plus touchées lorsque ces services échouaient. Les nouveaux arrivants, les aînés et les personnes en situation de handicap utilisant des technologies d'assistance étaient largement absents de la boucle de conception. Notre rôle chez IncluCity était de soutenir les efforts de la ville pour recruter des groupes sous-représentés aux fins de tests.`,
      "c3_p2": `À titre de gestionnaire de programme, j'ai dirigé le recrutement, la gestion de projet et la coordination des bénévoles auprès d'une vingtaine de chercheurs répartis entre les deux équipes, avec une cible de quatre groupes d'équité et huit participants chacun. Recruter des participants en situation de handicap a fait voler en éclats le plan initial : aucun de nos plus de 600 testeurs existants ne répondait à tous les critères. J'ai mis en place trois changements : un programme de recommandation avec incitatifs ouvrant un recrutement en boule de neige, le retrait d'une règle de présélection qui écartait des personnes admissibles, et un accompagnement personnalisé pour les testeurs qui ne répondaient pas aux courriels.`,
      "c3_p3": `Le projet pilote a cartographié 18 défis d'équité distincts dans sept services. Trois équipes de services municipaux ont adopté les conclusions (Loisirs, myID, Parcs), une étude de suivi sur les personnes en situation de handicap a été approuvée, et les tests combinés mobile et ordinateur pour ce même public sont devenus la norme.`,
      "c3_k1": `défis d'équité cartographiés`,
      "c3_k2": `équipes de service ayant adopté les conclusions`,
      "c3_k3": `étude de suivi approuvée`,
      "c3_k4": `participants · 4 groupes d'équité`,
      "c4_h3": `Trouver le seul bouton qui faisait dérailler un parcours de soumission d'assurance.`,
      "c4_m1": `<b>Rôle</b> Chercheur UX (équipe de 4)`,
      "c4_m2": `<b>Client</b> Beneva, avec le laboratoire UX de HEC Montréal`,
      "c4_m3": `<b>Période</b> 2025`,
      "c4_m4": `<b>Portée</b> 2 produits · 4 scénarios · 12 participants`,
      "c4_p1": `Beneva, l'un des plus grands assureurs mutualistes au Canada, voulait savoir si de vrais utilisateurs pouvaient compléter des soumissions habitation et auto aussi facilement que le prétendaient ses concurrents, et explorer pourquoi les utilisateurs pourraient ne pas terminer tout le processus de soumission.`,
      "c4_p2": `J'étais le spécialiste de la conception d'étude et de la recherche quantitative au sein de cette équipe. Nous avons recruté 12 participants ayant magasiné de l'assurance au cours de la dernière année. Nous avons évalué les parcours habitation et auto en les séparant en deux parties, formant quatre scénarios de tâches. Nous avons mené une étude observationnelle à méthodes mixtes mesurant des éléments d'échelle comme la satisfaction ainsi que des mesures comportementales et système comme l'efficacité et l'efficience, que nous avons comparées à celles des concurrents. Chaque section se terminait par une entrevue qualitative.`,
      "c4_p3": `Le parcours de modification de la soumission habitation a fait dérailler l'étude : six participants sur douze ont échoué parce que la carte de prix affichait toujours 0,00 $ et qu'ils n'ont jamais remarqué le bouton Recalculer en haut de la page. Nous l'avons signalé comme la principale catastrophe d'utilisabilité et avons livré huit correctifs priorisés avec des cotes de gravité sur lesquels l'équipe produit pouvait agir. Je ne peux pas discuter ouvertement des résultats de cette étude; je peux toutefois aborder de façon générale les méthodes et les retombées lors d'une entrevue, sur demande.`,
      "c4_k1": `bloqués sur un seul bouton caché`,
      "c4_k2": `référence SUS pour les tests futurs`,
      "c4_k3": `correctifs priorisés livrés`,
      "c4_k4": `de réussite sur le parcours défaillant`,
      "cap_thesis": `Lire la thèse complète <span class="ar">↗</span>`,
      "cap_conf": `Publication de conférence <span class="ar">↗</span>`,
      "cap_deck": `Télécharger la présentation <span class="ar">↗</span>`,
      "cap_casestudy": `Lire l'étude de cas complète <span class="ar">↗</span>`,
      "cap_fairentry": `Service Fair Entry <span class="ar">↗</span>`,
      "cap_ask": `Posez-moi des questions sur ce projet <span class="ar">✉</span>`,
      "cap_live": `Site Web en ligne <span class="ar">↗</span>`,
      "lock_view": `Verrouillé — contactez-moi pour voir`,
      "mw1_tag": `Implémentation d'IA · Conception de processus`,
      "mw1_t": `<span class="arr">→</span>Automatisations de la chaire de recherche SEXODEV`,
      "mw1_p": `Conception de flux pilotés par l'IA transformant les enregistrements de réunions en tâches assignées et en documentation classée pour une équipe de recherche à distance à l'UQAM, avec un espace Notion comme source unique de vérité.`,
      "mw2_tag": `Conception de services · Architecture d'information`,
      "mw2_t": `<span class="arr">→</span>Refonte SharePoint du Wellness Gym d'EDSC`,
      "mw2_p": `Animation d'entrevues et de deux rondes de tests d'arborescence pour reconstruire l'architecture d'information d'un carrefour de santé mentale en milieu de travail desservant plus de 40 000 fonctionnaires dans les deux langues officielles.`,
      "mw3_tag": `Recherche-opérations`,
      "mw3_t": `<span class="arr">→</span>Cadre de recherche-opérations d'IncluCity`,
      "mw3_p": `Mise en place de l'ossature opérationnelle d'une société de recherche inclusive : intégration des participants, formation et gestion des données, soutenant plus de 50 chercheurs et plus de 140 entrevues.`,
      "mw4_tag": `Recherche UX · Produit d'IA`,
      "mw4_t": `<span class="arr">→</span>Évaluation de l'assistant d'achat Weever.ai`,
      "mw4_p": `Évaluation d'utilisabilité à méthodes mixtes d'un assistant d'achat grand public propulsé par l'IA, révélant des obstacles de confiance et de clarté dans une expérience de commerce conversationnel.`,
      "foot_big": `Discutons. <a href="mailto:karerwau@gmail.com">karerwau@gmail.com</a>`,
      "foot_colophon": `Uriel Karerwa · Recherche UX et conception d'interaction IA · Conçu en 2026`
    };
    var cacheEN = {};
    function apply(lang){
      var nodes = document.querySelectorAll('[data-t]');
      for(var i=0;i<nodes.length;i++){
        var el = nodes[i], k = el.getAttribute('data-t');
        if(!(k in cacheEN)) cacheEN[k] = el.innerHTML;
        if(lang === 'fr'){ if(FR[k] != null) el.innerHTML = FR[k]; }
        else { el.innerHTML = cacheEN[k]; }
      }
      if(!('__title' in cacheEN)) cacheEN.__title = document.title;
      document.title = (lang === 'fr' && FR.__title) ? FR.__title : cacheEN.__title;
      root.setAttribute('lang', lang);
      var btn = document.getElementById('lang-toggle');
      if(btn){
        btn.textContent = lang === 'fr' ? 'EN' : 'FR';
        btn.setAttribute('aria-label', lang === 'fr' ? 'Switch to English' : 'Passer en français');
      }
      try{ localStorage.setItem('lang', lang); }catch(e){}
    }
    var stored = null;
    try{ stored = localStorage.getItem('lang'); }catch(e){}
    var initial = stored || (((navigator.language || navigator.userLanguage || '').toLowerCase().indexOf('fr') === 0) ? 'fr' : 'en');
    apply(initial);
    var btn = document.getElementById('lang-toggle');
    if(btn){
      btn.addEventListener('click', function(){
        apply(root.getAttribute('lang') === 'fr' ? 'en' : 'fr');
      });
    }
  })();

  // --- signal trace: a quiet EEG-style waveform, generated once ---
  (function(){
    var path = document.getElementById('trace');
    if(!path) return;
    var W = 1080, H = 84, mid = H/2, n = 540, step = W/n;
    var d = 'M 0 ' + mid;
    var seed = 7;
    function rnd(){ seed = (seed*9301+49297)%233280; return seed/233280; }
    for(var i=1;i<=n;i++){
      var x = i*step;
      // baseline drift + occasional spikes, like a clean readout
      var base = Math.sin(i*0.06)*4 + Math.sin(i*0.013)*3;
      var spike = 0;
      if(rnd() > 0.965){ spike = (rnd()-0.5) * 46; }
      var y = mid - base - spike;
      d += ' L ' + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    path.setAttribute('d', d);

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // subtle draw-in animation unless reduced motion
    if(!reduce){
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.getBoundingClientRect();
      path.style.transition = 'stroke-dashoffset 2.2s ease-out';
      path.style.strokeDashoffset = '0';
    }

    // a pulse riding the waveform — pauses when off-screen, off on reduced motion
    var pulse = document.getElementById('trace-pulse');
    if(pulse && !reduce && typeof path.getPointAtLength === 'function'){
      var total = path.getTotalLength();
      var band = path.closest('.trace-band');
      var visible = true, last = 0, dist = 0, speed = total/9000; // px of path per ms
      pulse.style.display = 'block';
      if('IntersectionObserver' in window && band){
        new IntersectionObserver(function(es){ visible = es[0].isIntersecting; })
          .observe(band);
      }
      function frame(ts){
        if(!last) last = ts;
        var dt = ts - last; last = ts;
        if(visible){
          dist = (dist + dt*speed) % total;
          var pt = path.getPointAtLength(dist);
          pulse.setAttribute('cx', pt.x); pulse.setAttribute('cy', pt.y);
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
  })();

  // --- reveal on scroll (staggered for grouped children) ---
  (function(){
    var els = document.querySelectorAll('.reveal');
    if(!('IntersectionObserver' in window)){ els.forEach(function(e){e.classList.add('in')}); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    },{threshold:0.12});
    els.forEach(function(e){ io.observe(e); });
  })();

  // --- scroll progress bar + condensed sticky header ---
  (function(){
    var bar = document.getElementById('progress');
    var header = document.getElementById('site-header');
    function onScroll(){
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? h.scrollTop / max : 0;
      if(bar) bar.style.transform = 'scaleX(' + p + ')';
      if(header) header.classList.toggle('scrolled', h.scrollTop > 12);
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  })();

  // --- active nav highlight ---
  (function(){
    var sections = [].slice.call(document.querySelectorAll('[id="work"]'));
    var workLink = document.querySelector('nav a[href="#work"]');
    if(!workLink || !sections.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ workLink.classList.toggle('active', en.isIntersecting); });
    },{rootMargin:'-40% 0px -55% 0px'});
    sections.forEach(function(s){ io.observe(s); });
  })();
