export interface DomainProfile {
  id: string;
  name: string;
  industry: string;
  description: string;
  keywords: string[];
  coreEntities: { name: string; description: string; typicalFields: string[]; validations?: string[] }[];
  workflows: { name: string; steps: string[]; triggers?: string[] }[];
  businessRules: string[];
  terminology: Record<string, string>;
  regulations?: string[];
  integrations?: string[];
  metrics: string[];
}

export const domainProfiles: DomainProfile[] = [
  {
    id: "healthcare-general",
    name: "General Healthcare",
    industry: "Healthcare",
    description: "Comprehensive healthcare management system for hospitals and clinics covering patient records, appointments, diagnoses, prescriptions, and billing operations.",
    keywords: ["patient", "doctor", "appointment", "diagnosis", "prescription", "medical record", "hospital", "clinic", "insurance", "billing", "EHR", "EMR", "treatment", "lab results", "vitals"],
    coreEntities: [
      {
        name: "Patient",
        description: "Individual receiving medical care and treatment",
        typicalFields: ["patientId", "firstName", "lastName", "dateOfBirth", "gender", "bloodType", "insuranceId", "allergies"],
        validations: ["dateOfBirth must be in the past", "insuranceId must match provider format", "bloodType must be valid ABO-Rh type"]
      },
      {
        name: "Physician",
        description: "Licensed medical doctor providing patient care",
        typicalFields: ["physicianId", "fullName", "specialization", "licenseNumber", "department", "contactInfo", "schedule"],
        validations: ["licenseNumber must be verified with medical board", "specialization must be from approved list"]
      },
      {
        name: "Appointment",
        description: "Scheduled visit between patient and physician",
        typicalFields: ["appointmentId", "patientId", "physicianId", "dateTime", "duration", "type", "status", "notes"],
        validations: ["dateTime must be in the future", "duration must be between 15 and 120 minutes", "no overlapping appointments for same physician"]
      },
      {
        name: "MedicalRecord",
        description: "Patient health history and clinical documentation",
        typicalFields: ["recordId", "patientId", "physicianId", "date", "chiefComplaint", "diagnosis", "treatmentPlan"],
        validations: ["diagnosis must use ICD-10 codes", "record must be signed by attending physician"]
      },
      {
        name: "Prescription",
        description: "Medication order issued by a physician",
        typicalFields: ["prescriptionId", "patientId", "physicianId", "medication", "dosage", "frequency", "duration", "refills"],
        validations: ["medication must be checked against patient allergies", "dosage must be within therapeutic range", "controlled substances require DEA number"]
      },
      {
        name: "LabOrder",
        description: "Request for laboratory tests and diagnostics",
        typicalFields: ["orderId", "patientId", "physicianId", "tests", "priority", "status", "results"],
        validations: ["ordering physician must have active privileges", "stat orders must be processed within 1 hour"]
      },
      {
        name: "InsuranceClaim",
        description: "Billing claim submitted to insurance provider",
        typicalFields: ["claimId", "patientId", "providerId", "serviceDate", "procedureCodes", "diagnosisCodes", "amount", "status"],
        validations: ["procedureCodes must be valid CPT codes", "claim must be filed within timely filing limit"]
      },
      {
        name: "Department",
        description: "Hospital or clinic organizational unit",
        typicalFields: ["departmentId", "name", "head", "location", "phoneExtension", "operatingHours"]
      }
    ],
    workflows: [
      {
        name: "Patient Registration",
        steps: ["Collect patient demographics", "Verify insurance eligibility", "Assign medical record number", "Create patient chart", "Schedule initial appointment", "Send welcome packet"],
        triggers: ["New patient arrival", "Online registration form submission"]
      },
      {
        name: "Clinical Encounter",
        steps: ["Check in patient", "Record vitals", "Physician examination", "Document findings and diagnosis", "Create treatment plan", "Order labs or prescriptions", "Schedule follow-up"],
        triggers: ["Patient check-in at front desk", "Appointment time reached"]
      },
      {
        name: "Insurance Claims Processing",
        steps: ["Generate superbill from encounter", "Code procedures and diagnoses", "Submit claim to payer", "Track claim status", "Process remittance", "Handle denials and appeals", "Post payment"],
        triggers: ["Encounter completion", "Batch submission schedule"]
      },
      {
        name: "Lab Results Management",
        steps: ["Receive lab order", "Collect specimen", "Process and analyze", "Review results", "Notify physician", "Update patient record", "Alert patient if critical"],
        triggers: ["New lab order created", "Results received from lab"]
      },
      {
        name: "Discharge Planning",
        steps: ["Physician discharge order", "Reconcile medications", "Prepare discharge summary", "Patient education", "Schedule follow-up appointments", "Process final billing"],
        triggers: ["Physician discharge order", "Patient meets discharge criteria"]
      }
    ],
    businessRules: [
      "All patient data must be encrypted at rest and in transit per HIPAA requirements",
      "Prescriptions for controlled substances require two-factor authentication",
      "Lab results flagged as critical must trigger immediate physician notification",
      "Insurance eligibility must be verified before non-emergency procedures",
      "Patient consent forms must be signed before any invasive procedure",
      "Medical records must be retained for a minimum of 7 years",
      "Appointment no-shows after 3 occurrences trigger patient notification",
      "Referrals require authorization from primary care physician"
    ],
    terminology: {
      "EHR": "Electronic Health Record - digital version of a patient's paper chart",
      "EMR": "Electronic Medical Record - digital record within a single practice",
      "ICD-10": "International Classification of Diseases, 10th revision - diagnostic coding system",
      "CPT": "Current Procedural Terminology - medical procedure coding system",
      "HIPAA": "Health Insurance Portability and Accountability Act - privacy regulation",
      "PHI": "Protected Health Information - individually identifiable health data",
      "Chief Complaint": "Primary reason the patient is seeking medical attention",
      "Differential Diagnosis": "List of possible conditions matching patient symptoms",
      "Formulary": "List of approved medications covered by insurance plan",
      "Prior Authorization": "Approval required from insurer before certain procedures",
      "Superbill": "Itemized form listing services provided during a visit",
      "Triage": "Process of determining priority of patient treatment based on severity",
      "Vitals": "Basic measurements including blood pressure, heart rate, temperature, respiration rate",
      "Attending Physician": "Doctor with primary responsibility for a patient's care"
    },
    regulations: ["HIPAA Privacy Rule", "HIPAA Security Rule", "HITECH Act", "21st Century Cures Act", "Stark Law", "Anti-Kickback Statute", "EMTALA"],
    integrations: ["HL7 FHIR", "Epic EHR", "Cerner", "Lab Information Systems", "Pharmacy Systems", "Insurance Clearinghouses", "Telehealth Platforms"],
    metrics: ["Patient Wait Time", "Appointment No-Show Rate", "Average Length of Stay", "Patient Satisfaction Score", "Claims Denial Rate", "Bed Occupancy Rate", "Readmission Rate"]
  },
  {
    id: "healthcare-dental",
    name: "Dental Practice",
    industry: "Healthcare",
    description: "Dental practice management covering patient scheduling, treatment planning, dental charting, imaging, and insurance coordination for dental offices.",
    keywords: ["dental", "dentist", "hygienist", "tooth", "crown", "filling", "orthodontics", "periodontal", "x-ray", "cleaning", "implant", "root canal", "oral surgery", "dental insurance"],
    coreEntities: [
      {
        name: "Patient",
        description: "Individual receiving dental care",
        typicalFields: ["patientId", "fullName", "dateOfBirth", "dentalInsurance", "medicalHistory", "allergies", "lastVisitDate", "preferredHygienist"],
        validations: ["medical history must be updated annually", "insurance must be verified before each visit"]
      },
      {
        name: "DentalChart",
        description: "Visual record of all teeth and their conditions",
        typicalFields: ["chartId", "patientId", "toothNumber", "condition", "surfaces", "existingRestorations", "notes"],
        validations: ["tooth numbers must follow universal numbering system", "conditions must use standardized dental codes"]
      },
      {
        name: "TreatmentPlan",
        description: "Proposed dental procedures and sequencing",
        typicalFields: ["planId", "patientId", "procedures", "priority", "estimatedCost", "insuranceCoverage", "status", "validUntil"],
        validations: ["plan must be signed by patient", "insurance pre-authorization required for major procedures"]
      },
      {
        name: "Appointment",
        description: "Scheduled dental visit",
        typicalFields: ["appointmentId", "patientId", "providerId", "dateTime", "procedureType", "duration", "operatory", "status"],
        validations: ["operatory must be available", "provider schedule must not conflict"]
      },
      {
        name: "Procedure",
        description: "Specific dental treatment performed",
        typicalFields: ["procedureId", "patientId", "providerId", "cdtCode", "toothNumber", "surface", "fee", "datePerformed"],
        validations: ["CDT code must be valid", "fee must match fee schedule"]
      },
      {
        name: "DentalImage",
        description: "Radiographic or photographic dental image",
        typicalFields: ["imageId", "patientId", "type", "dateCapture", "toothRegion", "findings", "filePath"],
        validations: ["radiation exposure must be logged", "images must be stored in DICOM format"]
      },
      {
        name: "InsurancePlan",
        description: "Patient dental insurance coverage details",
        typicalFields: ["planId", "patientId", "carrier", "groupNumber", "subscriberId", "coverageLevel", "annualMaximum", "remainingBenefit"]
      }
    ],
    workflows: [
      {
        name: "New Patient Intake",
        steps: ["Complete patient registration form", "Collect medical and dental history", "Verify dental insurance", "Take initial x-rays", "Perform comprehensive exam", "Create treatment plan", "Schedule next appointment"],
        triggers: ["New patient call", "Online booking"]
      },
      {
        name: "Hygiene Appointment",
        steps: ["Review patient history and x-rays", "Perform periodontal assessment", "Complete prophylaxis cleaning", "Apply fluoride treatment", "Dentist exam", "Update dental chart", "Schedule next recall"],
        triggers: ["Recall reminder", "Patient scheduled appointment"]
      },
      {
        name: "Restorative Treatment",
        steps: ["Review treatment plan", "Administer anesthesia", "Prepare tooth", "Place restoration", "Check occlusion", "Post-operative instructions", "Submit insurance claim"],
        triggers: ["Treatment plan approval", "Scheduled procedure"]
      },
      {
        name: "Insurance Claims",
        steps: ["Generate claim from completed procedures", "Attach required documentation", "Submit claim electronically", "Track claim status", "Post insurance payment", "Bill patient for remaining balance"],
        triggers: ["Procedure completion", "Daily batch processing"]
      }
    ],
    businessRules: [
      "Prophylaxis cleanings covered twice per calendar year by most insurance plans",
      "Panoramic x-rays taken every 3-5 years; bitewings annually",
      "Treatment plans exceeding $500 require insurance pre-authorization",
      "Patients under 18 require guardian consent for treatment",
      "Nitrous oxide administration requires signed consent form",
      "Emergency patients must be seen within same business day",
      "Recall appointments scheduled every 6 months unless periodontal condition requires more frequent visits"
    ],
    terminology: {
      "CDT": "Code on Dental Procedures and Nomenclature - dental procedure coding system",
      "Prophylaxis": "Professional dental cleaning to remove plaque and tartar",
      "Periodontal": "Relating to the structures supporting the teeth including gums and bone",
      "Occlusion": "The way upper and lower teeth come together when biting",
      "Bitewing": "Type of dental x-ray showing upper and lower teeth crowns",
      "Panoramic": "Full mouth x-ray showing all teeth and jaw structures",
      "Recall": "Scheduled periodic checkup and cleaning appointment",
      "Operatory": "Treatment room equipped for dental procedures",
      "Composite": "Tooth-colored filling material",
      "Crown": "Cap placed over a damaged tooth to restore shape and function",
      "Endodontic": "Relating to the interior of the tooth including root canal therapy",
      "Prosthodontic": "Relating to replacement of missing teeth with prostheses"
    },
    regulations: ["OSHA Bloodborne Pathogens Standard", "HIPAA", "State Dental Practice Act", "Radiation Safety Regulations", "CDC Infection Control Guidelines"],
    integrations: ["Dental Imaging Systems", "Practice Management Software", "Insurance Clearinghouses", "Patient Communication Platforms", "Digital Impression Systems"],
    metrics: ["Production per Provider", "Collection Rate", "Hygiene Reappointment Rate", "Case Acceptance Rate", "New Patient Count", "Cancellation Rate"]
  },
  {
    id: "healthcare-veterinary",
    name: "Veterinary Practice",
    industry: "Healthcare",
    description: "Veterinary clinic management system for animal healthcare including patient records, vaccination schedules, surgical procedures, and client communications.",
    keywords: ["veterinary", "animal", "pet", "vaccination", "spay", "neuter", "microchip", "kennel", "boarding", "grooming", "emergency vet", "wellness exam", "parasite", "breed"],
    coreEntities: [
      {
        name: "AnimalPatient",
        description: "Animal receiving veterinary care",
        typicalFields: ["patientId", "name", "species", "breed", "dateOfBirth", "weight", "color", "microchipNumber"],
        validations: ["species must be from supported list", "weight must be positive number"]
      },
      {
        name: "Client",
        description: "Pet owner or guardian responsible for animal",
        typicalFields: ["clientId", "fullName", "phone", "email", "address", "pets", "paymentMethod", "communicationPreference"],
        validations: ["at least one contact method required", "address required for house call services"]
      },
      {
        name: "MedicalRecord",
        description: "Clinical documentation for animal patient",
        typicalFields: ["recordId", "patientId", "visitDate", "chiefComplaint", "examination", "diagnosis", "treatment", "weight"],
        validations: ["must be signed by attending veterinarian", "weight must be recorded at each visit"]
      },
      {
        name: "Vaccination",
        description: "Immunization administered to animal patient",
        typicalFields: ["vaccinationId", "patientId", "vaccine", "dateAdministered", "lotNumber", "expirationDate", "nextDueDate"],
        validations: ["lot number must be recorded", "rabies vaccine must include certificate number"]
      },
      {
        name: "Prescription",
        description: "Medication prescribed for animal patient",
        typicalFields: ["prescriptionId", "patientId", "medication", "dosage", "frequency", "duration", "prescribingVet"],
        validations: ["dosage calculated by animal weight", "controlled substances require DEA authorization"]
      },
      {
        name: "Surgery",
        description: "Surgical procedure performed on animal",
        typicalFields: ["surgeryId", "patientId", "procedure", "surgeon", "anesthesiaType", "duration", "complications", "postOpInstructions"],
        validations: ["pre-surgical bloodwork required for animals over 7 years", "anesthesia consent form required"]
      },
      {
        name: "Boarding",
        description: "Pet boarding and daycare reservation",
        typicalFields: ["reservationId", "patientId", "checkIn", "checkOut", "kennelSize", "feedingInstructions", "medications", "specialNeeds"]
      }
    ],
    workflows: [
      {
        name: "Wellness Exam",
        steps: ["Weigh patient", "Record vitals", "Physical examination", "Review vaccination status", "Administer due vaccines", "Recommend preventatives", "Create wellness plan", "Schedule next visit"],
        triggers: ["Annual reminder", "Client appointment request"]
      },
      {
        name: "Surgical Procedure",
        steps: ["Pre-surgical consultation", "Pre-anesthetic bloodwork", "NPO instructions to owner", "Admit patient", "Administer anesthesia", "Perform surgery", "Monitor recovery", "Discharge with instructions"],
        triggers: ["Scheduled surgery date", "Emergency presentation"]
      },
      {
        name: "Emergency Triage",
        steps: ["Assess patient condition", "Stabilize critical patients", "Contact owner", "Diagnostic workup", "Initiate treatment", "Monitor patient", "Transfer or discharge"],
        triggers: ["Emergency walk-in", "After-hours call"]
      },
      {
        name: "Prescription Refill",
        steps: ["Receive refill request", "Verify patient record", "Check refill eligibility", "Veterinarian approval", "Dispense medication", "Notify client"],
        triggers: ["Client call", "Online refill request", "Auto-refill schedule"]
      }
    ],
    businessRules: [
      "Rabies vaccination is legally required and must include state certificate",
      "Pre-anesthetic bloodwork required for all patients over 7 years before sedation",
      "Controlled substance prescriptions require veterinarian-client-patient relationship",
      "Boarding animals must have current vaccinations including Bordetella",
      "Emergency cases take priority over scheduled appointments",
      "Prescription food sales require active patient relationship within 12 months",
      "Euthanasia requires signed consent from legal owner"
    ],
    terminology: {
      "VCPR": "Veterinarian-Client-Patient Relationship - legal requirement for prescribing",
      "Spay": "Ovariohysterectomy - surgical removal of ovaries and uterus",
      "Neuter": "Castration - surgical removal of testicles",
      "Bordetella": "Kennel cough vaccine",
      "Titer": "Blood test measuring antibody levels to determine immunity",
      "Prophylaxis": "Preventive treatment such as dental cleaning or parasite prevention",
      "Microchip": "Implanted identification device with unique number",
      "SOAP": "Subjective, Objective, Assessment, Plan - medical record format",
      "NPO": "Nothing by mouth - fasting instructions before anesthesia",
      "BCS": "Body Condition Score - standardized assessment of animal weight",
      "HBC": "Hit By Car - common emergency presentation abbreviation",
      "DHLPP": "Distemper, Hepatitis, Leptospirosis, Parainfluenza, Parvovirus combination vaccine"
    },
    regulations: ["USDA Animal Welfare Act", "DEA Controlled Substances Act", "State Veterinary Practice Act", "OSHA Workplace Safety", "State Rabies Laws"],
    integrations: ["Veterinary Lab Systems", "IDEXX Diagnostics", "Pharmacy Systems", "Microchip Registries", "Pet Insurance Portals"],
    metrics: ["Average Transaction Value", "Client Retention Rate", "New Client Acquisition", "Vaccination Compliance Rate", "Surgical Complication Rate", "Revenue per Veterinarian"]
  },
  {
    id: "healthcare-pharmacy",
    name: "Pharmacy Management",
    industry: "Healthcare",
    description: "Pharmacy operations management covering prescription processing, drug inventory, insurance adjudication, patient counseling, and regulatory compliance.",
    keywords: ["pharmacy", "prescription", "medication", "drug", "dispense", "formulary", "compounding", "generic", "brand", "refill", "pharmacist", "NDC", "DEA", "controlled substance"],
    coreEntities: [
      {
        name: "Prescription",
        description: "Medication order from authorized prescriber",
        typicalFields: ["rxNumber", "patientId", "prescriberId", "medication", "strength", "quantity", "directions", "refillsRemaining"],
        validations: ["prescriber must have active license", "controlled substances require DEA number", "quantity must not exceed 90-day supply"]
      },
      {
        name: "Medication",
        description: "Drug product in pharmacy inventory",
        typicalFields: ["ndcNumber", "brandName", "genericName", "strength", "dosageForm", "manufacturer", "unitPrice", "schedule"],
        validations: ["NDC must be valid 11-digit format", "schedule must be 2-5 or non-controlled"]
      },
      {
        name: "Patient",
        description: "Individual for whom prescriptions are filled",
        typicalFields: ["patientId", "fullName", "dateOfBirth", "allergies", "insurancePlan", "medications", "address", "phone"],
        validations: ["allergy list must be reviewed before dispensing", "date of birth required for identity verification"]
      },
      {
        name: "InsuranceClaim",
        description: "Third-party payer adjudication record",
        typicalFields: ["claimId", "rxNumber", "binNumber", "pcnNumber", "groupId", "copay", "amountPaid", "rejectionCode"],
        validations: ["BIN must be valid 6-digit number", "rejection codes must be resolved before dispensing"]
      },
      {
        name: "Inventory",
        description: "Drug stock levels and ordering information",
        typicalFields: ["itemId", "ndcNumber", "quantityOnHand", "reorderPoint", "wholesaler", "lastOrderDate", "expirationDate", "lotNumber"],
        validations: ["expired medications must be quarantined", "controlled substances require perpetual inventory"]
      },
      {
        name: "Prescriber",
        description: "Authorized healthcare provider writing prescriptions",
        typicalFields: ["prescriberId", "fullName", "deaNumber", "npiNumber", "licenseState", "specialty", "phone"],
        validations: ["DEA number must pass checksum validation", "NPI must be valid 10-digit format"]
      }
    ],
    workflows: [
      {
        name: "Prescription Processing",
        steps: ["Receive prescription", "Enter into system", "Drug utilization review", "Insurance adjudication", "Fill prescription", "Pharmacist verification", "Patient pickup and counseling"],
        triggers: ["E-prescription received", "Written prescription drop-off", "Phone call from prescriber"]
      },
      {
        name: "Refill Processing",
        steps: ["Receive refill request", "Verify refills remaining", "Check for drug interactions", "Adjudicate insurance", "Fill prescription", "Pharmacist check", "Notify patient"],
        triggers: ["Patient request", "Auto-refill schedule", "IVR system request"]
      },
      {
        name: "Inventory Management",
        steps: ["Review stock levels", "Generate purchase order", "Receive shipment", "Verify against invoice", "Shelve medications", "Update inventory records", "Process returns for expired items"],
        triggers: ["Reorder point reached", "Daily inventory review", "Wholesaler delivery"]
      },
      {
        name: "Controlled Substance Handling",
        steps: ["Verify prescription authenticity", "Check PDMP database", "Count inventory", "Dispense medication", "Document in DEA log", "Perform biennial inventory"],
        triggers: ["Controlled substance prescription received", "DEA audit scheduled"]
      }
    ],
    businessRules: [
      "All prescriptions must undergo drug utilization review before dispensing",
      "Controlled substance prescriptions cannot be transferred more than once",
      "Schedule II prescriptions cannot be refilled and expire after 90 days",
      "Pharmacist must offer counseling on all new prescriptions",
      "Expired medications must be removed from shelves and quarantined for disposal",
      "Immunizations can only be administered by certified pharmacists",
      "Generic substitution is automatic unless prescriber indicates DAW",
      "Pseudoephedrine sales require ID verification and logbook entry"
    ],
    terminology: {
      "NDC": "National Drug Code - unique 11-digit identifier for drug products",
      "DAW": "Dispense As Written - prescriber instruction to use brand name only",
      "DUR": "Drug Utilization Review - safety check for interactions and allergies",
      "PDMP": "Prescription Drug Monitoring Program - state database tracking controlled substances",
      "BIN": "Bank Identification Number - identifies insurance processor for claims",
      "PCN": "Processor Control Number - routing number for insurance claims",
      "NPI": "National Provider Identifier - unique 10-digit provider number",
      "Adjudication": "Process of submitting and resolving insurance claims",
      "Sig": "Directions for medication use written on prescription",
      "Compounding": "Custom preparation of medication from raw ingredients",
      "Formulary": "List of medications covered by an insurance plan",
      "Prior Authorization": "Insurance approval required before coverage of certain medications",
      "Therapeutic Substitution": "Replacing prescribed drug with therapeutically equivalent alternative"
    },
    regulations: ["DEA Controlled Substances Act", "FDA Drug Safety", "State Board of Pharmacy Regulations", "USP 795/797/800 Compounding Standards", "HIPAA", "Combat Methamphetamine Epidemic Act"],
    integrations: ["E-Prescribing Networks (Surescripts)", "Insurance Clearinghouses", "Drug Interaction Databases", "PDMP Databases", "Wholesaler Ordering Systems", "Prescription Label Printers"],
    metrics: ["Prescription Volume", "Fill Rate", "Average Wait Time", "Insurance Rejection Rate", "Inventory Turnover", "Counseling Compliance Rate", "Medication Error Rate"]
  },
  {
    id: "finance-banking",
    name: "Banking",
    industry: "Finance",
    description: "Core banking system managing customer accounts, transactions, loans, deposits, and regulatory compliance for retail and commercial banking operations.",
    keywords: ["bank", "account", "deposit", "withdrawal", "loan", "interest", "checking", "savings", "wire transfer", "ACH", "mortgage", "credit", "debit", "branch", "ATM"],
    coreEntities: [
      {
        name: "Customer",
        description: "Individual or business holding bank accounts",
        typicalFields: ["customerId", "fullName", "ssn", "dateOfBirth", "address", "phone", "email", "kycStatus"],
        validations: ["SSN must pass format validation", "KYC verification required before account opening", "address must be verified"]
      },
      {
        name: "Account",
        description: "Financial account holding customer funds",
        typicalFields: ["accountNumber", "customerId", "accountType", "balance", "interestRate", "openDate", "status"],
        validations: ["balance cannot go below overdraft limit", "interest rate must match product terms", "dormant after 12 months inactivity"]
      },
      {
        name: "Transaction",
        description: "Financial movement of funds",
        typicalFields: ["transactionId", "accountId", "type", "amount", "dateTime", "description", "referenceNumber", "status"],
        validations: ["amount must be positive", "insufficient funds check for debits", "daily transaction limits enforced"]
      },
      {
        name: "Loan",
        description: "Credit facility extended to customer",
        typicalFields: ["loanId", "customerId", "loanType", "principal", "interestRate", "term", "monthlyPayment", "remainingBalance"],
        validations: ["credit score must meet minimum threshold", "debt-to-income ratio must not exceed limits"]
      },
      {
        name: "Transfer",
        description: "Movement of funds between accounts",
        typicalFields: ["transferId", "fromAccount", "toAccount", "amount", "type", "scheduledDate", "status", "memo"],
        validations: ["source account must have sufficient funds", "international transfers require SWIFT/BIC codes"]
      },
      {
        name: "Branch",
        description: "Physical bank location",
        typicalFields: ["branchId", "name", "address", "phone", "manager", "operatingHours", "services"]
      }
    ],
    workflows: [
      {
        name: "Account Opening",
        steps: ["Customer identity verification", "KYC/AML screening", "Select account product", "Initial deposit", "Issue debit card", "Set up online banking", "Welcome communication"],
        triggers: ["Customer application", "Branch walk-in", "Online application"]
      },
      {
        name: "Loan Origination",
        steps: ["Loan application submission", "Credit check and scoring", "Income and employment verification", "Collateral appraisal", "Underwriting review", "Loan approval or denial", "Document signing", "Fund disbursement"],
        triggers: ["Customer application", "Pre-qualification request"]
      },
      {
        name: "Wire Transfer Processing",
        steps: ["Initiate transfer request", "Verify sender identity", "OFAC screening", "Debit sender account", "Route through correspondent bank", "Credit beneficiary account", "Send confirmation"],
        triggers: ["Customer request", "Scheduled transfer"]
      },
      {
        name: "Fraud Detection",
        steps: ["Monitor transaction patterns", "Flag suspicious activity", "Analyst review", "Customer contact for verification", "Block or approve transaction", "File SAR if warranted", "Update fraud models"],
        triggers: ["Anomalous transaction detected", "Customer report", "Third-party alert"]
      },
      {
        name: "Account Reconciliation",
        steps: ["Pull daily transaction records", "Match internal and external records", "Identify discrepancies", "Investigate exceptions", "Make adjusting entries", "Approve reconciliation report"],
        triggers: ["End of business day", "Month-end processing"]
      }
    ],
    businessRules: [
      "All new accounts require KYC verification and OFAC screening",
      "Transactions above $10,000 require Currency Transaction Report filing",
      "Suspicious activity must be reported via SAR within 30 days",
      "Overdraft protection is opt-in per Regulation E",
      "Interest on savings accounts compounds daily and posts monthly",
      "Wire transfers after 4 PM are processed next business day",
      "Loan-to-value ratio cannot exceed 80% for conventional mortgages",
      "Dormant accounts must be escheated to state after statutory period"
    ],
    terminology: {
      "KYC": "Know Your Customer - identity verification process for new customers",
      "AML": "Anti-Money Laundering - regulations preventing illicit fund movement",
      "OFAC": "Office of Foreign Assets Control - sanctions screening requirement",
      "SAR": "Suspicious Activity Report - filed for potentially illicit transactions",
      "CTR": "Currency Transaction Report - filed for cash transactions over $10,000",
      "ACH": "Automated Clearing House - electronic funds transfer network",
      "SWIFT": "Society for Worldwide Interbank Financial Telecommunication - international transfer network",
      "LTV": "Loan-to-Value ratio - loan amount relative to collateral value",
      "APY": "Annual Percentage Yield - effective annual interest rate including compounding",
      "FDIC": "Federal Deposit Insurance Corporation - insures deposits up to $250,000",
      "Escheatment": "Transfer of unclaimed property to state custody",
      "Reg E": "Regulation E - governs electronic fund transfers and consumer protections",
      "Core Banking": "Central system processing daily banking transactions and updates"
    },
    regulations: ["Bank Secrecy Act", "Dodd-Frank Act", "Regulation E", "Regulation D", "FDIC Insurance Requirements", "Community Reinvestment Act", "OFAC Sanctions", "Truth in Lending Act"],
    integrations: ["Federal Reserve FedWire", "ACH Network", "SWIFT Network", "Credit Bureaus", "OFAC Screening Services", "Core Banking Platforms"],
    metrics: ["Net Interest Margin", "Loan Default Rate", "Customer Acquisition Cost", "Deposits Growth Rate", "Non-Performing Loan Ratio", "Cost-to-Income Ratio", "Customer Satisfaction Score"]
  },
  {
    id: "finance-insurance",
    name: "Insurance",
    industry: "Finance",
    description: "Insurance operations management covering policy administration, underwriting, claims processing, and actuarial analysis for property, casualty, life, and health insurance.",
    keywords: ["insurance", "policy", "premium", "claim", "underwriting", "actuary", "deductible", "coverage", "beneficiary", "adjuster", "risk", "renewal", "endorsement", "rider"],
    coreEntities: [
      {
        name: "Policy",
        description: "Insurance contract between insurer and policyholder",
        typicalFields: ["policyNumber", "policyholderId", "type", "effectiveDate", "expirationDate", "premium", "coverageLimit", "deductible"],
        validations: ["effective date must be current or future", "premium must be calculated by rating engine", "coverage limits must meet state minimums"]
      },
      {
        name: "Policyholder",
        description: "Individual or entity holding insurance policy",
        typicalFields: ["holderId", "fullName", "dateOfBirth", "address", "riskProfile", "claimsHistory", "creditScore", "occupation"],
        validations: ["identity must be verified", "risk profile must be assessed before binding"]
      },
      {
        name: "Claim",
        description: "Request for payment under insurance policy terms",
        typicalFields: ["claimNumber", "policyNumber", "dateOfLoss", "description", "claimAmount", "status", "adjusterId", "settlement"],
        validations: ["must be filed within policy reporting period", "loss must occur during coverage period"]
      },
      {
        name: "Underwriting",
        description: "Risk assessment and policy pricing determination",
        typicalFields: ["assessmentId", "applicationId", "riskFactors", "score", "decision", "conditions", "premiumCalculation"],
        validations: ["all risk factors must be evaluated", "adverse decisions require documentation"]
      },
      {
        name: "Agent",
        description: "Licensed insurance sales representative",
        typicalFields: ["agentId", "fullName", "licenseNumber", "licenseState", "agency", "commissionRate", "bookOfBusiness"],
        validations: ["license must be active and in-state", "appointments must be current with carrier"]
      },
      {
        name: "Endorsement",
        description: "Modification to existing insurance policy",
        typicalFields: ["endorsementId", "policyNumber", "type", "effectiveDate", "changes", "premiumAdjustment", "approvedBy"]
      }
    ],
    workflows: [
      {
        name: "Policy Issuance",
        steps: ["Receive application", "Underwriting review", "Risk assessment and scoring", "Premium calculation", "Policy approval", "Generate policy documents", "Bind coverage", "Send declarations page"],
        triggers: ["New application received", "Agent submission"]
      },
      {
        name: "Claims Processing",
        steps: ["Receive claim notification", "Assign adjuster", "Investigation and documentation", "Determine coverage", "Evaluate damages", "Negotiate settlement", "Issue payment", "Close claim"],
        triggers: ["First Notice of Loss", "Online claim filing"]
      },
      {
        name: "Policy Renewal",
        steps: ["Generate renewal quote", "Review loss history", "Recalculate premium", "Send renewal offer", "Receive acceptance or negotiation", "Issue renewal policy", "Update records"],
        triggers: ["60 days before expiration", "Policyholder request"]
      },
      {
        name: "Subrogation",
        steps: ["Identify subrogation potential", "Investigate liability", "Send demand letter", "Negotiate recovery", "Collect payment", "Reimburse insured deductible", "Close subrogation file"],
        triggers: ["Claim payment exceeds threshold", "Third-party liability identified"]
      }
    ],
    businessRules: [
      "All policies must meet state-mandated minimum coverage requirements",
      "Claims must be acknowledged within 24 hours of receipt",
      "Underwriting decisions must be documented with actuarial justification",
      "Premium increases above 15% require management approval",
      "Policies with 3 or more claims in 12 months flagged for review",
      "Agent commissions calculated based on premium volume and loss ratio",
      "Renewal offers sent minimum 45 days before expiration"
    ],
    terminology: {
      "Actuary": "Professional who analyzes risk and calculates premiums using statistics",
      "Binder": "Temporary insurance agreement providing coverage until policy is issued",
      "Declarations Page": "Summary page of policy showing coverage, limits, and premiums",
      "Deductible": "Amount policyholder must pay before insurance coverage begins",
      "Endorsement": "Amendment to an existing insurance policy",
      "FNOL": "First Notice of Loss - initial report of a claim",
      "Indemnity": "Compensation for loss or damage under policy terms",
      "Loss Ratio": "Ratio of claims paid to premiums earned",
      "Rider": "Additional provision adding or modifying coverage",
      "Subrogation": "Insurer's right to recover payment from responsible third party",
      "Underwriting": "Process of evaluating risk and determining premium",
      "Adjuster": "Professional who investigates and settles insurance claims"
    },
    regulations: ["State Insurance Codes", "NAIC Model Laws", "Unfair Claims Settlement Practices Act", "Fair Credit Reporting Act", "Gramm-Leach-Bliley Act"],
    integrations: ["Rating Engines", "Claims Management Systems", "Credit Bureau Services", "Motor Vehicle Records", "Weather Data Services", "Reinsurance Platforms"],
    metrics: ["Loss Ratio", "Combined Ratio", "Claims Frequency", "Average Claim Severity", "Policy Retention Rate", "New Business Premium", "Expense Ratio"]
  },
  {
    id: "finance-accounting",
    name: "Accounting",
    industry: "Finance",
    description: "Accounting practice management covering general ledger, accounts payable/receivable, financial reporting, tax preparation, and audit support for businesses and individuals.",
    keywords: ["accounting", "ledger", "journal entry", "accounts payable", "accounts receivable", "tax", "audit", "balance sheet", "income statement", "depreciation", "reconciliation", "GAAP", "CPA"],
    coreEntities: [
      {
        name: "Account",
        description: "Chart of accounts entry for categorizing financial transactions",
        typicalFields: ["accountNumber", "name", "type", "normalBalance", "parentAccount", "isActive", "description"],
        validations: ["account number must follow numbering convention", "type must be asset, liability, equity, revenue, or expense"]
      },
      {
        name: "JournalEntry",
        description: "Record of financial transaction with debits and credits",
        typicalFields: ["entryId", "date", "description", "lineItems", "totalDebit", "totalCredit", "postedBy", "status"],
        validations: ["total debits must equal total credits", "date must be within open fiscal period"]
      },
      {
        name: "Invoice",
        description: "Bill issued to or received from external party",
        typicalFields: ["invoiceNumber", "vendorOrClient", "date", "dueDate", "lineItems", "totalAmount", "status", "paymentTerms"],
        validations: ["due date must be after invoice date", "line items must reference valid accounts"]
      },
      {
        name: "Client",
        description: "Business or individual receiving accounting services",
        typicalFields: ["clientId", "businessName", "contactPerson", "einOrSsn", "fiscalYearEnd", "entityType", "engagementType"],
        validations: ["EIN must be valid 9-digit format", "engagement letter must be on file"]
      },
      {
        name: "TaxReturn",
        description: "Tax filing prepared for client",
        typicalFields: ["returnId", "clientId", "taxYear", "returnType", "filingStatus", "taxableIncome", "taxLiability", "filingDate", "status"],
        validations: ["filing date must meet IRS deadlines or extension", "return must be reviewed before filing"]
      },
      {
        name: "FinancialStatement",
        description: "Formal report of financial position and performance",
        typicalFields: ["statementId", "clientId", "period", "type", "data", "preparedBy", "reviewedBy", "issueDate"]
      }
    ],
    workflows: [
      {
        name: "Month-End Close",
        steps: ["Review open transactions", "Post adjusting journal entries", "Reconcile bank accounts", "Run depreciation schedules", "Review accruals", "Generate trial balance", "Prepare financial statements", "Manager review and approval"],
        triggers: ["Last business day of month", "Scheduled close date"]
      },
      {
        name: "Tax Return Preparation",
        steps: ["Gather client documents", "Organize income and deduction data", "Prepare tax workpapers", "Calculate tax liability", "Preparer review", "Partner review", "Client approval", "E-file submission"],
        triggers: ["Tax season start", "Client engagement"]
      },
      {
        name: "Accounts Payable Processing",
        steps: ["Receive vendor invoice", "Match to purchase order", "Code to GL accounts", "Approval routing", "Schedule payment", "Process payment", "Record in ledger"],
        triggers: ["Invoice receipt", "Payment due date approaching"]
      },
      {
        name: "Audit Preparation",
        steps: ["Prepare requested documentation", "Reconcile all accounts", "Review internal controls", "Prepare management representations", "Coordinate with auditors", "Address audit findings", "Finalize audit report"],
        triggers: ["Audit engagement letter received", "Annual audit schedule"]
      }
    ],
    businessRules: [
      "All journal entries must balance (debits equal credits)",
      "Fiscal period must be closed before prior period adjustments require approval",
      "Client engagement letters must be signed before work begins",
      "Tax returns require partner review before filing",
      "Bank reconciliations must be completed within 10 business days of statement date",
      "Fixed assets above capitalization threshold must be depreciated per policy",
      "Revenue recognition must follow ASC 606 guidelines",
      "Engagement files must be retained for 7 years"
    ],
    terminology: {
      "GAAP": "Generally Accepted Accounting Principles - standard framework for financial accounting",
      "Accrual Basis": "Recording revenue when earned and expenses when incurred regardless of cash flow",
      "Depreciation": "Systematic allocation of asset cost over its useful life",
      "Trial Balance": "List of all accounts and their balances to verify debits equal credits",
      "Reconciliation": "Process of verifying that two sets of records agree",
      "Chart of Accounts": "Organized listing of all accounts used in the general ledger",
      "Fiscal Year": "12-month period used for financial reporting",
      "Accrual": "Expense or revenue recognized before cash is exchanged",
      "Amortization": "Gradual write-off of intangible asset cost over time",
      "CPA": "Certified Public Accountant - licensed accounting professional",
      "EIN": "Employer Identification Number - federal tax ID for businesses",
      "ASC 606": "Accounting Standards Codification Topic 606 - revenue recognition standard"
    },
    regulations: ["Sarbanes-Oxley Act", "IRS Tax Code", "GAAP Standards", "PCAOB Auditing Standards", "State CPA Licensing Requirements", "FinCEN Reporting"],
    integrations: ["QuickBooks", "Xero", "SAP", "Tax Filing Software", "Bank Feed Connections", "Payroll Systems", "Document Management Systems"],
    metrics: ["Revenue per Partner", "Realization Rate", "Utilization Rate", "Client Retention Rate", "Billing Collection Rate", "Average Engagement Turnaround"]
  },
  {
    id: "finance-cryptocurrency",
    name: "Cryptocurrency",
    industry: "Finance",
    description: "Cryptocurrency exchange and wallet management platform handling digital asset trading, portfolio tracking, blockchain transactions, and regulatory compliance.",
    keywords: ["cryptocurrency", "bitcoin", "ethereum", "blockchain", "wallet", "exchange", "token", "DeFi", "staking", "mining", "NFT", "smart contract", "gas fee", "cold storage", "KYC"],
    coreEntities: [
      {
        name: "Wallet",
        description: "Digital wallet holding cryptocurrency assets",
        typicalFields: ["walletId", "userId", "address", "type", "balance", "currency", "createdAt", "lastActivity"],
        validations: ["address must be valid for blockchain network", "hot wallet balance must not exceed security threshold"]
      },
      {
        name: "Trade",
        description: "Buy or sell order for cryptocurrency",
        typicalFields: ["tradeId", "userId", "pair", "side", "orderType", "price", "quantity", "status", "executedAt"],
        validations: ["quantity must meet minimum order size", "price must be within circuit breaker limits"]
      },
      {
        name: "Transaction",
        description: "On-chain or off-chain movement of digital assets",
        typicalFields: ["txHash", "fromAddress", "toAddress", "amount", "currency", "fee", "confirmations", "status"],
        validations: ["minimum confirmations required before crediting", "withdrawal address must be whitelisted"]
      },
      {
        name: "User",
        description: "Platform user with verified identity",
        typicalFields: ["userId", "email", "kycLevel", "tradingTier", "twoFactorEnabled", "apiKeys", "withdrawalLimits"],
        validations: ["KYC level determines trading and withdrawal limits", "2FA required for withdrawals"]
      },
      {
        name: "Asset",
        description: "Supported cryptocurrency or token",
        typicalFields: ["assetId", "symbol", "name", "network", "contractAddress", "decimals", "minWithdrawal", "depositConfirmations"],
        validations: ["contract address must be verified", "token must pass security audit"]
      },
      {
        name: "StakingPosition",
        description: "Locked cryptocurrency earning staking rewards",
        typicalFields: ["positionId", "userId", "asset", "amount", "apy", "lockPeriod", "startDate", "rewardsEarned"]
      }
    ],
    workflows: [
      {
        name: "User Onboarding",
        steps: ["Email registration", "Identity document upload", "KYC verification", "Set up 2FA", "Fund account", "Complete first trade"],
        triggers: ["New registration", "KYC document submission"]
      },
      {
        name: "Trade Execution",
        steps: ["Validate order parameters", "Check available balance", "Match against order book", "Execute trade", "Update balances", "Generate trade confirmation", "Calculate and collect fees"],
        triggers: ["Order submission", "Market order trigger"]
      },
      {
        name: "Withdrawal Processing",
        steps: ["Receive withdrawal request", "Verify 2FA", "Check withdrawal limits", "AML screening", "Queue for processing", "Sign transaction", "Broadcast to blockchain", "Confirm completion"],
        triggers: ["User withdrawal request"]
      },
      {
        name: "Security Monitoring",
        steps: ["Monitor login patterns", "Detect anomalous trading", "Check withdrawal velocity", "Alert security team", "Freeze suspicious accounts", "Investigate and resolve"],
        triggers: ["Anomalous activity detected", "User security report"]
      }
    ],
    businessRules: [
      "KYC verification required before trading above basic tier limits",
      "Two-factor authentication mandatory for all withdrawal transactions",
      "Hot wallet reserves must not exceed 5% of total assets",
      "Withdrawal addresses require 24-hour whitelist cooling period",
      "Large withdrawals above threshold require manual review",
      "Trading pairs must maintain minimum liquidity requirements",
      "API rate limits enforced per user tier",
      "Proof of reserves audited quarterly"
    ],
    terminology: {
      "Cold Storage": "Offline cryptocurrency storage for maximum security",
      "Hot Wallet": "Online wallet connected to internet for immediate transactions",
      "Gas Fee": "Transaction fee paid to blockchain network validators",
      "Staking": "Locking cryptocurrency to earn rewards and support network validation",
      "DeFi": "Decentralized Finance - financial services on blockchain without intermediaries",
      "DEX": "Decentralized Exchange - peer-to-peer trading platform on blockchain",
      "Liquidity Pool": "Pooled funds enabling decentralized trading",
      "Smart Contract": "Self-executing code deployed on blockchain",
      "Slippage": "Difference between expected and executed trade price",
      "Market Maker": "Entity providing liquidity by placing buy and sell orders",
      "AML": "Anti-Money Laundering - regulations preventing illicit fund flows",
      "Order Book": "List of open buy and sell orders for a trading pair"
    },
    regulations: ["FinCEN MSB Registration", "Bank Secrecy Act", "Travel Rule", "SEC Securities Regulations", "State Money Transmitter Licenses", "FATF Guidelines"],
    integrations: ["Blockchain Node APIs", "KYC/AML Providers", "Market Data Feeds", "Cold Storage Solutions", "Banking Partners", "Tax Reporting Tools"],
    metrics: ["Trading Volume", "Active Users", "Liquidity Depth", "Average Trade Size", "Withdrawal Processing Time", "Security Incident Count", "Assets Under Custody"]
  },
  {
    id: "education-k12",
    name: "K-12 Education",
    industry: "Education",
    description: "K-12 school management system covering student information, grading, attendance tracking, parent communication, and curriculum planning for elementary through high school.",
    keywords: ["student", "teacher", "grade", "attendance", "parent", "classroom", "curriculum", "report card", "homework", "discipline", "IEP", "school bus", "cafeteria", "principal"],
    coreEntities: [
      {
        name: "Student",
        description: "Enrolled K-12 student",
        typicalFields: ["studentId", "firstName", "lastName", "dateOfBirth", "gradeLevel", "homeroom", "guardians", "iepStatus"],
        validations: ["grade level must be K through 12", "at least one guardian contact required", "immunization records must be current"]
      },
      {
        name: "Teacher",
        description: "Certified educator assigned to classes",
        typicalFields: ["teacherId", "fullName", "certifications", "subjects", "classrooms", "schedule", "hireDate"],
        validations: ["teaching certificate must be current", "subject certifications must match assigned courses"]
      },
      {
        name: "Course",
        description: "Academic class offered in the school",
        typicalFields: ["courseId", "name", "subject", "gradeLevel", "teacherId", "room", "period", "maxEnrollment"],
        validations: ["enrollment cannot exceed maximum", "prerequisites must be met for enrollment"]
      },
      {
        name: "Grade",
        description: "Academic performance record for student in course",
        typicalFields: ["gradeId", "studentId", "courseId", "assignmentScores", "examScores", "quarterGrade", "finalGrade"],
        validations: ["grades must be within valid scale", "final grade calculated from weighted components"]
      },
      {
        name: "Attendance",
        description: "Daily student attendance record",
        typicalFields: ["recordId", "studentId", "date", "status", "period", "reason", "verifiedBy"],
        validations: ["absence must have reason code", "tardiness threshold is 10 minutes after bell"]
      },
      {
        name: "Guardian",
        description: "Parent or legal guardian of student",
        typicalFields: ["guardianId", "fullName", "relationship", "phone", "email", "address", "emergencyPriority", "custodyStatus"],
        validations: ["custody documentation required for non-parent guardians", "at least one contact method required"]
      },
      {
        name: "IEP",
        description: "Individualized Education Program for students with disabilities",
        typicalFields: ["iepId", "studentId", "disabilities", "goals", "accommodations", "services", "reviewDate", "teamMembers"]
      }
    ],
    workflows: [
      {
        name: "Student Enrollment",
        steps: ["Receive enrollment application", "Verify residency", "Collect immunization records", "Grade placement assessment", "Assign homeroom and schedule", "Create student account", "Parent portal setup", "Orientation scheduling"],
        triggers: ["New student application", "Transfer student arrival"]
      },
      {
        name: "Grading and Report Cards",
        steps: ["Teachers enter assignment grades", "Calculate quarter averages", "Review incomplete grades", "Generate report cards", "Administrator review", "Distribute to parents", "Address grade appeals"],
        triggers: ["End of grading period", "Semester end"]
      },
      {
        name: "Attendance Management",
        steps: ["Teacher takes attendance", "System flags absences", "Automated parent notification", "Verify excused absences", "Track chronic absenteeism", "Truancy intervention referral"],
        triggers: ["Class period start", "Daily attendance window"]
      },
      {
        name: "Disciplinary Action",
        steps: ["Incident report filed", "Administrator investigation", "Student and parent notification", "Hearing if required", "Determine consequences", "Document in student record", "Follow-up monitoring"],
        triggers: ["Incident report", "Teacher referral"]
      }
    ],
    businessRules: [
      "Students with more than 10 unexcused absences per semester flagged for truancy review",
      "IEP accommodations must be provided in all applicable classes",
      "Parent notification required within 1 hour for student illness or injury",
      "Grade changes after report card distribution require principal approval",
      "Students must meet minimum attendance requirement for course credit",
      "Standardized testing accommodations must match IEP specifications",
      "Field trips require signed parent permission forms",
      "Student records accessible only by authorized school personnel per FERPA"
    ],
    terminology: {
      "IEP": "Individualized Education Program - plan for students with disabilities",
      "504 Plan": "Accommodation plan for students with disabilities under Section 504",
      "FERPA": "Family Educational Rights and Privacy Act - student record privacy law",
      "GPA": "Grade Point Average - weighted average of course grades",
      "Homeroom": "Assigned classroom and teacher for administrative purposes",
      "Truancy": "Habitual unexcused absence from school",
      "Curriculum": "Planned sequence of instruction and learning outcomes",
      "Rubric": "Scoring guide for evaluating student work",
      "Formative Assessment": "Ongoing evaluation to monitor student learning",
      "Summative Assessment": "End-of-unit evaluation measuring student achievement",
      "RTI": "Response to Intervention - multi-tiered approach to early identification of learning needs",
      "PBIS": "Positive Behavioral Interventions and Supports - framework for behavior management"
    },
    regulations: ["FERPA", "IDEA (Individuals with Disabilities Education Act)", "Title IX", "Section 504", "State Education Standards", "No Child Left Behind/ESSA"],
    integrations: ["Student Information Systems", "Learning Management Systems", "Parent Communication Portals", "Transportation Management", "Cafeteria Management", "Assessment Platforms"],
    metrics: ["Graduation Rate", "Average GPA", "Attendance Rate", "Standardized Test Scores", "Dropout Rate", "College Readiness Rate", "Discipline Incident Rate"]
  },
  {
    id: "education-higher",
    name: "Higher Education",
    industry: "Education",
    description: "University and college management system covering admissions, enrollment, course registration, financial aid, research administration, and degree auditing.",
    keywords: ["university", "college", "admission", "enrollment", "tuition", "financial aid", "transcript", "degree", "major", "professor", "research", "campus", "dormitory", "semester", "credit hours"],
    coreEntities: [
      {
        name: "Student",
        description: "Enrolled undergraduate or graduate student",
        typicalFields: ["studentId", "fullName", "email", "major", "minor", "gpa", "enrollmentStatus", "expectedGraduation"],
        validations: ["must maintain minimum GPA for enrollment status", "credit hour load must be within limits"]
      },
      {
        name: "Course",
        description: "Academic course offered by department",
        typicalFields: ["courseCode", "title", "department", "creditHours", "prerequisites", "instructor", "capacity", "format"],
        validations: ["prerequisites must be satisfied for registration", "enrollment cannot exceed capacity"]
      },
      {
        name: "Faculty",
        description: "Professor or instructor at the institution",
        typicalFields: ["facultyId", "fullName", "department", "rank", "tenure", "researchAreas", "officeHours", "courses"],
        validations: ["teaching load must not exceed department limits", "tenure-track faculty must maintain research output"]
      },
      {
        name: "Enrollment",
        description: "Student registration in a specific course section",
        typicalFields: ["enrollmentId", "studentId", "courseCode", "section", "semester", "grade", "status"],
        validations: ["student must meet prerequisites", "cannot exceed maximum credit hours per semester"]
      },
      {
        name: "FinancialAid",
        description: "Financial assistance awarded to student",
        typicalFields: ["awardId", "studentId", "type", "amount", "academicYear", "disbursementDate", "requirements", "status"],
        validations: ["FAFSA must be on file", "satisfactory academic progress required for renewal"]
      },
      {
        name: "DegreeAudit",
        description: "Tracking of student progress toward degree completion",
        typicalFields: ["auditId", "studentId", "degreeProgram", "completedRequirements", "remainingRequirements", "totalCredits", "gpa"]
      }
    ],
    workflows: [
      {
        name: "Admissions Process",
        steps: ["Receive application", "Review transcripts and test scores", "Evaluate essays and recommendations", "Admissions committee review", "Render decision", "Send acceptance or denial", "Process enrollment deposit", "New student orientation"],
        triggers: ["Application deadline", "Rolling admissions"]
      },
      {
        name: "Course Registration",
        steps: ["Open registration window by class standing", "Student selects courses", "System checks prerequisites", "Verify credit hour limits", "Process enrollment", "Generate schedule", "Waitlist management"],
        triggers: ["Registration period opens", "Advisor hold release"]
      },
      {
        name: "Financial Aid Processing",
        steps: ["Receive FAFSA", "Determine eligibility", "Create award package", "Student acceptance of awards", "Verify enrollment status", "Disburse funds", "Reconcile with bursar"],
        triggers: ["FAFSA filing", "Academic year start"]
      },
      {
        name: "Graduation Processing",
        steps: ["Student applies for graduation", "Degree audit review", "Resolve outstanding requirements", "Final grade posting", "Degree conferral approval", "Order diploma", "Commencement ceremony"],
        triggers: ["Graduation application submitted", "Final semester of enrollment"]
      }
    ],
    businessRules: [
      "Students must maintain 2.0 GPA to remain in good academic standing",
      "Full-time enrollment requires minimum 12 credit hours per semester",
      "Prerequisites must be completed with grade C or better",
      "Financial aid requires satisfactory academic progress review each semester",
      "Course withdrawal after deadline results in W grade on transcript",
      "Faculty must submit grades within 72 hours of final exam",
      "Transfer credits require department chair approval",
      "Academic probation after one semester below 2.0 GPA"
    ],
    terminology: {
      "FAFSA": "Free Application for Federal Student Aid",
      "Credit Hour": "Unit of academic credit typically representing one hour of instruction per week",
      "GPA": "Grade Point Average on a 4.0 scale",
      "Prerequisite": "Course that must be completed before enrolling in another",
      "Corequisite": "Course that must be taken simultaneously with another",
      "Registrar": "Office responsible for maintaining student academic records",
      "Bursar": "Office responsible for tuition billing and payment",
      "Provost": "Senior academic officer of the institution",
      "Tenure": "Permanent employment status granted after rigorous review",
      "Syllabus": "Outline of course content, requirements, and schedule",
      "Accreditation": "Official recognition that institution meets quality standards",
      "Dean's List": "Academic honor for students achieving high GPA in a semester",
      "Commencement": "Graduation ceremony"
    },
    regulations: ["FERPA", "Title IX", "Clery Act", "ADA Compliance", "Accreditation Standards", "Federal Financial Aid Regulations", "NCAA Rules (if applicable)"],
    integrations: ["Student Information Systems", "Learning Management Systems", "Financial Aid Systems", "Library Systems", "Housing Management", "Research Grant Management"],
    metrics: ["Enrollment Rate", "Retention Rate", "Graduation Rate", "Student-to-Faculty Ratio", "Average Class Size", "Research Funding", "Alumni Giving Rate"]
  },
  {
    id: "education-corporate-training",
    name: "Corporate Training",
    industry: "Education",
    description: "Corporate learning and development platform managing employee training programs, skill assessments, compliance certifications, and professional development tracking.",
    keywords: ["training", "employee", "learning", "development", "certification", "compliance", "onboarding", "skill assessment", "LMS", "e-learning", "instructor-led", "webinar", "competency"],
    coreEntities: [
      {
        name: "Employee",
        description: "Company employee participating in training programs",
        typicalFields: ["employeeId", "fullName", "department", "role", "manager", "hireDate", "completedCourses", "certifications"],
        validations: ["must be active employee", "department must be valid"]
      },
      {
        name: "Course",
        description: "Training course or program",
        typicalFields: ["courseId", "title", "description", "format", "duration", "skillLevel", "prerequisites", "maxParticipants"],
        validations: ["content must be reviewed annually", "compliance courses must be updated with regulation changes"]
      },
      {
        name: "Enrollment",
        description: "Employee registration in a training course",
        typicalFields: ["enrollmentId", "employeeId", "courseId", "enrollDate", "completionDate", "score", "status", "certificateIssued"],
        validations: ["prerequisites must be completed", "enrollment within registration window"]
      },
      {
        name: "Assessment",
        description: "Evaluation of employee knowledge or skills",
        typicalFields: ["assessmentId", "courseId", "employeeId", "score", "passingScore", "attempts", "completedAt"],
        validations: ["maximum 3 attempts per assessment", "passing score must be met for completion credit"]
      },
      {
        name: "Certification",
        description: "Professional credential earned through training",
        typicalFields: ["certId", "employeeId", "name", "issuedDate", "expirationDate", "issuingBody", "status"],
        validations: ["expiration must be tracked for renewal", "continuing education requirements must be met"]
      },
      {
        name: "LearningPath",
        description: "Structured sequence of courses for role development",
        typicalFields: ["pathId", "name", "targetRole", "courses", "estimatedDuration", "competencies", "requiredFor"]
      }
    ],
    workflows: [
      {
        name: "New Hire Onboarding",
        steps: ["Assign onboarding learning path", "Complete company orientation modules", "Department-specific training", "Compliance training", "Manager check-in", "Assessment completion", "Onboarding sign-off"],
        triggers: ["Employee start date", "HR system new hire record"]
      },
      {
        name: "Compliance Training Cycle",
        steps: ["Identify required compliance courses", "Send enrollment notifications", "Track completion progress", "Send reminders for incomplete", "Escalate non-compliance to management", "Generate compliance report"],
        triggers: ["Annual compliance cycle start", "Regulation change", "New hire"]
      },
      {
        name: "Skill Development",
        steps: ["Conduct skills gap analysis", "Recommend learning paths", "Employee enrollment", "Course completion tracking", "Post-training assessment", "Update competency profile", "Performance review integration"],
        triggers: ["Annual performance review", "Role change", "Employee request"]
      },
      {
        name: "Certification Management",
        steps: ["Track certification expiration dates", "Notify employees of upcoming renewals", "Enroll in renewal courses", "Complete continuing education", "Update certification records", "Report compliance status"],
        triggers: ["90 days before expiration", "Regulation change"]
      }
    ],
    businessRules: [
      "All employees must complete annual compliance training by fiscal year end",
      "Safety training must be completed within first week of employment",
      "Manager approval required for training exceeding 4 hours",
      "Certification expiration triggers automatic enrollment in renewal course",
      "Training completion rates reported to department heads monthly",
      "External training reimbursement requires pre-approval and passing grade",
      "Compliance training failure after 3 attempts escalated to HR"
    ],
    terminology: {
      "LMS": "Learning Management System - platform for delivering and tracking training",
      "ILT": "Instructor-Led Training - traditional classroom training format",
      "SCORM": "Sharable Content Object Reference Model - e-learning standard",
      "Competency": "Demonstrated ability in a specific skill or knowledge area",
      "Learning Path": "Structured sequence of courses toward a development goal",
      "Microlearning": "Short focused learning modules typically 5-10 minutes",
      "Blended Learning": "Combination of online and in-person training delivery",
      "CEU": "Continuing Education Unit - credit for ongoing professional development",
      "ROI": "Return on Investment - measuring training effectiveness against cost",
      "Skills Gap Analysis": "Assessment identifying difference between current and required competencies",
      "Knowledge Check": "Brief assessment embedded within training content"
    },
    integrations: ["HRIS Systems", "Learning Management Systems", "Video Conferencing Platforms", "Content Authoring Tools", "Performance Management Systems", "Certification Bodies"],
    metrics: ["Training Completion Rate", "Average Assessment Score", "Time to Competency", "Employee Satisfaction Score", "Compliance Rate", "Training ROI", "Skills Gap Closure Rate"]
  },
  {
    id: "ecommerce-retail",
    name: "Retail E-Commerce",
    industry: "E-Commerce",
    description: "Online retail platform managing product catalog, shopping cart, order processing, payment handling, inventory management, and customer service operations.",
    keywords: ["product", "cart", "order", "payment", "shipping", "inventory", "catalog", "SKU", "checkout", "refund", "discount", "coupon", "review", "wishlist", "customer"],
    coreEntities: [
      {
        name: "Product",
        description: "Item available for purchase in the store",
        typicalFields: ["productId", "sku", "name", "description", "price", "category", "images", "inventory"],
        validations: ["SKU must be unique", "price must be positive", "at least one image required"]
      },
      {
        name: "Order",
        description: "Customer purchase transaction",
        typicalFields: ["orderId", "customerId", "items", "subtotal", "tax", "shipping", "total", "status"],
        validations: ["total must equal items plus tax plus shipping", "status transitions must follow valid sequence"]
      },
      {
        name: "Customer",
        description: "Registered or guest buyer",
        typicalFields: ["customerId", "email", "fullName", "addresses", "paymentMethods", "orderHistory", "loyaltyPoints"],
        validations: ["email must be unique for registered users", "shipping address required for physical goods"]
      },
      {
        name: "CartItem",
        description: "Product added to shopping cart",
        typicalFields: ["cartItemId", "cartId", "productId", "quantity", "unitPrice", "selectedVariant", "addedAt"],
        validations: ["quantity must not exceed available inventory", "price must match current product price"]
      },
      {
        name: "Payment",
        description: "Payment transaction for an order",
        typicalFields: ["paymentId", "orderId", "method", "amount", "currency", "transactionId", "status", "processedAt"],
        validations: ["amount must match order total", "payment must be authorized before order confirmation"]
      },
      {
        name: "Review",
        description: "Customer product review and rating",
        typicalFields: ["reviewId", "productId", "customerId", "rating", "title", "body", "verifiedPurchase", "createdAt"],
        validations: ["rating must be 1-5", "customer must have purchased product for verified review"]
      },
      {
        name: "Coupon",
        description: "Promotional discount code",
        typicalFields: ["couponCode", "discountType", "discountValue", "minimumOrder", "maxUses", "expirationDate", "applicableProducts"]
      }
    ],
    workflows: [
      {
        name: "Order Fulfillment",
        steps: ["Receive order", "Verify payment", "Reserve inventory", "Pick items from warehouse", "Pack order", "Generate shipping label", "Ship order", "Send tracking notification"],
        triggers: ["Order placed", "Payment confirmed"]
      },
      {
        name: "Return Processing",
        steps: ["Customer initiates return", "Generate return label", "Receive returned item", "Inspect condition", "Process refund or exchange", "Restock if applicable", "Update inventory"],
        triggers: ["Return request submitted", "Return window active"]
      },
      {
        name: "Inventory Management",
        steps: ["Monitor stock levels", "Generate reorder alerts", "Create purchase orders", "Receive shipments", "Update inventory counts", "Reconcile discrepancies"],
        triggers: ["Stock falls below reorder point", "Scheduled inventory review"]
      },
      {
        name: "Checkout Process",
        steps: ["Review cart items", "Apply coupons or discounts", "Select shipping method", "Enter payment information", "Authorize payment", "Create order record", "Send confirmation email"],
        triggers: ["Customer clicks checkout"]
      }
    ],
    businessRules: [
      "Orders ship within 2 business days of payment confirmation",
      "Returns accepted within 30 days of delivery with original packaging",
      "Free shipping on orders over $50",
      "Inventory reserved for 30 minutes during checkout process",
      "Out-of-stock items cannot be added to cart",
      "Coupon codes cannot be combined unless explicitly allowed",
      "Reviews must be moderated before publishing",
      "Abandoned carts trigger email reminder after 24 hours"
    ],
    terminology: {
      "SKU": "Stock Keeping Unit - unique product identifier for inventory",
      "Cart Abandonment": "When a customer adds items to cart but does not complete purchase",
      "Conversion Rate": "Percentage of visitors who complete a purchase",
      "AOV": "Average Order Value - mean value of completed orders",
      "Fulfillment": "Process of picking, packing, and shipping customer orders",
      "Drop Shipping": "Shipping products directly from manufacturer to customer",
      "PDP": "Product Detail Page - individual product information page",
      "UPC": "Universal Product Code - standardized barcode for retail items",
      "Backorder": "Order for product currently out of stock to be shipped when available",
      "Cross-sell": "Recommending complementary products to current purchase",
      "Upsell": "Recommending higher-priced alternative to selected product"
    },
    integrations: ["Payment Gateways", "Shipping Carriers", "Inventory Management Systems", "Email Marketing Platforms", "Analytics Platforms", "Customer Support Systems"],
    metrics: ["Conversion Rate", "Average Order Value", "Cart Abandonment Rate", "Customer Lifetime Value", "Return Rate", "Inventory Turnover", "Revenue per Visitor"]
  },
  {
    id: "ecommerce-marketplace",
    name: "Marketplace",
    industry: "E-Commerce",
    description: "Multi-vendor marketplace platform connecting buyers and sellers with product listings, seller management, transaction processing, and dispute resolution.",
    keywords: ["marketplace", "vendor", "seller", "buyer", "listing", "commission", "escrow", "dispute", "review", "storefront", "multi-vendor", "platform fee", "payout"],
    coreEntities: [
      {
        name: "Seller",
        description: "Vendor selling products on the marketplace",
        typicalFields: ["sellerId", "businessName", "email", "verificationStatus", "storefront", "commissionRate", "payoutAccount", "rating"],
        validations: ["business verification required before listing", "payout account must be verified"]
      },
      {
        name: "Listing",
        description: "Product or service offered by a seller",
        typicalFields: ["listingId", "sellerId", "title", "description", "price", "category", "condition", "images", "shippingOptions"],
        validations: ["listing must comply with prohibited items policy", "images must not contain watermarks"]
      },
      {
        name: "Buyer",
        description: "Customer purchasing from marketplace sellers",
        typicalFields: ["buyerId", "email", "fullName", "shippingAddresses", "paymentMethods", "purchaseHistory", "buyerRating"],
        validations: ["email must be verified", "payment method required before purchase"]
      },
      {
        name: "Transaction",
        description: "Purchase transaction between buyer and seller",
        typicalFields: ["transactionId", "buyerId", "sellerId", "listingId", "amount", "platformFee", "sellerPayout", "status"],
        validations: ["platform fee calculated per commission schedule", "funds held in escrow until delivery confirmed"]
      },
      {
        name: "Dispute",
        description: "Conflict between buyer and seller requiring resolution",
        typicalFields: ["disputeId", "transactionId", "filedBy", "reason", "evidence", "status", "resolution", "resolvedAt"],
        validations: ["must be filed within dispute window", "evidence required to support claim"]
      },
      {
        name: "Payout",
        description: "Payment disbursement to seller",
        typicalFields: ["payoutId", "sellerId", "amount", "period", "transactions", "deductions", "status", "processedAt"]
      }
    ],
    workflows: [
      {
        name: "Seller Onboarding",
        steps: ["Seller registration", "Business verification", "Identity verification", "Set up payout method", "Create storefront", "List first product", "Account activation"],
        triggers: ["Seller application submitted"]
      },
      {
        name: "Purchase Flow",
        steps: ["Buyer selects listing", "Add to cart", "Checkout with payment", "Hold funds in escrow", "Notify seller", "Seller ships item", "Buyer confirms delivery", "Release funds to seller"],
        triggers: ["Buyer checkout completed"]
      },
      {
        name: "Dispute Resolution",
        steps: ["Buyer or seller opens dispute", "Collect evidence from both parties", "Platform review", "Mediation attempt", "Final decision", "Process refund or release funds", "Update seller metrics"],
        triggers: ["Dispute filed", "Auto-escalation timer"]
      },
      {
        name: "Seller Payout Processing",
        steps: ["Calculate earnings for period", "Deduct platform fees", "Deduct dispute chargebacks", "Generate payout summary", "Process bank transfer", "Send payout confirmation"],
        triggers: ["Weekly payout schedule", "Seller balance threshold reached"]
      }
    ],
    businessRules: [
      "Seller funds held in escrow until buyer confirms delivery or dispute window closes",
      "Platform commission rate varies by category from 5% to 15%",
      "Sellers must maintain minimum 4.0 rating to remain active",
      "Disputes must be filed within 14 days of delivery confirmation",
      "Prohibited items result in immediate listing removal and seller warning",
      "New sellers have payout hold period of 14 days",
      "Buyer protection covers purchases up to $10,000"
    ],
    terminology: {
      "Escrow": "Holding funds in trust until transaction conditions are met",
      "Commission": "Percentage fee charged by platform on each transaction",
      "Storefront": "Seller's customized page displaying their listings",
      "GMV": "Gross Merchandise Value - total value of all transactions on platform",
      "Take Rate": "Percentage of GMV retained by platform as revenue",
      "Buyer Protection": "Guarantee program covering fraudulent or misrepresented purchases",
      "Seller Rating": "Aggregate score based on buyer reviews and transaction history",
      "Chargeback": "Reversal of payment initiated by buyer's payment provider",
      "Payout": "Disbursement of earned funds to seller account",
      "Listing Fee": "One-time charge for creating a product listing"
    },
    integrations: ["Payment Processors", "Identity Verification Services", "Shipping Integration APIs", "Fraud Detection Systems", "Communication Platforms", "Analytics Dashboards"],
    metrics: ["Gross Merchandise Value", "Take Rate", "Active Sellers", "Active Buyers", "Dispute Rate", "Average Resolution Time", "Seller Retention Rate"]
  },
  {
    id: "ecommerce-subscription",
    name: "Subscription Commerce",
    industry: "E-Commerce",
    description: "Subscription-based commerce platform managing recurring billing, subscription plans, trial periods, usage tracking, and subscriber lifecycle management.",
    keywords: ["subscription", "recurring billing", "plan", "trial", "churn", "renewal", "upgrade", "downgrade", "MRR", "ARR", "SaaS", "membership", "billing cycle"],
    coreEntities: [
      {
        name: "Subscriber",
        description: "Customer with active or past subscription",
        typicalFields: ["subscriberId", "email", "fullName", "plan", "status", "startDate", "billingCycle", "paymentMethod"],
        validations: ["email must be verified", "payment method must be valid and active"]
      },
      {
        name: "Plan",
        description: "Subscription tier with features and pricing",
        typicalFields: ["planId", "name", "price", "billingInterval", "features", "trialDays", "maxUsers", "storageLimit"],
        validations: ["price must be positive", "at least one feature must be defined"]
      },
      {
        name: "Subscription",
        description: "Active subscription linking subscriber to plan",
        typicalFields: ["subscriptionId", "subscriberId", "planId", "status", "currentPeriodStart", "currentPeriodEnd", "cancelAtPeriodEnd"],
        validations: ["only one active subscription per subscriber per product", "status transitions must follow lifecycle rules"]
      },
      {
        name: "Invoice",
        description: "Billing record for subscription period",
        typicalFields: ["invoiceId", "subscriptionId", "amount", "tax", "total", "status", "dueDate", "paidAt"],
        validations: ["amount must match plan price plus applicable taxes", "past due invoices trigger payment retry"]
      },
      {
        name: "Usage",
        description: "Tracked consumption of metered resources",
        typicalFields: ["usageId", "subscriptionId", "metric", "quantity", "period", "reportedAt"],
        validations: ["usage must be within plan limits or trigger overage billing"]
      },
      {
        name: "PaymentMethod",
        description: "Stored payment information for billing",
        typicalFields: ["methodId", "subscriberId", "type", "lastFour", "expirationDate", "isDefault", "billingAddress"]
      }
    ],
    workflows: [
      {
        name: "New Subscription",
        steps: ["Customer selects plan", "Create account", "Set up payment method", "Start trial period if applicable", "Activate subscription", "Send welcome email", "Schedule first billing"],
        triggers: ["Customer sign-up", "Trial conversion"]
      },
      {
        name: "Billing Cycle",
        steps: ["Calculate billing amount", "Apply proration if applicable", "Generate invoice", "Attempt payment charge", "Handle payment failure with retry", "Send receipt or payment failure notice", "Update subscription status"],
        triggers: ["Billing period end", "Plan change mid-cycle"]
      },
      {
        name: "Churn Prevention",
        steps: ["Detect cancellation intent", "Present retention offers", "Offer plan downgrade", "Collect cancellation reason", "Process cancellation at period end", "Send win-back campaign after 30 days"],
        triggers: ["Cancellation request", "Payment failure", "Low engagement detected"]
      },
      {
        name: "Plan Change",
        steps: ["Customer requests upgrade or downgrade", "Calculate proration", "Update subscription plan", "Adjust billing amount", "Apply feature changes immediately", "Send confirmation"],
        triggers: ["Customer request", "Usage limit exceeded"]
      }
    ],
    businessRules: [
      "Trial periods do not require payment method unless configured",
      "Payment retry attempts occur on days 1, 3, 5, and 7 after failure",
      "Subscription cancellation takes effect at end of current billing period",
      "Prorated credits issued for mid-cycle downgrades",
      "Annual subscriptions receive discount compared to monthly billing",
      "Involuntary churn after 4 failed payment attempts",
      "Usage overage billed at end of billing period",
      "Grandfathered pricing honored for existing subscribers on legacy plans"
    ],
    terminology: {
      "MRR": "Monthly Recurring Revenue - total predictable monthly revenue",
      "ARR": "Annual Recurring Revenue - annualized recurring revenue",
      "Churn Rate": "Percentage of subscribers who cancel in a given period",
      "LTV": "Lifetime Value - total revenue expected from a subscriber",
      "CAC": "Customer Acquisition Cost - cost to acquire a new subscriber",
      "Proration": "Adjusting charges proportionally for partial billing periods",
      "Dunning": "Process of managing failed payment collection",
      "Involuntary Churn": "Subscription cancellation due to payment failure",
      "Voluntary Churn": "Subscriber-initiated cancellation",
      "Net Revenue Retention": "Revenue retained from existing customers including expansion",
      "Expansion Revenue": "Additional revenue from existing customers through upgrades"
    },
    integrations: ["Payment Processors", "Subscription Billing Platforms", "Email Marketing Tools", "Analytics Platforms", "CRM Systems", "Accounting Software"],
    metrics: ["Monthly Recurring Revenue", "Churn Rate", "Customer Lifetime Value", "Average Revenue per User", "Trial Conversion Rate", "Net Revenue Retention", "Expansion Revenue"]
  },
  {
    id: "realestate-residential",
    name: "Residential Real Estate",
    industry: "Real Estate",
    description: "Residential real estate management covering property listings, buyer and seller matching, transaction management, and mortgage coordination for homes, condos, and apartments.",
    keywords: ["property", "listing", "buyer", "seller", "agent", "MLS", "mortgage", "closing", "escrow", "inspection", "appraisal", "offer", "open house", "commission", "HOA"],
    coreEntities: [
      {
        name: "Property",
        description: "Residential property listed for sale or rent",
        typicalFields: ["propertyId", "address", "type", "bedrooms", "bathrooms", "squareFeet", "listPrice", "status", "mlsNumber"],
        validations: ["MLS number must be unique", "list price must be positive", "square footage must be verified"]
      },
      {
        name: "Listing",
        description: "Active property listing on the market",
        typicalFields: ["listingId", "propertyId", "agentId", "listDate", "expirationDate", "listPrice", "status", "photos", "description"],
        validations: ["listing agreement must be signed", "photos must meet MLS standards"]
      },
      {
        name: "Client",
        description: "Buyer or seller working with an agent",
        typicalFields: ["clientId", "fullName", "phone", "email", "type", "preApprovalAmount", "preferences", "agentId"],
        validations: ["buyer must have pre-approval letter for offers", "seller must have listing agreement"]
      },
      {
        name: "Offer",
        description: "Purchase offer submitted on a property",
        typicalFields: ["offerId", "propertyId", "buyerId", "offerPrice", "contingencies", "closingDate", "earnestMoney", "status"],
        validations: ["earnest money must meet minimum threshold", "contingency deadlines must be specified"]
      },
      {
        name: "Transaction",
        description: "Real estate sale transaction from offer to closing",
        typicalFields: ["transactionId", "propertyId", "buyerId", "sellerId", "salePrice", "closingDate", "escrowCompany", "status"],
        validations: ["all contingencies must be satisfied or waived", "closing documents must be signed by all parties"]
      },
      {
        name: "Agent",
        description: "Licensed real estate agent or broker",
        typicalFields: ["agentId", "fullName", "licenseNumber", "brokerage", "phone", "email", "specializations"]
      }
    ],
    workflows: [
      {
        name: "Property Listing",
        steps: ["Sign listing agreement", "Property assessment and pricing", "Professional photography", "Enter in MLS", "Marketing campaign launch", "Schedule showings", "Open house events", "Review offers"],
        triggers: ["Seller engagement", "Listing agreement signed"]
      },
      {
        name: "Buyer Search",
        steps: ["Initial consultation", "Determine budget and preferences", "Pre-approval referral", "Property search and tours", "Submit offer", "Negotiate terms", "Accept offer"],
        triggers: ["Buyer inquiry", "New listing matching criteria"]
      },
      {
        name: "Transaction to Close",
        steps: ["Execute purchase agreement", "Open escrow", "Schedule inspection", "Appraisal ordered", "Resolve contingencies", "Final walkthrough", "Sign closing documents", "Record deed and disburse funds"],
        triggers: ["Offer acceptance", "Contingency deadlines"]
      },
      {
        name: "Commission Processing",
        steps: ["Calculate total commission", "Split between listing and buyer agent", "Deduct brokerage fees", "Process agent payment", "Issue 1099 tax form"],
        triggers: ["Transaction closing", "Funds disbursement"]
      }
    ],
    businessRules: [
      "All agents must hold active real estate license in operating state",
      "Commission typically 5-6% of sale price split between agents",
      "Buyer pre-approval required before submitting offers",
      "Inspection contingency allows buyer to withdraw within specified period",
      "Earnest money deposited within 3 business days of acceptance",
      "Fair Housing laws prohibit discrimination in all transactions",
      "Seller disclosures required for known property defects",
      "Dual agency requires written consent from both parties"
    ],
    terminology: {
      "MLS": "Multiple Listing Service - shared database of property listings",
      "Escrow": "Neutral third party holding funds and documents during transaction",
      "Appraisal": "Professional assessment of property market value",
      "Contingency": "Condition that must be met for contract to proceed",
      "Earnest Money": "Good faith deposit submitted with offer",
      "Closing Costs": "Fees and expenses paid at property transfer",
      "Title Search": "Examination of public records to verify property ownership",
      "HOA": "Homeowners Association - governing body for community properties",
      "Comparable Sales": "Recent sales of similar properties used for pricing analysis",
      "CMA": "Comparative Market Analysis - report estimating property value",
      "Dual Agency": "Single agent representing both buyer and seller"
    },
    regulations: ["Fair Housing Act", "RESPA", "Truth in Lending Act", "State Real Estate License Laws", "Lead Paint Disclosure Requirements", "ADA Accessibility"],
    integrations: ["MLS Systems", "CRM Platforms", "E-Signature Services", "Mortgage Lender Portals", "Title Company Systems", "Photography Services"],
    metrics: ["Days on Market", "List-to-Sale Price Ratio", "Transaction Volume", "Average Commission", "Client Satisfaction Score", "Listings per Agent"]
  },
  {
    id: "realestate-commercial",
    name: "Commercial Real Estate",
    industry: "Real Estate",
    description: "Commercial real estate management covering office, retail, and industrial property leasing, tenant management, property maintenance, and investment analysis.",
    keywords: ["commercial", "lease", "tenant", "office space", "retail space", "industrial", "CAM", "NNN", "vacancy", "cap rate", "NOI", "property management", "buildout"],
    coreEntities: [
      {
        name: "Property",
        description: "Commercial real estate asset",
        typicalFields: ["propertyId", "address", "type", "totalSquareFeet", "availableSquareFeet", "yearBuilt", "class", "parkingSpaces"],
        validations: ["property class must be A, B, or C", "available space cannot exceed total"]
      },
      {
        name: "Lease",
        description: "Commercial lease agreement between landlord and tenant",
        typicalFields: ["leaseId", "propertyId", "tenantId", "startDate", "endDate", "monthlyRent", "leaseType", "escalations", "options"],
        validations: ["end date must be after start date", "rent escalation schedule must be defined"]
      },
      {
        name: "Tenant",
        description: "Business occupying commercial space",
        typicalFields: ["tenantId", "businessName", "industry", "contactPerson", "creditRating", "leaseHistory", "squareFeetOccupied"],
        validations: ["credit check required before lease execution", "insurance certificate must be on file"]
      },
      {
        name: "MaintenanceRequest",
        description: "Repair or maintenance work order",
        typicalFields: ["requestId", "propertyId", "tenantId", "category", "description", "priority", "status", "assignedVendor", "cost"],
        validations: ["emergency requests must be addressed within 4 hours", "cost above threshold requires approval"]
      },
      {
        name: "Invoice",
        description: "Billing for rent, CAM charges, or other fees",
        typicalFields: ["invoiceId", "tenantId", "type", "amount", "period", "dueDate", "status", "lateFee"],
        validations: ["late fees applied after grace period", "CAM reconciliation annually"]
      },
      {
        name: "Vendor",
        description: "Service provider for property maintenance and improvements",
        typicalFields: ["vendorId", "companyName", "serviceType", "contactInfo", "insuranceCert", "contractTerms", "rating"]
      }
    ],
    workflows: [
      {
        name: "Lease Negotiation",
        steps: ["Tenant inquiry and qualification", "Property tour", "Letter of intent", "Lease draft and negotiation", "Credit and background check", "Lease execution", "Tenant buildout coordination", "Move-in"],
        triggers: ["Tenant inquiry", "Broker referral"]
      },
      {
        name: "Rent Collection",
        steps: ["Generate monthly invoices", "Send to tenants", "Track payments received", "Apply late fees after grace period", "Send past due notices", "Escalate to collections if needed", "Reconcile accounts"],
        triggers: ["First of month", "Payment due date"]
      },
      {
        name: "Property Maintenance",
        steps: ["Receive maintenance request", "Assess priority and scope", "Assign vendor", "Schedule work", "Complete repairs", "Tenant sign-off", "Process vendor payment", "Close work order"],
        triggers: ["Tenant request", "Scheduled preventive maintenance", "Inspection finding"]
      },
      {
        name: "Lease Renewal",
        steps: ["Review upcoming expirations", "Market rent analysis", "Prepare renewal proposal", "Negotiate terms", "Execute renewal amendment", "Update lease records"],
        triggers: ["12 months before lease expiration", "Tenant renewal request"]
      }
    ],
    businessRules: [
      "Tenant credit score must meet minimum threshold for lease approval",
      "Rent escalation clauses enforced annually per lease terms",
      "CAM charges reconciled annually with actual expenses",
      "Security deposits held in separate escrow account",
      "Emergency maintenance responded to within 4 hours",
      "Tenant improvements require landlord approval for structural changes",
      "Lease guarantees required for tenants below credit threshold",
      "Insurance certificates must be current and name landlord as additional insured"
    ],
    terminology: {
      "CAM": "Common Area Maintenance - shared costs for property upkeep",
      "NNN": "Triple Net Lease - tenant pays rent plus taxes, insurance, and maintenance",
      "NOI": "Net Operating Income - total income minus operating expenses",
      "Cap Rate": "Capitalization Rate - NOI divided by property value",
      "TI": "Tenant Improvement - buildout allowance for tenant space customization",
      "LOI": "Letter of Intent - preliminary agreement outlining lease terms",
      "Vacancy Rate": "Percentage of total space that is unoccupied",
      "Escalation": "Scheduled rent increase per lease terms",
      "Gross Lease": "Lease where landlord pays operating expenses",
      "Buildout": "Construction and customization of tenant space",
      "Pro Rata Share": "Tenant's proportional share of building expenses"
    },
    regulations: ["ADA Compliance", "Building Codes", "Fire Safety Regulations", "Environmental Regulations", "Zoning Laws", "Commercial Lease Laws"],
    integrations: ["Property Management Software", "Accounting Systems", "Tenant Portal", "Maintenance Management", "Building Automation Systems", "Market Data Providers"],
    metrics: ["Occupancy Rate", "Net Operating Income", "Rent Collection Rate", "Tenant Retention Rate", "Average Lease Term", "Cost per Square Foot", "Cap Rate"]
  },
  {
    id: "hospitality-hotels",
    name: "Hotel Management",
    industry: "Hospitality",
    description: "Hotel operations management covering reservations, front desk operations, housekeeping, revenue management, and guest services for hotels and resorts.",
    keywords: ["hotel", "reservation", "guest", "room", "check-in", "check-out", "housekeeping", "concierge", "front desk", "rate", "occupancy", "amenity", "booking", "PMS"],
    coreEntities: [
      {
        name: "Guest",
        description: "Hotel guest with reservation or walk-in",
        typicalFields: ["guestId", "fullName", "email", "phone", "loyaltyTier", "preferences", "stayHistory", "idDocument"],
        validations: ["valid ID required at check-in", "credit card authorization required"]
      },
      {
        name: "Reservation",
        description: "Room booking for specific dates",
        typicalFields: ["reservationId", "guestId", "roomType", "checkIn", "checkOut", "rate", "status", "specialRequests"],
        validations: ["check-out must be after check-in", "room type must be available for dates"]
      },
      {
        name: "Room",
        description: "Individual hotel room or suite",
        typicalFields: ["roomNumber", "type", "floor", "status", "maxOccupancy", "amenities", "rateCategory", "lastCleaned"],
        validations: ["status must reflect current condition", "maintenance rooms cannot be assigned"]
      },
      {
        name: "Folio",
        description: "Guest bill accumulating charges during stay",
        typicalFields: ["folioId", "guestId", "reservationId", "charges", "payments", "balance", "status"],
        validations: ["balance must be settled at check-out", "incidental charges require guest signature"]
      },
      {
        name: "HousekeepingTask",
        description: "Room cleaning and maintenance assignment",
        typicalFields: ["taskId", "roomNumber", "type", "assignedTo", "priority", "status", "completedAt", "inspectedBy"],
        validations: ["room must be inspected after cleaning", "stayover service by guest request"]
      },
      {
        name: "RateCode",
        description: "Pricing structure for room types",
        typicalFields: ["rateCode", "name", "roomType", "baseRate", "seasonalAdjustment", "restrictions", "validDates"]
      }
    ],
    workflows: [
      {
        name: "Guest Check-In",
        steps: ["Retrieve reservation", "Verify guest identity", "Assign room", "Create folio", "Authorize payment method", "Issue key cards", "Inform about amenities and services", "Update room status"],
        triggers: ["Guest arrival", "Scheduled check-in time"]
      },
      {
        name: "Guest Check-Out",
        steps: ["Review folio charges", "Process final charges", "Settle payment", "Return key cards", "Update room status to dirty", "Generate housekeeping task", "Request guest feedback", "Update loyalty points"],
        triggers: ["Guest request", "Scheduled check-out time"]
      },
      {
        name: "Housekeeping Operations",
        steps: ["Generate daily room assignment sheets", "Prioritize departures and arrivals", "Clean and restock rooms", "Inspect cleaned rooms", "Update room status", "Report maintenance issues"],
        triggers: ["Daily shift start", "Guest check-out", "Guest request"]
      },
      {
        name: "Revenue Management",
        steps: ["Analyze occupancy forecasts", "Review competitor pricing", "Adjust rates by demand", "Update distribution channels", "Monitor booking pace", "Optimize channel allocation"],
        triggers: ["Daily rate review", "Occupancy threshold change", "Special event approaching"]
      }
    ],
    businessRules: [
      "Reservations require credit card guarantee or advance deposit",
      "Cancellation within 24 hours of check-in incurs one night charge",
      "Check-in time is 3 PM; early check-in subject to availability",
      "Check-out time is 11 AM; late check-out charged half daily rate",
      "Loyalty members receive automatic room upgrade when available",
      "Group reservations of 10+ rooms qualify for group rate",
      "Do Not Disturb requests override housekeeping schedule",
      "Incidental hold of $100 per night required at check-in"
    ],
    terminology: {
      "PMS": "Property Management System - hotel operations software",
      "ADR": "Average Daily Rate - average revenue per occupied room",
      "RevPAR": "Revenue Per Available Room - total room revenue divided by available rooms",
      "OTA": "Online Travel Agency - third-party booking platform",
      "Rack Rate": "Published standard room rate before discounts",
      "Folio": "Guest account tracking all charges during stay",
      "Overbooking": "Accepting more reservations than available rooms to offset cancellations",
      "Walk": "Relocating guest to another hotel due to overbooking",
      "Turndown Service": "Evening room preparation including bed preparation",
      "Comp": "Complimentary service or room provided at no charge",
      "Yield Management": "Dynamic pricing strategy based on demand forecasting"
    },
    regulations: ["ADA Accessibility", "Fire Safety Codes", "Health Department Requirements", "Liquor Licensing", "Tourism Taxes", "Data Privacy Laws"],
    integrations: ["Property Management Systems", "Channel Managers", "Online Travel Agencies", "POS Systems", "Key Card Systems", "Guest Communication Platforms"],
    metrics: ["Occupancy Rate", "Average Daily Rate", "Revenue Per Available Room", "Guest Satisfaction Score", "Direct Booking Ratio", "Housekeeping Efficiency"]
  },
  {
    id: "hospitality-restaurants",
    name: "Restaurant Management",
    industry: "Hospitality",
    description: "Restaurant operations management covering table reservations, order management, kitchen operations, inventory control, staff scheduling, and customer experience.",
    keywords: ["restaurant", "menu", "order", "table", "reservation", "kitchen", "chef", "server", "POS", "inventory", "recipe", "catering", "takeout", "delivery"],
    coreEntities: [
      {
        name: "MenuItem",
        description: "Dish or beverage offered on the menu",
        typicalFields: ["itemId", "name", "category", "price", "description", "ingredients", "allergens", "preparationTime"],
        validations: ["price must be positive", "allergens must be listed", "ingredients must reference inventory items"]
      },
      {
        name: "Order",
        description: "Customer food and beverage order",
        typicalFields: ["orderId", "tableId", "serverId", "items", "subtotal", "tax", "tip", "total", "status"],
        validations: ["items must be available on current menu", "order must be assigned to active server"]
      },
      {
        name: "Table",
        description: "Physical dining table in the restaurant",
        typicalFields: ["tableId", "number", "capacity", "section", "status", "serverId", "currentOrderId"],
        validations: ["party size must not exceed capacity", "status must reflect current occupancy"]
      },
      {
        name: "Reservation",
        description: "Table booking for specific date and time",
        typicalFields: ["reservationId", "guestName", "phone", "partySize", "dateTime", "tableId", "specialRequests", "status"],
        validations: ["party size must have matching table available", "reservation within operating hours"]
      },
      {
        name: "InventoryItem",
        description: "Food or beverage ingredient in stock",
        typicalFields: ["itemId", "name", "category", "quantity", "unit", "reorderPoint", "supplier", "expirationDate"],
        validations: ["expired items must be discarded", "quantity below reorder point triggers alert"]
      },
      {
        name: "Employee",
        description: "Restaurant staff member",
        typicalFields: ["employeeId", "fullName", "role", "schedule", "hourlyRate", "certifications", "hireDate"],
        validations: ["food handler certification required", "minors restricted from serving alcohol"]
      }
    ],
    workflows: [
      {
        name: "Dine-In Service",
        steps: ["Seat guests", "Present menus", "Take drink order", "Take food order", "Submit to kitchen", "Serve courses", "Check on table", "Present bill", "Process payment", "Bus and reset table"],
        triggers: ["Guest arrival", "Reservation time"]
      },
      {
        name: "Kitchen Operations",
        steps: ["Receive order ticket", "Prioritize by course and timing", "Prep ingredients", "Cook dishes", "Quality check", "Plate and garnish", "Notify server for pickup"],
        triggers: ["New order submitted", "Course timing"]
      },
      {
        name: "Inventory Management",
        steps: ["Daily inventory count", "Compare to par levels", "Generate purchase orders", "Receive deliveries", "Inspect quality and quantity", "Store properly", "Update inventory records"],
        triggers: ["Daily opening prep", "Delivery scheduled", "Item below par level"]
      },
      {
        name: "Reservation Management",
        steps: ["Receive reservation request", "Check availability", "Assign table", "Confirm with guest", "Send reminder", "Prepare table before arrival", "Mark no-show if applicable"],
        triggers: ["Phone call", "Online booking", "Walk-in request"]
      }
    ],
    businessRules: [
      "Food cost should not exceed 30% of menu price",
      "FIFO (First In First Out) required for all perishable inventory",
      "All staff must have current food handler certification",
      "Reservations held for 15 minutes past scheduled time before releasing table",
      "86'd items must be immediately removed from POS and communicated to servers",
      "Alcohol service requires valid ID for guests appearing under 30",
      "Gratuity automatically added for parties of 8 or more",
      "Kitchen tickets prioritized by course timing and table wait"
    ],
    terminology: {
      "POS": "Point of Sale - system for processing orders and payments",
      "86'd": "Item no longer available due to stock depletion",
      "Mise en Place": "Preparation and arrangement of ingredients before cooking",
      "FIFO": "First In First Out - inventory rotation method",
      "Covers": "Number of guests served in a given period",
      "Turn Time": "Duration a table is occupied from seating to clearing",
      "Par Level": "Minimum inventory quantity that must be maintained",
      "Comp": "Complimentary item provided at no charge",
      "Ticket Time": "Duration from order submission to food delivery",
      "Food Cost": "Ratio of ingredient cost to menu selling price",
      "Pre-Shift": "Staff meeting before service begins",
      "Section": "Group of tables assigned to one server"
    },
    regulations: ["Health Department Inspections", "Food Safety Regulations", "Liquor Licensing Laws", "Fire Safety Codes", "Labor Laws", "ADA Accessibility"],
    integrations: ["POS Systems", "Online Ordering Platforms", "Delivery Services", "Reservation Platforms", "Accounting Software", "Supplier Ordering Systems"],
    metrics: ["Average Ticket Size", "Table Turn Rate", "Food Cost Percentage", "Labor Cost Percentage", "Customer Satisfaction Score", "Revenue per Available Seat Hour"]
  },
  {
    id: "legal-lawfirm",
    name: "Law Firm Management",
    industry: "Legal",
    description: "Law firm practice management covering case management, client intake, time tracking, billing, document management, and court filing coordination.",
    keywords: ["attorney", "case", "client", "billing", "court", "litigation", "contract", "deposition", "discovery", "docket", "retainer", "paralegal", "brief", "settlement"],
    coreEntities: [
      {
        name: "Case",
        description: "Legal matter being handled by the firm",
        typicalFields: ["caseId", "clientId", "caseType", "court", "opposingParty", "status", "assignedAttorneys", "filingDate"],
        validations: ["conflicts check must be completed", "statute of limitations must be tracked"]
      },
      {
        name: "Client",
        description: "Individual or entity receiving legal services",
        typicalFields: ["clientId", "name", "type", "contactInfo", "engagementLetter", "billingArrangement", "conflictsChecked"],
        validations: ["engagement letter must be signed", "conflicts check must be clear"]
      },
      {
        name: "TimeEntry",
        description: "Billable or non-billable time record",
        typicalFields: ["entryId", "attorneyId", "caseId", "date", "hours", "description", "billable", "rate"],
        validations: ["minimum billing increment is 0.1 hours", "description must be sufficiently detailed for billing"]
      },
      {
        name: "Invoice",
        description: "Client billing statement",
        typicalFields: ["invoiceId", "clientId", "caseId", "timeCharges", "expenses", "total", "dueDate", "status"],
        validations: ["pre-bill review required before sending", "retainer balance applied before billing"]
      },
      {
        name: "Document",
        description: "Legal document associated with a case",
        typicalFields: ["documentId", "caseId", "title", "type", "version", "author", "filedDate", "confidential"],
        validations: ["privileged documents must be marked", "filed documents must track court receipt confirmation"]
      },
      {
        name: "Attorney",
        description: "Licensed lawyer practicing at the firm",
        typicalFields: ["attorneyId", "fullName", "barNumber", "practiceAreas", "billingRate", "caseload", "partner"],
        validations: ["bar license must be active", "conflicts must be checked for each new case"]
      }
    ],
    workflows: [
      {
        name: "Client Intake",
        steps: ["Initial consultation", "Conflicts check", "Evaluate matter", "Fee arrangement discussion", "Engagement letter preparation", "Client signature", "Open matter in system", "Assign team"],
        triggers: ["Client inquiry", "Referral received"]
      },
      {
        name: "Litigation Management",
        steps: ["File complaint or answer", "Discovery planning", "Document review and production", "Depositions", "Motion practice", "Pre-trial preparation", "Trial", "Post-trial motions or appeal"],
        triggers: ["Case filing", "Court scheduling order"]
      },
      {
        name: "Billing Cycle",
        steps: ["Generate pre-bills from time entries", "Attorney review and edits", "Partner approval", "Generate final invoices", "Send to clients", "Track payments", "Follow up on overdue accounts"],
        triggers: ["Monthly billing cycle", "Matter completion"]
      },
      {
        name: "Document Management",
        steps: ["Create or receive document", "Classify and index", "Review and approve", "File in case management system", "Version control tracking", "Retention scheduling"],
        triggers: ["Document creation", "Court filing", "Client communication"]
      }
    ],
    businessRules: [
      "Conflicts check required before opening any new matter",
      "Engagement letters must be signed before billable work begins",
      "Trust account funds cannot be commingled with operating funds",
      "Statute of limitations must be calendared and monitored",
      "Pre-bills must be reviewed by billing attorney before client delivery",
      "Confidential documents require restricted access controls",
      "Time entries must be recorded within 24 hours of work performed",
      "Retainer replenishment required when balance falls below threshold"
    ],
    terminology: {
      "Retainer": "Advance payment held in trust for future legal services",
      "Billable Hour": "Time spent on client work that can be charged to the client",
      "Conflicts Check": "Review to ensure no conflict of interest with new client or matter",
      "Discovery": "Pre-trial process of exchanging information between parties",
      "Deposition": "Sworn out-of-court testimony recorded for use in trial",
      "Docket": "Schedule of court proceedings and deadlines",
      "Brief": "Written legal argument submitted to court",
      "Pleading": "Formal written statement filed with the court",
      "IOLTA": "Interest on Lawyers Trust Accounts - client fund management",
      "Pro Bono": "Legal services provided without charge for public good",
      "Statute of Limitations": "Time limit for filing a legal action",
      "Engagement Letter": "Agreement defining scope of legal representation"
    },
    regulations: ["State Bar Rules of Professional Conduct", "ABA Model Rules", "IOLTA Regulations", "Court Filing Rules", "E-Discovery Rules", "Client Confidentiality Rules"],
    integrations: ["Case Management Systems", "E-Filing Platforms", "Document Management Systems", "Time and Billing Software", "E-Discovery Platforms", "Court Calendar Systems"],
    metrics: ["Billable Hours per Attorney", "Realization Rate", "Collection Rate", "Revenue per Lawyer", "Client Retention Rate", "Cases Won Percentage"]
  },
  {
    id: "legal-compliance",
    name: "Regulatory Compliance",
    industry: "Legal",
    description: "Enterprise compliance management covering regulatory tracking, policy management, risk assessment, audit coordination, and reporting for organizations across industries.",
    keywords: ["compliance", "regulation", "audit", "risk", "policy", "control", "governance", "reporting", "violation", "remediation", "SOX", "GDPR", "whistleblower"],
    coreEntities: [
      {
        name: "Regulation",
        description: "Applicable law or regulatory requirement",
        typicalFields: ["regulationId", "name", "jurisdiction", "effectiveDate", "requirements", "applicableDepartments", "penaltyRange"],
        validations: ["effective date must be tracked", "requirements must be mapped to controls"]
      },
      {
        name: "Policy",
        description: "Internal compliance policy document",
        typicalFields: ["policyId", "title", "version", "owner", "approvedDate", "reviewDate", "scope", "relatedRegulations"],
        validations: ["must be reviewed annually", "version must be incremented on changes"]
      },
      {
        name: "Control",
        description: "Internal control procedure mitigating compliance risk",
        typicalFields: ["controlId", "name", "type", "owner", "frequency", "evidence", "effectiveness", "relatedRisks"],
        validations: ["effectiveness must be tested periodically", "evidence must be documented"]
      },
      {
        name: "RiskAssessment",
        description: "Evaluation of compliance risk for specific area",
        typicalFields: ["assessmentId", "area", "inherentRisk", "controlEffectiveness", "residualRisk", "mitigationPlan", "assessor"],
        validations: ["residual risk must be calculated from inherent risk minus control effectiveness"]
      },
      {
        name: "Audit",
        description: "Internal or external compliance audit",
        typicalFields: ["auditId", "scope", "auditor", "startDate", "endDate", "findings", "recommendations", "status"],
        validations: ["findings must be documented with evidence", "remediation plans required for all findings"]
      },
      {
        name: "Incident",
        description: "Compliance violation or near-miss event",
        typicalFields: ["incidentId", "type", "description", "reportedBy", "dateOccurred", "severity", "rootCause", "remediation"]
      }
    ],
    workflows: [
      {
        name: "Regulatory Change Management",
        steps: ["Monitor regulatory updates", "Assess impact on organization", "Identify affected policies and controls", "Update policies", "Communicate changes to stakeholders", "Train affected employees", "Verify implementation"],
        triggers: ["New regulation published", "Regulation amendment", "Regulatory alert"]
      },
      {
        name: "Internal Audit",
        steps: ["Define audit scope and objectives", "Develop audit plan", "Conduct fieldwork", "Document findings", "Draft audit report", "Management response", "Track remediation", "Close audit"],
        triggers: ["Annual audit plan", "Risk-based scheduling", "Regulatory requirement"]
      },
      {
        name: "Incident Management",
        steps: ["Receive incident report", "Initial assessment and classification", "Investigation", "Root cause analysis", "Implement corrective actions", "Regulatory notification if required", "Close incident and document lessons learned"],
        triggers: ["Whistleblower report", "Self-identified violation", "External notification"]
      },
      {
        name: "Risk Assessment Cycle",
        steps: ["Identify compliance risks", "Evaluate likelihood and impact", "Assess existing controls", "Calculate residual risk", "Develop mitigation plans", "Present to compliance committee", "Monitor and reassess"],
        triggers: ["Annual assessment cycle", "New business activity", "Regulatory change"]
      }
    ],
    businessRules: [
      "All policies must be reviewed and approved annually",
      "High-severity compliance incidents must be reported to management within 24 hours",
      "Regulatory changes must be assessed within 30 days of publication",
      "Audit findings must have remediation plans with defined deadlines",
      "Whistleblower reports must be investigated independently",
      "Employee compliance training completion tracked and reported quarterly",
      "Third-party vendors must undergo compliance due diligence",
      "Data breaches must be reported per applicable regulation timelines"
    ],
    terminology: {
      "SOX": "Sarbanes-Oxley Act - financial reporting and internal controls regulation",
      "GDPR": "General Data Protection Regulation - EU data privacy law",
      "GRC": "Governance, Risk, and Compliance - integrated management approach",
      "Control Testing": "Evaluation of whether internal controls are operating effectively",
      "Residual Risk": "Risk remaining after controls are applied",
      "Inherent Risk": "Risk level before any controls or mitigations",
      "Remediation": "Corrective action taken to address compliance gap",
      "Due Diligence": "Investigation of compliance status before business decisions",
      "Whistleblower": "Person reporting suspected violations internally or externally",
      "Materiality": "Threshold above which violations are considered significant",
      "Risk Appetite": "Level of risk an organization is willing to accept"
    },
    regulations: ["SOX", "GDPR", "CCPA", "HIPAA", "PCI DSS", "FCPA", "Dodd-Frank Whistleblower Provisions", "Industry-Specific Regulations"],
    integrations: ["GRC Platforms", "Regulatory Intelligence Services", "Audit Management Systems", "Training Platforms", "Incident Management Systems", "Document Management Systems"],
    metrics: ["Compliance Score", "Open Audit Findings", "Policy Review Completion Rate", "Training Completion Rate", "Incident Count by Severity", "Remediation Timeliness"]
  },
  {
    id: "manufacturing-production",
    name: "Manufacturing Production",
    industry: "Manufacturing",
    description: "Manufacturing production management covering production planning, work orders, bill of materials, shop floor operations, and supply chain coordination.",
    keywords: ["production", "manufacturing", "work order", "BOM", "assembly", "machine", "shift", "yield", "throughput", "MRP", "ERP", "lean", "WIP", "shop floor"],
    coreEntities: [
      {
        name: "Product",
        description: "Finished good produced by the manufacturing process",
        typicalFields: ["productId", "name", "sku", "category", "unitOfMeasure", "bom", "standardCost", "leadTime"],
        validations: ["BOM must be defined before production", "SKU must be unique"]
      },
      {
        name: "WorkOrder",
        description: "Production order for manufacturing specific quantity",
        typicalFields: ["workOrderId", "productId", "quantity", "startDate", "dueDate", "status", "priority", "assignedLine"],
        validations: ["materials must be available or on order", "due date must allow for lead time"]
      },
      {
        name: "BillOfMaterials",
        description: "List of raw materials and components for a product",
        typicalFields: ["bomId", "productId", "components", "quantities", "unitCosts", "assemblyInstructions", "version"],
        validations: ["all components must have valid inventory records", "version must be current"]
      },
      {
        name: "Machine",
        description: "Production equipment on the shop floor",
        typicalFields: ["machineId", "name", "type", "location", "capacity", "maintenanceSchedule", "status", "operator"],
        validations: ["maintenance must be current", "capacity must not be exceeded"]
      },
      {
        name: "InventoryItem",
        description: "Raw material or component in stock",
        typicalFields: ["itemId", "name", "quantity", "unit", "location", "reorderPoint", "supplier", "lotNumber"],
        validations: ["lot tracking required for regulated materials", "FIFO consumption enforced"]
      },
      {
        name: "ProductionRun",
        description: "Execution record of a work order batch",
        typicalFields: ["runId", "workOrderId", "machineId", "startTime", "endTime", "quantityProduced", "quantityRejected", "operator"]
      }
    ],
    workflows: [
      {
        name: "Production Planning",
        steps: ["Receive demand forecast or sales orders", "MRP explosion for material requirements", "Check material availability", "Create work orders", "Schedule production runs", "Allocate machines and labor", "Release to shop floor"],
        triggers: ["Sales order received", "Demand forecast update", "Inventory below safety stock"]
      },
      {
        name: "Work Order Execution",
        steps: ["Release work order", "Pick materials from inventory", "Set up machine", "Run production", "In-process quality checks", "Record output and scrap", "Move to finished goods", "Close work order"],
        triggers: ["Work order release", "Scheduled production time"]
      },
      {
        name: "Material Procurement",
        steps: ["Identify material requirements", "Check existing inventory", "Create purchase requisition", "Approve and convert to purchase order", "Send to supplier", "Receive and inspect materials", "Put away to inventory"],
        triggers: ["MRP planned order", "Reorder point reached", "Manual requisition"]
      },
      {
        name: "Equipment Maintenance",
        steps: ["Generate maintenance schedule", "Notify maintenance team", "Take machine offline", "Perform maintenance tasks", "Test and verify", "Return to service", "Update maintenance records"],
        triggers: ["Scheduled preventive maintenance", "Machine breakdown", "Performance degradation"]
      }
    ],
    businessRules: [
      "Work orders cannot be released without sufficient material availability",
      "Machine setup changes require quality first article inspection",
      "Lot traceability required for all regulated product components",
      "Scrap rate exceeding 5% triggers production review",
      "Preventive maintenance cannot be deferred more than one week",
      "First-in-first-out consumption enforced for all raw materials",
      "Production schedules must account for machine capacity constraints",
      "Quality hold prevents shipment until release by QA"
    ],
    terminology: {
      "BOM": "Bill of Materials - list of components needed to manufacture a product",
      "MRP": "Material Requirements Planning - system for planning material needs",
      "WIP": "Work in Progress - partially completed goods on the production floor",
      "OEE": "Overall Equipment Effectiveness - measure of machine productivity",
      "Throughput": "Rate of production output per unit of time",
      "Yield": "Percentage of good units produced versus total units started",
      "Changeover": "Process of converting machine from one product to another",
      "Kanban": "Visual signal system for pull-based production scheduling",
      "Takt Time": "Available production time divided by customer demand rate",
      "First Article": "First unit produced after setup for quality verification",
      "Safety Stock": "Extra inventory maintained as buffer against demand variability"
    },
    regulations: ["OSHA Workplace Safety", "EPA Environmental Regulations", "ISO 9001 Quality Management", "Industry-Specific Manufacturing Standards", "Hazardous Materials Handling"],
    integrations: ["ERP Systems", "MES Systems", "SCADA Systems", "Supplier Portals", "Quality Management Systems", "Warehouse Management Systems"],
    metrics: ["Overall Equipment Effectiveness", "Production Yield", "Throughput Rate", "Scrap Rate", "On-Time Delivery Rate", "Inventory Turns"]
  },
  {
    id: "manufacturing-quality",
    name: "Quality Control",
    industry: "Manufacturing",
    description: "Quality control and assurance management covering inspection protocols, non-conformance tracking, corrective actions, calibration management, and regulatory compliance.",
    keywords: ["quality", "inspection", "non-conformance", "CAPA", "calibration", "audit", "ISO", "specification", "testing", "defect", "SPC", "control chart", "tolerance"],
    coreEntities: [
      {
        name: "InspectionPlan",
        description: "Defined quality checks for a product or process",
        typicalFields: ["planId", "productId", "checkpoints", "acceptanceCriteria", "samplingMethod", "frequency", "version"],
        validations: ["acceptance criteria must reference specifications", "sampling method must be statistically valid"]
      },
      {
        name: "InspectionRecord",
        description: "Results of quality inspection performed",
        typicalFields: ["recordId", "planId", "inspector", "date", "measurements", "result", "lotNumber", "disposition"],
        validations: ["measurements must be within calibrated instrument range", "fail disposition requires NCR"]
      },
      {
        name: "NonConformance",
        description: "Documentation of quality deviation or defect",
        typicalFields: ["ncrId", "source", "description", "severity", "affectedLot", "containmentAction", "disposition", "status"],
        validations: ["containment action required within 24 hours", "root cause analysis required for critical severity"]
      },
      {
        name: "CorrectiveAction",
        description: "Action taken to prevent recurrence of non-conformance",
        typicalFields: ["capaId", "ncrId", "rootCause", "correctiveAction", "preventiveAction", "responsiblePerson", "dueDate", "status"],
        validations: ["effectiveness verification required after implementation", "due date must be defined"]
      },
      {
        name: "CalibrationRecord",
        description: "Instrument calibration verification record",
        typicalFields: ["calibrationId", "instrumentId", "calibrationDate", "nextDueDate", "standard", "result", "certificateNumber"],
        validations: ["instruments past due for calibration must be taken out of service", "standards must be traceable to NIST"]
      },
      {
        name: "Specification",
        description: "Product or material quality requirements",
        typicalFields: ["specId", "name", "parameters", "tolerances", "testMethods", "version", "approvedBy"]
      }
    ],
    workflows: [
      {
        name: "Incoming Material Inspection",
        steps: ["Receive material shipment", "Sample per inspection plan", "Perform tests and measurements", "Compare to specifications", "Accept or reject lot", "Create NCR if rejected", "Release to inventory or return to supplier"],
        triggers: ["Material receipt", "Supplier delivery"]
      },
      {
        name: "CAPA Process",
        steps: ["Identify non-conformance", "Immediate containment action", "Root cause investigation", "Determine corrective action", "Implement corrective action", "Implement preventive action", "Verify effectiveness", "Close CAPA"],
        triggers: ["NCR creation", "Customer complaint", "Audit finding"]
      },
      {
        name: "Calibration Management",
        steps: ["Generate calibration schedule", "Notify instrument owners", "Perform calibration", "Document results", "Apply calibration label", "Return to service or quarantine if failed", "Update calibration records"],
        triggers: ["Calibration due date", "New instrument acquisition", "Out-of-tolerance discovery"]
      },
      {
        name: "Quality Audit",
        steps: ["Define audit scope", "Prepare audit checklist", "Conduct audit", "Document findings", "Present results to management", "Create CAPAs for findings", "Track corrective action completion"],
        triggers: ["Internal audit schedule", "Customer audit request", "Certification audit"]
      }
    ],
    businessRules: [
      "All measuring instruments must have current calibration before use",
      "Non-conforming material must be segregated and identified immediately",
      "Root cause analysis required for all critical and major non-conformances",
      "CAPA effectiveness must be verified within 90 days of implementation",
      "Customer complaints must be responded to within 48 hours",
      "Statistical process control charts must be maintained for critical parameters",
      "Supplier quality scores below threshold trigger corrective action or replacement",
      "Document control requires approval signatures before release"
    ],
    terminology: {
      "CAPA": "Corrective and Preventive Action - systematic approach to resolving quality issues",
      "NCR": "Non-Conformance Report - documentation of quality deviation",
      "SPC": "Statistical Process Control - using statistics to monitor manufacturing processes",
      "AQL": "Acceptable Quality Level - maximum defect rate considered acceptable",
      "Cpk": "Process Capability Index - measure of process capability relative to specifications",
      "Traceability": "Ability to track material from raw material through finished product",
      "Root Cause": "Fundamental reason for a non-conformance or failure",
      "Containment": "Immediate action to prevent further impact of a quality issue",
      "First Pass Yield": "Percentage of units passing quality on first inspection",
      "Disposition": "Decision on how to handle non-conforming material",
      "Calibration": "Process of verifying and adjusting instrument accuracy against known standards"
    },
    regulations: ["ISO 9001", "ISO 13485 (Medical Devices)", "AS9100 (Aerospace)", "IATF 16949 (Automotive)", "FDA 21 CFR Part 820", "GMP Requirements"],
    integrations: ["Quality Management Systems", "ERP Systems", "Laboratory Information Systems", "Calibration Management Software", "Document Control Systems"],
    metrics: ["First Pass Yield", "Defect Rate", "CAPA Closure Rate", "Calibration Compliance", "Customer Complaint Rate", "Cost of Poor Quality", "Supplier Quality Score"]
  },
  {
    id: "agriculture-farming",
    name: "Farming Operations",
    industry: "Agriculture",
    description: "Farm management system covering crop planning, field management, equipment tracking, weather monitoring, and harvest operations for agricultural producers.",
    keywords: ["crop", "field", "harvest", "irrigation", "fertilizer", "pesticide", "soil", "yield", "planting", "seed", "tractor", "weather", "organic", "precision agriculture"],
    coreEntities: [
      {
        name: "Field",
        description: "Agricultural land parcel used for crop production",
        typicalFields: ["fieldId", "name", "acreage", "soilType", "gpsCoordinates", "currentCrop", "irrigationType", "lastSoilTest"],
        validations: ["acreage must be positive", "soil test must be within 3 years"]
      },
      {
        name: "Crop",
        description: "Plant species being cultivated",
        typicalFields: ["cropId", "name", "variety", "plantingDate", "expectedHarvest", "growingSeason", "waterRequirements", "fieldId"],
        validations: ["planting date must align with growing season", "variety must be suitable for soil type"]
      },
      {
        name: "Input",
        description: "Agricultural input such as seed, fertilizer, or pesticide",
        typicalFields: ["inputId", "name", "type", "quantity", "unit", "applicationRate", "supplier", "cost"],
        validations: ["pesticide must have EPA registration", "application rate must not exceed label maximum"]
      },
      {
        name: "Equipment",
        description: "Farm machinery and equipment",
        typicalFields: ["equipmentId", "name", "type", "make", "model", "hoursUsed", "maintenanceSchedule", "status"],
        validations: ["maintenance must be current", "operators must be certified for equipment type"]
      },
      {
        name: "HarvestRecord",
        description: "Record of crop harvesting activity",
        typicalFields: ["harvestId", "fieldId", "cropId", "date", "quantity", "quality", "moistureContent", "storageLocation"],
        validations: ["moisture content must be within acceptable range for storage", "quality grade must be assigned"]
      },
      {
        name: "WeatherData",
        description: "Weather conditions affecting farm operations",
        typicalFields: ["dataId", "date", "temperature", "precipitation", "humidity", "windSpeed", "forecast", "stationId"]
      }
    ],
    workflows: [
      {
        name: "Crop Planning",
        steps: ["Review soil test results", "Select crop varieties", "Plan crop rotation", "Calculate input requirements", "Order seeds and inputs", "Prepare field schedules", "Budget projections"],
        triggers: ["Pre-season planning period", "Soil test results received"]
      },
      {
        name: "Planting Operations",
        steps: ["Prepare soil and seedbed", "Calibrate planting equipment", "Plant crop", "Record planting data", "Apply pre-emergent treatments", "Monitor germination", "Assess stand establishment"],
        triggers: ["Soil temperature conditions met", "Weather window available"]
      },
      {
        name: "Crop Monitoring",
        steps: ["Scout fields for pests and disease", "Monitor growth stages", "Check soil moisture", "Apply irrigation as needed", "Apply fertilizer per schedule", "Document observations", "Adjust management plan"],
        triggers: ["Weekly scouting schedule", "Weather event", "Growth stage milestone"]
      },
      {
        name: "Harvest Operations",
        steps: ["Assess crop maturity", "Prepare harvest equipment", "Harvest crop", "Test moisture and quality", "Transport to storage or market", "Record yield data", "Plan field post-harvest"],
        triggers: ["Crop maturity indicators", "Weather window", "Market timing"]
      }
    ],
    businessRules: [
      "Crop rotation must follow soil conservation guidelines",
      "Pesticide applications must comply with EPA label instructions",
      "Organic certification requires 3-year transition period without prohibited substances",
      "Irrigation scheduling based on soil moisture monitoring and crop stage",
      "Equipment maintenance performed during off-season or per hour intervals",
      "Harvest moisture must be below threshold for safe storage",
      "Field records maintained for minimum 3 years for regulatory compliance"
    ],
    terminology: {
      "Crop Rotation": "Practice of growing different crops sequentially on same land",
      "Precision Agriculture": "Technology-driven approach to optimize field management",
      "Bushel": "Unit of measure for grain crops",
      "Yield": "Amount of crop produced per unit area",
      "IPM": "Integrated Pest Management - sustainable pest control approach",
      "No-Till": "Planting method without disturbing soil through tillage",
      "Cover Crop": "Crop planted to protect and enrich soil between production seasons",
      "Pre-Emergent": "Herbicide applied before weed seedlings emerge",
      "Stand Count": "Number of plants established per unit area",
      "Soil Amendment": "Material added to soil to improve its properties",
      "Growing Degree Days": "Heat accumulation measure for predicting crop development"
    },
    regulations: ["EPA Pesticide Regulations", "USDA Organic Certification", "Clean Water Act", "Farm Bill Programs", "State Agricultural Regulations", "Worker Protection Standard"],
    integrations: ["Weather Services", "GPS and Mapping Systems", "Soil Testing Laboratories", "Commodity Markets", "Equipment Telematics", "Farm Management Software"],
    metrics: ["Yield per Acre", "Cost per Bushel", "Input Cost per Acre", "Water Usage Efficiency", "Revenue per Acre", "Equipment Utilization Rate"]
  },
  {
    id: "agriculture-livestock",
    name: "Livestock Management",
    industry: "Agriculture",
    description: "Livestock farm management covering animal tracking, breeding programs, health records, feed management, and production monitoring for cattle, poultry, and other livestock.",
    keywords: ["livestock", "cattle", "herd", "breeding", "feed", "veterinary", "milk", "meat", "poultry", "pasture", "barn", "tag", "weight gain", "gestation"],
    coreEntities: [
      {
        name: "Animal",
        description: "Individual livestock animal in the herd",
        typicalFields: ["animalId", "tagNumber", "species", "breed", "dateOfBirth", "sex", "sire", "dam", "weight"],
        validations: ["tag number must be unique", "parentage must reference existing animals"]
      },
      {
        name: "Herd",
        description: "Group of animals managed together",
        typicalFields: ["herdId", "name", "species", "headCount", "location", "manager", "purpose"],
        validations: ["head count must match actual animal records", "location must be valid facility"]
      },
      {
        name: "HealthRecord",
        description: "Veterinary and health documentation for animal",
        typicalFields: ["recordId", "animalId", "date", "type", "treatment", "veterinarian", "medications", "followUp"],
        validations: ["withdrawal periods must be tracked for treated animals", "vaccinations must follow schedule"]
      },
      {
        name: "BreedingRecord",
        description: "Breeding activity and reproductive tracking",
        typicalFields: ["breedingId", "damId", "sireId", "breedingDate", "method", "expectedDueDate", "result", "offspringId"],
        validations: ["breeding age requirements must be met", "gestation period tracked for due date"]
      },
      {
        name: "FeedRecord",
        description: "Feed ration and consumption tracking",
        typicalFields: ["feedId", "herdId", "date", "feedType", "quantity", "nutritionalContent", "cost"],
        validations: ["ration must meet nutritional requirements for species and stage", "medicated feed requires veterinary authorization"]
      },
      {
        name: "ProductionRecord",
        description: "Output tracking for milk, eggs, or other products",
        typicalFields: ["recordId", "animalId", "date", "productType", "quantity", "quality", "destination"]
      }
    ],
    workflows: [
      {
        name: "Animal Intake",
        steps: ["Assign identification tag", "Record animal details", "Health screening", "Quarantine period", "Vaccinations", "Assign to herd", "Begin feed program"],
        triggers: ["New birth", "Animal purchase", "Transfer from another facility"]
      },
      {
        name: "Breeding Cycle",
        steps: ["Evaluate breeding readiness", "Select sire and dam pairing", "Perform breeding or AI", "Confirm pregnancy", "Monitor gestation", "Prepare for birthing", "Record offspring", "Post-partum care"],
        triggers: ["Breeding season", "Animal reaches breeding age", "Estrus detection"]
      },
      {
        name: "Health Management",
        steps: ["Scheduled health checks", "Administer vaccinations", "Monitor for illness", "Veterinary treatment if needed", "Record withdrawal periods", "Track medication inventory", "Update health records"],
        triggers: ["Vaccination schedule", "Illness observation", "Routine health check"]
      },
      {
        name: "Market Preparation",
        steps: ["Evaluate animal market readiness", "Final health inspection", "Transport preparation", "Documentation and certificates", "Transport to market or processor", "Record sale details"],
        triggers: ["Target weight reached", "Market conditions favorable", "Herd management decision"]
      }
    ],
    businessRules: [
      "All animals must have unique identification per USDA requirements",
      "Antibiotic withdrawal periods must be observed before slaughter or milk collection",
      "Breeding records must track lineage to prevent inbreeding",
      "Medicated feed requires veterinary feed directive",
      "Animals showing signs of reportable disease must be isolated and authorities notified",
      "Transportation must comply with humane handling regulations",
      "Organic livestock cannot receive antibiotics and maintain certification"
    ],
    terminology: {
      "AI": "Artificial Insemination - breeding method using collected semen",
      "Gestation": "Pregnancy period from conception to birth",
      "Weaning": "Transition of young animal from mother's milk to solid feed",
      "Heifer": "Young female cow that has not yet calved",
      "Bull": "Intact male bovine used for breeding",
      "Steer": "Castrated male bovine raised for beef",
      "Calving": "Process of a cow giving birth",
      "Feed Conversion Ratio": "Amount of feed consumed per unit of weight gained",
      "ADG": "Average Daily Gain - rate of weight increase per day",
      "EPD": "Expected Progeny Difference - genetic merit prediction",
      "Withdrawal Period": "Required time between medication and slaughter or milking"
    },
    regulations: ["USDA Animal Identification", "Humane Slaughter Act", "Veterinary Feed Directive", "Organic Livestock Standards", "Interstate Transport Requirements", "Reportable Disease Regulations"],
    integrations: ["Herd Management Software", "Veterinary Services", "Feed Suppliers", "Livestock Markets", "Genetic Evaluation Services", "USDA Reporting Systems"],
    metrics: ["Average Daily Gain", "Feed Conversion Ratio", "Calving Rate", "Milk Production per Cow", "Mortality Rate", "Revenue per Head"]
  },
  {
    id: "logistics-shipping",
    name: "Shipping and Freight",
    industry: "Logistics",
    description: "Shipping and freight management covering shipment booking, carrier management, route optimization, tracking, customs clearance, and delivery coordination.",
    keywords: ["shipment", "freight", "carrier", "tracking", "customs", "container", "cargo", "bill of lading", "port", "delivery", "dispatch", "route", "LTL", "FTL"],
    coreEntities: [
      {
        name: "Shipment",
        description: "Goods being transported from origin to destination",
        typicalFields: ["shipmentId", "origin", "destination", "weight", "dimensions", "contents", "value", "status"],
        validations: ["weight must not exceed carrier limits", "hazardous materials require special documentation"]
      },
      {
        name: "Carrier",
        description: "Transportation company providing shipping services",
        typicalFields: ["carrierId", "name", "type", "serviceAreas", "rates", "transitTimes", "insuranceCoverage", "rating"],
        validations: ["operating authority must be active", "insurance must be current"]
      },
      {
        name: "Route",
        description: "Transportation path from origin to destination",
        typicalFields: ["routeId", "origin", "destination", "stops", "distance", "estimatedTime", "mode", "cost"],
        validations: ["route must be feasible for cargo type", "transit time must meet delivery requirements"]
      },
      {
        name: "TrackingEvent",
        description: "Status update during shipment transit",
        typicalFields: ["eventId", "shipmentId", "timestamp", "location", "status", "description", "reportedBy"],
        validations: ["timestamp must be sequential", "location must be valid"]
      },
      {
        name: "CustomsDeclaration",
        description: "International shipping customs documentation",
        typicalFields: ["declarationId", "shipmentId", "hsCode", "value", "origin", "destination", "duties", "status"],
        validations: ["HS code must be valid for goods", "commercial invoice required for customs clearance"]
      },
      {
        name: "BillOfLading",
        description: "Legal document between shipper and carrier",
        typicalFields: ["bolNumber", "shipmentId", "shipper", "consignee", "carrier", "goods", "terms", "issuedDate"]
      }
    ],
    workflows: [
      {
        name: "Shipment Booking",
        steps: ["Receive shipping request", "Calculate dimensions and weight", "Select carrier and service", "Generate rate quote", "Book shipment", "Generate shipping labels", "Schedule pickup", "Provide tracking number"],
        triggers: ["Customer shipping request", "Order fulfillment trigger"]
      },
      {
        name: "Freight Transit",
        steps: ["Pickup from origin", "Load onto transport", "In-transit tracking updates", "Transfer at hubs if needed", "Final mile delivery", "Proof of delivery capture", "Close shipment"],
        triggers: ["Shipment pickup", "Schedule departure"]
      },
      {
        name: "Customs Clearance",
        steps: ["Prepare customs documentation", "Submit declaration electronically", "Customs review and inspection", "Pay duties and taxes", "Receive clearance", "Release cargo", "Update shipment status"],
        triggers: ["International shipment arrival at port", "Pre-clearance submission"]
      },
      {
        name: "Exception Handling",
        steps: ["Detect shipment exception", "Notify stakeholders", "Investigate cause", "Determine resolution", "Implement corrective action", "Update delivery estimate", "Document for carrier performance"],
        triggers: ["Missed scan", "Delivery failure", "Damage report", "Customs hold"]
      }
    ],
    businessRules: [
      "Hazardous materials require certified carrier and special documentation",
      "International shipments must include commercial invoice and packing list",
      "Carrier selection optimized for cost, transit time, and reliability",
      "Proof of delivery required for all shipments",
      "Claims for damage must be filed within 9 months of delivery",
      "Temperature-controlled shipments monitored continuously",
      "Overweight or oversized loads require special permits"
    ],
    terminology: {
      "BOL": "Bill of Lading - contract between shipper and carrier",
      "LTL": "Less Than Truckload - partial truck shipping for smaller loads",
      "FTL": "Full Truckload - entire truck dedicated to one shipment",
      "FCL": "Full Container Load - entire shipping container for one consignment",
      "LCL": "Less than Container Load - shared container shipping",
      "HS Code": "Harmonized System Code - international product classification for customs",
      "POD": "Proof of Delivery - confirmation that shipment was delivered",
      "Demurrage": "Charges for exceeding free time at port or terminal",
      "Drayage": "Short-distance transport typically between port and warehouse",
      "Freight Class": "Classification system determining shipping rates based on characteristics",
      "Incoterms": "International Commercial Terms defining buyer/seller responsibilities"
    },
    regulations: ["DOT Regulations", "FMCSA Carrier Requirements", "Customs and Border Protection", "IATA Dangerous Goods Regulations", "IMO Maritime Safety", "TSA Air Cargo Security"],
    integrations: ["Carrier APIs", "Customs Brokers", "GPS Tracking Systems", "Transportation Management Systems", "Warehouse Management Systems", "Port Community Systems"],
    metrics: ["On-Time Delivery Rate", "Average Transit Time", "Cost per Shipment", "Damage Rate", "Carrier Performance Score", "Customs Clearance Time"]
  },
  {
    id: "logistics-warehousing",
    name: "Warehousing",
    industry: "Logistics",
    description: "Warehouse operations management covering receiving, putaway, storage, picking, packing, shipping, and inventory control for distribution and fulfillment centers.",
    keywords: ["warehouse", "inventory", "picking", "packing", "receiving", "putaway", "bin", "pallet", "forklift", "WMS", "barcode", "RFID", "cross-dock", "fulfillment"],
    coreEntities: [
      {
        name: "Location",
        description: "Storage position within the warehouse",
        typicalFields: ["locationId", "zone", "aisle", "rack", "level", "bin", "type", "capacity", "currentOccupancy"],
        validations: ["occupancy cannot exceed capacity", "hazmat locations must be designated"]
      },
      {
        name: "InventoryItem",
        description: "Product stored in the warehouse",
        typicalFields: ["itemId", "sku", "description", "quantity", "location", "lotNumber", "expirationDate", "weight"],
        validations: ["quantity must be non-negative", "expired items must be flagged"]
      },
      {
        name: "ReceivingOrder",
        description: "Inbound shipment expected at warehouse",
        typicalFields: ["receivingId", "purchaseOrder", "supplier", "expectedDate", "items", "status", "dock"],
        validations: ["items must match purchase order", "dock assignment required before arrival"]
      },
      {
        name: "PickOrder",
        description: "Order to retrieve items from storage for shipment",
        typicalFields: ["pickOrderId", "salesOrder", "items", "assignedPicker", "priority", "status", "pickRoute"],
        validations: ["items must be in stock at assigned locations", "picker must be assigned"]
      },
      {
        name: "Shipment",
        description: "Outbound shipment leaving the warehouse",
        typicalFields: ["shipmentId", "carrier", "destination", "items", "weight", "scheduledDate", "dock", "status"],
        validations: ["all items must be picked and packed", "carrier must be confirmed"]
      },
      {
        name: "CycleCount",
        description: "Periodic inventory accuracy verification",
        typicalFields: ["countId", "location", "expectedQuantity", "actualQuantity", "variance", "counter", "date"]
      }
    ],
    workflows: [
      {
        name: "Receiving",
        steps: ["Schedule dock appointment", "Unload shipment", "Inspect and count items", "Compare to purchase order", "Label with barcodes", "Create putaway tasks", "Put items to assigned locations", "Update inventory"],
        triggers: ["Advance ship notice received", "Truck arrival at dock"]
      },
      {
        name: "Order Picking",
        steps: ["Receive pick orders from WMS", "Batch and optimize pick routes", "Pick items from locations", "Confirm picks via scanner", "Deliver to packing station", "Handle short picks or substitutions"],
        triggers: ["Sales order release", "Wave processing schedule"]
      },
      {
        name: "Packing and Shipping",
        steps: ["Receive picked items", "Verify against order", "Select packaging", "Pack items", "Generate shipping labels", "Load onto carrier", "Confirm shipment", "Update order status"],
        triggers: ["Picking complete", "Carrier pickup scheduled"]
      },
      {
        name: "Cycle Counting",
        steps: ["Generate count list by zone", "Assign counters", "Count inventory at locations", "Record counts in system", "Investigate variances", "Adjust inventory records", "Report accuracy metrics"],
        triggers: ["Scheduled cycle count", "ABC classification schedule", "Discrepancy detected"]
      }
    ],
    businessRules: [
      "FIFO enforced for all perishable and lot-tracked inventory",
      "Cycle count accuracy must maintain 99% or higher",
      "Hazardous materials stored in designated zones only",
      "Dock appointments required for all inbound shipments",
      "Temperature-sensitive items stored in climate-controlled zones",
      "Pick accuracy verified through barcode scanning at each step",
      "Inventory adjustments above threshold require supervisor approval",
      "Cross-dock items processed within 2 hours of receipt"
    ],
    terminology: {
      "WMS": "Warehouse Management System - software managing warehouse operations",
      "Putaway": "Process of moving received goods to designated storage locations",
      "Wave": "Group of orders released together for efficient picking",
      "Cross-Dock": "Transferring goods directly from receiving to shipping without storage",
      "Slotting": "Optimization of product placement in storage locations",
      "Pick Path": "Optimized route through warehouse for order picking",
      "ABC Analysis": "Inventory classification by value or movement frequency",
      "Cycle Count": "Periodic counting of subset of inventory to verify accuracy",
      "RF Scanner": "Radio Frequency handheld device for barcode scanning",
      "SKU Velocity": "Rate at which a product moves through the warehouse",
      "Safety Stock": "Buffer inventory to prevent stockouts"
    },
    integrations: ["WMS Platforms", "ERP Systems", "Barcode and RFID Systems", "Shipping Carrier APIs", "Labor Management Systems", "Yard Management Systems"],
    metrics: ["Order Accuracy Rate", "Pick Rate per Hour", "Inventory Accuracy", "Dock-to-Stock Time", "Orders Shipped per Day", "Space Utilization", "Labor Productivity"]
  },
  {
    id: "media-publishing",
    name: "Publishing",
    industry: "Media",
    description: "Publishing operations management covering editorial workflow, content management, print and digital distribution, subscription management, and advertising for newspapers, magazines, and digital publications.",
    keywords: ["editorial", "article", "author", "editor", "publication", "print", "digital", "subscription", "advertising", "layout", "deadline", "byline", "circulation", "CMS"],
    coreEntities: [
      {
        name: "Article",
        description: "Written content piece for publication",
        typicalFields: ["articleId", "headline", "body", "author", "editor", "category", "status", "publishDate"],
        validations: ["headline must not exceed character limit", "article must be fact-checked before publish"]
      },
      {
        name: "Author",
        description: "Writer or contributor producing content",
        typicalFields: ["authorId", "name", "bio", "specializations", "contactInfo", "paymentTerms", "publishedArticles"],
        validations: ["contract or contributor agreement must be on file", "payment terms must be defined"]
      },
      {
        name: "Publication",
        description: "Magazine, newspaper, or digital publication",
        typicalFields: ["publicationId", "name", "frequency", "format", "circulation", "targetAudience", "editor"],
        validations: ["frequency must match publication schedule", "circulation must be audited"]
      },
      {
        name: "Issue",
        description: "Specific edition of a publication",
        typicalFields: ["issueId", "publicationId", "issueDate", "articles", "advertisements", "pageCount", "status"],
        validations: ["all articles must be approved before layout", "advertisements must be confirmed and paid"]
      },
      {
        name: "Advertisement",
        description: "Paid advertising placement in publication",
        typicalFields: ["adId", "advertiser", "size", "placement", "issueId", "rate", "artwork", "status"],
        validations: ["artwork must meet technical specifications", "ad content must comply with editorial policy"]
      },
      {
        name: "Subscription",
        description: "Reader subscription to publication",
        typicalFields: ["subscriptionId", "subscriberName", "email", "plan", "startDate", "endDate", "paymentStatus", "deliveryMethod"]
      }
    ],
    workflows: [
      {
        name: "Editorial Workflow",
        steps: ["Story assignment or pitch", "Research and writing", "Author submission", "Editor review", "Fact-checking", "Copy editing", "Proofreading", "Layout placement", "Final approval"],
        triggers: ["Story idea approved", "Assignment deadline", "Breaking news event"]
      },
      {
        name: "Issue Production",
        steps: ["Plan issue content", "Assign stories and deadlines", "Sell advertising space", "Collect and edit articles", "Design layout", "Proofread final layout", "Send to printer or publish digitally", "Distribute to subscribers"],
        triggers: ["Production calendar date", "Editorial meeting"]
      },
      {
        name: "Subscription Management",
        steps: ["Receive subscription order", "Process payment", "Activate subscription", "Deliver publications", "Send renewal notices", "Process renewal or cancellation", "Update subscriber database"],
        triggers: ["New subscription order", "Renewal date approaching", "Cancellation request"]
      },
      {
        name: "Advertising Sales",
        steps: ["Prospect advertisers", "Present media kit and rates", "Negotiate placement and pricing", "Receive insertion order", "Collect artwork", "Place in issue layout", "Invoice advertiser", "Report performance metrics"],
        triggers: ["Sales cycle start", "Issue planning", "Advertiser inquiry"]
      }
    ],
    businessRules: [
      "All articles must undergo fact-checking before publication",
      "Advertising content must be clearly labeled and separated from editorial",
      "Deadlines are non-negotiable for print publication dates",
      "Corrections must be published in next available issue",
      "Copyright and reprint permissions must be obtained for third-party content",
      "Subscriber data must be handled per privacy regulations",
      "Digital content must be SEO-optimized before publishing"
    ],
    terminology: {
      "Byline": "Author credit line appearing with published article",
      "Masthead": "List of publication staff and editorial team",
      "Circulation": "Number of copies distributed per issue",
      "CMS": "Content Management System - platform for managing digital content",
      "Galley": "Proof of article layout for review before printing",
      "Lead": "Opening paragraph of a news story",
      "AP Style": "Associated Press style guide for writing and editing",
      "Slug": "Short identifier for a story during production",
      "Above the Fold": "Content visible without scrolling or on top half of newspaper",
      "Insertion Order": "Formal agreement for advertising placement",
      "Media Kit": "Package of information about publication for potential advertisers"
    },
    regulations: ["Copyright Law", "Libel and Defamation Laws", "FTC Advertising Guidelines", "Privacy Regulations", "Press Freedom Laws"],
    integrations: ["Content Management Systems", "Print Production Systems", "Ad Serving Platforms", "Email Marketing Tools", "Analytics Platforms", "Social Media Platforms"],
    metrics: ["Readership", "Circulation Numbers", "Digital Traffic", "Subscriber Growth", "Ad Revenue", "Engagement Rate", "Content Output"]
  },
  {
    id: "media-broadcasting",
    name: "Broadcasting",
    industry: "Media",
    description: "Broadcasting operations management covering programming schedules, content production, live transmission, advertising sales, and audience measurement for television and radio stations.",
    keywords: ["broadcast", "television", "radio", "program", "schedule", "live", "studio", "anchor", "signal", "ratings", "commercial", "airtime", "satellite", "streaming"],
    coreEntities: [
      {
        name: "Program",
        description: "Television or radio show",
        typicalFields: ["programId", "title", "format", "duration", "timeslot", "host", "genre", "rating"],
        validations: ["duration must fit timeslot", "content rating must be assigned"]
      },
      {
        name: "Schedule",
        description: "Programming lineup for broadcast day",
        typicalFields: ["scheduleId", "date", "channel", "programs", "commercialBreaks", "liveEvents", "status"],
        validations: ["no gaps or overlaps in schedule", "commercial breaks must meet regulatory requirements"]
      },
      {
        name: "Commercial",
        description: "Advertising spot sold for broadcast",
        typicalFields: ["commercialId", "advertiser", "duration", "timeslot", "rate", "frequency", "creative", "status"],
        validations: ["creative must be approved and meet technical specs", "total commercial time must not exceed limits"]
      },
      {
        name: "Segment",
        description: "Individual segment within a program",
        typicalFields: ["segmentId", "programId", "title", "type", "duration", "content", "guests", "runOrder"],
        validations: ["total segment durations must equal program length", "live segments must have contingency plans"]
      },
      {
        name: "Studio",
        description: "Physical broadcast facility",
        typicalFields: ["studioId", "name", "location", "equipment", "capacity", "availability", "technicalSpecs"],
        validations: ["equipment must be maintained and tested", "booking conflicts must be prevented"]
      },
      {
        name: "AudienceData",
        description: "Viewership or listenership measurement data",
        typicalFields: ["dataId", "programId", "date", "viewers", "share", "demographic", "source", "timeslot"]
      }
    ],
    workflows: [
      {
        name: "Program Production",
        steps: ["Concept development", "Script writing", "Pre-production planning", "Studio booking and setup", "Rehearsal", "Record or broadcast live", "Post-production editing", "Quality review and approval"],
        triggers: ["Production calendar", "Programming decision", "Breaking news"]
      },
      {
        name: "Live Broadcast",
        steps: ["Pre-show technical check", "Graphics and lower thirds loaded", "Talent preparation", "Countdown to air", "Live broadcast execution", "Monitor for technical issues", "Commercial break management", "Sign off and wrap"],
        triggers: ["Scheduled airtime", "Breaking news event"]
      },
      {
        name: "Ad Sales and Trafficking",
        steps: ["Present rate card and audience data", "Negotiate placement", "Receive insertion order", "Traffic commercials into schedule", "Verify broadcast execution", "Generate affidavit of performance", "Invoice advertiser"],
        triggers: ["Sales cycle", "Advertiser inquiry", "Schedule availability"]
      },
      {
        name: "Content Scheduling",
        steps: ["Review program inventory", "Plan weekly schedule", "Slot programs and specials", "Schedule commercial breaks", "Coordinate with traffic department", "Publish schedule", "Monitor and adjust for changes"],
        triggers: ["Weekly planning meeting", "Season planning", "Special event"]
      }
    ],
    businessRules: [
      "Commercial minutes per hour must not exceed FCC limits",
      "Content ratings must be displayed at program start per regulations",
      "Emergency Alert System tests conducted per FCC schedule",
      "Live broadcasts require minimum 7-second delay for content control",
      "Commercial placements must match daypart and audience guarantees",
      "Program rights and licensing must be current for broadcast",
      "Technical quality standards must meet broadcast specifications"
    ],
    terminology: {
      "Daypart": "Time segment of broadcast day used for scheduling and advertising",
      "Nielsen Rating": "Audience measurement metric for television programs",
      "Upfront": "Annual advertising sales event for upcoming programming season",
      "Sweeps": "Periods when audience measurement is intensified",
      "Spot": "Individual commercial advertisement",
      "Affidavit": "Proof that commercial aired as scheduled",
      "Trafficker": "Person who schedules commercial placements in broadcast",
      "Lower Third": "Graphic displayed in lower portion of screen during broadcast",
      "Rundown": "Detailed timing sheet for program segments",
      "Lead-In": "Program that precedes and feeds audience to following show",
      "Share": "Percentage of viewers watching a program among those watching TV"
    },
    regulations: ["FCC Broadcast Regulations", "Children's Television Act", "Emergency Alert System Rules", "Equal Time Rule", "Sponsorship Identification", "Obscenity and Indecency Rules"],
    integrations: ["Broadcast Automation Systems", "Traffic and Billing Systems", "Nielsen Audience Measurement", "Newsroom Systems", "Playout Systems", "Streaming Platforms"],
    metrics: ["Audience Ratings", "Audience Share", "Ad Revenue per Spot", "Cost per Thousand Impressions", "Program Cost per Viewer", "Commercial Sell-Through Rate"]
  },
  {
    id: "fitness-gym",
    name: "Gym and Wellness",
    industry: "Fitness",
    description: "Gym and wellness center management covering membership management, class scheduling, personal training, equipment maintenance, and member engagement for fitness facilities.",
    keywords: ["gym", "membership", "workout", "trainer", "class", "equipment", "fitness", "wellness", "schedule", "body composition", "personal training", "group fitness", "spa", "nutrition"],
    coreEntities: [
      {
        name: "Member",
        description: "Gym member with active or past membership",
        typicalFields: ["memberId", "fullName", "email", "phone", "membershipType", "startDate", "status", "emergencyContact"],
        validations: ["waiver must be signed", "health questionnaire must be completed", "emergency contact required"]
      },
      {
        name: "Membership",
        description: "Membership plan and billing details",
        typicalFields: ["membershipId", "memberId", "plan", "monthlyRate", "billingDate", "paymentMethod", "freezeStatus", "contractEnd"],
        validations: ["billing must be current for access", "freeze period limited per contract terms"]
      },
      {
        name: "Class",
        description: "Group fitness class offered at the gym",
        typicalFields: ["classId", "name", "instructor", "dateTime", "duration", "room", "capacity", "enrolledCount"],
        validations: ["enrollment cannot exceed room capacity", "instructor must be certified for class type"]
      },
      {
        name: "Trainer",
        description: "Personal trainer or group fitness instructor",
        typicalFields: ["trainerId", "fullName", "certifications", "specialties", "availability", "hourlyRate", "clientCount"],
        validations: ["certifications must be current", "CPR/AED certification required"]
      },
      {
        name: "Session",
        description: "Personal training session between member and trainer",
        typicalFields: ["sessionId", "memberId", "trainerId", "dateTime", "duration", "type", "notes", "status"],
        validations: ["cancellation within 24 hours forfeits session", "trainer availability must be confirmed"]
      },
      {
        name: "Equipment",
        description: "Fitness equipment in the facility",
        typicalFields: ["equipmentId", "name", "type", "location", "purchaseDate", "maintenanceSchedule", "condition", "status"]
      }
    ],
    workflows: [
      {
        name: "Member Onboarding",
        steps: ["Facility tour", "Select membership plan", "Complete health questionnaire", "Sign waiver", "Set up payment", "Issue access card", "Orientation session", "Goal setting consultation"],
        triggers: ["Walk-in inquiry", "Online sign-up", "Referral"]
      },
      {
        name: "Class Booking",
        steps: ["Member views class schedule", "Select desired class", "Check capacity availability", "Confirm booking", "Send confirmation", "Check-in at class", "Waitlist management for full classes"],
        triggers: ["Member request", "Schedule published"]
      },
      {
        name: "Personal Training",
        steps: ["Initial fitness assessment", "Design training program", "Schedule sessions", "Conduct training sessions", "Track progress", "Reassess and adjust program", "Package renewal"],
        triggers: ["Member request", "Goal review period"]
      },
      {
        name: "Equipment Maintenance",
        steps: ["Daily equipment inspection", "Log issues found", "Schedule repair or maintenance", "Vendor dispatch", "Complete repair", "Return to service", "Update maintenance records"],
        triggers: ["Daily inspection", "Member report", "Preventive maintenance schedule"]
      }
    ],
    businessRules: [
      "All members must have signed liability waiver on file",
      "Membership freezes limited to 2 months per year",
      "24-hour cancellation policy for personal training sessions",
      "Guest passes limited to 3 per member per month",
      "Equipment out of service must be tagged and cordoned off",
      "Minors under 16 must be accompanied by adult member",
      "Group class cancellation if fewer than 3 participants registered",
      "Membership auto-renews unless cancelled with 30-day notice"
    ],
    terminology: {
      "PT": "Personal Training - one-on-one fitness instruction",
      "Group X": "Group exercise classes",
      "HIIT": "High-Intensity Interval Training - workout alternating intense and recovery periods",
      "BMI": "Body Mass Index - weight relative to height measurement",
      "Rep": "Repetition - single execution of an exercise movement",
      "Set": "Group of consecutive repetitions",
      "Circuit": "Series of exercises performed in sequence with minimal rest",
      "Spotter": "Person assisting during heavy weight exercises for safety",
      "PR": "Personal Record - best performance achieved in an exercise",
      "Cardio": "Cardiovascular exercise improving heart and lung function",
      "Cooldown": "Low-intensity activity after workout to aid recovery"
    },
    regulations: ["AED Requirements", "Health and Safety Codes", "ADA Accessibility", "Music Licensing", "Employment Regulations", "Child Supervision Laws"],
    integrations: ["Membership Management Systems", "Access Control Systems", "Payment Processing", "Class Booking Platforms", "Wearable Device Integration", "Communication Platforms"],
    metrics: ["Member Retention Rate", "New Member Sign-ups", "Class Attendance Rate", "Personal Training Revenue", "Equipment Utilization", "Member Satisfaction Score", "Revenue per Square Foot"]
  },
  {
    id: "nonprofit-charitable",
    name: "Charitable Organizations",
    industry: "Nonprofit",
    description: "Nonprofit organization management covering donor management, fundraising campaigns, volunteer coordination, program delivery, grant management, and impact reporting.",
    keywords: ["nonprofit", "donor", "fundraising", "volunteer", "grant", "campaign", "donation", "charity", "mission", "impact", "board", "501c3", "stewardship", "endowment"],
    coreEntities: [
      {
        name: "Donor",
        description: "Individual or organization making charitable contributions",
        typicalFields: ["donorId", "name", "email", "phone", "donationHistory", "totalGiving", "preferredCause", "communicationPreference"],
        validations: ["contact information must be verified", "giving level must be calculated accurately"]
      },
      {
        name: "Donation",
        description: "Charitable gift received from donor",
        typicalFields: ["donationId", "donorId", "amount", "date", "method", "campaign", "designation", "taxDeductible"],
        validations: ["tax receipt required for donations over $250", "restricted funds must be tracked separately"]
      },
      {
        name: "Campaign",
        description: "Organized fundraising effort with specific goal",
        typicalFields: ["campaignId", "name", "goal", "startDate", "endDate", "raisedAmount", "donorCount", "status"],
        validations: ["goal must be positive", "end date must be after start date"]
      },
      {
        name: "Volunteer",
        description: "Individual donating time and skills to the organization",
        typicalFields: ["volunteerId", "name", "email", "skills", "availability", "hoursLogged", "backgroundCheck", "assignedPrograms"],
        validations: ["background check required for youth programs", "waiver must be signed"]
      },
      {
        name: "Grant",
        description: "Funding received from foundation or government",
        typicalFields: ["grantId", "funder", "amount", "purpose", "startDate", "endDate", "reportingRequirements", "status"],
        validations: ["expenditures must align with grant purpose", "reports must be submitted per schedule"]
      },
      {
        name: "Program",
        description: "Service or initiative delivered by the organization",
        typicalFields: ["programId", "name", "description", "budget", "beneficiaries", "outcomes", "manager", "status"],
        validations: ["expenditures must not exceed budget", "outcomes must be measurable"]
      },
      {
        name: "BoardMember",
        description: "Member of the organization's board of directors",
        typicalFields: ["boardMemberId", "name", "role", "termStart", "termEnd", "committees", "votingRecord"]
      }
    ],
    workflows: [
      {
        name: "Donation Processing",
        steps: ["Receive donation", "Record in CRM", "Process payment", "Send acknowledgment receipt", "Apply to designated fund", "Update donor record", "Stewardship follow-up"],
        triggers: ["Online donation", "Mail donation", "Event donation", "Recurring gift schedule"]
      },
      {
        name: "Fundraising Campaign",
        steps: ["Define campaign goals and strategy", "Create marketing materials", "Launch campaign", "Execute outreach activities", "Track donations and progress", "Donor engagement events", "Campaign wrap-up and reporting", "Donor stewardship"],
        triggers: ["Annual campaign cycle", "Special initiative", "Emergency appeal"]
      },
      {
        name: "Grant Management",
        steps: ["Identify funding opportunity", "Prepare proposal", "Submit application", "Award notification", "Set up grant accounting", "Deliver program activities", "Submit progress reports", "Final report and close-out"],
        triggers: ["Grant opportunity identified", "RFP released", "Reporting deadline"]
      },
      {
        name: "Volunteer Coordination",
        steps: ["Recruit volunteers", "Application and screening", "Background check if required", "Orientation and training", "Assign to program or event", "Track hours and engagement", "Recognition and retention"],
        triggers: ["Volunteer application", "Program need", "Event planning"]
      }
    ],
    businessRules: [
      "Tax receipts issued for all donations over $250 per IRS requirements",
      "Restricted donations must be used only for designated purpose",
      "Grant expenditures must align with approved budget categories",
      "Board meetings require quorum for official decisions",
      "Annual audit required for organizations receiving over $750,000 in federal funds",
      "Volunteer hours tracked for in-kind contribution reporting",
      "Donor privacy protected per organizational policy",
      "Endowment principal cannot be spent; only investment returns available"
    ],
    terminology: {
      "501(c)(3)": "IRS tax-exempt status for charitable organizations",
      "Stewardship": "Ongoing relationship cultivation with donors",
      "Restricted Funds": "Donations designated for specific use by the donor",
      "Unrestricted Funds": "Donations available for general organizational use",
      "Endowment": "Invested principal fund generating ongoing income",
      "In-Kind": "Non-cash donations of goods or services",
      "Matching Gift": "Corporate program matching employee charitable contributions",
      "Planned Giving": "Charitable gifts arranged during donor's lifetime for future distribution",
      "Development": "Fundraising and donor cultivation activities",
      "Impact Report": "Document measuring and communicating program outcomes",
      "GuideStar": "Database providing information about nonprofit organizations",
      "Form 990": "Annual IRS information return filed by tax-exempt organizations"
    },
    regulations: ["IRS 501(c)(3) Regulations", "State Charitable Solicitation Laws", "Uniform Prudent Management Act", "Single Audit Act", "Donor Privacy Laws", "Form 990 Filing Requirements"],
    integrations: ["Donor CRM Systems", "Payment Processing", "Email Marketing Platforms", "Grant Management Systems", "Volunteer Management Platforms", "Accounting Software"],
    metrics: ["Total Revenue", "Donor Retention Rate", "Cost to Raise a Dollar", "Program Expense Ratio", "Volunteer Hours", "Beneficiaries Served", "Average Gift Size", "Donor Acquisition Rate"]
  }
];
