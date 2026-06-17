# DocuReview - Secure Web Document Review and Correction System

**DocuReview** is an enterprise-grade, role-based web application designed for reviewing, correcting, and approving internal company documents (policies, contracts, agreements, and drafts). It streamlines the collaboration process, replacing messy email-based version tracking with a solid, structured workflow.

The application is fully containerized and optimized for deployment on **VPS environments using Docker Compose**.

---

## 🚀 Key Features & Role-Based Workflows

The system enforces strict permission boundaries based on user roles:

1. **Administrator (Admin):**
   - Register new user accounts with secure passwords and assigned roles.
   - Manage, review, and delete active user accounts.
   - Monitor VPS resource status and system capacity.

2. **Submitter (Beterjesztő):**
   - Upload new draft documents using drag-and-drop file upload (supports MS Word `.docx` and `.txt` files).
   - Speed up creation with built-in corporate templates (e.g., ISO 9001 Quality Manual, Organizational Regulations).
   - Track submitted drafts, approval actions, and download the high-fidelity original/final Word `.docx` files containing pristine layout styles.

3. **Reviewer (Véleményező):**
   - Interactive correction workbench with paragraph-level targeting.
   - Submit four types of structured corrections: **Modify/Replace**, **Delete**, **Insert**, or **Comment/Note**.
   - Input professional justifications and arguments for each suggested change.
   - Download the high-fidelity formatted `.docx` files preserving precise original styling.

4. **Approver (Jóváhagyó):**
   - Executive decision-making board and virtual signing center.
   - Review proposed corrections individually with options to **Accept** or **Reject** suggestions.
   - Acceptances dynamically merge and update the document text flow automatically.
   - Upload finalized corrected `.docx` documents or auto-generate formatted exports.
   - Finalize and seal the document status, locking it from further changes.
   - Copy clean finalized text to clipboard or export directly as a `.txt` file or as a high-fidelity Microsoft Word `.docx` file.

---

## 📄 High-Fidelity Word (.docx) Layout Preservation

To guarantee that documents processed through the system maintain their styled Word layouts (margins, custom track-changes, corporate headers/footers, and specific typographic formatting), DocuReview features a robust Base64 binary preservation layer:
- **Base64 Storage Pipeline**: Uploaded original documents (`originalDocxBase64`) and reviewer-corrected or approver-uploaded versions (`correctedDocxBase64`) are encoded and safely persisted directly within the client-side/database schema.
- **Direct Layout Downloads**: The "Download (*.docx)" buttons across all three workspaces prioritize fetching the actual, high-fidelity source binary rather than generating a plain-template substitute, ensuring pristine document consistency across all organizational roles.

---

## 🐳 VPS Docker-Based Deployment Guide

The application is configured to run behind a fast, lightweight Nginx web server inside a Docker container.

### 1. Required Configuration Files

Place the following three files in the root folder of your project:

#### `Dockerfile`
```dockerfile
# Multi-stage Docker build for optimal client-side SPA delivery
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Nginx production environment
FROM nginx:1.25-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### `nginx.conf`
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        # Crucial fallback router for modern React SPA routing
        try_files $uri $uri/ /index.html;
    }

    # Leverage browser caching for static assets
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|otf|ttf|svg|map)$ {
        root /usr/share/nginx/html;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

#### `docker-compose.yml`
```yaml
version: '3.8'

services:
  docureview:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: docureview_app
    ports:
      - "3000:80"  # Exposes the web app on port 3000 of your VPS
    restart: always
    environment:
      - NODE_ENV=production
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 2. Spinning Up the Server on Your VPS

Connect to your VPS via SSH, upload the source files, navigate to the project directory, and run:

```bash
docker compose up --build -d
```

The application will build, configure itself, and run smoothly in detached mode on **`http://<YOUR_VPS_IP>:3000`**!

---

## 🛠️ Managing GitHub Tags & Releases via CLI

To control versioning for your repository at `https://github.com/leskojanos/DocumentReview`, use these git and GitHub CLI (`gh`) commands.

### 1. Creating and Pushing a Tag
```bash
# Create a local annotated version tag
git tag -a v1.0.0 -m "First release - VPS Docker support ready"

# Push the tag to your remote GitHub repository
git push origin v1.0.0
```

### 2. Publishing a GitHub Release from CLI
Ensure you have the GitHub CLI installed and authenticated (`gh auth login`). Run the following command to ship an official release:

```bash
gh release create v1.0.0 \
  --title "Release v1.0.0 (Stable Build)" \
  --notes "Enterprise-grade web document review system with Docker support and role-based access controls." \
  --draft=false \
  --prerelease=false
```

To automatically attach built assets or compiled distribution files (`dist.zip`) to the release:
```bash
gh release create v1.0.0 ./dist/* --title "Release v1.0.0" --notes "Release description..."
```

---

## 🛡️ Built-In Test Users (For Quick Access & Testing)

The following system-defined test profiles are available out-of-the-box on the login screen for seamless demonstration of the roles:

| Name | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **Kovács Péter** | Submitter (Beterjesztő) | `kovacs.peter@vps.hu` | `beterjeszto123` |
| **Szabó Anna** | Reviewer (Véleményező) | `szabo.anna@vps.hu` | `velemenyezo123` |
| **Tóth Gábor** | Approver (Jóváhagyó) | `toth.gabor@vps.hu` | `jovahagyo123` |
| **Nagy Zsolt** | Administrator (Admin) | `admin@vps.hu` | `adminsecure123` |

---

## 💻 Tech Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling & UI:** Tailwind CSS v4 + Lucide React icon library
- **Animations:** Motion/React
- **State & Persistence:** Seamless UI-state saving and cross-device recovery using `localStorage`
- **Containerization:** Docker multi-stage pipeline + Nginx production server
