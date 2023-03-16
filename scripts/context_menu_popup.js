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
  //$("#add_macro").append(`<h3>매크로 ${context_macro_cnt}</h3>`);
  console.log(context_macro_cnt);
  $("#add_macro").append(
    `<div><input type="text" name="context_input" id="context_title_${context_macro_cnt}" placeholder="제목" /></div>`
  );
  $("#add_macro").append(
    `<div><textarea name="context_input" id="context_contents_${context_macro_cnt}" placeholder="내용을 입력하세요."></textarea>
    <button type="button" id="delete_${context_macro_cnt}" class="btn btn-default">삭제</button></div>`
  );
};

//저장 버튼 클릭
document.getElementById("save").onclick = () => {
  const save_context_macro_port = whale.runtime.connect({
    name: `save_context_macro`,
  });

  save_context_macro_port.postMessage(context_macro_cnt);

  for (i = 0; i < context_macro_cnt; i++) {}
};

//삭제 버튼 클릭
//삭제 버튼을 일괄적으로 name이나 class로 묶고
//onclick 이벤트 발생시 상위 태그의 아이디를 this.으로 획득
//https://orange056.tistory.com/96
//태그도 ul, li로 바꾸는게 좋을듯
document.getElementById("delete_0").onclick = () => {
  if (context_macro_cnt > 1) {
    context_macro_cnt -= 1;
  }
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
