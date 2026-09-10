window.MRF_MOCK_DATA = {
  tenant: { name: "คุณสมชาย", contract: "MRF-BKK-00125", unit: "ห้อง A-1204" },
  invoices: [
    { id: "INV-6909-001", label: "ค่าเช่า กันยายน 2569", dueDate: "15 ก.ย. 2569", amount: 8500, status: "ใกล้ครบกำหนด" },
    { id: "INV-6909-014", label: "ค่าส่วนกลาง กันยายน 2569", dueDate: "15 ก.ย. 2569", amount: 1250, status: "ใกล้ครบกำหนด" },
    { id: "INV-6908-003", label: "ค่าน้ำ สิงหาคม 2569", dueDate: "31 ส.ค. 2569", amount: 386, status: "เกินกำหนด" }
  ],
  documents: [
    { type: "ใบแจ้งหนี้", number: "INV-6909-001", date: "1 ก.ย. 2569" },
    { type: "ใบเสร็จรับเงิน", number: "RC-6908-0088", date: "16 ส.ค. 2569" },
    { type: "สัญญาเช่า", number: "MRF-BKK-00125", date: "1 ม.ค. 2569" }
  ],
  requestTypes: ["ขอซ่อมแซม", "ขอเอกสาร", "ต่อสัญญา", "เช่าช่วง", "โอนสิทธิ์", "ย้ายออก", "คืนเงินประกัน", "ขอสืบสิทธิ์"],
  requests: [
    { number: "REQ-6909-0007", type: "ขอซ่อมแซม", status: "กำลังดำเนินการ", owner: "ฝ่ายบริหารทรัพย์สิน" }
  ]
};

