import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Main SPA route — serve the full dashboard HTML
app.get('*', (c) => {
  return c.html(html)
})

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FXBOT Dashboard</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"/>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            dark: {
              900: '#0a0e1a',
              800: '#0f1629',
              700: '#141d35',
              600: '#1a2540',
              500: '#1e2d4a',
              400: '#243355',
              300: '#2c3d64'
            },
            accent: {
              green: '#00d4a0',
              red: '#ff4d6d',
              blue: '#3b82f6',
              yellow: '#f59e0b',
              purple: '#8b5cf6'
            }
          },
          fontFamily: {
            mono: ['JetBrains Mono', 'Fira Code', 'monospace']
          }
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #0a0e1a; color: #e2e8f0; margin: 0; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #0f1629; }
    ::-webkit-scrollbar-thumb { background: #2c3d64; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #3b82f6; }

    .sidebar { width: 240px; min-height: 100vh; background: #0f1629; border-right: 1px solid #1a2540; position: fixed; left: 0; top: 0; z-index: 50; transition: transform 0.3s ease; }
    .main-content { margin-left: 240px; min-height: 100vh; }

    .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 8px; margin: 2px 8px; color: #94a3b8; cursor: pointer; transition: all 0.2s; font-size: 14px; font-weight: 500; text-decoration: none; }
    .nav-item:hover { background: #1a2540; color: #e2e8f0; }
    .nav-item.active { background: linear-gradient(135deg, #1e3a5f, #1a2d4a); color: #3b82f6; border: 1px solid rgba(59,130,246,0.2); }
    .nav-item .icon { width: 18px; text-align: center; font-size: 15px; }

    .page { display: none; }
    .page.active { display: block; }

    .card { background: #0f1629; border: 1px solid #1a2540; border-radius: 12px; padding: 20px; }
    .card-sm { background: #0f1629; border: 1px solid #1a2540; border-radius: 10px; padding: 16px; }

    .stat-card { background: linear-gradient(135deg, #0f1629, #141d35); border: 1px solid #1a2540; border-radius: 12px; padding: 20px; position: relative; overflow: hidden; }
    .stat-card::before { content: ''; position: absolute; top: 0; right: 0; width: 80px; height: 80px; border-radius: 50%; opacity: 0.08; }
    .stat-card.green::before { background: #00d4a0; }
    .stat-card.red::before { background: #ff4d6d; }
    .stat-card.blue::before { background: #3b82f6; }
    .stat-card.purple::before { background: #8b5cf6; }

    .btn { padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-primary { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; }
    .btn-primary:hover { background: linear-gradient(135deg, #3b82f6, #2563eb); transform: translateY(-1px); }
    .btn-success { background: linear-gradient(135deg, #059669, #047857); color: white; }
    .btn-success:hover { background: linear-gradient(135deg, #10b981, #059669); transform: translateY(-1px); }
    .btn-danger { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; }
    .btn-danger:hover { background: linear-gradient(135deg, #ef4444, #dc2626); transform: translateY(-1px); }
    .btn-outline { background: transparent; color: #94a3b8; border: 1px solid #2c3d64; }
    .btn-outline:hover { border-color: #3b82f6; color: #3b82f6; }

    .input { background: #141d35; border: 1px solid #2c3d64; border-radius: 8px; padding: 8px 12px; color: #e2e8f0; font-size: 13px; width: 100%; outline: none; transition: border-color 0.2s; }
    .input:focus { border-color: #3b82f6; }
    .select { background: #141d35; border: 1px solid #2c3d64; border-radius: 8px; padding: 8px 12px; color: #e2e8f0; font-size: 13px; outline: none; cursor: pointer; }

    .label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }

    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1a2540; }
    tbody td { padding: 10px 14px; border-bottom: 1px solid #0f1629; color: #cbd5e1; }
    tbody tr:hover td { background: #141d35; }
    tbody tr:last-child td { border-bottom: none; }

    .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge-green { background: rgba(0,212,160,0.15); color: #00d4a0; }
    .badge-red { background: rgba(255,77,109,0.15); color: #ff4d6d; }
    .badge-blue { background: rgba(59,130,246,0.15); color: #60a5fa; }
    .badge-yellow { background: rgba(245,158,11,0.15); color: #fbbf24; }
    .badge-gray { background: rgba(100,116,139,0.15); color: #94a3b8; }

    .pnl-pos { color: #00d4a0; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
    .pnl-neg { color: #ff4d6d; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
    .pnl-zero { color: #94a3b8; font-weight: 600; font-family: 'JetBrains Mono', monospace; }

    .progress-bar { height: 6px; background: #1a2540; border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }

    .pulse { animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .ticker { font-family: 'JetBrains Mono', monospace; }

    .toast { position: fixed; bottom: 24px; right: 24px; z-index: 9999; padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
    .toast.show { opacity: 1; pointer-events: all; }
    .toast-success { background: #065f46; border: 1px solid #059669; color: #a7f3d0; }
    .toast-error { background: #7f1d1d; border: 1px solid #dc2626; color: #fca5a5; }
    .toast-info { background: #1e3a5f; border: 1px solid #2563eb; color: #93c5fd; }

    .chart-container { position: relative; height: 300px; }
    .chart-container-sm { position: relative; height: 200px; }

    .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .status-dot.running { background: #00d4a0; box-shadow: 0 0 0 3px rgba(0,212,160,0.2); animation: pulse-dot 2s infinite; }
    .status-dot.stopped { background: #ff4d6d; }
    @keyframes pulse-dot { 0%,100%{box-shadow:0 0 0 3px rgba(0,212,160,0.2)} 50%{box-shadow:0 0 0 6px rgba(0,212,160,0.1)} }

    .symbol-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 4px; background: #141d35; border: 1px solid #2c3d64; font-size: 11px; font-weight: 600; color: #94a3b8; cursor: pointer; transition: all 0.2s; }
    .symbol-pill:hover, .symbol-pill.active { border-color: #3b82f6; color: #3b82f6; background: rgba(59,130,246,0.1); }

    .grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }

    @media (max-width: 1200px) { .grid-4 { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); }
      .main-content { margin-left: 0; }
      .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
    }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; display: flex; align-items: center; justify-content: center; }
    .modal { background: #0f1629; border: 1px solid #1a2540; border-radius: 16px; padding: 28px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
    .modal-hidden { display: none; }

    .divider { height: 1px; background: #1a2540; margin: 16px 0; }

    .leaderboard-rank { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
    .rank-1 { background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; }
    .rank-2 { background: linear-gradient(135deg, #9ca3af, #6b7280); color: #000; }
    .rank-3 { background: linear-gradient(135deg, #92400e, #78350f); color: #fbbf24; }
    .rank-other { background: #1a2540; color: #64748b; }

    .skeleton { background: linear-gradient(90deg, #141d35 25%, #1a2540 50%, #141d35 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s infinite; border-radius: 6px; }
    @keyframes skeleton-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

    .tab-btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid transparent; color: #64748b; background: transparent; transition: all 0.2s; }
    .tab-btn.active { background: #1a2540; color: #e2e8f0; border-color: #2c3d64; }
    .tab-btn:hover:not(.active) { color: #94a3b8; }
  </style>
</head>
<body class="dark">

<!-- Sidebar -->
<aside class="sidebar" id="sidebar">
  <div style="padding: 20px 16px; border-bottom: 1px solid #1a2540;">
    <div style="display:flex; align-items:center; gap:10px;">
      <div style="width:36px;height:36px;background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:8px;display:flex;align-items:center;justify-content:center;">
        <i class="fas fa-robot" style="color:white;font-size:16px;"></i>
      </div>
      <div>
        <div style="font-size:16px;font-weight:700;color:#e2e8f0;">FXBOT</div>
        <div style="font-size:11px;color:#3b82f6;font-weight:500;">Trading Dashboard</div>
      </div>
    </div>
  </div>

  <nav style="padding: 12px 0; flex:1;">
    <div style="padding: 6px 16px; margin-bottom:4px;">
      <div class="label" style="font-size:10px;">MAIN</div>
    </div>
    <a class="nav-item active" data-page="dashboard" onclick="navigate('dashboard')">
      <span class="icon"><i class="fas fa-chart-line"></i></span> Dashboard
    </a>
    <a class="nav-item" data-page="paper" onclick="navigate('paper')">
      <span class="icon"><i class="fas fa-play-circle"></i></span> Paper Trading
    </a>
    <a class="nav-item" data-page="backtest" onclick="navigate('backtest')">
      <span class="icon"><i class="fas fa-history"></i></span> Backtesting
    </a>

    <div style="padding: 12px 16px 6px; margin-top:8px;">
      <div class="label" style="font-size:10px;">ANALYTICS</div>
    </div>
    <a class="nav-item" data-page="trades" onclick="navigate('trades')">
      <span class="icon"><i class="fas fa-list-alt"></i></span> Trade Log
    </a>
    <a class="nav-item" data-page="leaderboard" onclick="navigate('leaderboard')">
      <span class="icon"><i class="fas fa-trophy"></i></span> Leaderboard
    </a>

    <div style="padding: 12px 16px 6px; margin-top:8px;">
      <div class="label" style="font-size:10px;">SYSTEM</div>
    </div>
    <a class="nav-item" data-page="settings" onclick="navigate('settings')">
      <span class="icon"><i class="fas fa-cog"></i></span> Settings
    </a>
  </nav>

  <div style="padding: 16px; border-top: 1px solid #1a2540;">
    <div id="sidebar-status" style="display:flex;align-items:center;gap:8px;padding:10px;background:#141d35;border-radius:8px;">
      <span class="status-dot stopped" id="sidebar-dot"></span>
      <div>
        <div style="font-size:12px;font-weight:600;color:#e2e8f0;" id="sidebar-status-text">Bot Stopped</div>
        <div style="font-size:11px;color:#64748b;" id="sidebar-tick-text">0 ticks processed</div>
      </div>
    </div>
  </div>
</aside>

<!-- Mobile overlay -->
<div id="overlay" onclick="closeSidebar()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:40;"></div>

<!-- Main content -->
<div class="main-content">

  <!-- Top bar -->
  <header style="background:#0f1629;border-bottom:1px solid #1a2540;padding:0 24px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:30;">
    <div style="display:flex;align-items:center;gap:12px;">
      <button onclick="toggleSidebar()" style="display:none;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px;" id="menu-btn">
        <i class="fas fa-bars"></i>
      </button>
      <div>
        <h1 style="font-size:16px;font-weight:700;color:#e2e8f0;margin:0;" id="page-title">Dashboard</h1>
        <div style="font-size:12px;color:#64748b;" id="page-sub">Overview of all trading activity</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="font-size:12px;color:#64748b;" id="clock"></div>
      <div style="width:1px;height:24px;background:#1a2540;"></div>
      <button class="btn btn-outline" style="font-size:12px;padding:6px 12px;" onclick="refreshAll()">
        <i class="fas fa-sync-alt" id="refresh-icon"></i> Refresh
      </button>
      <div style="display:flex;align-items:center;gap:8px;background:#141d35;padding:6px 12px;border-radius:8px;border:1px solid #1a2540;">
        <span class="status-dot" id="header-dot" style="background:#00d4a0;"></span>
        <span style="font-size:12px;color:#94a3b8;" id="header-status">Stopped</span>
      </div>
    </div>
  </header>

  <!-- ======================== DASHBOARD PAGE ======================== -->
  <div class="page active" id="page-dashboard" style="padding:24px;">
    
    <!-- Stats row -->
    <div class="grid-4" style="margin-bottom:20px;">
      <div class="stat-card green">
        <div class="label">Total P&L</div>
        <div style="font-size:28px;font-weight:700;color:#00d4a0;font-family:'JetBrains Mono',monospace;" id="dash-total-pnl">$0.00</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;" id="dash-pnl-sub">from 0 closed trades</div>
        <div style="position:absolute;top:16px;right:16px;font-size:32px;color:rgba(0,212,160,0.15);"><i class="fas fa-dollar-sign"></i></div>
      </div>
      <div class="stat-card blue">
        <div class="label">Win Rate</div>
        <div style="font-size:28px;font-weight:700;color:#60a5fa;font-family:'JetBrains Mono',monospace;" id="dash-winrate">0.0%</div>
        <div style="margin-top:8px;" id="dash-win-progress">
          <div class="progress-bar"><div class="progress-fill" style="width:0%;background:#3b82f6;" id="dash-win-bar"></div></div>
        </div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;" id="dash-wins-sub">0 wins / 0 losses</div>
        <div style="position:absolute;top:16px;right:16px;font-size:32px;color:rgba(59,130,246,0.15);"><i class="fas fa-percentage"></i></div>
      </div>
      <div class="stat-card purple">
        <div class="label">Profit Factor</div>
        <div style="font-size:28px;font-weight:700;color:#a78bfa;font-family:'JetBrains Mono',monospace;" id="dash-pf">0.00</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">Gross Profit / Gross Loss</div>
        <div style="position:absolute;top:16px;right:16px;font-size:32px;color:rgba(139,92,246,0.15);"><i class="fas fa-chart-bar"></i></div>
      </div>
      <div class="stat-card red">
        <div class="label">Max Drawdown</div>
        <div style="font-size:28px;font-weight:700;color:#fb7185;font-family:'JetBrains Mono',monospace;" id="dash-mdd">$0.00</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;" id="dash-mdd-pct">0.00% of peak</div>
        <div style="position:absolute;top:16px;right:16px;font-size:32px;color:rgba(255,77,109,0.15);"><i class="fas fa-arrow-down"></i></div>
      </div>
    </div>

    <!-- Equity curve + per-symbol -->
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:20px;">
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div>
            <div style="font-size:15px;font-weight:600;color:#e2e8f0;">Equity Curve</div>
            <div style="font-size:12px;color:#64748b;">Cumulative P&L over time</div>
          </div>
          <div style="display:flex;gap:8px;" id="equity-symbol-filter">
            <button class="symbol-pill active" onclick="setEquityFilter(null,this)">ALL</button>
          </div>
        </div>
        <div class="chart-container" id="equity-chart-wrap">
          <canvas id="equityChart"></canvas>
          <div id="equity-empty" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;">
            <i class="fas fa-chart-line" style="font-size:32px;color:#2c3d64;"></i>
            <div style="color:#64748b;font-size:13px;">No trade data yet</div>
            <div style="color:#475569;font-size:12px;">Run paper trading or a backtest to see your equity curve</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="font-size:15px;font-weight:600;color:#e2e8f0;margin-bottom:16px;">Performance by Symbol</div>
        <div id="symbol-perf-list">
          <div style="text-align:center;padding:40px 0;color:#64748b;font-size:13px;">
            <i class="fas fa-coins" style="font-size:28px;color:#2c3d64;display:block;margin-bottom:8px;"></i>
            No data yet
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom row: recent trades + strategy breakdown -->
    <div class="grid-2" style="margin-bottom:20px;">
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;color:#e2e8f0;">Recent Trades</div>
          <a onclick="navigate('trades')" class="btn btn-outline" style="font-size:11px;padding:5px 10px;cursor:pointer;">View All</a>
        </div>
        <div id="recent-trades-list">
          <div style="text-align:center;padding:30px 0;color:#64748b;font-size:13px;">
            <i class="fas fa-exchange-alt" style="font-size:24px;color:#2c3d64;display:block;margin-bottom:8px;"></i>
            No trades yet
          </div>
        </div>
      </div>

      <div class="card">
        <div style="font-size:15px;font-weight:600;color:#e2e8f0;margin-bottom:16px;">Strategy Breakdown</div>
        <div class="chart-container-sm" style="margin-bottom:12px;">
          <canvas id="strategyChart"></canvas>
        </div>
        <div id="strategy-legend"></div>
      </div>
    </div>

  </div>

  <!-- ======================== PAPER TRADING PAGE ======================== -->
  <div class="page" id="page-paper" style="padding:24px;">
    
    <div style="display:grid;grid-template-columns:340px 1fr;gap:20px;margin-bottom:20px;">
      <!-- Control panel -->
      <div>
        <div class="card" style="margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;color:#e2e8f0;margin-bottom:16px;">
            <i class="fas fa-play-circle" style="color:#3b82f6;margin-right:8px;"></i>Session Control
          </div>

          <div style="margin-bottom:12px;">
            <div class="label">API Base URL</div>
            <input type="text" class="input" id="paper-api-url" placeholder="http://localhost:8080" value="http://localhost:8080" />
          </div>

          <div style="margin-bottom:12px;">
            <div class="label">Speed (ms/candle)</div>
            <input type="number" class="input" id="paper-speed" value="500" min="1" max="10000" />
          </div>

          <div style="margin-bottom:16px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <div class="label">Symbols & CSV Paths</div>
              <button onclick="addCsvRow()" class="btn btn-outline" style="font-size:11px;padding:4px 8px;">+ Add</button>
            </div>
            <div id="csv-rows">
              <div class="csv-row" style="display:grid;grid-template-columns:100px 1fr 28px;gap:6px;margin-bottom:6px;">
                <select class="select input" style="padding:6px 8px;">
                  <option>EURUSD</option><option>GBPUSD</option><option>AUDUSD</option>
                  <option>USDJPY</option><option>USDCAD</option><option>USDCHF</option>
                  <option>XAUUSD</option><option>NAS100</option>
                </select>
                <input type="text" class="input" placeholder="/data/EURUSD_M5.csv" />
                <button onclick="this.parentElement.remove()" style="background:#7f1d1d;border:none;border-radius:6px;color:#fca5a5;cursor:pointer;font-size:13px;width:28px;">×</button>
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <button class="btn btn-success" onclick="startPaper()" id="btn-start">
              <i class="fas fa-play"></i> Start
            </button>
            <button class="btn btn-danger" onclick="stopPaper()" id="btn-stop" disabled>
              <i class="fas fa-stop"></i> Stop
            </button>
          </div>
        </div>

        <!-- Risk Config display -->
        <div class="card">
          <div style="font-size:14px;font-weight:600;color:#e2e8f0;margin-bottom:12px;">
            <i class="fas fa-shield-alt" style="color:#f59e0b;margin-right:8px;"></i>Risk Governor
          </div>
          <div id="risk-panel">
            <div style="color:#64748b;font-size:12px;text-align:center;padding:20px;">Start a session to view risk data</div>
          </div>
        </div>
      </div>

      <!-- Status & live feed -->
      <div>
        <div class="grid-4" style="margin-bottom:16px;" id="paper-stat-cards">
          <div class="stat-card blue">
            <div class="label">Ticks</div>
            <div style="font-size:24px;font-weight:700;color:#60a5fa;font-family:monospace;" id="paper-ticks">0</div>
            <div style="position:absolute;top:14px;right:14px;font-size:28px;color:rgba(59,130,246,0.12);"><i class="fas fa-heartbeat"></i></div>
          </div>
          <div class="stat-card green">
            <div class="label">Closed Trades</div>
            <div style="font-size:24px;font-weight:700;color:#00d4a0;font-family:monospace;" id="paper-closed">0</div>
            <div style="position:absolute;top:14px;right:14px;font-size:28px;color:rgba(0,212,160,0.12);"><i class="fas fa-check-circle"></i></div>
          </div>
          <div class="stat-card purple">
            <div class="label">Open Trades</div>
            <div style="font-size:24px;font-weight:700;color:#a78bfa;font-family:monospace;" id="paper-open">0</div>
            <div style="position:absolute;top:14px;right:14px;font-size:28px;color:rgba(139,92,246,0.12);"><i class="fas fa-hourglass-half"></i></div>
          </div>
          <div class="stat-card" style="border-color:#1a2540;">
            <div class="label">PnL Today</div>
            <div style="font-size:24px;font-weight:700;font-family:monospace;" id="paper-pnl-today" class="pnl-zero">$0.00</div>
            <div style="position:absolute;top:14px;right:14px;font-size:28px;color:rgba(100,116,139,0.12);"><i class="fas fa-calendar-day"></i></div>
          </div>
        </div>

        <!-- Per-symbol status -->
        <div class="card" style="margin-bottom:16px;">
          <div style="font-size:14px;font-weight:600;color:#e2e8f0;margin-bottom:12px;">Live Symbol Status</div>
          <div id="symbol-status-grid">
            <div style="color:#64748b;font-size:12px;text-align:center;padding:24px;">No active symbols</div>
          </div>
        </div>

        <!-- Live equity during paper -->
        <div class="card">
          <div style="font-size:14px;font-weight:600;color:#e2e8f0;margin-bottom:12px;">Live Equity</div>
          <div class="chart-container-sm">
            <canvas id="paperEquityChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent paper trades table -->
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <div style="font-size:15px;font-weight:600;color:#e2e8f0;">Paper Trade Log</div>
        <div style="display:flex;gap:8px;">
          <select class="select" id="paper-symbol-filter" onchange="loadPaperTrades()">
            <option value="">All Symbols</option>
            <option>EURUSD</option><option>GBPUSD</option><option>AUDUSD</option>
            <option>USDJPY</option><option>USDCAD</option><option>USDCHF</option>
            <option>XAUUSD</option><option>NAS100</option>
          </select>
          <button class="btn btn-outline" onclick="exportPaperTrades()" style="font-size:12px;padding:6px 12px;">
            <i class="fas fa-download"></i> Export CSV
          </button>
        </div>
      </div>
      <div class="table-wrap" id="paper-trades-table">
        <div style="text-align:center;padding:40px;color:#64748b;font-size:13px;">
          <i class="fas fa-exchange-alt" style="font-size:28px;color:#2c3d64;display:block;margin-bottom:8px;"></i>
          No trades yet. Start a paper trading session.
        </div>
      </div>
    </div>
  </div>

  <!-- ======================== BACKTEST PAGE ======================== -->
  <div class="page" id="page-backtest" style="padding:24px;">
    
    <div style="display:grid;grid-template-columns:340px 1fr;gap:20px;">
      <!-- Config -->
      <div class="card" style="height:fit-content;">
        <div style="font-size:15px;font-weight:600;color:#e2e8f0;margin-bottom:16px;">
          <i class="fas fa-history" style="color:#8b5cf6;margin-right:8px;"></i>Backtest Config
        </div>

        <div style="margin-bottom:12px;">
          <div class="label">API Base URL</div>
          <input type="text" class="input" id="bt-api-url" placeholder="http://localhost:8080" value="http://localhost:8080" />
        </div>

        <div style="margin-bottom:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <div class="label">Symbols & CSV Paths</div>
            <button onclick="addBtCsvRow()" class="btn btn-outline" style="font-size:11px;padding:4px 8px;">+ Add</button>
          </div>
          <div id="bt-csv-rows">
            <div class="csv-row" style="display:grid;grid-template-columns:100px 1fr 28px;gap:6px;margin-bottom:6px;">
              <select class="select input" style="padding:6px 8px;">
                <option>EURUSD</option><option>GBPUSD</option><option>AUDUSD</option>
                <option>USDJPY</option><option>USDCAD</option><option>USDCHF</option>
                <option>XAUUSD</option><option>NAS100</option>
              </select>
              <input type="text" class="input" placeholder="/data/EURUSD_M5.csv" />
              <button onclick="this.parentElement.remove()" style="background:#7f1d1d;border:none;border-radius:6px;color:#fca5a5;cursor:pointer;font-size:13px;width:28px;">×</button>
            </div>
          </div>
        </div>

        <button class="btn btn-primary" onclick="runBacktest()" id="btn-bt-run" style="width:100%;">
          <i class="fas fa-play"></i> Run Backtest
        </button>
      </div>

      <!-- Results -->
      <div id="bt-results">
        <div style="text-align:center;padding:80px;color:#64748b;font-size:14px;">
          <i class="fas fa-history" style="font-size:48px;color:#2c3d64;display:block;margin-bottom:16px;"></i>
          <div style="font-size:16px;font-weight:600;color:#475569;margin-bottom:8px;">No Results Yet</div>
          Configure symbols and CSV paths, then click Run Backtest.
        </div>
      </div>
    </div>
  </div>

  <!-- ======================== TRADES PAGE ======================== -->
  <div class="page" id="page-trades" style="padding:24px;">
    
    <div class="card" style="margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <select class="select" id="trades-symbol-filter" onchange="loadAllTrades()">
          <option value="">All Symbols</option>
          <option>EURUSD</option><option>GBPUSD</option><option>AUDUSD</option>
          <option>USDJPY</option><option>USDCAD</option><option>USDCHF</option>
          <option>XAUUSD</option><option>NAS100</option>
        </select>
        <select class="select" id="trades-dir-filter" onchange="filterTrades()">
          <option value="">All Directions</option>
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>
        <select class="select" id="trades-result-filter" onchange="filterTrades()">
          <option value="">All Results</option>
          <option value="win">Wins Only</option>
          <option value="loss">Losses Only</option>
        </select>
        <div style="margin-left:auto;display:flex;gap:8px;">
          <button class="btn btn-outline" onclick="loadAllTrades()" style="font-size:12px;">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
          <button class="btn btn-outline" onclick="exportAllTrades()" style="font-size:12px;">
            <i class="fas fa-download"></i> Export CSV
          </button>
        </div>
      </div>
    </div>

    <!-- Stats strip -->
    <div class="grid-4" style="margin-bottom:20px;" id="trades-stats-strip">
    </div>

    <!-- Table -->
    <div class="card">
      <div id="trades-table-wrap">
        <div style="text-align:center;padding:60px;color:#64748b;">
          <i class="fas fa-list-alt" style="font-size:36px;color:#2c3d64;display:block;margin-bottom:12px;"></i>
          No trade data. Start paper trading or run a backtest.
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid #1a2540;" id="trades-pagination" style="display:none;">
        <div style="font-size:12px;color:#64748b;" id="trades-count-text"></div>
        <div style="display:flex;gap:6px;" id="trades-page-btns"></div>
      </div>
    </div>
  </div>

  <!-- ======================== LEADERBOARD PAGE ======================== -->
  <div class="page" id="page-leaderboard" style="padding:24px;">
    
    <div style="display:flex;gap:8px;margin-bottom:20px;">
      <button class="tab-btn active" id="lb-tab-strategies" onclick="switchLeaderboardTab('strategies')">Strategy Leaderboard</button>
      <button class="tab-btn" id="lb-tab-symbols" onclick="switchLeaderboardTab('symbols')">Symbol Leaderboard</button>
    </div>

    <div id="lb-strategies-section">
      <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:15px;font-weight:600;color:#e2e8f0;">Strategy Rankings</div>
          <div style="font-size:12px;color:#64748b;">Ranked by composite score (PnL + Profit Factor + Win Rate − Drawdown)</div>
        </div>
        <div style="display:flex;gap:8px;">
          <select class="select" id="lb-strat-symbol" onchange="loadStrategyLeaderboard()">
            <option value="">All Symbols</option>
            <option>EURUSD</option><option>GBPUSD</option><option>AUDUSD</option>
            <option>USDJPY</option><option>USDCAD</option><option>USDCHF</option>
            <option>XAUUSD</option><option>NAS100</option>
          </select>
        </div>
      </div>
      <div id="lb-strategies-content">
        <div style="text-align:center;padding:60px;color:#64748b;">
          <i class="fas fa-trophy" style="font-size:36px;color:#2c3d64;display:block;margin-bottom:12px;"></i>
          No strategy data. Run paper trading to populate the leaderboard.
        </div>
      </div>
    </div>

    <div id="lb-symbols-section" style="display:none;">
      <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:15px;font-weight:600;color:#e2e8f0;">Symbol Rankings</div>
          <div style="font-size:12px;color:#64748b;">Best performing instruments across all strategies</div>
        </div>
        <div style="display:flex;gap:8px;">
          <input type="text" class="input" id="lb-sym-strategy" placeholder="Filter by strategy..." style="width:200px;" oninput="loadSymbolLeaderboard()" />
        </div>
      </div>
      <div id="lb-symbols-content">
        <div style="text-align:center;padding:60px;color:#64748b;">
          <i class="fas fa-coins" style="font-size:36px;color:#2c3d64;display:block;margin-bottom:12px;"></i>
          No symbol data. Run paper trading to populate the leaderboard.
        </div>
      </div>
    </div>
  </div>

  <!-- ======================== SETTINGS PAGE ======================== -->
  <div class="page" id="page-settings" style="padding:24px;">
    <div style="max-width:640px;">
      <div class="card" style="margin-bottom:20px;">
        <div style="font-size:15px;font-weight:600;color:#e2e8f0;margin-bottom:16px;">
          <i class="fas fa-server" style="color:#3b82f6;margin-right:8px;"></i>Backend Connection
        </div>
        <div style="margin-bottom:12px;">
          <div class="label">Spring Boot API URL</div>
          <input type="text" class="input" id="settings-api-url" value="http://localhost:8080" placeholder="http://localhost:8080" />
          <div style="font-size:12px;color:#64748b;margin-top:4px;">Used for all API calls. Make sure CORS is enabled on the backend.</div>
        </div>
        <button class="btn btn-primary" onclick="saveSettings()"><i class="fas fa-save"></i> Save & Test Connection</button>
        <div id="settings-test-result" style="margin-top:10px;font-size:13px;"></div>
      </div>

      <div class="card" style="margin-bottom:20px;">
        <div style="font-size:15px;font-weight:600;color:#e2e8f0;margin-bottom:16px;">
          <i class="fas fa-info-circle" style="color:#8b5cf6;margin-right:8px;"></i>API Endpoints Reference
        </div>
        <div style="font-size:13px;color:#94a3b8;line-height:1.8;">
          <div style="margin-bottom:8px;"><span class="badge badge-blue">POST</span> <code style="color:#a78bfa;">/api/backtest</code> — Run backtest with CSV paths</div>
          <div style="margin-bottom:8px;"><span class="badge badge-green">GET</span> <code style="color:#a78bfa;">/api/paper/status</code> — Paper trading status</div>
          <div style="margin-bottom:8px;"><span class="badge badge-blue">POST</span> <code style="color:#a78bfa;">/api/paper/start</code> — Start paper trading</div>
          <div style="margin-bottom:8px;"><span class="badge badge-blue">POST</span> <code style="color:#a78bfa;">/api/paper/stop</code> — Stop paper trading</div>
          <div style="margin-bottom:8px;"><span class="badge badge-green">GET</span> <code style="color:#a78bfa;">/api/paper/trades</code> — Get trade list</div>
          <div style="margin-bottom:8px;"><span class="badge badge-green">GET</span> <code style="color:#a78bfa;">/api/paper/performance</code> — Aggregate stats</div>
          <div style="margin-bottom:8px;"><span class="badge badge-green">GET</span> <code style="color:#a78bfa;">/api/paper/equity</code> — Equity curve points</div>
          <div style="margin-bottom:8px;"><span class="badge badge-green">GET</span> <code style="color:#a78bfa;">/api/paper/leaderboard/strategies</code> — Strategy rankings</div>
          <div style="margin-bottom:8px;"><span class="badge badge-green">GET</span> <code style="color:#a78bfa;">/api/paper/leaderboard/symbols</code> — Symbol rankings</div>
          <div style="margin-bottom:8px;"><span class="badge badge-green">GET</span> <code style="color:#a78bfa;">/api/paper/trades/export</code> — Download CSV</div>
        </div>
      </div>

      <div class="card">
        <div style="font-size:15px;font-weight:600;color:#e2e8f0;margin-bottom:16px;">
          <i class="fas fa-book" style="color:#f59e0b;margin-right:8px;"></i>Quick Start Guide
        </div>
        <div style="font-size:13px;color:#94a3b8;line-height:1.9;">
          <div style="margin-bottom:8px;"><b style="color:#e2e8f0;">1.</b> Start your Spring Boot FXBOT backend (default port 8080)</div>
          <div style="margin-bottom:8px;"><b style="color:#e2e8f0;">2.</b> Set the API Base URL in Settings or the control panel</div>
          <div style="margin-bottom:8px;"><b style="color:#e2e8f0;">3.</b> Go to <b style="color:#60a5fa;">Paper Trading</b> — add your symbol + CSV path pairs</div>
          <div style="margin-bottom:8px;"><b style="color:#e2e8f0;">4.</b> Click <b style="color:#00d4a0;">Start</b> — the dashboard auto-polls every 2 seconds</div>
          <div style="margin-bottom:8px;"><b style="color:#e2e8f0;">5.</b> View results in <b style="color:#60a5fa;">Trade Log</b> and <b style="color:#60a5fa;">Leaderboard</b></div>
          <div style="margin-bottom:8px;"><b style="color:#e2e8f0;">6.</b> For offline analysis, use <b style="color:#60a5fa;">Backtesting</b> with your CSV data</div>
        </div>
      </div>
    </div>
  </div>

</div><!-- end main-content -->

<!-- Toast notification -->
<div class="toast" id="toast"></div>

<script>
// ========== GLOBAL STATE ==========
let apiBase = localStorage.getItem('fxbot_api') || 'http://localhost:8080';
let paperPolling = null;
let equityChartInst = null;
let strategyChartInst = null;
let paperEquityChartInst = null;
let allTradesData = [];
let tradesPage = 1;
const PAGE_SIZE = 50;
let liveEquityPoints = [];

// ========== NAVIGATION ==========
const pages = {
  dashboard: { title: 'Dashboard', sub: 'Overview of all trading activity' },
  paper: { title: 'Paper Trading', sub: 'Simulate live trading with historical CSV data' },
  backtest: { title: 'Backtesting', sub: 'Historical performance analysis' },
  trades: { title: 'Trade Log', sub: 'All closed trades with filters & export' },
  leaderboard: { title: 'Leaderboard', sub: 'Strategy and symbol performance rankings' },
  settings: { title: 'Settings', sub: 'API connection and configuration' }
};

function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelector('[data-page="' + page + '"]').classList.add('active');
  document.getElementById('page-title').textContent = pages[page].title;
  document.getElementById('page-sub').textContent = pages[page].sub;
  closeSidebar();

  if (page === 'dashboard') refreshDashboard();
  if (page === 'trades') loadAllTrades();
  if (page === 'leaderboard') { loadStrategyLeaderboard(); loadSymbolLeaderboard(); }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').style.display =
    document.getElementById('sidebar').classList.contains('open') ? 'block' : 'none';
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').style.display = 'none';
}

// ========== CLOCK ==========
function updateClock() {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// ========== TOAST ==========
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast toast-' + type + ' show';
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ========== API HELPERS ==========
function getApi() {
  return document.getElementById('paper-api-url')?.value?.trim() ||
         document.getElementById('bt-api-url')?.value?.trim() ||
         document.getElementById('settings-api-url')?.value?.trim() ||
         apiBase;
}

async function apiFetch(path, opts = {}) {
  const base = apiBase;
  const url = base + path;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts
  });
  if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
  return res.json();
}

async function apiFetchText(path) {
  const base = apiBase;
  const url = base + path;
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
  return res.text();
}

// ========== CHART HELPERS ==========
function makeEquityChart(canvasId, labels, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  const minVal = Math.min(...data, 0);
  const maxVal = Math.max(...data, 0);

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(59,130,246,0.3)');
  gradient.addColorStop(1, 'rgba(59,130,246,0)');

  const isPositive = data.length === 0 || data[data.length - 1] >= 0;
  const lineColor = isPositive ? '#3b82f6' : '#ff4d6d';

  const chartGrad = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
  chartGrad.addColorStop(0, isPositive ? 'rgba(59,130,246,0.25)' : 'rgba(255,77,109,0.25)');
  chartGrad.addColorStop(1, 'rgba(0,0,0,0)');

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: lineColor,
        backgroundColor: chartGrad,
        borderWidth: 2,
        pointRadius: data.length <= 30 ? 3 : 0,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f1629',
          borderColor: '#2c3d64',
          borderWidth: 1,
          titleColor: '#94a3b8',
          bodyColor: '#e2e8f0',
          callbacks: {
            label: ctx => '$' + ctx.parsed.y.toFixed(2)
          }
        }
      },
      scales: {
        x: { display: false },
        y: {
          grid: { color: 'rgba(42,53,74,0.5)' },
          ticks: { color: '#64748b', font: { size: 11 }, callback: v => '$' + v.toFixed(0) },
          border: { display: false }
        }
      },
      interaction: { intersect: false, mode: 'index' }
    }
  });
}

function makeDonutChart(canvasId, labels, data, colors) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f1629',
          borderColor: '#2c3d64',
          borderWidth: 1,
          titleColor: '#94a3b8',
          bodyColor: '#e2e8f0'
        }
      }
    }
  });
}

// ========== FORMATTING ==========
function fmtPnl(v) {
  const sign = v >= 0 ? '+' : '';
  const cls = v > 0 ? 'pnl-pos' : v < 0 ? 'pnl-neg' : 'pnl-zero';
  return '<span class="' + cls + '">' + sign + '$' + v.toFixed(2) + '</span>';
}
function fmtNum(v, dec=2) { return (v||0).toFixed(dec); }
function fmtPct(v) { return (v||0).toFixed(1) + '%'; }
function fmtTime(ts) {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }); }
  catch { return ts; }
}

// ========== DASHBOARD ==========
async function refreshDashboard() {
  try {
    const [perf, equity] = await Promise.all([
      apiFetch('/api/paper/performance').catch(() => null),
      apiFetch('/api/paper/equity').catch(() => null)
    ]);

    if (perf) {
      document.getElementById('dash-total-pnl').textContent = (perf.totalPnlUsd >= 0 ? '+$' : '-$') + Math.abs(perf.totalPnlUsd).toFixed(2);
      document.getElementById('dash-total-pnl').style.color = perf.totalPnlUsd >= 0 ? '#00d4a0' : '#ff4d6d';
      document.getElementById('dash-pnl-sub').textContent = 'from ' + perf.totalTrades + ' closed trades';
      document.getElementById('dash-winrate').textContent = fmtPct(perf.winRate);
      document.getElementById('dash-win-bar').style.width = fmtPct(perf.winRate);
      document.getElementById('dash-wins-sub').textContent = perf.wins + ' wins / ' + perf.losses + ' losses';
      document.getElementById('dash-pf').textContent = fmtNum(perf.profitFactor);
      document.getElementById('dash-mdd').textContent = '$' + fmtNum(perf.maxDrawdownUsd);
      document.getElementById('dash-mdd-pct').textContent = fmtNum(perf.maxDrawdownPct) + '% of peak';
    }

    if (equity && equity.length > 0) {
      document.getElementById('equity-empty').style.display = 'none';
      const labels = equity.map(p => fmtTime(p.time));
      const data = equity.map(p => p.equity);
      if (equityChartInst) equityChartInst.destroy();
      equityChartInst = makeEquityChart('equityChart', labels, data);
    }

    // Per-symbol perf
    const symbolFilter = document.querySelector('#equity-symbol-filter .symbol-pill.active')?.textContent;
    if (symbolFilter === 'ALL' || !symbolFilter) {
      loadSymbolPerfBreakdown();
    }

    loadRecentTrades();
    loadStrategyDonut();

  } catch(e) {
    console.error('Dashboard refresh error', e);
  }
}

async function loadSymbolPerfBreakdown() {
  try {
    const trades = await apiFetch('/api/paper/trades').catch(() => []);
    if (!trades || trades.length === 0) return;

    // Group by instrument
    const bySymbol = {};
    trades.forEach(t => {
      const s = t.instrument?.toString() || 'UNKNOWN';
      if (!bySymbol[s]) bySymbol[s] = [];
      bySymbol[s].push(t);
    });

    let html = '';
    for (const [sym, ts] of Object.entries(bySymbol)) {
      const pnl = ts.reduce((a,t) => a + t.pnlUsd, 0);
      const wins = ts.filter(t => t.pnlUsd > 0).length;
      const wr = (wins / ts.length * 100).toFixed(1);
      const col = pnl >= 0 ? '#00d4a0' : '#ff4d6d';
      const pct = Math.min(Math.abs(pnl) / Math.max(Math.abs(pnl), 1) * 100, 100);
      html += '<div style="margin-bottom:14px;">';
      html += '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">';
      html += '<span style="font-size:13px;font-weight:600;color:#e2e8f0;" class="ticker">' + sym + '</span>';
      html += '<span style="font-size:13px;font-weight:700;color:' + col + ';font-family:monospace;">' + (pnl >= 0 ? '+' : '') + '$' + pnl.toFixed(2) + '</span>';
      html += '</div>';
      html += '<div style="display:flex;justify-content:space-between;font-size:11px;color:#64748b;margin-bottom:5px;">';
      html += '<span>' + ts.length + ' trades · ' + wr + '% WR</span>';
      html += '</div>';
      html += '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%;background:' + col + ';opacity:0.7;"></div></div>';
      html += '</div>';
    }
    document.getElementById('symbol-perf-list').innerHTML = html || '<div style="color:#64748b;font-size:12px;text-align:center;padding:20px;">No data</div>';
  } catch(e) {}
}

async function loadRecentTrades() {
  try {
    const trades = await apiFetch('/api/paper/trades').catch(() => []);
    if (!trades || trades.length === 0) return;
    const recent = trades.slice(-10).reverse();
    let html = '';
    for (const t of recent) {
      const sym = t.instrument?.toString() || '?';
      const dir = t.direction?.toString() || '?';
      const pnl = t.pnlUsd || 0;
      html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #1a2540;">';
      html += '<div style="flex:0 0 72px;"><span class="ticker" style="font-size:12px;font-weight:700;color:#e2e8f0;">' + sym + '</span></div>';
      html += '<div style="flex:0 0 50px;"><span class="badge ' + (dir==='BUY'?'badge-green':'badge-red') + '">' + dir + '</span></div>';
      html += '<div style="flex:1;font-size:12px;color:#64748b;">' + (t.strategyName||'—') + '</div>';
      html += '<div>' + fmtPnl(pnl) + '</div>';
      html += '</div>';
    }
    document.getElementById('recent-trades-list').innerHTML = html;
  } catch(e) {}
}

async function loadStrategyDonut() {
  try {
    const byStrategy = await apiFetch('/api/paper/performance/by-strategy').catch(() => null);
    if (!byStrategy || Object.keys(byStrategy).length === 0) return;
    const labels = Object.keys(byStrategy);
    const data = labels.map(k => byStrategy[k].totalTrades);
    const colors = ['#3b82f6','#00d4a0','#8b5cf6','#f59e0b','#ff4d6d'];
    if (strategyChartInst) strategyChartInst.destroy();
    strategyChartInst = makeDonutChart('strategyChart', labels, data, colors);

    let legendHtml = '';
    labels.forEach((l, i) => {
      const s = byStrategy[l];
      legendHtml += '<div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;margin-bottom:6px;">';
      legendHtml += '<div style="display:flex;align-items:center;gap:6px;"><div style="width:8px;height:8px;border-radius:2px;background:' + colors[i%colors.length] + ';"></div><span style="color:#94a3b8;">' + l + '</span></div>';
      legendHtml += '<div style="display:flex;gap:12px;"><span style="color:#64748b;">' + s.totalTrades + ' trades</span><span style="font-weight:600;' + (s.totalPnlUsd>=0?'color:#00d4a0':'color:#ff4d6d') + ';">' + (s.totalPnlUsd>=0?'+':'') + '$' + s.totalPnlUsd.toFixed(2) + '</span></div>';
      legendHtml += '</div>';
    });
    document.getElementById('strategy-legend').innerHTML = legendHtml;
  } catch(e) {}
}

async function setEquityFilter(symbol, btn) {
  document.querySelectorAll('#equity-symbol-filter .symbol-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  try {
    let equity;
    if (!symbol) {
      equity = await apiFetch('/api/paper/equity').catch(() => null);
    } else {
      equity = await apiFetch('/api/paper/equity?symbol=' + symbol).catch(() => null);
    }
    if (equity && equity.length > 0) {
      const labels = equity.map(p => fmtTime(p.time));
      const data = equity.map(p => p.equity);
      if (equityChartInst) equityChartInst.destroy();
      equityChartInst = makeEquityChart('equityChart', labels, data);
    }
  } catch(e) {}
}

// ========== PAPER TRADING ==========
function addCsvRow() {
  const row = document.createElement('div');
  row.className = 'csv-row';
  row.style.cssText = 'display:grid;grid-template-columns:100px 1fr 28px;gap:6px;margin-bottom:6px;';
  row.innerHTML = '<select class="select input" style="padding:6px 8px;"><option>EURUSD</option><option>GBPUSD</option><option>AUDUSD</option><option>USDJPY</option><option>USDCAD</option><option>USDCHF</option><option>XAUUSD</option><option>NAS100</option></select><input type="text" class="input" placeholder="/data/SYMBOL_M5.csv" /><button onclick="this.parentElement.remove()" style="background:#7f1d1d;border:none;border-radius:6px;color:#fca5a5;cursor:pointer;font-size:13px;width:28px;">×</button>';
  document.getElementById('csv-rows').appendChild(row);
}

function addBtCsvRow() {
  const row = document.createElement('div');
  row.className = 'csv-row';
  row.style.cssText = 'display:grid;grid-template-columns:100px 1fr 28px;gap:6px;margin-bottom:6px;';
  row.innerHTML = '<select class="select input" style="padding:6px 8px;"><option>EURUSD</option><option>GBPUSD</option><option>AUDUSD</option><option>USDJPY</option><option>USDCAD</option><option>USDCHF</option><option>XAUUSD</option><option>NAS100</option></select><input type="text" class="input" placeholder="/data/SYMBOL_M5.csv" /><button onclick="this.parentElement.remove()" style="background:#7f1d1d;border:none;border-radius:6px;color:#fca5a5;cursor:pointer;font-size:13px;width:28px;">×</button>';
  document.getElementById('bt-csv-rows').appendChild(row);
}

function getCsvPaths(containerId) {
  const paths = {};
  document.querySelectorAll('#' + containerId + ' .csv-row').forEach(row => {
    const sym = row.querySelector('select').value;
    const path = row.querySelector('input[type="text"]').value.trim();
    if (sym && path) paths[sym] = path;
  });
  return paths;
}

async function startPaper() {
  const csvPaths = getCsvPaths('csv-rows');
  if (Object.keys(csvPaths).length === 0) { showToast('Add at least one symbol & CSV path', 'error'); return; }
  const speed = parseInt(document.getElementById('paper-speed').value) || 500;
  apiBase = document.getElementById('paper-api-url').value.trim() || apiBase;
  try {
    await apiFetch('/api/paper/start', {
      method: 'POST',
      body: JSON.stringify({ csvPaths, millisPerCandle: speed })
    });
    showToast('Paper trading started!', 'success');
    document.getElementById('btn-start').disabled = true;
    document.getElementById('btn-stop').disabled = false;
    updateBotStatusUI(true, 0);
    startPaperPolling();
    liveEquityPoints = [];
  } catch(e) {
    showToast('Failed to start: ' + e.message, 'error');
  }
}

async function stopPaper() {
  apiBase = document.getElementById('paper-api-url').value.trim() || apiBase;
  try {
    await apiFetch('/api/paper/stop', { method: 'POST' });
    showToast('Paper trading stopped.', 'info');
    document.getElementById('btn-start').disabled = false;
    document.getElementById('btn-stop').disabled = true;
    stopPaperPolling();
    updateBotStatusUI(false, parseInt(document.getElementById('paper-ticks').textContent)||0);
  } catch(e) {
    showToast('Failed to stop: ' + e.message, 'error');
  }
}

function startPaperPolling() {
  if (paperPolling) clearInterval(paperPolling);
  paperPolling = setInterval(pollPaper, 2000);
  pollPaper();
}

function stopPaperPolling() {
  if (paperPolling) { clearInterval(paperPolling); paperPolling = null; }
}

async function pollPaper() {
  try {
    const [status, perf, equity] = await Promise.all([
      apiFetch('/api/paper/status'),
      apiFetch('/api/paper/performance').catch(() => null),
      apiFetch('/api/paper/equity').catch(() => null)
    ]);

    document.getElementById('paper-ticks').textContent = status.tick || 0;
    document.getElementById('paper-closed').textContent = status.closedTrades || 0;
    document.getElementById('paper-open').textContent = status.openTrades || 0;

    const pnlToday = status.pnlTodayUsd || 0;
    const pnlEl = document.getElementById('paper-pnl-today');
    pnlEl.innerHTML = (pnlToday >= 0 ? '+$' : '-$') + Math.abs(pnlToday).toFixed(2);
    pnlEl.className = pnlToday > 0 ? 'pnl-pos' : pnlToday < 0 ? 'pnl-neg' : 'pnl-zero';
    pnlEl.style.fontSize = '24px'; pnlEl.style.fontWeight = '700';

    // Risk panel
    if (status.risk) {
      const r = status.risk;
      document.getElementById('risk-panel').innerHTML =
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
        riskBadge('Open Trades', r.openTrades + ' / ' + r.maxOpenTrades, r.blockedByOpenTradesLimit) +
        riskBadge('Today Trades', r.tradesToday, r.blockedByTradesPerDayLimit) +
        riskBadge('Daily Loss', '$' + (r.pnlTodayUsd||0).toFixed(2), r.blockedByDailyLossLimit) +
        riskBadge('Profit Target', '$' + r.maxLossPerTradeUsd, r.blockedByDailyProfitTarget) +
        '</div>';
    }

    // Symbol status grid
    if (status.symbols) {
      let gridHtml = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;">';
      for (const [sym, info] of Object.entries(status.symbols)) {
        gridHtml += '<div class="card-sm" style="text-align:center;">';
        gridHtml += '<div class="ticker" style="font-size:13px;font-weight:700;color:#e2e8f0;margin-bottom:6px;">' + sym + '</div>';
        gridHtml += '<div><span class="badge ' + (info.hasOpenTrade ? 'badge-yellow' : 'badge-gray') + '">' + (info.hasOpenTrade ? 'OPEN' : 'FLAT') + '</span></div>';
        gridHtml += '<div style="font-size:11px;color:#64748b;margin-top:4px;">' + info.closedTrades + ' closed</div>';
        gridHtml += '</div>';
      }
      gridHtml += '</div>';
      document.getElementById('symbol-status-grid').innerHTML = gridHtml;
    }

    updateBotStatusUI(status.running, status.tick);

    if (!status.running) {
      stopPaperPolling();
      document.getElementById('btn-start').disabled = false;
      document.getElementById('btn-stop').disabled = true;
    }

    // Live equity chart
    if (equity && equity.length > 0) {
      const labels = equity.map(p => fmtTime(p.time));
      const data = equity.map(p => p.equity);
      if (paperEquityChartInst) {
        paperEquityChartInst.data.labels = labels;
        paperEquityChartInst.data.datasets[0].data = data;
        paperEquityChartInst.update('none');
      } else {
        paperEquityChartInst = makeEquityChart('paperEquityChart', labels, data);
      }
    }

    loadPaperTrades();

  } catch(e) {
    console.error('Poll error', e);
  }
}

function riskBadge(label, value, blocked) {
  return '<div style="background:#141d35;padding:10px;border-radius:8px;border:1px solid ' + (blocked ? '#7f1d1d' : '#1a2540') + ';">' +
    '<div style="font-size:10px;color:#64748b;margin-bottom:3px;">' + label + '</div>' +
    '<div style="font-size:14px;font-weight:700;color:' + (blocked ? '#ff4d6d' : '#e2e8f0') + ';">' + value + '</div>' +
    '</div>';
}

async function loadPaperTrades() {
  try {
    const sym = document.getElementById('paper-symbol-filter').value;
    const url = sym ? '/api/paper/trades?symbol=' + sym : '/api/paper/trades';
    const trades = await apiFetch(url).catch(() => null);
    if (!trades || trades.length === 0) {
      document.getElementById('paper-trades-table').innerHTML = '<div style="text-align:center;padding:40px;color:#64748b;font-size:13px;"><i class="fas fa-exchange-alt" style="font-size:28px;color:#2c3d64;display:block;margin-bottom:8px;"></i>No trades yet.</div>';
      return;
    }
    document.getElementById('paper-trades-table').innerHTML = buildTradeTable(trades.slice(-100).reverse());
  } catch(e) {}
}

async function exportPaperTrades() {
  try {
    const sym = document.getElementById('paper-symbol-filter').value;
    const url = apiBase + (sym ? '/api/paper/trades/export?symbol=' + sym : '/api/paper/trades/export');
    window.open(url, '_blank');
  } catch(e) { showToast('Export failed: ' + e.message, 'error'); }
}

// ========== BACKTEST ==========
async function runBacktest() {
  const csvPaths = getCsvPaths('bt-csv-rows');
  if (Object.keys(csvPaths).length === 0) { showToast('Add at least one symbol & CSV path', 'error'); return; }
  apiBase = document.getElementById('bt-api-url').value.trim() || apiBase;

  const btn = document.getElementById('btn-bt-run');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner spin"></i> Running...';
  document.getElementById('bt-results').innerHTML = '<div style="text-align:center;padding:80px;color:#64748b;"><i class="fas fa-spinner spin" style="font-size:36px;color:#3b82f6;display:block;margin-bottom:16px;"></i>Running backtest, please wait...</div>';

  try {
    const result = await apiFetch('/api/backtest', {
      method: 'POST',
      body: JSON.stringify({ csvPaths })
    });
    renderBacktestResults(result);
    showToast('Backtest complete!', 'success');
  } catch(e) {
    showToast('Backtest failed: ' + e.message, 'error');
    document.getElementById('bt-results').innerHTML = '<div style="text-align:center;padding:60px;color:#ff4d6d;"><i class="fas fa-exclamation-triangle" style="font-size:36px;display:block;margin-bottom:12px;"></i>' + e.message + '</div>';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-play"></i> Run Backtest';
  }
}

function renderBacktestResults(result) {
  const instruments = Object.keys(result);
  if (instruments.length === 0) {
    document.getElementById('bt-results').innerHTML = '<div style="text-align:center;padding:60px;color:#64748b;">No results returned</div>';
    return;
  }

  let html = '';

  // Summary row
  html += '<div class="grid-' + Math.min(instruments.length, 4) + '" style="margin-bottom:20px;">';
  instruments.forEach(inst => {
    const r = result[inst];
    const pnl = r.totalPnLUsd || 0;
    const color = pnl >= 0 ? '#00d4a0' : '#ff4d6d';
    html += '<div class="stat-card" style="border-color:' + color + '33;">';
    html += '<div style="font-size:14px;font-weight:700;color:#e2e8f0;margin-bottom:8px;" class="ticker">' + inst + '</div>';
    html += '<div style="font-size:22px;font-weight:700;color:' + color + ';font-family:monospace;">' + (pnl>=0?'+':'') + '$' + pnl.toFixed(2) + '</div>';
    html += '<div style="font-size:11px;color:#64748b;margin-top:4px;">' + r.totalTrades + ' trades · ' + (r.winRate||0).toFixed(1) + '% WR</div>';
    html += '</div>';
  });
  html += '</div>';

  // Detailed per-instrument
  instruments.forEach(inst => {
    const r = result[inst];
    const pnl = r.totalPnLUsd || 0;
    const color = pnl >= 0 ? '#00d4a0' : '#ff4d6d';
    html += '<div class="card" style="margin-bottom:16px;">';
    html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">';
    html += '<div class="ticker" style="font-size:16px;font-weight:700;color:#e2e8f0;">' + inst + '</div>';
    html += '<div style="font-size:18px;font-weight:700;color:' + color + ';font-family:monospace;">' + (pnl>=0?'+':'') + '$' + pnl.toFixed(2) + '</div>';
    html += '</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">';
    html += btStat('Total Trades', r.totalTrades);
    html += btStat('Wins', r.wins, '#00d4a0');
    html += btStat('Losses', r.losses, '#ff4d6d');
    html += btStat('Win Rate', (r.winRate||0).toFixed(1) + '%', r.winRate >= 50 ? '#00d4a0' : '#ff4d6d');
    html += btStat('Max Drawdown', '$' + (r.maxDrawdownUsd||0).toFixed(2), '#ff4d6d');
    html += btStat('Signals Found', r.signalsFound);
    html += btStat('Blocked (Session)', r.blockedBySession, '#f59e0b');
    html += btStat('Blocked (Risk)', r.blockedByRisk, '#f59e0b');
    html += '</div>';

    // Trade list
    if (r.trades && r.trades.length > 0) {
      html += '<div style="font-size:13px;font-weight:600;color:#94a3b8;margin-bottom:8px;">Individual Trades (' + r.trades.length + ')</div>';
      html += '<div class="table-wrap">' + buildTradeTable(r.trades.slice(0, 50)) + '</div>';
      if (r.trades.length > 50) html += '<div style="font-size:12px;color:#64748b;margin-top:8px;text-align:center;">Showing 50 of ' + r.trades.length + ' trades</div>';
    }
    html += '</div>';
  });

  document.getElementById('bt-results').innerHTML = html;
}

function btStat(label, value, color='#e2e8f0') {
  return '<div style="background:#141d35;border-radius:8px;padding:12px;border:1px solid #1a2540;">' +
    '<div style="font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">' + label + '</div>' +
    '<div style="font-size:18px;font-weight:700;color:' + color + ';font-family:monospace;">' + value + '</div>' +
    '</div>';
}

// ========== TRADE LOG ==========
async function loadAllTrades() {
  try {
    const sym = document.getElementById('trades-symbol-filter').value;
    const url = sym ? '/api/paper/trades?symbol=' + sym : '/api/paper/trades';
    allTradesData = await apiFetch(url).catch(() => []);
    tradesPage = 1;
    renderTradesPage();
    renderTradesStats();
  } catch(e) {}
}

function filterTrades() {
  const dir = document.getElementById('trades-dir-filter').value;
  const res = document.getElementById('trades-result-filter').value;
  let filtered = allTradesData;
  if (dir) filtered = filtered.filter(t => t.direction === dir);
  if (res === 'win') filtered = filtered.filter(t => t.pnlUsd > 0);
  if (res === 'loss') filtered = filtered.filter(t => t.pnlUsd < 0);
  tradesPage = 1;
  renderTradesPage(filtered);
}

function renderTradesPage(data) {
  const d = data || allTradesData;
  const dir = document.getElementById('trades-dir-filter').value;
  const res = document.getElementById('trades-result-filter').value;
  let filtered = d;
  if (!data) {
    if (dir) filtered = filtered.filter(t => t.direction === dir);
    if (res === 'win') filtered = filtered.filter(t => t.pnlUsd > 0);
    if (res === 'loss') filtered = filtered.filter(t => t.pnlUsd < 0);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const start = (tradesPage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const slice = filtered.slice().reverse().slice(start, end);

  if (total === 0) {
    document.getElementById('trades-table-wrap').innerHTML = '<div style="text-align:center;padding:60px;color:#64748b;"><i class="fas fa-list-alt" style="font-size:36px;color:#2c3d64;display:block;margin-bottom:12px;"></i>No trades found.</div>';
    document.getElementById('trades-count-text').textContent = '';
    document.getElementById('trades-page-btns').innerHTML = '';
    return;
  }

  document.getElementById('trades-table-wrap').innerHTML = buildTradeTable(slice);
  document.getElementById('trades-count-text').textContent = 'Showing ' + (start+1) + '–' + end + ' of ' + total + ' trades';
  document.getElementById('trades-pagination').style.display = 'flex';

  let pagerHtml = '';
  for (let i = 1; i <= Math.min(totalPages, 10); i++) {
    pagerHtml += '<button onclick="tradesPage=' + i + ';renderTradesPage()" class="btn btn-outline" style="padding:4px 10px;font-size:12px;' + (i===tradesPage ? 'background:#1a2540;color:#e2e8f0;' : '') + '">' + i + '</button>';
  }
  document.getElementById('trades-page-btns').innerHTML = pagerHtml;
}

function renderTradesStats() {
  const t = allTradesData;
  if (!t || t.length === 0) { document.getElementById('trades-stats-strip').innerHTML = ''; return; }
  const wins = t.filter(x => x.pnlUsd > 0).length;
  const losses = t.filter(x => x.pnlUsd < 0).length;
  const pnl = t.reduce((a, x) => a + x.pnlUsd, 0);
  const wr = (wins / t.length * 100).toFixed(1);
  document.getElementById('trades-stats-strip').innerHTML =
    statCard('Total Trades', t.length, 'blue') +
    statCard('Wins', wins, 'green') +
    statCard('Losses', losses, 'red') +
    statCard('Net P&L', (pnl>=0?'+$':'-$') + Math.abs(pnl).toFixed(2), pnl>=0?'green':'red', true);
}

function statCard(label, value, type, isMono=false) {
  const colors = { blue:'#60a5fa', green:'#00d4a0', red:'#ff4d6d', purple:'#a78bfa' };
  return '<div class="stat-card ' + type + '"><div class="label">' + label + '</div>' +
    '<div style="font-size:24px;font-weight:700;color:' + (colors[type]||'#e2e8f0') + ';' + (isMono?'font-family:monospace;':'') + '">' + value + '</div></div>';
}

function buildTradeTable(trades) {
  if (!trades || trades.length === 0) return '<div style="text-align:center;padding:30px;color:#64748b;">No trades</div>';
  return '<table><thead><tr>' +
    '<th>Symbol</th><th>Dir</th><th>Strategy</th><th>Entry</th><th>Exit</th><th>Entry Price</th><th>Exit Price</th><th>P&L</th><th>Result</th>' +
    '</tr></thead><tbody>' +
    trades.map(t => {
      const sym = t.instrument?.toString() || '?';
      const dir = t.direction?.toString() || '?';
      const pnl = t.pnlUsd || 0;
      return '<tr>' +
        '<td><span class="ticker" style="font-weight:600;color:#e2e8f0;">' + sym + '</span></td>' +
        '<td><span class="badge ' + (dir==='BUY'?'badge-green':'badge-red') + '">' + dir + '</span></td>' +
        '<td><span style="font-size:12px;color:#94a3b8;">' + (t.strategyName||'—') + '</span></td>' +
        '<td><span style="font-size:11px;color:#64748b;">' + fmtTime(t.entryTime) + '</span></td>' +
        '<td><span style="font-size:11px;color:#64748b;">' + fmtTime(t.exitTime) + '</span></td>' +
        '<td><span class="ticker" style="font-size:12px;">' + (t.entryPrice||0).toFixed(5) + '</span></td>' +
        '<td><span class="ticker" style="font-size:12px;">' + (t.exitPrice||0).toFixed(5) + '</span></td>' +
        '<td>' + fmtPnl(pnl) + '</td>' +
        '<td><span class="badge ' + (pnl>0?'badge-green':pnl<0?'badge-red':'badge-gray') + '">' + (pnl>0?'WIN':pnl<0?'LOSS':'BE') + '</span></td>' +
        '</tr>';
    }).join('') + '</tbody></table>';
}

async function exportAllTrades() {
  const sym = document.getElementById('trades-symbol-filter').value;
  const url = apiBase + (sym ? '/api/paper/trades/export?symbol=' + sym : '/api/paper/trades/export');
  window.open(url, '_blank');
}

// ========== LEADERBOARD ==========
async function loadStrategyLeaderboard() {
  const sym = document.getElementById('lb-strat-symbol').value;
  try {
    const data = await apiFetch('/api/paper/leaderboard/strategies' + (sym ? '?symbol=' + sym : '')).catch(() => []);
    if (!data || data.length === 0) {
      document.getElementById('lb-strategies-content').innerHTML = '<div style="text-align:center;padding:60px;color:#64748b;">No strategy data yet.</div>';
      return;
    }
    document.getElementById('lb-strategies-content').innerHTML = buildLeaderboardTable(data, 'strategy');
  } catch(e) {}
}

async function loadSymbolLeaderboard() {
  const strat = document.getElementById('lb-sym-strategy').value;
  try {
    const data = await apiFetch('/api/paper/leaderboard/symbols' + (strat ? '?strategyName=' + encodeURIComponent(strat) : '')).catch(() => []);
    if (!data || data.length === 0) {
      document.getElementById('lb-symbols-content').innerHTML = '<div style="text-align:center;padding:60px;color:#64748b;">No symbol data yet.</div>';
      return;
    }
    document.getElementById('lb-symbols-content').innerHTML = buildLeaderboardTable(data, 'symbol');
  } catch(e) {}
}

function buildLeaderboardTable(data, type) {
  let html = '<div class="card">';
  html += '<table><thead><tr><th style="width:40px;">#</th><th>' + (type==='strategy'?'Strategy':'Symbol') + '</th>' +
    '<th>Trades</th><th>Win Rate</th><th>Net P&L</th><th>Avg Win</th><th>Avg Loss</th>' +
    '<th>Profit Factor</th><th>Max DD</th><th>Score</th></tr></thead><tbody>';

  data.forEach((entry, i) => {
    const name = type === 'strategy' ? entry.strategyName : entry.symbol;
    const rankClass = i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':'rank-other';
    const pnl = entry.totalPnlUsd || 0;

    html += '<tr>';
    html += '<td><div class="leaderboard-rank ' + rankClass + '">' + (i+1) + '</div></td>';
    html += '<td><span class="ticker" style="font-size:14px;font-weight:700;color:#e2e8f0;">' + name + '</span></td>';
    html += '<td>' + entry.totalTrades + ' <span style="color:#64748b;font-size:11px;">(' + entry.wins + 'W/' + entry.losses + 'L)</span></td>';
    html += '<td>';
    html += '<div style="display:flex;align-items:center;gap:8px;">';
    html += '<span style="font-weight:600;color:' + (entry.winRate>=50?'#00d4a0':'#ff4d6d') + ';">' + fmtPct(entry.winRate) + '</span>';
    html += '<div class="progress-bar" style="width:60px;"><div class="progress-fill" style="width:' + Math.min(entry.winRate,100) + '%;background:' + (entry.winRate>=50?'#00d4a0':'#ff4d6d') + ';"></div></div>';
    html += '</div></td>';
    html += '<td>' + fmtPnl(pnl) + '</td>';
    html += '<td class="pnl-pos">+$' + fmtNum(entry.averageWinUsd) + '</td>';
    html += '<td class="pnl-neg">-$' + fmtNum(entry.averageLossUsd) + '</td>';
    html += '<td><span style="font-weight:600;color:' + (entry.profitFactor>=1?'#00d4a0':'#ff4d6d') + ';">' + fmtNum(entry.profitFactor) + '</span></td>';
    html += '<td class="pnl-neg">$' + fmtNum(entry.maxDrawdownUsd) + '</td>';
    html += '<td><span class="badge ' + (entry.score>=0?'badge-blue':'badge-red') + '">' + fmtNum(entry.score,1) + '</span></td>';
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  return html;
}

function switchLeaderboardTab(tab) {
  if (tab === 'strategies') {
    document.getElementById('lb-strategies-section').style.display = 'block';
    document.getElementById('lb-symbols-section').style.display = 'none';
    document.getElementById('lb-tab-strategies').classList.add('active');
    document.getElementById('lb-tab-symbols').classList.remove('active');
    loadStrategyLeaderboard();
  } else {
    document.getElementById('lb-strategies-section').style.display = 'none';
    document.getElementById('lb-symbols-section').style.display = 'block';
    document.getElementById('lb-tab-strategies').classList.remove('active');
    document.getElementById('lb-tab-symbols').classList.add('active');
    loadSymbolLeaderboard();
  }
}

// ========== BOT STATUS ==========
function updateBotStatusUI(running, ticks) {
  const dot1 = document.getElementById('sidebar-dot');
  const dot2 = document.getElementById('header-dot');
  const statusText = document.getElementById('sidebar-status-text');
  const tickText = document.getElementById('sidebar-tick-text');
  const headerStatus = document.getElementById('header-status');

  if (running) {
    dot1.className = 'status-dot running';
    dot2.style.background = '#00d4a0';
    statusText.textContent = 'Bot Running';
    headerStatus.textContent = 'Running';
  } else {
    dot1.className = 'status-dot stopped';
    dot2.style.background = '#ff4d6d';
    statusText.textContent = 'Bot Stopped';
    headerStatus.textContent = 'Stopped';
  }
  tickText.textContent = (ticks || 0) + ' ticks processed';
}

// ========== SETTINGS ==========
function saveSettings() {
  const url = document.getElementById('settings-api-url').value.trim();
  apiBase = url;
  localStorage.setItem('fxbot_api', url);
  document.getElementById('paper-api-url').value = url;
  document.getElementById('bt-api-url').value = url;

  // Test connection
  const el = document.getElementById('settings-test-result');
  el.innerHTML = '<i class="fas fa-spinner spin"></i> Testing...';
  el.style.color = '#94a3b8';

  fetch(url + '/api/paper/status')
    .then(r => {
      if (r.ok) {
        el.innerHTML = '<i class="fas fa-check-circle" style="color:#00d4a0;"></i> Connection successful!';
        el.style.color = '#00d4a0';
        showToast('Connected to backend!', 'success');
      } else {
        throw new Error('HTTP ' + r.status);
      }
    })
    .catch(e => {
      el.innerHTML = '<i class="fas fa-times-circle" style="color:#ff4d6d;"></i> Connection failed: ' + e.message;
      el.style.color = '#ff4d6d';
    });
}

// ========== REFRESH ALL ==========
async function refreshAll() {
  const icon = document.getElementById('refresh-icon');
  icon.classList.add('spin');
  const activePage = document.querySelector('.page.active')?.id?.replace('page-', '');
  if (activePage === 'dashboard') await refreshDashboard();
  else if (activePage === 'trades') await loadAllTrades();
  else if (activePage === 'leaderboard') { await loadStrategyLeaderboard(); await loadSymbolLeaderboard(); }
  else if (activePage === 'paper') await loadPaperTrades();
  setTimeout(() => icon.classList.remove('spin'), 600);
  showToast('Refreshed', 'info');
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  // Load API URL from storage
  const saved = localStorage.getItem('fxbot_api');
  if (saved) {
    apiBase = saved;
    document.getElementById('paper-api-url').value = saved;
    document.getElementById('bt-api-url').value = saved;
    document.getElementById('settings-api-url').value = saved;
  }

  // Check initial status
  apiFetch('/api/paper/status').then(s => {
    updateBotStatusUI(s.running, s.tick);
    if (s.running) startPaperPolling();
  }).catch(() => {});

  refreshDashboard();

  // Mobile menu button
  document.getElementById('menu-btn').style.display = 'block';
});
</script>
</body>
</html>`

export default app
