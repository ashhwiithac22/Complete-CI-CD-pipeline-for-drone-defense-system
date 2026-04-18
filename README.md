# 🚀 Complete DevOps Pipeline for Adversarial AI Firewall

## 📌 Project Overview

This project implements a **complete end-to-end DevOps pipeline** for an Adversarial AI Firewall application that detects adversarial attacks on military drone images. The pipeline integrates **Source Code Management, CI/CD, Code Quality, Containerization, Kubernetes Orchestration, and GitOps** using modern DevOps tools.

### 🔍 What the Application Does

The Adversarial AI Firewall uses a PyTorch-based deep learning model to classify images as either **"ATTACK"** or **CLEAN"** with confidence scores. It helps military drones identify adversarial patches that could fool their vision systems.

---

## 🏗️ Architecture Overview

---

## 🛠️ Technologies Used

| Category | Technologies |
|----------|--------------|
| **Version Control** | Git, GitHub |
| **CI/CD** | Jenkins (Declarative Pipeline) |
| **Code Quality** | SonarQube (Quality Gate) |
| **Configuration Management** | Ansible |
| **Containerization** | Docker (Multi-stage builds) |
| **Container Registry** | Docker Hub |
| **Orchestration** | Kubernetes (Minikube) |
| **GitOps** | ArgoCD |
| **Application** | Python, FastAPI, PyTorch, React |

---

---

## 🔄 Complete Pipeline Flow

### Step 1: Source Code Management (GitHub)

