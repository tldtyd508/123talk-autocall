import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const companies = [
  { id: "mng", name: "[mng] mng" },
  { id: "alpha", name: "알파솔루션" },
  { id: "bridge", name: "브릿지커머스" },
  { id: "daon", name: "다온상담센터" },
  { id: "hansol", name: "한솔서비스" },
];

const initialMentions = {
  companyId: "mng",
  callbackEnabled: "N",
  prologue: "안녕하세요. 123톡 오토콜 안내입니다.",
  epilogue1: "상담 연결을 원하시면 안내에 따라 선택해주세요.",
  epilogue2: "참여해주셔서 감사합니다.",
  voice: "기본 여성",
  consultantNumber: "02-1234-5678",
  guide: "캠페인 안내 멘트를 입력해주세요.",
  rejectDigit: "9",
  digits: [
    { key: "A", digit: "1", label: "상담원 연결", target: "멘트1" },
    { key: "B", digit: "2", label: "자료 문자 받기", target: "멘트2" },
    { key: "C", digit: "3", label: "다시 듣기", target: "멘트3" },
  ],
};

const initialCampaigns = [
  {
    id: "20260703-0001",
    companyId: "mng",
    name: "7월 이벤트 안내",
    status: "보류",
    startDate: "2026-07-03",
    startTime: "09:00",
    endDate: "2026-07-04",
    endTime: "18:00",
    retry: 2,
    sendRangeStart: "09:00",
    sendRangeEnd: "18:00",
    targetFile: "",
    targetCount: 0,
    createdAt: "2026-07-03 10:30",
  },
  {
    id: "20260702-0002",
    companyId: "alpha",
    name: "만족도 조사",
    status: "완료",
    startDate: "2026-07-02",
    startTime: "10:00",
    endDate: "2026-07-02",
    endTime: "16:00",
    retry: 1,
    sendRangeStart: "10:00",
    sendRangeEnd: "17:00",
    targetFile: "survey_targets.xlsx",
    targetCount: 142,
    createdAt: "2026-07-02 16:47",
  },
];

const emptyCampaign = {
  id: "",
  companyId: "mng",
  name: "",
  status: "보류",
  startDate: "2026-07-03",
  startTime: "09:00",
  endDate: "2026-07-03",
  endTime: "18:00",
  retry: 1,
  sendRangeStart: "09:00",
  sendRangeEnd: "18:00",
  targetFile: "",
  targetCount: 0,
  createdAt: "",
};

function makeId() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const serial = String(Math.floor(Math.random() * 9000) + 1000);
  return `${y}${m}${d}-${serial}`;
}

function companyName(id) {
  return companies.find((company) => company.id === id)?.name ?? "-";
}

