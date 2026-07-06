'use strict';

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// --- Result definitions ---
const RESULTS = {
  normal_healing: {
    level:'normal', icon:'✅', verdict:'Normal healing',
    sub:'What you are experiencing is expected.',
    explanation:'Your symptoms are consistent with the standard inflammatory and proliferative healing phases. No action beyond your normal aftercare routine is needed.',
    actions:[
      'Continue twice-daily sterile saline rinse (0.9% NaCl wound wash)',
      'Do not touch the piercing with unwashed hands',
      'Do not rotate or move the jewellery',
      'Expect mild tenderness, clear or white lymph fluid, and occasional itching throughout healing',
      'Itching during healing is often a sign of cell proliferation — it is a positive indicator if no other symptoms are present',
    ],
    bioflex: false,
  },
  irritation_adjust: {
    level:'adjust', icon:'🔧', verdict:'Irritation — adjust your aftercare',
    sub:'Something in your routine may be causing this.',
    explanation:'Irritation reactions during healing are usually caused by over-cleaning, harsh products, jewellery movement, or a product applied near the site. This is distinct from infection and does not require medical treatment.',
    actions:[
      'Strip back to saline only — no soap, no sprays, no ointments',
      'Reduce cleaning to once daily if you have been cleaning more than twice',
      'Check for snagging: tight clothing, hair, or sleeping position creating pressure',
      'If jewellery is too short or too tight, book a downsize/exchange with your piercer',
      'A warm saline compress (5 minutes, twice daily) can help reduce irritation bumps',
      'Do not remove the jewellery — this can trap bacteria inside the closing channel',
    ],
    bioflex: true,
  },
  see_piercer: {
    level:'piercer', icon:'👤', verdict:'See your piercer',
    sub:'A jewellery or placement issue likely needs professional attention.',
    explanation:'Your symptoms suggest a jewellery fit, placement, or material issue that requires hands-on assessment. This is not an emergency, but you should book an appointment with your piercer within a few days rather than trying to manage it at home.',
    actions:[
      'Book an appointment with your original piercer or an APP-certified piercer',
      'Describe your symptoms: when they started, what the site looks like, and what jewellery you are wearing',
      'Do not change the jewellery yourself — incorrect self-change is the most common cause of escalating irritation',
      'Continue saline-only aftercare in the meantime',
      'Take photos of the site at the same time each day to document any progression',
    ],
    bioflex: true,
  },
  see_doctor: {
    level:'doctor', icon:'🏥', verdict:'See a doctor',
    sub:'Your symptoms suggest a possible infection or allergic reaction.',
    explanation:'Some of your symptoms are outside the range of normal healing or simple irritation. A doctor can distinguish between infection and allergic contact dermatitis, and prescribe appropriate treatment. Do not delay this appointment — early treatment is far more effective.',
    actions:[
      'Book a GP or urgent care appointment within 24–48 hours',
      'Tell them you have a piercing or tattoo and describe the site and timeline',
      'Do not remove the jewellery without medical advice — removing it while infected can trap bacteria',
      'Continue sterile saline rinse until your appointment',
      'If your symptoms worsen rapidly (see urgent criteria below), go to A&E or urgent care immediately',
      'For tattoo reactions: a dermatologist may be more appropriate than a GP — request a referral if the GP is uncertain',
    ],
    bioflex: false,
  },
  urgent: {
    level:'urgent', icon:'🚨', verdict:'Seek urgent medical care now',
    sub:'Your symptoms need prompt evaluation.',
    explanation:'One or more of your symptoms indicates a potentially serious condition that should not wait. Please go to an emergency department or urgent care centre. Do not wait for a routine GP appointment.',
    actions:[
      'Go to your nearest A&E / emergency department or urgent care centre now',
      'Tell them you have a recent piercing or tattoo and describe all symptoms',
      'Do not remove the jewellery at home — medical staff should assess before any removal',
      'Signs requiring emergency care: high fever (38°C+), red streaks spreading from the site, rapidly increasing swelling, severe pain beyond the site, difficulty swallowing (facial/oral piercings), or feeling generally unwell/faint',
    ],
    bioflex: false,
  },
};

