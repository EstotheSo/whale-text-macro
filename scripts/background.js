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

      whale.contextMenus.removeAll();

      for (let i = 0; i < msg.length; i++) {
        let macro_title = Object.keys(msg[i])[0];

        if (macro_title === "") {
          macro_title = "빈 제목";
        }

        let contextMenuProp = {
          id: i.toString(),
          title: macro_title,
          type: "normal",
          contexts: ["all"],
        };
        //콘텍스트 메뉴 추가
        whale.contextMenus.create(contextMenuProp);
      }
    });
  }

  if (port.name === `BACKUP`) {
    console.log("백업 요청 수신 완료");
    const data = async(() => {
      return whale.storage.sync.get(["cntxt_macro_data"]);
    })();

    console.log(data);
  }
});

//extension이 처음 실행되었을 때 실행
//처음 실행된 이유를 분기로 나눌 수 있는데
//첫 설치 or 새로운 버전의 extension update or chrome update
//extension이나 chrome 업데이트 시에는 기존에 저장한 매크로 정보가 날라가면 안되지 않나..
whale.runtime.onInstalled.addListener((details) => {
  if (details.reason == "install") {
    //맨 처음 인스톨 될 때 기본 콘텍스트 메뉴 추가
    whale.contextMenus.create({
      id: "first",
      title: "없음",
      type: "checkbox",
      contexts: ["all"],
    });
  }
});

//등록된 컨텍스트 매크로 중 1개가 클릭됐을 때
whale.contextMenus.onClicked.addListener((clickData) => {
  if (clickData.menuItemId !== "first") {
    let idx = clickData.menuItemId;

    // 여기서 호출될 때는 res가 무조건 있음. 없으면 컨텍스트 메뉴 자체가 생성이 안됨
    whale.storage.sync.get(["cntxt_macro_data"], (res) => {
      if (res) {
        let cntxtMacroDataObj = res.cntxt_macro_data[idx];
        let cntxtMacroDataTitle = Object.keys(cntxtMacroDataObj)[0];
        let cntxtMacroDataContent = cntxtMacroDataObj[cntxtMacroDataTitle];

        whale.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          whale.scripting.executeScript({
            target: { tabId: tabs[0].id, allFrames: true },
            func: copyAndPasteTxt,
            args: [cntxtMacroDataContent],
          });
        });
      }
    });
  }
});

function copyAndPasteTxt(txt) {
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
            func: copyAndPasteTxt,
            args: [res.key_macro[command]],
          });
        });
      }
    }
  });
});
