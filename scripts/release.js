const { readFileSync, writeFileSync } = require('fs');
const simpleGit = require('simple-git/promise');
const inquirer = require('inquirer');
const semver = require('semver');
const execSync = require('child_process').execSync;

const rootDir = __dirname + '/../';
const git = simpleGit(rootDir);

const SEMVER_INCREMENTS = [
  { value: 'patch', name: 'Patch: bugfixes only' },
  { value: 'minor', name: 'Minor: new features + bugfixes(optional)' },
  { value: 'major', name: 'Major: epic release with additional description' },
  { value: 'custom', name: 'Custom: Specify version manually' },
];

const run = async () => {
  await checkIsOnMaster();
  await checkWorkingTreeIsClean();
  const level = await getReleaseLevel();
  const version = await getVersion(level);
  await updatePackageVersion(version);
  await generateChangelog(version);
  await commitAndTag(version);
};

const checkIsOnMaster = async () => {
  const branch = (await git.status()).current;
  if (branch === 'master') {
    return true;
  } else {
    console.error(`Your current branch is "${branch}". Release is allowed from master branch only.`);
    process.exit(1);
  }
};

const checkWorkingTreeIsClean = async () => {
  const files = (await git.status()).files;
  if (files && files.length > 0) {
    console.error('Unclean working tree. Commit or stash changes first');
    process.exit(1);
  }
};

const getReleaseLevel = async () => {
  const level = (
    await inquirer.prompt([
      {
        type: 'list',
        name: 'releaseLevel',
        message: `Please select release Level`,
        choices: SEMVER_INCREMENTS,
      },
    ])
  ).releaseLevel;
  return level;
};

const getVersion = async (releaseLevel) => {
  const oldVersion = JSON.parse(readFileSync(rootDir + 'package.json')).version;
  if (releaseLevel !== 'custom') {
    return semver.inc(oldVersion, releaseLevel);
  } else {
    const version = (
      await inquirer.prompt([
        {
          type: 'input',
          name: 'version',
          message: `Version`,
          validate: (input) => {
            if (!Boolean(semver.valid(input))) {
              return 'Please specify a valid semver, for example, `1.2.3`. See http://semver.org';
            }
            return true;
          },
        },
      ])
    ).version;
    return version;
  }
};

const updatePackageVersion = async (version) => {
  const packageJson = JSON.parse(readFileSync(rootDir + 'package.json', 'utf8'));
  packageJson.version = version;
  writeFileSync(rootDir + 'package.json', JSON.stringify(packageJson, null, 2) + '\n');

  const packageLockJson = JSON.parse(readFileSync(rootDir + 'package-lock.json', 'utf8'));
  packageLockJson.version = version;
  writeFileSync(rootDir + 'package-lock.json', JSON.stringify(packageLockJson, null, 2) + '\n');
};

const generateChangelog = async (version) => {
  const changelog = execSync(`conventional-changelog -p angular -i CHANGELOG.md -r 1`);
  writeFileSync(rootDir + 'CHANGELOG.md', changelog);

  const jsonChangelog = JSON.parse(readFileSync(rootDir + 'CHANGELOG.json').toString());
  jsonChangelog[version] = execSync(`conventional-changelog -p angular -r 1`).toString();
  writeFileSync(rootDir + 'CHANGELOG.json', JSON.stringify(jsonChangelog));
  return changelog;
};

const commitAndTag = async (version) => {
  execSync('prettier . --write', { stdio: [0, 1, 2] });
  await git.add([
    rootDir + 'package.json',
    rootDir + 'package-lock.json',
    rootDir + 'CHANGELOG.md',
    rootDir + 'CHANGELOG.json',
  ]);
  await git.commit(version);
  await git.addTag(version);
  await git.push('origin', 'master');
  await git.pushTags('origin');
};

run();