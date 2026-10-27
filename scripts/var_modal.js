// "변수 목록" 링크와 모달. index.html, context_menu.html 공통으로 사용한다.
// 변수를 추가하면 background.js의 MACRO_VARIABLES와 이 목록을 같이 고친다.
const MACRO_VARIABLE_DOCS = [
  { name: "{{day}}", desc: "오늘 요일로 치환됩니다. (예: 월요일)" },
];

document.querySelector("header").insertAdjacentHTML(
  "beforeend",
  `<a href="#" class="varLink" data-toggle="modal" data-target="#varModal">변수 목록</a>`
);

document.body.insertAdjacentHTML(
  "beforeend",
  `<div class="modal fade" id="varModal" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-sm" role="document">
    <div class="modal-content">
      <div class="modal-header"><h4 class="modal-title">변수 목록</h4></div>
      <div class="modal-body">
        <section class="varSection">
          <h5>사용법</h5>
          <p>매크로 내용에 변수를 적으면 붙여넣을 때 값으로 바뀝니다.<br />
          예) <code>오늘은 {{day}}입니다.</code> → 오늘은 월요일입니다.</p>
          <p class="text-muted">대소문자를 구분하지 않고, 중괄호 안 공백도 무시합니다.<br />
          (<code>{{DAY}}</code>, <code>{{ day }}</code> 모두 동작)</p>
        </section>
        <section class="varSection varList">
          <h5>변수</h5>
          ${MACRO_VARIABLE_DOCS.map(
            (v) => `<div><code>${v.name}</code> : ${v.desc}</div>`
          ).join("")}
        </section>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">닫기</button>
      </div>
    </div>
  </div>
</div>`
);
