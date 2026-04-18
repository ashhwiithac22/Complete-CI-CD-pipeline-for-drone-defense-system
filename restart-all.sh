#!/bin/bash
echo "========================================="
echo "   Starting All DevOps Services"
echo "========================================="

# Start Docker
echo "🐳 Starting Docker..."
sudo systemctl start docker

# Start Minikube
echo "☸️ Starting Minikube..."
minikube start

# Start Jenkins
echo "🔧 Starting Jenkins..."
docker start jenkins

# Start SonarQube
echo "📊 Starting SonarQube..."
docker start sonarqube

# Port forward ArgoCD
echo "🚢 Starting ArgoCD port-forward..."
kubectl port-forward svc/argocd-server -n argocd 9091:443 &

# Run Ansible playbook (optional - to verify configuration)
echo "📦 Running Ansible playbook to verify setup..."
cd /home/ashwitha/Documents/Projects/Complete-CI-CD-pipeline-for-drone-defense-system
ansible-playbook ansible/playbook.yml --connection=local --ask-become-pass 2>&1 | tail -10

# Get app URL
echo "🌐 Getting application URL..."
sleep 5
APP_URL=$(minikube service firewall-app-service --url 2>/dev/null)
if [ -n "$APP_URL" ]; then
    echo "✅ Live App URL: $APP_URL"
else
    echo "⚠️ App URL not available yet"
fi

echo ""
echo "========================================="
echo "   All Services Started Successfully!"
echo "========================================="
echo ""
echo "🔗 Access URLs:"
echo "   Jenkins:    http://localhost:8081"
echo "   SonarQube:  http://localhost:9000"
echo "   ArgoCD:     https://localhost:9091"
echo "   Live App:   $APP_URL"
echo ""
echo "📝 To stop all services, run: ./stop-all.sh"
