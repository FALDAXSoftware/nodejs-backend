#!/usr/bin/env groovy
def label = "buildpod.${env.JOB_NAME}.${env.BUILD_NUMBER}".replace('-', '_').replace('/', '_').take(63)
def gitCredentialsId = "github"
def imageRepo = "100.69.158.196"
podTemplate(label: label, containers: [
     containerTemplate(name: 'build-container', image: imageRepo + '/buildtool:deployer', command: 'cat', ttyEnabled: true),
     containerTemplate(name: 'pm291', image: imageRepo + '/buildtool:pm291', command: 'cat', ttyEnabled: true),
],
volumes: [
    hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
  ]
){
  timeout(9){
      def coinToDeploy;
      def triggerByUser;
      def namespace;
      node(label) {

         // Wipe the workspace so we are building completely clean
         deleteDir()

         stage('Docker Build'){
         container('build-container'){
              def myRepo = checkout scm
              gitCommit = myRepo.GIT_COMMIT
              shortGitCommit = "${gitCommit[0..10]}${env.BUILD_NUMBER}"
              imageTag = shortGitCommit
              namespace = getNamespace(myRepo.GIT_BRANCH);
              if ( ${env.GIT_BRANCH} != "master" && namespace){
                withAWS(credentials:'jenkins_s3_upload') {
                  s3Download(file:'.env', bucket:'env.faldax', path:"node-backend/${namespace}/.env", force:true)
                  s3Download(file:'.keyiv', bucket: 'env.faldax', path: "keyiv/${namespace}/.keyiv", force: true)
                }
                sh "ls -a"
                sh "cat .keyiv >> .env && rm .keyiv"
                sh "docker build -t ${imageRepo}/backend:${imageTag}  ."
                sh "docker push  ${imageRepo}/backend:${imageTag}"
                sh "helm upgrade --install --namespace ${namespace} --set image.tag=${imageTag} ${namespace}-backend -f chart/values-${namespace}.yaml chart/"
              }
              else if (namespace) {
                  withAWS(credentials:'jenkins_s3_upload') {
                  s3Download(file:'.env', bucket:'env.faldax', path:"node-backend/${namespace}/.env", force:true)
                  s3Download(file:'.keyiv', bucket: 'env.faldax', path: "keyiv/${namespace}/.keyiv", force: true)
                }
                sh "ls -a"
                sh "cat .keyiv >> .env && rm .keyiv"
                sh "docker build -t ${imageRepo}/backend:${imageTag}  ."
                sh "docker push  ${imageRepo}/backend:${imageTag}"
                sh "helm upgrade --install --namespace ${namespace} --set image.tag=${imageTag} ${namespace}-backend -f chart/values-${namespace}.yaml chart-prod/"
              }
         }
         }

         }
    }   }





def getNamespace(branch){
    switch(branch){
        case 'master' : return "prod";
        case 'development' :  return "dev";
        case 'pre-prod' : return "pre-prod";
        case 'mainnet' : return "mainnet";
        case 'qa' : return "qa";
        default : return null;
    }
}


