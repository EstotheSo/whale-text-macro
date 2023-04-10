// popup과 background 통신
whale.runtime.onConnect.addListener((port) => {
  if (port.name === `save_key_macro`) {
    port.onMessage.addListener((msg) => {
      whale.storage.sync.set({ key_macro: msg });
    });
  }

  if (port.name === `save_cntxt_data`) {
    port.onMessage.addListener((msg) => {
      whale.storage.sync.set({ cntxt_macro_data: msg });

      for (let i = 0; i < msg.length; i++) {
        let contextMenuProp = {
          id: i.toString(),
          title: Object.keys(msg[i][0]), // -> 이부분 string 값이어야 함
          type: "checkbox",
          contexts: ["all"],
        };
        //콘텍스트 메뉴 추가
        whale.contextMenus.create(contextMenuProp);
      }
    });
  }
});

/*
//콘텍스트 메뉴 추가
        whale.contextMenus.create({
          id: i, // 식별자
          title: macroTitle, // 컨텍스트 메뉴에서 보여지는 글자
          type: "checkbox", // 하위 컨텍스트 메뉴
          contexts: ["all"], // 어떤 타입에 오른쪽 클릭하면 컨텍스트 메뉴가 활성화 될지 결정
        });
*/

whale.runtime.onInstalled.addListener(async (details) => {
  whale.storage.sync.get(["cntxt_macro_data"], (res) => {
    if (res) {
      if (res.cntxt_macro_data) {
        console.log(res.cntxt_macro_data);
      }
    }
  });
});

whale.contextMenus.onClicked.addListener((clickData) => {
  console.log(clickData.menuItemId);
});

function paste_key_macro(txt) {
  navigator.clipboard.writeText(txt).then(() => {
    navigator.clipboard.readText().then((clipTxt) => {
      document.activeElement.value += txt;
    });
  });
}

// 단축키 누를 때 실행
whale.commands.onCommand.addListener((command) => {
  whale.storage.sync.get(["key_macro"], (res) => {
    if (res.key_macro) {
      if (res.key_macro[command]) {
        whale.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          whale.scripting.executeScript({
            target: { tabId: tabs[0].id, allFrames: true },
            func: paste_key_macro,
            args: [res.key_macro[command]],
          });
        });
      }
    }
  });
});
