//저장 버튼 누르면
document.getElementById("save").onclick = () => {
  let macro_array = {};

  for (i = 0; i < 4; i++) {
    key = "macro" + i.toString();
    data = document.getElementById(key).value;

    if (!data) continue;

    macro_array[key] = data;
  }

  const save_key_macro_port = whale.runtime.connect({ name: `save_key_macro` });
  save_key_macro_port.postMessage(macro_array);
  alert("저장 되었습니다.");
};

//백업 버튼 누르면
document.getElementById("backup").onclick = () => {
  const backup_port = whale.runtime.connect({ name: `BACKUP` });
  backup_port.postMessage("");
};

// 불러오기 버튼 누르면
document.getElementById("load").onclick = () => {};

//사이드바 열릴 때
whale.sidebarAction.onClicked.addListener((result) => {
  if (result.opened) {
    getKeyMacroData();
  }
});

//앱 실행시
window.onload = function () {
  getKeyMacroData();
};

document.getElementById("shortcut").onclick = () => {
  location.href = "/index.html";
};
document.getElementById("context").onclick = () => {
  location.href = "/context_menu.html";
};

function getKeyMacroData() {
  whale.storage.sync.get(["key_macro"], (res) => {
    if (res) {
      for (let key in res.key_macro) {
        document.getElementById(key).value = res.key_macro[key];
      }
    }
  });
}

whale.runtime.onMessage.addListener((req, res, sendRes) => {
  if (req.SIGNAL === "BACKUP_RES") {
    const backupData = {
      contxt: req.CONTXT,
      shortcut: req.SHORTCUT,
    };

    exportData(backupData);
  }
});

function exportData(data_) {
  let data = JSON.stringify(data_);
  let fileBlob = new Blob([data], { type: "text/plain" });
  let fileURL = URL.createObjectURL(fileBlob);
  let fileName = `whale_txtmacro_backup_${getNow()}.txt`;

  whale.downloads.download({
    filename: fileName,
    url: fileURL,
    conflictAction: "uniquify",
  });
}

function getNow() {
  const now = new Date();

  return `${now.getFullYear()}${
    now.getMonth() + 1
  }${now.getDate()}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
}
