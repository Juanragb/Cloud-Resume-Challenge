# Cloud-Resume-Challenge (Azure)

The [cloud resume challenge](https://cloudresumechallenge.dev/docs/the-challenge/azure/) is a hands-on project to practice cloud services and DevOps (CI/CD, IaC, automation) by building and deploying a serverless resume website. Perfect for showcasing cloud skills in a real-world scenario.

You can see my resume [here](https://www.juanragarcia.me)

![Diagrama](/frontend/media/cloud-resume-challenge.svg)

## Technologies
Used technologies in the project:
- HTML/CSS/JavaScript: Designed and coded the resume site from scratch.
- Azure Storage Static Website: Worked on Azure storage accounts and storage - services for a static website.
- Custom Domain + DNS: Connected a custom domain via DNS and Azure CDN endpoint.
- Visitor Counter: Built a counter using JavaScript + Azure Functions + CosmosDB.
- Backend API (Python): Developed with Python using Azure Functions.
- Testing: Included Cypress tests for the frontend and some tests for backend logic.
- Infrastructure as Code (IaC): Deployed all cloud resources using Terraform.
- CI/CD Pipelines: Automated deployment using workflows in GitHub Actions for both frontend and backend.


## Project Structure

```
.
├── 📁 backend
│   ├── 📁 api
│   └── 📁 tests
├── 📁 frontend
│   ├── 📄 static content
│   └── 📁 cypress
├── 📁 infra
│   └── 📄 terraform files
├── 📄 README.md
└── 📄 setup.py
```

# Helpful Resources

### Static Web
- [Host a static website in Azure Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website-how-to?tabs=azure-portal)

### CDN
- [Create an Azure Content Delivery Network profile and endpoint](https://learn.microsoft.com/en-us/azure/cdn/cdn-create-new-endpoint)
- [Configure HTTPS on an Azure CDN custom domain](https://learn.microsoft.com/en-us/azure/cdn/cdn-custom-ssl)

### IaC
- [Terraform docs for Azure](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)

### CI/CD
- [Azure Static Web Apps + GitHub Actions](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-static-site-github-actions)
- [Cypress GitHub Action](https://docs.cypress.io/app/continuous-integration/github-actions)
- [CD con GitHub Actions](https://learn.microsoft.com/es-es/azure/azure-functions/functions-how-to-github-actions)
- [Azure Login Workflow](https://github.com/Azure/login#readme)
- [Create an Azure service principal with Azure CLI](https://learn.microsoft.com/en-us/cli/azure/azure-cli-sp-tutorial-1?tabs=bash)
- [Configure an app to trust an external identity provider](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-create-trust)
