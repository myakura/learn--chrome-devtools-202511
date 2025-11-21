const usersBtn = document.getElementById("fetch-users");
const usersList = document.getElementById("users-list");
const usersStatus = document.getElementById("users-status");
const errorBox = document.getElementById("error-box");
const trigger500 = document.getElementById("trigger-500");
const triggerCors = document.getElementById("trigger-cors");
const postForm = document.getElementById("post-form");
const postLog = document.getElementById("post-log");

// Utility to update status text safely
function setStatus(el, message) {
  el.textContent = message;
}

function renderUsers(users) {
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
    setStatus(errorBox, "リクエスト送信中...");
    try {
      const res = await fetch("/.netlify/functions/api?type=error");
      const body = await res.json().catch(() => ({}));
      setStatus(errorBox, `サーバーエラーが発生しました (500) - ${body.error || "Error"}`);
    } catch (err) {
      console.error(err);
      setStatus(errorBox, "リクエストに失敗しました");
    }
  });
}

// CORS error demo
if (triggerCors && errorBox) {
  triggerCors.addEventListener("click", async () => {
    setStatus(errorBox, "外部サイトへリクエスト中...");
    try {
      await fetch("https://example.com/not-allowed", { mode: "cors" });
      setStatus(errorBox, "CORS エラーを再現できませんでした");
    } catch (err) {
      console.warn("CORS expected error", err);
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
