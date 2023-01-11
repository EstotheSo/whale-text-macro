whale.runtime.onConnect.addListener(port => {
    if (port.name === `save_key_macro`) {
        port.onMessage.addListener((msg) => {
            whale.storage.sync.set({"key_macro": msg});
        });
    }
});

whale.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        // 최초 설치 시 실행
    }
});
