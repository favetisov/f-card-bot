const execSync = require('child_process').execSync;

execSync(`cd ${__dirname}/../dist && gcloud functions deploy ping --runtime nodejs12 --trigger-http --allow-unauthenticated --region=${process.env.region} --project=${process.env.project_id}`, { stdio: [0, 1, 2] });
