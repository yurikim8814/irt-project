"use client";

import { useMemo, useState } from "react";

const domains = [
  { id: "variables", name: "변수", level: "기초" },
  { id: "conditionals", name: "조건문", level: "기초" },
  { id: "loops", name: "반복문", level: "중간" },
  { id: "functions", name: "함수", level: "중간" },
  { id: "lists", name: "리스트", level: "중간" },
];

const mockQuestions = [
  {
    id: 1,
    domain: "loops",
    difficulty: 0.8,
    stemType: "출력 결과 예측형",
    code: `total = 0
for i in range(1, 5):
    total += i
print(total)`,
    question: "다음 코드의 실행 결과로 옳은 것은?",
    choices: ["6", "10", "15", "오류 발생"],
    answer: "10",
    explanation:
      "range(1, 5)는 1, 2, 3, 4를 의미하므로 total에는 1+2+3+4가 누적된다. 따라서 출력값은 10이다.",
  },
  {
    id: 2,
    domain: "lists",
    difficulty: 1.2,
    stemType: "실행 결과 판단형",
    code: `nums = [1, 2, 3]
print(nums[3])`,
    question: "다음 코드 실행 결과로 가장 적절한 것은?",
    choices: ["3 출력", "0 출력", "IndexError 발생", "TypeError 발생"],
    answer: "IndexError 발생",
    explanation:
      "리스트 nums의 유효 인덱스는 0, 1, 2이다. nums[3]은 범위를 벗어나므로 IndexError가 발생한다.",
  },
  {
    id: 3,
    domain: "functions",
    difficulty: 1.5,
    stemType: "코드 분석형",
    code: `def add(a, b):
    return a + b

result = add(2, 5)
print(result)`,
    question: "다음 코드에서 add 함수의 역할로 가장 적절한 것은?",
    choices: [
      "두 값을 비교한다",
      "두 값을 더한 결과를 반환한다",
      "문자열을 출력한다",
      "반복문을 수행한다",
    ],
    answer: "두 값을 더한 결과를 반환한다",
    explanation:
      "add(a, b)는 전달받은 두 매개변수의 합을 return으로 반환하는 함수이다.",
  },
];

function getThetaLabel(theta) {
  if (theta < -0.5) return "기초";
  if (theta < 0.8) return "중간";
  return "심화";
}

function pickQuestion(domain, answeredIds, theta) {
  const filtered = mockQuestions.filter(
    (q) => q.domain === domain && !answeredIds.includes(q.id)
  );
  if (filtered.length === 0) return mockQuestions[0];

  const sorted = [...filtered].sort(
    (a, b) => Math.abs(a.difficulty - theta) - Math.abs(b.difficulty - theta)
  );
  return sorted[0];
}

export default function Home() {
  const [selectedDomain, setSelectedDomain] = useState("loops");
  const [theta, setTheta] = useState(0.4);
  const [selectedChoice, setSelectedChoice] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState([]);
  const [started, setStarted] = useState(false);

  const answeredIds = useMemo(() => history.map((item) => item.id), [history]);
  const currentQuestion = useMemo(() => {
    return pickQuestion(selectedDomain, answeredIds, theta);
  }, [selectedDomain, answeredIds, theta]);

  const correctCount = history.filter((item) => item.correct).length;

  const handleStart = () => {
    setStarted(true);
    setHistory([]);
    setTheta(0.4);
    setSelectedChoice("");
    setShowResult(false);
  };

  const handleSubmit = () => {
    if (!selectedChoice) return;

    const isCorrect = selectedChoice === currentQuestion.answer;
    const nextTheta = isCorrect ? theta + 0.3 : theta - 0.2;

    setHistory((prev) => [
      ...prev,
      {
        id: currentQuestion.id,
        selected: selectedChoice,
        answer: currentQuestion.answer,
        correct: isCorrect,
      },
    ]);

    setTheta(Number(nextTheta.toFixed(2)));
    setShowResult(true);
  };

  const handleNext = () => {
    setSelectedChoice("");
    setShowResult(false);
  };

  return (
    <main style={{ padding: "32px", fontFamily: "Arial, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "12px" }}>
          IRT 기반 코드 문해력 향상 시스템
        </h1>
        <p style={{ color: "#475569", marginBottom: "24px" }}>
          학습 분야 선택, 적응형 문항 제시, 정답 확인, 해설 제공, 능력치 추정을 확인하는 초보용 프로토타입입니다.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>학습 설정</h2>

            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>학습 분야</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "16px" }}
            >
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name} ({domain.level})
                </option>
              ))}
            </select>

            <div style={{ marginBottom: "16px", padding: "12px", background: "#f1f5f9", borderRadius: "10px" }}>
              <div>현재 능력치: <strong>θ {theta.toFixed(2)}</strong></div>
              <div>현재 수준: <strong>{getThetaLabel(theta)}</strong></div>
              <div>정답 수: <strong>{correctCount}</strong></div>
            </div>

            <button
              onClick={handleStart}
              style={{
                width: "100%",
                padding: "12px",
                background: "#0f172a",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              학습 시작하기
            </button>
          </div>

          <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            {!started ? (
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "12px" }}>프로토타입 안내</h2>
                <p style={{ lineHeight: 1.7, color: "#475569" }}>
                  왼쪽에서 학습 분야를 선택한 뒤 학습 시작하기를 누르면,
                  현재 능력치에 가까운 문항이 제시됩니다.
                  문항에 답하면 정답 여부와 해설을 확인할 수 있습니다.
                </p>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: "12px", color: "#334155", fontWeight: "bold" }}>
                  문항 유형: {currentQuestion.stemType}
                </div>
                <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
                  {currentQuestion.question}
                </h2>

                <pre
                  style={{
                    background: "#0f172a",
                    color: "#f8fafc",
                    padding: "16px",
                    borderRadius: "12px",
                    overflowX: "auto",
                    marginBottom: "20px",
                  }}
                >
                  <code>{currentQuestion.code}</code>
                </pre>

                <div style={{ display: "grid", gap: "10px", marginBottom: "20px" }}>
                  {currentQuestion.choices.map((choice) => (
                    <label
                      key={choice}
                      style={{
                        border: "1px solid #cbd5e1",
                        padding: "12px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        background: selectedChoice === choice ? "#eef2ff" : "white",
                      }}
                    >
                      <input
                        type="radio"
                        name="choice"
                        value={choice}
                        checked={selectedChoice === choice}
                        onChange={(e) => setSelectedChoice(e.target.value)}
                        style={{ marginRight: "10px" }}
                      />
                      {choice}
                    </label>
                  ))}
                </div>

                {!showResult ? (
                  <button
                    onClick={handleSubmit}
                    style={{
                      padding: "12px 20px",
                      background: "#0f172a",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                  >
                    제출하기
                  </button>
                ) : (
                  <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                      {selectedChoice === currentQuestion.answer ? "정답입니다." : "오답입니다."}
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      정답: <strong>{currentQuestion.answer}</strong>
                    </div>
                    <div style={{ lineHeight: 1.7, color: "#475569", marginBottom: "16px" }}>
                      {currentQuestion.explanation}
                    </div>
                    <button
                      onClick={handleNext}
                      style={{
                        padding: "10px 16px",
                        background: "#334155",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                      }}
                    >
                      다음 보기
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}