// --- Decision tree ---
// Each node: { q, opts: [{icon, text, sub, next}] }
// next can be a node key (string) or a result key starting with 'R:'
const TREE = {
  start: {
    q: 'What type of procedure did you have?',
    opts: [
      { icon:'💉', text:'Body piercing',     sub:'Any body piercing (not tattoo)',  next:'p_timing' },
      { icon:'🎨', text:'Tattoo',             sub:'New tattoo or touch-up',          next:'t_timing' },
    ],
  },

  // ── PIERCING branch ──────────────────────────────────────────
  p_timing: {
    q: 'How long ago was the piercing done?',
    opts: [
      { icon:'📅', text:'Less than 1 week',       sub:'Very fresh — acute phase',      next:'p_fresh_main' },
      { icon:'📅', text:'1 week – 8 weeks',        sub:'Active healing phase',          next:'p_healing_main' },
      { icon:'📅', text:'More than 8 weeks',        sub:'Late healing or healed',        next:'p_healed_main' },
    ],
  },

  p_fresh_main: {
    q: 'What is your main symptom right now?',
    opts: [
      { icon:'🔴', text:'Redness and mild swelling around the site',      sub:'Site feels warm', next:'p_fresh_redness' },
      { icon:'💧', text:'White or clear fluid / crusting at the site',    sub:'Lymph fluid',     next:'R:normal_healing' },
      { icon:'🟡', text:'Thick yellow or green discharge',                sub:'Pus or unusual colour', next:'p_fresh_pus' },
      { icon:'🌡️', text:'Fever or feeling unwell',                        sub:'Systemic symptoms', next:'R:urgent' },
    ],
  },
  p_fresh_redness: {
    q: 'How far does the redness extend?',
    opts: [
      { icon:'📍', text:'Just around the piercing entry/exit points',    sub:'Localised',                    next:'R:normal_healing' },
      { icon:'↔️', text:'Spreading beyond the jewellery in all directions', sub:'1cm+ from site',           next:'p_spreading_fever' },
    ],
  },
  p_fresh_pus: {
    q: 'Are there any other symptoms alongside the discharge?',
    opts: [
      { icon:'🌡️', text:'Fever, chills, or feeling generally unwell',     sub:'Systemic signs',               next:'R:urgent' },
      { icon:'🔴', text:'Increasing redness spreading from the site',    sub:'No fever but spreading',       next:'R:see_doctor' },
      { icon:'🟡', text:'Discharge only — no fever, redness is local',   sub:'Localised only',               next:'R:see_doctor' },
    ],
  },
  p_spreading_fever: {
    q: 'Do you have a fever or red streaks extending from the site?',
    opts: [
      { icon:'🌡️', text:'Yes — fever (38°C+) or visible red streaks',    sub:'Lymphangitis risk',            next:'R:urgent' },
      { icon:'❌', text:'No fever, no streaks — just redness spreading', sub:'May be irritant',              next:'R:see_doctor' },
    ],
  },

  p_healing_main: {
    q: 'What is your main symptom?',
    opts: [
      { icon:'⛰️', text:'Small raised bump next to the hole',             sub:'Irritation bump / nodule',     next:'p_bump' },
      { icon:'💧', text:'Normal crusties (white/clear) continuing',       sub:'Expected discharge',           next:'R:normal_healing' },
      { icon:'🔴', text:'Increased redness, heat, or new swelling',       sub:'After initial healing period', next:'p_redness_late' },
      { icon:'🟡', text:'Thick yellow or foul-smelling discharge',        sub:'Unusual discharge',            next:'p_fresh_pus' },
      { icon:'🌡️', text:'Fever or feeling unwell',                        sub:'Systemic symptoms',            next:'R:urgent' },
    ],
  },
  p_bump: {
    q: 'How long has the bump been there?',
    opts: [
      { icon:'📅', text:'Less than 2 weeks',         sub:'Recently appeared',            next:'p_bump_trigger' },
      { icon:'📅', text:'More than 2 weeks',          sub:'Persistent',                   next:'R:see_piercer' },
    ],
  },
  p_bump_trigger: {
    q: 'Did anything happen before the bump appeared?',
    opts: [
      { icon:'👆', text:'Snagging, pressure, or trauma to the site',     sub:'Physical cause',               next:'R:irritation_adjust' },
      { icon:'🧴', text:'Changed aftercare product or started new soap', sub:'Product change',               next:'R:irritation_adjust' },
      { icon:'❓', text:'Nothing specific — appeared on its own',         sub:'No clear trigger',             next:'R:irritation_adjust' },
    ],
  },
  p_redness_late: {
    q: 'Is the redness spreading or staying in the same area?',
    opts: [
      { icon:'📍', text:'Staying in the same small area',                sub:'Localised',                    next:'R:irritation_adjust' },
      { icon:'↔️', text:'Visibly spreading outward from the site',       sub:'Expanding',                    next:'R:see_doctor' },
    ],
  },

  p_healed_main: {
    q: 'What is your main symptom?',
    opts: [
      { icon:'⛰️', text:'New bump has appeared at healed site',           sub:'No prior issues',              next:'p_healed_bump' },
      { icon:'🔴', text:'Redness and irritation after changing jewellery',sub:'Post-change reaction',         next:'p_healed_metal' },
      { icon:'🟡', text:'Discharge from a piercing that was fully healed',sub:'Renewed symptoms',             next:'R:see_doctor' },
      { icon:'🌡️', text:'Fever or significant swelling',                   sub:'Systemic or severe',          next:'R:urgent' },
    ],
  },
  p_healed_bump: {
    q: 'When did the bump appear relative to any jewellery change?',
    opts: [
      { icon:'💍', text:'Shortly after changing to new jewellery',        sub:'Possible material reaction',   next:'p_healed_metal' },
      { icon:'⏱️', text:'No recent jewellery change',                      sub:'Spontaneous',                  next:'R:see_piercer' },
    ],
  },
  p_healed_metal: {
    q: 'What material is the current jewellery made of?',
    opts: [
      { icon:'⚙️', text:'Surgical steel or unknown metal',                sub:'Potential nickel content',     next:'R:irritation_adjust' },
      { icon:'🔵', text:'Gold, silver, or fashion jewellery',             sub:'Variable purity',              next:'R:irritation_adjust' },
      { icon:'✅', text:'Implant-grade titanium or BioFlex®',             sub:'High-grade material',          next:'R:see_piercer' },
    ],
  },

  // ── TATTOO branch ────────────────────────────────────────────
  t_timing: {
    q: 'How long ago was the tattoo done?',
    opts: [
      { icon:'📅', text:'Less than 2 weeks',        sub:'Fresh tattoo',                 next:'t_fresh_main' },
      { icon:'📅', text:'2 weeks – 3 months',        sub:'Healing phase',                next:'t_healing_main' },
      { icon:'📅', text:'More than 3 months',        sub:'Healed or long-term',          next:'t_healed_main' },
    ],
  },

  t_fresh_main: {
    q: 'What is your main symptom?',
    opts: [
      { icon:'🔴', text:'Redness and mild swelling — warm to touch',     sub:'Around tattooed area',         next:'t_fresh_redness' },
      { icon:'🧊', text:'Peeling and flaking skin over the tattoo',       sub:'Surface shedding',             next:'R:normal_healing' },
      { icon:'😤', text:'Intense itching across the tattooed area',       sub:'Widespread itch',              next:'t_itch' },
      { icon:'🟡', text:'Oozing, crust, or unusual discharge from the tattoo', sub:'Weeping beyond normal plasma', next:'t_fresh_discharge' },
      { icon:'🌡️', text:'Fever or feeling unwell',                        sub:'Systemic symptoms',            next:'R:urgent' },
    ],
  },
  t_fresh_redness: {
    q: 'Is the redness spreading beyond the tattooed area?',
    opts: [
      { icon:'📍', text:'Staying within or just around the tattooed area', sub:'Localised',                   next:'R:normal_healing' },
      { icon:'↔️', text:'Spreading visibly beyond the tattoo boundary',   sub:'Expanding daily',              next:'t_spreading' },
    ],
  },
  t_spreading: {
    q: 'Any additional symptoms alongside the spreading redness?',
    opts: [
      { icon:'🌡️', text:'Fever, red streaks, or feeling generally unwell', sub:'Systemic involvement',        next:'R:urgent' },
      { icon:'❌', text:'No fever — only redness spreading',              sub:'No systemic symptoms',         next:'R:see_doctor' },
    ],
  },
  t_itch: {
    q: 'How would you describe the itch and what does the skin look like?',
    opts: [
      { icon:'✅', text:'General itching, skin looks normal, no bumps',   sub:'Normal healing itch',          next:'R:normal_healing' },
      { icon:'⛰️', text:'Raised, bumpy rash or hives over the ink',       sub:'Papules or urticaria',         next:'R:see_doctor' },
      { icon:'💦', text:'Blistering or weeping over a specific colour',   sub:'Localised to one ink colour',  next:'R:see_doctor' },
    ],
  },
  t_fresh_discharge: {
    q: 'What does the discharge look like?',
    opts: [
      { icon:'🔵', text:'Clear or slightly blood-tinged fluid — no smell', sub:'Normal plasma weep',           next:'R:normal_healing' },
      { icon:'🟡', text:'Yellow, green, or foul-smelling',                sub:'Possible infection',           next:'t_discharge_sev' },
    ],
  },
  t_discharge_sev: {
    q: 'Any other symptoms?',
    opts: [
      { icon:'🌡️', text:'Fever, chills, or feeling unwell',               sub:'Systemic signs',               next:'R:urgent' },
      { icon:'❌', text:'No fever — unusual discharge only',              sub:'Localised only',               next:'R:see_doctor' },
    ],
  },

  t_healing_main: {
    q: 'What is your main symptom?',
    opts: [
      { icon:'🧊', text:'Continued peeling and itching — tattoo looks faded', sub:'Healing stage',             next:'R:normal_healing' },
      { icon:'🔴', text:'Persistent redness or raised area over one colour',  sub:'Colour-specific',          next:'t_colour_reaction' },
      { icon:'🟡', text:'New discharge or weeping at healed area',            sub:'Unexpected return',        next:'R:see_doctor' },
      { icon:'😤', text:'Intense itch with raised bumps — spreading',         sub:'Allergic signs',            next:'R:see_doctor' },
      { icon:'🌡️', text:'Fever or feeling unwell',                            sub:'Systemic',                 next:'R:urgent' },
    ],
  },
  t_colour_reaction: {
    q: 'Which colour seems to be affected?',
    opts: [
      { icon:'🔴', text:'Red, orange, or yellow ink',                     sub:'Highest sensitisation rate',   next:'R:see_doctor' },
      { icon:'⬛', text:'Black ink only',                                  sub:'Less common',                  next:'R:see_doctor' },
      { icon:'🔵', text:'Multiple colours or the whole tattoo',            sub:'Generalised',                  next:'R:see_doctor' },
    ],
  },

  t_healed_main: {
    q: 'What is your main symptom?',
    opts: [
      { icon:'⛰️', text:'Raised, itchy, or thickened area over the tattoo', sub:'Long after healing',          next:'t_healed_raised' },
      { icon:'🔵', text:'Ink fading or colour change over time',            sub:'Appearance only',             next:'R:see_piercer' },
      { icon:'🟡', text:'Sudden swelling or redness at old healed tattoo',  sub:'Unexpected return',           next:'R:see_doctor' },
    ],
  },
  t_healed_raised: {
    q: 'Is this affecting a specific ink colour area, or the whole tattoo?',
    opts: [
      { icon:'🎨', text:'Specific colour — red, yellow, or orange area only', sub:'Colour-specific reaction', next:'R:see_doctor' },
      { icon:'🌐', text:'Entire tattoo or all black areas',                   sub:'Generalised',               next:'R:see_doctor' },
    ],
  },
};

