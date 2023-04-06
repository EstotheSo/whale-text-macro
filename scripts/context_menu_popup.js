const ChildTagOf_li = `<li name="context_data"><div><input type="text" name="context_input_title" placeholder="제목" /></div>
<div><textarea name="context_input_content" placeholder="내용을 입력하세요."></textarea>
<button type="button" class="btn btn-default delete_btn">삭제</button></div></li>`;

document.getElementById("shortcut").onclick = () => {
  location.href = "/index.html";
};
document.getElementById("context").onclick = () => {
  location.href = "/context_menu.html";
};

//추가 버튼 클릭
document.getElementById("add").onclick = () => {
  $("#add_macro").append(ChildTagOf_li);

  //매크로 입력 칸이 추가 될 때마다 삭제 버튼 클릭 이벤트 리스너 등록
  let del_buttons = document.getElementsByClassName("delete_btn");
  for (let i = 0; i < del_buttons.length; i++) {
    del_buttons[i].onclick = (e) => {
      let li_node = e.target.parentElement.parentElement;
      li_node.remove();
    };
  }
};

//저장 버튼 클릭
//저장할 때마다 입력된 매크로 전체를 훑고 태그 넘버 리네이밍
document.getElementById("save").onclick = () => {
  const save_context_macro_data_port = whale.runtime.connect({
    name: `save_cntxt_data`,
  });

  let title_cnt = document.getElementsByName("context_input_title").length;
  let content_cnt = document.getElementsByName("context_input_content").length;
  let context_macro_arr = [];

  if (title_cnt === content_cnt) {
    for (let i = 0; i < title_cnt; i++) {
      let title_val = document.getElementsByName("context_input_title")[i]
        .value;
      let content_val = document.getElementsByName("context_input_content")[i]
        .value;

      let context_obj = {
        [title_val]: content_val,
      };

      context_macro_arr[i] = context_obj;
    }

    save_context_macro_data_port.postMessage(context_macro_arr);
  }
};

//사이드바 열릴 때
whale.sidebarAction.onClicked.addListener((result) => {
  if (result.opened) {
    getContextData();
  }
});

//앱 실행시
window.onload = function () {
  getContextData();
  registEventListenerDeleteBtn();
};

function getContextData() {
  whale.storage.sync.get(["cntxt_macro_data"], (res) => {
    if (res) {
      if (res.cntxt_macro_data) {
        $("li[name=context_data]").remove();

        const cntxt_macro_data = res.cntxt_macro_data;
        const data_length = cntxt_macro_data.length;

        for (let i = 0; i < data_length; i++) {
          $("#add_macro").append(ChildTagOf_li);
        }

        const title_arr = document.getElementsByName("context_input_title");
        const content_arr = document.getElementsByName("context_input_content");

        cntxt_macro_data.forEach((data, idx) => {
          keyOfData = Object.keys(data);

          title_arr[idx].value = keyOfData;
          content_arr[idx].value = data[keyOfData];
        });
      }
    }
  });
}

//저장 누르고 삭제 시 삭제가 안됨, 다시 추가 누르고 삭제하면 됨
function registEventListenerDeleteBtn() {
  let del_buttons = document.getElementsByClassName("delete_btn");
  for (let i = 0; i < del_buttons.length; i++) {
    del_buttons[i].onclick = (e) => {
      let li_node = e.target.parentElement.parentElement;
      li_node.remove();
    };
  }
}
