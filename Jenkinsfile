pipeline {
    agent any

    stages {

        stage('Clone') {
            steps {
                git 'https://github.com/saranyamurali3105-ofc/EventHub.git'
            }
        }

        stage('Install Frontend') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh '''
                sudo rm -rf /var/www/html/*
                sudo cp -r dist/* /var/www/html/
                '''
            }
        }

        stage('Restart Nginx') {
            steps {
                sh 'sudo systemctl restart nginx'
            }
        }
    }
}