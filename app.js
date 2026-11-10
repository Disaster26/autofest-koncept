(function(){
  'use strict';
  var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  /* Menu mobilne */
  var burger=$('#burger'), menu=$('#menu');
  function closeMenu(){menu.classList.remove('open');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Otwórz menu');document.body.style.overflow=''}
  burger.addEventListener('click',function(){
    var open=!menu.classList.contains('open');
    menu.classList.toggle('open',open);burger.setAttribute('aria-expanded',String(open));
    burger.setAttribute('aria-label',open?'Zamknij menu':'Otwórz menu');document.body.style.overflow=open?'hidden':'';
  });
  $$('a',menu).forEach(function(a){a.addEventListener('click',closeMenu)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&menu.classList.contains('open')){closeMenu();burger.focus()}});

  /* Aktywna pozycja menu = sekcja na ekranie */
  var links=$$('.menu a[href^="#"]'), secs=links.map(function(a){return $(a.getAttribute('href'))}).filter(Boolean);
  if('IntersectionObserver' in window){
    var spy=new IntersectionObserver(function(en){
      en.forEach(function(e){
        if(e.isIntersecting){links.forEach(function(a){var on=a.getAttribute('href')==='#'+e.target.id;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')})}
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    secs.forEach(function(s){spy.observe(s)});
    var hero=$('.hero');
    new IntersectionObserver(function(en){if(en[0].isIntersecting)links.forEach(function(a){a.classList.remove('on');a.removeAttribute('aria-current')})},{rootMargin:'-45% 0px -50% 0px'}).observe(hero);
  }

  /* Zakładki floty */
  var tabs=$$('[role="tab"]');
  function selectTab(t,focus){
    tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',String(on));x.tabIndex=on?0:-1;$('#'+x.getAttribute('aria-controls')).hidden=!on});
    if(focus)t.focus();
    var r=$('#'+t.getAttribute('aria-controls')+' [data-rail]');r.scrollLeft=0;update(r);
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){selectTab(t)});
    t.addEventListener('keydown',function(e){
      var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;e.preventDefault();
      selectTab(tabs[(i+d+tabs.length)%tabs.length],true);
    });
  });
  $$('[data-tab]').forEach(function(a){a.addEventListener('click',function(){selectTab($('#'+a.getAttribute('data-tab')))})});

  /* Karuzele: palec (natywny scroll), mysz (przeciąganie), strzałki, licznik */
  function cards(r){return $$('.car',r)}
  function step(r){var c=cards(r);return c.length>1?c[1].offsetLeft-c[0].offsetLeft:r.clientWidth}
  function update(r){
    var nav=r.parentNode.querySelector('.rail-nav'), c=cards(r);if(!nav||!c.length)return;
    var st=step(r), per=Math.max(1,Math.round(r.clientWidth/st)), first=Math.round(r.scrollLeft/st);
    var max=r.scrollWidth-r.clientWidth;
    nav.classList.toggle('off',max<4);
    nav.querySelector('.prev').disabled=r.scrollLeft<4;
    nav.querySelector('.next').disabled=r.scrollLeft>max-4;
    var last=Math.min(c.length,first+per);
    nav.querySelector('.rn-count').textContent=(per>1?(first+1)+'-'+last:(first+1))+' / '+c.length;
  }
  $$('[data-rail]').forEach(function(r){
    var nav=r.parentNode.querySelector('.rail-nav');
    nav.querySelector('.prev').addEventListener('click',function(){r.scrollBy({left:-step(r),behavior:'smooth'})});
    nav.querySelector('.next').addEventListener('click',function(){r.scrollBy({left:step(r),behavior:'smooth'})});
    var t;r.addEventListener('scroll',function(){cancelAnimationFrame(t);t=requestAnimationFrame(function(){update(r)})},{passive:true});
    var down=false,moved=false,x0=0,s0=0;
    r.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0)return;down=true;moved=false;x0=e.clientX;s0=r.scrollLeft});
    window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-x0;if(Math.abs(dx)>5){moved=true;r.classList.add('drag')}if(moved){r.scrollLeft=s0-dx}});
    window.addEventListener('pointerup',function(){
      if(!down)return;down=false;
      if(moved){var st=step(r);r.classList.remove('drag');r.scrollTo({left:Math.round(r.scrollLeft/st)*st,behavior:'smooth'})}
    });
    r.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false}},true);
    update(r);
  });
  window.addEventListener('resize',function(){$$('[data-rail]').forEach(update)});

  /* Wybór auta / miejsca -> formularz */
  var fAuto=$('#f-auto'), fOdb=$('#f-odbior'), rez=$('#rezerwacja');
  $$('.car-btn').forEach(function(b){b.addEventListener('click',function(){
    var v=b.getAttribute('data-auto');
    $$('option',fAuto).forEach(function(o){if(o.textContent===v)fAuto.value=o.value||o.textContent});
    rez.scrollIntoView({behavior:'smooth'});
    setTimeout(function(){$('input[name="imie"]').focus({preventScroll:true})},600);
  })});
  $$('[data-miejsce]').forEach(function(a){a.addEventListener('click',function(){fOdb.value=a.getAttribute('data-miejsce')})});

  /* Formularz pokazowy: tylko walidacja, bez wysyłki */
  var form=$('#form'), msg=$('#form-msg');
  form.addEventListener('submit',function(e){
    e.preventDefault();var ok=true;
    $$('input[required]',form).forEach(function(i){var bad=!i.value.trim();i.classList.toggle('bad',bad);if(bad&&ok){i.focus();ok=false}});
    msg.hidden=false;
    msg.textContent=ok?'To jest podgląd strony, formularz nie wysyła danych. Na gotowej stronie rezerwacja trafi od razu na autofest@wp.pl.':'Uzupełnij zaznaczone pola. (To podgląd strony, formularz nie wysyła danych.)';
  });

  /* Dolny pasek na telefonie po przewinięciu za przycisk w hero */
  var mob=$('#mob'), cta=$('.hero-cta');
  if('IntersectionObserver' in window&&mob&&cta){
    new IntersectionObserver(function(en){
      var show=!en[0].isIntersecting&&en[0].boundingClientRect.top<0;
      mob.classList.toggle('widac',show);mob.setAttribute('aria-hidden',String(!show));
      $$('a',mob).forEach(function(a){a.tabIndex=show?0:-1});
    }).observe(cta);
  }
})();
