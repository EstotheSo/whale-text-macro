let context_macro_cnt;

document.getElementById("shortcut").onclick = () => {
  location.href = "/index.html";
};
document.getElementById("context").onclick = () => {
  location.href = "/context_menu.html";
};

//추가 버튼 클릭
document.getElementById("add").onclick = () => {
  context_macro_cnt += 1;
  $("#add_macro").append(`<h3>매크로 ${context_macro_cnt}</h3>`);
};

//저장 버튼 클릭
document.getElementById("save").onclick = () => {
  const save_context_macro_port = whale.runtime.connect({
    name: `save_context_macro`,
  });

  save_context_macro_port.postMessage(context_macro_cnt);
};

//앱 실행시
window.onload = function () {
  whale.storage.sync.get(["context_macro_cnt"], (res) => {
    if (res) {
      if (res.context_macro_cnt) {
        context_macro_cnt = res.context_macro_cnt;
      } else {
        context_macro_cnt = 1;
      }
    }
  });
};
