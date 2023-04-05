// popup과 background 통신
whale.runtime.onConnect.addListener((port) => {
  if (port.name === `save_key_macro`) {
    port.onMessage.addListener((msg) => {
      whale.storage.sync.set({ key_macro: msg });
    });
  }

  if (port.name === `save_context_macro_cnt`) {
    port.onMessage.addListener((msg) => {
      whale.storage.sync.set({ context_macro_cnt: msg });
    });
  }

  if (port.name === `save_cntxt_data`) {
    port.onMessage.addListener((msg) => {
      console.log(msg[0]);
      whale.storage.sync.set({ cntxt_macro_data: msg });
    });
  }
});

whale.runtime.onInstalled.addListener((details) => {
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
