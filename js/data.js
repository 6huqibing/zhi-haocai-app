/* 智耗材 - 模拟数据 */
window.MOCK = {
  user: { name: "张明华", role: "实验室管理员", lab: "化学实验室 A栋301", avatar: "🧪", id: "ADMIN001" },

  stats: {
    totalItems: 2847,    // 耗材总种类
    totalStock: 18652,   // 库存总量
    todayIn: 128,        // 今日入库
    todayOut: 86,        // 今日领用
    warnCount: 12,       // 预警数
    expiringSoon: 8,     // 临期
    outStock: 3,         // 缺货
    overStock: 5,        // 超储
    accuracy: 99.7,      // 盘点准确率
    saveRate: 35,        // 浪费降低率
    efficiency: 60       // 效率提升
  },

  categories: [
    { id: "all", name: "全部", icon: "📦" },
    { id: "reagent", name: "化学试剂", icon: "🧪" },
    { id: "glass", name: "玻璃器材", icon: "⚗️" },
    { id: "tool", name: "实验工具", icon: "🔧" },
    { id: "electric", name: "电子元件", icon: "🔌" },
    { id: "safety", name: "防护用品", icon: "🦺" },
    { id: "consumable", name: "消耗用品", icon: "📋" }
  ],

  consumables: [
    { id: "HC001", name: "浓硫酸", cat: "reagent", spec: "500mL/瓶", stock: 45, max: 100, min: 20, unit: "瓶", price: 28.5, location: "A柜-3层", expiry: "2027-03-15", supplier: "国药集团", status: "normal", hazard: true, carbon: 2.3 },
    { id: "HC002", name: "氢氧化钠", cat: "reagent", spec: "500g/瓶", stock: 12, max: 80, min: 15, unit: "瓶", price: 15.0, location: "A柜-2层", expiry: "2028-01-20", supplier: "西陇科学", status: "warn", hazard: true, carbon: 1.8 },
    { id: "HC003", name: "无水乙醇", cat: "reagent", spec: "2.5L/瓶", stock: 8, max: 60, min: 10, unit: "瓶", price: 35.0, location: "A柜-1层", expiry: "2026-09-10", supplier: "国药集团", status: "danger", hazard: true, carbon: 3.1 },
    { id: "HC004", name: "盐酸溶液", cat: "reagent", spec: "1mol/L·500mL", stock: 62, max: 100, min: 20, unit: "瓶", price: 12.0, location: "A柜-3层", expiry: "2027-06-30", supplier: "西陇科学", status: "normal", hazard: true, carbon: 1.5 },
    { id: "GL001", name: "量筒100mL", cat: "glass", spec: "B级", stock: 35, max: 50, min: 10, unit: "个", price: 18.0, location: "B柜-1层", expiry: "-", supplier: "蜀牛玻璃", status: "normal", hazard: false, carbon: 0.8 },
    { id: "GL002", name: "烧杯250mL", cat: "glass", spec: "A级", stock: 5, max: 60, min: 15, unit: "个", price: 8.5, location: "B柜-1层", expiry: "-", supplier: "蜀牛玻璃", status: "danger", hazard: false, carbon: 0.6 },
    { id: "GL003", name: "容量瓶500mL", cat: "glass", spec: "A级", stock: 28, max: 40, min: 8, unit: "个", price: 32.0, location: "B柜-2层", expiry: "-", supplier: "天玻仪器", status: "normal", hazard: false, carbon: 0.9 },
    { id: "TL001", name: "移液枪10-100μL", cat: "tool", spec: "可调量程", stock: 18, max: 30, min: 5, unit: "支", price: 268.0, location: "C柜-1层", expiry: "-", supplier: "大龙兴创", status: "normal", hazard: false, carbon: 4.2 },
    { id: "TL002", name: "磁力搅拌子", cat: "tool", spec: "25mm", stock: 3, max: 40, min: 10, unit: "个", price: 6.5, location: "C柜-2层", expiry: "-", supplier: "京工仪器", status: "danger", hazard: false, carbon: 0.3 },
    { id: "EL001", name: "面包板", cat: "electric", spec: "830孔", stock: 42, max: 60, min: 15, unit: "块", price: 12.0, location: "D柜-1层", expiry: "-", supplier: "优利德", status: "normal", hazard: false, carbon: 1.1 },
    { id: "EL002", name: "电阻100Ω", cat: "electric", spec: "1/4W·100支", stock: 120, max: 200, min: 50, unit: "包", price: 5.0, location: "D柜-2层", expiry: "-", supplier: "优利德", status: "overstock", hazard: false, carbon: 0.2 },
    { id: "SF001", name: "护目镜", cat: "safety", spec: "防化型", stock: 26, max: 40, min: 10, unit: "副", price: 45.0, location: "E柜-1层", expiry: "-", supplier: "代尔塔", status: "normal", hazard: false, carbon: 2.5 },
    { id: "SF002", name: "丁腈手套", cat: "safety", spec: "M码·100只", stock: 7, max: 50, min: 12, unit: "盒", price: 38.0, location: "E柜-1层", expiry: "2027-12-01", supplier: "麦迪康", status: "warn", hazard: false, carbon: 1.9 },
    { id: "CS001", name: "滤纸定性", cat: "consumable", spec: "Φ12.5cm·100张", stock: 55, max: 80, min: 20, unit: "盒", price: 9.0, location: "F柜-1层", expiry: "-", supplier: "双圈滤纸", status: "normal", hazard: false, carbon: 0.4 },
    { id: "CS002", name: "pH试纸", cat: "consumable", spec: "1-14·广泛", stock: 0, max: 40, min: 10, unit: "本", price: 6.0, location: "F柜-2层", expiry: "-", supplier: "三爱思", status: "out", hazard: false, carbon: 0.2 },
    { id: "CS003", name: "离心管15mL", cat: "consumable", spec: "无菌·50支", stock: 88, max: 120, min: 30, unit: "包", price: 15.0, location: "F柜-2层", expiry: "2027-08-15", supplier: "康宁", status: "overstock", hazard: false, carbon: 0.7 }
  ],

  warnings: [
    { id: "W01", level: "red", type: "out", item: "pH试纸", desc: "库存为0，已缺货", time: "2小时前", action: "立即采购" },
    { id: "W02", level: "red", type: "low", item: "烧杯250mL", desc: "库存5个，低于安全库存15个", time: "3小时前", action: "紧急补货" },
    { id: "W03", level: "red", type: "low", item: "磁力搅拌子", desc: "库存3个，低于安全库存10个", time: "5小时前", action: "紧急补货" },
    { id: "W04", level: "orange", type: "low", item: "无水乙醇", desc: "库存8瓶，低于安全库存10瓶", time: "今日", action: "采购" },
    { id: "W05", level: "orange", type: "expire", item: "无水乙醇", desc: "2026-09-10过期，剩余74天", time: "今日", action: "优先使用" },
    { id: "W06", level: "orange", type: "low", item: "丁腈手套", desc: "库存7盒，低于安全库存12盒", time: "今日", action: "采购" },
    { id: "W07", level: "yellow", type: "low", item: "氢氧化钠", desc: "库存12瓶，接近安全库存15瓶", time: "今日", action: "备货提醒" },
    { id: "W08", level: "yellow", type: "overstock", item: "电阻100Ω", desc: "库存120包，超过上限200包的60%", time: "今日", action: "暂停采购" },
    { id: "W09", level: "yellow", type: "overstock", item: "离心管15mL", desc: "库存88包，接近上限120包", time: "今日", action: "控制领用" },
    { id: "W10", level: "yellow", type: "expire", item: "浓硫酸", desc: "2027-03-15过期，请关注", time: "今日", action: "留意" }
  ],

  records: {
    in: [
      { id: "RK20260627-01", item: "浓硫酸", qty: 20, unit: "瓶", oper: "张明华", time: "今天 14:20", method: "RFID批量识别", status: "done" },
      { id: "RK20260627-02", item: "量筒100mL", qty: 15, unit: "个", oper: "张明华", time: "今天 10:35", method: "AI视觉识别", status: "done" },
      { id: "RK20260626-03", item: "移液枪", qty: 5, unit: "支", oper: "李芳", time: "昨天 16:08", method: "RFID批量识别", status: "done" },
      { id: "RK20260626-04", item: "滤纸定性", qty: 30, unit: "盒", oper: "张明华", time: "昨天 09:12", method: "RFID+视觉融合", status: "done" }
    ],
    out: [
      { id: "LY20260627-01", item: "无水乙醇", qty: 2, unit: "瓶", user: "王强(实验教师)", project: "有机化学实验", time: "今天 15:40", status: "approved" },
      { id: "LY20260627-02", item: "量筒100mL", qty: 5, unit: "个", user: "学生-赵敏", project: "分析化学课程", time: "今天 13:20", status: "approved" },
      { id: "LY20260627-03", item: "护目镜", qty: 3, unit: "副", user: "学生-刘洋", project: "无机化学实验", time: "今天 11:05", status: "pending" },
      { id: "LY20260626-04", item: "盐酸溶液", qty: 4, unit: "瓶", user: "王强", project: "酸碱滴定", time: "昨天 14:30", status: "approved" },
      { id: "LY20260626-05", item: "丁腈手套", qty: 2, unit: "盒", user: "学生-陈静", project: "微生物实验", time: "昨天 10:15", status: "rejected" }
    ]
  },

  predict: [
    { item: "无水乙醇", current: 8, predict: 35, trend: "up", urgency: "高", suggest: "建议7天内采购30瓶", confidence: 92 },
    { item: "丁腈手套", current: 7, predict: 24, trend: "up", urgency: "高", suggest: "建议5天内采购20盒", confidence: 88 },
    { item: "烧杯250mL", current: 5, predict: 18, trend: "up", urgency: "高", suggest: "建议立即采购20个", confidence: 95 },
    { item: "pH试纸", current: 0, predict: 12, trend: "up", urgency: "紧急", suggest: "已缺货，建议立即采购15本", confidence: 98 },
    { item: "滤纸定性", current: 55, predict: 40, trend: "down", urgency: "低", suggest: "库存充足，暂无需采购", confidence: 85 },
    { item: "浓硫酸", current: 45, predict: 30, trend: "down", urgency: "低", suggest: "库存充足，正常使用", confidence: 80 }
  ],

  carbon: {
    monthTotal: 486.5,
    monthReduce: 152.3,
    score: 86,
    grade: "A",
    breakdown: [
      { name: "采购运输", value: 186.2, pct: 38, color: "#FF6B9D" },
      { name: "实验使用", value: 156.8, pct: 32, color: "#FF9F43" },
      { name: "危废处置", value: 98.5, pct: 20, color: "#FF4757" },
      { name: "仓储管理", value: 45.0, pct: 10, color: "#2ED573" }
    ],
    trend: [
      { m: "1月", v: 520 }, { m: "2月", v: 498 }, { m: "3月", v: 512 },
      { m: "4月", v: 475 }, { m: "5月", v: 460 }, { m: "6月", v: 487 }
    ]
  },

  hazardous: [
    { id: "HW001", type: "废酸液", item: "废硫酸", qty: "12.5", unit: "L", date: "2026-06-20", status: "待处置", store: "危废柜A-1" },
    { id: "HW002", type: "废碱液", item: "废氢氧化钠", qty: "8.0", unit: "L", date: "2026-06-18", status: "待处置", store: "危废柜A-2" },
    { id: "HW003", type: "有机废液", item: "废乙醇", qty: "5.5", unit: "L", date: "2026-06-15", status: "已处置", store: "危废柜B-1" },
    { id: "HW004", type: "废弃包装", item: "试剂空瓶", qty: "23", unit: "个", date: "2026-06-12", status: "已处置", store: "危废柜C-1" }
  ],

  reports: {
    inOutTrend: [
      { m: "1月", in: 420, out: 380 },
      { m: "2月", in: 380, out: 350 },
      { m: "3月", in: 510, out: 470 },
      { m: "4月", in: 460, out: 430 },
      { m: "5月", in: 490, out: 455 },
      { m: "6月", in: 520, out: 486 }
    ],
    catDist: [
      { name: "化学试剂", value: 38, color: "#FF6B9D" },
      { name: "玻璃器材", value: 22, color: "#FF9F43" },
      { name: "实验工具", value: 15, color: "#2ED573" },
      { name: "电子元件", value: 12, color: "#54A0FF" },
      { name: "其他", value: 13, color: "#A4B0BE" }
    ]
  },

  inventory: {
    // 数字孪生货柜状态 4x6 = 24仓位
    cells: [
      { pos: "A1-1", item: "浓硫酸", pct: 75, status: "full" },
      { pos: "A1-2", item: "盐酸", pct: 62, status: "full" },
      { pos: "A1-3", item: "氢氧化钠", pct: 15, status: "warn" },
      { pos: "A1-4", item: "—", pct: 0, status: "empty" },
      { pos: "A2-1", item: "无水乙醇", pct: 13, status: "warn" },
      { pos: "A2-2", item: "丙酮", pct: 55, status: "full" },
      { pos: "A2-3", item: "乙醚", pct: 40, status: "half" },
      { pos: "A2-4", item: "—", pct: 0, status: "empty" },
      { pos: "B1-1", item: "量筒", pct: 70, status: "full" },
      { pos: "B1-2", item: "烧杯", pct: 8, status: "warn" },
      { pos: "B1-3", item: "容量瓶", pct: 70, status: "full" },
      { pos: "B1-4", item: "锥形瓶", pct: 50, status: "half" },
      { pos: "B2-1", item: "移液枪", pct: 60, status: "full" },
      { pos: "B2-2", item: "搅拌子", pct: 7, status: "warn" },
      { pos: "B2-3", item: "温度计", pct: 45, status: "half" },
      { pos: "B2-4", item: "—", pct: 0, status: "empty" },
      { pos: "C1-1", item: "面包板", pct: 70, status: "full" },
      { pos: "C1-2", item: "电阻", pct: 60, status: "full" },
      { pos: "C1-3", item: "导线", pct: 35, status: "half" },
      { pos: "C1-4", item: "LED", pct: 25, status: "half" },
      { pos: "C2-1", item: "护目镜", pct: 65, status: "full" },
      { pos: "C2-2", item: "手套", pct: 14, status: "warn" },
      { pos: "C2-3", item: "口罩", pct: 80, status: "full" },
      { pos: "C2-4", item: "—", pct: 0, status: "empty" }
    ]
  },

  messages: [
    { id: "M1", type: "warn", title: "库存预警", desc: "pH试纸已缺货，请尽快采购", time: "10分钟前", read: false },
    { id: "M2", type: "approval", title: "领用审批", desc: "刘洋申请领用护目镜3副，待审批", time: "1小时前", read: false },
    { id: "M3", type: "ai", title: "AI预测", desc: "无水乙醇预计7天后耗尽，建议采购", time: "2小时前", read: false },
    { id: "M4", type: "info", title: "盘点完成", desc: "今日自动盘点完成，准确率99.7%", time: "今天 09:00", read: true },
    { id: "M5", type: "info", title: "入库通知", desc: "浓硫酸20瓶已入库，请确认", time: "昨天 16:20", read: true }
  ]
};
