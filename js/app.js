const url = "https://script.google.com/macros/s/AKfycby35nCN7uhqkTvMhTmb52O33xHxrpHEYkjXl0h8sCv34gxUenTfXbrAwzCs86kb05AR0w/exec";

let data = [];

// 初期表示を自動判定
function autoViewMode(){
  const isMobile = window.innerWidth <= 1000;
  const target = isMobile ? "card" : "table";

  document.querySelector(`input[name="view"][value="${target}"]`).checked = true;
}

function getViewMode(){
  const selected = document.querySelector('input[name="view"]:checked');
  return selected ? selected.value : "table";
}

// ✅ 統計
function updateStats(filtered){
  let total = filtered.length;
  let watched = 0;
  let totalSec = 0;
  let watchedSec = 0;

  filtered.forEach(x=>{
    totalSec += x.durationSec;
  
    if(localStorage.getItem(x.videoId)==="true"){
      watched++;
      watchedSec += x.durationSec;
    }
  });
  
  // ✅ 計算は最後 端数切り捨て
  const rate = total
    ? Math.floor((watched/total)*1000) / 10 
    : 0;

  let rateNum = rate;
  
  // ✅ 色
  let rateColor = "#333"; // ベース黒

  if(rateNum >= 30) rateColor = "#3b82f6"; // 青
  if(rateNum >= 60) rateColor = "#10b981"; // 緑
  if(rateNum >= 80) rateColor = "#f97316"; // オレンジ
  if(rateNum === 100) rateColor = "#c9a227"; // 金 👑
  
  // ✅ クラス
  let extraClass = rateNum === 100 ? "completed" : "";

  // ✅ 描画
  const isMobile = window.innerWidth <= 1000;

  document.getElementById("stats").innerHTML = `
  
    <!-- 動画本数 -->
    <div class="stat-box">
      ${
        isMobile
          ? `<div class="value">動画本数：${total}本</div>`
          : `
            <div class="label">動画本数</div>
            <div class="value">${total}本</div>
          `
      }
    </div>
  
    <!-- 動画時間 -->
    <div class="stat-box">
      ${
        isMobile
          ? `<div class="value">動画時間：${formatTotal(totalSec)}（${formatDays(totalSec)}）</div>`
          : `
            <div class="label">動画時間</div>
            <div class="value">${formatTotal(totalSec)}</div>
            <div class="sub">${formatDays(totalSec)}</div>
          `
      }
    </div>
  
    <!-- 視聴済 -->
    <div class="stat-box">
      ${
        isMobile
          ? `<div class="value">視聴済：${watched}本</div>`
          : `
            <div class="label">視聴済</div>
            <div class="value">${watched}本</div>
          `
      }
    </div>
  
    <!-- 視聴時間 -->
    <div class="stat-box">
      ${
        isMobile
          ? `<div class="value">視聴時間：${formatTotal(watchedSec)}（${formatDays(watchedSec)}）</div>`
          : `
            <div class="label">視聴時間</div>
            <div class="value">${formatTotal(watchedSec)}</div>
            <div class="sub">${formatDays(watchedSec)}</div>
          `
      }
    </div>
  
    <!-- 達成率 -->
    <div class="stat-box ${extraClass}">
      ${
        isMobile
          ? `
            <div class="value" style="color:${rateColor}">
              達成率：${rate}%
            </div>
            <div class="progress-bar small">
              <div class="progress" style="width:${rate}%; background:${rateColor}"></div>
            </div>
          `
          : `
            <div class="label">達成率</div>
            <div class="value" style="color:${rateColor}">
              ${rate}%
            </div>
            <div class="progress-bar">
              <div class="progress" style="width:${rate}%; background:${rateColor}"></div>
            </div>
          `
      }
    </div>  
  `;
}

// -------------------- 共通関数 --------------------

// 再生リスト件数表示
function updatePlaylistCount(){
  const total = document.querySelectorAll("#playlistFilterArea input").length;
  const checked = document.querySelectorAll("#playlistFilterArea input:checked").length;

  document.querySelector("#playlistBox summary").textContent =
    `再生リスト選択 (${checked}/${total})`;
}

// -------------------- 描画(render) --------------------

// メーセージボックス
function showMessage(text, type="success"){
    const el = document.getElementById("message");
  
    el.textContent = text;
  
    if(type === "error"){
      el.style.border = "2px solid #ef4444";
      el.style.color = "#ef4444";
    } else {
      el.style.border = "2px solid #10b981";
      el.style.color = "#10b981";
    }
  
    el.classList.add("show");
  
    setTimeout(()=>{
      el.classList.remove("show");
    }, 2000);
}

// -------------------- 初期読み込み --------------------

