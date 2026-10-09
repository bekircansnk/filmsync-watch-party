const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // content.js
  content = content.replace(/videoElement\.play\(\);/g, 'const playPromise = videoElement.play();\n' +
      '      if (playPromise !== undefined) {\n' +
      '        playPromise.catch(e => {\n' +
      '          Logger.error(\'[FilmSync] Play promise error:\', e);\n' +
      '        });\n' +
      '      }');

  // inject.js
  content = content.replace(/player\.play\(\);/g, 'const playPromise = player.play();\n' +
            '            if (playPromise !== undefined) {\n' +
            '              playPromise.catch(e => {\n' +
            '                console.error(\'[Evo ve Beko Inject] Play promise error:\', e);\n' +
            '              });\n' +
            '            }');

  fs.writeFileSync(filepath, content);
}

patchFile('extension/content.js');
patchFile('extension/inject.js');
