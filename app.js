const stages = ["New inquiry", "Contacted", "Booked", "Outcome"];

const state = {
  selectedLeadId: 1,
  leads: [
    { id: 1, name: "Maya Chen", concern: "Protecting my family", time: "Weekday afternoon", stage: "New inquiry", quality: "Qualified" },
    { id: 2, name: "Andre Brooks", concern: "Mortgage protection", time: "Early evening", stage: "Contacted", quality: "Qualified" },
    { id: 3, name: "Priya Shah", concern: "Understanding my options", time: "Weekday morning", stage: "Booked", quality: "Qualified" },
    { id: 4, name: "Sam Rivera", concern: "Business continuity", time: "Weekday afternoon", stage: "Outcome", quality: "Application pending" },
    { id: 5, name: "Lena Morris", concern: "Protecting my family", time: "Early evening", stage: "Outcome", quality: "Policy placed" }
  ],
  baseline: {
    qualified: 42,
    booked: 18,
    attended: 13,
    applications: 7,
    policies: 4,
    retainedCommission: 7600
  }
};

const contentIdeas = [
  ["Post", "How much life insurance do young families usually consider?", "Simple framing around income, debts, dependents, and budget."],
  ["Short video", "What happens during a first consultation?", "A calm walkthrough of the conversation and what Sharon will ask."],
  ["Post", "Life insurance terms in plain English", "Define beneficiary, premium, term, and underwriting without sales pressure."],
  ["Short video", "Mortgage protection vs. family protection", "Explain the overlap and why needs can change over time."],
  ["Post", "Three moments when coverage is worth revisiting", "New child, new home, self-employment, or major income change."],
  ["Post", "Why online quotes are only a starting point", "Position Sharon's role as clarification, not instant product advice."],
  ["Post", "Questions to ask before buying coverage", "Encourage prepared, informed conversations."],
  ["Short video", "Common cost misconceptions", "Address affordability concerns with approved, general language."]
];

function showView(id) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === id));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === id));
}

function totals() {
  const newPolicies = state.leads.filter((lead) => lead.quality === "Policy placed").length;
  const newBooked = state.leads.filter((lead) => ["Booked", "Outcome"].includes(lead.stage)).length;
  return {
    qualified: state.baseline.qualified + state.leads.length,
    booked: state.baseline.booked + newBooked,
    attended: state.baseline.attended + state.leads.filter((lead) => lead.stage === "Outcome").length,
    applications: state.baseline.applications + state.leads.filter((lead) => lead.quality === "Application pending").length,
    policies: state.baseline.policies + newPolicies
  };
}

function updateOverview() {
  const current = totals();
  document.querySelector("#metric-qualified").textContent = current.qualified;
  document.querySelector("#metric-booked").textContent = current.booked;
  document.querySelector("#metric-attended").textContent = current.attended;
  document.querySelector("#metric-policies").textContent = current.policies;
}

function renderPipeline() {
  const pipeline = document.querySelector("#pipeline");
  pipeline.innerHTML = stages.map((stage) => {
    const cards = state.leads
      .filter((lead) => lead.stage === stage)
      .map((lead) => `
        <article class="lead-card ${lead.id === state.selectedLeadId ? "selected" : ""}">
          <strong>${lead.name}</strong>
          <p>${lead.concern}</p>
          <small>${lead.time} | ${lead.quality}</small>
          <button type="button" data-select="${lead.id}">Select</button>
        </article>
      `).join("");
    return `<section class="pipeline-column"><h3>${stage}</h3>${cards || "<p class='fineprint'>No leads in this stage.</p>"}</section>`;
  }).join("");
}

function renderReport() {
  const current = totals();
  const adSpend = Number(document.querySelector("#ad-spend").value || 0);
  const agencyFee = Number(document.querySelector("#agency-fee").value || 0);
  const totalCost = adSpend + agencyFee;
  const costPerQualified = totalCost / Math.max(current.qualified, 1);
  const costPerClient = totalCost / Math.max(current.policies, 1);
  const retained = state.baseline.retainedCommission + current.policies * 1900;
  const roi = ((retained - totalCost) / Math.max(totalCost, 1)) * 100;

  document.querySelector("#score-grid").innerHTML = [
    ["Cost per qualified inquiry", `$${Math.round(costPerQualified)}`, "Ad spend plus agency fee"],
    ["Cost per placed policy", `$${Math.round(costPerClient)}`, "Uses policies placed in force"],
    ["Estimated retained commission", `$${retained.toLocaleString()}`, "Demo figure for evaluation"],
    ["Pilot return estimate", `${Math.round(roi)}%`, "Before servicing costs or reversals"]
  ].map(([label, value, note]) => `<article class="score-card"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join("");

  const rows = [
    ["Qualified inquiries", current.qualified],
    ["Consultations booked", current.booked],
    ["Attended meetings", current.attended],
    ["Applications", current.applications],
    ["Policies placed", current.policies]
  ];
  const max = rows[0][1];
  document.querySelector("#funnel").innerHTML = rows.map(([label, value]) => `
    <div class="funnel-row">
      <strong>${label}</strong>
      <div class="bar" style="width:${Math.max((value / max) * 100, 8)}%"></div>
      <span>${value}</span>
    </div>
  `).join("");
}

function renderContent(offset = 0) {
  const selected = [...contentIdeas.slice(offset), ...contentIdeas.slice(0, offset)].slice(0, 6);
  document.querySelector("#content-board").innerHTML = selected.map(([type, title, note]) => `
    <article class="content-card">
      <span class="content-type">${type}</span>
      <h3>${title}</h3>
      <p>${note}</p>
    </article>
  `).join("");
}

function advanceSelectedLead() {
  const lead = state.leads.find((item) => item.id === state.selectedLeadId);
  if (!lead) return;
  const index = stages.indexOf(lead.stage);
  if (index < stages.length - 1) {
    lead.stage = stages[index + 1];
    if (lead.stage === "Outcome" && lead.quality === "Qualified") lead.quality = "Application pending";
  } else if (lead.quality === "Application pending") {
    lead.quality = "Policy placed";
  }
  refresh();
}

function refresh() {
  updateOverview();
  renderPipeline();
  renderReport();
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

document.querySelectorAll("[data-open]").forEach((card) => {
  card.addEventListener("click", () => showView(card.dataset.open));
});

document.querySelector("#booking-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const lead = {
    id: Date.now(),
    name: form.get("name"),
    concern: form.get("concern"),
    time: form.get("time"),
    stage: "New inquiry",
    quality: "Qualified"
  };
  state.leads.unshift(lead);
  state.selectedLeadId = lead.id;
  document.querySelector("#confirmation").textContent = `${lead.name} was added to the follow-up workflow.`;
  event.currentTarget.reset();
  refresh();
});

document.querySelector("#pipeline").addEventListener("click", (event) => {
  const button = event.target.closest("[data-select]");
  if (!button) return;
  state.selectedLeadId = Number(button.dataset.select);
  renderPipeline();
});

document.querySelector("#advance-selected").addEventListener("click", advanceSelectedLead);
document.querySelector("#ad-spend").addEventListener("input", renderReport);
document.querySelector("#agency-fee").addEventListener("input", renderReport);

let contentOffset = 0;
document.querySelector("#shuffle-content").addEventListener("click", () => {
  contentOffset = (contentOffset + 2) % contentIdeas.length;
  renderContent(contentOffset);
});

renderContent();
refresh();
