/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/Teleparty/Constants/env.ts
var _a, _b, _c, _d, _e, _f;
// NOTE: Changing the .env file seems to require re-running build-dev-watch
// if you are using that for development.
const PROD_DEFAULTS = {
    API_URL: "https://api.teleparty.com",
    WEBSOCKETS_URL: "wss://ws.teleparty.com",
    REDIRECT_URL: "https://www.teleparty.com",
    // This is a public key, so it's okay to hardcode it here
    POSTHOG_API_KEY: "phc_8h1T6DYsM416utBY2HpUYkyyBKyVErAyoNpFbtp2D9b",
    POSTHOG_API_HOST: "https://us.i.posthog.com",
    IMAGE_CDN_URL: "https://files.teleparty.com",
};
const API_URL =  true ? PROD_DEFAULTS.API_URL : (0);
const WEBSOCKETS_URL =  true
    ? PROD_DEFAULTS.WEBSOCKETS_URL
    : (0);
const REDIRECT_URL =  true
    ? PROD_DEFAULTS.REDIRECT_URL
    : (0);
const PROD_FIREBASE_CONFIG = {
    apiKey: "AIzaSyDvZJAoFJkT2lBrhloA0e9XwKmLgELTAeQ",
    authDomain: "teleparty-mobile.firebaseapp.com",
    projectId: "teleparty-mobile",
    storageBucket: "teleparty-mobile.appspot.com",
    messagingSenderId: "961974665980",
    appId: "1:961974665980:web:fe4179db8591331aeb8d79",
    measurementId: "G-PC36DK40FL",
};
const DEV_FIREBASE_CONFIG = {
    apiKey: "AIzaSyDmxz7HsfNuhW52Mti-Q9lAGHJYOzEijb8",
    authDomain: "teleparty-auth---test.firebaseapp.com",
    projectId: "teleparty-auth---test",
    storageBucket: "teleparty-auth---test.appspot.com",
    messagingSenderId: "391169153212",
    appId: "1:391169153212:web:0eae4ff68890df614b18b9",
    measurementId: "G-MFZH5P1Z4E",
};
const FIREBASE_CONFIG =  true ? PROD_FIREBASE_CONFIG : 0;
// PostHog Configuration
const POSTHOG_API_KEY =  true
    ? PROD_DEFAULTS.POSTHOG_API_KEY
    : (0);
const POSTHOG_API_HOST =  true
    ? PROD_DEFAULTS.POSTHOG_API_HOST
    : (0);
const IGNORE_UNDER_MAINTENANCE =  true ? false : 0;
const IMAGE_CDN_URL =  true
    ? PROD_DEFAULTS.IMAGE_CDN_URL
    : (0);
const BACKEND_SELECTOR_AWS_CDN = "MISSING_ENV_VAR".BACKEND_SELECTOR_AWS_CDN || "https://d1491j4uhxdasz.cloudfront.net";

;// ./src/Teleparty/Managers/Announcements.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


const ANNOUNCEMENTS_CACHE_KEY = "announcements_cache_v1";
const CACHE_TTL_MS = 10 * 60 * 1000;
function announcementApplicable(announcement, serviceName) {
    var _a;
    return (announcement &&
        typeof announcement.deviceTypes === "object" &&
        ((_a = announcement.deviceTypes) === null || _a === void 0 ? void 0 : _a.includes("chrome".toUpperCase())) &&
        (announcement.service === "all" || announcement.service === serviceName || !serviceName) &&
        compareExtensionVersion(announcement.extensionVersionIntroduced) >= 0 &&
        (announcement.extensionVersionResolved === "unresolved" ||
            compareExtensionVersion(announcement.extensionVersionResolved) <= 0) &&
        (announcement.expirationDate === -1 || Date.now() / 1000 < announcement.expirationDate));
}
const getCache = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { [ANNOUNCEMENTS_CACHE_KEY]: cache } = (yield chrome.storage.local.get(ANNOUNCEMENTS_CACHE_KEY));
        if (!((_a = cache === null || cache === void 0 ? void 0 : cache.announcements) === null || _a === void 0 ? void 0 : _a.length))
            return null;
        if (Date.now() - cache.fetchedAtMs > CACHE_TTL_MS)
            return null;
        return cache.announcements;
    }
    catch (_b) {
        return null;
    }
});
const setCache = (announcements) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = { announcements, fetchedAtMs: Date.now() };
        yield chrome.storage.local.set({ [ANNOUNCEMENTS_CACHE_KEY]: payload });
    }
    catch (_c) {
        // ignore cache write failures
    }
});
function fetchAnnouncements() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const cached = yield getCache();
        if (cached)
            return cached;
        const resp = yield fetch(`${API_URL}/announcements`);
        const data = yield resp.json();
        const announcements = (_a = data["announcements"]) !== null && _a !== void 0 ? _a : [];
        void setCache(announcements);
        return announcements;
    });
}

