/* ================================================================
   HEMMELAND SPORTS - main.js v3
   Loader, scroll animations, nav, counters, carousel with dots
   ================================================================ */
(function(){
  'use strict';

  /* --- Refs --- */
  var header    = document.getElementById('header');
  var burger    = document.getElementById('burger');
  var nav       = document.getElementById('mainNav');
  var loader    = document.getElementById('loader');
  var mobileCta = document.getElementById('mobileCta');
  var anims     = document.querySelectorAll('.anim');
  var reveals   = document.querySelectorAll('.reveal');

  /* --- Loader --- */
  window.addEventListener('load', function(){
    setTimeout(function(){
      loader.classList.add('done');
      setTimeout(triggerHeroReveals, 300);
    }, 1100);
  });
  /* Failsafe: always dismiss loader after 4s even if resources fail */
  setTimeout(function(){
    if(loader && !loader.classList.contains('done')){
      loader.classList.add('done');
      setTimeout(triggerHeroReveals, 300);
    }
  }, 4000);

  function triggerHeroReveals(){
    reveals.forEach(function(el){
      var d = parseInt(el.getAttribute('data-delay') || 0, 10);
      setTimeout(function(){
        el.classList.add('visible');
      }, d * 180);
    });
  }

  /* --- Burger / Mobile Nav --- */
  burger.addEventListener('click', function(){
    var open = nav.classList.toggle('open');
    burger.classList.toggle('active');
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      nav.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded','false');
      document.body.style.overflow = '';
    });
  });

  /* --- Header scroll --- */
  function onScroll(){
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 60);
    if(mobileCta){
      mobileCta.classList.toggle('visible', y > window.innerHeight * 0.6);
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* --- Scroll animations (IntersectionObserver) --- */
  if('IntersectionObserver' in window){
    var animObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('visible');
          animObs.unobserve(e.target);
        }
      });
    },{threshold:0.08, rootMargin:'0px 0px -40px 0px'});
    anims.forEach(function(el){ animObs.observe(el); });
  } else {
    anims.forEach(function(el){ el.classList.add('visible'); });
  }

  /* --- Counter animation --- */
  var counted = false;
  function animateCounters(){
    if(counted) return;
    counted = true;
    document.querySelectorAll('[data-count]').forEach(function(el){
      var target = parseInt(el.getAttribute('data-count'),10);
      var dur = 2000;
      var start = null;
      function step(ts){
        if(!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        /* Spring-like easing */
        var ease = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.floor(ease * target) + '+';
        if(p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  var statsEl = document.querySelector('.hero-stats');
  if(statsEl && 'IntersectionObserver' in window){
    var cObs = new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting){ animateCounters(); cObs.disconnect(); }
    },{threshold:0.5});
    cObs.observe(statsEl);
  }

  /* --- Smooth scroll --- */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var href = a.getAttribute('href');
      if(href === '#') return;
      var target = document.querySelector(href);
      if(target){
        e.preventDefault();
        var offset = header.offsetHeight + 16;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({top:top, behavior:'smooth'});
      }
    });
  });

  /* --- Reviews Carousel with dots --- */
  var track = document.getElementById('reviewsTrack');
  var prevBtn = document.getElementById('reviewsPrev');
  var nextBtn = document.getElementById('reviewsNext');
  var dotsContainer = document.getElementById('carouselDots');

  if(track && prevBtn && nextBtn){
    var slides = track.querySelectorAll('.review-slide');
    var slideCount = slides.length;
    var currentSlide = 0;

    /* Create dots */
    if(dotsContainer){
      for(var i = 0; i < slideCount; i++){
        var dot = document.createElement('span');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('data-index', i);
        dotsContainer.appendChild(dot);
        dot.addEventListener('click', function(){
          stopAuto();
          var idx = parseInt(this.getAttribute('data-index'));
          scrollToSlide(idx);
        });
      }
    }

    function scrollToSlide(idx){
      if(idx < 0) idx = 0;
      if(idx >= slideCount) idx = 0;
      currentSlide = idx;
      var slide = slides[idx];
      var trackRect = track.getBoundingClientRect();
      var slideRect = slide.getBoundingClientRect();
      var scrollTarget = track.scrollLeft + (slideRect.left - trackRect.left) - 20;
      track.scrollTo({left: scrollTarget, behavior:'smooth'});
      updateDots();
    }

    function updateDots(){
      if(!dotsContainer) return;
      var dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach(function(d, i){
        d.classList.toggle('active', i === currentSlide);
      });
    }

    /* Update active dot on scroll */
    track.addEventListener('scroll', function(){
      var trackLeft = track.scrollLeft;
      var closest = 0;
      var closestDist = Infinity;
      slides.forEach(function(slide, i){
        var dist = Math.abs(slide.offsetLeft - trackLeft - 20);
        if(dist < closestDist){
          closestDist = dist;
          closest = i;
        }
      });
      if(closest !== currentSlide){
        currentSlide = closest;
        updateDots();
      }
    }, {passive:true});

    /* Auto-scroll */
    var autoInterval = setInterval(function(){
      currentSlide++;
      if(currentSlide >= slideCount) currentSlide = 0;
      scrollToSlide(currentSlide);
    }, 4500);

    function stopAuto(){ clearInterval(autoInterval); }

    prevBtn.addEventListener('click', function(){
      stopAuto();
      currentSlide = Math.max(0, currentSlide - 1);
      scrollToSlide(currentSlide);
    });
    nextBtn.addEventListener('click', function(){
      stopAuto();
      currentSlide++;
      if(currentSlide >= slideCount) currentSlide = 0;
      scrollToSlide(currentSlide);
    });

    /* Drag to scroll */
    var isDragging=false, startX=0, scrollStart=0;
    track.addEventListener('mousedown',function(e){ isDragging=true; startX=e.pageX; scrollStart=track.scrollLeft; track.classList.add('dragging'); stopAuto(); });
    track.addEventListener('mousemove',function(e){ if(!isDragging) return; e.preventDefault(); track.scrollLeft=scrollStart-(e.pageX-startX); });
    track.addEventListener('mouseup',function(){ isDragging=false; track.classList.remove('dragging'); });
    track.addEventListener('mouseleave',function(){ isDragging=false; track.classList.remove('dragging'); });
    /* Touch */
    track.addEventListener('touchstart',function(e){ startX=e.touches[0].pageX; scrollStart=track.scrollLeft; stopAuto(); },{passive:true});
    track.addEventListener('touchmove',function(e){ track.scrollLeft=scrollStart-(e.touches[0].pageX-startX); },{passive:true});
  }

  /* --- Parallax subtle effect on non-mobile --- */
  if(window.innerWidth > 768){
    var pImg = document.querySelector('.parallax-img');
    if(pImg){
      window.addEventListener('scroll', function(){
        var rect = pImg.parentElement.getBoundingClientRect();
        if(rect.bottom > 0 && rect.top < window.innerHeight){
          var pct = (rect.top / window.innerHeight);
          pImg.style.transform = 'translateY(' + (pct * 30) + 'px)';
        }
      },{passive:true});
    }
  }


