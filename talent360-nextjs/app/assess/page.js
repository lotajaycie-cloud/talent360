'use client';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../lib/store';
import { CAPTIONS } from '../../lib/captions';
import {
  pendingAssessment, emp, APT_BASE, APT_EXTRA, BEHAVIOR, CAPACITY,
  sectionRating, performanceFinal, potentialFinal,
} from '../../lib/helpers';

function ratingLabel(v) { return {Low:'Low', Med:'Medium', High:'High'}[v]; }

export default function AssessPage() {
  const { employees, currentUser, myTeam, assessmentDrafts, saveDraftScore, saveDraftField, submitAssessment } = useApp();
  const scoped = currentUser.role === 'PEOPLE_MANAGER';
  const pending = pendingAssessment(scoped ? myTeam() : employees);

  const [selectedId, setSelectedId] = useState(pending[0]?.id || null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (pending.length && !pending.some(e => e.id === selectedId)) setSelectedId(pending[0].id);
  }, [pending, selectedId]);

  if (pending.length === 0) {
    return (
      <>
        <p className="section-title">Talent assessment</p>
        <p className="section-sub">{scoped ? 'Scoped to your direct reports. ' : ''}Behavioral indicators are the exact wording from the L1–L4 templates and adjust by level. Each item has its own feedback field with dictation support.</p>
        <div className="card">{scoped ? 'All your direct reports have' : 'All talent in the pool have'} an assessment on file.</div>
      </>
    );
  }

  const selected = emp(employees, selectedId) || pending[0];
  const level = selected.level;
  const draft = assessmentDrafts[selected.id] || {};

  const aptItems = (level === 'DM' || level === 'EXEC') ? [...APT_BASE, ...APT_EXTRA] : APT_BASE;
  const filteredPending = query ? pending.filter(e => e.name.toLowerCase().includes(query.toLowerCase())) : pending;

  return (
    <>
      <p className="section-title">Talent assessment</p>
      <p className="section-sub">{scoped ? 'Scoped to your direct reports. ' : ''}Behavioral indicators are the exact wording from the L1–L4 templates and adjust by level. Each item has its own feedback field with dictation support.</p>

      <div className="card" style={{display:'flex', alignItems:'center', gap:'14px'}}>
        <div style={{flex:1}}>
          <label style={{fontSize:'11px', color:'var(--ink-2)', display:'block', marginBottom:'4px'}}>TALENT ({pending.length} pending — type to search)</label>
          <input
            type="text" placeholder="Search by name..." value={query}
            onChange={e => setQuery(e.target.value)}
            style={{width:'100%', border:'1px solid var(--border)', borderRadius:'8px', padding:'6px 10px', fontSize:'12.5px', marginBottom:'6px'}}
          />
          <select value={selected.id} onChange={e => setSelectedId(e.target.value)}>
            {filteredPending.map(e => <option key={e.id} value={e.id}>{e.name} — {e.position}</option>)}
          </select>
        </div>
        <div className="summary-badge"><span className="snum">Draft</span><span className="stext">In progress<br/>4 sections to rate</span></div>
      </div>

      <AssessmentForm
        key={selected.id}
        empId={selected.id}
        level={level}
        aptItems={aptItems}
        draft={draft}
        onScore={saveDraftScore}
        onFieldSave={saveDraftField}
        onSubmit={() => submitAssessment(selected.id)}
      />
    </>
  );
}

