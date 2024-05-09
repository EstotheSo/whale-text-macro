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

//백업 파일 업로드
const uploadTag = document.getElementById("load");
uploadTag.addEventListener("change", () => {
  const file = uploadTag.files[0];
  const reader = new FileReader();

  reader.readAsText(file, "UTF-8");
  reader.onload = () => {
    const upload_port = whale.runtime.connect({ name: "UPLOAD" });
    upload_port.postMessage(reader.result);
  };
});

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

  if (req.SIGNAL === "UPLOAD_COMPLETE") {
    alert("백업 데이터를 성공적으로 저장했습니다.");
  }

  if (req.SIGNAL === "UPLOAD_FAIL") {
    alert(
      "백업 데이터를 불러오는데 실패했습니다.\n백업 데이터 형식이 손상된 것 같습니다."
    );
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
