const execSync = require('child_process').execSync;

execSync(`cd ./dist/lambdas && gcloud functions deploy ping --runtime nodejs12 --trigger-http --allow-unauthenticated --region=${process.env}`, { stdio: [0, 1, 2] });