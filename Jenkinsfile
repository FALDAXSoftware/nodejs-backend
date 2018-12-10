node {
    stage('Checkout'){
                 sh "cd /root/dcompose/faldax-nodejs && git pull https://faldax-cicd:kXCbskAv4Fksfh3D@gitlab.orderhive.plus/hardiksukhadiya/faldax-nodejs.git"
                 echo "Checkout Done & docker build started"
                 sh "cd /root/dcompose/faldax-nodejs && docker build -t node_faldax_backend ."
                 echo "docker build done and it will run......"
                 echo "docker rm -f node_faldax"
				 sh "docker run -d --name node_faldax -p 8804:8804 node_faldax_backend"
                 echo "deployed"
       }
}
