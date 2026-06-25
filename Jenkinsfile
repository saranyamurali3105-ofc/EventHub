pipeline {
    agent any

    tools {
        nodejs 'Node22'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/saranyamurali3105-ofc/EventHub.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Success') {
            steps {
                echo 'Build completed successfully!'
            }
        }
    }
}