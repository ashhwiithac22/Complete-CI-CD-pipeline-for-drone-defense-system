pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'firewall-app'
        REGISTRY = 'docker.io/yourusername'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/ashhwiithac22/Adversarial_Patch_Detection_for_Military_Drones.git'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'python3 -m venv venv'
                sh '. venv/bin/activate && pip install -r requirements.txt'
            }
        }
        
        stage('Lint Check') {
            steps {
                sh '. venv/bin/activate && pip install flake8'
                sh '. venv/bin/activate && flake8 backend/ --max-line-length=120'
            }
        }
        
        stage('Unit Tests') {
            steps {
                sh '. venv/bin/activate && pip install pytest'
                sh '. venv/bin/activate && pytest tests/ -v'
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner'
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                waitForQualityGate abortPipeline: true
            }
        }
        
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} ."
            }
        }
        
        stage('Push to Registry') {
            steps {
                sh "docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${REGISTRY}/${DOCKER_IMAGE}:latest"
                sh "docker push ${REGISTRY}/${DOCKER_IMAGE}:latest"
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
            mail to: 'team@example.com', subject: "Pipeline Failed: ${env.JOB_NAME}"
        }
    }
}
