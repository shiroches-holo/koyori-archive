// 日付
function formatDate(d){
  const date = new Date(d);

  const days = ["日","月","火","水","木","金","土"];

  const y = date.getFullYear();
  const m = date.getMonth()+1;
  const day = date.getDate();
  const w = days[date.getDay()];

  const h = date.getHours();
  const min = date.getMinutes().toString().padStart(2,'0');

  return `${y}/${m}/${day}(${w}) ${h}:${min}`;
}

// 時間
function formatDuration(sec){
  const h = Math.floor(sec/3600);
  const m = Math.floor((sec%3600)/60);
  const s = sec%60;

  return (h?`${h}時間`:"")+(m?`${m}分`:"")+(s?`${s}秒`:"");
}

// 時間を日数に変換
function formatDays(sec){
  const days = (sec / 86400).toFixed(1);
  return `${days}日`;
}