// --- Wizard state ---
let history = [];
let currentKey = 'start';
const totalSteps = 5; // approximate for progress bar

const wizardEl = document.getElementById('wizard');

function getProgress() {
  return Math.min(100, Math.round(history.length / totalSteps * 100));
}

function render(nodeKey) {
  currentKey = nodeKey;

  // Is it a result?
  if (nodeKey.startsWith('R:')) {
    renderResult(nodeKey.slice(2));
    return;
  }

  const node = TREE[nodeKey];
  if (!node) return;

  const backHtml = history.length > 0
    ? `<button class="back-btn" id="back-btn">← Back</button>`
    : '';

  const optsHtml = node.opts.map((o, i) => `
    <button class="opt-btn" data-next="${escHtml(o.next)}" data-idx="${i}">
      <span class="opt-icon">${o.icon}</span>
      <span class="opt-text">
        ${escHtml(o.text)}
        ${o.sub ? `<span class="opt-sub">${escHtml(o.sub)}</span>` : ''}
      </span>
    </button>`).join('');

  wizardEl.innerHTML = `
    <div class="progress-wrap">
      <div class="progress-label">Step ${history.length + 1}</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${getProgress()}%"></div></div>
    </div>
    <div class="step-card">
      <div class="step-question">${escHtml(node.q)}</div>
      <div class="step-options">${optsHtml}</div>
    </div>
    ${backHtml}`;

  wizardEl.querySelectorAll('.opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      history.push(currentKey);
      render(btn.dataset.next);
    });
  });

  const backBtn = wizardEl.querySelector('#back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      render(history.pop());
    });
  }
}

