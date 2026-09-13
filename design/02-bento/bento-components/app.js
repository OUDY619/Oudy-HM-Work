/* ==========================================================================
   Hellomaterials — Meta Testing SOP Application Logic
   ========================================================================== */

let charts = {};

document.addEventListener('DOMContentLoaded', () => {
  initCountUpAnimations();
  initAllCharts();
  runScenarioSimulation();
  updateGeoSkewSimulator();
  updateCBOCannibalizationSimulator();
});

function reanimateAll() {
  initCountUpAnimations();
  Object.keys(charts).forEach(key => { if (charts[key]) charts[key].destroy(); });
  initAllCharts();
  updateGeoSkewSimulator();
  updateCBOCannibalizationSimulator();
}

function initCountUpAnimations() {
  const elements = document.querySelectorAll('.count-up');
  elements.forEach(el => {
    const target = parseFloat(el.getAttribute('data-target'));
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    let current = 0;
    const duration = 1200;
    const steps = 30;
    const increment = target / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = `${prefix}${current.toFixed(target % 1 === 0 ? 0 : 1)}${suffix}`;
    }, stepTime);
  });
}

function updateBudgetCalculator() {
  const vol = parseInt(document.getElementById('creative-volume-slider').value);
  document.getElementById('creative-vol-val').textContent = vol;
  const annualWaste = Math.round(vol * 0.428 * 30 * 12);
  document.getElementById('annual-waste-display').textContent = `$${annualWaste.toLocaleString()} / YEAR WASTED`;
}

let isMissingDataVisible = false;
function toggleDataMissing() {
  isMissingDataVisible = !isMissingDataVisible;
  const alertEl = document.querySelector('.missing-data-alert');
  const btnText = document.getElementById('missing-btn-text');
  if (isMissingDataVisible) {
    alertEl.style.display = 'flex';
    btnText.textContent = 'HIDE MISSING DATA';
  } else {
    alertEl.style.display = 'none';
    btnText.textContent = 'TOGGLE MISSING DATA';
  }
}

function filterGeoTable(tier) {
  const buttons = document.querySelectorAll('.table-filter-bar .filter-pill');
  buttons.forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  const rows = document.querySelectorAll('#geo-data-table tbody tr');
  rows.forEach(row => {
    const rowTier = row.getAttribute('data-tier');
    row.style.display = (tier === 'all' || rowTier === tier) ? '' : 'none';
  });
}

function runScenarioSimulation() {
  const selected = document.getElementById('scenario-selector').value;
  const nodes = document.querySelectorAll('.flow-node');
  nodes.forEach(n => n.className = 'flow-node');
  document.getElementById('gate-b-kill').style.boxShadow = 'none';
  document.getElementById('gate-b-pass').style.boxShadow = 'none';

  const verdictTitle = document.getElementById('sim-verdict-title');
  const verdictText = document.getElementById('sim-verdict-text');

  if (selected === 'scenario-1') {
    document.getElementById('node-start').classList.add('node-active');
    document.getElementById('node-purchase').classList.add('node-active');
    document.getElementById('node-geo').classList.add('node-highlight-kill');
    verdictTitle.textContent = 'DECISION: KILL @ $70 (DAY 7)';
    verdictText.textContent = 'Delivery skewed 64.5% to cheap low-CPM geos without purchase. Cutting at $70 saves $30 waste per creative.';
  } else if (selected === 'scenario-2') {
    document.getElementById('node-start').classList.add('node-active');
    document.getElementById('node-purchase').classList.add('node-active');
    document.getElementById('node-geo').classList.add('node-active');
    document.getElementById('node-metrics').classList.add('node-highlight-continue');
    verdictTitle.textContent = 'DECISION: CONTINUE TO $100';
    verdictText.textContent = 'High-CPM USA audience under-delivered. High hook/CTR secondary metrics justify extending test to $100.';
  } else if (selected === 'scenario-3') {
    document.getElementById('node-start').classList.add('node-active');
    document.getElementById('node-purchase').classList.add('node-highlight-continue');
    verdictTitle.textContent = 'DECISION: CONTINUE TO $100';
    verdictText.textContent = 'Purchase achieved at $70. Creative validated to proceed to Checkpoint B.';
  } else if (selected === 'scenario-4') {
    document.getElementById('node-start').classList.add('node-active');
    document.getElementById('node-purchase').classList.add('node-active');
    document.getElementById('gate-b-kill').style.boxShadow = '0 0 16px rgba(196, 48, 28, 0.6)';
    verdictTitle.textContent = 'DECISION: KILL @ $100 (CHECKPOINT B HARD GATE)';
    verdictText.textContent = '0 purchases by $100 spend. Cut immediately regardless of soft metrics.';
  } else if (selected === 'scenario-5') {
    document.getElementById('node-start').classList.add('node-active');
    document.getElementById('node-purchase').classList.add('node-active');
    document.getElementById('gate-b-pass').style.boxShadow = '0 0 16px rgba(0, 151, 90, 0.6)';
    verdictTitle.textContent = 'DECISION: PASS TO SCALING';
    verdictText.textContent = '2 purchases achieved by $100 spend. Creative passes first gate to next testing stage.';
  }
}

