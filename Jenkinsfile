node {
    stage('Checkout'){
                 sh "cd /root/dcompose/faldax-nodejs && git pull origin kalpit"
                 echo "Checkout Done & docker build started"
                 sh "cd /root/dcompose/faldax-nodejs && docker build -t node_faldax_backend ."
                 echo "docker build done and it will run......"
                 sh "docker rm -f node_faldax"
                 sh "docker run -d --restart always --name node_faldax -p 8084:1337 node_faldax_backend"
                 echo "deployed"
       }
}
