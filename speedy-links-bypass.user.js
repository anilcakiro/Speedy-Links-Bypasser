// ==UserScript==
// @name         Speedy-Links Full Bypass
// @namespace    Violentmonkey Scripts
// @version      1.0

// @description  Speedy-Links Bypasser
// @author       https://github.com/anilcakiro

// @match        https://speedy-links.com/*
// @grant        none
// @run-at       document-start
// @license      MIT
// ==/UserScript==

const originalFetch = window.fetch;

window.fetch = async function (resource, init) {
    if (init && init.body) {
        try {
            if (typeof init.body === "string") {
                let data = JSON.parse(init.body);
                if (data["botd"]) {
                    data["max_tasks"] = 1;
                    data["num_of_tasks"] = 1;
                }
                init.body = JSON.stringify(data);
            }
        } catch (e) {}
    }

    const response = await originalFetch.apply(this, arguments);
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
        const clone = response.clone();
        try {
            let resData = await clone.json();

            if (Array.isArray(resData) && resData.length > 0 && resData[0].task_id) {
                const masterTask = resData[1] || resData[0];
                const modifiedData = resData.map(() => ({ ...masterTask }));

                setTimeout(() => {
                    const taskItem = document.querySelectorAll(".d30-task-list div")[0];
                    if (taskItem) taskItem.remove();
                }, 1000);

                return new Response(JSON.stringify(modifiedData), {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                });
            }
        } catch (e) {}
    }
    return response;
};

setInterval(() => {
    const btn = document.querySelector("#d30unlockBtn") || document.querySelector("button.d30-unlock-btn");

    if (btn && btn.classList.contains("enabled")) {
        btn.click();
        ["mousedown", "mouseup", "click"].forEach((eventType) => {
            btn.dispatchEvent(
                new MouseEvent(eventType, {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    buttons: 1,
                }),
            );
        });
    }
}, 500);