function updateGeoSkewSimulator() {
  const slider = document.getElementById('skew-threshold-slider');
  if (!slider) return;
  const threshold = parseInt(slider.value);
  document.getElementById('skew-threshold-val').textContent = `${threshold}% SPEND THRESHOLD`;

  let cheapSpend = 0;
  const rows = document.querySelectorAll('#country-tier-table tbody tr');
  rows.forEach(r => {
    if (r.getAttribute('data-tier') === 'low') {
      const spendText = r.querySelector('td:nth-child(2)').textContent.replace('%', '');
      cheapSpend += parseFloat(spendText);
    }
  });

  const banner = document.getElementById('skew-verdict-banner');
  if (cheapSpend >= threshold) {
    banner.className = 'threshold-verdict-alert verdict-alert-danger';
    banner.innerHTML = `<i data-lucide="alert-triangle"></i> <span>🚨 SKEW ALERT TRIGGERED: Cheap Geo Spend (${cheapSpend.toFixed(1)}%) EXCEEDS ${threshold}% Threshold &rarr; Triggers Checkpoint A Step 3 KILL Decision at $70.</span>`;
  } else {
    banner.className = 'threshold-verdict-alert verdict-alert-safe';
    banner.innerHTML = `<i data-lucide="check-circle"></i> <span>SAFE DELIVERY: Cheap Geo Spend (${cheapSpend.toFixed(1)}%) is BELOW ${threshold}% Threshold &rarr; Allow Creative to Continue to $100.</span>`;
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function toggleCountryTier(code) {
  const row = document.getElementById(`row-${code}`);
  const btn = row.querySelector('.tier-toggle-btn');
  const currentTier = row.getAttribute('data-tier');

  if (currentTier === 'low') {
    row.setAttribute('data-tier', 'high');
    btn.className = 'tier-toggle-btn tier-btn-high';
    btn.textContent = 'Tier 1 (High Quality)';
  } else {
    row.setAttribute('data-tier', 'low');
    btn.className = 'tier-toggle-btn tier-btn-low';
    btn.textContent = 'Tier 3 (Cheap Drift)';
  }
  updateGeoSkewSimulator();
}

function highlightCountryMap(name) {
  const rows = document.querySelectorAll('#country-tier-table tbody tr');
  rows.forEach(r => r.style.background = '');

  document.querySelectorAll('.map-country-path').forEach(p => p.classList.remove('active-highlight'));
  document.querySelectorAll('.map-pin').forEach(p => p.classList.remove('active-pin'));

  let key = name;
  if (name.toLowerCase().includes('usa') || name.toLowerCase().includes('united states')) key = 'USA';
  if (name.toLowerCase().includes('ca') || name.toLowerCase().includes('canada')) key = 'Canada';
  if (name.toLowerCase().includes('uk') || name.toLowerCase().includes('united kingdom')) key = 'UK';
  if (name.toLowerCase().includes('de') || name.toLowerCase().includes('germany')) key = 'Germany';
  if (name.toLowerCase().includes('br') || name.toLowerCase().includes('brazil')) key = 'Brazil';
  if (name.toLowerCase().includes('in') || name.toLowerCase().includes('india')) key = 'India';
  if (name.toLowerCase().includes('ph') || name.toLowerCase().includes('philippines')) key = 'Philippines';

  const countryPath = document.getElementById(`map-country-${key}`);
  if (countryPath) countryPath.classList.add('active-highlight');

  const pin = document.querySelector(`.map-pin[data-country="${key}"]`);
  if (pin) pin.classList.add('active-pin');

  rows.forEach(r => {
    if (r.textContent.toLowerCase().includes(key.toLowerCase()) || r.textContent.toLowerCase().includes(name.toLowerCase())) {
      r.style.background = 'rgba(222, 138, 37, 0.3)';
      r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
});
    }
  });
}