function AssessmentForm({ empId, level, aptItems, draft, onScore, onFieldSave, onSubmit }) {
  const initialRatings = draft.itemRatings || {};
  const initialComments = draft.itemComments || {};
  const [ratings, setRatings] = useState(() => {
    const r = { 'a-bi': 'Med', 'a-val': 'Med' };
    aptItems.forEach((_, i) => r['apt-'+i] = 'Med');
    BEHAVIOR.forEach((_, i) => r['beh-'+i] = 'Med');
    CAPACITY.forEach((_, i) => r['cap-'+i] = 'Med');
    return { ...r, ...initialRatings };
  });
  const [comments, setComments] = useState(initialComments);
  const [overallFeedback, setOverallFeedback] = useState(draft.feedback || '');

  const pf = performanceFinal(ratings['a-bi'], ratings['a-val']);
  const aptVals = aptItems.map((_, i) => ratings['apt-'+i]);
  const aptR = sectionRating(aptVals, aptItems.length === 5 ? 2.6 : 2.75);
  const behVals = BEHAVIOR.map((_, i) => ratings['beh-'+i]);
  const behR = sectionRating(behVals, 2.75);
  const capVals = CAPACITY.map((_, i) => ratings['cap-'+i]);
  const capR = sectionRating(capVals, 2.75);
  const pot = potentialFinal(aptR, behR, capR);

  useEffect(() => {
    onScore(empId, pf, pot, ratings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratings]);

  function setRating(id, value) { setRatings(prev => ({ ...prev, [id]: value })); }
  function setComment(id, value) {
    setComments(prev => ({ ...prev, [id]: value }));
    onFieldSave(empId, id, value);
  }
  function setOverall(value) {
    setOverallFeedback(value);
    onFieldSave(empId, 'overall', value);
  }

  return (
    <>
      <div className="goal-card">
        <div className="goal-head"><span className="gtitle">Performance Drivers</span></div>
        <AssessItem id="a-bi" name="Business impact" level={level} rating={ratings['a-bi']} onRate={setRating} comment={comments['a-bi']||''} onComment={setComment} empId={empId} />
        <AssessItem id="a-val" name="Values assessment" level={level} rating={ratings['a-val']} onRate={setRating} comment={comments['a-val']||''} onComment={setComment} empId={empId} />
        <div className="prow" style={{padding:'10px 0 0'}}><span className="lbl">Final performance</span><span className={`pill ${pf==='High'?'good':pf==='Med'?'warn':'bad'}`}>{pf.toUpperCase()}</span></div>
      </div>

      <div className="goal-card">
        <div className="goal-head"><span className="gtitle">Aptitude</span></div>
        {aptItems.map((n, i) => <AssessItem key={n} id={'apt-'+i} name={n} level={level} rating={ratings['apt-'+i]} onRate={setRating} comment={comments['apt-'+i]||''} onComment={setComment} empId={empId} />)}
        <div className="prow" style={{padding:'10px 0 0'}}><span className="lbl">Subtotal</span><b>{aptR.toUpperCase()}</b></div>
      </div>

      <div className="goal-card">
        <div className="goal-head"><span className="gtitle">Behavior</span></div>
        {BEHAVIOR.map((n, i) => <AssessItem key={n} id={'beh-'+i} name={n} level={level} rating={ratings['beh-'+i]} onRate={setRating} comment={comments['beh-'+i]||''} onComment={setComment} empId={empId} />)}
        <div className="prow" style={{padding:'10px 0 0'}}><span className="lbl">Subtotal</span><b>{behR.toUpperCase()}</b></div>
      </div>

      <div className="goal-card">
        <div className="goal-head"><span className="gtitle">Capacity to Lead</span></div>
        {CAPACITY.map((n, i) => <AssessItem key={n} id={'cap-'+i} name={n} level={level} rating={ratings['cap-'+i]} onRate={setRating} comment={comments['cap-'+i]||''} onComment={setComment} empId={empId} />)}
        <div className="prow" style={{padding:'10px 0 0'}}><span className="lbl">Subtotal</span><b>{capR.toUpperCase()}</b></div>
      </div>

      <div className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div><span className="lbl" style={{display:'block', marginBottom:'4px'}}>FINAL POTENTIAL</span><span className={`pill ${pot==='High'?'good':pot==='Med'?'warn':'bad'}`}>{pot.toUpperCase()}</span></div>
      </div>

      <div className="card">
        <div className="goal-head" style={{marginBottom:'8px'}}><span className="gtitle">Overall Manager Feedback / Comments</span></div>
        <textarea
          rows={4} placeholder="Overall context for this assessment..." value={overallFeedback}
          onChange={e => setOverall(e.target.value)}
          style={{width:'100%', border:'1px solid var(--border)', borderRadius:'10px', padding:'10px 12px', fontSize:'13px', fontFamily:'inherit', resize:'vertical'}}
        />
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginTop:'10px'}}>
          <DictateButton onResult={setOverall} currentValue={overallFeedback} />
        </div>
      </div>
      <button className="btn" onClick={onSubmit}>Submit for calibration</button>
    </>
  );
}

function AssessItem({ id, name, level, rating, onRate, comment, onComment, empId }) {
  const bullets = (CAPTIONS[level] && CAPTIONS[level][name]) || [];
  return (
    <div className="assess-item">
      <div className="item-name">{name}</div>
      {bullets.length > 0 && (
        <ul className="indicator-list">{bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
      )}
      <div className="item-rate-row">
        <span className="lbl" style={{marginBottom:0}}>Rating</span>
        <select value={rating} onChange={e => onRate(id, e.target.value)}>
          <option value="Low">Low</option>
          <option value="Med">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <div className="item-feedback-row">
        <textarea
          rows={2} placeholder="Feedback / comments for this item..." value={comment}
          onChange={e => onComment(id, e.target.value)}
        />
        <DictateButton onResult={v => onComment(id, v)} currentValue={comment} />
      </div>
    </div>
  );
}

// ---- Speech-to-text dictation ----
// Uses the browser's native Web Speech API — no package to install, this IS the
// "plug-in." Chrome/Edge only, needs a secure context (https/localhost) and mic
// permission. Guarded for SSR since window/SpeechRecognition don't exist server-side.
function DictateButton({ onResult, currentValue }) {
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState('');
  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  function toggle() {
    if (listening) { recognitionRef.current?.stop(); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    baseTextRef.current = currentValue ? currentValue.trim() + ' ' : '';
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onstart = () => { setListening(true); setNote('Listening...'); };
    rec.onresult = (event) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t + ' '; else interim += t;
      }
      if (final) baseTextRef.current += final;
      onResult(baseTextRef.current + interim);
    };
    rec.onerror = (event) => {
      setNote((event.error === 'not-allowed' || event.error === 'permission-denied') ? 'Microphone access denied.' : `Dictation error: ${event.error}`);
      setListening(false);
    };
    rec.onend = () => { setListening(false); setNote(''); };
    recognitionRef.current = rec;
    rec.start();
  }

  return (
    <>
      <button
        className="mic-btn" onClick={toggle} disabled={!supported}
        style={!supported ? {opacity:0.35} : {}}
        title={supported ? 'Click to dictate' : 'Speech-to-text needs Chrome or Edge, and a secure (https) connection.'}
      >
        {listening ? '⏺' : '🎤'}
      </button>
      {note && <span className="dictate-note">{note}</span>}
    </>
  );
}
