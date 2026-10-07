(() => {
  const root = document.documentElement;
  const body = document.body;
  const menuToggle = document.getElementById('menu-toggle');
  const scrim = document.getElementById('sidebar-scrim');
  const logoutDialog = document.getElementById('logout-confirm');
  const cancelLogout = document.querySelector('[data-cancel-logout]');
  const confirmLogout = document.querySelector('[data-confirm-logout]');
  const toast = document.getElementById('dashboard-toast');
  let toastTimer;

  // Reuse the existing notification, settings and profile nodes in the mobile drawer.
  const sidebar = document.getElementById('dashboard-sidebar');
  const headerControls = document.querySelector('.header-controls');
  const mobileBreakpoint = window.matchMedia('(max-width: 767px)');
  if (sidebar && headerControls) {
    const notificationControl = headerControls.querySelector('[data-menu-toggle="notifications"]')?.closest('.control-wrap');
    const settingsControl = headerControls.querySelector('[data-menu-toggle="settings"]')?.closest('.control-wrap');
    const profileControl = headerControls.querySelector('.profile-button');
    const nav = sidebar.querySelector('.sidebar-nav');
    const accountArea = document.createElement('div');
    accountArea.className = 'mobile-account-area';
    const accountButtons = document.createElement('div');
    accountButtons.className = 'mobile-control-row';
    const accountProfile = document.createElement('div');
    accountProfile.className = 'mobile-profile-area';
    accountArea.append(accountButtons, accountProfile);
    if (nav) nav.after(accountArea);

    const movableControls = [notificationControl, settingsControl, profileControl].filter(Boolean);
    const placeholders = new Map();
    movableControls.forEach((control) => {
      const placeholder = document.createComment('mobile control position');
      control.before(placeholder);
      placeholders.set(control, placeholder);
    });
    const syncMobileControls = () => {
      if (mobileBreakpoint.matches) {
        if (notificationControl) accountButtons.append(notificationControl);
        if (settingsControl) accountButtons.append(settingsControl);
        if (profileControl) accountProfile.append(profileControl);
      } else {
        movableControls.forEach((control) => {
          const placeholder = placeholders.get(control);
          if (placeholder?.parentNode) placeholder.replaceWith(control);
        });
      }
    };
    syncMobileControls();
    mobileBreakpoint.addEventListener('change', syncMobileControls);
  }
  if (sidebar && !sidebar.querySelector('.sidebar-close-button')) {
    const closeSidebarButton = document.createElement('button');
    closeSidebarButton.className = 'sidebar-close-button';
    closeSidebarButton.type = 'button';
    closeSidebarButton.setAttribute('aria-label', 'Close menu');
    closeSidebarButton.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    sidebar.append(closeSidebarButton);
    closeSidebarButton.addEventListener('click', () => setSidebarOpen(false));
  }

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };

  const setSidebarOpen = (open) => {
    body.classList.toggle('sidebar-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  const storedTheme = localStorage.getItem('theme');
  const isDark = storedTheme === 'dark' || (!storedTheme && localStorage.getItem('darkMode') === 'true');
  root.classList.toggle('dark-mode', isDark);
  const storedRtl = localStorage.getItem('rtl');
  root.dir = storedRtl === 'true' || storedRtl === 'rtl' ? 'rtl' : 'ltr';

  const updateThemeButtons = () => document.querySelectorAll('.theme-toggle').forEach((button) => {
    const dark = root.classList.contains('dark-mode');
    button.innerHTML = `<i class="fa-solid ${dark ? 'fa-sun' : 'fa-moon'}"></i>`;
    button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    button.title = dark ? 'Light mode' : 'Dark mode';
  });
  updateThemeButtons();

  document.querySelectorAll('.theme-toggle').forEach((button) => button.addEventListener('click', () => {
    const dark = !root.classList.contains('dark-mode');
    root.classList.toggle('dark-mode', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('darkMode', String(dark));
    updateThemeButtons();
  }));

  document.querySelectorAll('.rtl-toggle').forEach((button) => button.addEventListener('click', () => {
    const rtl = root.dir !== 'rtl';
    root.dir = rtl ? 'rtl' : 'ltr';
    localStorage.setItem('rtl', String(rtl));
    showToast(rtl ? 'RTL layout enabled' : 'LTR layout enabled');
  }));

  menuToggle.addEventListener('click', () => setSidebarOpen(!body.classList.contains('sidebar-open')));
  scrim.addEventListener('click', () => setSidebarOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!logoutDialog.hidden) closeLogoutDialog();
      setSidebarOpen(false);
      closePopovers();
    }
  });

  const openLogoutDialog = () => {
    closePopovers();
    setSidebarOpen(false);
    logoutDialog.hidden = false;
    cancelLogout.focus();
  };
  const closeLogoutDialog = () => {
    logoutDialog.hidden = true;
    document.querySelector('[data-logout]')?.focus();
  };
  cancelLogout.addEventListener('click', closeLogoutDialog);
  confirmLogout.addEventListener('click', () => { window.location.href = 'login.html'; });
  logoutDialog.addEventListener('click', (event) => {
    if (event.target === logoutDialog) closeLogoutDialog();
  });

  const closePopovers = (except) => document.querySelectorAll('[data-popover]').forEach((panel) => {
    if (panel.dataset.popover === except) return;
    panel.hidden = true;
    document.querySelector(`[data-menu-toggle="${panel.dataset.popover}"]`)?.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('[data-menu-toggle]').forEach((button) => button.addEventListener('click', (event) => {
    event.stopPropagation();
    const key = button.dataset.menuToggle;
    const panel = document.querySelector(`[data-popover="${key}"]`);
    const willOpen = panel.hidden;
    closePopovers(key);
    panel.hidden = !willOpen;
    button.setAttribute('aria-expanded', String(willOpen));
  }));
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.control-wrap')) closePopovers();
  });
  document.querySelectorAll('[data-popover] a').forEach((link) => link.addEventListener('click', (event) => {
    if (link.getAttribute('href')?.startsWith('#')) event.preventDefault();
    closePopovers();
    showToast(`${link.textContent.trim()} will be available here soon.`);
  }));

  document.querySelectorAll('.sidebar-link').forEach((link) => link.addEventListener('click', () => {
    if (link.matches('[data-logout]')) return;
    document.querySelectorAll('.sidebar-link.is-active').forEach((active) => {
      active.classList.remove('is-active');
      active.removeAttribute('aria-current');
    });
    link.classList.add('is-active');
    link.setAttribute('aria-current', 'page');
    setSidebarOpen(false);
  }));
  document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', () => {
    openLogoutDialog();
  }));

  // Main dashboard booking details dialog.
  const dashboardModal = document.getElementById('dashboard-booking-modal');
  const openDashboardModal = () => { if (dashboardModal) dashboardModal.hidden = false; };
  document.querySelectorAll('[data-booking-open]').forEach((button) => button.addEventListener('click', openDashboardModal));
  dashboardModal?.addEventListener('click', (event) => { if (event.target === dashboardModal || event.target.closest('[data-modal-close]')) dashboardModal.hidden = true; });

  // Bookings page uses local demo data, with edits kept for the current page session.
  const bookingsApp = document.getElementById('bookings-app');
  if (bookingsApp) {
    const bookings = [
      { id:'BR-2026-1048', activity:'Bubble Football', date:'2026-10-08', time:'6:00 PM', players:8, duration:'60 Minutes', package:'Arena Classic', payment:'Paid', status:'upcoming', amount:'$96' },
      { id:'BR-2026-1051', activity:'Zorbing', date:'2026-10-12', time:'4:30 PM', players:4, duration:'45 Minutes', package:'Zorb Sprint', payment:'Paid', status:'upcoming', amount:'$64' },
      { id:'BR-2026-1031', activity:'Bubble Football', date:'2026-10-06', time:'5:00 PM', players:8, duration:'60 Minutes', package:'Arena Classic', payment:'Paid', status:'completed', amount:'$96' },
      { id:'BR-2026-1024', activity:'Zorbing', date:'2026-10-01', time:'3:30 PM', players:4, duration:'45 Minutes', package:'Zorb Sprint', payment:'Paid', status:'completed', amount:'$64' },
      { id:'BR-2026-1017', activity:'Bubble Football', date:'2026-09-26', time:'6:00 PM', players:6, duration:'60 Minutes', package:'Arena Classic', payment:'Paid', status:'completed', amount:'$82' },
      { id:'BR-2026-1009', activity:'Zorbing', date:'2026-09-18', time:'4:00 PM', players:3, duration:'45 Minutes', package:'Zorb Sprint', payment:'Refunded', status:'cancelled', amount:'$48' },
      { id:'BR-2026-0998', activity:'Bubble Football', date:'2026-09-10', time:'5:30 PM', players:5, duration:'60 Minutes', package:'Arena Classic', payment:'Paid', status:'completed', amount:'$72' },
      ...Array.from({length:4}, (_,i)=>({id:`BR-2026-0${980-i}`, activity:i%2?'Zorbing':'Bubble Football', date:`2026-08-${String(29-i*5).padStart(2,'0')}`, time:'4:00 PM', players:4+i, duration:'60 Minutes', package:'Arena Classic', payment:'Paid', status:'completed', amount:'$72'}))
    ];
    let activeFilter = 'all';
    const modal = document.getElementById('booking-modal');
    const modalContent = document.getElementById('booking-modal-content');
    const titleDate = (b) => new Date(`${b.date}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'});
    const statusText = (s) => s[0].toUpperCase()+s.slice(1);
    const detailMarkup = (b) => `<span class="modal-kicker">${statusText(b.status)} BOOKING</span><h2 id="booking-modal-title">${b.activity}</h2><p class="modal-intro">Booking ${b.id}</p><div class="modal-details"><div><span>Date</span><strong>${titleDate(b)}</strong></div><div><span>Time</span><strong>${b.time}</strong></div><div><span>Group size</span><strong>${b.players} Players</strong></div><div><span>Duration</span><strong>${b.duration}</strong></div><div><span>Package</span><strong>${b.package}</strong></div><div><span>Payment status</span><strong>${b.payment}</strong></div><div><span>Amount</span><strong>${b.amount}</strong></div></div>`;
    const showDetails = (b) => { modalContent.innerHTML = `<button class="modal-close" type="button" data-modal-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button>${detailMarkup(b)}`; modal.hidden=false; };
    const render = () => {
      const query = document.getElementById('booking-search').value.trim().toLowerCase();
      const sort = document.getElementById('booking-sort').value;
      const filtered = bookings.filter(b => (activeFilter==='all'||b.status===activeFilter) && `${b.activity} ${b.id} ${b.status} ${titleDate(b)}`.toLowerCase().includes(query));
      const ordered = [...filtered].sort((a,b)=> sort==='oldest'?a.date.localeCompare(b.date):sort==='upcoming'?((a.status==='upcoming'?0:1)-(b.status==='upcoming'?0:1)||a.date.localeCompare(b.date)):b.date.localeCompare(a.date));
      document.getElementById('booking-history').innerHTML = ordered.map(b=>`<article class="history-card"><span class="history-activity-icon"><i class="${b.activity==='Zorbing'?'fa-solid fa-person-circle-check':'fa-solid fa-futbol'}"></i></span><div class="history-main"><strong>${b.activity}</strong><span>${titleDate(b)} <i>·</i> ${b.players} Players</span></div><span class="booking-status status-${b.status}">${statusText(b.status)}</span><strong class="history-amount">${b.amount}</strong><button class="small-outline" type="button" data-detail="${b.id}">View Details</button></article>`).join('');
      document.getElementById('booking-empty').hidden=ordered.length>0;
      const upcoming = bookings.filter(b=>b.status==='upcoming');
      document.getElementById('upcoming-bookings').innerHTML = upcoming.length ? upcoming.map(b=>`<article class="upcoming-card"><span class="upcoming-activity-icon"><i class="fa-solid fa-futbol"></i></span><div class="upcoming-main"><div class="upcoming-title"><h3>${b.activity}</h3><span class="booking-status status-upcoming">Confirmed</span></div><div class="upcoming-meta"><span><i class="fa-regular fa-calendar"></i> ${b.id==='BR-2026-1048'?'Tomorrow':titleDate(b)} · ${b.time}</span><span><i class="fa-solid fa-users"></i> ${b.players} Players</span><span><i class="fa-regular fa-clock"></i> ${b.duration}</span></div><small>Booking ID: <strong>${b.id}</strong></small><div class="upcoming-actions"><button class="small-primary" type="button" data-detail="${b.id}">View Details</button><button class="small-outline" type="button" data-reschedule="${b.id}">Reschedule</button><button class="small-danger" type="button" data-cancel="${b.id}">Cancel</button></div></div></article>`).join('') : '<p class="empty-state">No upcoming bookings. <a href="d3.html">Book a session</a></p>';
      const counts = {upcoming:bookings.filter(b=>b.status==='upcoming').length, completed:bookings.filter(b=>b.status==='completed').length, cancelled:bookings.filter(b=>b.status==='cancelled').length};
      Object.entries(counts).forEach(([key,value])=>{document.querySelectorAll(`[data-count="${key}"], [data-filter-count="${key}"]`).forEach(el=>el.textContent=value);});
      document.querySelector('[data-filter-count="all"]').textContent=bookings.length;
      document.querySelector('.upcoming-count').textContent=`${counts.upcoming} sessions scheduled`;
    };
    const closeModal = () => {modal.hidden=true;};
    modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-modal-close]'))closeModal();});
    bookingsApp.addEventListener('click',e=>{
      const filter=e.target.closest('[data-filter], [data-summary-filter]');
      if(filter){activeFilter=filter.dataset.filter||filter.dataset.summaryFilter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('is-active',x.dataset.filter===activeFilter));document.querySelector('.history-section').scrollIntoView({behavior:'smooth',block:'start'});render();return;}
      const detail=e.target.closest('[data-detail]'); if(detail){const b=bookings.find(x=>x.id===detail.dataset.detail);showDetails(b);return;}
      const reschedule=e.target.closest('[data-reschedule]'); if(reschedule){const b=bookings.find(x=>x.id===reschedule.dataset.reschedule);modalContent.innerHTML=`<button class="modal-close" type="button" data-modal-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button><span class="modal-kicker">CHANGE YOUR PLANS</span><h2 id="booking-modal-title">Reschedule ${b.activity}</h2><p class="modal-intro">Choose a new demo time for ${b.id}.</p><form class="reschedule-form"><label>New session<select name="slot"><option value="2026-10-10|5:00 PM">Oct 10, 2026 · 5:00 PM</option><option value="2026-10-11|6:30 PM">Oct 11, 2026 · 6:30 PM</option><option value="2026-10-13|4:00 PM">Oct 13, 2026 · 4:00 PM</option></select></label><button class="button-primary" type="submit">Save new time</button></form>`;modal.hidden=false;modal.querySelector('form').addEventListener('submit',ev=>{ev.preventDefault();const [date,time]=new FormData(ev.currentTarget).get('slot').split('|');b.date=date;b.time=time;closeModal();render();showToast('Booking rescheduled successfully.');});return;}
      const cancel=e.target.closest('[data-cancel]'); if(cancel){const b=bookings.find(x=>x.id===cancel.dataset.cancel);modalContent.innerHTML=`<button class="modal-close" type="button" data-modal-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button><span class="modal-kicker">BOOKING CHANGE</span><h2 id="booking-modal-title">Cancel this booking?</h2><p class="modal-intro">Your ${b.activity} session on ${titleDate(b)} will be cancelled.</p><div class="confirm-actions"><button class="confirm-cancel" type="button" data-modal-close>Keep Booking</button><button class="confirm-accept" type="button" id="confirm-booking-cancel">Yes, Cancel</button></div>`;modal.hidden=false;modal.querySelector('#confirm-booking-cancel').addEventListener('click',()=>{b.status='cancelled';closeModal();render();showToast('Booking cancelled successfully.');});}
    });
    document.getElementById('booking-search').addEventListener('input',render);document.getElementById('booking-sort').addEventListener('change',render);render();
  }

  const sessionApp = document.getElementById('session-booking-app');
  if (sessionApp) {
    const modal=document.getElementById('session-modal'), content=document.getElementById('session-modal-content');
    const activityCards=[...sessionApp.querySelectorAll('[data-activity]')]; let activity=activityCards[0].dataset.activity, price=Number(activityCards[0].dataset.price), minutes=60, players=1, time='';
    const money=n=>`₹${n.toLocaleString('en-IN')}`;
    const dateLabel=v=>v?new Date(`${v}T12:00:00`).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'Choose a date';
    const update=()=>{document.getElementById('session-activity').value=activity;document.getElementById('session-duration').value=minutes;document.getElementById('session-players').textContent=players;document.getElementById('summary-activity').textContent=activity;document.getElementById('summary-date').textContent=dateLabel(document.getElementById('session-date').value);document.getElementById('summary-time').textContent=time||'Choose a time';document.getElementById('summary-players').textContent=`${players} ${players===1?'player':'players'}`;document.getElementById('summary-duration').textContent=`${minutes} Minutes`;document.getElementById('summary-total').textContent=money(price*players*(minutes/60));};
    activityCards.forEach(card=>card.addEventListener('click',()=>{activity=card.dataset.activity;price=Number(card.dataset.price);minutes=Number(card.dataset.duration);activityCards.forEach(c=>c.classList.toggle('is-selected',c===card));update();}));
    document.getElementById('session-date').addEventListener('change',update);document.getElementById('session-duration').addEventListener('change',e=>{minutes=Number(e.target.value);update();});
    sessionApp.querySelectorAll('[data-time]').forEach(button=>button.addEventListener('click',()=>{time=time===button.dataset.time?'':button.dataset.time;sessionApp.querySelectorAll('[data-time]').forEach(b=>b.classList.toggle('is-selected',b.dataset.time===time));update();}));
    sessionApp.addEventListener('click',e=>{const counter=e.target.closest('[data-counter="session"]');if(counter){players=Math.max(1,Math.min(20,players+Number(counter.dataset.step)));update();}});
    document.getElementById('session-form').addEventListener('submit',e=>{e.preventDefault();const error=document.getElementById('session-error');const date=document.getElementById('session-date').value;if(!date||!time){error.textContent=!date&&!time?'Choose a date and time slot to continue.':!date?'Choose a date to continue.':'Choose a time slot to continue.';return;}error.textContent='';content.innerHTML=`<span class="modal-kicker">READY TO BOUNCE?</span><h2 id="session-modal-title">Confirm Your Session</h2><p class="modal-intro">Review your session details before reserving.</p><div class="modal-details"><div><span>Activity</span><strong>${activity}</strong></div><div><span>Date</span><strong>${dateLabel(date)}</strong></div><div><span>Time</span><strong>${time}</strong></div><div><span>Players</span><strong>${players}</strong></div><div><span>Duration</span><strong>${minutes} Minutes</strong></div><div><span>Estimated Total</span><strong>${money(price*players*(minutes/60))}</strong></div></div><div class="confirm-actions"><button class="confirm-cancel" type="button" data-modal-close>Go Back</button><button class="button-primary" type="button" id="confirm-session">Confirm Booking</button></div>`;modal.hidden=false;content.querySelector('#confirm-session').addEventListener('click',()=>{modal.hidden=true;content.innerHTML=`<span class="success-mark"><i class="fa-solid fa-check"></i></span><span class="modal-kicker">YOU'RE ALL SET</span><h2 id="session-modal-title">Session reserved successfully!</h2><p class="modal-intro">${activity} · ${dateLabel(date)} · ${time}</p><div class="modal-actions-stack"><a class="button-primary" href="d2.html">View My Bookings</a><button class="button-outline" type="button" id="another-session">Book Another Session</button></div>`;modal.hidden=false;showToast('Session reserved successfully!');content.querySelector('#another-session').addEventListener('click',()=>{modal.hidden=true;document.getElementById('session-date').value='';time='';sessionApp.querySelectorAll('[data-time]').forEach(b=>b.classList.remove('is-selected'));update();});});});
    modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-modal-close]'))modal.hidden=true;});update();
  }

  const passesApp=document.getElementById('passes-app');
  if(passesApp){
    const modal=document.getElementById('passes-modal'),content=document.getElementById('passes-modal-content');
    const records=[{name:'5-Session Bounce Pass',date:'Sep 20, 2026',sessions:'5',used:'3',status:'active'},{name:'Single Session',date:'Aug 02, 2026',sessions:'1',used:'1',status:'expired'},{name:'5-Session Pass',date:'May 14, 2026',sessions:'5',used:'5',status:'expired'}];
    const render=filter=>{document.getElementById('pass-history-list').innerHTML=records.filter(r=>filter==='all'||r.status===filter).map(r=>`<article class="pass-history-row"><span class="stat-icon"><i class="fa-solid fa-ticket"></i></span><div><strong>${r.name}</strong><small>Purchased ${r.date}</small></div><span>${r.sessions} sessions<br><small>${r.used} used</small></span><span class="booking-status ${r.status==='active'?'status-upcoming':'status-completed'}">${r.status}</span></article>`).join('');};
    render('all');passesApp.querySelectorAll('[data-pass-filter]').forEach(btn=>btn.addEventListener('click',()=>{passesApp.querySelectorAll('[data-pass-filter]').forEach(b=>b.classList.toggle('is-active',b===btn));render(btn.dataset.passFilter);}));
    passesApp.querySelectorAll('[data-pass-card]').forEach(card=>card.addEventListener('click',e=>{if(e.target.closest('button'))return;passesApp.querySelectorAll('[data-pass-card]').forEach(c=>c.classList.toggle('is-selected',c===card));}));
    const detail=()=>{content.innerHTML=`<span class="modal-kicker">PASS DETAILS</span><h2 id="passes-modal-title">5-Session Bounce Pass</h2><p class="modal-intro">Your active pass is ready for your next arena session.</p><div class="modal-details"><div><span>Sessions used</span><strong>3 of 5</strong></div><div><span>Remaining</span><strong>2 sessions</strong></div><div><span>Purchased</span><strong>September 20, 2026</strong></div><div><span>Valid until</span><strong>December 20, 2026</strong></div><div><span>Pass status</span><strong>Active</strong></div></div>`;modal.hidden=false;};
    passesApp.querySelector('[data-pass-details]').addEventListener('click',detail);
    passesApp.querySelector('[data-use-pass]').addEventListener('click',()=>{content.innerHTML=`<span class="modal-kicker">PAYMENT METHOD</span><h2 id="passes-modal-title">Use your active pass?</h2><p class="modal-intro">Your 5-Session Bounce Pass is selected as the payment method. Choose an activity to continue.</p><div class="pass-payment-choice"><i class="fa-solid fa-ticket"></i><span><strong>5-Session Bounce Pass</strong><small>2 sessions remaining</small></span><i class="fa-solid fa-circle-check"></i></div><a class="button-primary full-button" href="d3.html">Choose a Session</a>`;modal.hidden=false;});
    passesApp.querySelectorAll('[data-buy-pass]').forEach(button=>button.addEventListener('click',()=>{const name=button.dataset.buyPass,card=button.closest('.pricing-card');passesApp.querySelectorAll('[data-pass-card]').forEach(c=>c.classList.toggle('is-selected',c===card));const cost={ 'Single Session':'₹499','5 Session Pass':'₹1,999','10 Session Pass':'₹3,499'}[name];content.innerHTML=`<span class="modal-kicker">PASS PURCHASE</span><h2 id="passes-modal-title">Get the ${name}</h2><p class="modal-intro">Review your pass before adding it to your account.</p><div class="modal-details"><div><span>Pass</span><strong>${name}</strong></div><div><span>Price</span><strong>${cost}</strong></div><div><span>Benefits</span><strong>Flexible arena sessions</strong></div><div><span>Booking</span><strong>Manage online anytime</strong></div></div><div class="confirm-actions"><button class="confirm-cancel" type="button" data-modal-close>Cancel</button><button class="button-primary" id="confirm-pass-purchase" type="button">Confirm Purchase</button></div>`;modal.hidden=false;content.querySelector('#confirm-pass-purchase').addEventListener('click',()=>{records.unshift({name,date:'Oct 07, 2026',sessions:name.startsWith('Single')?'1':name.startsWith('5')?'5':'10',used:'0',status:'active'});render('all');modal.hidden=true;showToast('Pass added successfully!');document.querySelector('.active-pass-copy h3').textContent=name.replace(' Pass',' Bounce Pass');});}));
    modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-modal-close]'))modal.hidden=true;});
  }

  const groupApp=document.getElementById('group-bookings-app');
  if(groupApp){
    const modal=document.getElementById('group-modal'),content=document.getElementById('group-modal-content');let groupType='Friends & Family',players=6;
    const dateLabel=v=>v?new Date(`${v}T12:00:00`).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'Choose a date';
    const estimate=()=>{const activity=document.getElementById('group-activity').value,rate=activity==='Both'?799:activity==='Zorbing'?399:499,n=players,discount=n>=20?.8:n>=12?.9:1;return Math.round((activity==='Both'?rate:rate)*n*discount);};
    const update=()=>{document.getElementById('group-type-select').value=groupType;document.getElementById('group-players').textContent=players;document.getElementById('group-summary-type').textContent=groupType;document.getElementById('group-summary-activity').textContent=document.getElementById('group-activity').value;document.getElementById('group-summary-players').textContent=`${players} Players`;document.getElementById('group-summary-date').textContent=dateLabel(document.getElementById('group-date').value);document.getElementById('group-summary-time').textContent=document.getElementById('group-time').value||'Choose a time';document.getElementById('group-summary-price').textContent=`₹${estimate().toLocaleString('en-IN')}`;};
    groupApp.querySelectorAll('[data-group-type]').forEach(card=>card.addEventListener('click',()=>{groupType=card.dataset.groupType;groupApp.querySelectorAll('[data-group-type]').forEach(c=>c.classList.toggle('is-selected',c===card));update();}));
    groupApp.addEventListener('click',e=>{const step=e.target.closest('[data-counter="group"]');if(step){players=Math.max(6,Math.min(30,players+Number(step.dataset.step)));update();}});
    ['group-activity','group-date','group-time','group-type-select'].forEach(id=>document.getElementById(id).addEventListener('change',e=>{if(id==='group-type-select'){groupType=e.target.value;groupApp.querySelectorAll('[data-group-type]').forEach(c=>c.classList.toggle('is-selected',c.dataset.groupType===groupType));}update();}));
    const history=[{id:'GR-2026-1042',type:'Corporate & Team',activity:'Bubble Football',date:'2026-10-18',players:14,time:'4:00 PM',status:'upcoming',name:'Ava Patel',email:'ava@example.com',phone:'98765 43210'},{id:'GR-2026-1036',type:'Birthday & Celebration',activity:'Both',date:'2026-10-22',players:10,time:'6:00 PM',status:'pending',name:'Mia Singh',email:'mia@example.com',phone:'98765 12340'},{id:'GR-2026-1019',type:'Friends & Family',activity:'Zorbing',date:'2026-09-28',players:8,time:'2:00 PM',status:'completed',name:'Noah Rao',email:'noah@example.com',phone:'98765 21212'},{id:'GR-2026-1008',type:'Friends & Family',activity:'Bubble Football',date:'2026-09-15',players:6,time:'12:00 PM',status:'cancelled',name:'Liam Shah',email:'liam@example.com',phone:'98765 34343'}];let filter='all';
    const render=()=>{const shown=history.filter(r=>filter==='all'||(filter==='upcoming'?['upcoming','pending'].includes(r.status):r.status===filter));document.getElementById('group-history-list').innerHTML=shown.map(r=>`<article class="group-history-card"><div class="group-history-title"><strong>${r.id}</strong><span class="booking-status status-${r.status==='pending'?'upcoming':r.status}">${r.status[0].toUpperCase()+r.status.slice(1)}</span></div><div><span>Group Type</span><strong>${r.type}</strong></div><div><span>Activity</span><strong>${r.activity}</strong></div><div><span>Date · Players</span><strong>${dateLabel(r.date)} · ${r.players}</strong></div><button class="small-outline" type="button" data-group-detail="${r.id}">View Details</button></article>`).join('');};
    groupApp.querySelectorAll('[data-group-filter]').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.groupFilter;groupApp.querySelectorAll('[data-group-filter]').forEach(b=>b.classList.toggle('is-active',b===btn));render();}));
    groupApp.addEventListener('click',e=>{const view=e.target.closest('[data-group-detail]');if(view){const r=history.find(x=>x.id===view.dataset.groupDetail);content.innerHTML=`<span class="modal-kicker">GROUP REQUEST · ${r.id}</span><h2 id="group-modal-title">${r.type}</h2><p class="modal-intro">${r.activity} · ${dateLabel(r.date)}</p><div class="modal-details"><div><span>Players</span><strong>${r.players}</strong></div><div><span>Time</span><strong>${r.time}</strong></div><div><span>Contact</span><strong>${r.name}</strong></div><div><span>Email</span><strong>${r.email}</strong></div><div><span>Phone</span><strong>${r.phone}</strong></div><div><span>Status</span><strong>${r.status}</strong></div></div>${r.status==='pending'?'<div class="confirm-actions"><button class="button-outline" type="button" id="edit-group-request">Edit Request</button><button class="small-danger" type="button" id="cancel-group-request">Cancel Request</button></div>':''}`;modal.hidden=false;content.querySelector('#edit-group-request')?.addEventListener('click',()=>{modal.hidden=true;document.getElementById('group-name').value=r.name;document.getElementById('group-email').value=r.email;document.getElementById('group-phone').value=r.phone;document.getElementById('group-date').value=r.date;document.getElementById('group-players').textContent=r.players;players=r.players;update();document.getElementById('group-form').scrollIntoView({behavior:'smooth'});});content.querySelector('#cancel-group-request')?.addEventListener('click',()=>{r.status='cancelled';modal.hidden=true;render();showToast('Group booking request cancelled.');});}});
    document.getElementById('group-form').addEventListener('submit',e=>{e.preventDefault();const name=document.getElementById('group-name'),email=document.getElementById('group-email'),phone=document.getElementById('group-phone'),date=document.getElementById('group-date'),time=document.getElementById('group-time'),error=document.getElementById('group-error');if(!name.value.trim()||!email.validity.valid||!phone.value.trim()||!date.value||!time.value){error.textContent='Please enter a name, valid email, phone, date and preferred time.';return;}error.textContent='';const info={name:name.value.trim(),email:email.value.trim(),phone:phone.value.trim(),type:groupType,activity:document.getElementById('group-activity').value,players,date:date.value,time:time.value};content.innerHTML=`<span class="modal-kicker">PLEASE REVIEW</span><h2 id="group-modal-title">Group Booking Request</h2><p class="modal-intro">Check your details before submitting your request.</p><div class="modal-details"><div><span>Contact</span><strong>${info.name}</strong></div><div><span>Group Type</span><strong>${info.type}</strong></div><div><span>Email</span><strong>${info.email}</strong></div><div><span>Phone</span><strong>${info.phone}</strong></div><div><span>Activity</span><strong>${info.activity}</strong></div><div><span>Players</span><strong>${info.players}</strong></div><div><span>Date & time</span><strong>${dateLabel(info.date)} · ${info.time}</strong></div><div><span>Estimated Price</span><strong>₹${estimate().toLocaleString('en-IN')}</strong></div></div><div class="confirm-actions"><button class="confirm-cancel" type="button" data-modal-close>Edit Details</button><button class="button-primary" type="button" id="submit-group">Submit Request</button></div>`;modal.hidden=false;content.querySelector('#submit-group').addEventListener('click',()=>{const id='GR-2026-1048';history.unshift({id,type:info.type,activity:info.activity,date:info.date,players:info.players,time:info.time,status:'pending',name:info.name,email:info.email,phone:info.phone});render();content.innerHTML=`<span class="success-mark"><i class="fa-solid fa-check"></i></span><span class="modal-kicker">REQUEST RECEIVED</span><h2 id="group-modal-title">Your group booking request has been submitted.</h2><p class="modal-intro">Reference ID: <strong>${id}</strong></p><div class="modal-actions-stack"><button class="button-primary" type="button" id="view-group-bookings">View My Group Bookings</button><button class="button-outline" type="button" id="another-group">Create Another Request</button></div>`;showToast('Your group booking request has been submitted.');content.querySelector('#view-group-bookings').addEventListener('click',()=>{modal.hidden=true;document.querySelector('.group-history-list').scrollIntoView({behavior:'smooth'});});content.querySelector('#another-group').addEventListener('click',()=>{modal.hidden=true;e.target.reset();players=6;groupType='Friends & Family';groupApp.querySelectorAll('[data-group-type]').forEach(c=>c.classList.toggle('is-selected',c.dataset.groupType===groupType));update();});});});
    modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-modal-close]'))modal.hidden=true;});update();render();
  }

  const paymentsApp=document.getElementById('payments-app');
  if(paymentsApp){
    const modal=document.getElementById('payment-modal'),content=document.getElementById('payment-modal-content');
    const tx=[
      {id:'BR-PAY-1048',date:'2026-10-06',description:'Bubble Football Session',method:'Visa •• 4242',amount:998,status:'successful',booking:'BR-2026-1048'},
      {id:'BR-PAY-1037',date:'2026-10-04',description:'5-Session Pass',method:'UPI',amount:1999,status:'successful',booking:'BR-PASS-2026-03'},
      {id:'BR-PAY-1029',date:'2026-10-03',description:'Zorbing Session',method:'UPI',amount:798,status:'pending',booking:'BR-2026-1029'},
      {id:'BR-PAY-1018',date:'2026-09-28',description:'Cancelled Session Refund',method:'Visa •• 4242',amount:499,status:'refunded',booking:'BR-2026-1018'},
      {id:'BR-PAY-1007',date:'2026-09-21',description:'Bubble Football Session',method:'Visa •• 4242',amount:1497,status:'successful',booking:'BR-2026-1007'}
    ];
    let status='all';const formatDate=v=>new Date(`${v}T12:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}), rupees=n=>`₹${n.toLocaleString('en-IN')}`;
    const showTx=(t)=>{content.innerHTML=`<span class="modal-kicker">PAYMENT DETAILS</span><h2 id="payment-modal-title">Transaction ${t.id}</h2><p class="modal-intro">${t.status==='successful'?'Payment confirmed successfully.':t.status==='pending'?'Payment is awaiting confirmation.':'Refund has been processed.'}</p><div class="modal-details"><div><span>Transaction ID</span><strong>${t.id}</strong></div><div><span>Date</span><strong>${formatDate(t.date)}</strong></div><div><span>Booking reference</span><strong>${t.booking}</strong></div><div><span>Description</span><strong>${t.description}</strong></div><div><span>Payment method</span><strong>${t.method}</strong></div><div><span>Amount</span><strong>${rupees(t.amount)}</strong></div><div><span>Status</span><strong>${t.status}</strong></div><div><span>Confirmation</span><strong>${t.status==='successful'?'Payment received':'Transaction record updated'}</strong></div></div><div class="confirm-actions"><button type="button" class="confirm-cancel" data-modal-close>Close</button><button type="button" class="button-primary" data-download-receipt>Download Receipt</button></div>`;modal.hidden=false;content.querySelector('[data-download-receipt]').addEventListener('click',()=>showToast('Receipt download started.'));};
    const render=()=>{const q=document.getElementById('payment-search').value.trim().toLowerCase(),d=document.getElementById('payment-date').value,sort=document.getElementById('payment-sort').value;let rows=tx.filter(t=>(status==='all'||t.status===status)&&(!d||t.date===d)&&`${t.id} ${t.description} ${t.method}`.toLowerCase().includes(q));rows.sort((a,b)=>sort==='oldest'?a.date.localeCompare(b.date):sort==='high'?b.amount-a.amount:sort==='low'?a.amount-b.amount:b.date.localeCompare(a.date));document.getElementById('transaction-list').innerHTML=rows.map(t=>`<tr><td><strong>${t.id}</strong></td><td>${formatDate(t.date)}</td><td>${t.description}</td><td>${t.method}</td><td class="amount-cell">${rupees(t.amount)}</td><td><span class="booking-status status-${t.status==='successful'?'upcoming':t.status==='pending'?'pending':'completed'}">${t.status[0].toUpperCase()+t.status.slice(1)}</span></td><td><button type="button" class="small-outline" data-tx-detail="${t.id}">View Details</button></td></tr>`).join('');document.getElementById('transaction-empty').hidden=rows.length>0;};
    const setFilter=f=>{status=f;paymentsApp.querySelectorAll('[data-tx-filter]').forEach(b=>b.classList.toggle('is-active',b.dataset.txFilter===f));paymentsApp.querySelectorAll('[data-payment-filter]').forEach(b=>b.classList.toggle('is-selected',b.dataset.paymentFilter===f));render();};
    paymentsApp.querySelectorAll('[data-tx-filter]').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.txFilter)));paymentsApp.querySelectorAll('[data-payment-filter]').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.paymentFilter)));
    document.getElementById('payment-search').addEventListener('input',render);document.getElementById('payment-date').addEventListener('change',render);document.getElementById('payment-sort').addEventListener('change',render);
    paymentsApp.addEventListener('click',e=>{const detail=e.target.closest('[data-tx-detail]');if(detail)showTx(tx.find(t=>t.id===detail.dataset.txDetail));const manage=e.target.closest('[data-manage-method]');if(manage){const method=methods.find(m=>m.id===manage.dataset.manageMethod);content.innerHTML=`<span class="modal-kicker">SAVED METHOD</span><h2 id="payment-modal-title">Manage payment method</h2><p class="modal-intro">${method.name} ${method.primary?'· Primary payment method':''}</p><div class="pass-payment-choice"><i class="${method.icon}"></i><span><strong>${method.name}</strong><small>${method.detail}</small></span></div><div class="confirm-actions"><button class="button-outline" type="button" id="set-primary-method" ${method.primary?'disabled':''}>Set as Primary</button><button class="small-danger" type="button" id="remove-payment-method">Remove</button></div>`;modal.hidden=false;content.querySelector('#set-primary-method').addEventListener('click',()=>{methods.forEach(m=>m.primary=m===method);renderMethods();modal.hidden=true;showToast('Primary payment method updated.');});content.querySelector('#remove-payment-method').addEventListener('click',()=>{content.innerHTML=`<span class="modal-kicker">CONFIRM CHANGE</span><h2 id="payment-modal-title">Remove payment method?</h2><p class="modal-intro">${method.name} will be removed from your saved methods.</p><div class="confirm-actions"><button class="confirm-cancel" type="button" data-modal-close>Keep Method</button><button class="confirm-accept" type="button" id="confirm-remove-method">Remove</button></div>`;content.querySelector('#confirm-remove-method').addEventListener('click',()=>{methods=methods.filter(m=>m!==method);renderMethods();modal.hidden=true;showToast('Payment method removed.');});});}const receipt=e.target.closest('[data-receipt-view]');if(receipt){const r=receipts.find(x=>x.id===receipt.dataset.receiptView);content.innerHTML=`<span class="modal-kicker">RECEIPT PREVIEW</span><h2 id="payment-modal-title">${r.id}</h2><p class="modal-intro">${r.booking} · ${formatDate(r.date)}</p><div class="receipt-preview"><i class="fa-solid fa-receipt"></i><strong>${r.description}</strong><span>${rupees(r.amount)}</span><small>Payment received · BounceRush Arena</small></div><button class="button-primary full-button" type="button" data-download-receipt>Download Receipt</button>`;modal.hidden=false;content.querySelector('[data-download-receipt]').addEventListener('click',()=>showToast('Receipt download started.'));}if(e.target.closest('[data-receipt-download]'))showToast('Receipt download started.');});
    let methods=[{id:'visa',name:'Visa ending in 4242',detail:'Card · Expires 08/28',icon:'fa-brands fa-cc-visa',primary:true},{id:'upi',name:'UPI',detail:'example@upi',icon:'fa-solid fa-mobile-screen-button',primary:false}];
    const renderMethods=()=>{document.getElementById('payment-method-list').innerHTML=methods.map(m=>`<article class="saved-method"><span class="method-icon"><i class="${m.icon}"></i></span><span><strong>${m.name}</strong><small>${m.detail}</small></span>${m.primary?'<em>Primary</em>':''}<button type="button" class="small-outline" data-manage-method="${m.id}">Manage</button></article>`).join('')||'<p class="empty-state">No saved payment methods yet.</p>';};
    let receipts=[{id:'BR-RCP-1048',booking:'BR-2026-1048',description:'Bubble Football Session',date:'2026-10-06',amount:998},{id:'BR-RCP-1037',booking:'BR-PASS-2026-03',description:'5-Session Pass',date:'2026-10-04',amount:1999},{id:'BR-RCP-1029',booking:'BR-2026-1029',description:'Zorbing Session',date:'2026-10-03',amount:798}];
    document.getElementById('receipt-list').innerHTML=receipts.map(r=>`<article class="recent-receipt"><span class="receipt-icon"><i class="fa-solid fa-file-invoice"></i></span><div><strong>${r.id}</strong><small>${r.description} · ${formatDate(r.date)}</small></div><b>${rupees(r.amount)}</b><button type="button" class="small-outline" data-receipt-view="${r.id}">View</button><button type="button" class="small-outline" data-receipt-download="${r.id}" aria-label="Download ${r.id}"><i class="fa-solid fa-download"></i></button></article>`).join('');renderMethods();
    document.getElementById('add-payment-method').addEventListener('click',()=>{content.innerHTML=`<span class="modal-kicker">PAYMENT PREFERENCES</span><h2 id="payment-modal-title">Add Payment Method</h2><p class="modal-intro">Choose a demo payment method to add.</p><div class="payment-type-options"><button type="button" data-method-type="Card"><i class="fa-regular fa-credit-card"></i><strong>Card</strong></button><button type="button" data-method-type="UPI"><i class="fa-solid fa-mobile-screen-button"></i><strong>UPI</strong></button><button type="button" data-method-type="Digital Wallet"><i class="fa-solid fa-wallet"></i><strong>Digital Wallet</strong></button></div><div id="method-type-result" class="method-type-result">Select a method to continue.</div>`;modal.hidden=false;content.querySelectorAll('[data-method-type]').forEach(btn=>btn.addEventListener('click',()=>{content.querySelectorAll('[data-method-type]').forEach(b=>b.classList.toggle('is-selected',b===btn));content.querySelector('#method-type-result').innerHTML=`<strong>${btn.dataset.methodType} selected</strong><p>This demo selection will be saved locally for this page.</p><button class="button-primary" id="save-demo-method" type="button">Add ${btn.dataset.methodType}</button>`;content.querySelector('#save-demo-method').addEventListener('click',()=>{methods.push({id:`method-${Date.now()}`,name:btn.dataset.methodType,detail:'Demo payment method',icon:btn.dataset.methodType==='Card'?'fa-regular fa-credit-card':btn.dataset.methodType==='UPI'?'fa-solid fa-mobile-screen-button':'fa-solid fa-wallet',primary:methods.length===0});renderMethods();modal.hidden=true;showToast('Payment method added.');});}));});
    modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-modal-close]'))modal.hidden=true;});paymentsApp.querySelectorAll('[data-tx-filter]').forEach(()=>{});setFilter('all');
  }

  const activityApp=document.getElementById('activity-app');
  if(activityApp){
    const modal=document.getElementById('activity-modal'),content=document.getElementById('activity-modal-content');
    const records=[
      {id:'BR-ACT-2048',title:'Bubble Football session completed',date:'2026-10-07',time:'6:00 PM',category:'session',description:'Your arena session wrapped up. Great game!',related:'BR-2026-1048',status:'Completed',icon:'fa-solid fa-futbol'},
      {id:'BR-ACT-2042',title:'5-Session Pass purchased',date:'2026-10-06',time:'4:20 PM',category:'pass',description:'A new pass was added to your account.',related:'BR-PAY-1037',status:'Complete',icon:'fa-solid fa-ticket'},
      {id:'BR-ACT-2037',title:'Booking confirmed',date:'2026-10-05',time:'11:30 AM',category:'booking',description:'Your Bubble Football booking was confirmed.',related:'BR-2026-1048',status:'Confirmed',icon:'fa-regular fa-calendar-check'},
      {id:'BR-ACT-2030',title:'Group booking request submitted',date:'2026-10-03',time:'2:15 PM',category:'group',description:'Your team booking request is being reviewed.',related:'GR-2026-1036',status:'Pending',icon:'fa-solid fa-people-group'},
      {id:'BR-ACT-2025',title:'Payment completed',date:'2026-10-02',time:'10:10 AM',category:'payment',description:'Payment received for your session booking.',related:'BR-PAY-1048',status:'Successful',icon:'fa-solid fa-credit-card'},
      {id:'BR-ACT-2019',title:'Zorbing session booked',date:'2026-09-29',time:'9:45 AM',category:'booking',description:'A Zorbing session was added to your bookings.',related:'BR-2026-1029',status:'Confirmed',icon:'fa-solid fa-circle-dot'},
      {id:'BR-ACT-2012',title:'Booking cancelled',date:'2026-09-25',time:'1:00 PM',category:'booking',description:'Your session booking was cancelled.',related:'BR-2026-1018',status:'Cancelled',icon:'fa-solid fa-calendar-xmark'},
      {id:'BR-ACT-2008',title:'Refund processed',date:'2026-09-24',time:'3:40 PM',category:'payment',description:'₹499 refund returned to your original payment method.',related:'BR-PAY-1018',status:'Refunded',icon:'fa-solid fa-arrow-rotate-left'}
    ];
    const dateText=r=>r.date==='2026-10-07'?`Today, ${r.time}`:r.date==='2026-10-06'?`Yesterday, ${r.time}`:new Date(`${r.date}T12:00:00`).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
    const view=r=>{content.innerHTML=`<span class="modal-kicker">${r.category.toUpperCase()} ACTIVITY</span><h2 id="activity-modal-title">${r.title}</h2><p class="modal-intro">${r.description}</p><div class="modal-details"><div><span>Activity type</span><strong>${r.category}</strong></div><div><span>Date & time</span><strong>${dateText(r)}</strong></div><div><span>Reference ID</span><strong>${r.id}</strong></div><div><span>Related booking/payment</span><strong>${r.related}</strong></div><div><span>Status</span><strong>${r.status}</strong></div></div><button class="button-outline full-button" type="button" data-modal-close>Close</button>`;modal.hidden=false;};
    const recentFilter=f=>{const rows=records.filter(r=>f==='all'||r.category===f);document.getElementById('recent-timeline').innerHTML=rows.slice(0,6).map(r=>`<article class="timeline-item"><span class="timeline-icon"><i class="${r.icon}"></i></span><div class="timeline-copy"><div class="timeline-title"><strong>${r.title}</strong><span class="category-badge">${r.category}</span></div><small>${dateText(r)}</small><p>${r.description}</p><button class="button-link" type="button" data-activity-detail="${r.id}">View Details <i class="fa-solid fa-arrow-right"></i></button></div></article>`).join('')||'<p class="empty-state">No recent activity in this category.</p>';};
    const renderHistory=()=>{const q=document.getElementById('activity-search').value.trim().toLowerCase(),category=document.getElementById('activity-category').value,period=document.getElementById('activity-date').value,sort=document.getElementById('activity-sort').value,now=new Date('2026-10-07T12:00:00');let rows=records.filter(r=>{const age=(now-new Date(`${r.date}T12:00:00`))/86400000;return(category==='all'||r.category===category)&&(`${r.title} ${r.id} ${r.category}`.toLowerCase().includes(q))&&(period==='all'||period==='today'&&age<1||period==='week'&&age<7||period==='month'&&r.date.startsWith('2026-10'));});rows.sort((a,b)=>sort==='oldest'?a.date.localeCompare(b.date):b.date.localeCompare(a.date));document.getElementById('full-activity-list').innerHTML=rows.map(r=>`<article class="history-activity-row"><span class="timeline-icon"><i class="${r.icon}"></i></span><div class="history-activity-main"><strong>${r.title}</strong><small>${r.id} · ${dateText(r)}</small></div><span class="category-badge">${r.category}</span><span class="booking-status ${r.status==='Pending'?'pending':'status-completed'}">${r.status}</span><button class="small-outline" type="button" data-history-detail="${r.id}">View Details</button></article>`).join('');document.getElementById('activity-empty').hidden=rows.length>0;};
    activityApp.querySelectorAll('[data-milestone]').forEach(btn=>btn.addEventListener('click',()=>{content.innerHTML=`<span class="modal-kicker">JOURNEY MILESTONE</span><h2 id="activity-modal-title">${btn.dataset.milestone}</h2><p class="modal-intro">${btn.dataset.copy}</p><button type="button" class="button-outline full-button" data-modal-close>Close</button>`;modal.hidden=false;}));
    activityApp.querySelectorAll('[data-recent-filter]').forEach(btn=>btn.addEventListener('click',()=>{activityApp.querySelectorAll('[data-recent-filter]').forEach(b=>b.classList.toggle('is-active',b===btn));recentFilter(btn.dataset.recentFilter);}));
    activityApp.addEventListener('click',e=>{const item=e.target.closest('[data-activity-detail],[data-history-detail]');if(item)view(records.find(r=>r.id===(item.dataset.activityDetail||item.dataset.historyDetail)));});
    ['activity-search','activity-category','activity-date','activity-sort'].forEach(id=>document.getElementById(id).addEventListener(id==='activity-search'?'input':'change',renderHistory));
    document.getElementById('clear-activity-filters').addEventListener('click',()=>{document.getElementById('activity-search').value='';document.getElementById('activity-category').value='all';document.getElementById('activity-date').value='all';document.getElementById('activity-sort').value='newest';renderHistory();});
    document.getElementById('export-activity').addEventListener('click',()=>showToast('Activity history export started.'));
    modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-modal-close]'))modal.hidden=true;});recentFilter('all');renderHistory();
  }
  document.addEventListener('keydown', event => {
    if(event.key==='Escape') document.querySelectorAll('.modal-overlay:not([hidden])').forEach(modal=>modal.hidden=true);
  });
})();