function App() {
  const [activeTab, setActiveTab] = useState("mentions");
  const [mentions, setMentions] = useState(initialMentions);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [selectedId, setSelectedId] = useState(initialCampaigns[0].id);
  const [draft, setDraft] = useState(initialCampaigns[0]);
  const [query, setQuery] = useState({ companyId: "", status: "", name: "" });
  const [selectedRows, setSelectedRows] = useState([]);
  const [notice, setNotice] = useState("오토콜 데모 화면이 준비되었습니다.");

  function notify(message) {
    setNotice(message);
  }

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const companyOk = query.companyId ? campaign.companyId === query.companyId : true;
      const statusOk = query.status ? campaign.status === query.status : true;
      const nameOk = query.name ? campaign.name.includes(query.name) : true;
      return companyOk && statusOk && nameOk;
    });
  }, [campaigns, query]);

  function selectCampaign(campaign) {
    setSelectedId(campaign.id);
    setDraft(campaign);
  }

  function newCampaign() {
    setSelectedId("");
    setDraft(emptyCampaign);
  }

  function saveCampaign() {
    const next = {
      ...draft,
      id: draft.id || makeId(),
      createdAt: draft.createdAt || "2026-07-03 10:30",
      name: draft.name || "새 캠페인",
    };
    setCampaigns((prev) => {
      const exists = prev.some((campaign) => campaign.id === next.id);
      return exists ? prev.map((campaign) => (campaign.id === next.id ? next : campaign)) : [next, ...prev];
    });
    setSelectedId(next.id);
    setDraft(next);
  }

  function deleteCampaign() {
    if (!draft.id) return;
    setCampaigns((prev) => prev.filter((campaign) => campaign.id !== draft.id));
    setSelectedId("");
    setDraft(emptyCampaign);
  }

  function setCampaignStatus(status) {
    const next = { ...draft, status };
    setDraft(next);
    if (next.id) {
      setCampaigns((prev) => prev.map((campaign) => (campaign.id === next.id ? next : campaign)));
    }
  }

  function attachTargets(file) {
    const next = {
      ...draft,
      targetFile: file?.name ?? "",
      targetCount: file ? 120 : 0,
    };
    setDraft(next);
    if (next.id) {
      setCampaigns((prev) => prev.map((campaign) => (campaign.id === next.id ? next : campaign)));
    }
  }

  const tabs = [
    ["mentions", "멘트 설정"],
    ["campaigns", "캠페인 등록"],
    ["targets", "대상자 등록"],
    ["results", "결과 조회"],
  ];

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h1>오토콜 관리</h1>
        </div>
      </header>

      <nav className="tabs" aria-label="오토콜 메뉴">
        {tabs.map(([id, label]) => (
          <button key={id} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      <div className="noticeBar" role="status">
        {notice}
      </div>

      {activeTab === "mentions" && <MentionsView mentions={mentions} setMentions={setMentions} notify={notify} />}
      {activeTab === "campaigns" && (
        <CampaignsView
          campaigns={filteredCampaigns}
          draft={draft}
          setDraft={setDraft}
          query={query}
          setQuery={setQuery}
          selectedId={selectedId}
          selectCampaign={selectCampaign}
          newCampaign={newCampaign}
          saveCampaign={saveCampaign}
          deleteCampaign={deleteCampaign}
          notify={notify}
        />
      )}
      {activeTab === "targets" && (
        <TargetsView
          campaigns={filteredCampaigns}
          draft={draft}
          setDraft={setDraft}
          selectedId={selectedId}
          selectCampaign={selectCampaign}
          newCampaign={newCampaign}
          saveCampaign={saveCampaign}
          deleteCampaign={deleteCampaign}
          attachTargets={attachTargets}
          setCampaignStatus={setCampaignStatus}
          notify={notify}
        />
      )}
      {activeTab === "results" && (
        <ResultsView
          campaigns={filteredCampaigns}
          query={query}
          setQuery={setQuery}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          notify={notify}
        />
      )}
    </main>
  );
}

function CompanySelect({ value, onChange, includeAll = false }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {includeAll && <option value="">업체 전체</option>}
      {companies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.name}
        </option>
      ))}
    </select>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <b>*</b>}
      </span>
      {children}
    </label>
  );
}