function renderResult(resultKey) {
  const r = RESULTS[resultKey];
  if (!r) return;

  const actionsHtml = r.actions.map(a => `<li>${escHtml(a)}</li>`).join('');

  const bioflex = r.bioflex
    ? `<div class="result-section">
        <div class="result-section-title">Jewellery recommendation</div>
        <p class="result-body">Switching to a flexible, low-trauma material significantly reduces ongoing irritation. <a href="https://poliinternational.com/bioflex/" target="_blank" rel="noopener noreferrer">BioFlex® polymer</a> is particularly beneficial for movement-stressed placements and for clients with known metal sensitivities — it flexes with the body rather than creating rigid pressure at the fistula.</p>
      </div>`
    : '';

  wizardEl.innerHTML = `
    <div class="result-card">
      <div class="result-banner level-${escHtml(r.level)}">
        <span class="result-icon">${r.icon}</span>
        <div>
          <div class="result-verdict level-${escHtml(r.level)}">${escHtml(r.verdict)}</div>
          <div class="result-sub">${escHtml(r.sub)}</div>
        </div>
      </div>
      <div class="result-section">
        <div class="result-section-title">What this means</div>
        <p class="result-body">${escHtml(r.explanation)}</p>
      </div>
      <div class="result-section">
        <div class="result-section-title">Recommended actions</div>
        <ul class="action-list">${actionsHtml}</ul>
      </div>
      ${bioflex}
    </div>
    <button class="restart-btn" id="restart-btn">↩ Start over — assess a different symptom</button>`;

  wizardEl.querySelector('#restart-btn').addEventListener('click', () => {
    history = [];
    render('start');
  });
}

render('start');