;// ./src/Teleparty/Utils/NativePartyPageState.ts
const IN_PARTY_ATTR = "data-tp-in-party";
/** Shared DOM flag readable from both content scripts and page-injected browse scripts. */
function setPageInParty(inParty) {
    if (inParty) {
        document.documentElement.setAttribute(IN_PARTY_ATTR, "true");
    }
    else {
        document.documentElement.removeAttribute(IN_PARTY_ATTR);
    }
}
function isPageInParty() {
    return document.documentElement.getAttribute(IN_PARTY_ATTR) === "true";
}
const NATIVE_PARTY_BUTTON_SELECTOR = "#native-party-button, [id^='native-party-button'], .native-party-button, #native-party-button-homepage, [data-tp-native-party='1']";

;// ./src/Teleparty/BrowseScripts/NativePartyHandler.ts
var NativePartyHandler_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



function getTelepartyConfig() {
    try {
        const stored = sessionStorage.getItem("telepartyPremiumConfig");
        if (stored) {
            const config = JSON.parse(stored);
            return config;
        }
    }
    catch (e) {
        // console.error("Error parsing sessionStorage config:", e)
    }
    return null;
}
function defaultCleanupNativePartyButtons() {
    document.querySelectorAll(NATIVE_PARTY_BUTTON_SELECTOR).forEach((button) => {
        button.remove();
    });
}
function hasNativePartyButtons() {
    return document.querySelector(NATIVE_PARTY_BUTTON_SELECTOR) !== null;
}
const nativePartyPlayHandlers = new WeakMap();
let nativePartyClickDelegationInstalled = false;
function handleNativePartyButtonClick(button, play, e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Native party button clicked");
    const config = getTelepartyConfig();
    if ((config === null || config === void 0 ? void 0 : config.serviceIsPremium) && !(config === null || config === void 0 ? void 0 : config.userHasPremium)) {
        console.log("Redirecting non-premium user on premium service to premium page");
        window.open("https://teleparty.com/premium?ref=start-" + config.serviceName, "_blank");
        return;
    }
    localStorage.setItem("nativeParty", JSON.stringify({
        shouldStart: true,
        expiry: Date.now() + 1000 * 60 * 2,
        randomId: Math.random().toString(),
    }));
    play(e);
}
function ensureNativePartyClickDelegation() {
    if (nativePartyClickDelegationInstalled) {
        return;
    }
    nativePartyClickDelegationInstalled = true;
    // Fallback for SPAs (e.g. Migu) that replace injected buttons between bind cycles.
    document.addEventListener("click", (e) => {
        const target = e.target;
        if (!(target instanceof Element)) {
            return;
        }
        const button = target.closest(NATIVE_PARTY_BUTTON_SELECTOR);
        if (!(button instanceof HTMLElement)) {
            return;
        }
        const binding = button;
        if (binding._telepartyHandlerBound) {
            return;
        }
        const play = nativePartyPlayHandlers.get(button);
        if (!play) {
            return;
        }
        handleNativePartyButtonClick(button, play, e);
    }, true);
}
function bindNativePartyButtonHandlers(buttons) {
    if (!buttons) {
        return;
    }
    ensureNativePartyClickDelegation();
    for (const { button, play } of buttons) {
        const buttonElement = button;
        nativePartyPlayHandlers.set(button, play);
        if (buttonElement._telepartyHandler) {
            button.removeEventListener("click", buttonElement._telepartyHandler, true);
        }
        const clickHandler = (e) => {
            var _a;
            const playFn = (_a = nativePartyPlayHandlers.get(button)) !== null && _a !== void 0 ? _a : play;
            handleNativePartyButtonClick(button, playFn, e);
        };
        buttonElement._telepartyHandler = clickHandler;
        buttonElement._telepartyHandlerBound = true;
        button.addEventListener("click", clickHandler, true);
    }
}
function addNativePartyHandler(tryAddButton, service, options = {}) {
    var _a;
    return NativePartyHandler_awaiter(this, void 0, void 0, function* () {
        const cleanupNativePartyButtons = (_a = options.cleanupNativePartyButtons) !== null && _a !== void 0 ? _a : defaultCleanupNativePartyButtons;
        let unavailable = [];
        try {
            const announcements = yield fetchAnnouncements();
            unavailable = announcements
                .filter((a) => a.enforcement === "DISABLE_SERVICE")
                .map((a) => a.service)
                .filter(Boolean);
        }
        catch (e) {
            console.error(e);
        }
        // Immediately bail out if this service is under maintenance
        if (unavailable.includes(service) && !IGNORE_UNDER_MAINTENANCE) {
            console.log(`Service under maintenance: ${service}`);
            return;
        }
        let inPartyCached = isPageInParty();
        bindNativePartyButtonHandlers(tryAddButton());
        setInterval(() => {
            try {
                const inParty = isPageInParty();
                if (inParty) {
                    if (!inPartyCached || hasNativePartyButtons()) {
                        cleanupNativePartyButtons();
                    }
                    inPartyCached = true;
                    return;
                }
                inPartyCached = false;
                bindNativePartyButtonHandlers(tryAddButton());
            }
            catch (error) {
                // console.error("Error in addNativePartyHandler:", error)
            }
        }, 500);
    });
}

