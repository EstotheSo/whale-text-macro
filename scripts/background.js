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

whale.commands.onCommand.addListener((command) => {
    whale.storage.sync.get(["key_macro"], (res) => {
        if(res.key_macro) {
            if(res.key_macro[command]) {
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
                    console.log(tabs);
                    whale.tabs.sendMessage(tabs[0].id, { data: res.key_macro[command] });
                });
            }
        }
    });
});