function switchComp5Chart(mode) {
  document.getElementById('btn-scatter').classList.toggle('active', mode === 'scatter');
  document.getElementById('btn-slope').classList.toggle('active', mode === 'slope');

  if (charts['comp5']) charts['comp5'].destroy();
  const ctx = document.getElementById('comp5Canvas').getContext('2d');

  if (mode === 'scatter') {
    charts['comp5'] = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Exited Creatives (CPA)',
          data: [
            { x: 18.5, y: 42.1 }, { x: 22.0, y: 45.0 }, { x: 25.4, y: 28.1 },
            { x: 29.1, y: 64.2 }, { x: 31.0, y: 33.0 }, { x: 38.0, y: 78.5 },
            { x: 19.8, y: 22.4 }, { x: 44.2, y: 89.0 }, { x: 15.2, y: 19.5 }
          ],
          backgroundColor: '#DE8A25',
          pointRadius: 6,
          pointHoverRadius: 9
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#FEF9DF', font: { family: "'Oswald', sans-serif" } } } },
        scales: {
          x: { title: { display: true, text: 'Exit CPA at $10/day Test ($)', color: '#FEF9DF' }, grid: { color: '#4D473E' }, ticks: { color: '#FEF9DF' } },
          y: { title: { display: true, text: 'Scaled CPA ($)', color: '#FEF9DF' }, grid: { color: '#4D473E' }, ticks: { color: '#FEF9DF' } }
        }
      }
    });
  } else {
    charts['comp5'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Creative #101', 'Creative #104', 'Creative #109', 'Creative #112', 'Creative #118'],
        datasets: [
          { label: '$10/day Test CPA', data: [22.5, 19.8, 31.0, 15.2, 38.0], borderColor: '#DE8A25', backgroundColor: '#DE8A25' },
          { label: 'Scaled Campaign CPA', data: [45.0, 22.4, 33.0, 19.5, 78.5], borderColor: '#C4301C', backgroundColor: '#C4301C' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#FEF9DF', font: { family: "'Oswald', sans-serif" } } } },
        scales: {
          x: { grid: { color: '#4D473E' }, ticks: { color: '#FEF9DF' } },
          y: { grid: { color: '#4D473E' }, ticks: { color: '#FEF9DF' } }
        }
      }
    });
  }
}

