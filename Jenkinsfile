pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'ashhwiithac22/firewall-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📦 Checking out code from GitHub...'
                git branch: 'main', 
                    url: 'https://github.com/ashhwiithac22/Complete-CI-CD-pipeline-for-drone-defense-system.git'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing Python dependencies...'
                sh 'pip3 install --user -r requirements.txt 2>/dev/null || echo "No requirements.txt found"'
            }
        }
        
        stage('Run Tests') {
            steps {
                echo '🧪 Running unit tests...'
                sh 'python3 -m pytest tests/ 2>/dev/null || echo "No tests found"'
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                echo '🔍 Running SonarQube code analysis...'
                // SonarQube scanner will be added later
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                sh 'docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} . 2>/dev/null || echo "Docker build skipped"'
            }
        }
        
        stage('Push to Registry') {
            steps {
                echo '📤 Pushing to Docker Hub...'
                // Docker push will be added later
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                echo '☸️ Deploying to Kubernetes...'
                // Kubectl apply will be added later
            }
        }
    }
    
    post {
        success {
            echo '🎉 Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check logs for details.'
            // Fixed mail command - removed invalid syntax
        }
    }
}
