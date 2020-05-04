pipeline {
    agent {
        docker {
            image 'timbru31/java-node'
        }
    }
    stages {        
        stage('Code-Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonarqube';
                    withSonarQubeEnv('sonarqube'){
                        sh "${scannerHome}/bin/sonar-scanner -Dproject.settings=${env.WORKSPACE}/sonar-project.properties"
                    }
                }
            
            }
        }
    }
}
