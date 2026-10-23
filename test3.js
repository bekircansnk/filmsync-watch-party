const fs = require('fs');

let content = fs.readFileSync('extension/content.js', 'utf8');

// To fix the issue identified by the code review (isSyncing not being cleared on early returns),
// instead of adding setTimeout at the end, let's wrap the logic in a function and ensure finally, or we can use the original logic but make sure `isSyncing = false` is called before each early return.
// Or we can just use `executeProgrammaticSync` which wraps everything, wait no, executeProgrammaticSync takes a callback.
// But the issue is the early returns in the normal playback scenario.