/* --- AI Chatbot --- */
  var chatBtn = document.getElementById('chatbotBtn');
  var chatPanel = document.getElementById('chatbotPanel');
  var chatClose = document.getElementById('chatbotClose');
  var chatInput = document.getElementById('chatbotInput');
  var chatSend = document.getElementById('chatbotSend');
  var chatMessages = document.getElementById('chatbotMessages');

  if(chatBtn && chatPanel){
    chatBtn.addEventListener('click', function(){
      chatPanel.classList.add('open');
      chatBtn.classList.add('hidden');
      chatInput.focus();
    });
    chatClose.addEventListener('click', function(){
      chatPanel.classList.remove('open');
      chatBtn.classList.remove('hidden');
    });

    function sendMessage(){
      var text = chatInput.value.trim();
      if(!text) return;

      /* Add user message */
      var userMsg = document.createElement('div');
      userMsg.className = 'chatbot-msg chatbot-msg--user';
      userMsg.innerHTML = '<p>' + escapeHtml(text) + '</p>';
      chatMessages.appendChild(userMsg);
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;

      /* Show loading */
      var loading = document.createElement('div');
      loading.className = 'chatbot-msg chatbot-msg--loading';
      loading.innerHTML = '<div class="chatbot-dots"><span></span><span></span><span></span></div>';
      chatMessages.appendChild(loading);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      /* Generate response */
      setTimeout(function(){
        chatMessages.removeChild(loading);
        var reply = generateReply(text.toLowerCase());
        var botMsg = document.createElement('div');
        botMsg.className = 'chatbot-msg chatbot-msg--bot';
        botMsg.innerHTML = '<p>' + reply + '</p>';
        chatMessages.appendChild(botMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 800 + Math.random() * 600);
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', function(e){
      if(e.key === 'Enter') sendMessage();
    });

    function escapeHtml(t){
      var d = document.createElement('div');
      d.textContent = t;
      return d.innerHTML;
    }

    function generateReply(q){
      var hour = new Date().getHours();
      var isEvening = hour >= 19 || hour < 7;
      var whatsappNote = isEvening ? '<br><br>Het is nu buiten kantooruren. Stuur gerust een <a href="https://wa.me/31617840812" target="_blank">WhatsApp-berichtje</a> naar Bas - hij reageert altijd snel!' : '';

      if(q.match(/prijs|tarief|kost|euro|betaal|geld|duur/)){
        return 'Personal training kost \u20ac49,50 per sessie (1x per week) of \u20ac42,50 per sessie bij 2x per week. Training op locatie is \u20ac62,50. Elk traject start met een gratis kennismakingsgesprek!' + whatsappNote;
      }
      if(q.match(/proefles|proberen|kennisma|gratis|uitprobe|start|beginnen|inschrijv/)){
        return 'Leuk dat je interesse hebt! Neem contact op met Bas via <a href="https://wa.me/31617840812" target="_blank">WhatsApp</a> of bel 06 1784 0812 om een gratis en vrijblijvende proefles in te plannen. Bas reageert altijd snel!' + whatsappNote;
      }
      if(q.match(/waar|locatie|adres|hemmeland|monnickendam|route|parkeer/)){
        return 'Bas traint op het Hemmeland in Monnickendam (Hemmeland 12, 1141 AT). Een prachtige locatie direct aan de Gouwzee. Je kiest zelf: buiten aan het water of binnen in de studio. Er is ruime parkeergelegenheid.' + whatsappNote;
      }
      if(q.match(/tijd|wanneer|open|beschikbaar|uur|agenda|afspraak|plan/)){
        return 'Bas is beschikbaar van maandag t/m vrijdag 07:00-21:00 en zaterdag 08:00-13:00. Trainingstijden worden in overleg gepland. Neem contact op om een moment te vinden dat past.' + whatsappNote;
      }
      if(q.match(/buiten|outdoor|weer|studio|binnen|regen/)){
        return 'Je kiest zelf: buiten trainen op het Hemmeland aan de Gouwzee, of binnen in de studio op dezelfde locatie. Veel clienten wisselen af naar wat ze die dag willen. Bas traint het hele jaar door op beide plekken.';
      }
      if(q.match(/45|ouder|leeftijd|senior|pensioen|oud/)){
        return 'Bas traint mensen van alle leeftijden. Er zijn speciale 45+ trainingen met focus op krachtbehoud, mobiliteit en vitaliteit. Altijd veilig en volledig afgestemd op jouw niveau en belastbaarheid.';
      }
      if(q.match(/voeding|eten|dieet|afvallen|gewicht|kilo|supplementen/)){
        return 'Bas is gecertificeerd voedingsdeskundige en heeft veel kennis over voeding en supplementen. Voedingsadvies kan onderdeel zijn van je trainingstraject, of apart worden afgenomen.';
      }
      if(q.match(/ervaring|diploma|certificaat|opleiding|gekwalificeerd/)){
        return 'Bas heeft 20+ jaar ervaring en is gediplomeerd als Fit!Vak Fitness Trainer, Fit!Vak Personal Trainer, Voedingsdeskundige en Lifecoach. Hij investeert continu in nieuwe methodes en materialen.';
      }
      if(q.match(/annuleer|afzeg|cancel|verzet/)){
        return 'Afspraken kunnen tot 24 uur van tevoren kosteloos worden geannuleerd. Bij te late afzegging wordt de gereserveerde tijd in rekening gebracht.';
      }
      if(q.match(/bas|trainer|wie is|over hem/)){
        return 'Bas van Kalken is de personal trainer achter Hemmeland Sports. Met 20+ jaar ervaring combineert hij vakkennis in fitness, voeding en coaching met oprechte persoonlijke aandacht. Clienten beschrijven hem als betrouwbaar, bevlogen, invoelend en analytisch.';
      }
      if(q.match(/contact|bel|mail|whatsapp|telefoon|bereik/)){
        return 'Je bereikt Bas via <a href="https://wa.me/31617840812" target="_blank">WhatsApp</a> (snelste manier!), telefoon (06 1784 0812) of e-mail (info@hemmelandsports.nl). Bas reageert altijd snel op berichten.' + whatsappNote;
      }
      if(q.match(/rug|knie|blessure|operatie|herstel|pijn|schouder|heup/)){
        return 'Bas heeft veel ervaring met training na blessures of operaties. Hij let nauwkeurig op belastbaarheid en stemt alles persoonlijk af. Meerdere clienten zijn door zijn aanpak van klachten afgekomen. Bespreek het gerust in een vrijblijvend kennismakingsgesprek.' + whatsappNote;
      }
      if(q.match(/kracht|spier|sterk|fit|train|soort|type|wat voor/)){
        return 'Bij Bas kun je kiezen uit krachttraining, kettlebell workouts, bokstraining, crossfit-stijl of een combinatie. Je werkt met kettlebells, halters, dumbbells, slamballs, sandbags en eigen lichaamsgewicht. Elke training is anders en volledig op maat.';
      }
      if(q.match(/groep|samen|duo|vriend/)){
        return 'Bas biedt voornamelijk een-op-een personal training aan. Wil je samen met iemand trainen? Neem contact op om de mogelijkheden te bespreken.' + whatsappNote;
      }
      if(q.match(/review|ervaring|andere|resultaat|succesverhaal/)){
        return 'Bas scoort een 4.9 op Google en heeft clienten die al meer dan 15 jaar bij hem trainen. Scroll naar boven om de ervaringen van Marcel, Erik, Dix en andere clienten te lezen!';
      }
      if(q.match(/gouwzee|water|zwem|zomer/)){
        return 'Het Hemmeland ligt direct aan de Gouwzee met uitzicht op Marken. In de zomer kun je na je training zo het water induiken! Het is een unieke trainingslocatie die je nergens anders vindt.';
      }
      if(q.match(/hoi|hallo|hey|goedemor|goedemid|goedena|hi |dag /)){
        return 'Hoi! Leuk dat je interesse hebt in Hemmeland Sports. Wat wil je weten? Ik kan je helpen met informatie over trainingen, tarieven, locatie, Bas en meer.' + whatsappNote;
      }
      if(q.match(/dank|bedankt|thanks|top|mooi/)){
        return 'Graag gedaan! Wil je nog iets anders weten? Of neem direct contact op met Bas via <a href="https://wa.me/31617840812" target="_blank">WhatsApp</a> - hij helpt je graag persoonlijk verder.';
      }
      return 'Goede vraag! Voor een persoonlijk antwoord kun je het beste contact opnemen met Bas via <a href="https://wa.me/31617840812" target="_blank">WhatsApp</a> of bel 06 1784 0812. Bas reageert altijd snel en helpt je graag verder!' + whatsappNote;
    }  }

})();
