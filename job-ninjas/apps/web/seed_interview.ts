import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const candidate = await prisma.candidate.findFirst();
  if (!candidate) return console.log('No candidate found');
  await prisma.interview.create({
    data: {
      candidateId: candidate.id,
      roleId: candidate.roleId,
      round: "1",
      type: 'TECHNICAL',
      transcriptText: "Interviewer: Hi Sarah, let's talk about your experience with RAG systems. How do you handle document chunking?\nSarah: Hi! Yes, in my last project at TechFlow, we used semantic chunking. Instead of strict character counts, we split by paragraphs and used a secondary embedding model to group sentences that shared high semantic similarity before sending them to the vector store. This improved our retrieval accuracy by about 25%.\nInterviewer: That's solid. Have you managed deployments to Kubernetes?\nSarah: To be honest, no. Our DevOps team handled all the Kubernetes clusters. I packaged the models in Docker containers, and they took it from there. I am familiar with the concepts but haven't written the helm charts or managed the cluster myself.\nInterviewer: Understood. What about mentoring?\nSarah: I informally mentored two junior data scientists last year, helping them get up to speed with PyTorch and code reviews."
    }
  });
  console.log('Seeded interview transcript.');
}
main();
