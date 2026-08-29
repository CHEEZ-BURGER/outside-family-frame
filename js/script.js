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

  const resourceRange = document.getElementById("resourceRange");
  const resourceValue = document.getElementById("resourceValue");
  const remainingValue = document.getElementById("remainingValue");
  const tokenTrack = document.getElementById("tokenTrack");
  const gameResultText = document.querySelector("#gameResult p");
  const needButtons = [...document.querySelectorAll("#needGrid button")];
  let selectedNeeds = new Set();
  for (let index = 0; index < 12; index += 1) tokenTrack.append(document.createElement("span"));

  const resourceSummary = (remaining) => {
    const picked = selectedNeeds.size;
    if (!picked) return "필요한 조건을 하나씩 선택해 보세요.";
    if (remaining === 0) return "남은 자원이 없습니다. 예상하지 못한 지출이 생기면 바로 위기입니다.";
    if (remaining <= 2) return "간신히 선택했지만 여유가 거의 없습니다. 하나의 변수로 생존 조건이 무너집니다.";
    return "선택한 필요를 해결하고도 조금 남았습니다. 시작 자원의 차이가 안전의 차이가 됩니다.";
  };
  const renderResources = (notice = "") => {
    const start = Number(resourceRange.value);
    const spent = needButtons.reduce((sum, button) => selectedNeeds.has(button.dataset.need) ? sum + Number(button.dataset.cost) : sum, 0);
    const remaining = start - spent;
    resourceValue.textContent = `${start}칸`;
    remainingValue.textContent = `${remaining}칸`;
    gameResultText.textContent = notice || resourceSummary(remaining);
    [...tokenTrack.children].forEach((token, index) => {
      token.classList.toggle("is-filled", index < start);
      token.classList.toggle("is-spent", index < spent);
    });
    needButtons.forEach((button) => {
      const active = selectedNeeds.has(button.dataset.need);
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };
  resourceRange?.addEventListener("input", () => { selectedNeeds = new Set(); renderResources("시작 자원이 달라졌습니다. 필요한 조건을 다시 선택해 보세요."); });
  needButtons.forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.need;
    if (selectedNeeds.has(key)) {
      selectedNeeds.delete(key);
      renderResources();
      return;
    }
    const start = Number(resourceRange.value);
    const spent = needButtons.reduce((sum, item) => selectedNeeds.has(item.dataset.need) ? sum + Number(item.dataset.cost) : sum, 0);
    const cost = Number(button.dataset.cost);
    if (spent + cost > start) {
      renderResources(`‘${button.querySelector("span").textContent}’까지 선택하려면 ${spent + cost - start}칸이 더 필요합니다.`);
      return;
    }
    selectedNeeds.add(key);
    renderResources();
  }));
  document.getElementById("gameReset")?.addEventListener("click", () => { selectedNeeds = new Set(); renderResources(); });
  renderResources();

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
