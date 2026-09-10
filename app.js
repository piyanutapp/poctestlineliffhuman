const data = window.MRF_MOCK_DATA;
const money = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" });
const selected = new Set();
let isLiffReady = false;
const usedRecordIds = new Set([
  ...data.invoices.map((invoice) => invoice.id),
  ...data.payments.map((payment) => payment.number),
  ...data.requests.map((request) => request.number)
]);

function createRecordId(prefix, min = 1000, max = 9999) {
  let id;
  do {
    id = `${prefix}-${randomNumber(min, max)}`;
  } while (usedRecordIds.has(id));
  usedRecordIds.add(id);
  return id;
}

function showPanel(id) {
  document.querySelectorAll("main .panel").forEach((panel) => { panel.hidden = panel.id !== id; });
  document.querySelectorAll(".quick-actions button").forEach((button) => {
    button.classList.toggle("active", button.dataset.target === id);
  });
  document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderInvoices() {
  const outstandingInvoices = data.invoices.filter((invoice) => !invoice.isPaid);
  document.getElementById("invoice-list").innerHTML = outstandingInvoices.length ? outstandingInvoices.map((invoice) => `
    <label class="list-card invoice-card">
      <input type="checkbox" value="${invoice.id}" ${selected.has(invoice.id) ? "checked" : ""}>
      <span class="list-content"><b>${invoice.label}</b><small>${invoice.id} · ครบกำหนด ${invoice.dueDate}</small>
        <em class="status ${invoice.status === "เกินกำหนด" ? "overdue" : ""}">${invoice.status}</em>
      </span>
      <strong>${money.format(invoice.amount)}</strong>
    </label>`).join("") : `<div class="empty-state">ไม่มีรายการค้างชำระ</div>`;
  document.querySelectorAll(".invoice-card input").forEach((checkbox) => checkbox.addEventListener("change", () => {
    checkbox.checked ? selected.add(checkbox.value) : selected.delete(checkbox.value);
    updateSelectedTotal();
  }));
}

function updateSelectedTotal() {
  const total = data.invoices.filter((item) => !item.isPaid && selected.has(item.id)).reduce((sum, item) => sum + item.amount, 0);
  document.getElementById("selected-total").textContent = money.format(total);
  document.getElementById("qr-total").textContent = money.format(total);
  document.getElementById("create-qr").disabled = total === 0;
}

function renderStaticData() {
  const outstandingInvoices = data.invoices.filter((invoice) => !invoice.isPaid);
  const total = outstandingInvoices.reduce((sum, item) => sum + item.amount, 0);
  document.getElementById("display-name").textContent = data.tenant.name;
  document.getElementById("contract-summary").textContent = `${data.tenant.contract} · ${data.tenant.unit}`;
  document.getElementById("total-balance").textContent = money.format(total);
  document.getElementById("nearest-due-date").textContent = outstandingInvoices[0]?.dueDate ?? "ไม่มีรายการค้างชำระ";
  document.getElementById("document-list").innerHTML = data.documents.map((doc, index) => `
    <button class="list-card document-card" data-document-index="${index}"><span class="doc-icon">▤</span><span class="list-content"><b>${doc.type}</b><small>${doc.number} · ${doc.date}</small></span><span>›</span></button>`).join("");
  document.getElementById("request-types").innerHTML = data.requestTypes.map((type, index) => `
    <button data-request-type="${type}"><span>${["⌂", "▤", "↻", "⌁", "⇄", "↗", "฿", "♙"][index]}</span>${type}</button>`).join("");
  document.getElementById("request-history").innerHTML = data.requests.map((request) => `
    <div class="list-card request-history-card"><span class="list-content"><b>${request.type}</b><small>${request.number} · ผู้รับผิดชอบ ${request.owner}</small><small>${request.result}</small><span class="timeline">${request.timeline.join(" → ")}</span></span><em class="status">${request.status}</em></div>`).join("");
  document.getElementById("payment-history").innerHTML = data.payments.map((payment) => `
    <div class="list-card"><span class="doc-icon">✓</span><span class="list-content"><b>${payment.number}</b><small>${payment.date}</small></span><span class="payment-result"><strong>${money.format(payment.amount)}</strong><em class="status">${payment.status}</em></span></div>`).join("");
  document.getElementById("profile-name").value = data.tenant.name;
  document.getElementById("profile-phone").value = data.tenant.phone;
  document.getElementById("profile-email").value = data.tenant.email;
}

function toast(message) {
  const element = document.getElementById("toast");
  element.textContent = message;
  element.classList.add("show");
  window.setTimeout(() => element.classList.remove("show"), 2500);
}

async function initializeLiff() {
  const configuredLiffId = "1657128669-1VthmXe7";
  const liffId = new URLSearchParams(window.location.search).get("liffId") || configuredLiffId;
  if (!liffId || !window.liff) return;
  try {
    await liff.init({ liffId });
    isLiffReady = true;
    if (!liff.isLoggedIn()) { liff.login(); return; }
    const profile = await liff.getProfile();
    data.tenant.name = profile.displayName;
    document.getElementById("display-name").textContent = profile.displayName;
    document.getElementById("profile-name").value = profile.displayName;
    if (profile.pictureUrl) {
      const image = document.getElementById("profile-picture");
      image.src = profile.pictureUrl;
      image.hidden = false;
    }
  } catch (error) {
    console.error("LIFF initialization failed", error);
    toast("เปิดในโหมดข้อมูลตัวอย่าง");
  }
}

async function sendPaymentConfirmation(paidInvoices, amount, receiptNumber) {
  if (!isLiffReady || !liff.isInClient()) {
    return { sent: false, reason: "กรุณาเปิดผ่าน LIFF URL จากห้องแชต LINE" };
  }

  const context = liff.getContext();
  if (!context || !["utou", "group", "room"].includes(context.type)) {
    return { sent: false, reason: "LIFF นี้ไม่ได้เปิดจากห้องแชต" };
  }

  const invoiceNumbers = paidInvoices.map((invoice) => invoice.id).join(", ");
  const message = [
    `คุณชำระบิลจำนวน ${paidInvoices.length} ใบ เป็นยอดเงิน ${money.format(amount)} ให้ MRF เรียบร้อยแล้ว`,
    `เลขที่บิล: ${invoiceNumbers}`,
    `เลขที่ใบเสร็จ: ${receiptNumber}`,
    "ข้อมูลสมมติ DEMO"
  ].join("\n");

  try {
    await liff.sendMessages([{ type: "text", text: message }]);
    return { sent: true };
  } catch (error) {
    console.error("Unable to send payment confirmation", error);
    return { sent: false, reason: "ส่งข้อความเข้าแชตไม่ได้ กรุณาเปิด scope chat_message.write" };
  }
}

document.querySelectorAll(".quick-actions button").forEach((button) => button.addEventListener("click", () => showPanel(button.dataset.target)));
document.getElementById("toggle-all").addEventListener("click", () => {
  const outstandingInvoices = data.invoices.filter((invoice) => !invoice.isPaid);
  const shouldSelectAll = selected.size !== outstandingInvoices.length;
  selected.clear();
  if (shouldSelectAll) outstandingInvoices.forEach((invoice) => selected.add(invoice.id));
  renderInvoices(); updateSelectedTotal();
});
document.getElementById("pay-all").addEventListener("click", () => {
  data.invoices.filter((invoice) => !invoice.isPaid).forEach((invoice) => selected.add(invoice.id));
  showPanel("invoices"); renderInvoices(); updateSelectedTotal();
});
document.getElementById("create-qr").addEventListener("click", () => document.getElementById("qr-dialog").showModal());
document.getElementById("close-dialog").addEventListener("click", () => document.getElementById("qr-dialog").close());
document.getElementById("mock-paid").addEventListener("click", async () => {
  const paidInvoices = data.invoices.filter((invoice) => selected.has(invoice.id));
  const amount = paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const receiptNumber = createRecordId("RC-6909", 7001, 9999);
  paidInvoices.forEach((invoice) => { invoice.isPaid = true; invoice.status = "ชำระแล้ว"; });
  data.payments.unshift({ number: receiptNumber, date: "10 ก.ย. 2569", amount, status: "ชำระสำเร็จ", invoiceIds: paidInvoices.map((invoice) => invoice.id) });
  data.documents.unshift({ type: "ใบเสร็จรับเงิน", number: receiptNumber, date: "10 ก.ย. 2569" });
  selected.clear();
  renderStaticData(); renderInvoices(); updateSelectedTotal();
  document.getElementById("qr-dialog").close();
  const confirmation = await sendPaymentConfirmation(paidInvoices, amount, receiptNumber);
  toast(confirmation.sent
    ? `ชำระสำเร็จและส่งข้อความเข้าแชตแล้ว (${receiptNumber})`
    : `ชำระสำเร็จ แต่${confirmation.reason}`);
});
document.getElementById("request-types").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-request-type]");
  if (!button) return;
  document.getElementById("request-title").textContent = button.dataset.requestType;
  document.getElementById("request-dialog").showModal();
});
document.getElementById("document-list").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-document-index]");
  if (!button) return;
  const documentData = data.documents[Number(button.dataset.documentIndex)];
  document.getElementById("document-title").textContent = documentData.type;
  document.getElementById("document-number").textContent = `${documentData.number} · ${documentData.date}`;
  document.getElementById("document-dialog").showModal();
});
document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => {
  document.getElementById(button.dataset.closeDialog).close();
}));
document.getElementById("mock-download").addEventListener("click", () => {
  document.getElementById("document-dialog").close();
  toast("จำลองการดาวน์โหลดเอกสารเรียบร้อยแล้ว");
});
document.getElementById("request-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const type = document.getElementById("request-title").textContent;
  const number = createRecordId("REQ-6909");
  const attachment = document.getElementById("request-attachment").files[0]?.name;
  data.requests.unshift({ number, type, status: "รับคำร้องแล้ว", owner: "ฝ่ายบริหารทรัพย์สิน", result: attachment ? `แนบเอกสาร ${attachment}` : "ระบบได้รับรายละเอียดคำร้องแล้ว", timeline: ["รับคำร้อง"] });
  renderStaticData();
  event.target.reset();
  document.getElementById("request-dialog").close();
  toast(`ส่งคำร้อง ${number} เรียบร้อยแล้ว`);
});
document.getElementById("appointment-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const number = createRecordId("APT");
  document.getElementById("appointment-result").innerHTML = `<div class="list-card appointment-card"><span class="list-content"><b>นัดหมาย ${number}</b><small>${document.getElementById("appointment-topic").value} · ${document.getElementById("appointment-date").value} · ${document.getElementById("appointment-time").value}</small></span><em class="status">รอยืนยัน</em></div>`;
  toast(`สร้างนัดหมาย ${number} แล้ว`);
});
document.getElementById("profile-form").addEventListener("submit", (event) => {
  event.preventDefault();
  data.tenant.name = document.getElementById("profile-name").value;
  data.tenant.phone = document.getElementById("profile-phone").value;
  data.tenant.email = document.getElementById("profile-email").value;
  document.getElementById("display-name").textContent = data.tenant.name;
  toast("บันทึกข้อมูลผู้เช่าตัวอย่างแล้ว");
});

renderStaticData(); renderInvoices(); updateSelectedTotal(); initializeLiff();

