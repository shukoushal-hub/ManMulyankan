/* ═══════════════════════════════════════════════════════════════
   ManMulyankan — Gamification FX Engine
   Adds smooth transitions, sounds, celebrations, and micro-interactions
   Drop-in module: does NOT change any test logic or scoring
   ═══════════════════════════════════════════════════════════════ */

(function(){
  // ═══ SOUND ENGINE (Web Audio API) ═══
  var audioCtx;
  function getAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();return audioCtx}
  
  function playTone(freq,dur,type,vol){
    try{
      var ctx=getAudio(),o=ctx.createOscillator(),g=ctx.createGain();
      o.type=type||'sine';o.frequency.value=freq;
      g.gain.value=vol||0.08;
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
      o.connect(g);g.connect(ctx.destination);
      o.start();o.stop(ctx.currentTime+dur);
    }catch(e){}
  }
  
  window.sfx={
    select:function(){playTone(600,.08,'sine',0.06);playTone(800,.08,'sine',0.04)},
    correct:function(){playTone(523,.1,'sine',0.07);setTimeout(function(){playTone(659,.1,'sine',0.07)},80);setTimeout(function(){playTone(784,.15,'sine',0.07)},160)},
    next:function(){playTone(440,.06,'triangle',0.05);playTone(660,.06,'triangle',0.04)},
    milestone:function(){playTone(523,.1,'sine',0.08);setTimeout(function(){playTone(659,.1,'sine',0.08)},100);setTimeout(function(){playTone(784,.1,'sine',0.08)},200);setTimeout(function(){playTone(1047,.2,'sine',0.08)},300)},
    complete:function(){var notes=[523,659,784,1047,1319];notes.forEach(function(n,i){setTimeout(function(){playTone(n,.2,'sine',0.09)},i*120)})},
    whoosh:function(){playTone(200,.15,'sawtooth',0.03);playTone(800,.1,'sine',0.02)}
  };

  // ═══ HAPTIC FEEDBACK ═══
  window.haptic=function(style){
    try{
      if(navigator.vibrate){
        if(style==='light')navigator.vibrate(10);
        else if(style==='medium')navigator.vibrate(25);
        else if(style==='success')navigator.vibrate([15,50,15]);
        else if(style==='milestone')navigator.vibrate([10,30,10,30,10]);
        else navigator.vibrate(15);
      }
    }catch(e){}
  };

  // ═══ PARTICLE EXPLOSION ═══
  window.spawnParticles=function(x,y,count,colors){
    count=count||12;
    colors=colors||['#6b8aff','#b49dff','#f0b830','#5ec49a','#f07070','#5bb8f5'];
    var container=document.createElement('div');
    container.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
    document.body.appendChild(container);
    for(var i=0;i<count;i++){
      var p=document.createElement('div');
      var size=Math.random()*8+4;
      var color=colors[Math.floor(Math.random()*colors.length)];
      var angle=Math.random()*Math.PI*2;
      var velocity=Math.random()*120+60;
      var vx=Math.cos(angle)*velocity;
      var vy=Math.sin(angle)*velocity-50;
      p.style.cssText='position:absolute;left:'+x+'px;top:'+y+'px;width:'+size+'px;height:'+size+'px;background:'+color+';border-radius:'+(Math.random()>.5?'50%':'2px')+';pointer-events:none;z-index:9999';
      container.appendChild(p);
      animateParticle(p,vx,vy);
    }
    setTimeout(function(){container.remove()},1200);
  };
  
  function animateParticle(el,vx,vy){
    var start=performance.now(),x=parseFloat(el.style.left),y=parseFloat(el.style.top);
    function step(now){
      var t=(now-start)/1000;
      if(t>1){el.remove();return}
      el.style.left=(x+vx*t)+'px';
      el.style.top=(y+vy*t+200*t*t)+'px';
      el.style.opacity=1-t;
      el.style.transform='scale('+(1-t*0.5)+') rotate('+(t*360)+'deg)';
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ═══ CONFETTI CANNON ═══
  window.confetti=function(){
    var colors=['#6b8aff','#b49dff','#f0b830','#5ec49a','#f07070','#5bb8f5','#fff'];
    var container=document.createElement('div');
    container.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden';
    document.body.appendChild(container);
    for(var i=0;i<60;i++){
      (function(i){
        setTimeout(function(){
          var c=document.createElement('div');
          var size=Math.random()*8+4;
          var color=colors[Math.floor(Math.random()*colors.length)];
          c.style.cssText='position:absolute;top:-10px;left:'+Math.random()*100+'%;width:'+size+'px;height:'+(size*0.6)+'px;background:'+color+';border-radius:1px;opacity:0.9';
          container.appendChild(c);
          var drift=Math.random()*100-50;
          var dur=Math.random()*2+2;
          c.animate([
            {transform:'translateY(0) translateX(0) rotate(0deg)',opacity:1},
            {transform:'translateY('+window.innerHeight+'px) translateX('+drift+'px) rotate('+(Math.random()*720-360)+'deg)',opacity:0}
          ],{duration:dur*1000,easing:'cubic-bezier(0.25,0.46,0.45,0.94)'});
          setTimeout(function(){c.remove()},dur*1000);
        },i*30);
      })(i);
    }
    setTimeout(function(){container.remove()},5000);
  };

  // ═══ STREAK & MILESTONE TRACKER ═══
  window.gameState={streak:0,maxStreak:0,answered:0,total:0,milestones:[10,25,50,75,100]};
  
  window.onAnswer=function(isCorrect){
    gameState.answered++;
    if(isCorrect){gameState.streak++;if(gameState.streak>gameState.maxStreak)gameState.maxStreak=gameState.streak}
    else gameState.streak=0;
    
    // Streak messages
    if(gameState.streak===3)showToast('🔥 3 in a row!','streak');
    if(gameState.streak===5)showToast('⚡ 5 streak! On fire!','streak');
    if(gameState.streak===10){showToast('🌟 10 streak! Unstoppable!','milestone');sfx.milestone();haptic('milestone')}
    
    // Milestone messages
    var pct=Math.round(gameState.answered/gameState.total*100);
    if(pct===25&&gameState.answered>1)showToast('Quarter done! Keep going 💪','progress');
    if(pct===50)showToast('Halfway there! 🎯','progress');
    if(pct===75)showToast('Almost done! 🏁','progress');
  };

  // ═══ TOAST NOTIFICATIONS ═══
  window.showToast=function(msg,type){
    var t=document.createElement('div');
    var bg=type==='streak'?'linear-gradient(135deg,#f0b830,#ff9500)':
           type==='milestone'?'linear-gradient(135deg,#b49dff,#6b8aff)':
           'linear-gradient(135deg,#5ec49a,#3da87a)';
    t.style.cssText='position:fixed;top:70px;left:50%;transform:translateX(-50%) translateY(-20px);padding:10px 24px;background:'+bg+';color:#fff;font-family:"Outfit",sans-serif;font-size:.82rem;font-weight:700;border-radius:50px;z-index:10000;opacity:0;transition:all .4s cubic-bezier(.175,.885,.32,1.275);box-shadow:0 4px 20px rgba(0,0,0,.3);pointer-events:none;white-space:nowrap';
    t.textContent=msg;
    document.body.appendChild(t);
    requestAnimationFrame(function(){t.style.opacity='1';t.style.transform='translateX(-50%) translateY(0)'});
    setTimeout(function(){t.style.opacity='0';t.style.transform='translateX(-50%) translateY(-20px)';setTimeout(function(){t.remove()},400)},2200);
  };

  // ═══ INJECT GAMIFICATION CSS ═══
  var css=document.createElement('style');
  css.textContent=`
    /* ═══ SMOOTH QUESTION TRANSITIONS ═══ */
    @keyframes slideInRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
    @keyframes slideOutLeft{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(-40px)}}
    @keyframes slideInLeft{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
    @keyframes bounceIn{0%{opacity:0;transform:scale(.8)}60%{opacity:1;transform:scale(1.05)}100%{transform:scale(1)}}
    @keyframes pulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(107,138,255,0)}50%{box-shadow:0 0 0 8px rgba(107,138,255,.15)}}
    @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes celebrate{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes ripple{to{transform:scale(4);opacity:0}}
    @keyframes scoreRevealBig{from{opacity:0;transform:scale(.5) translateY(30px)}to{opacity:1;transform:scale(1) translateY(0)}}
    
    /* Question card entrance */
    .q-card,.question-card{animation:slideInRight .35s cubic-bezier(.25,.46,.45,.94) both}
    .q-card.exit-left{animation:slideOutLeft .25s ease both}
    .q-card.enter-left{animation:slideInLeft .35s cubic-bezier(.25,.46,.45,.94) both}
    
    /* Option hover & select effects */
    .q-opt{transition:all .2s cubic-bezier(.25,.46,.45,.94)!important;position:relative;overflow:hidden}
    .q-opt::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at var(--rx,50%) var(--ry,50%),rgba(107,138,255,.15),transparent 70%);opacity:0;transition:opacity .3s}
    .q-opt:hover::after{opacity:1}
    .q-opt.selected{animation:bounceIn .3s ease!important;transform:scale(1.01)}
    .q-opt.selected .dot{animation:celebrate .4s ease}
    
    /* Ripple on click */
    .q-opt .ripple{position:absolute;border-radius:50%;background:rgba(180,157,255,.2);animation:ripple .6s ease-out forwards;pointer-events:none}
    
    /* Progress bar upgrade */
    .progress-fill,.prog-fill{position:relative;background:linear-gradient(90deg,#6b8aff,#b49dff,#6b8aff)!important;background-size:200% 100%!important;animation:shimmer 2s linear infinite!important;transition:width .5s cubic-bezier(.25,.46,.45,.94)!important}
    .progress-fill::after,.prog-fill::after{content:'';position:absolute;right:-6px;top:50%;transform:translateY(-50%);width:14px;height:14px;background:#fff;border-radius:50%;box-shadow:0 0 12px rgba(180,157,255,.6),0 0 24px rgba(107,138,255,.3);animation:pulseGlow 1.5s ease-in-out infinite;transition:right .5s}
    
    /* Results celebration */
    .result-card,.results-view,.resultsCard{animation:scoreRevealBig .6s cubic-bezier(.175,.885,.32,1.275) both}
    .iq-ring,.score-ring-wrap{animation:scoreRevealBig .8s cubic-bezier(.175,.885,.32,1.275) .2s both}
    .iq-class,.score-class,.severity-badge{animation:bounceIn .5s ease .5s both}
    .domain-bar,.domain{animation:slideInRight .4s ease both}
    .domain-bar:nth-child(1){animation-delay:.1s}
    .domain-bar:nth-child(2){animation-delay:.2s}
    .domain-bar:nth-child(3){animation-delay:.3s}
    .domain-bar:nth-child(4){animation-delay:.4s}
    .domain-bar:nth-child(5){animation-delay:.5s}
    
    /* Next button pulse */
    .btn-nav.next,.btn.btn-primary{animation:pulseGlow 2s ease-in-out infinite}
    .btn-nav.next:hover,.btn.btn-primary:hover{animation:none;transform:translateY(-2px) scale(1.02)!important;box-shadow:0 6px 24px rgba(107,138,255,.3)!important}
    
    /* Glassmorphism upgrade for cards */
    .q-card,.card,.result-card{backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;background:rgba(42,45,53,.75)!important;border:1.5px solid rgba(107,138,255,.08)!important;box-shadow:0 4px 24px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.03)!important}
    .q-card:hover,.card:hover{border-color:rgba(107,138,255,.15)!important}
    
    /* Streak indicator */
    .streak-badge{position:fixed;top:56px;right:16px;padding:4px 14px;background:linear-gradient(135deg,#f0b830,#ff9500);color:#fff;font-family:"Outfit",sans-serif;font-size:.7rem;font-weight:800;border-radius:50px;z-index:300;opacity:0;transform:scale(.8);transition:all .3s;box-shadow:0 2px 12px rgba(240,184,48,.3)}
    .streak-badge.show{opacity:1;transform:scale(1)}
    .streak-badge.hot{background:linear-gradient(135deg,#f07070,#ff5050);box-shadow:0 2px 12px rgba(240,112,112,.3)}
  `;
  document.head.appendChild(css);

  // ═══ ADD STREAK BADGE TO DOM ═══
  var badge=document.createElement('div');
  badge.className='streak-badge';
  badge.id='streakBadge';
  document.body.appendChild(badge);

  // ═══ INTERCEPT OPTION CLICKS FOR EFFECTS ═══
  document.addEventListener('click',function(e){
    var opt=e.target.closest('.q-opt');
    if(opt){
      // Ripple effect
      var rect=opt.getBoundingClientRect();
      var ripple=document.createElement('span');
      ripple.className='ripple';
      ripple.style.width=ripple.style.height='10px';
      ripple.style.left=(e.clientX-rect.left)+'px';
      ripple.style.top=(e.clientY-rect.top)+'px';
      opt.appendChild(ripple);
      setTimeout(function(){ripple.remove()},600);
      
      // Sound & haptic
      sfx.select();haptic('light');
      
      // Particles on select
      spawnParticles(e.clientX,e.clientY,6);
      
      // Update streak badge
      var sb=document.getElementById('streakBadge');
      if(gameState.streak>=3){
        sb.textContent='🔥 '+gameState.streak+' streak';
        sb.classList.add('show');
        if(gameState.streak>=7)sb.classList.add('hot');else sb.classList.remove('hot');
      }else{sb.classList.remove('show','hot')}
    }
    
    // Next button sound
    if(e.target.closest('.btn-nav.next')||e.target.closest('.btn.btn-primary')){
      sfx.next();haptic('medium');
    }
    
    // Track radial gradient position for hover glow
    if(opt){
      var r=opt.getBoundingClientRect();
      opt.style.setProperty('--rx',((e.clientX-r.left)/r.width*100)+'%');
      opt.style.setProperty('--ry',((e.clientY-r.top)/r.height*100)+'%');
    }
  });

  // ═══ RESULTS CELEBRATION ═══
  var resultsObserver=new MutationObserver(function(mutations){
    mutations.forEach(function(m){
      if(m.type==='attributes'&&m.attributeName==='class'){
        var el=m.target;
        if(el.id==='s-results'&&el.classList.contains('active')){
          setTimeout(function(){sfx.complete();confetti();haptic('success')},400);
        }
      }
      // Also watch for results card becoming visible
      m.addedNodes.forEach(function(n){
        if(n.nodeType===1&&(n.classList.contains('result-card')||n.classList.contains('results-view'))){
          setTimeout(function(){sfx.complete();confetti();haptic('success')},400);
        }
      });
    });
  });
  
  // Observe all screens for class changes
  document.querySelectorAll('.screen,[id*="result"],[class*="result"]').forEach(function(el){
    resultsObserver.observe(el,{attributes:true,childList:true,subtree:false});
  });
  
  // Also observe body for dynamic content
  resultsObserver.observe(document.body,{childList:true,subtree:true});

  console.log('🎮 ManMulyankan Game FX loaded');
})();
