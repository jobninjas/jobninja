// Mock data for UI development

export const mockUser = {
  id: "user_123",
  name: "Alex Johnson",
  email: "alex@example.com",
  role: "customer" as const,
  resumeUrl: "/uploads/alex-resume.pdf",
  linkedinUrl: "https://linkedin.com/in/alexjohnson",
  preferences: {
    targetRoles: ["Software Engineer", "Full Stack Developer"],
    targetLocations: ["San Francisco", "Remote"],
    salaryMin: 120000,
    salaryMax: 180000,
    visaSponsorship: false,
  },
  createdAt: "2025-01-15T10:00:00Z",
  lastLoginAt: "2025-01-24T09:30:00Z",
};

export const mockPlans = [
  {
    id: "plan_starter",
    name: "Starter",
    priceMonthly: 399,
    appsPerMonth: 400,
    features: [
      "400 applications per month",
      "Job search & shortlisting",
      "Application tracking",
      "Email support",
    ],
  },
  {
    id: "plan_pro",
    name: "Pro",
    priceMonthly: 499,
    appsPerMonth: 500,
    features: [
      "500 applications per month",
      "Priority job search",
      "Real-time tracking",
      "Weekly updates",
      "Strategy calls",
    ],
    featured: true,
  },
  {
    id: "plan_urgent",
    name: "Urgent",
    priceMonthly: 599,
    appsPerMonth: 600,
    features: [
      "600 applications per month",
      "Dedicated specialist",
      "24/7 support",
      "Interview prep",
      "Custom strategy",
    ],
  },
];

export const mockSubscription = {
  id: "sub_123",
  userId: "user_123",
  planId: "plan_pro",
  status: "active" as const,
  provider: "paddle",
  providerCustomerId: "cus_paddle_123",
  providerSubscriptionId: "sub_paddle_456",
  currentPeriodEnd: "2025-02-24T00:00:00Z",
};

export const mockCase = {
  id: "case_123",
  userId: "user_123",
  assignedEmployeeId: "emp_456",
  stage: "active" as const,
  targetRoles: ["Software Engineer", "Full Stack Developer"],
  targetLocations: ["San Francisco", "Remote"],
  notes: "Prefers startups, avoid FAANG for now. Open to relocation.",
};

export const mockApplications = [
  {
    id: "app_1",
    caseId: "case_123",
    employeeId: "emp_456",
    companyName: "Acme Corp",
    jobTitle: "Senior Software Engineer",
    jdText: "We are looking for an experienced software engineer...",
    applicationLink: "https://acme.com/careers/12345",
    status: "submitted" as const,
    submittedAt: "2025-01-23T14:00:00Z",
    notes: "Great culture fit, remote-first company",
  },
  {
    id: "app_2",
    caseId: "case_123",
    employeeId: "emp_456",
    companyName: "TechStart Inc",
    jobTitle: "Full Stack Developer",
    jdText: "Join our team building next-gen SaaS products...",
    applicationLink: "https://techstart.com/jobs/67890",
    status: "prepared" as const,
    submittedAt: null,
    notes: "Early stage startup, equity opportunity",
  },
  {
    id: "app_3",
    caseId: "case_123",
    employeeId: "emp_456",
    companyName: "CloudScale",
    jobTitle: "Backend Engineer",
    jdText: "Building scalable cloud infrastructure...",
    applicationLink: "https://cloudscale.com/careers/backend",
    status: "found" as const,
    submittedAt: null,
    notes: "Requires AWS experience",
  },
];

export const mockEmployees = [
  {
    id: "emp_456",
    name: "Sarah Martinez",
    email: "sarah@novaninjas.com",
    role: "employee" as const,
    assignedCases: 8,
    appsThisWeek: 156,
    capacity: 200,
  },
  {
    id: "emp_789",
    name: "James Chen",
    email: "james@novaninjas.com",
    role: "employee" as const,
    assignedCases: 6,
    appsThisWeek: 124,
    capacity: 200,
  },
];

export const mockCustomers = [
  {
    id: "user_123",
    name: "Alex Johnson",
    email: "alex@example.com",
    plan: "Pro",
    status: "active" as const,
    assignedEmployee: "Sarah Martinez",
    appsThisWeek: 47,
    joinedAt: "2025-01-15",
  },
  {
    id: "user_124",
    name: "Maria Garcia",
    email: "maria@example.com",
    plan: "Starter",
    status: "active" as const,
    assignedEmployee: "James Chen",
    appsThisWeek: 19,
    joinedAt: "2025-01-18",
  },
  {
    id: "user_125",
    name: "David Kim",
    email: "david@example.com",
    plan: "Pro",
    status: "past_due" as const,
    assignedEmployee: "Sarah Martinez",
    appsThisWeek: 0,
    joinedAt: "2025-01-10",
  },
];

export const mockKPIs = {
  customer: {
    appsPreparedThisWeek: 12,
    appsSubmittedThisWeek: 47,
    outreachCount: 8,
    interviewsCount: 3,
    hoursSaved: 23.5,
  },
  admin: {
    activeCustomers: 42,
    pastDue: 3,
    totalAppsPerWeek: 1847,
    appsPerEmployee: 185,
    interviewRate: 12.5,
  },
};
