document.documentElement.classList.add("js-enabled");

const menuBtn=document.querySelector(".menu-btn");
const navLinks=document.querySelector(".nav-links");
if(menuBtn&&navLinks){menuBtn.addEventListener("click",()=>{const open=navLinks.classList.toggle("open");menuBtn.setAttribute("aria-expanded",open?"true":"false")});navLinks.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>navLinks.classList.remove("open")));}

const current=location.pathname.split("/").pop()||"index.html";
document.querySelectorAll(".nav-links a").forEach(a=>{const href=(a.getAttribute("href")||"").split("/").pop().split("#")[0];if(href===current)a.classList.add("active");});

const items=document.querySelectorAll(".reveal");
if("IntersectionObserver" in window){const io=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");io.unobserve(entry.target);}})},{threshold:.08});items.forEach((el,i)=>{el.style.transitionDelay=Math.min(i*35,250)+"ms";io.observe(el);});}else{items.forEach(el=>el.classList.add("visible"));}

document.querySelectorAll("[data-year]").forEach(el=>el.textContent=new Date().getFullYear());

const header=document.querySelector(".site-header");
const onScroll=()=>{if(header)header.classList.toggle("scrolled",window.scrollY>12)};
window.addEventListener("scroll",onScroll,{passive:true});onScroll();

document.querySelectorAll(".stat strong").forEach(el=>{const raw=el.textContent.trim();const match=raw.match(/^(\d+)(.*)$/);if(!match)return;const target=parseInt(match[1],10),suffix=match[2];el.textContent="0"+suffix;const obs=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)return;let startTime=null;const duration=900;const tick=t=>{if(!startTime)startTime=t;const p=Math.min((t-startTime)/duration,1),eased=1-Math.pow(1-p,3);el.textContent=Math.floor(target*eased)+suffix;if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick);obs.disconnect();},{threshold:.7});obs.observe(el);});

(function(){
 const slider=document.querySelector("[data-hero-slider]");
 if(slider){
   const slides=[...slider.querySelectorAll(".hero-slide")],
     dots=[...slider.querySelectorAll("[data-hero-dot]")],
     next=slider.querySelector("[data-hero-next]"),
     prev=slider.querySelector("[data-hero-prev]");
   let index=0,timer;
   const show=n=>{
     index=(n+slides.length)%slides.length;
     slides.forEach((x,i)=>x.classList.toggle("is-active",i===index));
     dots.forEach((x,i)=>x.classList.toggle("is-active",i===index));
   };
   const restart=()=>{
     clearInterval(timer);
     timer=setInterval(()=>show(index+1),5200);
   };
   next?.addEventListener("click",()=>{show(index+1);restart()});
   prev?.addEventListener("click",()=>{show(index-1);restart()});
   dots.forEach(d=>d.addEventListener("click",()=>{show(Number(d.dataset.heroDot));restart()}));
   slider.addEventListener("mouseenter",()=>clearInterval(timer));
   slider.addEventListener("mouseleave",restart);
   show(0); restart();
 }

 const cfg=window.SITE_CONFIG||{};
 const form=document.querySelector("#appointmentForm");

 if(form){
   const sheetsEndpoint=(cfg.GOOGLE_SHEETS_ENDPOINT||"").trim();
   const submitBtn=form.querySelector("#appointmentSubmit");
   const status=form.querySelector("#appointmentStatus");

   form.querySelectorAll("label[for]").forEach(label=>{
     label.addEventListener("click",()=>{
       const field=document.getElementById(label.htmlFor);
       if(field && field !== document.activeElement) field.focus();
     });
   });

   const showStatus=(message,type)=>{
     if(!status)return;
     status.textContent=message;
     status.className="form-status "+(type||"");
   };

   const setBusy=busy=>{
     if(!submitBtn)return;
     submitBtn.disabled=busy;
     submitBtn.setAttribute("aria-busy",busy?"true":"false");
     submitBtn.textContent=busy?"Submitting…":"Send Appointment Request →";
   };

   form.addEventListener("submit",async e=>{
     e.preventDefault();
     if(!form.checkValidity()){
       form.classList.add("form-invalid");
       showStatus("Please complete all required fields correctly.","error");
       form.querySelector(":invalid")?.focus();
       return;
     }
     form.classList.remove("form-invalid");
     if(!sheetsEndpoint || sheetsEndpoint.includes("PASTE_GOOGLE")){
       showStatus("Google Sheets is not connected yet. Add the Apps Script Web App URL in js/site-config.js.","error");
       return;
     }
     const data=Object.fromEntries(new FormData(form).entries());
     delete data._subject; delete data._template; delete data._captcha; delete data._replyto; delete data._honey;
     setBusy(true);
     showStatus("Submitting your appointment request…","");
     try{
       const body=new URLSearchParams(data);
       await fetch(sheetsEndpoint,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body});
       form.reset();
       showStatus("Thank you. Your appointment request has been submitted successfully. The clinic team will contact you.","success");
     }catch(err){
       console.error("Google Sheets appointment form error:",err);
       showStatus("We could not submit your request. Please try again or contact the clinic directly.","error");
     }finally{ setBusy(false); }
   });

   form.querySelectorAll("input, select, textarea").forEach(field=>{
     field.addEventListener("input",()=>field.classList.remove("field-error"));
     field.addEventListener("change",()=>field.classList.remove("field-error"));
   });
 }

 document.querySelectorAll(".video-frame video").forEach(video=>{
   if(!video.src){
     video.src=(location.pathname.includes("/blog/")?"../":"")+"videos/doctor-urology-procedure.mp4";
   }
   video.addEventListener("loadeddata",()=>video.closest(".video-frame")?.classList.add("has-video"),{once:true});
 });
})();;


