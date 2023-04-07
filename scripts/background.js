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
    });
  }
});

/*
Uncaught TypeError: Error in invocation of contextMenus.

create(object createProperties, optional function callback): 
Error at parameter 'createProperties': Error at property 'contexts': 
Error at index 0: Value must be one of action, all, audio, browser_action, editable, frame, image, launcher, link, page, page_action, selection, video.
*/
//콘텍스트 메뉴 추가
whale.contextMenus.create({
  title: `텍스트 매크로`,
  contexts: `selection`,
  onclick: searchText,
});

whale.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    // 최초 설치 시 실행
  }
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

function searchText(info) {
  const myQuery = encodeURI(
    `https://search.naver.com/search.naver?query=${info.selectionText}`
  );

  whale.tabs.create({
    url: myQuery,
  });
}
