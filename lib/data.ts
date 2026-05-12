export type Job = {
  location: string;
  salary: string;
  sector: string;
  description: string;
};

export type Recruiter = {
  title: string;
  email: string;
  bio: string;
};

export const JOB_SLUGS: Record<string, string> = {
  "Senior Project Manager": "project-manager",
  "Quantity Surveyor": "quantity-surveyor",
  "Civil Engineer": "civil-engineer",
  "Contracts Manager": "contracts-manager",
  "Design Manager": "design-manager",
  Estimator: "estimator",
  "Site Foreman": "foreman",
  "Health & Safety Manager": "health-and-safety",
  Planner: "planner",
  Buyer: "buyer",
  "Technical Coordinator": "technical-coordinator",
  "Consultant (QS)": "consultant",
};

export const JOB_DATA: Record<string, Job> = {
  "Senior Project Manager": {
    location: "Central London",
    salary: "£75,000–£90,000",
    sector: "Main Contractor",
    description:
      "Lead complex commercial builds for a Tier 1 main contractor delivering landmark projects across the capital. Ideal for a PM with 8+ years experience and a track record on schemes above £20m.",
  },
  "Quantity Surveyor": {
    location: "Hertfordshire",
    salary: "£55,000–£70,000",
    sector: "Residential Development",
    description:
      "Join a well-regarded residential developer managing cost on a pipeline of new-build schemes across the Home Counties. Strong commercial team and clear progression path.",
  },
  "Civil Engineer": {
    location: "West Sussex",
    salary: "£50,000–£65,000",
    sector: "Civil Engineering",
    description:
      "Site-based civil engineering role on a major infrastructure project with a leading civils contractor. Groundworks, drainage, and structures experience beneficial.",
  },
  "Contracts Manager": {
    location: "South London",
    salary: "£70,000–£85,000",
    sector: "Fit Out & Refurbishment",
    description:
      "Oversee multiple live fit out schemes simultaneously for a specialist contractor with a strong pipeline of commercial refurbishment work across South and Central London.",
  },
  "Design Manager": {
    location: "East London",
    salary: "£65,000–£80,000",
    sector: "Main Contractor",
    description:
      "Coordinate design across all disciplines on a large mixed-use development in East London. You'll work closely with architects, engineers, and the project team from RIBA Stage 3 through to completion.",
  },
  Estimator: {
    location: "Birmingham",
    salary: "£50,000–£60,000",
    sector: "Specialist Contractor",
    description:
      "Prepare detailed tenders for a specialist M&E contractor winning work across the Midlands and nationally. Strong opportunity for someone looking to step into a senior estimating position.",
  },
  "Site Foreman": {
    location: "Surrey",
    salary: "£45,000–£55,000",
    sector: "Main Contractor",
    description:
      "Day-to-day site supervision on a residential-led scheme in Surrey with a well-established regional contractor. Stable pipeline of work and a collaborative site team.",
  },
  "Health & Safety Manager": {
    location: "London",
    salary: "£55,000–£65,000",
    sector: "Consultancy",
    description:
      "Provide CDM and H&S advisory services across a diverse portfolio of construction projects for a growing consultancy. NEBOSH qualified candidates strongly preferred.",
  },
  Planner: {
    location: "Oxford",
    salary: "£60,000–£75,000",
    sector: "Civil Engineering",
    description:
      "Develop and maintain programmes for a civils contractor delivering utilities and highways schemes across the South East. Primavera P6 or Asta experience required.",
  },
  Buyer: {
    location: "West London",
    salary: "£45,000–£58,000",
    sector: "Residential Development",
    description:
      "Manage procurement of materials and subcontractors for a residential developer with an active build programme in West London and the surrounding areas.",
  },
  "Technical Coordinator": {
    location: "Kent",
    salary: "£48,000–£62,000",
    sector: "Fit Out & Refurbishment",
    description:
      "Coordinate technical information packages and manage RFI processes on high-spec commercial fit out projects in Kent and South East London.",
  },
  "Consultant (QS)": {
    location: "City of London",
    salary: "£65,000–£85,000",
    sector: "Consultancy",
    description:
      "PQS role within a respected cost consultancy advising developer and investor clients on schemes across the City and wider London market. APC support available.",
  },
};

export const RECRUITERS: Record<string, Recruiter> = {
  "James Hartley": {
    title: "Senior Consultant – Project & Contracts Management",
    email: "james.hartley@cityscapeltd.com",
    bio: "James has 8 years placing project and contracts managers across London's top main contractors. He has an exceptional network across Tier 1 and Tier 2 build environments and a strong track record of making moves that genuinely advance careers. He'll cut straight to the opportunities worth your time.",
  },
  "Sophie Renshaw": {
    title: "Senior Consultant – Cost & Commercial",
    email: "sophie.renshaw@cityscapeltd.com",
    bio: "Sophie specialises in commercial and cost management roles, with 7 years building relationships across London's leading QS practices and developer teams. She understands what good looks like at every level and will help you find the right balance of project, culture, and package.",
  },
  "Marcus Webb": {
    title: "Consultant – Civil & Infrastructure",
    email: "marcus.webb@cityscapeltd.com",
    bio: "Marcus focuses exclusively on civil engineering and infrastructure, working with contractor and consultancy clients across the UK. With a background in civil engineering himself, he understands the work — not just the job titles — and will match you with projects worth being proud of.",
  },
  "Priya Anand": {
    title: "Consultant – Design, Technical & Fit Out",
    email: "priya.anand@cityscapeltd.com",
    bio: "Priya specialises in placing design managers, technical coordinators, and fit out professionals with some of London's most respected refurbishment and residential developers. She takes time to understand your ambitions properly before she picks up the phone to any client.",
  },
};

export type CandidateData = {
  name?: string;
  email?: string;
  phone?: string;
  currentRole?: string;
  employer?: string;
  specialism?: string;
  sector?: string;
  yearsExperience?: number;
  employmentType?: string;
  locationPreference?: string;
  noticePeriod?: string;
  currentSalary?: string;
  targetSalary?: string;
  reasonForLooking?: string;
  aspirations?: string;
  cvFilename?: string;
  recruiterMatch?: string;
  jobMatches?: string[];
};
