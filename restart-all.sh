#!/bin/bash
echo "Starting all DevOps services..."

# Start Docker
sudo systemctl start docker

# Start Minikube
minikube start

# Start Jenkins
docker start jenkins

# Start SonarQube
docker start sonarqube

# Port forward ArgoCD
kubectl port-forward svc/argocd-server -n argocd 9091:443 &

# Get app URL
echo "Live App URL: $(minikube service firewall-app-service --url)"

echo "All services started!"
echo "Jenkins: http://localhost:8081"
echo "SonarQube: http://localhost:9000"
echo "ArgoCD: https://localhost:9091"