function MentionsView({ mentions, setMentions, notify }) {
  function update(name, value) {
    setMentions((prev) => ({ ...prev, [name]: value }));
  }

  function updateDigit(index, key, value) {
    setMentions((prev) => ({
      ...prev,
      digits: prev.digits.map((digit, i) => (i === index ? { ...digit, [key]: value } : digit)),
    }));
  }

  return (
    <section className="panel">
      <div className="sectionTitle">
        <h2>멘트 설정</h2>
        <p>업체별 오토콜 음성 흐름을 설정합니다.</p>
      </div>
      <div className="formGrid">
        <Field label="업체선택" required>
          <CompanySelect value={mentions.companyId} onChange={(value) => update("companyId", value)} />
        </Field>
        <Field label="콜게이트 사용">
          <select value={mentions.callbackEnabled} onChange={(event) => update("callbackEnabled", event.target.value)}>
            <option value="N">미사용</option>
            <option value="Y">사용</option>
          </select>
        </Field>
        <Field label="프롤로그">
          <input value={mentions.prologue} onChange={(event) => update("prologue", event.target.value)} />
        </Field>
        <Field label="성우선택">
          <select value={mentions.voice} onChange={(event) => update("voice", event.target.value)}>
            <option>기본 여성</option>
            <option>기본 남성</option>
            <option>차분한 톤</option>
            <option>밝은 톤</option>
          </select>
        </Field>
        <Field label="에필로그 성공">
          <input value={mentions.epilogue1} onChange={(event) => update("epilogue1", event.target.value)} />
        </Field>
        <Field label="상담번호">
          <input value={mentions.consultantNumber} onChange={(event) => update("consultantNumber", event.target.value)} />
        </Field>
        <Field label="안내멘트">
          <textarea value={mentions.guide} onChange={(event) => update("guide", event.target.value)} />
        </Field>
        <div className="previewCard">
          <strong>음성 미리보기</strong>
          <p>{mentions.prologue}</p>
          <p>{mentions.guide}</p>
          <button onClick={() => notify("음성 생성 요청 값이 준비되었습니다. API 연결 전 데모 상태입니다.")}>음성생성</button>
        </div>
        <Field label="수신거부">
          <input value={mentions.rejectDigit} onChange={(event) => update("rejectDigit", event.target.value)} />
        </Field>
        <Field label="에필로그 실패">
          <input value={mentions.epilogue2} onChange={(event) => update("epilogue2", event.target.value)} />
        </Field>
      </div>

      <div className="tableWrap mt">
        <table>
          <thead>
            <tr>
              <th>구분</th>
              <th>버튼번호</th>
              <th>버튼이름</th>
              <th>멘트 이동</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {mentions.digits.map((digit, index) => (
              <tr key={digit.key}>
                <td>디짓 {digit.key}</td>
                <td>
                  <input value={digit.digit} onChange={(event) => updateDigit(index, "digit", event.target.value)} />
                </td>
                <td>
                  <input value={digit.label} onChange={(event) => updateDigit(index, "label", event.target.value)} />
                </td>
                <td>
                  <select value={digit.target} onChange={(event) => updateDigit(index, "target", event.target.value)}>
                    <option>멘트1</option>
                    <option>멘트2</option>
                    <option>멘트3</option>
                  </select>
                </td>
                <td>
                  <button className="smallBtn" onClick={() => notify(`디짓 ${digit.key} 음성 생성 요청을 확인했습니다.`)}>
                    음성생성
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="actions">
        <button className="primary" onClick={() => notify(`${companyName(mentions.companyId)} 멘트 설정이 저장되었습니다.`)}>
          저장
        </button>
      </div>
    </section>
  );
}

function SearchBar({ query, setQuery, notify }) {
  return (
    <div className="searchBar">
      <CompanySelect value={query.companyId} includeAll onChange={(value) => setQuery((prev) => ({ ...prev, companyId: value }))} />
      <select value={query.status} onChange={(event) => setQuery((prev) => ({ ...prev, status: event.target.value }))}>
        <option value="">상태 전체</option>
        <option>진행</option>
        <option>보류</option>
        <option>완료</option>
      </select>
      <input
        placeholder="캠페인명"
        value={query.name}
        onChange={(event) => setQuery((prev) => ({ ...prev, name: event.target.value }))}
      />
      <button onClick={() => notify?.("검색 조건을 적용했습니다.")}>조회</button>
    </div>
  );
}

function CampaignsView(props) {
  const { campaigns, draft, setDraft, query, setQuery, selectedId, selectCampaign, newCampaign, saveCampaign, deleteCampaign, notify } = props;

  return (
    <section className="split">
      <div className="panel">
        <div className="sectionTitle">
          <h2>캠페인</h2>
          <p>검색 후 캠페인을 선택하거나 새 캠페인을 등록합니다.</p>
        </div>
        <SearchBar query={query} setQuery={setQuery} notify={notify} />
        <CampaignTable campaigns={campaigns} selectedId={selectedId} onSelect={selectCampaign} />
      </div>
      <CampaignEditor
        draft={draft}
        setDraft={setDraft}
        newCampaign={newCampaign}
        saveCampaign={saveCampaign}
        deleteCampaign={deleteCampaign}
        compact
        notify={notify}
      />
    </section>
  );
}

function TargetsView(props) {
  const {
    campaigns,
    draft,
    setDraft,
    selectedId,
    selectCampaign,
    newCampaign,
    saveCampaign,
    deleteCampaign,
    attachTargets,
    setCampaignStatus,
    notify,
  } = props;
  const isDone = draft.status === "완료";
  const canStart = Boolean(draft.targetFile) && !isDone;

  return (
    <section className="split wideRight">
      <div className="panel">
        <div className="sectionTitle">
          <h2>캠페인 대상자 등록</h2>
          <p>캠페인을 선택하면 우측에서 대상자 엑셀과 진행 상태를 관리합니다.</p>
        </div>
        <CampaignTable campaigns={campaigns} selectedId={selectedId} onSelect={selectCampaign} />
      </div>
      <div>
        <CampaignEditor
          draft={draft}
          setDraft={setDraft}
          newCampaign={newCampaign}
          saveCampaign={saveCampaign}
          deleteCampaign={deleteCampaign}
          notify={notify}
        />
        <div className="panel mt">
          <div className="sectionTitle">
            <h2>대상자 설정</h2>
            <p>엑셀 파일을 등록하면 진행 버튼이 활성화됩니다.</p>
          </div>
          <div className="uploadBox">
            <div>
              <strong>{draft.targetFile || "등록된 대상자 파일이 없습니다."}</strong>
              <span>대상자 {draft.targetCount}명</span>
            </div>
            <label className="fileButton">
              등록
              <input
                type="file"
                accept=".xls,.xlsx,.csv"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  attachTargets(file);
                  if (file) notify(`${file.name} 대상자 엑셀을 등록했습니다.`);
                }}
              />
            </label>
          </div>
          <div className="statusActions">
            <button
              disabled={!canStart}
              onClick={() => {
                setCampaignStatus("진행");
                notify("대상자에게 오토콜 진행 요청이 등록되었습니다.");
              }}
            >
              진행
            </button>
            <button
              disabled={isDone}
              onClick={() => {
                setCampaignStatus("보류");
                notify("캠페인 상태를 보류로 변경했습니다.");
              }}
            >
              보류
            </button>
            <button
              onClick={() => {
                setCampaignStatus("완료");
                notify("캠페인을 완료 처리했습니다. 진행/보류가 비활성화됩니다.");
              }}
            >
              완료
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CampaignTable({ campaigns, selectedId, onSelect }) {
  return (
    <div className="tableWrap mt">
      <table>
        <thead>
          <tr>
            <th>NO</th>
            <th>상태</th>
            <th>진행률</th>
            <th>등록일</th>
            <th>캠페인명</th>
            <th>업체</th>
            <th>대상자</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign, index) => (
            <tr
              key={campaign.id}
              className={campaign.id === selectedId ? "selected" : ""}
              onClick={() => onSelect(campaign)}
            >
              <td>{index + 1}</td>
              <td>
                <StatusBadge status={campaign.status} />
              </td>
              <td>{campaign.status === "완료" ? "100%" : campaign.status === "진행" ? "42%" : "0%"}</td>
              <td>{campaign.createdAt}</td>
              <td>{campaign.name}</td>
              <td>{companyName(campaign.companyId)}</td>
              <td>{campaign.targetCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CampaignEditor({ draft, setDraft, newCampaign, saveCampaign, deleteCampaign, compact = false, notify }) {
  function update(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <aside className="panel editor">
      <div className="sectionTitle">
        <h2>캠페인 등록</h2>
        <p>{draft.id ? draft.id : "신규 캠페인"}</p>
      </div>
      <div className={compact ? "formStack" : "formGrid one"}>
        <Field label="업체선택" required>
          <CompanySelect value={draft.companyId} onChange={(value) => update("companyId", value)} />
        </Field>
        <Field label="캠페인명" required>
          <input value={draft.name} onChange={(event) => update("name", event.target.value)} placeholder="캠페인명을 입력하세요." />
        </Field>
        <Field label="캠페인 시작" required>
          <div className="inlineFields">
            <input type="date" value={draft.startDate} onChange={(event) => update("startDate", event.target.value)} />
            <input type="time" value={draft.startTime} onChange={(event) => update("startTime", event.target.value)} />
          </div>
        </Field>
        <Field label="캠페인 종료" required>
          <div className="inlineFields">
            <input type="date" value={draft.endDate} onChange={(event) => update("endDate", event.target.value)} />
            <input type="time" value={draft.endTime} onChange={(event) => update("endTime", event.target.value)} />
          </div>
        </Field>
        <Field label="무응답 재시도">
          <input type="number" min="0" value={draft.retry} onChange={(event) => update("retry", Number(event.target.value))} />
        </Field>
        <Field label="발신 제한">
          <div className="inlineFields">
            <input type="time" value={draft.sendRangeStart} onChange={(event) => update("sendRangeStart", event.target.value)} />
            <input type="time" value={draft.sendRangeEnd} onChange={(event) => update("sendRangeEnd", event.target.value)} />
          </div>
        </Field>
      </div>
      <div className="actions">
        <button
          onClick={() => {
            newCampaign();
            notify?.("신규 캠페인 입력 상태로 전환했습니다.");
          }}
        >
          신규
        </button>
        <button
          className="primary"
          onClick={() => {
            saveCampaign();
            notify?.("캠페인 저장 요청 값이 반영되었습니다.");
          }}
        >
          저장
        </button>
        <button
          className="danger"
          onClick={() => {
            deleteCampaign();
            notify?.("캠페인을 목록에서 제거했습니다.");
          }}
          disabled={!draft.id}
        >
          삭제
        </button>
      </div>
    </aside>
  );
}

function ResultsView({ campaigns, query, setQuery, selectedRows, setSelectedRows, notify }) {
  const rows = campaigns.map((campaign, index) => {
    const seed = index + campaign.name.length;
    return {
      ...campaign,
      send: campaign.targetCount,
      click: Math.floor(seed * 3),
      success: campaign.status === "완료" ? Math.max(1, Math.floor(campaign.targetCount * 0.72)) : 0,
      answer: campaign.status === "완료" ? Math.floor(campaign.targetCount * 0.28) : 0,
      reject: seed % 4,
      abandon: seed % 3,
      busy: seed % 5,
      error: campaign.status === "보류" ? 0 : seed % 2,
    };
  });

  function toggle(id) {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]));
  }

  return (
    <section className="panel">
      <div className="sectionTitle">
        <h2>캠페인 결과 조회</h2>
        <p>조회 조건과 결과 컬럼은 PPT 예시 기준으로 구성했습니다.</p>
      </div>
      <SearchBar query={query} setQuery={setQuery} notify={notify} />
      <div className="toolbar">
        <button onClick={() => notify("결과 조회 엑셀 다운로드 요청을 확인했습니다.")}>엑셀</button>
        <button
          onClick={() => {
            setSelectedRows(rows.map((row) => row.id));
            notify("조회 결과를 전체 선택했습니다.");
          }}
        >
          전체선택
        </button>
        <button
          onClick={() => {
            setSelectedRows([]);
            notify("조회 결과 선택을 해제했습니다.");
          }}
        >
          전체해제
        </button>
      </div>
      <div className="tableWrap mt">
        <table className="results">
          <thead>
            <tr>
              <th>선택</th>
              <th>대상자</th>
              <th>NO</th>
              <th>등록일</th>
              <th>캠페인명</th>
              <th>DB종류</th>
              <th>상태</th>
              <th>반복</th>
              <th>진행상황</th>
              <th>발신</th>
              <th>콜게이트</th>
              <th>성공</th>
              <th>응답</th>
              <th>거절</th>
              <th>포기</th>
              <th>결번</th>
              <th>사서함</th>
              <th>부재/통화</th>
              <th>수신거부</th>
              <th>오류</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td>
                  <input type="checkbox" checked={selectedRows.includes(row.id)} onChange={() => toggle(row.id)} />
                </td>
                <td>보기</td>
                <td>{index + 1}</td>
                <td>{row.createdAt.slice(0, 10)}</td>
                <td>{row.name}</td>
                <td>정상</td>
                <td>
                  <StatusBadge status={row.status} />
                </td>
                <td>{row.retry}</td>
                <td>{row.status === "완료" ? "100.0%" : row.status === "진행" ? "42.0%" : "0.0%"}</td>
                <td>{row.send}</td>
                <td>{row.click}</td>
                <td>{row.success}</td>
                <td>{row.answer}</td>
                <td>{row.reject}</td>
                <td>{row.abandon}</td>
                <td>0</td>
                <td>0</td>
                <td>{row.busy}</td>
                <td>0</td>
                <td>{row.error}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusBadge({ status }) {
  return <span className={`badge ${status}`}>{status}</span>;
}

createRoot(document.getElementById("root")).render(<App />);
