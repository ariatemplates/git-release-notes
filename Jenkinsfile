stage('publish') {
	node('redshelf') {

		checkout scm;

		env.TAG_NAME = shWithReturn('git describe --exact-match --tags HEAD || :');

		if(isTagBuild()) {
			env.DOCKER_TAG = dockerTag(env.TAG_NAME.substring(0, env.TAG_NAME.length() - 1));
			env.NPM_TAG = 'stable';
		} else {
			env.DOCKER_TAG = "";
			env.NPM_TAG = "";
		}

		if(env.DOCKER_TAG != "") {
			withCredentials([string(credentialsId: 'npm-token', variable: 'NPM_TOKEN')]) {
				sh 'sudo -E docker build --build-arg NPM_TOKEN=$NPM_TOKEN -t ${DOCKER_TAG} .';
				sh 'sudo -E docker run -e "NPM_TOKEN=$NPM_TOKEN" ${DOCKER_TAG} bash -c "npm --no-git-tag-version version ${DOCKER_TAG} && npm publish --tag ${NPM_TAG}"';
				sh "sudo -E docker push ${DOCKER_TAG}";
			}
		}
	}
}

def dockerTag(buildName) {
	return  "redshelf/git-release-notes:${buildName}";
}
def isTagBuild() {
  return env.TAG_NAME && env.TAG_NAME != "";
}

def shWithReturn(script) {
	returnVal = sh(returnStdout: true, script: script);
	return returnVal;
}
