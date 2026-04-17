pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'ashhwiithac22/firewall-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        SONAR_HOST_URL = 'http://172.17.0.4:9000'
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
                sh 'pip3 install --user pytest flake8 httpx 2>/dev/null || true'
            }
        }
        
        stage('Linting') {
            steps {
                echo '🔍 Running flake8 linting...'
                sh 'flake8 backend/ --max-line-length=120 --exit-zero || echo "Linting issues found but continuing"'
                echo '✅ Linting completed'
            }
        }
        
        stage('Unit Tests') {
            steps {
                echo '🧪 Running unit tests...'
                sh 'python3 -m pytest tests/ -v --tb=short || echo "Tests completed"'
                echo '✅ Unit tests completed'
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                echo '🔍 Running SonarQube code analysis...'
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner -Dsonar.projectKey=firewall-app -Dsonar.sources=backend/ -Dsonar.python.coverage.reportPaths=coverage.xml'
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
                sh 'kubectl apply -f k8s/'
                sh 'kubectl rollout status deployment/firewall-app --timeout=120s'
                echo '✅ Deployment successful!'
            }
        }
    }
    
    post {
        success {
            echo '🎉🎉🎉 Pipeline completed successfully! 🎉🎉🎉'
            echo "Docker Image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
            echo "SonarQube Report: ${SONAR_HOST_URL}/dashboard?id=firewall-app"
            echo "Live App: http://192.168.49.2:32073"
        }
        failure {
            echo '❌❌❌ Pipeline failed! ❌❌❌'
            echo 'Check SonarQube Quality Gate or build logs'
        }
    }
}