;// ./src/Teleparty/Enums/InternalStreamingServiceName.ts
var InternalStreamingServiceName;
(function (InternalStreamingServiceName) {
    InternalStreamingServiceName["NETFLIX"] = "netflix";
    InternalStreamingServiceName["HULU"] = "hulu";
    InternalStreamingServiceName["DISNEY_PLUS"] = "disney";
    InternalStreamingServiceName["STAR_PLUS"] = "starplus";
    InternalStreamingServiceName["AMAZON"] = "amazon";
    InternalStreamingServiceName["YOUTUBE"] = "youtube";
    InternalStreamingServiceName["HBO_MAX"] = "hbomax";
    InternalStreamingServiceName["MAX"] = "max";
    InternalStreamingServiceName["FUBO"] = "fubo";
    InternalStreamingServiceName["CRUNCHYROLL"] = "crunchyroll";
    InternalStreamingServiceName["PARAMOUNT"] = "paramount";
    InternalStreamingServiceName["PEACOCK"] = "peacock";
    InternalStreamingServiceName["HOTSTAR"] = "hotstar";
    InternalStreamingServiceName["DISNEY_PLUS_MENA"] = "disneymena";
    InternalStreamingServiceName["APPLE_TV"] = "appletv";
    InternalStreamingServiceName["PLUTO_TV"] = "plutotv";
    InternalStreamingServiceName["FUNIMATION"] = "funimation";
    InternalStreamingServiceName["TUBI_TV"] = "tubitv";
    InternalStreamingServiceName["JIO_CINEMA"] = "jiocinema";
    InternalStreamingServiceName["MUBI"] = "mubi";
    InternalStreamingServiceName["CRAVE"] = "crave";
    InternalStreamingServiceName["STAN"] = "stan";
    InternalStreamingServiceName["SONY_LIV"] = "sonyliv";
    InternalStreamingServiceName["ZEE5"] = "zee5";
    InternalStreamingServiceName["HULU_JP"] = "hulujp";
    InternalStreamingServiceName["UNEXT"] = "unext";
    InternalStreamingServiceName["GLOBOPLAY"] = "globoplay";
    InternalStreamingServiceName["WILLOW"] = "willow";
    InternalStreamingServiceName["FANCODE"] = "fancode";
    InternalStreamingServiceName["CANALPLUS"] = "canalplus";
    InternalStreamingServiceName["SHAHID"] = "shahid";
    InternalStreamingServiceName["RTL"] = "rtl";
    InternalStreamingServiceName["ESPN"] = "espn";
    InternalStreamingServiceName["SLING"] = "sling";
    InternalStreamingServiceName["VIKI"] = "viki";
    InternalStreamingServiceName["SPOTIFY"] = "spotify";
    InternalStreamingServiceName["SHOWTIME"] = "showtime";
    InternalStreamingServiceName["SHUDDER"] = "shudder";
    InternalStreamingServiceName["AMC_PLUS"] = "amcplus";
    InternalStreamingServiceName["VIU"] = "viu";
    InternalStreamingServiceName["VIDIO"] = "vidio";
    InternalStreamingServiceName["FOX_ONE"] = "foxone";
    InternalStreamingServiceName["LEAGUE_PASS"] = "leaguepass";
    InternalStreamingServiceName["DAZN"] = "dazn";
    InternalStreamingServiceName["VIX"] = "vix";
    InternalStreamingServiceName["MIGU"] = "migu";
})(InternalStreamingServiceName || (InternalStreamingServiceName = {}));

;// ./src/Teleparty/BrowseScripts/Migu/migu_browse_injected.js


