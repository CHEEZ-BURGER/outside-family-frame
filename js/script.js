(() => {
  "use strict";

  const root = document.documentElement;
  const header = document.getElementById("siteHeader");
  const progressBar = document.getElementById("progressBar");
  const menuToggle = document.getElementById("menuToggle");
  const chapterNav = document.getElementById("chapterNav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let ticking = false;
  const updateScroll = () => {
    const y = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progressBar.style.width = `${Math.min(100, (y / maxScroll) * 100)}%`;
    header.classList.toggle("is-scrolled", y > 24);

    if (!reduceMotion) {
      const heroProgress = Math.min(1, y / Math.max(1, window.innerHeight));
      root.style.setProperty("--hero-shift", `${heroProgress * 82}px`);
      root.style.setProperty("--hero-scale", String(1 + heroProgress * 0.06));
      root.style.setProperty("--hero-fade", String(Math.max(0.18, 1 - heroProgress * 1.05)));
    }
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });
  updateScroll();

  document.querySelectorAll("[data-target]").forEach((control) => {
    control.addEventListener("click", () => {
      document.getElementById(control.dataset.target)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      chapterNav.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  menuToggle?.addEventListener("click", () => {
    const open = !chapterNav.classList.contains("is-open");
    chapterNav.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -6%" });
  document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.id === "top") return;
      chapterNav.querySelectorAll("button").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.target === entry.target.id);
      });
    });
  }, { rootMargin: "-35% 0px -55%", threshold: 0 });
  document.querySelectorAll("[data-section]").forEach((section) => sectionObserver.observe(section));

  const comparisons = {
    independence: {
      word: "준비", kicker: "점진적 독립", heading: "상의하고, 준비하고, 옮겨간다",
      text: "가족과 시간을 두고 거처와 비용을 준비합니다. 독립한 뒤에도 가족과 연락하거나 필요할 때 도움을 받을 가능성이 남아 있습니다."
    },
    escape: {
      word: "탈출", kicker: "급박한 단절", heading: "피하고, 버티고, 다시 시작한다",
      text: "폭력과 불화를 피해 짧은 시간 안에 거처를 구합니다. 보증금·생활비·조력자 없이 원가정과의 접촉까지 끊기는 경우가 많습니다."
    }
  };
  const compareStage = document.getElementById("compareStage");
  document.querySelectorAll(".compare-tabs button").forEach((button) => {
    button.addEventListener("click", () => {
      const data = comparisons[button.dataset.mode];
      document.querySelectorAll(".compare-tabs button").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      compareStage.className = `compare-stage ${button.dataset.mode}`;
      document.getElementById("compareBigword").textContent = data.word;
      document.getElementById("compareKicker").textContent = data.kicker;
      document.getElementById("compareHeading").textContent = data.heading;
      document.getElementById("compareText").textContent = data.text;
    });
  });

  const voices = [
    { quote: "“제 선택과는 관계없이 일어난 일이었어요.”", detail: "17세에 경제적 곤란으로 한 차례 집을 나왔다. 다시 아버지와 살았지만 가정폭력이 반복됐고, 21세에 또 한 번 가족을 떠났다.", name: "한모 씨 · 27세" },
    { quote: "“더 이상 함께 살기 어렵다고 판단해 집을 떠났어요.”", detail: "가족과의 심한 충돌 뒤 서둘러 고시원 방을 구했다. 갑작스러운 탈가정으로 보증금을 마련할 시간도 없었다.", name: "박선숙 씨 · 30대" },
    { quote: "“생계급여를 나눠 받으려 연락했지만 끝내 받지 못했어요.”", detail: "실제로는 원가정과 단절했지만 가구 단위로 지급된 급여는 부모에게 갔다. 서류상 가족은 복지를 받기 위해 다시 연락해야 하는 이유가 됐다.", name: "한모 씨 · 27세" }
  ];
  let voiceIndex = 0;
  const renderVoice = () => {
    const voice = voices[voiceIndex];
    document.getElementById("voiceCounter").textContent = `${String(voiceIndex + 1).padStart(2,"0")} / 03`;
    document.getElementById("voiceQuote").textContent = voice.quote;
    document.getElementById("voiceDetail").textContent = voice.detail;
    document.getElementById("voiceName").textContent = voice.name;
  };
  document.getElementById("voicePrev")?.addEventListener("click", () => { voiceIndex = (voiceIndex + voices.length - 1) % voices.length; renderVoice(); });
  document.getElementById("voiceNext")?.addEventListener("click", () => { voiceIndex = (voiceIndex + 1) % voices.length; renderVoice(); });

  const survivalEvents = [
    {
      hour: 12, icon: "12", image: "img/editorial-goshiwon.png", step: "12 HOURS · 첫날 밤", title: "밤 11시, 잘 곳을 정해야 합니다.",
      text: "보증금은 없고 장기 계약은 어렵습니다. 휴대전화 배터리는 19% 남았습니다.",
      choices: [
        { title: "고시원 하루를 결제한다", hint: "현금 −24 · 안전 +25 · 체력 +10", effects: { cash: -24, safety: 25, energy: 10 }, feedback: "문을 잠글 수 있는 방을 얻었습니다. 하지만 가진 현금의 절반 이상이 사라졌습니다." },
        { title: "24시간 찜질방으로 간다", hint: "현금 −11 · 안전 +6 · 체력 +3", effects: { cash: -11, safety: 6, energy: 3 }, feedback: "비용은 아꼈지만 짐을 끌어안고 선잠을 잡습니다. 내일 쓸 체력이 충분하지 않습니다." }
      ]
    },
    {
      hour: 24, icon: "24", image: "img/editorial-survival.png", step: "24 HOURS · 배터리 6%", title: "연락 수단이 끊기기 직전입니다.",
      text: "충전하려면 이동하고 돈을 써야 합니다. 그 사이 끼니와 구직 시간을 포기할 수도 있습니다.",
      choices: [
        { title: "카페에서 충전하고 지원처를 찾는다", hint: "현금 −9 · 연결 +22 · 체력 −7", require: { cash: 9 }, effects: { cash: -9, network: 22, energy: -7 }, feedback: "주거상담 기관 번호를 저장했습니다. 도움을 요청할 수 있는 연결이 하나 생겼습니다." },
        { title: "전원을 끄고 일자리를 먼저 찾는다", hint: "현금 +15 · 연결 −7 · 체력 −14", effects: { cash: 15, network: -7, energy: -14 }, feedback: "당일 일당을 받았습니다. 대신 지원 정보를 확인할 시간을 놓쳤습니다." }
      ]
    },
    {
      hour: 36, icon: "36", image: "img/editorial-departure.png", step: "36 HOURS · 남겨둔 서류", title: "신분증과 통장을 집에 두고 나왔습니다.",
      text: "다시 집에 들어가면 비용은 아낄 수 있습니다. 재발급을 택하면 시간과 돈이 듭니다.",
      choices: [
        { title: "집 근처로 돌아가 서류를 가져온다", hint: "안전 −30 · 체력 −8 · 현금 +7", effects: { safety: -30, energy: -8, cash: 7 }, feedback: "서류는 찾았지만 원가정 근처로 돌아가는 동안 위험과 불안이 다시 커졌습니다." },
        { title: "재발급 절차를 시작한다", hint: "현금 −12 · 체력 −11 · 연결 +8", require: { cash: 12 }, effects: { cash: -12, energy: -11, network: 8, safety: 3 }, feedback: "하루를 더 써야 하지만 원가정에 돌아가지 않는 경로를 택했습니다." }
      ]
    },
    {
      hour: 48, icon: "48", image: "img/editorial-welfare-maze.png", step: "48 HOURS · 복지의 문", title: "주민센터에서 부모의 소득 자료를 요구합니다.",
      text: "단절을 설명했지만 공적 기록이 부족합니다. 부모에게 연락하면 심사가 빨라질 수 있다고 합니다.",
      choices: [
        { title: "부모에게 다시 연락한다", hint: "안전 −27 · 현금 +17 · 연결 −6", effects: { safety: -27, cash: 17, network: -6 }, feedback: "절차는 빨라졌지만 단절한 가족과 다시 접촉했습니다. 지원의 대가가 불안으로 돌아옵니다." },
        { title: "상담기관과 함께 단절을 소명한다", hint: "연결 +25 · 체력 −12 · 현금 −6", require: { network: 28 }, effects: { network: 25, energy: -12, cash: -6, safety: 5 }, feedback: "즉시 결정은 나지 않았습니다. 그래도 혼자 설명하던 자리에 조력자가 함께 섰습니다." }
      ]
    },
    {
      hour: 60, icon: "60", image: "img/editorial-office.png", step: "60 HOURS · 겹친 시간", title: "단기 일자리와 주거상담 시간이 겹칩니다.",
      text: "일을 하면 현금을 확보하지만 상담 예약을 놓칩니다. 상담을 택하면 오늘의 수입은 없습니다.",
      choices: [
        { title: "일당을 받으러 간다", hint: "현금 +27 · 체력 −23 · 안전 −5", effects: { cash: 27, energy: -23, safety: -5 }, feedback: "현금은 늘었지만 다음 상담은 2주 뒤입니다. 제도의 문은 다시 멀어졌습니다." },
        { title: "주거상담 예약을 지킨다", hint: "연결 +27 · 안전 +12 · 현금 −8", require: { network: 38 }, effects: { network: 27, safety: 12, cash: -8, energy: -6 }, feedback: "즉시 입주할 방은 없지만 긴급 주거 절차를 안내받았습니다." }
      ]
    },
    {
      hour: 72, icon: "72", image: "img/editorial-goshiwon.png", step: "72 HOURS · 마지막 선택", title: "오늘 밤, 값싼 방 하나가 나왔습니다.",
      text: "잠금장치가 부실하고 계약서도 없습니다. 대기 명단을 선택하면 오늘 밤 거처가 불확실합니다.",
      choices: [
        { title: "위험을 감수하고 방을 계약한다", hint: "현금 −20 · 안전 −18 · 체력 +10", require: { cash: 20 }, effects: { cash: -20, safety: -18, energy: 10 }, feedback: "몸을 누일 곳은 생겼지만 안전을 포기한 계약입니다." },
        { title: "긴급주거 대기 명단에 남는다", hint: "연결 +18 · 체력 −16 · 안전 +5", require: { network: 45 }, effects: { network: 18, energy: -16, safety: 5, cash: -4 }, feedback: "오늘 밤은 불확실하지만 제도 안의 다음 경로를 이어갑니다." },
        { title: "역 대합실에서 아침을 기다린다", hint: "체력 −20 · 안전 −12 · 현금 −2", effects: { energy: -20, safety: -12, cash: -2 }, feedback: "돈은 아꼈지만 쉴 곳도 짐을 지킬 공간도 없었습니다. 버티는 선택은 안전한 선택이 아닙니다." }
      ]
    }
  ];
  const complications = [
    { text: "돌발 상황: 예상하지 못한 교통비가 들었습니다.", effects: { cash: -6 } },
    { text: "돌발 상황: 밤샘 뒤 몸살이 시작됐습니다.", effects: { energy: -8 } },
    { text: "돌발 상황: 휴대전화가 방전돼 연락이 끊겼습니다.", effects: { network: -7 } },
    { text: "돌발 상황: 공용공간에서 짐 일부를 잃어버렸습니다.", effects: { safety: -7, cash: -4 } }
  ];
  const initialStats = { safety: 52, energy: 55, cash: 38, network: 12 };
  let gameStats = { ...initialStats };
  let eventIndex = -1;
  const statNames = { safety: "안전", energy: "체력", cash: "현금", network: "연결" };
  const scenarioCard = document.getElementById("scenarioCard");
  const scenarioChoices = document.getElementById("scenarioChoices");
  const scenarioFeedback = document.getElementById("scenarioFeedback");
  const scenarioImage = document.getElementById("scenarioImage");
  const lifelineButton = document.getElementById("lifelineButton");
  let lifelineUsed = false;
  let gameRunning = false;

  const updateGameStats = (changed = []) => {
    Object.entries(gameStats).forEach(([key, value]) => {
      const safeValue = Math.max(0, Math.min(100, value));
      gameStats[key] = safeValue;
      const bar = document.getElementById(`${key}Bar`);
      const output = document.getElementById(`${key}Value`);
      bar.style.width = `${safeValue}%`;
      bar.style.background = safeValue <= 20 ? "var(--signal)" : "var(--acid)";
      output.textContent = safeValue;
      if (changed.includes(key)) {
        output.classList.remove("stat-flash");
        requestAnimationFrame(() => output.classList.add("stat-flash"));
      }
    });
  };
  const updateTimeline = (completed) => {
    const points = [...document.querySelectorAll(".game-timeline > span")];
    const lines = [...document.querySelectorAll(".game-timeline > i")];
    points.forEach((point, index) => {
      point.classList.toggle("is-complete", index > 0 && index <= completed);
      point.classList.toggle("is-current", index === completed);
    });
    lines.forEach((line, index) => line.classList.toggle("is-complete", index < completed));
  };
  const requirementText = (requirement) => Object.entries(requirement || {}).map(([key, value]) => `${statNames[key]} ${value} 이상 필요`).join(" · ");
  const requirementMet = (requirement) => Object.entries(requirement || {}).every(([key, value]) => gameStats[key] >= value);
  const renderEnding = (early = false) => {
    const weakest = Object.entries(gameStats).sort((a, b) => a[1] - b[1])[0];
    let title = early ? "72시간을 채우기 전에 멈췄습니다" : "아슬아슬하게 맞은 72시간";
    let text = `가장 위태로운 것은 ${statNames[weakest[0]]}이었습니다. 한 가지를 지킬 때 다른 한 가지가 무너지는 선택이 반복됐습니다.`;
    if (weakest[1] <= 10) {
      title = "경고: 혼자 버티는 방식은 한계에 닿았습니다";
      text = `${statNames[weakest[0]]} 지표가 바닥났습니다. 개인의 선택만으로 해결할 수 없는 위기입니다. 초기 주거와 생계를 보장하는 제도가 필요합니다.`;
    } else if (gameStats.network >= 60 && gameStats.safety >= 50) {
      title = "결말: 혼자가 아닌 경로를 찾았습니다";
      text = "현금만으로는 살 수 없습니다. 안전한 공간과 도움을 요청할 연결이 생길 때 비로소 다음 날을 계획할 수 있습니다.";
    } else if (gameStats.cash >= 65) {
      title = "결말: 오늘은 벌었지만 내일은 불안합니다";
      text = "당장의 현금은 확보했지만 체력과 연결이 약해졌습니다. 생존을 위해 지원 절차를 계속 미뤄야 하는 현실입니다.";
    }
    gameRunning = false;
    lifelineButton.disabled = true;
    scenarioCard.classList.add("ending");
    scenarioImage.src = "img/editorial-support.png";
    document.getElementById("scenarioIcon").textContent = "72";
    document.getElementById("scenarioStep").textContent = "YOUR ENDING · 72시간 후";
    document.getElementById("scenarioTitle").textContent = title;
    document.getElementById("scenarioText").textContent = text;
    scenarioChoices.innerHTML = '<button class="game-start" type="button" id="gameRestart">다른 선택으로 다시 시작 <b aria-hidden="true">↻</b></button>';
    scenarioFeedback.innerHTML = "이 게임에는 완벽한 선택이 없습니다. <strong>문제는 선택이 아니라 선택지를 좁히는 제도입니다.</strong>";
    document.getElementById("gameRestart").addEventListener("click", startGame);
  };
  const chooseScenario = (choice) => {
    const changed = new Set(Object.keys(choice.effects));
    changed.forEach((key) => { gameStats[key] += choice.effects[key]; });
    let complicationText = "";
    if (eventIndex > 0 && eventIndex < survivalEvents.length - 1 && Math.random() < .5) {
      const complication = complications[Math.floor(Math.random() * complications.length)];
      Object.entries(complication.effects).forEach(([key, value]) => { gameStats[key] += value; changed.add(key); });
      complicationText = ` <strong>${complication.text}</strong>`;
    }
    updateGameStats([...changed]);
    scenarioFeedback.innerHTML = `<strong>선택의 결과</strong> · ${choice.feedback}${complicationText}`;
    scenarioChoices.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    setTimeout(() => {
      if (Object.values(gameStats).some((value) => value <= 0)) { renderEnding(true); return; }
      eventIndex += 1;
      if (eventIndex >= survivalEvents.length) renderEnding();
      else renderScenario();
    }, reduceMotion ? 20 : 900);
  };
  const renderChoices = (event) => {
    scenarioChoices.replaceChildren();
    event.choices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      const strong = document.createElement("strong");
      const small = document.createElement("small");
      strong.textContent = choice.title;
      small.textContent = choice.hint;
      button.append(strong, small);
      if (!requirementMet(choice.require)) {
        button.disabled = true;
        const requirement = document.createElement("span");
        requirement.className = "requirement";
        requirement.textContent = `잠김 · ${requirementText(choice.require)}`;
        button.append(requirement);
      } else {
        button.addEventListener("click", () => chooseScenario(choice));
      }
      scenarioChoices.append(button);
    });
  };
  const renderScenario = () => {
    const event = survivalEvents[eventIndex];
    scenarioCard.classList.remove("ending", "is-changing");
    requestAnimationFrame(() => scenarioCard.classList.add("is-changing"));
    scenarioImage.src = event.image;
    document.getElementById("scenarioIcon").textContent = event.icon;
    document.getElementById("scenarioStep").textContent = event.step;
    document.getElementById("scenarioTitle").textContent = event.title;
    document.getElementById("scenarioText").textContent = event.text;
    renderChoices(event);
    scenarioFeedback.textContent = "두 선택 모두 대가가 있습니다. 지금 더 지켜야 할 조건을 선택하세요.";
    updateTimeline(eventIndex + 1);
  };
  function startGame() {
    gameStats = { ...initialStats };
    eventIndex = 0;
    lifelineUsed = false;
    gameRunning = true;
    lifelineButton.disabled = false;
    lifelineButton.innerHTML = "긴급 도움 요청 <b>1회</b>";
    updateGameStats();
    updateTimeline(0);
    renderScenario();
  }
  document.getElementById("gameStart")?.addEventListener("click", startGame);
  lifelineButton?.addEventListener("click", () => {
    if (!gameRunning || lifelineUsed) return;
    lifelineUsed = true;
    gameStats.network += 18;
    gameStats.safety += 12;
    gameStats.energy -= 8;
    gameStats.cash -= 4;
    updateGameStats(["network", "safety", "energy", "cash"]);
    lifelineButton.disabled = true;
    lifelineButton.innerHTML = "도움 요청 사용함 <b>0회</b>";
    scenarioFeedback.innerHTML = "<strong>긴급 도움 요청</strong> · 연결과 안전을 얻었지만 이동과 대기 때문에 체력과 현금을 썼습니다.";
    if (eventIndex >= 0) renderChoices(survivalEvents[eventIndex]);
  });
  lifelineButton.disabled = true;
  updateGameStats();

  const ageRange = document.getElementById("ageRange");
  const gateState = { contact: "no", record: "no" };
  const renderGate = () => {
    const age = Number(ageRange.value);
    document.getElementById("ageValue").textContent = `${age}세`;
    document.getElementById("resultAge").textContent = age;
    const gate = document.getElementById("gateResult");
    let style = "blocked";
    let heading = "서류 속 가족이 복지의 문을 막습니다.";
    let text = "30세 미만 미혼 청년은 원가정과 같은 가구로 묶일 가능성이 큽니다. 부모 소득이 반영되거나, 부모 협조 없이 단절을 증명해야 합니다.";
    if (age >= 30) {
      style = "open";
      heading = "개별 가구로 인정될 가능성이 높아집니다.";
      text = "30세가 넘으면 비교적 수월하게 세대를 분리할 수 있다는 지적이 있습니다. 생일 하나가 복지 심사의 문턱을 크게 바꾸는 셈입니다.";
    } else if (gateState.contact === "yes") {
      style = "caution";
      heading = "문은 열릴 수 있지만, 가족에게 다시 연락해야 합니다.";
      text = "소득 산정과 급여 분배를 위해 단절한 원가정의 협조를 구해야 합니다. 지원 접근이 심리적 압박과 위험을 다시 불러올 수 있습니다.";
    } else if (gateState.record === "yes") {
      style = "caution";
      heading = "단절 심사를 요청할 근거가 생겼습니다.";
      text = "공적 기록은 도움이 될 수 있지만 가족관계 해체의 모든 상황을 설명하지 못합니다. 지역과 사업에 따라 추가 자료를 요구할 수도 있습니다.";
    }
    gate.className = `gate-result ${style}`;
    document.getElementById("gateHeading").textContent = heading;
    document.getElementById("gateText").textContent = text;
  };
  ageRange?.addEventListener("input", renderGate);
  document.querySelectorAll(".choice-buttons").forEach((group) => {
    group.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
      gateState[group.dataset.choice] = button.dataset.value;
      group.querySelectorAll("button").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      renderGate();
    }));
  });
  renderGate();

  document.querySelectorAll("#flowSteps button").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll("#flowSteps button").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-expanded", String(active));
    });
  }));

  document.querySelectorAll(".region-options button").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll(".region-options button").forEach((item) => {
      item.classList.remove("is-tested");
      item.querySelector("strong").textContent = "제출하기";
      item.querySelector("small").textContent = "";
    });
    button.classList.add("is-tested");
    button.querySelector("strong").textContent = button.dataset.result;
    button.querySelector("small").textContent = button.dataset.detail;
  }));

  document.querySelectorAll("#policyGrid button").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll("#policyGrid button").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.querySelector("i").textContent = active ? "✓" : "→";
    });
    document.getElementById("policyResultTitle").textContent = button.querySelector("h3").textContent;
    document.getElementById("policyResultText").textContent = button.dataset.impact;
  }));
})();
