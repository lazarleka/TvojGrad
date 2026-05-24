import { G } from './constants';

export const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:${G.paper};color:${G.ink};min-height:100vh}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${G.greenMid};border-radius:10px}
  .app{min-height:100vh;display:flex;flex-direction:column}

  /* NAV */
  .nav{position:sticky;top:0;z-index:200;background:rgba(247,250,248,0.95);backdrop-filter:blur(12px);border-bottom:1px solid ${G.border};padding:0 2rem;height:60px;display:flex;align-items:center;justify-content:space-between}
  .nav-logo{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:${G.greenDark};cursor:pointer;display:flex;align-items:center;gap:6px;text-decoration:none}
  .nav-logo span{color:${G.green}}
  .nav-links{display:flex;align-items:center;gap:2px}
  .nav-link{background:none;border:none;padding:7px 13px;border-radius:8px;font-size:14px;font-family:'DM Sans',sans-serif;color:${G.muted};cursor:pointer;transition:all 0.15s;font-weight:500;display:flex;align-items:center;gap:5px}
  .nav-link:hover,.nav-link.active{background:${G.greenLight};color:${G.greenDark}}
  .nav-link.cta{background:${G.green};color:#fff!important;margin-left:6px}
  .nav-link.cta:hover{background:${G.greenDark}}
  .nav-badge{background:${G.danger};color:#fff;font-size:10px;font-weight:700;width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-left:2px}
  .nav-user{display:flex;align-items:center;gap:8px;padding:5px 12px;border-radius:20px;background:${G.greenLight};cursor:pointer;font-size:13px;font-weight:500;color:${G.greenDark};border:none;font-family:'DM Sans',sans-serif}

  /* HERO */
  .hero{background:linear-gradient(135deg,${G.greenDark} 0%,${G.green} 60%,${G.greenMid} 100%);padding:4rem 2rem 3rem;text-align:center;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 70% 20%,rgba(255,255,255,0.08) 0%,transparent 60%)}
  .hero-title{font-family:'Playfair Display',serif;font-size:48px;font-weight:700;color:#fff;line-height:1.15;margin-bottom:1rem;position:relative}
  .hero-title em{font-style:italic;color:${G.greenMid}}
  .hero-sub{font-size:17px;color:rgba(255,255,255,0.82);margin-bottom:2rem;max-width:500px;margin-left:auto;margin-right:auto;font-weight:300;position:relative}
  .search-wrap{background:#fff;border-radius:16px;padding:10px 10px 10px 16px;display:flex;gap:8px;max-width:600px;margin:0 auto 1.5rem;box-shadow:0 8px 32px rgba(0,0,0,0.14);position:relative}
  .search-wrap input{flex:1;border:none;outline:none;font-size:15px;font-family:'DM Sans',sans-serif;color:${G.ink};background:transparent}
  .search-wrap select{border:none;outline:none;font-size:13px;font-family:'DM Sans',sans-serif;color:${G.muted};background:transparent;cursor:pointer}
  .search-wrap button{background:${G.green};color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:14px;font-family:'DM Sans',sans-serif;cursor:pointer;font-weight:500;white-space:nowrap}
  .filter-chips{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;position:relative}
  .chip{background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:6px 16px;font-size:13px;cursor:pointer;color:#fff;transition:all 0.15s;font-family:'DM Sans',sans-serif;font-weight:500}
  .chip:hover,.chip.active{background:#fff;color:${G.greenDark};border-color:#fff}

  /* MAIN */
  .main{flex:1;max-width:1100px;margin:0 auto;padding:2rem;width:100%}
  .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem}
  .section-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:${G.greenDark}}
  .section-sub{font-size:13px;color:${G.muted}}
  .divider{height:1px;background:${G.border};margin:2rem 0}

  /* EVENT CARDS */
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem}
  .card{background:#fff;border:1px solid ${G.border};border-radius:16px;overflow:hidden;cursor:pointer;transition:all 0.2s;position:relative}
  .card:hover{border-color:${G.green};box-shadow:0 8px 24px rgba(29,158,117,0.12);transform:translateY(-2px)}
  .card-img{height:160px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;background:#eee}
  .card-img img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
  .card-img-emoji{font-size:56px;position:relative;z-index:1}
  .card-img-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.18);z-index:1;display:none}
  .card-img:hover .card-img-overlay{display:block}
  .card-promo{position:absolute;top:10px;left:10px;background:${G.green};color:#fff;font-size:10px;font-weight:600;padding:3px 10px;border-radius:10px;z-index:2}
  .card-fav{position:absolute;top:10px;right:10px;background:#fff;border:none;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.12);z-index:2;transition:transform 0.15s}
  .card-fav:hover{transform:scale(1.15)}
  .card-body{padding:1rem}
  .card-cat{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px}
  .card-title{font-size:15px;font-weight:600;margin-bottom:8px;color:${G.ink};line-height:1.3}
  .card-meta{display:flex;flex-direction:column;gap:3px}
  .card-meta-row{font-size:12px;color:${G.muted};display:flex;align-items:center;gap:5px}
  .card-footer{display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1rem;border-top:1px solid ${G.border}}
  .votes{display:flex;gap:6px}
  .vote-btn{background:none;border:1px solid ${G.border};border-radius:20px;padding:4px 10px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;color:${G.muted};font-family:'DM Sans',sans-serif;transition:all 0.15s}
  .vote-btn:hover,.vote-btn.up-active{background:${G.greenLight};border-color:${G.green};color:${G.greenDark}}
  .vote-btn.down-active{background:#fdf0f0;border-color:${G.danger};color:${G.danger}}
  .price-tag{font-size:12px;font-weight:600;color:${G.green}}

  /* DETAIL */
  .detail-back{background:none;border:none;font-size:14px;color:${G.green};cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;margin-bottom:1.5rem;display:flex;align-items:center;gap:4px;padding:0}
  .detail-hero{border-radius:20px;overflow:hidden;margin-bottom:2rem;position:relative;height:280px;display:flex;align-items:flex-end}
  .detail-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .detail-hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,80,65,0.92) 0%,rgba(8,80,65,0.3) 60%,transparent 100%)}
  .detail-hero-content{position:relative;z-index:2;padding:2rem;width:100%}
  .detail-hero-emoji{font-size:48px;display:block;margin-bottom:0.5rem}
  .detail-cat{font-size:12px;font-weight:600;color:${G.greenMid};text-transform:uppercase;letter-spacing:1px}
  .detail-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:#fff}
  .detail-hero-meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:0.75rem}
  .detail-hero-meta span{background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.22);color:#fff;border-radius:999px;padding:5px 10px;font-size:12px;font-weight:500}
  .detail-img-change{position:absolute;top:12px;right:12px;z-index:3;background:rgba(255,255,255,0.92);border:none;border-radius:10px;padding:6px 14px;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:5px;color:${G.greenDark}}
  .detail-grid{display:grid;grid-template-columns:2fr 1fr;gap:1.5rem}
  .detail-card{background:#fff;border:1px solid ${G.border};border-radius:16px;padding:1.5rem;margin-bottom:1rem}
  .detail-card h3{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;margin-bottom:1rem;color:${G.greenDark}}
  .detail-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1rem}
  .detail-card-head h3{margin-bottom:0.35rem}
  .detail-card-head p{font-size:13px;color:${G.muted};line-height:1.6}
  .detail-info-row{display:flex;align-items:center;padding:10px 0;border-bottom:1px solid ${G.border}}
  .detail-info-row:last-child{border-bottom:none}
  .detail-label{font-size:12px;color:${G.muted};font-weight:500}
  .detail-value{font-size:14px;font-weight:500;color:${G.ink}}

  /* BUTTONS */
  .btn-primary{background:${G.green};color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:14px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;width:100%;margin-top:0.75rem;transition:background 0.15s;display:flex;align-items:center;justify-content:center;gap:6px}
  .btn-primary:hover{background:${G.greenDark}}
  .btn-outline{background:none;border:1px solid ${G.border};color:${G.ink};border-radius:10px;padding:9px 20px;font-size:14px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;width:100%;margin-top:0.5rem;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:6px}
  .btn-outline:hover{border-color:${G.green};color:${G.green}}
  .btn-sm{padding:6px 14px;font-size:13px;width:auto;margin-top:0}

  /* PSM */
  .psm-card{background:linear-gradient(180deg,#fff 0%,${G.paper} 100%)}
  .psm-count{min-width:34px;height:34px;border-radius:50%;background:${G.greenLight};color:${G.greenDark};font-size:13px;font-weight:700;display:inline-flex;align-items:center;justify-content:center}
  .psm-user{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border:1px solid ${G.border};border-radius:12px;margin-bottom:8px;transition:border-color 0.15s}
  .psm-user:hover{border-color:${G.green}}
  .psm-empty{border:1px dashed ${G.border};border-radius:12px;padding:1rem;text-align:center;color:${G.muted};font-size:13px;background:#fff}
  .avatar{width:36px;height:36px;border-radius:50%;background:${G.greenLight};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:${G.greenDark};flex-shrink:0}
  .avatar-lg{width:48px;height:48px;font-size:16px}
  .psm-status-sent{font-size:12px;color:${G.warning};font-weight:500;display:flex;align-items:center;gap:4px}
  .psm-status-accepted{font-size:12px;color:${G.green};font-weight:500;display:flex;align-items:center;gap:4px}
  .psm-status-rejected{font-size:12px;color:${G.danger};font-weight:500;display:flex;align-items:center;gap:4px}

  /* CHAT */
  .chat-box{border:1px solid ${G.border};border-radius:12px;overflow:hidden;margin-top:0.75rem}
  .chat-header{padding:10px 14px;background:${G.greenLight};border-bottom:1px solid ${G.border};display:flex;align-items:center;justify-content:space-between}
  .chat-header-name{font-size:13px;font-weight:600;color:${G.greenDark}}
  .chat-msgs{height:160px;overflow-y:auto;padding:10px;background:${G.paper};display:flex;flex-direction:column;gap:6px}
  .chat-msg{font-size:13px;padding:8px 12px;border-radius:10px;max-width:78%;background:#fff;border:1px solid ${G.border};line-height:1.4}
  .chat-msg.me{align-self:flex-end;background:${G.green};color:#fff;border-color:${G.green}}
  .chat-msg-sender{font-size:10px;font-weight:600;margin-bottom:3px;opacity:0.7}
  .chat-input-row{display:flex;gap:6px;padding:8px;border-top:1px solid ${G.border};background:#fff}
  .chat-input-row input{flex:1;border:none;outline:none;font-size:13px;font-family:'DM Sans',sans-serif;background:transparent}
  .chat-send{background:${G.green};color:#fff;border:none;border-radius:8px;padding:6px 14px;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500}

  /* INBOX */
  .inbox-thread{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid ${G.border};border-radius:12px;margin-bottom:8px;cursor:pointer;transition:all 0.15s;background:#fff}
  .inbox-thread:hover,.inbox-thread.active-thread{border-color:${G.green};background:${G.greenLight}}
  .inbox-thread-info{flex:1;min-width:0}
  .inbox-thread-name{font-size:14px;font-weight:600;color:${G.ink}}
  .inbox-thread-preview{font-size:12px;color:${G.muted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .inbox-thread-event{font-size:11px;color:${G.green};font-weight:500;margin-top:2px}
  .inbox-unread{width:8px;height:8px;border-radius:50%;background:${G.green};flex-shrink:0}
  .inbox-layout{display:grid;grid-template-columns:320px 1fr;gap:1.25rem;height:500px}
  .inbox-sidebar{border:1px solid ${G.border};border-radius:16px;overflow-y:auto;padding:1rem;background:#fff}
  .inbox-main{border:1px solid ${G.border};border-radius:16px;overflow:hidden;display:flex;flex-direction:column;background:#fff}
  .inbox-main-header{padding:1rem 1.25rem;border-bottom:1px solid ${G.border};background:${G.greenLight};display:flex;align-items:center;gap:12px}
  .inbox-msgs{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:8px;background:${G.paper}}
  .inbox-input{display:flex;gap:8px;padding:1rem;border-top:1px solid ${G.border};background:#fff}
  .inbox-input input{flex:1;border:1px solid ${G.border};border-radius:10px;padding:9px 14px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;color:${G.ink}}
  .inbox-input input:focus{border-color:${G.green}}
  .inbox-empty{display:flex;align-items:center;justify-content:center;flex:1;color:${G.muted};font-size:14px;flex-direction:column;gap:8px}
  .request-list{border:1px solid ${G.border};border-radius:14px;background:${G.paper};padding:1rem;margin-bottom:1rem}
  .request-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${G.greenDark};margin-bottom:0.75rem}
  .request-card{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid ${G.border};border-radius:12px;padding:12px;margin-bottom:8px}
  .request-card:last-child{margin-bottom:0}
  .request-info{flex:1;min-width:0}
  .request-name{font-size:14px;font-weight:700;color:${G.ink}}
  .request-meta{font-size:12px;color:${G.muted};margin-top:2px}
  .request-actions{display:flex;gap:6px;flex-shrink:0}

  /* AUTH */
  .auth-wrap{min-height:calc(100vh - 60px);display:flex;align-items:center;justify-content:center;padding:2rem;background:linear-gradient(135deg,${G.greenLight} 0%,${G.paper} 100%)}
  .auth-card{background:#fff;border:1px solid ${G.border};border-radius:24px;padding:2.5rem;width:100%;max-width:420px;box-shadow:0 16px 48px rgba(29,158,117,0.1)}
  .auth-logo{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:${G.greenDark};text-align:center;margin-bottom:0.5rem}
  .auth-logo span{color:${G.green}}
  .auth-sub{font-size:14px;color:${G.muted};text-align:center;margin-bottom:2rem}
  .auth-tabs{display:flex;border-bottom:1px solid ${G.border};margin-bottom:1.5rem}
  .auth-tab{flex:1;text-align:center;padding:10px;font-size:14px;font-weight:500;cursor:pointer;color:${G.muted};border-bottom:2px solid transparent;transition:all 0.15s;background:none;border-top:none;border-left:none;border-right:none;font-family:'DM Sans',sans-serif}
  .auth-tab.active{color:${G.green};border-bottom-color:${G.green}}
  .auth-btn{width:100%;background:${G.green};color:#fff;border:none;border-radius:10px;padding:12px;font-size:15px;font-family:'DM Sans',sans-serif;cursor:pointer;font-weight:500;margin-top:0.5rem;transition:background 0.15s}
  .auth-btn:hover{background:${G.greenDark}}
  .auth-switch{text-align:center;font-size:13px;color:${G.muted};margin-top:1rem}
  .auth-switch span{color:${G.green};cursor:pointer;font-weight:500}

  /* FORMS */
  .form-group{margin-bottom:1rem}
  .form-label{font-size:13px;font-weight:500;color:${G.ink};display:block;margin-bottom:6px}
  .form-input{width:100%;border:1px solid ${G.border};border-radius:10px;padding:10px 14px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;color:${G.ink};background:#fff;transition:border 0.15s}
  .form-input:focus{border-color:${G.green}}
  .form-select{width:100%;border:1px solid ${G.border};border-radius:10px;padding:10px 14px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;color:${G.ink};background:#fff;cursor:pointer}
  .form-textarea{width:100%;border:1px solid ${G.border};border-radius:10px;padding:10px 14px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;color:${G.ink};resize:vertical;min-height:100px;background:#fff;transition:border 0.15s}
  .form-textarea:focus{border-color:${G.green}}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem}
  .promo-option{border:1px solid ${G.border};background:${G.paper};border-radius:12px;padding:1rem;margin-bottom:1rem}
  .promo-check{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:${G.greenDark};cursor:pointer}
  .promo-check input{width:16px;height:16px;accent-color:${G.green}}
  .promo-note{font-size:12px;color:${G.muted};line-height:1.5;margin-top:8px}

  /* IMAGE UPLOAD */
  .img-upload-zone{border:2px dashed ${G.border};border-radius:12px;padding:2rem;text-align:center;cursor:pointer;transition:all 0.15s;position:relative;overflow:hidden}
  .img-upload-zone:hover,.img-upload-zone.dragover{border-color:${G.green};background:${G.greenLight}}
  .img-upload-zone input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
  .img-upload-preview{width:100%;height:180px;object-fit:cover;border-radius:10px;display:block}

  /* ORGANIZER */
  .page-header{margin-bottom:2rem}
  .page-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:${G.greenDark}}
  .page-sub{font-size:14px;color:${G.muted};margin-top:4px}
  .org-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
  .form-card{background:#fff;border:1px solid ${G.border};border-radius:16px;padding:1.5rem}
  .form-card h3{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:${G.greenDark};margin-bottom:1.25rem}
  .my-event-item{background:#fff;border:1px solid ${G.border};border-radius:12px;padding:1rem;display:flex;align-items:center;gap:1rem;margin-bottom:0.75rem}
  .my-event-emoji{font-size:28px}
  .my-event-info{flex:1}
  .my-event-title{font-size:14px;font-weight:600}
  .my-event-meta{font-size:12px;color:${G.muted};margin-top:2px}
  .my-event-actions{display:flex;flex-direction:column;gap:6px;align-items:flex-end}
  .promo-inline-note{font-size:11px;color:${G.muted};line-height:1.4;margin-top:6px;max-width:320px}
  .status-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:600;margin-top:4px}
  .status-approved{background:${G.greenLight};color:${G.greenDark}}
  .status-pending{background:#FAEEDA;color:#854F0B}
  .status-rejected{background:#FCEBEB;color:#A32D2D}
  .status-promoted{background:#FFF4D8;color:#8A5A00;margin-right:6px}
  .role-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:500}
  .role-visitor{background:${G.greenLight};color:${G.greenDark}}
  .role-organizer{background:#E6F1FB;color:#185FA5}
  .role-admin{background:#EEEDFE;color:#533AB7}

  /* ADMIN */
  .admin-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2rem}
  .stat-card{background:#fff;border:1px solid ${G.border};border-radius:14px;padding:1.25rem}
  .stat-label{font-size:12px;color:${G.muted};font-weight:500;margin-bottom:4px}
  .stat-value{font-size:26px;font-weight:600;color:${G.greenDark}}
  .stat-icon{font-size:20px;margin-bottom:0.5rem}
  .admin-table{width:100%;border-collapse:collapse}
  .admin-table th{text-align:left;font-size:12px;font-weight:600;color:${G.muted};padding:10px 12px;border-bottom:1px solid ${G.border};text-transform:uppercase;letter-spacing:0.5px}
  .admin-table td{padding:12px;border-bottom:1px solid ${G.border};font-size:14px;vertical-align:middle}
  .admin-table tr:last-child td{border-bottom:none}
  .admin-table tr:hover td{background:${G.paper}}
  .action-btn{background:none;border:1px solid;border-radius:8px;padding:5px 12px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;transition:all 0.15s}
  .action-approve{border-color:${G.green};color:${G.green}}
  .action-approve:hover{background:${G.greenLight}}
  .action-reject{border-color:${G.danger};color:${G.danger}}
  .action-reject:hover{background:#fdf0f0}
  .action-delete{border-color:${G.muted};color:${G.muted}}
  .action-delete:hover{background:${G.paper}}
  .tabs{display:flex;border-bottom:1px solid ${G.border};margin-bottom:1.5rem}
  .tab{padding:10px 20px;font-size:14px;font-weight:500;cursor:pointer;color:${G.muted};border-bottom:2px solid transparent;background:none;border-top:none;border-left:none;border-right:none;font-family:'DM Sans',sans-serif;transition:all 0.15s}
  .tab.active{color:${G.green};border-bottom-color:${G.green}}

  /* PROFILE */
  .profile-grid{display:grid;grid-template-columns:280px 1fr;gap:1.5rem}
  .profile-card{background:#fff;border:1px solid ${G.border};border-radius:16px;padding:1.5rem;text-align:center;height:fit-content}
  .profile-avatar{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,${G.green},${G.greenDark});display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#fff;margin:0 auto 1rem}
  .profile-name{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:${G.greenDark};margin-bottom:4px}
  .profile-email{font-size:13px;color:${G.muted};margin-bottom:1rem}
  .profile-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:1rem}
  .profile-stat{background:${G.paper};border-radius:10px;padding:10px;text-align:center}
  .profile-stat-val{font-size:20px;font-weight:700;color:${G.greenDark}}
  .profile-stat-label{font-size:10px;color:${G.muted};font-weight:500}
  .profile-nav{display:flex;flex-direction:column;gap:4px;margin-top:1rem}
  .profile-nav-btn{background:none;border:none;border-radius:10px;padding:9px 14px;font-size:14px;font-family:'DM Sans',sans-serif;font-weight:500;color:${G.muted};cursor:pointer;text-align:left;transition:all 0.15s;display:flex;align-items:center;gap:8px}
  .profile-nav-btn:hover,.profile-nav-btn.active{background:${G.greenLight};color:${G.greenDark}}

  /* POPULAR */
  .popular-item{display:flex;align-items:center;gap:1rem;padding:1rem;background:#fff;border:1px solid ${G.border};border-radius:14px;margin-bottom:0.75rem;cursor:pointer;transition:all 0.15s}
  .popular-item:hover{border-color:${G.green};transform:translateX(4px)}
  .popular-rank{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;color:${G.greenMid};min-width:36px}
  .popular-emoji{font-size:32px}
  .popular-info{flex:1}
  .popular-name{font-size:15px;font-weight:600;color:${G.ink}}
  .popular-meta{font-size:12px;color:${G.muted};margin-top:2px}
  .popular-votes{font-size:14px;font-weight:600;color:${G.green};background:${G.greenLight};padding:5px 12px;border-radius:10px}

  /* TOAST */
  .toast-wrap{position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none}
  .toast{background:${G.greenDark};color:#fff;padding:12px 18px;border-radius:12px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,0.15);animation:toastIn 0.2s ease}
  @keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

  /* FOOTER */
  .footer{background:#fff;border-top:1px solid ${G.border};padding:2rem;text-align:center;font-size:13px;color:${G.muted}}
  .footer strong{color:${G.greenDark};font-family:'Playfair Display',serif}
  .empty{text-align:center;padding:3rem;color:${G.muted}}
  .empty-icon{font-size:48px;display:block;margin-bottom:1rem}
`;
