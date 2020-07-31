const execSync = require('child_process').execSync;

execSync(`cd ${__dirname}/../dist && gcloud functions deploy ping --runtime nodejs12 --trigger-http --allow-unauthenticated --region=${process.env}`, { stdio: [0, 1, 2] });
