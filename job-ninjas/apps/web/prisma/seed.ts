import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MVP data...');

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'JobNinjas Demo Org',
      domain: 'jobninjas.demo',
    },
  });
  console.log(`Created Org: ${org.id}`);

  // 2. Create Role: Senior AI/ML Engineer
  const role = await prisma.role.create({
    data: {
      organizationId: org.id,
      title: 'Senior AI/ML Engineer',
      department: 'Engineering',
      location: 'New York, NY (Hybrid)',
      hiringManager: 'Alex Mercer',
      jobDescription: `We are looking for a Senior AI/ML Engineer to lead our generative AI initiatives.
Requirements:
- 5+ years of production experience in Python.
- Proven track record building and deploying RAG (Retrieval-Augmented Generation) systems.
- Experience with Kubernetes and taking ownership of production deployments.
- Team leadership or mentoring experience.
- Strong communication skills.
- Familiarity with cloud providers (AWS, Azure).`,
      status: 'open',
    },
  });
  console.log(`Created Role: ${role.title} (${role.id})`);

  // 3. Create Candidate: Sarah Chen
  const candidate = await prisma.candidate.create({
    data: {
      organizationId: org.id,
      roleId: role.id,
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@example.com',
      location: 'Atlanta, GA',
      stage: 'APPLIED',
      travelBudget: 1500.0,
      resumeText: `Sarah Chen
Atlanta, GA | sarah.chen@example.com

EXPERIENCE
Machine Learning Engineer | TechFlow Solutions | 2021 - Present
- Designed and implemented enterprise RAG systems using LangChain and vector databases.
- Deployed models to production using Azure ML and Docker.
- Reduced inference latency by 40% through model quantization.

Data Scientist | DataViz Corp | 2018 - 2021
- Built predictive models in Python.
- Collaborated with cross-functional teams to deliver insights.

EDUCATION
M.S. Computer Science | Georgia Institute of Technology | 2018
B.S. Mathematics | University of Georgia | 2016

SKILLS
Python, PyTorch, Azure ML, RAG, NLP, Docker`,
    },
  });
  console.log(`Created Candidate: ${candidate.firstName} ${candidate.lastName} (${candidate.id})`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
