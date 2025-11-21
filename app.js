const usersBtn = document.getElementById("fetch-users");
const usersList = document.getElementById("users-list");
const usersStatus = document.getElementById("users-status");
const errorBox = document.getElementById("error-box");
const trigger500 = document.getElementById("trigger-500");
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

if (usersBtn && usersList && usersStatus) {
  usersBtn.addEventListener("click", async () => {
    usersList.innerHTML = "";
    setStatus(usersStatus, "Loading...");
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

// 500 error demo
if (trigger500 && errorBox) {
  trigger500.addEventListener("click", async () => {
    setErrorState(errorBox, false);
    setStatus(errorBox, "リクエスト送信中...");
    try {
      const res = await fetch("/.netlify/functions/api?type=error");
      const body = await res.json().catch(() => ({}));
      setErrorState(errorBox, true);
      setStatus(errorBox, `サーバーエラーが発生しました (500) - ${body.error || "Error"}`);
    } catch (err) {
      console.error(err);
      setErrorState(errorBox, true);
      setStatus(errorBox, "リクエストに失敗しました");
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