function initAllCharts() {
  Chart.defaults.font.family = "'Geist', sans-serif";

  switchComp5Chart('scatter');

  const ctx6 = document.getElementById('comp6Canvas').getContext('2d');
  charts['comp6'] = new Chart(ctx6, {
    type: 'bar',
    data: {
      labels: ['Current 10-Result Count', 'Proposed Multi-Signal Exit'],
      datasets: [{
        label: '7-Day Scaling Survival Rate %',
        data: [32.5, 68.4],
        backgroundColor: ['#C4301C', '#00975A'],
        borderColor: ['#C4301C', '#00975A'],
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#FEF9DF', font: { family: "'Oswald', sans-serif" } } },
        y: { max: 100, grid: { color: '#4D473E' }, ticks: { color: '#FEF9DF', callback: v => v + '%' } }
      }
    }
  });

  const ctx7 = document.getElementById('comp7Canvas').getContext('2d');
  charts['comp7'] = new Chart(ctx7, {
    type: 'bar',
    data: {
      labels: ['Initial Earned Profit', 'Stall Budget Burn', 'Zombie Reclaim', 'Net Recovery Position'],
      datasets: [{
        label: 'USD ($)',
        data: [18400, -8200, 14250, 24450],
        backgroundColor: ['#1D349A', '#C4301C', '#00975A', '#DE8A25'],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#FEF9DF', font: { family: "'Oswald', sans-serif" } } },
        y: { grid: { color: '#4D473E' }, ticks: { color: '#FEF9DF', callback: v => '$' + v.toLocaleString() } }
      }
    }
  });

  const ctx8 = document.getElementById('comp8Canvas').getContext('2d');
  charts['comp8'] = new Chart(ctx8, {
    type: 'line',
    data: {
      labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4 (Stall Start)', 'Day 6', 'Day 8 (Stall End)'],
      datasets: [
        { label: 'Frequency', data: [1.02, 1.15, 1.32, 1.84, 2.45, 3.12], borderColor: '#DE8A25', tension: 0.3 },
        { label: 'CPM ($)', data: [14.2, 15.1, 17.8, 26.4, 34.8, 42.5], borderColor: '#C4301C', tension: 0.3 },
        { label: 'Daily Reach (k)', data: [8.5, 7.8, 6.2, 3.9, 2.1, 1.2], borderColor: '#00975A', tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#FEF9DF', font: { family: "'Oswald', sans-serif" } } } },
      scales: {
        x: { grid: { color: '#4D473E' }, ticks: { color: '#FEF9DF' } },
        y: { grid: { color: '#4D473E' }, ticks: { color: '#FEF9DF' } }
      }
    }
  });

  const ctx9 = document.getElementById('comp9Canvas').getContext('2d');
  charts['comp9'] = new Chart(ctx9, {
    type: 'bar',
    data: {
      labels: ['Problem-Agitate', 'UGC Unboxing', 'Product Demo', 'Testimonials'],
      datasets: [
        { label: 'Tested Assets', data: [45, 60, 30, 40], backgroundColor: '#4D473E' },
        { label: 'Scaled Winners', data: [18, 15, 9, 3], backgroundColor: '#DE8A25' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#FEF9DF', font: { family: "'Oswald', sans-serif" } } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#FEF9DF', font: { family: "'Oswald', sans-serif" } } },
        y: { grid: { color: '#4D473E' }, ticks: { color: '#FEF9DF' } }
      }
    }
  });
}

function updateCBOCannibalizationSimulator() {
  const cboBudgetEl = document.getElementById('cbo-budget-slider');
  const overlapEl = document.getElementById('cbo-overlap-slider');
  if (!cboBudgetEl || !overlapEl) return;

  const cboBudget = parseInt(cboBudgetEl.value);
  const overlapPct = parseInt(overlapEl.value);

  document.getElementById('cbo-budget-val').textContent = `$${cboBudget.toLocaleString()}/DAY`;
  document.getElementById('cbo-overlap-val').textContent = `${overlapPct}% OVERLAP`;

  // Calculate Cannibalization Rate & ABO Win Rate
  const cannibalizationRate = Math.min(96, Math.round(overlapPct * (cboBudget / 600)));
  const aboWinRate = Math.max(3.5, (100 - cannibalizationRate * 0.95)).toFixed(1);
  const cpaPenalty = Math.round(35 * (cannibalizationRate / 50));

  const cannRateEl = document.getElementById('cbo-cannibal-rate');
  const aboWinEl = document.getElementById('abo-win-rate');
  const cpaPenEl = document.getElementById('cbo-cpa-penalty');

  if (cannRateEl) cannRateEl.textContent = `${cannibalizationRate}%`;
  if (aboWinEl) aboWinEl.textContent = `${aboWinRate}%`;
  if (cpaPenEl) cpaPenEl.textContent = `+$${cpaPenalty}.00`;

  // Dynamic SVG circle adjustments
  const circleCBO = document.getElementById('venn-circle-cbo');
  const circleABO = document.getElementById('venn-circle-abo');
  const circleOverlap = document.getElementById('venn-circle-overlap');

  if (circleCBO && circleABO && circleOverlap) {
    const distance = 220 - (overlapPct * 1.6);
    circleCBO.setAttribute('cx', 120 + distance);
    circleOverlap.setAttribute('cx', 120 + (distance / 2));
    
    const cboRadius = Math.min(95, 60 + (cboBudget / 150));
    circleCBO.setAttribute('r', cboRadius);
    
    const overlapRadius = Math.max(15, (overlapPct * 0.65));
    circleOverlap.setAttribute('r', overlapRadius);
  }

  // Update verdict banner
  const verdictBanner = document.getElementById('cbo-verdict-banner');
  if (verdictBanner) {
    if (cannibalizationRate >= 50) {
      verdictBanner.className = 'threshold-verdict-alert verdict-alert-danger';
      verdictBanner.innerHTML = `<i data-lucide="alert-triangle"></i> <span>🚨 CRITICAL CANNIBALIZATION: CBO scaling campaign is stealing ${cannibalizationRate}% of impression share from ABO creative test ad sets. ABO test results are corrupted by intra-account Meta auction competition.</span>`;
    } else {
      verdictBanner.className = 'threshold-verdict-alert verdict-alert-safe';
      verdictBanner.innerHTML = `<i data-lucide="check-circle"></i> <span>ISOLATED AUDIENCES: Cannibalization is low (${cannibalizationRate}%). ABO creative test ad sets are receiving clean auction bids without CBO budget bullying.</span>`;
    }
  }

  // Update table win rates
  const abo1Win = Math.max(4.0, (18.5 - (cannibalizationRate * 0.15))).toFixed(1);
  const abo2Win = Math.max(2.1, (12.0 - (cannibalizationRate * 0.12))).toFixed(1);
  const cboWin = (100 - parseFloat(abo1Win) - parseFloat(abo2Win)).toFixed(1);

  const rowCBO = document.getElementById('row-cbo-scaling');
  const rowABO1 = document.getElementById('row-abo-concept1');
  const rowABO2 = document.getElementById('row-abo-concept2');

  if (rowCBO && rowABO1 && rowABO2) {
    rowCBO.querySelector('.win-rate-val').textContent = `${cboWin}%`;
    rowABO1.querySelector('.win-rate-val').textContent = `${abo1Win}%`;
    rowABO2.querySelector('.win-rate-val').textContent = `${abo2Win}%`;
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openModal(compId) {
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');
  overlay.classList.add('active');
  body.innerHTML = `
    <div style="padding: 20px; color: #fff;">
      <h2 style="font-family: 'Oswald', sans-serif; text-transform: uppercase;">DETAILED INSPECTION VIEW: ${compId}</h2>
      <p style="margin-top: 10px; color: #FEF9DF; opacity: 0.8;">Loaded from Hellomaterials Meta Testing SOP presentation deck. Fully compliant with Hellomaterials Design System v1.</p>
    </div>
  `;
}

function closeModal(e) {
  if (!e || e.target.id === 'modal-overlay' || e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
    document.getElementById('modal-overlay').classList.remove('active');
  }
}

// Active section tracking on scroll
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('.section-divider-banner, section[id^="component-"]');
  const navBtns = document.querySelectorAll('.deck-nav-btn');
  let currentSec = '';

  sections.forEach(sec => {
    const secTop = sec.offsetTop - 120;
    if (window.scrollY >= secTop) {
      currentSec = sec.id;
    }
  });

  navBtns.forEach(btn => {
    btn.classList.remove('active');
    const href = btn.getAttribute('href');
    if (href === '#' + currentSec || (currentSec.includes('component-1') && href === '#section-1')) {
      btn.classList.add('active');
    }
  });
});
