const execSync = require('child_process').execSync;

console.log(execSync('gcloud info', { stdio: [0, 1, 2] } ));