pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'ashhwiithac22/firewall-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        SONAR_HOST_URL = 'http://172.17.0.1:9000'
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
        
        stage('SonarQube Analysis') {
            steps {
                echo '🔍 Running SonarQube code analysis...'
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner -Dsonar.projectKey=firewall-app -Dsonar.sources=backend/'
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                echo '🛡️ Waiting for Quality Gate results...'
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
                echo '✅ Quality Gate passed!'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                script {
                    sh 'docker build -f Dockerfile.final -t ${DOCKER_IMAGE}:${DOCKER_TAG} .'
                    echo '✅ Docker image built successfully!'
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo '📤 Pushing to Docker Hub...'
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', 
                                                      usernameVariable: 'DOCKER_USER', 
                                                      passwordVariable: 'DOCKER_PASS')]) {
                        sh 'echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin'
                        sh 'docker push ${DOCKER_IMAGE}:${DOCKER_TAG}'
                        echo '✅ Image pushed to Docker Hub!'
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                echo '☸️ Deploying to Kubernetes...'
                sh 'kubectl apply -f k8s/ 2>/dev/null || echo "Kubernetes not configured yet"'
            }
        }
    }
    
    post {
        success {
            echo '🎉🎉🎉 Pipeline completed successfully! 🎉🎉🎉'
            echo "Docker Image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
            echo "SonarQube Report: ${SONAR_HOST_URL}/dashboard?id=firewall-app"
        }
        failure {
            echo '❌❌❌ Pipeline failed! ❌❌❌'
            echo 'Check SonarQube Quality Gate or build logs'
        }
    }
}