fetch(url)
  .then(r=>r.json())
  .then(json=>{
    data = json;

    autoViewMode(); // 初期表示自動判定
    
    document.getElementById("loading").style.display="none";

    const area = document.getElementById("playlistFilterArea");

    // ✅ ここが今回の本体（正しく書き直した部分）

    const playlistCount = {};
    data.forEach(item=>{
      playlistCount[item.playlistName] =
        (playlistCount[item.playlistName] || 0) + 1;
    });

    const set = new Set(data.map(x => x.playlistName));

    area.innerHTML = "";

    set.forEach(p=>{
      const label = document.createElement("label");
      label.style.display="block";

      label.innerHTML = `
        <input type="checkbox" value="${p}" checked>
        ${p} (${playlistCount[p]})
      `;

      label.querySelector("input").addEventListener("change", ()=>{
        render();
      });

      area.appendChild(label);
    });

    // ✅ イベント
    document.querySelectorAll('input[name="view"]').forEach(el=>{
      el.addEventListener("change", render);
    });
    document.getElementById("search").addEventListener("input", render);
    document.getElementById("filterStatus").addEventListener("change", render);
    document.getElementById("sort").addEventListener("change", render);
    document.getElementById("durationLimit").addEventListener("change", render);
    document.getElementById("dateFrom").addEventListener("change", render);
    document.getElementById("dateTo").addEventListener("change", render);

    // 表示を全て☑
    document.getElementById("checkAll").addEventListener("click", ()=>{  
      if(!confirm("表示されている動画を全て視聴済みにします。よろしいですか？")) {
          return;
        }

      document.querySelectorAll("#list tbody tr").forEach(tr=>{
        const id = tr.dataset.id;
        if(id){
          localStorage.setItem(id, true);
        }
      });
      render();
    });

    // 表示の☑を全て外す
    document.getElementById("uncheckAll").addEventListener("click", ()=>{
      if(!confirm("表示されている動画の視聴チェックをすべて解除します。よろしいですか？")) {
          return;
        }
      document.querySelectorAll("#list tbody tr").forEach(tr=>{
        const id = tr.dataset.id;
        if(id){
          localStorage.setItem(id, false);
        }
      });
      render();
    });

    // 再生リスト検索（※チェック状態は変えない）
    document.getElementById("playlistSearch").addEventListener("input", ()=>{
      const keyword = document.getElementById("playlistSearch").value.toLowerCase();

      document.querySelectorAll("#playlistFilterArea label").forEach(label=>{
        const text = label.textContent.toLowerCase();
        label.style.display = (!keyword || text.includes(keyword)) ? "block" : "none";
      });
    });

    // 再生リストを全てON（表示中のみ）
    document.getElementById("playlistAll").onclick = ()=>{
      document.querySelectorAll("#playlistFilterArea label").forEach(label=>{
        if(label.style.display==="none") return;
        label.querySelector("input").checked=true;
      });
      render();
    };

    // 再生リストを全てOFF
    document.getElementById("playlistClear").onclick = ()=>{
      document.querySelectorAll("#playlistFilterArea label").forEach(label=>{
        if(label.style.display==="none") return;
        label.querySelector("input").checked=false;
      });
      render();
    };

    // 条件リセット
    document.getElementById("resetAll").addEventListener("click", ()=>{
      
      // 検索
      document.getElementById("search").value = "";
      document.getElementById("playlistSearch").value = "";
    
      // 状態
      document.getElementById("filterStatus").value = "all";
    
      // ソート
      document.getElementById("sort").value = "new";
    
      // 日付
      document.getElementById("dateFrom").value = "";
      document.getElementById("dateTo").value = "";
    
      // 時間
      document.getElementById("durationLimit").value = "";
    
      // ✅ 再生リスト表示を全部復活
      document.querySelectorAll("#playlistFilterArea label").forEach(label=>{
        label.style.display = "block";
      });
    
      // ✅ 再生リスト全部チェックON
      document.querySelectorAll("#playlistFilterArea input").forEach(cb=>{
        cb.checked = true;
      });
    
      document.querySelector("#playlistBox summary").textContent =
        `再生リスト選択 (${set.size})`;
    
      render();
    });
    
    // スクロール
    document.getElementById("toTop").onclick=()=>window.scrollTo({top:0,behavior:"smooth"});
    document.getElementById("toBottom").onclick=()=>window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});

    render();
  });
  
    /* --- データ移行 --- */
    document.getElementById("exportBtn").onclick=()=>{
      const obj={};
      Object.keys(localStorage).forEach(k=>obj[k]=localStorage.getItem(k));
    
      const blob=new Blob([JSON.stringify(obj)],{type:"application/json"});
      const a=document.createElement("a");
      a.href=URL.createObjectURL(blob);
      a.download="data.json";
      a.click();
    
      showMessage("✅ エクスポート完了");
    };
    
    document.getElementById("importBtn").onclick = () => {
    document.getElementById("importFile").click();
  };
  
  document.getElementById("importFile").addEventListener("change", e => {
    const file = e.target.files[0];
    if(!file) return;
  
    const reader = new FileReader();
  
    reader.onload = ev => {
      try {
        const obj = JSON.parse(ev.target.result);
    
        Object.keys(obj).forEach(k=>{
          localStorage.setItem(k, String(obj[k]));
        });
    
        showMessage(`✅ インポート成功！（${Object.keys(obj).length}件）`);
    
        render();
    
      } catch(err){
        showMessage("❌ インポート失敗（形式エラー）", "red");
      }
    };

    // ヘルプ
    const modal = document.getElementById("helpModal");

    document.getElementById("helpBtn").onclick = () => {
      modal.style.display = "block";
    };
    
    document.getElementById("closeHelp").onclick = () => {
      modal.style.display = "none";
    };
  
    reader.readAsText(file);
  });
