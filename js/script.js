      // ── State ──────────────────────────────────────────
      const STORAGE_KEY = "taskflow_tasks";
      let tasks = [];
      let filter = "all";

      function load() {
        try {
          tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
          tasks = [];
        }
      }

      function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      }

      // ── Render ────────────────────────────────────────
      function render() {
        const list = document.getElementById("task-list");
        const visible = tasks.filter((t) =>
          filter === "all" ? true : filter === "active" ? !t.done : t.done,
        );

        if (visible.length === 0) {
          list.innerHTML = `
          <li class="empty-state">
            <span>${filter === "done" ? "🎉" : "📋"}</span>
            ${filter === "done" ? "No completed tasks yet." : "Nothing here — add a task above!"}
          </li>`;
        } else {
          list.innerHTML = visible
            .map(
              (t) => `
          <li class="task-item ${t.done ? "done" : ""}" data-id="${t.id}">
            <input type="checkbox" class="task-check" ${t.done ? "checked" : ""} aria-label="Mark complete" />
            <span class="task-label">${escapeHtml(t.text)}</span>
            <button class="btn-delete" title="Delete task">✕</button>
          </li>`,
            )
            .join("");
        }

        // Stats
        const remaining = tasks.filter((t) => !t.done).length;
        document.getElementById("count-label").textContent =
          `${remaining} task${remaining !== 1 ? "s" : ""} remaining`;
      }

      function escapeHtml(str) {
        return str
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }

      // ── Actions ───────────────────────────────────────
      function addTask(text) {
        text = text.trim();
        if (!text) return;
        tasks.unshift({ id: Date.now(), text, done: false });
        save();
        render();
      }

      function toggleTask(id) {
        const t = tasks.find((t) => t.id === id);
        if (t) {
          t.done = !t.done;
          save();
          render();
        }
      }

      function deleteTask(id) {
        const li = document.querySelector(`[data-id="${id}"]`);
        if (li) {
          li.classList.add("removing");
          li.addEventListener(
            "transitionend",
            () => {
              tasks = tasks.filter((t) => t.id !== id);
              save();
              render();
            },
            { once: true },
          );
        }
      }

      function clearCompleted() {
        tasks = tasks.filter((t) => !t.done);
        save();
        render();
      }

      // ── Events ────────────────────────────────────────
      document.getElementById("add-btn").addEventListener("click", () => {
        const inp = document.getElementById("task-input");
        addTask(inp.value);
        inp.value = "";
        inp.focus();
      });

      document.getElementById("task-input").addEventListener("keydown", (e) => {
        if (e.key === "Enter") document.getElementById("add-btn").click();
      });

      document.getElementById("task-list").addEventListener("click", (e) => {
        const li = e.target.closest(".task-item");
        if (!li) return;
        const id = Number(li.dataset.id);
        if (e.target.classList.contains("task-check")) toggleTask(id);
        if (e.target.classList.contains("btn-delete")) deleteTask(id);
      });

      document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          document
            .querySelectorAll(".filter-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          filter = btn.dataset.filter;
          render();
        });
      });

      document
        .getElementById("clear-btn")
        .addEventListener("click", clearCompleted);

      // ── Init ──────────────────────────────────────────
      load();
      render();