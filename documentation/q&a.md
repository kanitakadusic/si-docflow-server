# docflow-server

## Questions and Answers

### 1. Target Environment

#### 1.1. Operating Systems
- Multiplatform

#### 1.2. Hardware Requirements
- 2 GB RAM
- 2 vCPU per service

#### 1.3. Cloud vs On-Premise
- Supports both cloud and on-premise deployments

### 2. Software Dependencies

#### 2.1. Required Runtimes
- [Node.js](https://nodejs.org/) (v18.20.8 or later)

#### 2.2. Libraries, Packages, or Frameworks
- Managed via the `npm` package manager

#### 2.3. Containerization
- Not containerized

### 3. Installation and Configuration

#### 3.1. Installation Method
- Installed via [Node.js](https://nodejs.org/) using `npm` scripts

#### 3.2. Environment Variables or Config Files
- Described in the [env-setup.md](./env-setup.md) file

#### 3.3. System Initialization Steps
- Described in the [README.md](../README.md) file

#### 3.4. Default Users and Passwords
- None (no default users or passwords required)

### 4. CI/CD

#### 4.1. CI/CD Tools
- Not used

#### 4.2. Deployment Trigger
- Commit to [dev branch](https://github.com/kanitakadusic/si-docflow-server/tree/dev)

### 5. Network and Security

#### 5.1. Open Ports
- Configured via the `PORT` environment variable

#### 5.2. SSL/TLS Requirements
- Handled by cloud providers (HTTPS with TLS certificates)

#### 5.3. Authentication Mechanisms
- None

### 6. Database Deployment

#### 6.1. Required DBMS
- [PostgreSQL](https://www.postgresql.org/download/)

#### 6.2. Initialization Scripts / Migrations
- Described in the [README.md](../README.md) file

#### 6.3. Hosting Support
- Supports both local and cloud-hosted [PostgreSQL](https://www.postgresql.org/download/) instances

### 7. Rollback and Recovery

#### 7.1. Rollback Procedure
- Depends on the cloud provider

#### 7.2. Backup Procedures
- None

### 8. Monitoring and Logging

#### 8.1. Monitoring Tools
- None

#### 8.2. Logs and Their Location
- Runtime logs: printed to console
- Data transaction logs: stored in DB tables

### 9. User Access and Roles

#### 9.1. System Access
- Development team members with production DB access

#### 9.2. User Provisioning and Management
- Not applicable - no user accounts

### 10. Testing in Deployment Environment

- Smoke/sanity checks are **not** automated

### 11. Step-by-Step Deployment to Blank Environment

- Described in the [README.md](../README.md) file