**Repository:** [Complete-CI-CD-pipeline-for-drone-defense-system](https://github.com/ashhwiithac22/Complete-CI-CD-pipeline-for-drone-defense-system)

The repository contains all application source code, Jenkinsfile, Dockerfile, Kubernetes manifests, and Ansible playbooks. The main branch is protected, requiring pull requests for all changes.

---

### Step 2: Infrastructure Setup (Ansible)

Ansible playbook automates the installation of all required tools including Docker, kubectl, Minikube, Python pip, and Jenkins dependencies. The playbook is idempotent, meaning it can be run multiple times safely.

#### 📸 Ansible Execution Output

![Ansible Execution](https://raw.githubusercontent.com/ashhwiithac22/Complete-CI-CD-pipeline-for-drone-defense-system/main/Ansible_Configuration1.png)

**Execution Summary:**
- 7 tasks completed successfully
- Docker, kubectl, Minikube installed
- Jenkins service configured

---

### Step 3: Continuous Integration (Jenkins)

The declarative Jenkinsfile triggers on SCM polling and performs the following stages:

| Stage | Purpose |
|-------|---------|
| **Checkout** | Clone code from GitHub repository |
| **Install Dependencies** | Install Python packages using pip |
| **Linting** | Run flake8 for code style checking |
| **Unit Tests** | Execute pytest test cases |
| **SonarQube Analysis** | Perform static code analysis |
| **Quality Gate** | Enforce Bugs=0 and Vulnerabilities=0 |
| **Build Docker Image** | Create multi-stage Docker image |
| **Push to Docker Hub** | Upload image to container registry |
| **Deploy to Kubernetes** | Apply Kubernetes manifests |

#### 📸 Jenkins Pipeline Stages

![Jenkins Stage View](https://raw.githubusercontent.com/ashhwiithac22/Complete-CI-CD-pipeline-for-drone-defense-system/main/Jenkins_Stage_View.png)

#### 📸 Jenkins Pipeline Success

![Pipeline Status](https://raw.githubusercontent.com/ashhwiithac22/Complete-CI-CD-pipeline-for-drone-defense-system/main/Pipeline_Status.png)

---

### Step 4: Code Quality (SonarQube)

SonarQube performs static code analysis with a Strict Production Gate that fails the pipeline if any bugs or vulnerabilities are detected.

#### Quality Gate Results:

| Metric | Result | Status |
|--------|--------|--------|
| **Bugs** | 0 | ✅ Passed |
| **Vulnerabilities** | 0 | ✅ Passed |
| **Code Smells** | 2 | ✅ Acceptable |
| **Duplications** | 13.0% | ✅ Acceptable |
| **Quality Gate** | PASSED | ✅ |

#### 📸 SonarQube Dashboard

![SonarQube Dashboard](https://raw.githubusercontent.com/ashhwiithac22/Complete-CI-CD-pipeline-for-drone-defense-system/main/Sonarqube_Dashboard.png)

---

### Step 5: Containerization (Docker)

A multi-stage Dockerfile is used to optimize image size and leverage layer caching. The first stage installs dependencies, while the final stage copies only the necessary files for runtime.

#### Docker Image Optimization:

- **Multi-stage build:** Reduces final image size
- **Layer caching:** Strategic command placement for faster rebuilds
- **CPU-only PyTorch:** Smaller image footprint

#### 📸 Docker Hub Repository

![Docker Hub](https://raw.githubusercontent.com/ashhwiithac22/Complete-CI-CD-pipeline-for-drone-defense-system/main/Docker_Hub.png)

**Image Details:**
- Repository: `ashhwiithac22/firewall-app`
- Tags: `latest`, build numbers
- Size: ~1.1 GB

---

### Step 6: Container Registry (Docker Hub)

After passing quality checks, the Docker image is pushed to Docker Hub registry, making it available for Kubernetes deployment.

---

### Step 7: Kubernetes Deployment

#### Deployment with RollingUpdate Strategy

The deployment ensures zero-downtime updates with maxUnavailable=1 and maxSurge=1.

#### Horizontal Pod Autoscaler (HPA)

The HPA automatically scales pods based on CPU utilization:

| Parameter | Value |
|-----------|-------|
| **Minimum Pods** | 2 |
| **Maximum Pods** | 10 |
| **CPU Threshold** | 60% |
| **Scale-up Behavior** | When CPU exceeds 60% |
| **Scale-down Behavior** | When CPU drops below 60% |

#### PersistentVolumeClaim (PVC)

A 1Gi persistent volume ensures data retention across pod restarts, mounted to `/app/data` directory.

#### LoadBalancer Service

The LoadBalancer service exposes the application externally on port 80, routing traffic to container port 8000.

```bash
kubectl get pods
```

Output: CPU target: 60%, Min pods: 2, Max pods: 10

### Step 8: GitOps (ArgoCD)
ArgoCD synchronizes the Kubernetes cluster with the GitHub repository, ensuring the cluster state always matches the source of truth.

#### 📸  ArgoCD UI
![ArgoCD UI](https://raw.githubusercontent.com/ashhwiithac22/Complete-CI-CD-pipeline-for-drone-defense-system/main/argocd.png)

---

### Step 9: Live Application Testing

After successful deployment, the application is accessible via the LoadBalancer service URL.

#### 📸 Script Execution

![Service Restart Execution](https://raw.githubusercontent.com/ashhwiithac22/Complete-CI-CD-pipeline-for-drone-defense-system/main/Script_Execution1.png)

![Service Restart Execution](https://raw.githubusercontent.com/ashhwiithac22/Complete-CI-CD-pipeline-for-drone-defense-system/main/Script_Execution2.png)
#### API Health Check

```bash
curl http://192.168.49.2:32073/api/health
```
--- 

### 🏆 Conclusion
This DevOps project successfully implements a complete CI/CD pipeline with:

- Continuous Integration: Jenkins with linting, unit tests, and SonarQube analysis
- Continuous Deployment: Kubernetes with RollingUpdate strategy
- GitOps: ArgoCD for automatic sync and self-healing
- Auto-scaling: HPA scales 2-10 pods at 60% CPU utilization
- Zero Downtime: RollingUpdate with maxUnavailable=1 and maxSurge=1
- Infrastructure as Code: Ansible, Dockerfile, and Kubernetes manifests

Every code change is automatically analyzed, containerized, and deployed without manual intervention.

---

