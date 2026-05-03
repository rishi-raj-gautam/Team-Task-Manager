import { useState } from 'react';
import { createPortal } from 'react-dom';

export const InviteMemberModal = ({ isOpen, onClose }) => {
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'Member' });

  if (!isOpen) return null;

  return createPortal(
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',background:'rgba(0,0,0,0.5)'}}>
      <div onClick={e => e.stopPropagation()} style={{background:'#fff',width:'100%',maxWidth:'440px',borderRadius:'16px',boxShadow:'0 25px 50px rgba(0,0,0,0.25)',overflow:'hidden',fontFamily:'Manrope,sans-serif'}}>
        <div style={{padding:'24px',borderBottom:'1px solid #f0f0f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2 style={{fontSize:'20px',fontWeight:600,color:'#1b1c17',margin:0}}>Invite Member</h2>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'#897270',display:'flex'}}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div style={{padding:'24px',display:'flex',flexDirection:'column',gap:'16px'}}>
          <div>
            <label style={{display:'block',fontSize:'13px',fontWeight:600,color:'#564241',marginBottom:'6px'}}>Email Address</label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
              placeholder="colleague@company.com"
              style={{width:'100%',padding:'10px 14px',border:'1px solid #dcc0be',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
            />
          </div>
          <div>
            <label style={{display:'block',fontSize:'13px',fontWeight:600,color:'#564241',marginBottom:'6px'}}>Assign Role</label>
            <select
              value={inviteForm.role}
              onChange={e => setInviteForm({...inviteForm, role: e.target.value})}
              style={{width:'100%',padding:'10px 14px',border:'1px solid #dcc0be',borderRadius:'8px',fontSize:'14px',outline:'none',background:'#fff',cursor:'pointer'}}
            >
              <option value="Admin">Admin</option>
              <option value="Leader">Leader</option>
              <option value="Member">Member</option>
            </select>
          </div>
        </div>
        <div style={{padding:'16px 24px',background:'#f5f4ec',borderTop:'1px solid #f0f0f0',display:'flex',justifyContent:'flex-end',gap:'12px'}}>
          <button onClick={onClose} style={{padding:'8px 16px',background:'none',border:'1px solid #dcc0be',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:600,color:'#564241'}}>Cancel</button>
          <button
            onClick={() => { alert(`Invite sent to ${inviteForm.email} as ${inviteForm.role}!`); onClose(); }}
            style={{padding:'8px 20px',background:'#9f3f3f',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:600}}
          >Send Invite</button>
        </div>
      </div>
    </div>,
    document.body
  );
};
