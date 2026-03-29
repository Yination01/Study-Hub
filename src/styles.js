/**
 * StudyHub — Global CSS
 * © 2025 Yination & Excalibur. All rights reserved.
 */

const css = `  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg:#0d0f14; --surface:#13161d; --card:#1a1e27; --border:#252a36;
    --text:#e2e6f0; --muted:#8892a4; --input-bg:#0d0f14;
    --shadow:0 8px 32px rgba(0,0,0,.5);
    --radius:12px; --transition:all .22s cubic-bezier(.4,0,.2,1);
  }
  .light {
    --bg:#f0f4fc; --surface:#ffffff; --card:#ffffff; --border:#dde3f0;
    --text:#1a1e2f; --muted:#5a6478; --input-bg:#f5f7ff;
    --shadow:0 8px 32px rgba(0,0,0,.1);
  }

  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh;transition:background .3s,color .3s}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--surface)}::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}

  /* Animations */
  @keyframes spin    {to{transform:rotate(360deg)}}
  @keyframes fadeUp  {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
  @keyframes scaleIn {from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes stagger {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse   {0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
  @keyframes blink   {0%,100%{opacity:1}50%{opacity:0}}
  @keyframes shake   {0%,100%{transform:translateX(0)}25%,75%{transform:translateX(-5px)}50%{transform:translateX(5px)}}
  @keyframes shimmer {0%{opacity:.6}50%{opacity:1}100%{opacity:.6}}

  .fade-up   {animation:fadeUp .28s cubic-bezier(.4,0,.2,1) both}
  .fade-in   {animation:fadeIn .2s ease both}
  .scale-in  {animation:scaleIn .26s cubic-bezier(.4,0,.2,1) both}
  .slide-down{animation:slideDown .22s ease both}
  .shake     {animation:shake .3s ease}
  .stagger-1 {animation:stagger .3s .05s both}
  .stagger-2 {animation:stagger .3s .1s both}
  .stagger-3 {animation:stagger .3s .15s both}
  .stagger-4 {animation:stagger .3s .2s both}

  input:focus,textarea:focus,select:focus{outline:2px solid rgba(79,156,249,.4)!important;outline-offset:0}
  button{transition:var(--transition)}
  button:active{transform:scale(.97)}

  /* Mobile touch targets */
  /* Hide text labels on very small screens */
  @media(max-width:400px){
    .hide-xs{display:none!important}
  }

  /* GPU-accelerate animations */
  .fade-in,.fade-up,.scale-in,.slide-down,.slide-up{will-change:transform,opacity}
  /* Remove will-change after animation to free memory */
  .fade-in,.fade-up,.scale-in{animation-fill-mode:both}

  /* Contain layout shifts in course grid */
  .course-grid>*{contain:layout style}
  @media(max-width:640px){
    /* Touch targets */
    button{min-height:44px}
    .tab-btn{padding:10px 10px!important;font-size:11px!important;min-height:40px}

    /* Layout */
    .topbar{flex-wrap:wrap;gap:8px}
    .course-grid{grid-template-columns:1fr!important}
    .year-tabs{gap:6px!important;overflow-x:auto;flex-wrap:nowrap!important;padding-bottom:4px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    .year-tabs::-webkit-scrollbar{display:none}
    .year-tab{padding:9px 14px!important;flex-shrink:0}

    /* Course view tabs — horizontal scroll */
    .course-tabs-row{overflow-x:auto;flex-wrap:nowrap!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:2px}
    .course-tabs-row::-webkit-scrollbar{display:none}

    /* Auth card — full width */
    .auth-card{padding:22px 18px!important;border-radius:12px!important}

    /* Home padding */
    .home-page{padding:20px 14px 100px!important}

    /* Course view padding */
    .course-page{padding:16px 14px 110px!important}

    /* Admin panel */
    .admin-page{padding:20px 12px 80px!important}

    /* Definitions table — stack on mobile */
    .def-grid{grid-template-columns:1fr!important}
    .def-term{border-bottom:none!important;border-right:none!important;padding-bottom:4px!important}

    /* Chatbot — full width at bottom */
    .chatbot-panel{right:0!important;left:0!important;width:100%!important;bottom:52px!important;border-radius:14px 14px 0 0!important;max-height:60vh!important}
    .chatbot-btn{right:12px!important;bottom:60px!important}

    /* Notification dropdown handled by position:fixed inline */

    /* Cards */
    .modal-inner{padding:20px 16px!important;border-radius:14px!important}

    /* Hide keyboard shortcut hint on mobile */
    .kbd-hint{display:none!important}

    /* Upload modal full height */
    .upload-modal{max-height:95vh!important}

    /* Year/semester pickers — 2 columns on mobile */
    .year-picker-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  }

  /* ── Tablet: 641–900px ── */
  @media(min-width:641px) and (max-width:900px){
    .course-grid{grid-template-columns:repeat(2,1fr)!important}
    .year-tabs{flex-wrap:wrap;gap:8px}
  }

  /* ── Safe area for notched phones ── */
  @supports(padding:max(0px)){
    .copyright-bar{padding-bottom:max(7px,env(safe-area-inset-bottom))!important}
    .course-page,.home-page{padding-bottom:max(88px,calc(52px + env(safe-area-inset-bottom)))!important}
  }

  @keyframes slideUp {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideDown {from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
  .slide-up{animation:slideUp .28s cubic-bezier(.4,0,.2,1) both}
  .slide-down{animation:slideDown .28s cubic-bezier(.4,0,.2,1) both}

  /* Focus visible — keyboard nav */
  :focus-visible{outline:2px solid rgba(79,156,249,.6)!important;outline-offset:2px}

  /* Text selection colour */
  ::selection{background:rgba(79,156,249,.25);color:var(--text)}

  /* Smooth transitions on theme switch */
  *{transition:background-color .25s,border-color .25s,color .15s}
  button,input,textarea,select{transition:background-color .25s,border-color .25s,color .15s,transform .1s,box-shadow .15s}
  @media print{
    .no-print{display:none!important}
    body{background:#fff!important;color:#000!important}
    .print-content{padding:20px}
    h1,h2,h3{color:#000!important}
    .course-card-print{page-break-inside:avoid;margin-bottom:16px;border:1px solid #ccc;padding:12px;border-radius:8px}
    .q-print{page-break-inside:avoid;margin-bottom:12px;border-bottom:1px solid #eee;padding-bottom:12px}
  }

  /* Blur backdrop for modals */
  .modal-overlay{
    position:fixed;inset:0;background:rgba(0,0,0,.72);
    backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    display:flex;align-items:center;justify-content:center;
    z-index:2500;padding:20px;overflow-y:auto
  }`;

export default css;
