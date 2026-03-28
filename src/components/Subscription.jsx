import React,{ useState } from 'react';
import { getSubVal } from '../lib/constants.js';

export const TIER_CONFIG = {
  free:    { label:'Free',        color:'#8892a4', icon:'🎓', badge:'Free' },
  pro:     { label:'Student Pro', color:'#f9a84f', icon:'⭐', badge:'Pro'  },
  external:{ label:'External',    color:'#a8f94f', icon:'🌐', badge:'Pro'  },
};

export function SubscriptionBadge({ tier }) {
  const t = TIER_CONFIG[tier] || TIER_CONFIG.free;
  return (
    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
      background:`${t.color}20`, color:t.color,
      border:`1px solid ${t.color}40`, borderRadius:4,
      padding:'1px 6px', letterSpacing:1, fontWeight:700 }}>
      {t.icon} {t.badge}
    </span>
  );
}

export function PaymentPortal({ user, onClose }) {
  const monthly   = getSubVal('pro_price_monthly','500');
  const yearly    = getSubVal('pro_price_yearly','5000');
  const acctName  = getSubVal('payment_account_name','StudyHUB');
  const acctNum   = getSubVal('payment_account_number','0123456789');
  const bank      = getSubVal('payment_bank','OPay');
  const wa        = getSubVal('payment_whatsapp','');
  const dailyLim  = parseInt(getSubVal('free_ai_messages_per_day','5'));
  const [copied, setCopied] = useState(false);

  const copyAcct = () => {
    navigator.clipboard.writeText(acctNum)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="modal-overlay" style={{ zIndex:9960 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="scale-in" style={{
        background:'linear-gradient(160deg,#07119a,#0e8f94)',
        border:'1px solid rgba(255,255,255,.12)',
        borderRadius:20, padding:'32px 28px',
        maxWidth:420, width:'calc(100% - 24px)', margin:'auto',
        boxShadow:'0 20px 60px rgba(0,0,0,.5)',
        position:'relative', overflow:'hidden',
        maxHeight:'90vh', overflowY:'auto',
      }}>
        {/* Glow */}
        <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200,
          borderRadius:'50%', background:'rgba(17,163,168,.3)',
          filter:'blur(60px)', pointerEvents:'none' }}/>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center',
          justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <div style={{ fontFamily:"'DM Serif Display',serif",
              fontSize:24, color:'#fff', marginBottom:2 }}>StudyHub Pro</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.6)' }}>
              Unlock everything — one payment
            </div>
          </div>
          <button onClick={onClose} style={{
            background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)',
            borderRadius:'50%', color:'#fff', cursor:'pointer',
            width:32, height:32, display:'flex', alignItems:'center',
            justifyContent:'center', fontSize:16, flexShrink:0 }}>✕</button>
        </div>

        {/* Tier comparison */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
          {[
            { tier:'Free',  color:'#8892a4',
              features:[`Year ${user?.year||1} only`,`${dailyLim} AI msgs/day`,'No community'] },
            { tier:'Pro ⭐', color:'#f9a84f',
              features:['All years & depts','Unlimited AI','Community + support'] },
          ].map((t,i) => (
            <div key={i} style={{
              background:`rgba(255,255,255,${i===1?.12:.06})`,
              border:`1px solid ${t.color}40`, borderRadius:14, padding:'14px 12px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:t.color, marginBottom:8,
                fontFamily:"'IBM Plex Mono',monospace", letterSpacing:1 }}>{t.tier}</div>
              {t.features.map((f,j) => (
                <div key={j} style={{ fontSize:11, lineHeight:1.4, marginBottom:4,
                  color:i===1?'rgba(255,255,255,.9)':'rgba(255,255,255,.5)',
                  display:'flex', alignItems:'flex-start', gap:5 }}>
                  <span style={{ color:i===1?'#7fda96':'#555', fontSize:10, flexShrink:0 }}>
                    {i===1?'✓':'·'}
                  </span>{f}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div style={{ background:'rgba(255,255,255,.08)',
          border:'1px solid rgba(255,255,255,.15)',
          borderRadius:14, padding:'14px 16px', marginBottom:18 }}>
          <div style={{ display:'flex', justifyContent:'space-between',
            alignItems:'center', marginBottom:8 }}>
            <span style={{ fontSize:13, color:'rgba(255,255,255,.8)' }}>Monthly</span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18,
              color:'#f9a84f', fontWeight:700 }}>₦{monthly}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between',
            alignItems:'center', paddingTop:8,
            borderTop:'1px solid rgba(255,255,255,.1)' }}>
            <span style={{ fontSize:13, color:'rgba(255,255,255,.8)' }}>
              Yearly{' '}
              <span style={{ fontSize:10, color:'#7fda96' }}>
                (save {Math.round((1 - yearly / (monthly * 12)) * 100)}%)
              </span>
            </span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18,
              color:'#f9a84f', fontWeight:700 }}>₦{yearly}</span>
          </div>
        </div>

        {/* Payment details */}
        <div style={{ background:'rgba(0,0,0,.3)',
          border:'1px solid rgba(255,255,255,.1)',
          borderRadius:14, padding:'14px 16px', marginBottom:18 }}>
          <div style={{ fontSize:9, color:'rgba(255,255,255,.45)',
            fontFamily:"'IBM Plex Mono',monospace",
            letterSpacing:2, marginBottom:10 }}>PAYMENT DETAILS</div>
          <div style={{ fontSize:13, color:'#fff', fontWeight:600, marginBottom:6 }}>
            {acctName}
          </div>
          <div style={{ display:'flex', alignItems:'center',
            justifyContent:'space-between', gap:10 }}>
            <div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:22,
                color:'#fff', letterSpacing:2, fontWeight:700 }}>{acctNum}</div>
              <div style={{ fontSize:11, color:'rgba(7,243,7,.9)',
                fontWeight:600, marginTop:2 }}>{bank}</div>
            </div>
            <button onClick={copyAcct} style={{
              background:copied?'rgba(127,218,150,.2)':'rgba(255,255,255,.12)',
              border:`1px solid ${copied?'rgba(127,218,150,.5)':'rgba(255,255,255,.2)'}`,
              borderRadius:8, color:copied?'#7fda96':'#fff',
              cursor:'pointer', padding:'8px 14px',
              fontSize:11, fontWeight:600, flexShrink:0,
              transition:'all .2s' }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div style={{ textAlign:'center', marginBottom:14 }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.6)',
            marginBottom:10, lineHeight:1.5 }}>
            After payment, verify on WhatsApp to activate Pro
          </div>
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'#1fff02', color:'#000',
              padding:'12px 28px', borderRadius:12,
              fontSize:14, fontWeight:700, textDecoration:'none',
              boxShadow:'0 4px 20px rgba(31,255,2,.3)' }}>
              💬 Verify on WhatsApp
            </a>
          ) : (
            <div style={{ fontSize:11, color:'rgba(255,255,255,.35)',
              fontStyle:'italic' }}>
              WhatsApp link not set — contact the admin
            </div>
          )}
        </div>

        <div style={{ fontSize:10, color:'rgba(255,255,255,.3)',
          textAlign:'center', lineHeight:1.6 }}>
          Pro access is activated within 24 hrs of verification.
        </div>
      </div>
    </div>
  );
}