/* =========================================================
   AVIDA-STYLE MOTION CONTROLLER
   ========================================================= */
(function motionController(){
  const reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('page-ready');
  if(reduce) return;

  // Scroll progress bar.
  const updateProgress=()=>{
    const max=document.documentElement.scrollHeight-window.innerHeight;
    const progress=max>0?Math.min(window.scrollY/max,1):0;
    document.documentElement.style.setProperty('--scroll-progress',progress.toFixed(4));
  };
  window.addEventListener('scroll',updateProgress,{passive:true});
  updateProgress();

  // Animate section headings as a unit.
  const heads=document.querySelectorAll('.section-head');
  const headObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-animated');headObserver.unobserve(entry.target);}
    });
  },{threshold:.18});
  heads.forEach(h=>headObserver.observe(h));

  // Add cinematic reveal classes to important blocks when not explicitly tagged.
  const autoReveal=document.querySelectorAll('.service-card,.blog-card,.process .card,.timing-card,.contact-item,.gallery-item,.cta,.stat-strip,.about-photo,.video-card');
  autoReveal.forEach((el,i)=>{
    if(!el.classList.contains('reveal')) el.classList.add('reveal');
    el.style.transitionDelay=Math.min((i%7)*70,420)+'ms';
  });
  const reveals=document.querySelectorAll('.reveal');
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}
    });
  },{threshold:.12,rootMargin:'0px 0px -5% 0px'});
  reveals.forEach(el=>revealObserver.observe(el));

  // Image curtain reveal.
  document.querySelectorAll('.service-photo,.blog-cover-img,.about-photo,.gallery-item,.hero-photo').forEach(el=>el.classList.add('image-reveal'));
  const imageObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');imageObserver.unobserve(entry.target);}
    });
  },{threshold:.16});
  document.querySelectorAll('.image-reveal').forEach(el=>imageObserver.observe(el));

  // Mouse-follow glow on cards.
  document.querySelectorAll('.card,.service-card,.blog-card,.timing-card').forEach(card=>{
    const glow=document.createElement('span');
    glow.className='card-glow';
    card.appendChild(glow);
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
      card.style.setProperty('--my',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
    },{passive:true});
  });

  // Subtle 3D tilt on larger screens.
  if(window.matchMedia('(min-width: 951px)').matches){
    document.querySelectorAll('.service-card,.blog-card,.process .card').forEach(card=>{
      let raf=0;
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        cancelAnimationFrame(raf);
        raf=requestAnimationFrame(()=>{
          card.style.transform=`perspective(900px) rotateX(${(-y*3).toFixed(2)}deg) rotateY(${(x*3).toFixed(2)}deg) translateY(-7px)`;
        });
      });
      card.addEventListener('pointerleave',()=>{
        cancelAnimationFrame(raf);
        card.style.transform='';
      });
    });
  }

  // Lightweight parallax for decorative/marked elements.
  const parallaxItems=[...document.querySelectorAll('[data-parallax]')];
  if(parallaxItems.length){
    let ticking=false;
    const parallax=()=>{
      const vh=window.innerHeight;
      parallaxItems.forEach(el=>{
        const r=el.getBoundingClientRect();
        if(r.bottom<0||r.top>vh) return;
        const speed=parseFloat(el.dataset.parallax||'.12');
        const offset=(r.top-vh/2)*speed*-1;
        el.style.transform=`translate3d(0,${offset.toFixed(1)}px,0)`;
      });
      ticking=false;
    };
    window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(parallax);ticking=true;}},{passive:true});
    parallax();
  }

  // Smooth same-page navigation with header offset.
  document.querySelectorAll('a[href*="#"]').forEach(link=>{
    link.addEventListener('click',e=>{
      const href=link.getAttribute('href');
      if(!href || href==='#') return;
      const hash=href.substring(href.indexOf('#'));
      const target=document.querySelector(hash);
      if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'',hash);}
    });
  });
})();


