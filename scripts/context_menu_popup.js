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
  $("#add_macro").append(
    `<li id="context_${context_macro_cnt}"><div><input type="text" name="context_input_title" placeholder="제목" /></div>
     <div><textarea name="context_input_content" placeholder="내용을 입력하세요."></textarea>
     <button type="button" class="btn btn-default delete_btn">삭제</button></div></li>`
  );

  //매크로 입력 칸이 추가 될 때마다 삭제 버튼 클릭 이벤트 리스너 등록
  let del_buttons = document.getElementsByClassName("delete_btn");
  for (let i = 0; i < del_buttons.length; i++) {
    del_buttons[i].onclick = (e) => {
      let li_node = e.target.parentElement.parentElement.id;

      $("#" + li_node).remove();
    };
  }
};

//저장 버튼 클릭
//저장할 때마다 입력된 매크로 전체를 훑고 태그 넘버 리네이밍
document.getElementById("save").onclick = () => {
  const save_context_macro_port = whale.runtime.connect({
    name: `save_context_macro_cnt`,
  });

  const save_context_macro_data_port = whale.runtime.connect({
    name: `save_cntxt_data`,
  });

  const ul_node = document.getElementById("add_macro");
  const li_nodes = ul_node.getElementsByTagName("li");

  for (i = 0; i < li_nodes.length; i++) {
    li_nodes[i].setAttribute("id", "context_" + String(i));
  }

  let title_cnt = document.getElementsByName("context_input_title").length;
  let content_cnt = document.getElementsByName("context_input_content").length;
  let context_macro_arr = [];

  if (title_cnt === content_cnt) {
    context_macro_cnt = title_cnt;

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

    save_context_macro_port.postMessage(context_macro_cnt);
    save_context_macro_data_port.postMessage(context_macro_arr);
  }
};

//사이드바 열릴 때
whale.sidebarAction.onClicked.addListener((result) => {
  if (result.opened) {
    whale.storage.sync.get(["context_macro_cnt"], (res) => {
      if (res) {
        if (res.context_macro_cnt) {
          context_macro_cnt = res.context_macro_cnt;
        } else {
          context_macro_cnt = 1;
        }
      }
    });
  }
  //console.log(context_macro_cnt);
});

//앱 실행시
window.onload = function () {
  whale.storage.sync.get(["context_macro_cnt"], (res) => {
    if (res) {
      if (res.context_macro_cnt) {
        context_macro_cnt = res.context_macro_cnt;
        console.log("!!!");
        console.log(context_macro_cnt);
      }
    } else {
      context_macro_cnt = 1;
      console.log("???");
      console.log(context_macro_cnt);
    }
  });

  whale.storage.sync.get(["cntxt_macro_data"], (res) => {
    if (res) {
      if (res.cntxt_macro_data) {
        console.log("실행은 되나3..?");
        let cntxt_macro_data = res.cntxt_macro_data;

        cntxt_macro_data.forEach((data) => {
          keyOfData = Object.keys(data);
          console.log(keyOfData[0]);
          console.log(data[keyOfData]);
        });
      }
    }
  });
};
