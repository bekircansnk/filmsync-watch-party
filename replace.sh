sed -i 's/setTimeout(() => { isSyncing = false; }, 800);/if (syncSafetyTimer) clearTimeout(syncSafetyTimer); syncSafetyTimer = setTimeout(() => { finishProgrammaticSync(); }, 800);/g' extension/content.js
sed -i 's/setTimeout(() => {/if (syncSafetyTimer) clearTimeout(syncSafetyTimer);\n      syncSafetyTimer = setTimeout(() => {/g' temp.js
