const execSync = require('child_process').execSync;

// execSync(`cd ${__dirname}/../dist/lambdas && gcloud functions deploy ping --runtime nodejs12 --trigger-http --allow-unauthenticated --region=${process.env}`, { stdio: [0, 1, 2] });

execSync(`ls -l ${__dirname}/../dist`, { stdio: [0, 1, 2] });