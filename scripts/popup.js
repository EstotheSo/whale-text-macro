//저장 버튼 누르면
document.getElementById("save").onclick = () => {
    let macro_array = {};

    for (i=0; i<5; i++) {
        key = "macro" + i.toString()
        data = document.getElementById(key).value;
        if (!data) break;

        macro_array[key] = data;
    }

    const save_key_macro_port = whale.runtime.connect({name: `save_key_macro`});
    save_key_macro_port.postMessage(macro_array)
}

//사이드바 열릴 때
whale.sidebarAction.onClicked.addListener(result => {
    if (result.opened) {
        console.log("sidebar open");
        whale.storage.sync.get(["key_macro"], (res) => {
            if(res) {
                for (let key in res.key_macro) {
                    console.log(res.key_macro[key]);
                    document.getElementById(key).value = res.key_macro[key]
                }
            }
        });
    }
});

//앱 실행시
window.onload = function() {
    console.log("Extension has started...");
    whale.storage.sync.get(["key_macro"], (res) => {
        if(res) {
            for (let key in res.key_macro) {
                console.log(res.key_macro[key]);
                document.getElementById(key).value = res.key_macro[key]
            }
        }
    });
};