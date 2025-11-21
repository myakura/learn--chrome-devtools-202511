const usersBtnDefault = document.getElementById("fetch-users-default");
const usersBtnBulk = document.getElementById("fetch-users-bulk");
const usersList = document.getElementById("users-list");
const usersStatus = document.getElementById("users-status");
const errorBox = document.getElementById("error-box");
const triggerCors = document.getElementById("trigger-cors");
const postForm = document.getElementById("post-form");
const postLog = document.getElementById("post-log");
const runSlowBtn = document.getElementById("run-slow");
const slowStatus = document.getElementById("slow-status");

// Utility to update status text safely
function setStatus(el, message) {
  if (!el) return;
  el.textContent = message;
}

function setErrorState(el, isError) {
  if (!el) return;
  el.classList.toggle("error", !!isError);
}

function renderUsers(users) {
  if (!usersList) return;
  usersList.innerHTML = users
    .map(
      (u) => `
      <div class="user-card">
        <h3>${u.name}</h3>
        <p>Email: ${u.email}</p>
        <p>Company: ${u.company}</p>
      </div>
    `
    )
    .join("");
}

if (usersBtnDefault && usersList && usersStatus) {
  usersBtnDefault.addEventListener("click", async () => {
    usersList.innerHTML = "";
    setStatus(usersStatus, "Loading... (デフォルト5件)");
    try {
      const res = await fetch("/.netlify/functions/api?type=users");
      const data = await res.json();
      setStatus(usersStatus, `取得成功 (${data.length} 件)`);
      renderUsers(data);
    } catch (err) {
      console.error(err);
      setStatus(usersStatus, "取得に失敗しました");
    }
  });
}

if (usersBtnBulk && usersList && usersStatus) {
  usersBtnBulk.addEventListener("click", async () => {
    usersList.innerHTML = "";
    setStatus(usersStatus, "4リクエスト実行中... (ウォーターフォールを確認)");
    try {
      const pages = [1, 2, 3, 4];
      const aggregated = [];

      for (const page of pages) {
        setStatus(usersStatus, `Fetching page ${page}/4 (per_page=10)`);
        const res = await fetch(`/.netlify/functions/api?type=users&per_page=10&page=${page}`);
        const data = await res.json();
        aggregated.push(...data);
      }

      setStatus(usersStatus, `取得成功 (${aggregated.length} 件, 4 リクエスト)`);
      renderUsers(aggregated);
    } catch (err) {
      console.error(err);
      setStatus(usersStatus, "取得に失敗しました");
    }
  });
}

// CORS error demo
if (triggerCors && errorBox) {
  triggerCors.addEventListener("click", async () => {
    setErrorState(errorBox, false);
    setStatus(errorBox, "外部サイトへリクエスト中...");
    try {
      const res = await fetch("https://thriving-malabi-b8f415.netlify.app/.netlify/functions/hello", {
        mode: "cors",
      });
      const data = await res.json();
      const msg = data?.message ? `成功: ${data.message}` : "成功しました (message なし)";
      setErrorState(errorBox, false);
      setStatus(errorBox, msg);
    } catch (err) {
      console.warn("CORS expected error", err);
      setErrorState(errorBox, true);
      setStatus(errorBox, "CORSエラーが発生しました（Network/Issuesパネルを確認してください）");
    }
  });
}

if (postForm && postLog) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(postForm);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
    };

    setStatus(postLog, "送信中...");
    try {
      const res = await fetch("/.netlify/functions/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setStatus(
        postLog,
        JSON.stringify(
          {
            status: res.status,
            message: data.message,
            receivedData: data.receivedData,
          },
          null,
          2
        )
      );
    } catch (err) {
      console.error(err);
      setStatus(postLog, "送信に失敗しました");
    }
  });
}

// Server-Timing slow demo
if (runSlowBtn && slowStatus) {
  runSlowBtn.addEventListener("click", async () => {
    const start = performance.now();
    setStatus(slowStatus, "複雑な処理を実行中... (Timing タブで観察)");
    try {
      const res = await fetch("/.netlify/functions/api?type=slow");
      const data = await res.json();
      const elapsed = Math.round(performance.now() - start);
      setStatus(
        slowStatus,
        `${data.message} | 実測: ${elapsed}ms | DevTools の Network > Timing を開いて dur を確認`
      );
    } catch (err) {
      console.error(err);
      setStatus(slowStatus, "リクエストに失敗しました");
    }
  });
}
