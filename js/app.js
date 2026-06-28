/* ===== 智耗材 APP - Vue3 应用主逻辑 ===== */
import { createApp, ref, reactive, computed, onMounted, nextTick } from './lib/vue.esm-browser.js'

const D = window.MOCK
const app = createApp({
  setup() {
    // ---- 路由 ----
    const page = ref('login')        // 当前页
    const history = []               // 页面历史栈
    const detailItem = ref(null)     // 当前查看的耗材
    const scanMode = ref('rfid')     // 扫描模式
    const toast = ref('')
    let toastTimer = null
    function showToast(msg) {
      toast.value = msg
      clearTimeout(toastTimer)
      toastTimer = setTimeout(() => toast.value = '', 1800)
    }
    function navigate(p) {
      history.push(page.value)
      page.value = p
      window.scrollTo(0, 0)
    }
    function goBack() {
      if (history.length) page.value = history.pop()
      else page.value = 'home'
      window.scrollTo(0, 0)
    }
    function switchTab(p) {
      history.length = 0
      page.value = p
      window.scrollTo(0, 0)
    }

    // ---- 登录 ----
    const loginForm = reactive({ user: 'admin', pass: '123456' })
    function doLogin() {
      if (!loginForm.user || !loginForm.pass) { showToast('请输入账号和密码'); return }
      showToast('登录成功，欢迎回来～')
      switchTab('home')
    }

    // ---- 库存 ----
    const searchKey = ref('')
    const catActive = ref('all')
    const stockList = computed(() => {
      let list = D.consumables
      if (catActive.value !== 'all') list = list.filter(c => c.cat === catActive.value)
      if (searchKey.value) {
        const k = searchKey.value.toLowerCase()
        list = list.filter(c => c.name.toLowerCase().includes(k) || c.id.toLowerCase().includes(k))
      }
      return list
    })
    function statusInfo(s) {
      const map = { normal: ['充足', 'tag-green'], warn: ['偏低', 'tag-orange'], danger: ['告急', 'tag-red'], out: ['缺货', 'tag-red'], overstock: ['超储', 'tag-blue'] }
      return map[s] || ['未知', 'tag-gray']
    }
    function stockPct(c) { return Math.min(100, Math.round(c.stock / c.max * 100)) }
    function catName(id) { const c = D.categories.find(x => x.id === id); return c ? c.name : id }
    function catIcon(id) { const c = D.categories.find(x => x.id === id); return c ? c.icon : '📦' }
    function openDetail(c) { detailItem.value = c; navigate('detail') }

    // ---- 预警 ----
    const warnFilter = ref('all')
    const warnList = computed(() => {
      if (warnFilter.value === 'all') return D.warnings
      return D.warnings.filter(w => w.level === warnFilter.value)
    })
    const warnCounts = computed(() => ({
      red: D.warnings.filter(w => w.level === 'red').length,
      orange: D.warnings.filter(w => w.level === 'orange').length,
      yellow: D.warnings.filter(w => w.level === 'yellow').length
    }))

    // ---- 领用 ----
    const applyForm = reactive({ item: '', qty: 1, project: '', remark: '' })
    function submitApply() {
      if (!applyForm.item) { showToast('请选择耗材'); return }
      showToast('领用申请已提交，等待审批')
      applyForm.item = ''; applyForm.qty = 1; applyForm.project = ''; applyForm.remark = ''
      navigate('home')
    }
    function approve(rec) { rec.status = 'approved'; showToast('已通过审批') }
    function reject(rec) { rec.status = 'rejected'; showToast('已驳回申请') }

    // ---- 入库 ----
    const inboundForm = reactive({ item: '', qty: '', supplier: '', method: 'rfid' })
    function submitInbound() {
      if (!inboundForm.item || !inboundForm.qty) { showToast('请填写完整信息'); return }
      showToast('入库登记成功，已更新库存')
      inboundForm.item = ''; inboundForm.qty = ''; inboundForm.supplier = ''
      navigate('home')
    }

    // ---- 扫描 ----
    const scanResult = ref(null)
    const scanProcessing = ref(false)
    function startScan() {
      scanProcessing.value = true
      scanResult.value = null
      setTimeout(() => {
        scanProcessing.value = false
        const found = D.consumables.slice(0, 3 + Math.floor(Math.random() * 3))
        scanResult.value = {
          time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
          mode: scanMode.value,
          count: found.length,
          items: found.map(c => ({ id: c.id, name: c.name, spec: c.spec, qty: 2 + Math.floor(Math.random() * 18), unit: c.unit, conf: (97 + Math.random() * 2.5).toFixed(1) }))
        }
      }, 2400)
    }
    const scanModeList = [
      { id: 'rfid', icon: '📡', name: 'RFID批量' },
      { id: 'vision', icon: '📷', name: 'AI视觉' },
      { id: 'ocr', icon: '🔍', name: 'OCR识别' },
      { id: 'fusion', icon: '✨', name: '多模态融合' }
    ]
    function confirmScan() {
      showToast('已确认识别结果，入库成功')
      page.value = 'home'
      history.length = 0
    }

    // ---- 环保 ----
    const carbonRingStyle = computed(() => {
      const pct = D.carbon.score
      const dash = 2 * Math.PI * 38
      return `stroke-dasharray:${dash};stroke-dashoffset:${dash * (1 - pct / 100)}`
    })
    function carbonTrendMax() { return Math.max(...D.carbon.trend.map(t => t.v)) }

    // ---- 报表 ----
    function reportBarH(v, max) { return Math.round(v / max * 100) + '%' }
    const reportMaxIn = computed(() => Math.max(...D.reports.inOutTrend.map(t => t.in)))

    // ---- 孪生 ----
    const twinCellInfo = ref(null)
    function twinCellClass(c) {
      if (c.status === 'empty') return 'empty-c'
      if (c.pct < 20) return 'warn'
      if (c.pct < 50) return 'low'
      return 'full'
    }
    function showCell(c) { twinCellInfo.value = c }

    // ---- 消息 ----
    function msgIcon(t) { return { warn: '⚠️', approval: '📋', ai: '✨', info: '📢' }[t] || '📢' }
    function readMsg(m) { m.read = true }

    // ---- 危废处置 ----
    function disposeHazard(h) { h.status = '已处置'; showToast('危废已登记处置') }

    // ---- AI预测确认采购 ----
    function acceptPredict(p) { showToast(`已生成「${p.item}」采购单`); }

    // ---- 快捷入口 ----
    const quickActions = [
      { ico: '📦', label: '入库登记', color: 'linear-gradient(135deg,#FF6B9D,#FF8EAA)', page: 'inbound' },
      { ico: '📋', label: '领用申请', color: 'linear-gradient(135deg,#FF9F43,#FECA57)', page: 'apply' },
      { ico: '📊', label: '库存盘点', color: 'linear-gradient(135deg,#54A0FF,#74B9FF)', page: 'twin' },
      { ico: '⚠️', label: '预警中心', color: 'linear-gradient(135deg,#FF4757,#FF6B81)', page: 'warn' },
      { ico: '🤖', label: 'AI预测', color: 'linear-gradient(135deg,#A55EEA,#DA77F2)', page: 'predict' },
      { ico: '🌱', label: '环保统计', color: 'linear-gradient(135deg,#2ED573,#7BED9F)', page: 'carbon' },
      { ico: '📈', label: '数据报表', color: 'linear-gradient(135deg,#48DBFB,#0ABDE3)', page: 'report' },
      { ico: '☣️', label: '危废管理', color: 'linear-gradient(135deg,#FFA502,#FF6348)', page: 'hazardous' }
    ]

    const now = new Date()
    const hour = now.getHours()
    const greet = hour < 6 ? '凌晨好' : hour < 12 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好'

    return {
      D, page, detailItem, scanMode, toast, showToast, navigate, goBack, switchTab,
      loginForm, doLogin,
      searchKey, catActive, stockList, statusInfo, stockPct, catName, catIcon, openDetail,
      warnFilter, warnList, warnCounts,
      applyForm, submitApply, approve, reject,
      inboundForm, submitInbound,
      scanResult, scanProcessing, startScan, scanModeList, confirmScan,
      carbonRingStyle, carbonTrendMax,
      reportBarH, reportMaxIn,
      twinCellInfo, twinCellClass, showCell,
      msgIcon, readMsg,
      disposeHazard, acceptPredict,
      quickActions, greet
    }
  },
  template: `
  <div>
    <!-- ===== 登录页 ===== -->
    <div v-if="page==='login'" class="login-bg">
      <div class="login-card">
        <div class="login-logo">🌸</div>
        <div class="login-title">智耗材</div>
        <div class="login-sub">高校实验室AI智能耗材管理平台</div>
        <div class="form-group">
          <label class="form-label">账号</label>
          <input class="form-input" v-model="loginForm.user" placeholder="请输入账号">
        </div>
        <div class="form-group">
          <label class="form-label">密码</label>
          <input class="form-input" type="password" v-model="loginForm.pass" placeholder="请输入密码" @keyup.enter="doLogin">
        </div>
        <button class="btn btn-pink btn-block" style="margin-top:8px" @click="doLogin">登 录</button>
        <div style="text-align:center;margin-top:14px;font-size:11px;color:#bbb">基于TRIZ理论 · 多模态AI融合 · 数字孪生</div>
      </div>
    </div>

    <!-- ===== 登录后主体（非登录、非扫描页时显示） ===== -->
    <div v-if="page!=='login' && page!=='scan'">

      <!-- ===== 首页/工作台 ===== -->
      <div v-if="page==='home'" class="page">
        <div class="hero">
          <div class="hero-row">
            <div class="hero-greet">{{greet}}，{{D.user.name}}<small>{{D.user.lab}} · {{D.user.role}}</small></div>
            <div class="hero-avatar" @click="navigate('message')">🔔</div>
          </div>
          <div style="font-size:12px;opacity:.85;position:relative;z-index:2">让每一件耗材都物尽其用，让每一次实验都高效顺畅 🌿</div>
        </div>

        <div class="page-inner" style="margin-top:0">
          <!-- 数据概览 -->
          <div class="stats-grid">
            <div class="stat-card"><div class="num">{{D.stats.totalItems}}</div><div class="lbl">耗材种类</div></div>
            <div class="stat-card ok"><div class="num">{{D.stats.todayIn}}</div><div class="lbl">今日入库</div></div>
            <div class="stat-card"><div class="num">{{D.stats.todayOut}}</div><div class="lbl">今日领用</div></div>
            <div class="stat-card danger" @click="navigate('warn')"><div class="num">{{D.stats.warnCount}}</div><div class="lbl">预警数</div></div>
          </div>

          <!-- AI助手卡片 -->
          <div class="ai-card" style="margin-top:16px" @click="navigate('predict')">
            <div class="ai-tag">✨ AI智能助手</div>
            <div class="ai-title">本月预测：3项耗材需紧急补货</div>
            <div class="ai-desc">基于LSTM时序模型分析，无水乙醇、烧杯250mL、pH试纸库存将告急，建议7天内完成采购。预测准确率 MAPE≤15%。</div>
            <div class="ai-go">查看智能预测 →</div>
          </div>

          <!-- 快捷功能 -->
          <div class="card" style="margin-top:16px">
            <div class="card-title">快捷功能</div>
            <div class="quick-grid">
              <div v-for="q in quickActions" :key="q.label" class="quick-item" @click="navigate(q.page)">
                <div class="qi-ico" :style="{background:q.color}">{{q.ico}}</div>
                <div class="qi-lbl">{{q.label}}</div>
              </div>
            </div>
          </div>

          <!-- 效益概览 -->
          <div class="card">
            <div class="card-title">管理效益 <span class="more" @click="navigate('report')">详细报表 →</span></div>
            <div style="display:flex;gap:10px">
              <div style="flex:1;text-align:center;padding:10px;background:var(--pink-soft);border-radius:12px">
                <div style="font-size:24px;font-weight:800;color:var(--green)">↓{{D.stats.saveRate}}%</div>
                <div style="font-size:11px;color:var(--txt-sub);margin-top:2px">耗材浪费降低</div>
              </div>
              <div style="flex:1;text-align:center;padding:10px;background:var(--pink-soft);border-radius:12px">
                <div style="font-size:24px;font-weight:800;color:var(--pink-deep)">↑{{D.stats.efficiency}}%</div>
                <div style="font-size:11px;color:var(--txt-sub);margin-top:2px">管理效率提升</div>
              </div>
              <div style="flex:1;text-align:center;padding:10px;background:var(--pink-soft);border-radius:12px">
                <div style="font-size:24px;font-weight:800;color:#54A0FF">{{D.stats.accuracy}}%</div>
                <div style="font-size:11px;color:var(--txt-sub);margin-top:2px">盘点准确率</div>
              </div>
            </div>
          </div>

          <!-- 最近入库 -->
          <div class="card">
            <div class="card-title">最近入库 <span class="more" @click="navigate('inbound')">更多 →</span></div>
            <div v-for="r in D.records.in.slice(0,3)" :key="r.id" class="list-item">
              <div class="li-ico" style="background:var(--pink-soft)">📦</div>
              <div class="li-main">
                <div class="li-title">{{r.item}}</div>
                <div class="li-sub">{{r.method}} · {{r.oper}}</div>
              </div>
              <div class="li-right">
                <div class="li-num">+{{r.qty}}{{r.unit}}</div>
                <div class="li-status" style="color:var(--txt-light)">{{r.time}}</div>
              </div>
            </div>
          </div>

          <!-- 最近领用 -->
          <div class="card">
            <div class="card-title">最近领用 <span class="more" @click="navigate('apply')">更多 →</span></div>
            <div v-for="r in D.records.out.slice(0,3)" :key="r.id" class="list-item">
              <div class="li-ico" style="background:#FFF3E0">📋</div>
              <div class="li-main">
                <div class="li-title">{{r.item}} · {{r.project}}</div>
                <div class="li-sub">{{r.user}} · {{r.time}}</div>
              </div>
              <div class="li-right">
                <div class="li-num" style="color:var(--orange)">-{{r.qty}}{{r.unit}}</div>
                <div class="li-status"><span :class="'tag '+(r.status==='approved'?'tag-green':r.status==='pending'?'tag-orange':'tag-red')">{{r.status==='approved'?'已通过':r.status==='pending'?'待审批':'已驳回'}}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 库存管理 ===== -->
      <div v-else-if="page==='stock'" class="page">
        <div class="navbar">
          <div><div class="nav-title">库存管理</div><div class="nav-sub">共 {{D.consumables.length}} 种耗材 · 总量 {{D.stats.totalStock}}</div></div>
          <div class="nav-icon" @click="navigate('message')">🔔</div>
        </div>
        <div class="page-inner">
          <div class="search-bar">
            <span class="sb-ico">🔍</span>
            <input v-model="searchKey" placeholder="搜索耗材名称/编号">
          </div>
          <div class="cat-tabs">
            <div v-for="c in D.categories" :key="c.id" :class="['cat-tab',{active:catActive===c.id}]" @click="catActive=c.id">{{c.icon}} {{c.name}}</div>
          </div>
          <div v-if="stockList.length===0" class="empty"><div class="em-ico">🔍</div>未找到相关耗材</div>
          <div v-for="c in stockList" :key="c.id" class="card" style="margin-bottom:10px;padding:14px" @click="openDetail(c)">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="li-ico" style="background:var(--pink-soft);font-size:22px">{{catIcon(c.cat)}}</div>
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:6px">
                  <span style="font-weight:700;font-size:14px">{{c.name}}</span>
                  <span :class="'tag '+(c.hazard?'tag-red':'tag-pink')">{{c.hazard?'危化品':'普通'}}</span>
                </div>
                <div style="font-size:11px;color:var(--txt-light);margin-top:2px">{{c.spec}} · {{c.location}}</div>
              </div>
              <span :class="'tag '+statusInfo(c.status)[1]">{{statusInfo(c.status)[0]}}</span>
            </div>
            <div style="margin-top:10px">
              <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--txt-sub);margin-bottom:4px">
                <span>库存 {{c.stock}}{{c.unit}} / 上限 {{c.max}}{{c.unit}}</span>
                <span>安全线 {{c.min}}{{c.unit}}</span>
              </div>
              <div class="progress"><div class="progress-bar" :class="{red:c.status==='danger'||c.status==='out',orange:c.status==='warn',green:c.status==='normal'}" :style="{width:stockPct(c)+'%'}"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 耗材详情 ===== -->
      <div v-else-if="page==='detail' && detailItem" class="page">
        <div class="detail-head">
          <div class="dh-back" @click="goBack">← 返回</div>
          <div class="dh-name">{{detailItem.name}} {{detailItem.hazard?'☣️':''}}</div>
          <div class="dh-tags">
            <span class="tag tag-pink">{{catName(detailItem.cat)}}</span>
            <span :class="'tag '+statusInfo(detailItem.status)[1]">{{statusInfo(detailItem.status)[0]}}</span>
            <span class="tag" :class="detailItem.hazard?'tag-red':'tag-gray'">{{detailItem.hazard?'危化品':'普通耗材'}}</span>
          </div>
        </div>
        <div class="page-inner">
          <div class="card" style="margin-top:-12px">
            <div style="display:flex;align-items:center;gap:16px">
              <div class="ring" :style="{background:'conic-gradient(var(--pink) '+stockPct(detailItem)+'%, #FFE0EC 0)'}">
                <div style="text-align:center;position:relative;z-index:2">
                  <div class="ring-num">{{stockPct(detailItem)}}%</div>
                  <div class="ring-lbl">库存占比</div>
                </div>
              </div>
              <div style="flex:1">
                <div class="big-stat"><span class="big-num">{{detailItem.stock}}</span><span class="big-unit">{{detailItem.unit}}</span></div>
                <div style="font-size:12px;color:var(--txt-sub);margin-top:2px">当前库存 / 上限 {{detailItem.max}}{{detailItem.unit}}</div>
                <div style="font-size:12px;color:var(--orange);margin-top:6px">⚠ 安全库存线：{{detailItem.min}}{{detailItem.unit}}</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">基础信息</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">
              <div><span style="color:var(--txt-sub)">耗材编号</span><br><b>{{detailItem.id}}</b></div>
              <div><span style="color:var(--txt-sub)">规格型号</span><br><b>{{detailItem.spec}}</b></div>
              <div><span style="color:var(--txt-sub)">存放位置</span><br><b>{{detailItem.location}}</b></div>
              <div><span style="color:var(--txt-sub)">供应商</span><br><b>{{detailItem.supplier}}</b></div>
              <div><span style="color:var(--txt-sub)">单价</span><br><b>¥{{detailItem.price}}</b></div>
              <div><span style="color:var(--txt-sub)">有效期</span><br><b>{{detailItem.expiry}}</b></div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">环保信息</div>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div>
                <div style="font-size:12px;color:var(--txt-sub)">单品碳足迹</div>
                <div class="big-stat" style="margin-top:4px"><span class="big-num" style="color:var(--green)">{{detailItem.carbon}}</span><span class="big-unit">kg CO₂</span></div>
              </div>
              <span class="tag tag-green">环保等级 A</span>
            </div>
          </div>

          <div style="display:flex;gap:10px;margin-top:6px">
            <button class="btn btn-outline btn-sm" style="flex:1" @click="navigate('apply');applyForm.item=detailItem.name">📋 领用申请</button>
            <button class="btn btn-pink btn-sm" style="flex:1" @click="navigate('inbound');inboundForm.item=detailItem.name">📦 入库补货</button>
          </div>
        </div>
      </div>

      <!-- ===== 预警中心 ===== -->
      <div v-else-if="page==='warn'" class="page">
        <div class="navbar">
          <div class="nav-icon" @click="goBack">←</div>
          <div class="nav-title">预警中心</div>
          <div class="nav-icon" @click="navigate('predict')">🤖</div>
        </div>
        <div class="page-inner">
          <div style="display:flex;gap:8px;margin-bottom:14px">
            <div style="flex:1;text-align:center;background:#FFEBEE;border-radius:12px;padding:12px" @click="warnFilter='red'">
              <div style="font-size:24px;font-weight:800;color:var(--red)">{{warnCounts.red}}</div><div style="font-size:11px;color:var(--txt-sub)">红色告急</div>
            </div>
            <div style="flex:1;text-align:center;background:#FFF3E0;border-radius:12px;padding:12px" @click="warnFilter='orange'">
              <div style="font-size:24px;font-weight:800;color:var(--orange)">{{warnCounts.orange}}</div><div style="font-size:11px;color:var(--txt-sub)">橙色紧急</div>
            </div>
            <div style="flex:1;text-align:center;background:#FFFDE7;border-radius:12px;padding:12px" @click="warnFilter='yellow'">
              <div style="font-size:24px;font-weight:800;color:#F59E0B">{{warnCounts.yellow}}</div><div style="font-size:11px;color:var(--txt-sub)">黄色提醒</div>
            </div>
          </div>
          <div class="cat-tabs" style="margin-bottom:14px">
            <div :class="['cat-tab',{active:warnFilter==='all'}]" @click="warnFilter='all'">全部 {{D.warnings.length}}</div>
            <div :class="['cat-tab',{active:warnFilter==='red'}]" @click="warnFilter='red'">红色</div>
            <div :class="['cat-tab',{active:warnFilter==='orange'}]" @click="warnFilter='orange'">橙色</div>
            <div :class="['cat-tab',{active:warnFilter==='yellow'}]" @click="warnFilter='yellow'">黄色</div>
          </div>
          <div v-for="w in warnList" :key="w.id" :class="'warn-bar warn-'+w.level">
            <div class="wb-ico">{{w.level==='red'?'🔴':w.level==='orange'?'🟠':'🟡'}}</div>
            <div class="wb-main">
              <div class="wb-title">{{w.item}}</div>
              <div class="wb-sub">{{w.desc}} · {{w.time}}</div>
            </div>
            <div class="wb-act" @click="showToast('已处理：'+w.action)">{{w.action}}</div>
          </div>
          <div v-if="warnList.length===0" class="empty"><div class="em-ico">✅</div>暂无该级别预警</div>
        </div>
      </div>

      <!-- ===== 领用申请 ===== -->
      <div v-else-if="page==='apply'" class="page">
        <div class="navbar">
          <div class="nav-icon" @click="goBack">←</div>
          <div class="nav-title">领用申请</div>
          <div class="nav-icon"></div>
        </div>
        <div class="page-inner">
          <div class="card">
            <div class="card-title">新建领用申请</div>
            <div class="form-group">
              <label class="form-label">耗材名称</label>
              <select class="form-select" v-model="applyForm.item">
                <option value="">请选择耗材</option>
                <option v-for="c in D.consumables" :key="c.id" :value="c.name">{{c.name}}（库存{{c.stock}}{{c.unit}}）</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">领用数量</label>
              <input class="form-input" type="number" v-model.number="applyForm.qty" min="1">
            </div>
            <div class="form-group">
              <label class="form-label">关联项目/课程</label>
              <input class="form-input" v-model="applyForm.project" placeholder="如：有机化学实验">
            </div>
            <div class="form-group">
              <label class="form-label">备注</label>
              <input class="form-input" v-model="applyForm.remark" placeholder="选填">
            </div>
            <button class="btn btn-pink btn-block" @click="submitApply">提交申请</button>
          </div>

          <div class="card">
            <div class="card-title">领用记录 / 审批</div>
            <div v-for="r in D.records.out" :key="r.id" class="list-item">
              <div class="li-ico" style="background:#FFF3E0">📋</div>
              <div class="li-main">
                <div class="li-title">{{r.item}} ×{{r.qty}}{{r.unit}}</div>
                <div class="li-sub">{{r.user}} · {{r.project}}</div>
                <div class="li-sub">{{r.time}}</div>
              </div>
              <div class="li-right">
                <span :class="'tag '+(r.status==='approved'?'tag-green':r.status==='pending'?'tag-orange':'tag-red')">{{r.status==='approved'?'已通过':r.status==='pending'?'待审批':'已驳回'}}</span>
                <div v-if="r.status==='pending'" style="margin-top:6px;display:flex;gap:6px">
                  <button class="btn btn-pink btn-sm" style="padding:3px 10px;font-size:11px" @click="approve(r)">通过</button>
                  <button class="btn btn-outline btn-sm" style="padding:3px 10px;font-size:11px" @click="reject(r)">驳回</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 入库登记 ===== -->
      <div v-else-if="page==='inbound'" class="page">
        <div class="navbar">
          <div class="nav-icon" @click="goBack">←</div>
          <div class="nav-title">入库登记</div>
          <div class="nav-icon" @click="switchTab('scan')">📡</div>
        </div>
        <div class="page-inner">
          <div class="ai-card" style="margin-bottom:14px" @click="switchTab('scan')">
            <div class="ai-tag">✨ 多模态AI识别</div>
            <div class="ai-title">点击启动智能识别入库</div>
            <div class="ai-desc">RFID + AI视觉 + OCR 三模态融合，秒级批量识别，准确率 99.5%+</div>
          </div>
          <div class="card">
            <div class="card-title">手动登记</div>
            <div class="form-group">
              <label class="form-label">耗材名称</label>
              <select class="form-select" v-model="inboundForm.item">
                <option value="">请选择耗材</option>
                <option v-for="c in D.consumables" :key="c.id" :value="c.name">{{c.name}}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">入库数量</label>
              <input class="form-input" type="number" v-model="inboundForm.qty" placeholder="请输入数量">
            </div>
            <div class="form-group">
              <label class="form-label">供应商</label>
              <input class="form-input" v-model="inboundForm.supplier" placeholder="请输入供应商">
            </div>
            <div class="form-group">
              <label class="form-label">识别方式</label>
              <select class="form-select" v-model="inboundForm.method">
                <option value="rfid">RFID批量识别</option>
                <option value="vision">AI视觉识别</option>
                <option value="ocr">OCR识别</option>
                <option value="fusion">多模态融合</option>
                <option value="manual">手动录入</option>
              </select>
            </div>
            <button class="btn btn-pink btn-block" @click="submitInbound">确认入库</button>
          </div>
          <div class="card">
            <div class="card-title">入库记录</div>
            <div v-for="r in D.records.in" :key="r.id" class="list-item">
              <div class="li-ico" style="background:var(--pink-soft)">📦</div>
              <div class="li-main">
                <div class="li-title">{{r.item}} ×{{r.qty}}{{r.unit}}</div>
                <div class="li-sub">{{r.method}} · {{r.oper}}</div>
              </div>
              <div class="li-right">
                <div class="li-num">+{{r.qty}}</div>
                <div class="li-status" style="color:var(--txt-light)">{{r.time}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== AI智能预测 ===== -->
      <div v-else-if="page==='predict'" class="page">
        <div class="navbar">
          <div class="nav-icon" @click="goBack">←</div>
          <div class="nav-title">智能预测决策</div>
          <div class="nav-icon"></div>
        </div>
        <div class="page-inner">
          <div class="ai-card">
            <div class="ai-tag">🤖 LSTM + Attention 时序模型</div>
            <div class="ai-title">AI需求预测分析报告</div>
            <div class="ai-desc">综合历史消耗、实验课表、季节因素等多维数据，预测未来30天耗材需求，MAPE ≤ 15%。已识别 {{D.predict.filter(p=>p.urgency==='高'||p.urgency==='紧急').length}} 项需紧急补货。</div>
          </div>
          <div class="card">
            <div class="card-title">预测结果 <span class="more">置信度详情</span></div>
            <div v-for="p in D.predict" :key="p.item" style="padding:12px 0;border-bottom:1px solid #FFF0F5">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                <div style="font-weight:700;font-size:14px">{{p.item}}</div>
                <span :class="'tag '+(p.urgency==='紧急'?'tag-red':p.urgency==='高'?'tag-orange':'tag-green')">{{p.urgency}}</span>
              </div>
              <div style="display:flex;gap:12px;font-size:12px;color:var(--txt-sub);margin-bottom:6px">
                <span>当前 {{p.current}}</span>
                <span>→</span>
                <span style="color:var(--pink-deep);font-weight:600">预测消耗 {{p.predict}}</span>
                <span style="margin-left:auto">置信度 {{p.confidence}}%</span>
              </div>
              <div style="font-size:12px;color:var(--txt);background:var(--pink-soft);padding:8px 10px;border-radius:8px;margin-bottom:6px">💡 {{p.suggest}}</div>
              <div class="progress" style="height:5px"><div class="progress-bar" :style="{width:p.confidence+'%'}"></div></div>
              <button v-if="p.urgency==='紧急'||p.urgency==='高'" class="btn btn-pink btn-sm" style="margin-top:8px;width:100%" @click="acceptPredict(p)">采纳建议，生成采购单</button>
            </div>
          </div>
          <div class="card">
            <div class="card-title">三级预警机制</div>
            <div style="display:flex;gap:8px;text-align:center">
              <div style="flex:1;background:#FFFDE7;border-radius:10px;padding:12px">
                <div style="font-size:22px">🟡</div><div style="font-size:12px;font-weight:700;margin-top:4px">黄色</div><div style="font-size:10px;color:var(--txt-sub)">备货提醒</div>
              </div>
              <div style="flex:1;background:#FFF3E0;border-radius:10px;padding:12px">
                <div style="font-size:22px">🟠</div><div style="font-size:12px;font-weight:700;margin-top:4px">橙色</div><div style="font-size:10px;color:var(--txt-sub)">紧急采购</div>
              </div>
              <div style="flex:1;background:#FFEBEE;border-radius:10px;padding:12px">
                <div style="font-size:22px">🔴</div><div style="font-size:12px;font-weight:700;margin-top:4px">红色</div><div style="font-size:10px;color:var(--txt-sub)">库存告急</div>
              </div>
            </div>
            <div style="font-size:11px;color:var(--txt-sub);margin-top:10px;text-align:center">安全库存计算：SS = Z × σ × √LT</div>
          </div>
        </div>
      </div>

      <!-- ===== 环保统计 ===== -->
      <div v-else-if="page==='carbon'" class="page">
        <div class="navbar">
          <div class="nav-icon" @click="goBack">←</div>
          <div class="nav-title">环保统计 · 碳足迹</div>
          <div class="nav-icon"></div>
        </div>
        <div class="page-inner">
          <div class="card" style="background:linear-gradient(135deg,#E8F8EF,#FFF);text-align:center">
            <div style="font-size:12px;color:var(--txt-sub)">本月碳排放总量</div>
            <div class="big-stat" style="justify-content:center;margin-top:4px"><span class="big-num" style="color:var(--green)">{{D.carbon.monthTotal}}</span><span class="big-unit">kg CO₂</span></div>
            <div style="font-size:12px;color:var(--green);margin-top:6px">↓ 较上月减少 {{D.carbon.monthReduce}} kg · 减排贡献显著 🌿</div>
          </div>
          <div class="card" style="display:flex;align-items:center;gap:16px">
            <div class="ring" :style="{background:'conic-gradient(var(--green) '+D.carbon.score+'%, #E8F8EF 0)'}">
              <div style="text-align:center;position:relative;z-index:2">
                <div class="ring-num" style="color:var(--green)">{{D.carbon.score}}</div>
                <div class="ring-lbl">绿色指数</div>
              </div>
            </div>
            <div style="flex:1">
              <div style="font-size:14px;font-weight:700">实验室绿色评级</div>
              <div style="font-size:32px;font-weight:800;color:var(--green);margin:2px 0">{{D.carbon.grade}}级</div>
              <div style="font-size:11px;color:var(--txt-sub)">本月排名全校第2名，继续保持！</div>
              <div style="margin-top:6px"><span class="tag tag-green">优秀</span> <span class="tag tag-pink">双碳达标</span></div>
            </div>
          </div>
          <div class="card">
            <div class="card-title">碳排放构成</div>
            <div v-for="b in D.carbon.breakdown" :key="b.name" style="margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
                <span>{{b.name}}</span><span><b style="color:var(--pink-deep)">{{b.value}} kg</b> · {{b.pct}}%</span>
              </div>
              <div class="progress" style="height:7px"><div class="progress-bar" :style="{width:b.pct+'%',background:b.color}"></div></div>
            </div>
          </div>
          <div class="card">
            <div class="card-title">月度碳排放趋势</div>
            <div class="bar-chart">
              <div v-for="t in D.carbon.trend" :key="t.m" class="bar-col">
                <div class="bar" :style="{height:Math.round(t.v/carbonTrendMax()*100)+'%',background:t.m==='6月'?'var(--pink-grad)':'linear-gradient(135deg,#7BED9F,#2ED573)'}"></div>
                <div class="bar-lbl">{{t.m}}</div>
              </div>
            </div>
            <div style="font-size:11px;color:var(--txt-sub);text-align:center;margin-top:8px">单位：kg CO₂</div>
          </div>
          <div class="card">
            <div class="card-title">绿色建议</div>
            <div style="font-size:12px;line-height:1.8">
              <div>💡 优先采购环保标签 A 级耗材</div>
              <div>♻️ 规范危废分类，降低处置碳排放</div>
              <div>📦 合理控制库存，减少过期浪费</div>
              <div>🚲 选择本地供应商，缩短运输距离</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 数据报表 ===== -->
      <div v-else-if="page==='report'" class="page">
        <div class="navbar">
          <div class="nav-icon" @click="goBack">←</div>
          <div class="nav-title">数据报表</div>
          <div class="nav-icon"></div>
        </div>
        <div class="page-inner">
          <div class="card">
            <div class="card-title">出入库趋势（近6月）</div>
            <div style="display:flex;gap:20px;font-size:11px;margin-bottom:10px">
              <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:var(--pink);margin-right:4px"></span>入库</span>
              <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#FF9F43;margin-right:4px"></span>领用</span>
            </div>
            <div class="bar-chart">
              <div v-for="t in D.reports.inOutTrend" :key="t.m" class="bar-col">
                <div style="display:flex;align-items:flex-end;gap:3px;height:100%">
                  <div class="bar" :style="{height:reportBarH(t.in,reportMaxIn),background:'var(--pink-grad)',width:'14px'}"></div>
                  <div class="bar" :style="{height:reportBarH(t.out,reportMaxIn),background:'linear-gradient(135deg,#FF9F43,#FECA57)',width:'14px'}"></div>
                </div>
                <div class="bar-lbl">{{t.m}}</div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-title">耗材分类分布</div>
            <div v-for="c in D.reports.catDist" :key="c.name" style="margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
                <span>{{c.name}}</span><span><b>{{c.value}}%</b></span>
              </div>
              <div class="progress" style="height:8px"><div class="progress-bar" :style="{width:c.value+'%',background:c.color}"></div></div>
            </div>
          </div>
          <div class="card">
            <div class="card-title">核心指标</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div style="background:var(--pink-soft);border-radius:12px;padding:14px;text-align:center">
                <div style="font-size:22px;font-weight:800;color:var(--pink-deep)">{{D.stats.accuracy}}%</div>
                <div style="font-size:11px;color:var(--txt-sub)">盘点准确率</div>
              </div>
              <div style="background:#E8F8EF;border-radius:12px;padding:14px;text-align:center">
                <div style="font-size:22px;font-weight:800;color:var(--green)">{{D.stats.saveRate}}%</div>
                <div style="font-size:11px;color:var(--txt-sub)">浪费降低率</div>
              </div>
              <div style="background:#FFF3E0;border-radius:12px;padding:14px;text-align:center">
                <div style="font-size:22px;font-weight:800;color:var(--orange)">{{D.stats.efficiency}}%</div>
                <div style="font-size:11px;color:var(--txt-sub)">效率提升</div>
              </div>
              <div style="background:#E8F0FE;border-radius:12px;padding:14px;text-align:center">
                <div style="font-size:22px;font-weight:800;color:#3B82F6">¥18.6万</div>
                <div style="font-size:11px;color:var(--txt-sub)">年节省成本</div>
              </div>
            </div>
          </div>
          <button class="btn btn-outline btn-block" @click="showToast('报表已导出至邮箱')">📥 导出报表</button>
        </div>
      </div>

      <!-- ===== 危废管理 ===== -->
      <div v-else-if="page==='hazardous'" class="page">
        <div class="navbar">
          <div class="nav-icon" @click="goBack">←</div>
          <div class="nav-title">危废管理</div>
          <div class="nav-icon"></div>
        </div>
        <div class="page-inner">
          <div class="card" style="background:linear-gradient(135deg,#FFF3E0,#FFF)">
            <div style="font-size:12px;color:var(--txt-sub)">待处置危废</div>
            <div class="big-stat" style="margin-top:4px"><span class="big-num" style="color:var(--orange)">3</span><span class="big-unit">项 · 24.5L</span></div>
            <div style="font-size:11px;color:var(--red);margin-top:4px">⚠ 请尽快联系资质单位处置</div>
          </div>
          <div class="card">
            <div class="card-title">危废记录</div>
            <div v-for="h in D.hazardous" :key="h.id" class="list-item">
              <div class="li-ico" style="background:#FFEBEE">☣️</div>
              <div class="li-main">
                <div class="li-title">{{h.item}}（{{h.type}}）</div>
                <div class="li-sub">{{h.qty}}{{h.unit}} · {{h.store}}</div>
                <div class="li-sub">登记：{{h.date}}</div>
              </div>
              <div class="li-right">
                <span :class="'tag '+(h.status==='待处置'?'tag-orange':'tag-green')">{{h.status}}</span>
                <button v-if="h.status==='待处置'" class="btn btn-pink btn-sm" style="margin-top:6px;padding:3px 10px;font-size:11px" @click="disposeHazard(h)">处置</button>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-title">危废处置规范</div>
            <div style="font-size:12px;line-height:1.8;color:var(--txt-sub)">
              <div>① 废液分类收集，禁止混放</div>
              <div>② 危废柜双人双锁管理</div>
              <div>③ 建立完整台账，记录可追溯</div>
              <div>④ 委托有资质单位转移处置</div>
              <div>⑤ 执行《危险废物鉴别标准》</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 数字孪生 ===== -->
      <div v-else-if="page==='twin'" class="page">
        <div class="navbar">
          <div class="nav-icon" @click="goBack">←</div>
          <div class="nav-title">数字孪生 · 3D库存</div>
          <div class="nav-icon" @click="showToast('AR盘点功能开发中')">📱</div>
        </div>
        <div class="page-inner">
          <div class="ai-card">
            <div class="ai-tag">🌐 数字孪生库存镜像</div>
            <div class="ai-title">实验室三维库存可视化</div>
            <div class="ai-desc">物理库存与虚拟镜像实时同步，盘点效率从3-5天缩短至2小时。点击仓位查看详情。</div>
          </div>
          <div class="card">
            <div class="card-title">货柜仓位状态 <span class="more">{{D.inventory.cells.filter(c=>c.status!=='empty').length}}/{{D.inventory.cells.length}}在用</span></div>
            <div style="display:flex;gap:12px;font-size:10px;margin-bottom:10px;flex-wrap:wrap">
              <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#FF6B9D;margin-right:3px"></span>充足</span>
              <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#FECA57;margin-right:3px"></span>正常</span>
              <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#2ED573;margin-right:3px"></span>偏低</span>
              <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#FF4757;margin-right:3px"></span>告急</span>
              <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#F0F0F0;margin-right:3px"></span>空闲</span>
            </div>
            <div class="twin-grid">
              <div v-for="c in D.inventory.cells" :key="c.pos" :class="'twin-cell '+twinCellClass(c)" @click="showCell(c)">{{c.status==='empty'?'':c.pct+'%'}}</div>
            </div>
            <div style="font-size:10px;color:var(--txt-light);text-align:center;margin-top:8px">↑ 模拟 4×6 仓位布局（实际为3D场景）</div>
          </div>
          <div v-if="twinCellInfo" class="card" style="background:var(--pink-soft)">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div>
                <div style="font-size:12px;color:var(--txt-sub)">仓位 {{twinCellInfo.pos}}</div>
                <div style="font-size:18px;font-weight:800;color:var(--pink-deep);margin:2px 0">{{twinCellInfo.item}}</div>
                <div style="font-size:12px">库存占比 {{twinCellInfo.pct}}%</div>
              </div>
              <div class="ring" :style="{background:'conic-gradient(var(--pink) '+twinCellInfo.pct+'%, #FFE0EC 0)',width:'64px',height:'64px'}">
                <div class="ring-num" style="font-size:14px">{{twinCellInfo.pct}}%</div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-title">虚拟盘点报告</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px">
              <div><span style="color:var(--txt-sub)">账实相符率</span><br><b style="font-size:18px;color:var(--green)">{{D.stats.accuracy}}%</b></div>
              <div><span style="color:var(--txt-sub)">盘点耗时</span><br><b style="font-size:18px;color:var(--pink-deep)">2小时</b></div>
              <div><span style="color:var(--txt-sub)">异常项</span><br><b style="font-size:18px;color:var(--orange)">3项</b></div>
              <div><span style="color:var(--txt-sub)">效率提升</span><br><b style="font-size:18px;color:#54A0FF">90%+</b></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 消息通知 ===== -->
      <div v-else-if="page==='message'" class="page">
        <div class="navbar">
          <div class="nav-icon" @click="goBack">←</div>
          <div class="nav-title">消息通知</div>
          <div class="nav-icon"></div>
        </div>
        <div class="page-inner">
          <div v-for="m in D.messages" :key="m.id" class="list-item" @click="readMsg(m)" :style="{opacity:m.read?0.6:1}">
            <div class="li-ico" style="background:var(--pink-soft)">{{msgIcon(m.type)}}</div>
            <div class="li-main">
              <div class="li-title">{{m.title}} <span v-if="!m.read" style="color:var(--red)">·</span></div>
              <div class="li-sub">{{m.desc}}</div>
              <div class="li-sub">{{m.time}}</div>
            </div>
            <div class="li-right"><span v-if="!m.read" class="tag tag-red">新</span></div>
          </div>
        </div>
      </div>

      <!-- ===== 个人中心 ===== -->
      <div v-else-if="page==='mine'" class="page">
        <div class="profile-head">
          <div class="ph-avatar">{{D.user.avatar}}</div>
          <div class="ph-name">{{D.user.name}}</div>
          <div class="ph-role">{{D.user.role}} · {{D.user.lab}}</div>
          <div style="margin-top:10px"><span class="tag tag-pink">工号 {{D.user.id}}</span></div>
        </div>
        <div class="page-inner">
          <div class="card">
            <div class="card-title">我的工作</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center">
              <div @click="navigate('inbound')"><div style="font-size:22px;font-weight:800;color:var(--pink-deep)">{{D.records.in.length}}</div><div style="font-size:11px;color:var(--txt-sub)">入库记录</div></div>
              <div @click="navigate('apply')"><div style="font-size:22px;font-weight:800;color:var(--orange)">{{D.records.out.length}}</div><div style="font-size:11px;color:var(--txt-sub)">领用记录</div></div>
              <div @click="navigate('warn')"><div style="font-size:22px;font-weight:800;color:var(--red)">{{D.stats.warnCount}}</div><div style="font-size:11px;color:var(--txt-sub)">处理预警</div></div>
            </div>
          </div>
          <div class="card profile-menu">
            <div class="pm-item" @click="navigate('report')"><div class="pm-ico" style="background:#E8F0FE">📊</div><div class="pm-label">数据报表</div><div class="pm-arrow">›</div></div>
            <div class="pm-item" @click="navigate('carbon')"><div class="pm-ico" style="background:#E8F8EF">🌱</div><div class="pm-label">环保统计</div><div class="pm-arrow">›</div></div>
            <div class="pm-item" @click="navigate('hazardous')"><div class="pm-ico" style="background:#FFF3E0">☣️</div><div class="pm-label">危废管理</div><div class="pm-arrow">›</div></div>
            <div class="pm-item" @click="navigate('twin')"><div class="pm-ico" style="background:var(--pink-soft)">🌐</div><div class="pm-label">数字孪生</div><div class="pm-arrow">›</div></div>
          </div>
          <div class="card profile-menu">
            <div class="pm-item" @click="showToast('设置功能开发中')"><div class="pm-ico" style="background:#F3E8FF">⚙️</div><div class="pm-label">系统设置</div><div class="pm-arrow">›</div></div>
            <div class="pm-item" @click="showToast('当前版本 v1.0.0')"><div class="pm-ico" style="background:#FFF0F5">ℹ️</div><div class="pm-label">关于智耗材</div><div class="pm-arrow">›</div></div>
            <div class="pm-item" @click="switchTab('login');history.length=0"><div class="pm-ico" style="background:#FFEBEE">🚪</div><div class="pm-label" style="color:var(--red)">退出登录</div><div class="pm-arrow">›</div></div>
          </div>
          <div style="text-align:center;font-size:11px;color:var(--txt-light);padding:10px">智耗材 v1.0.0 · 基于TRIZ理论<br>北京英创智教 × 重庆资源与环境保护职业学院</div>
        </div>
      </div>

      <!-- ===== 底部TabBar ===== -->
      <div class="tabbar" v-if="['home','stock','warn','mine'].includes(page)">
        <div :class="['tab-item',{active:page==='home'}]" @click="switchTab('home')"><div class="tab-ico">🏠</div><div>首页</div></div>
        <div :class="['tab-item',{active:page==='stock'}]" @click="switchTab('stock')"><div class="tab-ico">📦</div><div>库存</div></div>
        <div class="tab-scan" @click="switchTab('scan')"><div class="scan-btn">📡</div><div class="tab-label">AI识别</div></div>
        <div :class="['tab-item',{active:page==='warn'}]" @click="switchTab('warn')"><div class="tab-ico">⚠️</div><div>预警</div></div>
        <div :class="['tab-item',{active:page==='mine'}]" @click="switchTab('mine')"><div class="tab-ico">👤</div><div>我的</div></div>
      </div>
    </div>

    <!-- ===== AI扫描全屏页 ===== -->
    <div v-if="page==='scan'" class="scan-screen">
      <div class="ss-top">
        <div @click="switchTab('home')" style="cursor:pointer">✕</div>
        <div style="font-weight:700">{{scanModeList.find(s=>s.id===scanMode).name}}识别</div>
        <div>💡</div>
      </div>
      <div class="ss-mode">
        <div v-for="m in scanModeList" :key="m.id" :class="['sm-item',{active:scanMode===m.id}]" @click="scanMode=m.id;scanResult=null">
          <div class="sm-circle">{{m.icon}}</div>
          <div>{{m.name}}</div>
        </div>
      </div>
      <div class="ss-mid">
        <div class="scan-box">
          <div class="scan-line" v-if="scanProcessing"></div>
          <div v-if="!scanProcessing && !scanResult" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.5);font-size:13px;text-align:center;padding:20px">将耗材置于识别区<br>点击下方按钮开始</div>
          <div v-if="scanResult" style="position:absolute;inset:0;padding:16px;overflow:auto;color:#fff">
            <div style="text-align:center;font-size:13px;margin-bottom:10px">✅ 识别完成 · {{scanResult.count}}件</div>
            <div v-for="(it,i) in scanResult.items" :key="i" style="background:rgba(255,255,255,.12);border-radius:10px;padding:10px;margin-bottom:8px">
              <div style="display:flex;justify-content:space-between"><b>{{it.name}}</b><span style="color:#7BED9F">{{it.conf}}%</span></div>
              <div style="font-size:11px;opacity:.8">{{it.spec}} · {{it.qty}}{{it.unit}}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="ss-tip">{{scanProcessing?'正在多模态融合识别中，请稍候...':scanResult?'识别完成，请确认结果':'支持一次性批量识别500件耗材'}}</div>
      <div class="ss-bottom">
        <button v-if="!scanResult" class="btn btn-pink btn-block" @click="startScan" :disabled="scanProcessing">{{scanProcessing?'识别中...':'开始识别'}}</button>
        <template v-else>
          <button class="btn btn-outline" style="flex:1;color:#fff;border-color:rgba(255,255,255,.4)" @click="scanResult=null">重新识别</button>
          <button class="btn btn-pink" style="flex:1" @click="confirmScan">确认入库</button>
        </template>
      </div>
    </div>

    <!-- ===== Toast ===== -->
    <div v-if="toast" class="toast">{{toast}}</div>
  </div>
  `
})
app.mount('#app')
