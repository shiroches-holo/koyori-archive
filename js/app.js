const url = "https://script.google.com/macros/s/AKfycby35nCN7uhqkTvMhTmb52O33xHxrpHEYkjXl0h8sCv34gxUenTfXbrAwzCs86kb05AR0w/exec";

window.data = [];

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
    window.data = json;

    autoViewMode(); // 初期表示自動判定
    
    document.getElementById("loading").style.display="none";

    const area = document.getElementById("playlistFilterArea");

    // ✅ ここが今回の本体（正しく書き直した部分）

    const playlistCount = {};
    windos.data.forEach(item=>{
      playlistCount[item.playlistName] =
        (playlistCount[item.playlistName] || 0) + 1;
    });

    const set = new Set(window.data.map(x => x.playlistName));

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

    render();

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

    console.log("ここまで来てる");
  
    reader.readAsText(file);
  });
