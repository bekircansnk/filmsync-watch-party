/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;
(() => {
    if (window.__miguTelepartyVerticalBridgeInstalled) {
        return;
    }
    window.__miguTelepartyVerticalBridgeInstalled = true;
    const REQUEST_TYPE = "MIGU_VERTICAL_BRIDGE_REQUEST";
    const RESPONSE_TYPE = "MIGU_VERTICAL_BRIDGE_RESPONSE";
    const ACTIVE_MARKER = "data-tp-migu-vertical-active";
    function getVerticalUrlKey() {
        const parts = window.location.pathname.split("/").filter(Boolean);
        return parts[parts.length - 1] || "";
    }
    function getCurrentVerticalContent(urlKey) {
        var _a;
        const key = urlKey != null && urlKey !== "" ? String(urlKey) : getVerticalUrlKey();
        const contents = document.querySelectorAll(".vertical-content");
        for (const element of contents) {
            const vnodeKey = (_a = element.__vnode) === null || _a === void 0 ? void 0 : _a.key;
            if (vnodeKey != null && String(vnodeKey) === key) {
                return element;
            }
        }
        return null;
    }
    function getActiveVideo() {
        const content = getCurrentVerticalContent();
        return content ? content.querySelector("video") : null;
    }
    function syncActiveVerticalContent(urlKey) {
        document.querySelectorAll(`[${ACTIVE_MARKER}]`).forEach((element) => {
            element.removeAttribute(ACTIVE_MARKER);
        });
        const content = getCurrentVerticalContent(urlKey);
        if (!content) {
            return { hasContent: false, hasVideo: false };
        }
        content.setAttribute(ACTIVE_MARKER, "1");
        return { hasContent: true, hasVideo: !!content.querySelector("video") };
    }
    window.addEventListener("message", (event) => {
        if (event.source !== window) {
            return;
        }
        const data = event.data;
        if (!data || data.type !== REQUEST_TYPE) {
            return;
        }
        const { id, command, urlKey } = data;
        try {
            let result;
            switch (command) {
                case "syncActiveVerticalContent":
                    result = syncActiveVerticalContent(urlKey);
                    break;
                case "getActiveVideoPresent":
                    result = { hasVideo: !!getActiveVideo() };
                    break;
                default:
                    throw new Error(`Unknown command: ${command}`);
            }
            window.postMessage({
                type: RESPONSE_TYPE,
                id,
                ok: true,
                result,
            }, "*");
        }
        catch (error) {
            window.postMessage({
                type: RESPONSE_TYPE,
                id,
                ok: false,
                error: (error === null || error === void 0 ? void 0 : error.message) || String(error),
            }, "*");
        }
    });
})();

/******/ })()
;