function randomNumber(min, max) {
  const range = max - min + 1;
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return min + (values[0] % range);
}

const tenantNumber = randomNumber(10000, 99999);
const assetTypes = ["แปลงที่ดิน", "ห้องพัก", "อาคารพาณิชย์", "ช่องจอดรถ"];
const assetType = assetTypes[randomNumber(0, assetTypes.length - 1)];
const assetNumber = randomNumber(101, 1808);
const requestNumber = randomNumber(1, 9999).toString().padStart(4, "0");

window.MRF_MOCK_DATA = {
  tenant: { name: "คุณสมชาย", contract: `MRF-${tenantNumber}`, unit: `${assetType} A-${assetNumber}`, phone: "08x-xxx-1234", email: "demo.tenant@example.com" },
  invoices: [
    { id: `INV-6909-${randomNumber(1, 999).toString().padStart(3, "0")}`, label: "ค่าเช่าทรัพย์สิน กันยายน 2569", dueDate: "15 ก.ย. 2569", amount: randomNumber(6500, 15000), status: "ใกล้ครบกำหนด" },
    { id: `INV-6909-${randomNumber(1, 999).toString().padStart(3, "0")}`, label: "ค่าบริหารจัดการพื้นที่", dueDate: "15 ก.ย. 2569", amount: randomNumber(900, 2500), status: "ใกล้ครบกำหนด" },
    { id: `INV-6908-${randomNumber(1, 999).toString().padStart(3, "0")}`, label: "ภาษีที่ดินและสิ่งปลูกสร้าง", dueDate: "31 ส.ค. 2569", amount: randomNumber(500, 3500), status: "เกินกำหนด" }
  ],
  documents: [
    { type: "ใบแจ้งหนี้", number: `INV-6909-${randomNumber(1, 999).toString().padStart(3, "0")}`, date: "1 ก.ย. 2569" },
    { type: "ใบเสร็จรับเงิน", number: `RC-6908-${randomNumber(1, 9999).toString().padStart(4, "0")}`, date: "16 ส.ค. 2569" },
    { type: "สัญญาเช่าทรัพย์สิน", number: `MRF-${tenantNumber}`, date: "1 ม.ค. 2569" }
  ],
  payments: [
    { number: `RC-6908-${randomNumber(1, 9999).toString().padStart(4, "0")}`, date: "16 ส.ค. 2569", amount: randomNumber(7000, 16000), status: "ชำระสำเร็จ" },
    { number: `RC-6907-${randomNumber(1, 9999).toString().padStart(4, "0")}`, date: "15 ก.ค. 2569", amount: randomNumber(7000, 16000), status: "ชำระสำเร็จ" }
  ],
  requestTypes: ["ขอซ่อมแซม", "ขอเอกสาร", "ขอต่อสัญญา", "ขอเช่าช่วง", "ขอโอนสิทธิ์", "แจ้งย้ายออก", "ขอคืนเงินประกัน", "ขอสืบสิทธิ์"],
  requests: [
    { number: `REQ-6909-${requestNumber}`, type: "ขอเอกสาร", status: "กำลังดำเนินการ", owner: "ฝ่ายบริหารทรัพย์สิน" }
  ]
};