/* Ambient premium motion */
(function ambientMotion(){
  const reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;
  document.querySelectorAll('.visual-band').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      el.style.setProperty('--mx',`${50+x*12}%`); el.style.setProperty('--my',`${50+y*12}%`);
    },{passive:true});
  });
})();

/* =========================================================
   CINEMATIC SCROLL STORY ENGINE
   ========================================================= */
(function cinematicScroll(){
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;
  const items=[...document.querySelectorAll('.cinematic-band,.editorial,.impact-main,.impact-box,.service-rail .rail-item')];
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('scroll-in');
        io.unobserve(entry.target);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  items.forEach(el=>io.observe(el));

  let ticking=false;
  const parallax=()=>{
    document.querySelectorAll('.cinematic-band').forEach(section=>{
      const r=section.getBoundingClientRect();
      if(r.bottom<0||r.top>innerHeight) return;
      const amount=(r.top-innerHeight*.5)*-0.035;
      section.style.setProperty('--parallax-y',amount.toFixed(1)+'px');
    });
    ticking=false;
  };
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(parallax);ticking=true;}},{passive:true});
  parallax();
})();


/* =========================================================
   AUTO-PLAYING VIDEO STORY CAROUSEL + AUDIO
   ========================================================= */
(function videoStoryCarousel(){
  const root=document.querySelector('[data-video-carousel]');
  if(!root) return;

  const cards=[...root.querySelectorAll('[data-video-card]')];
  const videos=cards.map(card=>card.querySelector('video'));
  const dots=[...root.querySelectorAll('[data-video-dot]')];
  const prev=root.querySelector('[data-video-prev]');
  const next=root.querySelector('[data-video-next]');
  const soundToggle=document.querySelector('[data-video-sound]');
  const soundLabel=document.querySelector('[data-video-sound-label]');
  const soundIcon=soundToggle?.querySelector('.video-sound-icon');
  const fullscreenButtons=[...root.querySelectorAll('[data-video-fullscreen]')];
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let active=0;
  let started=false;
  let soundEnabled=false;
  let userHasInteracted=false;
  let transitionToken=0;

  const normalize=(n)=>((n%cards.length)+cards.length)%cards.length;

  function relativePosition(index){
    let d=index-active;
    const total=cards.length;
    if(d>total/2) d-=total;
    if(d<-total/2) d+=total;
    return d;
  }

  function paint(){
    cards.forEach((card,i)=>{
      const pos=relativePosition(i);
      if(pos>=-2 && pos<=2) card.dataset.pos=String(pos+2);
      else card.removeAttribute('data-pos');
      card.setAttribute('aria-current',i===active?'true':'false');
      card.dataset.playing=(i===active && !videos[i].paused)?'true':'false';
    });
    dots.forEach((dot,i)=>dot.classList.toggle('is-active',i===active));
  }

  function isFullscreen(){
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  async function openVideoFullscreen(index){
    const video=videos[index];
    const card=cards[index];
    if(!video || !card) return;
    userHasInteracted=true;
    if(index!==active) goTo(index,false);
    stopAll();
    video.controls=true;
    video.muted=false;
    video.volume=1;
    soundEnabled=true;
    updateSoundUI();
    try{
      if(video.requestFullscreen) await video.requestFullscreen();
      else if(video.webkitEnterFullscreen) video.webkitEnterFullscreen();
      else if(card.requestFullscreen) await card.requestFullscreen();
    }catch(_){
      // Some mobile browsers expose their own native fullscreen API.
    }
    try{ await video.play(); }catch(_){
      // Native fullscreen controls can still be used to start playback.
    }
    paint();
  }

  function handleFullscreenChange(){
    const activeVideo=videos[active];
    if(isFullscreen()){
      activeVideo?.setAttribute('controls','controls');
      if(activeVideo){ activeVideo.muted=false; activeVideo.volume=1; activeVideo.play().catch(()=>{}); }
      soundEnabled=true;
      updateSoundUI();
    }else{
      videos.forEach(v=>{ v.controls=false; v.muted=true; });
      soundEnabled=false;
      updateSoundUI();
      if(started) playActive();
    }
    paint();
  }

  function updateSoundUI(){
    if(!soundToggle) return;
    soundToggle.classList.toggle('is-on',soundEnabled);
    soundToggle.setAttribute('aria-pressed',String(soundEnabled));
    if(soundIcon) soundIcon.textContent=soundEnabled?'🔊':'🔇';
    if(soundLabel) soundLabel.textContent=soundEnabled?'Sound on · Voice enabled':'Sound off · Tap to enable';
  }

  function stopAll(){
    videos.forEach(video=>{
      video.pause();
      video.removeAttribute('data-playing');
    });
  }

  async function playActive(){
    const video=videos[active];
    if(!video) return;
    stopAll();
    video.playsInline=true;
    video.muted=!soundEnabled;
    video.volume=1;
    try{
      await video.play();
    }catch(err){
      // Browser autoplay policy may block sound. Fall back to muted autoplay and keep the sound control visible.
      video.muted=true;
      soundEnabled=false;
      updateSoundUI();
      try{await video.play();}catch(_){/* user can tap the card */}
    }
    paint();
  }

  function goTo(index,autoplay=true){
    const token=++transitionToken;
    active=normalize(index);
    paint();
    if(autoplay){
      window.requestAnimationFrame(()=>{
        if(token===transitionToken) playActive();
      });
    }
  }

  function enableSound(){
    userHasInteracted=true;
    soundEnabled=!soundEnabled;
    updateSoundUI();
    const video=videos[active];
    if(video){
      video.muted=!soundEnabled;
      if(video.paused) playActive();
      else video.play().catch(()=>{});
    }
    paint();
  }

  fullscreenButtons.forEach((button,i)=>{
    button.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      openVideoFullscreen(i);
    });
  });

  document.addEventListener('fullscreenchange',handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange',handleFullscreenChange);

  soundToggle?.addEventListener('click',e=>{
    e.preventDefault();
    enableSound();
  });

  cards.forEach((card,i)=>{
    const video=videos[i];
    video.setAttribute('playsinline','');
    video.preload=i===0?'auto':'metadata';

    card.addEventListener('click',()=>{
      userHasInteracted=true;
      if(i!==active){
        goTo(i,true);
        return;
      }
      if(video.paused){
        playActive();
      }else{
        video.pause();
        paint();
      }
    });

    video.addEventListener('timeupdate',()=>{
      if(i!==active || !video.duration) return;
      card.style.setProperty('--video-progress',String(video.currentTime/video.duration));
    });

    video.addEventListener('play',paint);
    video.addEventListener('pause',paint);

    video.addEventListener('ended',()=>{
      if(i===active && !isFullscreen()) goTo(active+1,true);
    });

    video.addEventListener('error',()=>{
      if(i===active && !isFullscreen()) setTimeout(()=>goTo(active+1,true),500);
    });
  });

  prev?.addEventListener('click',()=>{userHasInteracted=true;goTo(active-1,true);});
  next?.addEventListener('click',()=>{userHasInteracted=true;goTo(active+1,true);});
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>{userHasInteracted=true;goTo(i,true);}));

  let startX=0,startY=0;
  root.addEventListener('touchstart',e=>{
    const t=e.changedTouches[0]; startX=t.clientX; startY=t.clientY;
  },{passive:true});
  root.addEventListener('touchend',e=>{
    const t=e.changedTouches[0], dx=t.clientX-startX, dy=t.clientY-startY;
    if(Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)*1.15){
      userHasInteracted=true;
      goTo(active+(dx<0?1:-1),true);
    }
  },{passive:true});

  const startObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting && !started){
        started=true;
        paint();
        playActive();
      }
    });
  },{threshold:.28});
  startObserver.observe(root);

  // If the visitor interacts anywhere with the page, we remember that gesture.
  // Sound still requires an explicit tap on the sound control; this avoids surprising audio.
  ['pointerdown','keydown'].forEach(type=>document.addEventListener(type,()=>{userHasInteracted=true;},{once:false,passive:true}));

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){videos[active]?.pause();}
    else if(started) playActive();
  });

  updateSoundUI();
  paint();
})();
