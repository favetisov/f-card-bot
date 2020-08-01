const execSync = require('child_process').execSync;

execSync(
    `cp package.json dist && cd dist && gcloud functions deploy onmessage --entry-point onmessage  --runtime nodejs12 --trigger-http  --allow-unauthenticated --region=europe-west3 --project=f-cards-bot --memory=128MB`
    , { stdio: [0, 1, 2] }
);