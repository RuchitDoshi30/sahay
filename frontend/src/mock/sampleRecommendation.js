export const SAMPLE_SCHEMES = [
    {
        id: 'pm-ajay',
        name: 'Pradhan Mantri Anusuchit Jaati Abhyuday Yojana (PM-AJAY)',
        category: 'Business',
        categoryLabel: 'Business & Entrepreneurship',
        subsidyPercent: 50,
        maxLoanAmount: 5000000,
        minLoanAmount: 50000,
        subsidyAmountText: 'Up to ₹50,000 direct subsidy',
        loanAmountText: '₹50,000 - ₹50 Lakhs',
        matchScore: 95,
        isTopMatch: true,
        summary: 'Comprehensive scheme supporting income generation, skill development, and infrastructure for SC beneficiaries.',
        keyBenefits: [
            'Up to 50% subsidy support for low-income beneficiaries',
            'Direct grant assistance for income-generating micro-projects',
            'Skill training & capacity building included',
            'Simplified loan processing via state channelizing agencies'
        ],
        eligibilityCriteria: [
            'Belong to Scheduled Caste (SC) category',
            'Annual family income under ₹3,00,000',
            'Age between 18 and 60 years',
            'No default history with financial institutions'
        ],
        suitableActivities: ['dairy', 'small_business', 'agriculture', 'service'],
        partnerCount: 14
    },
    {
        id: 'standup-india',
        name: 'Stand-Up India Scheme',
        category: 'Business',
        categoryLabel: 'Enterprise & Industry',
        subsidyPercent: 25,
        maxLoanAmount: 10000000,
        minLoanAmount: 1000000,
        subsidyAmountText: 'Margin money assistance up to 25%',
        loanAmountText: '₹10 Lakhs - ₹1 Crore',
        matchScore: 90,
        isTopMatch: false,
        summary: 'Facilitates bank loans between ₹10 Lakhs and ₹1 Crore to SC/ST or Woman borrowers for setting up a greenfield enterprise.',
        keyBenefits: [
            'Collateral-free loans via Credit Guarantee Scheme (CGSSI)',
            'Margin money support combined with state schemes',
            'Handholding support through StandUp India Portal',
            'Repayment tenure up to 7 years with 18 months moratorium'
        ],
        eligibilityCriteria: [
            'SC/ST and/or Woman entrepreneur',
            'Must be a greenfield project (first-time venture)',
            'Minimum 51% shareholding by SC/ST/Woman if non-individual',
            'Borrower should not be in default to any bank'
        ],
        suitableActivities: ['small_business', 'service', 'dairy', 'other'],
        partnerCount: 22
    },
    {
        id: 'top-class-edu',
        name: 'Top Class Education Scheme for SC Students',
        category: 'Education',
        categoryLabel: 'Higher Education',
        subsidyPercent: 100,
        maxLoanAmount: 200000,
        minLoanAmount: 50000,
        subsidyAmountText: '100% Full Tuition Fee Waiver',
        loanAmountText: 'Up to ₹2 Lakhs / year + Stipend',
        matchScore: 88,
        isTopMatch: false,
        summary: 'Full financial support for SC students securing admission in notified premier institutions (IITs, IIMs, NITs, AIIMS).',
        keyBenefits: [
            'Full tuition fee and non-refundable charges covered',
            'Living allowance of ₹3,000 per month',
            'One-time grant of ₹86,000 for computer/laptop & books',
            'Direct Benefit Transfer (DBT) into student account'
        ],
        eligibilityCriteria: [
            'SC category student admitted to notified institutions',
            'Total annual family income from all sources ≤ ₹8,00,000',
            'Only one child per family eligible for full support',
            'Maintaining minimum academic performance'
        ],
        suitableActivities: ['other'],
        partnerCount: 8
    },
    {
        id: 'nsfdc-self-emp',
        name: 'NSFDC Self Employment Scheme (Term Loan)',
        category: 'Small Business',
        categoryLabel: 'Self Employment & Micro Enterprises',
        subsidyPercent: 30,
        maxLoanAmount: 1500000,
        minLoanAmount: 100000,
        subsidyAmountText: 'Up to 30% capital subsidy',
        loanAmountText: 'Up to ₹15 Lakhs @ 6% interest',
        matchScore: 85,
        isTopMatch: false,
        summary: 'Concessional financial assistance for SC beneficiaries to set up self-employment ventures in agriculture, service, or retail.',
        keyBenefits: [
            'Highly concessional interest rate of 6% per annum',
            'Promoter contribution only 5% of total project cost',
            'Flexible repayment schedule up to 10 years',
            'Includes working capital support'
        ],
        eligibilityCriteria: [
            'SC individual living below double the poverty line',
            'Annual income under ₹3,00,000 (rural) / ₹3,00,000 (urban)',
            'Viable project plan in eligible sectors',
            'Resident of target State/UT'
        ],
        suitableActivities: ['dairy', 'agriculture', 'small_business', 'service'],
        partnerCount: 18
    },
    {
        id: 'vcf-sc',
        name: 'Venture Capital Fund for Scheduled Castes (VCF-SC)',
        category: 'Business',
        categoryLabel: 'Startup & Venture Capital',
        subsidyPercent: 20,
        maxLoanAmount: 150000000,
        minLoanAmount: 2000000,
        subsidyAmountText: 'Patient financial assistance / Equity',
        loanAmountText: '₹20 Lakhs - ₹15 Crores',
        matchScore: 80,
        isTopMatch: false,
        summary: 'First-of-its-kind venture capital fund offering equity & concessional debt to SC entrepreneurs driving innovation and growth.',
        keyBenefits: [
            'Financial support up to ₹15 Crores for scalable ventures',
            'Concessional interest rate (8% p.a. for debt component)',
            'Long-term patient capital with flexible exit options',
            'Business mentorship and incubation support'
        ],
        eligibilityCriteria: [
            'Company/LLP with minimum 51% SC ownership for 6+ months',
            'SC management control in key operational roles',
            'Technology or innovation-driven business model',
            'Valid SC caste certificate of key promoters'
        ],
        suitableActivities: ['small_business', 'service', 'other'],
        partnerCount: 12
    }
]
