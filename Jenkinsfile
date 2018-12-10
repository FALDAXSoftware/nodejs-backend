node {
    stage('Checkout'){
                 sh "cd /root/dcompose/faldax-nodejs && git pull https://faldax-cicd:kXCbskAv4Fksfh3D@gitlab.orderhive.plus/hardiksukhadiya/faldax-nodejs.git"
                 echo "Checkout Done & docker build started"
                 sh "cd /root/dcompose/faldax-nodejs && docker build -t node_faldax_backend ."
                 echo "docker build done and it will run......"
                 sh "docker rm -f node_faldax"
				 sh "docker run -d --name node_finrax -p 7778:7778 node_faldax_backend"
                 echo "deployed"
       }
}
