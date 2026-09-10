const data = window.MRF_MOCK_DATA;
const money = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" });
const selected = new Set();

function showPanel(id) {
  document.querySelectorAll("main .panel").forEach((panel) => { panel.hidden = panel.id !== id; });
  document.querySelectorAll(".quick-actions button").forEach((button) => {
    button.classList.toggle("active", button.dataset.target === id);
  });
  document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderInvoices() {
  document.getElementById("invoice-list").innerHTML = data.invoices.map((invoice) => `
    <label class="list-card invoice-card">
      <input type="checkbox" value="${invoice.id}" ${selected.has(invoice.id) ? "checked" : ""}>
      <span class="list-content"><b>${invoice.label}</b><small>${invoice.id} ยท เธเธฃเธเธเธณเธซเธเธ” ${invoice.dueDate}</small>
        <em class="status ${invoice.status === "เน€เธเธดเธเธเธณเธซเธเธ”" ? "overdue" : ""}">${invoice.status}</em>
      </span>
      <strong>${money.format(invoice.amount)}</strong>
    </label>`).join("");
  document.querySelectorAll(".invoice-card input").forEach((checkbox) => checkbox.addEventListener("change", () => {
    checkbox.checked ? selected.add(checkbox.value) : selected.delete(checkbox.value);
    updateSelectedTotal();
  }));
}

function updateSelectedTotal() {
  const total = data.invoices.filter((item) => selected.has(item.id)).reduce((sum, item) => sum + item.amount, 0);
  document.getElementById("selected-total").textContent = money.format(total);
  document.getElementById("qr-total").textContent = money.format(total);
  document.getElementById("create-qr").disabled = total === 0;
}

function renderStaticData() {
  const total = data.invoices.reduce((sum, item) => sum + item.amount, 0);
  document.getElementById("display-name").textContent = data.tenant.name;
  document.getElementById("contract-summary").textContent = `${data.tenant.contract} ยท ${data.tenant.unit}`;
  document.getElementById("total-balance").textContent = money.format(total);
  document.getElementById("nearest-due-date").textContent = data.invoices[0].dueDate;
  document.getElementById("document-list").innerHTML = data.documents.map((doc) => `
    <button class="list-card document-card"><span class="doc-icon">โ–ค</span><span class="list-content"><b>${doc.type}</b><small>${doc.number} ยท ${doc.date}</small></span><span>โ€บ</span></button>`).join("");
  document.getElementById("request-types").innerHTML = data.requestTypes.map((type, index) => `
    <button data-request-type="${type}"><span>${["โ", "โ–ค", "โป", "โ", "โ", "โ—", "เธฟ", "โ"][index]}</span>${type}</button>`).join("");
  document.getElementById("request-history").innerHTML = data.requests.map((request) => `
    <div class="list-card"><span class="list-content"><b>${request.type}</b><small>${request.number} ยท เธเธนเนเธฃเธฑเธเธเธดเธ”เธเธญเธ ${request.owner}</small></span><em class="status">${request.status}</em></div>`).join("");
}

function toast(message) {
  const element = document.getElementById("toast");
  element.textContent = message;
  element.classList.add("show");
  window.setTimeout(() => element.classList.remove("show"), 2500);
}

async function initializeLiff() {
  const liffId = new URLSearchParams(window.location.search).get("liffId");
  if (!liffId || !window.liff) return;
  try {
    await liff.init({ liffId });
    if (!liff.isLoggedIn()) { liff.login(); return; }
    const profile = await liff.getProfile();
    document.getElementById("display-name").textContent = profile.displayName;
    if (profile.pictureUrl) {
      const image = document.getElementById("profile-picture");
      image.src = profile.pictureUrl;
      image.hidden = false;
    }
  } catch (error) {
    console.error("LIFF initialization failed", error);
    toast("เน€เธเธดเธ”เนเธเนเธซเธกเธ”เธเนเธญเธกเธนเธฅเธ•เธฑเธงเธญเธขเนเธฒเธ");
  }
}

document.querySelectorAll(".quick-actions button").forEach((button) => button.addEventListener("click", () => showPanel(button.dataset.target)));
document.getElementById("toggle-all").addEventListener("click", () => {
  const shouldSelectAll = selected.size !== data.invoices.length;
  selected.clear();
  if (shouldSelectAll) data.invoices.forEach((invoice) => selected.add(invoice.id));
  renderInvoices(); updateSelectedTotal();
});
document.getElementById("pay-all").addEventListener("click", () => {
  data.invoices.forEach((invoice) => selected.add(invoice.id));
  showPanel("invoices"); renderInvoices(); updateSelectedTotal();
});
document.getElementById("create-qr").addEventListener("click", () => document.getElementById("qr-dialog").showModal());
document.getElementById("close-dialog").addEventListener("click", () => document.getElementById("qr-dialog").close());
document.getElementById("mock-paid").addEventListener("click", () => { document.getElementById("qr-dialog").close(); toast("เธเธณเธฅเธญเธเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธเธชเธณเน€เธฃเนเธเนเธฅเนเธง"); });
document.getElementById("request-types").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-request-type]");
  if (button) toast(`เน€เธฅเธทเธญเธเธเธณเธฃเนเธญเธ: ${button.dataset.requestType} (เธ•เธฑเธงเธญเธขเนเธฒเธ)`);
});
document.getElementById("document-list").addEventListener("click", () => toast("เน€เธญเธเธชเธฒเธฃเธ•เธฑเธงเธญเธขเนเธฒเธ เธขเธฑเธเนเธกเนเนเธ”เนเน€เธเธทเนเธญเธกเนเธเธฅเนเธเธฃเธดเธ"));

renderStaticData(); renderInvoices(); updateSelectedTotal(); initializeLiff();

