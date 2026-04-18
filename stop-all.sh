#!/bin/bash
echo "========================================="
echo "   Stopping All DevOps Services"
echo "========================================="

# Stop Minikube
echo "☸️ Stopping Minikube..."
minikube stop

# Stop Jenkins
echo "🔧 Stopping Jenkins..."
docker stop jenkins

# Stop SonarQube
echo "📊 Stopping SonarQube..."
docker stop sonarqube

# Kill ArgoCD port-forward
echo "🚢 Stopping ArgoCD port-forward..."
pkill -f "port-forward.*argocd"

echo ""
echo "✅ All services stopped!"