const VERTICAL_PATH = "/p/vertical/";
const HOME_PATH = "/p/home/";
const DETAIL_PATH = "/p/detail/";
const NATIVE_PARTY_BUTTON_CLASS = "native-party-button";
const NATIVE_PARTY_BUTTON_VERTICAL_CLASS = "native-party-button-vertical";
const NATIVE_PARTY_BUTTON_HOME_CLASS = "native-party-button-home";
const NATIVE_PARTY_BUTTON_DETAIL_CLASS = "native-party-button-detail";
const HOME_ACTIONS_WRAPPER_CLASS = "tp-home-button-stack";
const HOME_STYLES_ID = "tp-migu-home-styles";
const DETAIL_STYLES_ID = "tp-migu-detail-styles";
const NATIVE_PARTY_BUTTON_HOME_ID = "native-party-button-home";
const NATIVE_PARTY_BUTTON_DETAIL_ID = "native-party-button-detail";
const TP_GRADIENT = "linear-gradient(273.58deg, #9E55A0 0%, #EF3E3A 100%)";
const NATIVE_PARTY_BUTTON_LABEL = "开始 Teleparty";
const migu_browse_injected_IN_PARTY_ATTR = "data-tp-in-party";
function migu_browse_injected_isPageInParty() {
    return document.documentElement.getAttribute(migu_browse_injected_IN_PARTY_ATTR) === "true";
}
function bindNativePartyButtonsIfNeeded() {
    if (migu_browse_injected_isPageInParty()) {
        removeAllNativePartyButtons();
        return;
    }
    bindNativePartyButtonHandlers(addNativePartyButton());
}
function isVerticalPage() {
    return window.location.pathname.includes(VERTICAL_PATH);
}
function isHomePage() {
    return window.location.pathname.includes(HOME_PATH);
}
function isSportsHomePage() {
    const { hostname, pathname } = window.location;
    return hostname === "www.miguvideo.com" && (pathname === "/" || pathname === "");
}
function isHomeLikePage() {
    return isHomePage() || isSportsHomePage();
}
function isDetailPage() {
    return window.location.pathname.includes(DETAIL_PATH);
}
function isSupportedMiguPage() {
    return isVerticalPage() || isHomeLikePage() || isDetailPage();
}
function getSharedButtonTextHtml() {
    return `<span style="font-size: 13px; line-height: 18px; white-space: nowrap;">${NATIVE_PARTY_BUTTON_LABEL}</span>`;
}
function ensureHomeStylesInjected() {
    if (document.getElementById(HOME_STYLES_ID)) {
        return;
    }
    const style = document.createElement("style");
    style.id = HOME_STYLES_ID;
    style.textContent = `
        .button-mask .${HOME_ACTIONS_WRAPPER_CLASS} {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 12px;
            z-index: 101;
            pointer-events: auto;
            width: auto;
        }

        .button-mask .${HOME_ACTIONS_WRAPPER_CLASS} .go-detail-btn {
            position: static !important;
            left: auto !important;
            top: auto !important;
            transform: none !important;
            width: auto !important;
            flex: 0 0 auto;
            margin: 0 !important;
            box-sizing: border-box;
        }

        .button-mask .${HOME_ACTIONS_WRAPPER_CLASS} .${NATIVE_PARTY_BUTTON_HOME_CLASS} {
            background: ${TP_GRADIENT} !important;
            border: none !important;
            color: #fff !important;
            width: auto !important;
            flex: 0 0 auto;
        }

        .button-mask .${HOME_ACTIONS_WRAPPER_CLASS} .${NATIVE_PARTY_BUTTON_HOME_CLASS}:hover {
            background: ${TP_GRADIENT} !important;
            border: none !important;
            color: #fff !important;
            filter: brightness(1.06);
            cursor: pointer !important;
        }
    `;
    document.head.appendChild(style);
}
function ensureDetailStylesInjected() {
    if (document.getElementById(DETAIL_STYLES_ID)) {
        return;
    }
    const style = document.createElement("style");
    style.id = DETAIL_STYLES_ID;
    style.textContent = `
        .module_share .${NATIVE_PARTY_BUTTON_DETAIL_CLASS} {
            display: inline-block;
            vertical-align: middle;
            margin-left: 20px;
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            background: ${TP_GRADIENT};
            color: #fff;
            font-size: 12px;
            line-height: 16px;
            font-weight: 500;
            font-family: inherit;
            cursor: pointer;
            white-space: nowrap;
            box-shadow: none;
            outline: none;
            appearance: none;
            -webkit-appearance: none;
        }

        .module_share .${NATIVE_PARTY_BUTTON_DETAIL_CLASS}:hover {
            filter: brightness(1.06);
        }
    `;
    document.head.appendChild(style);
}
function applyVerticalButtonStyle(button) {
    button.setAttribute("class", `${NATIVE_PARTY_BUTTON_CLASS} ${NATIVE_PARTY_BUTTON_VERTICAL_CLASS}`);
    button.setAttribute("type", "button");
    button.setAttribute("data-tp-native-party", "1");
    button.setAttribute("style", [
        "display: inline-flex",
        "align-items: center",
        "justify-content: center",
        "gap: 6px",
        "padding: 6px 10px",
        "border-radius: 6px",
        "border: none",
        `background: ${TP_GRADIENT}`,
        "color: #fff",
        "font-size: 13px",
        "line-height: 18px",
        "font-weight: 500",
        "font-family: inherit",
        "cursor: pointer",
        "margin-top: 6px",
        "width: max-content",
        "max-width: 100%",
        "align-self: flex-start",
        "white-space: nowrap",
        "box-shadow: none",
        "outline: none",
        "appearance: none",
        "-webkit-appearance: none",
    ].join("; "));
    button.innerHTML = getSharedButtonTextHtml();
}
function copyElementAttrs(button, sourceElement) {
    for (const { name, value } of sourceElement.attributes) {
        if (name === "id" || name === "class" || name === "style") {
            continue;
        }
        button.setAttribute(name, value);
    }
}
function copyWatchButtonAttrs(button, watchButton) {
    copyElementAttrs(button, watchButton);
}
function mirrorWatchButtonLayout(button, watchButton) {
    if (!watchButton.isConnected) {
        return;
    }
    const computed = window.getComputedStyle(watchButton);
    button.style.width = "auto";
    button.style.height = computed.height;
    button.style.minHeight = computed.height;
    button.style.minWidth = "auto";
    button.style.fontSize = computed.fontSize;
    button.style.lineHeight = computed.lineHeight;
    button.style.fontWeight = computed.fontWeight;
    button.style.fontFamily = computed.fontFamily;
    button.style.borderRadius = computed.borderRadius;
    button.style.border = "none";
    button.style.padding = computed.padding;
    button.style.boxSizing = computed.boxSizing;
    button.style.letterSpacing = computed.letterSpacing;
    button.style.flexShrink = "0";
    button.style.whiteSpace = "nowrap";
}
function getHomeButtonLabelHtml(watchButton) {
    if (watchButton.querySelector("font")) {
        return `<font dir="auto" style="vertical-align: inherit;"><font dir="auto" style="vertical-align: inherit;">${NATIVE_PARTY_BUTTON_LABEL}</font></font>`;
    }
    return getSharedButtonTextHtml();
}
function getMiguPlayer() {
    return document.querySelector("#mod-player");
}
function getMiguVideo(player = getMiguPlayer()) {
    var _a;
    return ((_a = player === null || player === void 0 ? void 0 : player.querySelector("video.m-player, #m-player")) !== null && _a !== void 0 ? _a : document.querySelector("video.m-player, #m-player"));
}
function getMiguPlayButton(player = getMiguPlayer()) {
    if (!player) {
        return null;
    }
    return player.querySelector(".control-wrapper .play-btn, .mini-control .play-btn, .left-control .play-btn, .play-btn");
}
function isMiguVideoPlaying() {
    const video = getMiguVideo();
    return Boolean(video && !video.paused && video.readyState >= 2);
}
function triggerMiguPlayback(preferredPlayButton) {
    if (isMiguVideoPlaying()) {
        return;
    }
    const playButton = preferredPlayButton !== null && preferredPlayButton !== void 0 ? preferredPlayButton : getMiguPlayButton();
    if (playButton) {
        playButton.click();
        return;
    }
    const video = getMiguVideo();
    if (video) {
        void video.play().catch(() => undefined);
    }
}
function isMiguSamePageNavigationUrl(urlString) {
    try {
        const url = new URL(urlString, window.location.href);
        if (!url.hostname.includes("miguvideo.")) {
            return false;
        }
        return url.pathname.startsWith("/p/") || url.pathname.startsWith("/mgs/");
    }
    catch (_a) {
        return false;
    }
}
let sportsHomeSamePageNavActive = false;
let sportsHomeSamePageNavTimer = undefined;
const SPORTS_HOME_SAME_PAGE_NAV_WINDOW_MS = 8000;
function enableSportsHomeSamePageNavigationTemporarily() {
    sportsHomeSamePageNavActive = true;
    if (sportsHomeSamePageNavTimer) {
        clearTimeout(sportsHomeSamePageNavTimer);
    }
    sportsHomeSamePageNavTimer = window.setTimeout(() => {
        sportsHomeSamePageNavActive = false;
        sportsHomeSamePageNavTimer = undefined;
    }, SPORTS_HOME_SAME_PAGE_NAV_WINDOW_MS);
}
function disableSportsHomeSamePageNavigation() {
    sportsHomeSamePageNavActive = false;
    if (sportsHomeSamePageNavTimer) {
        clearTimeout(sportsHomeSamePageNavTimer);
        sportsHomeSamePageNavTimer = undefined;
    }
}
function installSportsHomeSamePageNavigation() {
    if (!isSportsHomePage() || window.__tpMiguSportsHomeSamePageNavInstalled) {
        return;
    }
    window.__tpMiguSportsHomeSamePageNavInstalled = true;
    const originalOpen = window.open.bind(window);
    window.open = function (url, target, features) {
        if (isSportsHomePage() &&
            sportsHomeSamePageNavActive &&
            url &&
            isMiguSamePageNavigationUrl(String(url))) {
            if (!target || target === "_blank" || target === "blank") {
                disableSportsHomeSamePageNavigation();
                window.location.assign(String(url));
                return null;
            }
        }
        return originalOpen(url, target, features);
    };
}
function triggerSportsHomeStartPartyNavigation() {
    if (!isSportsHomePage()) {
        return;
    }
    installSportsHomeSamePageNavigation();
    enableSportsHomeSamePageNavigationTemporarily();
    const watchButton = document.querySelector(".go-detail-btn");
    if (watchButton) {
        watchButton.click();
        return;
    }
    disableSportsHomeSamePageNavigation();
    triggerMiguPlayback(getMiguPlayButton());
}
function applyHomeButtonStyle(button, watchButton) {
    const expectedClass = `${NATIVE_PARTY_BUTTON_CLASS} ${NATIVE_PARTY_BUTTON_HOME_CLASS}`;
    if (button.className !== expectedClass) {
        button.setAttribute("class", expectedClass);
    }
    if (button.id !== NATIVE_PARTY_BUTTON_HOME_ID) {
        button.setAttribute("id", NATIVE_PARTY_BUTTON_HOME_ID);
    }
    if (button.getAttribute("type") !== "button") {
        button.setAttribute("type", "button");
    }
    copyWatchButtonAttrs(button, watchButton);
    if (!button.dataset.tpLabelApplied) {
        button.innerHTML = getHomeButtonLabelHtml(watchButton);
        button.dataset.tpLabelApplied = "1";
    }
    mirrorWatchButtonLayout(button, watchButton);
}
function getShareBarAnchor(moduleShare) {
    return (moduleShare.querySelector(".report") ||
        moduleShare.querySelector(".share") ||
        moduleShare.querySelector(".isFaved") ||
        moduleShare.querySelector(".collect") ||
        moduleShare.querySelector(".mobileWatch"));
}
function getDetailActionAnchor(moduleShare) {
    const collectButton = moduleShare.querySelector(".isFaved");
    if (collectButton) {
        return collectButton;
    }
    const actionClasses = new Set(["mobileWatch", "share", "report", "isFaved", "set", "bulletScreenBtn", "times"]);
    let lastAction = null;
    for (const child of moduleShare.children) {
        if (child.tagName !== "DIV") {
            continue;
        }
        if (Array.from(child.classList).some((className) => actionClasses.has(className))) {
            lastAction = child;
        }
    }
    return lastAction;
}
function getDetailPlayButton() {
    return getMiguPlayButton();
}
function applyShareBarButtonStyle(button, anchorButton) {
    button.setAttribute("class", `${NATIVE_PARTY_BUTTON_CLASS} ${NATIVE_PARTY_BUTTON_DETAIL_CLASS}`);
    button.setAttribute("id", NATIVE_PARTY_BUTTON_DETAIL_ID);
    button.setAttribute("type", "button");
    button.setAttribute("data-tp-native-party", "1");
    button.removeAttribute("style");
    if (!button.dataset.tpLabelApplied) {
        button.innerHTML = `<span>${NATIVE_PARTY_BUTTON_LABEL}</span>`;
        button.dataset.tpLabelApplied = "1";
    }
}
function addShareBarNativePartyButton(anchorButton, playHandler) {
    const moduleShare = document.querySelector(".module_share");
    const playButton = getDetailPlayButton();
    const hasPlayer = Boolean(getMiguPlayer());
    if (!moduleShare || !anchorButton || (!playButton && !hasPlayer)) {
        return undefined;
    }
    ensureDetailStylesInjected();
    removeMisplacedNativePartyButtons(moduleShare);
    let nativePartyButton = moduleShare.querySelector(`.${NATIVE_PARTY_BUTTON_CLASS}`);
    if (!nativePartyButton) {
        nativePartyButton = document.createElement("button");
        nativePartyButton.setAttribute("type", "button");
        nativePartyButton.setAttribute("data-tp-native-party", "1");
        anchorButton.insertAdjacentElement("afterend", nativePartyButton);
    }
    else if (nativePartyButton.previousElementSibling !== anchorButton) {
        anchorButton.insertAdjacentElement("afterend", nativePartyButton);
    }
    applyShareBarButtonStyle(nativePartyButton, anchorButton);
    return [
        {
            button: nativePartyButton,
            play: playHandler !== null && playHandler !== void 0 ? playHandler : (() => triggerMiguPlayback(playButton)),
        },
    ];
}
function addDetailNativePartyButton() {
    const moduleShare = document.querySelector(".module_share");
    const anchorButton = moduleShare ? getDetailActionAnchor(moduleShare) : null;
    return addShareBarNativePartyButton(anchorButton);
}
function addHomeShareBarNativePartyButton() {
    const moduleShare = document.querySelector(".module_share");
    const anchorButton = moduleShare ? getShareBarAnchor(moduleShare) : null;
    return addShareBarNativePartyButton(anchorButton);
}
function addSportsHomeShareBarNativePartyButton() {
    const moduleShare = document.querySelector(".module_share");
    const anchorButton = moduleShare ? getShareBarAnchor(moduleShare) : null;
    return addShareBarNativePartyButton(anchorButton, () => triggerSportsHomeStartPartyNavigation());
}
function ensureHomeButtonStack(buttonMask, watchButton) {
    ensureHomeStylesInjected();
    let stack = buttonMask.querySelector(`.${HOME_ACTIONS_WRAPPER_CLASS}`);
    if (!stack) {
        stack = document.createElement("div");
        stack.className = HOME_ACTIONS_WRAPPER_CLASS;
        if (watchButton.parentElement === buttonMask) {
            buttonMask.insertBefore(stack, watchButton);
        }
        else {
            buttonMask.appendChild(stack);
        }
    }
    if (!stack.contains(watchButton)) {
        stack.appendChild(watchButton);
    }
    stack.style.width = "auto";
    return stack;
}
function syncHomeButtonStackLayout(stack, watchButton, nativePartyButton) {
    stack.style.width = "auto";
    mirrorWatchButtonLayout(nativePartyButton, watchButton);
}
function removeAllNativePartyButtons() {
    document.querySelectorAll(`.${NATIVE_PARTY_BUTTON_CLASS}`).forEach((button) => {
        button.remove();
    });
    document.querySelectorAll(`.${HOME_ACTIONS_WRAPPER_CLASS}`).forEach((stack) => {
        const watchButton = stack.querySelector(".go-detail-btn");
        const buttonMask = stack.closest(".button-mask");
        if (watchButton && buttonMask) {
            buttonMask.appendChild(watchButton);
        }
        stack.remove();
    });
}
function removeMisplacedNativePartyButtons(activeContainer) {
    document
        .querySelectorAll(`.${NATIVE_PARTY_BUTTON_CLASS}, .mod-player .${NATIVE_PARTY_BUTTON_CLASS}, .mini-control .${NATIVE_PARTY_BUTTON_CLASS}, .control-wrapper .${NATIVE_PARTY_BUTTON_CLASS}`)
        .forEach((button) => {
        if (!(activeContainer === null || activeContainer === void 0 ? void 0 : activeContainer.contains(button))) {
            button.remove();
        }
    });
}
function getActivePostWrapper() {
    const wrappers = Array.from(document.querySelectorAll(".post-wrapper"));
    if (wrappers.length === 0) {
        return null;
    }
    if (wrappers.length === 1) {
        return wrappers[0];
    }
    const viewportCenter = window.innerHeight / 2;
    let bestWrapper = null;
    let bestDistance = Infinity;
    for (const wrapper of wrappers) {
        const rect = wrapper.getBoundingClientRect();
        if (rect.height === 0) {
            continue;
        }
        const wrapperCenter = rect.top + rect.height / 2;
        const distance = Math.abs(wrapperCenter - viewportCenter);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestWrapper = wrapper;
        }
    }
    return bestWrapper !== null && bestWrapper !== void 0 ? bestWrapper : wrappers[0];
}
function getPlayButtonForPostWrapper(postWrapper) {
    var _a, _b;
    const verticalContent = postWrapper.closest('[class*="vertical-content"]');
    if (verticalContent) {
        const playButton = verticalContent.querySelector(".play-btn, .control-btn .play-btn, .mini-control .play-btn");
        if (playButton) {
            return playButton;
        }
    }
    const slideRoot = (_b = (_a = postWrapper.closest('[class*="vertical-content"]')) !== null && _a !== void 0 ? _a : postWrapper.closest('[class*="vertical-left"]')) !== null && _b !== void 0 ? _b : postWrapper.parentElement;
    return slideRoot === null || slideRoot === void 0 ? void 0 : slideRoot.querySelector("#mod-player .play-btn, .control-wrapper .play-btn, .mini-control .play-btn, .left-control .play-btn");
}
function addVerticalNativePartyButton() {
    const activePostWrapper = getActivePostWrapper();
    if (!activePostWrapper) {
        return undefined;
    }
    removeMisplacedNativePartyButtons(activePostWrapper);
    const postBody = activePostWrapper.querySelector(".post-body");
    if (!postBody) {
        return undefined;
    }
    let nativePartyButton = activePostWrapper.querySelector(`.${NATIVE_PARTY_BUTTON_CLASS}`);
    if (!nativePartyButton) {
        nativePartyButton = document.createElement("button");
        postBody.insertAdjacentElement("afterend", nativePartyButton);
    }
    applyVerticalButtonStyle(nativePartyButton);
    return [
        {
            button: nativePartyButton,
            play: () => {
                triggerMiguPlayback(getPlayButtonForPostWrapper(activePostWrapper));
            },
        },
    ];
}
function addHomeNativePartyButton() {
    const watchButton = document.querySelector(".go-detail-btn");
    const buttonMask = watchButton === null || watchButton === void 0 ? void 0 : watchButton.closest(".button-mask");
    if (!watchButton || !buttonMask) {
        return addHomeShareBarNativePartyButton();
    }
    removeMisplacedNativePartyButtons(buttonMask);
    const stack = ensureHomeButtonStack(buttonMask, watchButton);
    let nativePartyButton = stack.querySelector(`.${NATIVE_PARTY_BUTTON_CLASS}`);
    if (!nativePartyButton) {
        nativePartyButton = document.createElement("button");
        stack.appendChild(nativePartyButton);
    }
    applyHomeButtonStyle(nativePartyButton, watchButton);
    syncHomeButtonStackLayout(stack, watchButton, nativePartyButton);
    return [
        {
            button: nativePartyButton,
            play: () => {
                triggerMiguPlayback(getMiguPlayButton());
            },
        },
    ];
}
function addSportsHomeNativePartyButton() {
    const watchButton = document.querySelector(".go-detail-btn");
    const buttonMask = watchButton === null || watchButton === void 0 ? void 0 : watchButton.closest(".button-mask");
    if (!watchButton || !buttonMask) {
        return addSportsHomeShareBarNativePartyButton();
    }
    removeMisplacedNativePartyButtons(buttonMask);
    const stack = ensureHomeButtonStack(buttonMask, watchButton);
    let nativePartyButton = stack.querySelector(`.${NATIVE_PARTY_BUTTON_CLASS}`);
    if (!nativePartyButton) {
        nativePartyButton = document.createElement("button");
        stack.appendChild(nativePartyButton);
    }
    applyHomeButtonStyle(nativePartyButton, watchButton);
    syncHomeButtonStackLayout(stack, watchButton, nativePartyButton);
    return [
        {
            button: nativePartyButton,
            play: () => {
                triggerSportsHomeStartPartyNavigation();
            },
        },
    ];
}
function addNativePartyButton() {
    if (migu_browse_injected_isPageInParty()) {
        removeAllNativePartyButtons();
        return undefined;
    }
    if (!isSupportedMiguPage()) {
        removeAllNativePartyButtons();
        return undefined;
    }
    if (isVerticalPage()) {
        return addVerticalNativePartyButton();
    }
    if (isSportsHomePage()) {
        return addSportsHomeNativePartyButton();
    }
    if (isHomePage()) {
        return addHomeNativePartyButton();
    }
    if (isDetailPage()) {
        return addDetailNativePartyButton();
    }
    return undefined;
}
function startInjectionObserver() {
    let scheduled = false;
    const scheduleInject = () => {
        if (migu_browse_injected_isPageInParty()) {
            removeAllNativePartyButtons();
            return;
        }
        if (scheduled) {
            return;
        }
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            bindNativePartyButtonsIfNeeded();
        });
    };
    scheduleInject();
    const observer = new MutationObserver(scheduleInject);
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });
}
function startVerticalInjectionObserver() {
    let debounceTimer = undefined;
    const scheduleInject = () => {
        if (migu_browse_injected_isPageInParty()) {
            removeAllNativePartyButtons();
            return;
        }
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = window.setTimeout(() => {
            debounceTimer = undefined;
            bindNativePartyButtonsIfNeeded();
        }, 300);
    };
    bindNativePartyButtonsIfNeeded();
    const observer = new MutationObserver((mutations) => {
        if (migu_browse_injected_isPageInParty()) {
            return;
        }
        const shouldRefresh = mutations.some((mutation) => {
            if (mutation.type !== "childList") {
                return false;
            }
            return [...mutation.addedNodes, ...mutation.removedNodes].some((node) => {
                var _a, _b;
                if (!(node instanceof Element)) {
                    return false;
                }
                return (((_a = node.matches) === null || _a === void 0 ? void 0 : _a.call(node, ".post-wrapper, .post-body")) ||
                    ((_b = node.querySelector) === null || _b === void 0 ? void 0 : _b.call(node, ".post-wrapper, .post-body")) != null);
            });
        });
        if (shouldRefresh) {
            scheduleInject();
        }
    });
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });
}
addNativePartyHandler(addNativePartyButton, InternalStreamingServiceName.MIGU, {
    cleanupNativePartyButtons: removeAllNativePartyButtons,
});
if (isVerticalPage()) {
    startVerticalInjectionObserver();
}
else if (isSportsHomePage() || isHomePage() || isDetailPage()) {
    startInjectionObserver();
}

/******/ })()
;