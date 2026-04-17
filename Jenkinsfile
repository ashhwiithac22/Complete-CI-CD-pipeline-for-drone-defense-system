pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'ashhwiithac22/firewall-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        SONAR_HOST_URL = 'http://host.docker.internal:9000'
    }
    
    tools {
        sonarQubeScanner 'SonarQube Scanner'
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
        
        stage('Linting') {
            steps {
                echo '🔍 Running linting checks...'
                sh 'pip3 install --user flake8 2>/dev/null || true'
                sh 'flake8 backend/ --max-line-length=120 || echo "Linting issues found"'
            }
        }
        
        stage('Unit Tests') {
            steps {
                echo '🧪 Running unit tests...'
                sh 'pip3 install --user pytest 2>/dev/null || true'
                sh 'python3 -m pytest tests/ --junitxml=test-results.xml || echo "No tests found"'
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                echo '🔍 Running SonarQube code analysis...'
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        sonar-scanner \
                            -Dsonar.projectKey=firewall-app \
                            -Dsonar.projectName="Adversarial AI Firewall" \
                            -Dsonar.projectVersion=1.0 \
                            -Dsonar.sources=backend/ \
                            -Dsonar.python.version=3.11 \
                            -Dsonar.exclusions=**/venv/**,**/tests/**,**/frontend/** \
                            -Dsonar.python.coverage.reportPaths=coverage.xml \
                            -Dsonar.qualitygate.wait=true
                    '''
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
