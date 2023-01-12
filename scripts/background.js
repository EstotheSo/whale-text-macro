whale.runtime.onConnect.addListener(port => {
    if (port.name === `save_key_macro`) {
        port.onMessage.addListener((msg) => {
            whale.storage.sync.set({ "key_macro": msg });
        });
    }
});

whale.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        // 최초 설치 시 실행
    }
});

function paste_key_macro(txt) {
    if (document.activeElement.id) {
        document.getElementById(document.activeElement.id).value += txt;
    } else if (document.activeElement.class) {
        console.log(document.activeElement.class)
        document.getElementsByClass(document.activeElement.name).value += txt;
    }

}

whale.commands.onCommand.addListener((command) => {
    whale.storage.sync.get(["key_macro"], (res) => {
        if (res.key_macro) {
            if (res.key_macro[command]) {
                console.log(res.key_macro[command]);

                switch (command) {
                    case 'macro0':
                        console.log("macro0");
                        break;
                    case 'macro1':
                        console.log("macro1");
                        break;
                    case 'macro2':
                        console.log("macro2");
                        break;
                    case 'macro3':
                        console.log("macro3");
                        break;
                }

                whale.tabs.query({ active: true, currentWindow: true}, (tabs) => {
                    whale.scripting.executeScript({
                        target: {tabId: tabs[0].id, allFrames: true},
                        func: paste_key_macro,
                        args: [res.key_macro[command]]
                    });
                });
            }
        }
    });
});
