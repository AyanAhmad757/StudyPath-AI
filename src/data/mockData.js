// Centralized Mock Data for Friday AI

export const initialUser = {
  id: 'usr_ayan_01',
  name: 'Ayan Mukherjee',
  email: 'ayan.mukherjee@apex.edu',
  avatar: 'https://lh3.googleusercontent.com/aida/AEtjO1UMkVA_lFpavUtEhT8G6CSxoAMAyDt6vmjniKFNMWrkYP00yS7bia2FPArVlDxJqui48r7tKAfTRL53ibxwOSMojFaNRhNr7TdNFqyIS5UTnC3pdwQQ_YLFTaphyxwVK0dS9yj49Sm7sQ0KYuzcUoo6O7W-l-5bpbO_crZwI2c4jWWxrEmwtVjyKeHv_vBQudt5-67CPuXw14NQDnr-H0Y7MZ3p7ipdTZD8WLo58V7f27tydShDjj4d1W0',
  college: 'Apex Institute of Tech',
  course: 'B.Tech CSE',
  year: '3rd Year',
  semester: '6th Semester',
  careerGoal: 'Full Stack Developer',
  enrolledDate: 'Aug 2023',
};

export const initialStats = {
  totalSubjects: 4,
  topicsCompleted: 21,
  totalTopics: 38,
  learningStreak: 7, // Days
  studyHours: 34.5,
  overallProgress: 64, // percentage
};

export const todayGoalsList = [
  { id: 'g1', title: 'Complete OSI Model Layer Breakdown', subject: 'Computer Networks', completed: true, time: '25 min' },
  { id: 'g2', title: 'Watch TCP/IP vs OSI Deep Dive Tutorial', subject: 'Computer Networks', completed: true, time: '18 min' },
  { id: 'g3', title: 'Review Lexical Analysis Syntax Tree', subject: 'Compiler Design', completed: false, time: '30 min' },
  { id: 'g4', title: 'Practice React useEffect & Custom Hooks', subject: 'Career Track', completed: false, time: '45 min' },
];

export const subjectsData = [
  {
    id: 'cn-101',
    code: 'CS601',
    name: 'Computer Networks',
    university: 'AKTU / State Technical University',
    department: 'CSE / IT',
    semester: '6th Semester',
    color: 'indigo',
    iconName: 'Network',
    description: 'Covers network architecture, layered protocols, routing algorithms, transport protocols, and network security.',
    unitsCount: 4,
    topicsCount: 30,
    completedTopics: 12,
    progress: 40,
    lastStudied: 'Today, 10:30 AM',
    units: [
      {
        id: 'cn-u1',
        unitNumber: 1,
        title: 'Network Fundamentals & Physical Layer',
        description: 'Introduction to network topologies, transmission media, OSI reference model, and TCP/IP protocol suite.',
        topicsCount: 8,
        completedCount: 6,
        progress: 75,
        topics: [
          { id: 'cn-t1', name: '1. Introduction to Computer Networks', difficulty: 'Beginner', estimatedTime: '15 min', completed: true },
          { id: 'cn-t2', name: '2. Network Types (LAN, MAN, WAN, PAN)', difficulty: 'Beginner', estimatedTime: '20 min', completed: true },
          { id: 'cn-t3', name: '3. Network Topologies (Mesh, Star, Bus, Ring)', difficulty: 'Beginner', estimatedTime: '20 min', completed: true },
          { id: 'cn-t4', name: '4. OSI Reference Model (7 Layers)', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false, isCurrent: true },
          { id: 'cn-t5', name: '5. TCP/IP Protocol Architecture', difficulty: 'Intermediate', estimatedTime: '25 min', completed: true },
          { id: 'cn-t6', name: '6. Network Devices (Hubs, Switches, Routers, Gateways)', difficulty: 'Beginner', estimatedTime: '20 min', completed: true },
          { id: 'cn-t7', name: '7. Protocols and Standards (IEEE 802, IETF)', difficulty: 'Intermediate', estimatedTime: '15 min', completed: false },
          { id: 'cn-t8', name: '8. Transmission Modes & Multiplexing (FDM, TDM, WDM)', difficulty: 'Advanced', estimatedTime: '30 min', completed: false },
        ]
      },
      {
        id: 'cn-u2',
        unitNumber: 2,
        title: 'Data Link Layer & Medium Access Control',
        description: 'Framing, error detection & correction (CRC, Hamming code), sliding window protocols, and CSMA/CD.',
        topicsCount: 8,
        completedCount: 4,
        progress: 50,
        topics: [
          { id: 'cn-t9', name: '1. Framing Techniques & Bit/Byte Stuffing', difficulty: 'Intermediate', estimatedTime: '20 min', completed: true },
          { id: 'cn-t10', name: '2. Error Detection (Parity, Checksum, CRC)', difficulty: 'Advanced', estimatedTime: '35 min', completed: true },
          { id: 'cn-t11', name: '3. Error Correction (Hamming Code)', difficulty: 'Advanced', estimatedTime: '30 min', completed: true },
          { id: 'cn-t12', name: '4. Flow Control: Stop & Wait Protocol', difficulty: 'Beginner', estimatedTime: '15 min', completed: true },
          { id: 'cn-t13', name: '5. Sliding Window: Go-Back-N (GBN)', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cn-t14', name: '6. Sliding Window: Selective Repeat (SR)', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cn-t15', name: '7. Pure ALOHA & Slotted ALOHA', difficulty: 'Intermediate', estimatedTime: '20 min', completed: false },
          { id: 'cn-t16', name: '8. CSMA/CD and Ethernet Standards', difficulty: 'Advanced', estimatedTime: '30 min', completed: false },
        ]
      },
      {
        id: 'cn-u3',
        unitNumber: 3,
        title: 'Network Layer & Routing Protocols',
        description: 'IPv4/IPv6 addressing, subnetting, CIDR, Distance Vector, and Link State routing algorithms.',
        topicsCount: 7,
        completedCount: 2,
        progress: 28,
        topics: [
          { id: 'cn-t17', name: '1. IPv4 Addressing Classes & Subnetting', difficulty: 'Intermediate', estimatedTime: '30 min', completed: true },
          { id: 'cn-t18', name: '2. Classless Inter-Domain Routing (CIDR)', difficulty: 'Intermediate', estimatedTime: '25 min', completed: true },
          { id: 'cn-t19', name: '3. IPv6 Addressing & Header Format', difficulty: 'Intermediate', estimatedTime: '20 min', completed: false },
          { id: 'cn-t20', name: '4. Distance Vector Routing & Bellman-Ford', difficulty: 'Advanced', estimatedTime: '35 min', completed: false },
          { id: 'cn-t21', name: '5. Link State Routing & Dijkstra Algorithm', difficulty: 'Advanced', estimatedTime: '40 min', completed: false },
          { id: 'cn-t22', name: '6. Routing Information Protocol (RIP) & OSPF', difficulty: 'Advanced', estimatedTime: '30 min', completed: false },
          { id: 'cn-t23', name: '7. Address Resolution Protocol (ARP) & ICMP', difficulty: 'Intermediate', estimatedTime: '20 min', completed: false },
        ]
      },
      {
        id: 'cn-u4',
        unitNumber: 4,
        title: 'Transport & Application Layer Protocols',
        description: 'TCP 3-way handshake, congestion control, UDP, DNS, HTTP/HTTPS, and Socket Programming.',
        topicsCount: 7,
        completedCount: 0,
        progress: 0,
        topics: [
          { id: 'cn-t24', name: '1. Process-to-Process Delivery & Ports', difficulty: 'Beginner', estimatedTime: '15 min', completed: false },
          { id: 'cn-t25', name: '2. UDP: User Datagram Protocol Characteristics', difficulty: 'Beginner', estimatedTime: '15 min', completed: false },
          { id: 'cn-t26', name: '3. TCP Header & 3-Way Handshake Connection', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cn-t27', name: '4. TCP Congestion Control (Slow Start, AIMD)', difficulty: 'Advanced', estimatedTime: '35 min', completed: false },
          { id: 'cn-t28', name: '5. DNS (Domain Name System) Resolution', difficulty: 'Intermediate', estimatedTime: '20 min', completed: false },
          { id: 'cn-t29', name: '6. HTTP, HTTPS & SSL/TLS Handshake', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cn-t30', name: '7. Socket Programming Architecture in C/Java', difficulty: 'Advanced', estimatedTime: '40 min', completed: false },
        ]
      }
    ]
  },
  {
    id: 'cd-102',
    code: 'CS602',
    name: 'Compiler Design',
    university: 'AKTU / State Technical University',
    department: 'CSE',
    semester: '6th Semester',
    color: 'purple',
    iconName: 'Cpu',
    description: 'Phases of a compiler, lexical analysis, syntax analysis (LL/LR parsers), syntax-directed translation, and intermediate code generation.',
    unitsCount: 4,
    topicsCount: 26,
    completedTopics: 5,
    progress: 19,
    lastStudied: 'Yesterday, 4:15 PM',
    units: [
      {
        id: 'cd-u1',
        unitNumber: 1,
        title: 'Introduction & Lexical Analysis',
        description: 'Compiler overview, phases of compilation, Lex tool, regular expressions to DFA conversion.',
        topicsCount: 6,
        completedCount: 4,
        progress: 66,
        topics: [
          { id: 'cd-t1', name: '1. Phases of a Compiler Architecture', difficulty: 'Beginner', estimatedTime: '20 min', completed: true },
          { id: 'cd-t2', name: '2. Lexical Analyzer Role & Token Specification', difficulty: 'Beginner', estimatedTime: '20 min', completed: true },
          { id: 'cd-t3', name: '3. Regular Expressions to NFA (Thompson Construction)', difficulty: 'Intermediate', estimatedTime: '30 min', completed: true },
          { id: 'cd-t4', name: '4. NFA to DFA Subset Construction', difficulty: 'Advanced', estimatedTime: '35 min', completed: true },
          { id: 'cd-t5', name: '5. DFA Minimization Algorithm', difficulty: 'Advanced', estimatedTime: '30 min', completed: false },
          { id: 'cd-t6', name: '6. LEX / Flex Tool Implementation', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
        ]
      },
      {
        id: 'cd-u2',
        unitNumber: 2,
        title: 'Syntax Analysis & Context-Free Grammars',
        description: 'Top-down parsing, First & Follow sets, LL(1) parsers, and recursive descent parsers.',
        topicsCount: 7,
        completedCount: 1,
        progress: 14,
        topics: [
          { id: 'cd-t7', name: '1. Context-Free Grammars & Ambiguity', difficulty: 'Beginner', estimatedTime: '20 min', completed: true },
          { id: 'cd-t8', name: '2. Elimination of Left Recursion & Left Factoring', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cd-t9', name: '3. Computing FIRST and FOLLOW Sets', difficulty: 'Intermediate', estimatedTime: '30 min', completed: false },
          { id: 'cd-t10', name: '4. Non-Recursive Predictive LL(1) Parsing Table', difficulty: 'Advanced', estimatedTime: '40 min', completed: false },
          { id: 'cd-t11', name: '5. Bottom-Up Parsing & Shift-Reduce Conflicts', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cd-t12', name: '6. LR(0) and SLR(1) Parsing Tables', difficulty: 'Advanced', estimatedTime: '45 min', completed: false },
          { id: 'cd-t13', name: '7. CLR(1) and LALR(1) Parser Comparison', difficulty: 'Advanced', estimatedTime: '45 min', completed: false },
        ]
      },
      {
        id: 'cd-u3',
        unitNumber: 3,
        title: 'Syntax-Directed Translation & Symbol Tables',
        description: 'Syntax-directed definitions (SDD), S-attributed vs L-attributed definitions, and symbol table data structures.',
        topicsCount: 6,
        completedCount: 0,
        progress: 0,
        topics: [
          { id: 'cd-t14', name: '1. Syntax-Directed Definitions (SDD)', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cd-t15', name: '2. Synthesized vs Inherited Attributes', difficulty: 'Intermediate', estimatedTime: '20 min', completed: false },
          { id: 'cd-t16', name: '3. Evaluation of Annotated Parse Trees', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cd-t17', name: '4. Symbol Table Organization & Hash Tables', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cd-t18', name: '5. Type Checking & Type Expressions', difficulty: 'Intermediate', estimatedTime: '20 min', completed: false },
          { id: 'cd-t19', name: '6. Error Detection and Recovery Strategies', difficulty: 'Intermediate', estimatedTime: '20 min', completed: false },
        ]
      },
      {
        id: 'cd-u4',
        unitNumber: 4,
        title: 'Code Generation & Optimization',
        description: 'Three-Address Code (TAC), Basic Blocks, Flow Graphs, Loop optimization, and DAG representation.',
        topicsCount: 7,
        completedCount: 0,
        progress: 0,
        topics: [
          { id: 'cd-t20', name: '1. Intermediate Representations & Three-Address Code', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cd-t21', name: '2. Quadruples, Triples, and Indirect Triples', difficulty: 'Intermediate', estimatedTime: '20 min', completed: false },
          { id: 'cd-t22', name: '3. Basic Blocks and Flow Graphs Construction', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cd-t23', name: '4. Directed Acyclic Graph (DAG) for Basic Blocks', difficulty: 'Advanced', estimatedTime: '30 min', completed: false },
          { id: 'cd-t24', name: '5. Machine-Independent Optimization (Loop Invariant, Dead Code)', difficulty: 'Advanced', estimatedTime: '35 min', completed: false },
          { id: 'cd-t25', name: '6. Register Allocation and Assignment', difficulty: 'Advanced', estimatedTime: '30 min', completed: false },
          { id: 'cd-t26', name: '7. Target Machine Code Generation', difficulty: 'Advanced', estimatedTime: '35 min', completed: false },
        ]
      }
    ]
  },
  {
    id: 'cc-103',
    code: 'CS603',
    name: 'Cloud Computing',
    university: 'AKTU / State Technical University',
    department: 'CSE / IT',
    semester: '6th Semester',
    color: 'emerald',
    iconName: 'Cloud',
    description: 'NIST Cloud model, Virtualization hypervisors, Cloud service models (IaaS/PaaS/SaaS), AWS/Azure architecture, and serverless containers.',
    unitsCount: 4,
    topicsCount: 22,
    completedTopics: 3,
    progress: 14,
    lastStudied: '3 days ago',
    units: [
      {
        id: 'cc-u1',
        unitNumber: 1,
        title: 'Cloud Foundations & Virtualization',
        description: 'NIST cloud definition, characteristics, deployment models, Type-1 & Type-2 hypervisors.',
        topicsCount: 5,
        completedCount: 2,
        progress: 40,
        topics: [
          { id: 'cc-t1', name: '1. NIST Cloud Computing Definition & Essential Characteristics', difficulty: 'Beginner', estimatedTime: '15 min', completed: true },
          { id: 'cc-t2', name: '2. Cloud Deployment Models (Public, Private, Hybrid, Community)', difficulty: 'Beginner', estimatedTime: '20 min', completed: true },
          { id: 'cc-t3', name: '3. Hardware & OS Level Virtualization Architecture', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cc-t4', name: '4. Hypervisors: Type 1 (Bare-Metal) vs Type 2 (Hosted)', difficulty: 'Intermediate', estimatedTime: '20 min', completed: false },
          { id: 'cc-t5', name: '5. Virtual Machine Lifecycle and Migration', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
        ]
      },
      {
        id: 'cc-u2',
        unitNumber: 2,
        title: 'Cloud Service Models & Infrastructure',
        description: 'IaaS, PaaS, SaaS, FaaS architectures, shared responsibility security model, and cloud storage.',
        topicsCount: 6,
        completedCount: 1,
        progress: 16,
        topics: [
          { id: 'cc-t6', name: '1. Infrastructure as a Service (IaaS) Deep Dive', difficulty: 'Beginner', estimatedTime: '20 min', completed: true },
          { id: 'cc-t7', name: '2. Platform as a Service (PaaS) Application Runtime', difficulty: 'Beginner', estimatedTime: '20 min', completed: false },
          { id: 'cc-t8', name: '3. Software as a Service (SaaS) Multi-Tenancy', difficulty: 'Beginner', estimatedTime: '15 min', completed: false },
          { id: 'cc-t9', name: '4. Cloud Storage: Block vs Object vs File Storage (S3, EBS)', difficulty: 'Intermediate', estimatedTime: '30 min', completed: false },
          { id: 'cc-t10', name: '5. Shared Responsibility Security Model', difficulty: 'Intermediate', estimatedTime: '20 min', completed: false },
          { id: 'cc-t11', name: '6. Identity & Access Management (IAM) Policies', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
        ]
      },
      {
        id: 'cc-u3',
        unitNumber: 3,
        title: 'Containers & Serverless Architecture',
        description: 'Docker containerization, Kubernetes orchestration pods, and AWS Lambda serverless computing.',
        topicsCount: 5,
        completedCount: 0,
        progress: 0,
        topics: [
          { id: 'cc-t12', name: '1. Docker Containers vs Virtual Machines', difficulty: 'Beginner', estimatedTime: '20 min', completed: false },
          { id: 'cc-t13', name: '2. Container Images, Dockerfiles, and Registries', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cc-t14', name: '3. Kubernetes Architecture: Master Nodes, Worker Nodes, Pods', difficulty: 'Advanced', estimatedTime: '40 min', completed: false },
          { id: 'cc-t15', name: '4. Serverless Computing & Event-Driven Functions (FaaS)', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cc-t16', name: '5. Microservices vs Monolithic Cloud Architectures', difficulty: 'Intermediate', estimatedTime: '30 min', completed: false },
        ]
      },
      {
        id: 'cc-u4',
        unitNumber: 4,
        title: 'Cloud Security, Cost & DevOps',
        description: 'Cloud disaster recovery, SLA agreements, auto-scaling groups, load balancers, and CI/CD pipelines.',
        topicsCount: 6,
        completedCount: 0,
        progress: 0,
        topics: [
          { id: 'cc-t17', name: '1. Elastic Load Balancing & Auto-Scaling Groups', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cc-t18', name: '2. Cloud Monitoring & Telemetry (CloudWatch, Prometheus)', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cc-t19', name: '3. Service Level Agreements (SLA) & High Availability', difficulty: 'Beginner', estimatedTime: '15 min', completed: false },
          { id: 'cc-t20', name: '4. Cloud Disaster Recovery Strategies (RTO & RPO)', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'cc-t21', name: '5. Infrastructure as Code (Terraform / CloudFormation)', difficulty: 'Advanced', estimatedTime: '35 min', completed: false },
          { id: 'cc-t22', name: '6. CI/CD Deployment Pipelines in Cloud', difficulty: 'Advanced', estimatedTime: '30 min', completed: false },
        ]
      }
    ]
  },
  {
    id: 'se-104',
    code: 'CS604',
    name: 'Software Engineering',
    university: 'AKTU / State Technical University',
    department: 'CSE',
    semester: '6th Semester',
    color: 'amber',
    iconName: 'Code',
    description: 'SDLC models (Agile, Waterfall), requirement engineering, UML diagrams, architectural design patterns, software testing, and maintenance.',
    unitsCount: 4,
    topicsCount: 20,
    completedTopics: 1,
    progress: 5,
    lastStudied: '5 days ago',
    units: [
      {
        id: 'se-u1',
        unitNumber: 1,
        title: 'SDLC Methodologies & Agile Frameworks',
        description: 'Waterfall, Spiral, V-Model, Agile Scrum sprints, user stories, and Kanban boards.',
        topicsCount: 5,
        completedCount: 1,
        progress: 20,
        topics: [
          { id: 'se-t1', name: '1. Software Engineering Principles & SDLC Phases', difficulty: 'Beginner', estimatedTime: '15 min', completed: true },
          { id: 'se-t2', name: '2. Waterfall Model, Prototyping & Spiral Model', difficulty: 'Beginner', estimatedTime: '20 min', completed: false },
          { id: 'se-t3', name: '3. Agile Manifesto & Scrum Framework Roles', difficulty: 'Beginner', estimatedTime: '25 min', completed: false },
          { id: 'se-t4', name: '4. Sprint Planning, Backlogs & Burndown Charts', difficulty: 'Intermediate', estimatedTime: '20 min', completed: false },
          { id: 'se-t5', name: '5. Extreme Programming (XP) & Test-Driven Development', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
        ]
      },
      {
        id: 'se-u2',
        unitNumber: 2,
        title: 'Requirements Engineering & UML Modeling',
        description: 'SRS documentation (IEEE 830), Functional vs Non-Functional requirements, Use Case & Class diagrams.',
        topicsCount: 5,
        completedCount: 0,
        progress: 0,
        topics: [
          { id: 'se-t6', name: '1. Requirement Elicitation & SRS Standards (IEEE 830)', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'se-t7', name: '2. Functional vs Non-Functional System Requirements', difficulty: 'Beginner', estimatedTime: '15 min', completed: false },
          { id: 'se-t8', name: '3. UML Structural Diagrams (Class & Component Diagrams)', difficulty: 'Intermediate', estimatedTime: '30 min', completed: false },
          { id: 'se-t9', name: '4. UML Behavioral Diagrams (Use Case, Sequence, Activity)', difficulty: 'Intermediate', estimatedTime: '35 min', completed: false },
          { id: 'se-t10', name: '5. Data Flow Diagrams (DFD Level 0, 1, 2)', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
        ]
      },
      {
        id: 'se-u3',
        unitNumber: 3,
        title: 'Software Design & Architecture Patterns',
        description: 'Cohesion, Coupling, SOLID principles, MVC, Microservices, and GoF Design Patterns.',
        topicsCount: 5,
        completedCount: 0,
        progress: 0,
        topics: [
          { id: 'se-t11', name: '1. Modular Design: Cohesion and Coupling Metrics', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'se-t12', name: '2. SOLID Object-Oriented Design Principles', difficulty: 'Intermediate', estimatedTime: '30 min', completed: false },
          { id: 'se-t13', name: '3. Architectural Styles: MVC, Layered, Event-Driven', difficulty: 'Intermediate', estimatedTime: '30 min', completed: false },
          { id: 'se-t14', name: '4. Creational & Structural Design Patterns (Singleton, Factory)', difficulty: 'Advanced', estimatedTime: '35 min', completed: false },
          { id: 'se-t15', name: '5. Behavioral Design Patterns (Observer, Strategy)', difficulty: 'Advanced', estimatedTime: '30 min', completed: false },
        ]
      },
      {
        id: 'se-u4',
        unitNumber: 4,
        title: 'Software Testing & Quality Assurance',
        description: 'Black-box vs White-box testing, Cyclomatic complexity, Unit testing, Integration testing, and CI/CD.',
        topicsCount: 5,
        completedCount: 0,
        progress: 0,
        topics: [
          { id: 'se-t16', name: '1. Verification vs Validation & V-Model Testing', difficulty: 'Beginner', estimatedTime: '15 min', completed: false },
          { id: 'se-t17', name: '2. White-Box Testing: Basis Path & Cyclomatic Complexity', difficulty: 'Advanced', estimatedTime: '35 min', completed: false },
          { id: 'se-t18', name: '3. Black-Box Testing: Equivalence Partitioning & BVA', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'se-t19', name: '4. Levels of Testing: Unit, Integration, System, Acceptance', difficulty: 'Intermediate', estimatedTime: '25 min', completed: false },
          { id: 'se-t20', name: '5. Software Maintenance, Refactoring & DevOps QA', difficulty: 'Intermediate', estimatedTime: '20 min', completed: false },
        ]
      }
    ]
  }
];

// Rich Educational Theory Content for Topic View
export const richTopicContents = {
  'cn-t4': {
    id: 'cn-t4',
    subjectId: 'cn-101',
    subjectName: 'Computer Networks',
    unitNumber: 1,
    unitTitle: 'Network Fundamentals & Physical Layer',
    title: 'OSI Reference Model (7 Layers)',
    difficulty: 'Intermediate',
    estimatedTime: '25 min',
    progress: 80,
    completed: false,
    learningObjectives: [
      'Explain the fundamental architecture and design goals of the ISO/OSI 7-layer reference model.',
      'Describe the exact role, data unit (PDU), and key protocols operating at each of the 7 layers.',
      'Understand the step-by-step encapsulation and decapsulation process during packet transmission.',
      'Differentiate between the theoretical OSI model and the pragmatic 4-layer TCP/IP protocol suite.',
      'Identify key exam questions, mnemonic devices, and real-world networking scenarios.'
    ],
    overview: `The Open Systems Interconnection (OSI) model is a conceptual framework developed by the International Organization for Standardization (ISO) in 1984. It characterizes and standardizes the communication functions of a telecommunication or computing system without regard to its underlying internal structure and technology. Its primary goal is the interoperability of diverse communication systems with standard protocols.`,
    keyConcepts: [
      {
        title: 'Layered Abstraction',
        content: 'Each layer provides a specific service to the layer above it while hiding the complexity of the implementation details of the lower layers.'
      },
      {
        title: 'Protocol Data Unit (PDU)',
        content: 'Each layer wraps data with headers (and trailers) forming a specific PDU: Data (L7-L5) → Segment (L4) → Packet (L3) → Frame (L2) → Bits (L1).'
      },
      {
        title: 'Encapsulation & Decapsulation',
        content: 'When transmitting, data flows down from Application to Physical (adding headers). Upon receipt, data moves up, stripping headers until raw payload reaches the app.'
      }
    ],
    layers: [
      {
        number: 7,
        name: 'Application Layer',
        pdu: 'Data',
        protocols: 'HTTP, HTTPS, FTP, SMTP, DNS, SSH, Telnet',
        description: 'Directly interacts with software applications (web browsers, email clients). Provides end-user network services and interface.',
        mnemonic: 'All (7)'
      },
      {
        number: 6,
        name: 'Presentation Layer',
        pdu: 'Data',
        protocols: 'SSL/TLS, ASCII, JPEG, MPEG, GIF, JSON/XML serialization',
        description: 'Translates, encrypts, and compresses data so that application software can understand it regardless of system differences.',
        mnemonic: 'People (6)'
      },
      {
        number: 5,
        name: 'Session Layer',
        pdu: 'Data',
        protocols: 'RPC, NetBIOS, PPTP, Sockets Session Mgmt',
        description: 'Establishes, manages, and terminates communication sessions between local and remote applications. Controls simplex/duplex dialogs.',
        mnemonic: 'Seem (5)'
      },
      {
        number: 4,
        name: 'Transport Layer',
        pdu: 'Segment / Datagram',
        protocols: 'TCP, UDP, SCTP, QUIC',
        description: 'Provides end-to-end host communication, port multiplexing, segmentation, flow control (sliding window), and error recovery (TCP checksum & ACK).',
        mnemonic: 'To (4)'
      },
      {
        number: 3,
        name: 'Network Layer',
        pdu: 'Packet',
        protocols: 'IPv4, IPv6, ICMP, ARP, OSPF, BGP, RIP',
        description: 'Responsible for logical addressing (IP addresses), packet routing across multi-hop networks, and path determination (Dijkstra / Bellman-Ford).',
        mnemonic: 'Need (3)'
      },
      {
        number: 2,
        name: 'Data Link Layer',
        pdu: 'Frame',
        protocols: 'Ethernet (802.3), Wi-Fi (802.11), PPP, MAC Addressing',
        description: 'Provides node-to-node data transfer across a physical link. Divided into LLC (Logical Link Control) and MAC (Media Access Control) sublayers. Handles framing and CRC error detection.',
        mnemonic: 'Data (2)'
      },
      {
        number: 1,
        name: 'Physical Layer',
        pdu: 'Bits (0s and 1s)',
        protocols: 'RS-232, Cat6 RJ-45, Fiber Optic cables, Hubs, Repeaters',
        description: 'Transmits raw unstructured bit streams over physical transmission mediums (copper wire, fiber optics, radio waves). Specifies electrical voltages, pinouts, and clocking.',
        mnemonic: 'Processing (1)'
      }
    ],
    howItWorks: `When you send an email or access a web page:
1. You request https://example.com in Chrome (Application Layer).
2. The browser encrypts the request with TLS 1.3 (Presentation Layer).
3. A session is opened with the remote server port 443 (Session Layer).
4. TCP divides your request into segments, adding source/destination ports (Transport Layer).
5. The Network Layer adds source and destination IP addresses, creating IP packets.
6. The Data Link Layer adds source and destination MAC addresses and a CRC checksum, creating Ethernet frames.
7. The Physical Layer turns the frames into electrical pulses or light frequencies traveling through your router cable.`,
    realWorldExample: {
      title: 'Postal Mail Analogy',
      content: `Think of writing a letter to a friend abroad:
- Application: The handwritten letter content.
- Presentation: Translating it into English and sealing in an envelope.
- Session: Confirming your friend's current address availability.
- Transport: Choosing between Certified Registered Post (TCP - guaranteed) or Regular Postcard (UDP - fast, no receipt).
- Network: Postal ZIP code routing your letter between distribution centers across countries.
- Data Link: The local delivery van moving the mail bag from warehouse to neighborhood hub.
- Physical: The asphalt roads and tires transporting physical weight.`
    },
    examTips: [
      '🔥 Mnemonic to remember Layer 7 to 1: "All People Seem To Need Data Processing" (Application down to Physical).',
      '🔥 Mnemonic to remember Layer 1 to 7: "Please Do Not Throw Sausage Pizza Away" (Physical up to Application).',
      '🔥 High-frequency exam distinction: Hubs operate at Layer 1, Switches operate at Layer 2 (MAC), Routers operate at Layer 3 (IP), and Gateways/Firewalls operate up to Layer 7.',
      '🔥 Remember: Data Link Layer is the ONLY layer that adds BOTH a Header AND a Trailer (FCS/CRC) to its PDU.'
    ],
    keyTerms: [
      { term: 'PDU', definition: 'Protocol Data Unit — the unit of data specified in protocol layers.' },
      { term: 'Encapsulation', definition: 'Wrapping lower-layer metadata headers around higher-layer payloads.' },
      { term: 'MAC Address', definition: '48-bit physical hardware address burnt into the NIC at Layer 2.' },
      { term: 'IP Address', definition: '32-bit (IPv4) or 128-bit (IPv6) logical network address at Layer 3.' },
      { term: 'Port Number', definition: '16-bit address distinguishing application processes at Layer 4 (e.g., HTTP:80, HTTPS:443).' }
    ],
    videos: [
      {
        id: 'v-101',
        title: 'OSI Model Explained | Real World Examples for Beginners',
        channel: 'NetworkChuck',
        duration: '18:42',
        views: '2.4M views',
        difficulty: 'Beginner',
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://www.youtube.com/watch?v=0BopgP-i5oU',
        videoId: '0BopgP-i5oU',
        description: 'Comprehensive breakdown of all 7 layers with hands-on Wireshark packet capture visualization.'
      },
      {
        id: 'v-102',
        title: 'OSI 7 Layer Reference Model - Computer Networks Semester Prep',
        channel: 'Gate Smashers',
        duration: '22:15',
        views: '1.8M views',
        difficulty: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://www.youtube.com/watch?v=vv4y_uOneC0',
        videoId: 'vv4y_uOneC0',
        description: 'Direct university exam focus, diagrams, protocol table, and frequently asked viva questions.'
      },
      {
        id: 'v-103',
        title: 'TCP/IP vs OSI Model: Key Differences Explained Clearly',
        channel: 'PowerCert Animated Videos',
        duration: '12:30',
        views: '950K views',
        difficulty: 'Beginner',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://www.youtube.com/watch?v=LANW3m7UgLN',
        videoId: 'LANW3m7UgLN',
        description: 'Animated comparison of the 7-layer OSI model against the modern 4-layer TCP/IP stack.'
      }
    ],
    prevTopicId: 'cn-t3',
    nextTopicId: 'cn-t5'
  }
};

export const careerTracks = [
  {
    id: 'career-fullstack',
    name: 'Full Stack Developer',
    iconName: 'Layers',
    badge: 'High Demand',
    description: 'Build end-to-end web applications combining modern frontend frameworks, scalable backend APIs, and cloud databases.',
    estimatedDuration: '6 - 8 Months',
    averageSalary: '$95,000 / ₹12-18 LPA',
    matchScore: 88,
    requiredSkills: ['HTML/CSS', 'JavaScript (ES6+)', 'React', 'Node.js', 'Express', 'SQL/PostgreSQL', 'MongoDB', 'Git/GitHub', 'REST APIs', 'Docker'],
    popularity: '94% of CSE graduates target this role'
  },
  {
    id: 'career-frontend',
    name: 'Frontend Developer',
    iconName: 'Layout',
    badge: 'Design & Code',
    description: 'Specialize in user interfaces, responsive web apps, performance optimization, accessibility, and modern UI engineering.',
    estimatedDuration: '4 - 6 Months',
    averageSalary: '$85,000 / ₹10-15 LPA',
    matchScore: 92,
    requiredSkills: ['HTML5/CSS3', 'Modern JavaScript', 'TypeScript', 'React.js', 'Tailwind CSS', 'State Management', 'Web Performance', 'Testing (Jest/Vitest)'],
    popularity: 'High frontend industry openings'
  },
  {
    id: 'career-backend',
    name: 'Backend Developer',
    iconName: 'Server',
    badge: 'Scalability & Systems',
    description: 'Architect distributed systems, design relational/NoSQL databases, write secure microservices, and manage API gateways.',
    estimatedDuration: '5 - 7 Months',
    averageSalary: '$98,000 / ₹12-20 LPA',
    matchScore: 79,
    requiredSkills: ['Node.js / Python / Java', 'Express / FastAPI', 'PostgreSQL', 'Redis Caching', 'System Design', 'Authentication (JWT/OAuth)', 'Microservices', 'Docker'],
    popularity: 'Strong enterprise & startup demand'
  },
  {
    id: 'career-aiml',
    name: 'AI / Machine Learning Engineer',
    iconName: 'Sparkles',
    badge: 'Trending & Fast Growing',
    description: 'Develop intelligent models, fine-tune LLMs, build RAG pipelines, deploy neural networks, and analyze large datasets.',
    estimatedDuration: '8 - 10 Months',
    averageSalary: '$115,000 / ₹15-25 LPA',
    matchScore: 74,
    requiredSkills: ['Python', 'NumPy & Pandas', 'Scikit-Learn', 'PyTorch / TensorFlow', 'Vector Databases', 'Prompt Engineering', 'LangChain / LlamaIndex', 'Math & Statistics'],
    popularity: 'Top booming tech domain in 2025+'
  },
  {
    id: 'career-data',
    name: 'Data Analyst / BI Specialist',
    iconName: 'BarChart3',
    badge: 'Analytical',
    description: 'Transform raw datasets into actionable executive insights using SQL, Python, Tableau/PowerBI, and statistical modeling.',
    estimatedDuration: '4 - 5 Months',
    averageSalary: '$78,000 / ₹8-14 LPA',
    matchScore: 82,
    requiredSkills: ['Advanced SQL', 'Python (Pandas, Seaborn)', 'Excel & PowerQuery', 'PowerBI / Tableau', 'Statistical Analysis', 'A/B Testing', 'Data Storytelling'],
    popularity: 'Every industry needs data analytics'
  },
  {
    id: 'career-cloud',
    name: 'Cloud & DevOps Engineer',
    iconName: 'CloudRain',
    badge: 'Infrastructure',
    description: 'Automate CI/CD pipelines, configure cloud architectures (AWS/GCP), deploy Kubernetes clusters, and maintain 99.99% uptime.',
    estimatedDuration: '6 - 9 Months',
    averageSalary: '$105,000 / ₹14-22 LPA',
    matchScore: 68,
    requiredSkills: ['Linux Fundamentals', 'AWS / Azure', 'Docker & Kubernetes', 'Terraform (IaC)', 'CI/CD (GitHub Actions)', 'Bash/Python Scripting', 'Monitoring (Grafana)'],
    popularity: 'Critical role across all cloud companies'
  },
  {
    id: 'career-cyber',
    name: 'Cybersecurity Analyst',
    iconName: 'ShieldCheck',
    badge: 'High Security',
    description: 'Protect organizations from security threats, perform penetration testing, analyze network vulnerabilities, and ensure compliance.',
    estimatedDuration: '6 - 8 Months',
    averageSalary: '$92,000 / ₹11-18 LPA',
    matchScore: 71,
    requiredSkills: ['Network Security & Protocols', 'Linux / Bash', 'Wireshark & Nmap', 'OWASP Top 10', 'Penetration Testing (Metasploit)', 'Cryptography', 'SIEM Tools'],
    popularity: 'Crucial role in banking & defense tech'
  },
  {
    id: 'career-mobile',
    name: 'Mobile App Developer',
    iconName: 'Smartphone',
    badge: 'iOS & Android',
    description: 'Create native and cross-platform mobile apps for millions of users with React Native or Flutter.',
    estimatedDuration: '5 - 7 Months',
    averageSalary: '$88,000 / ₹10-16 LPA',
    matchScore: 76,
    requiredSkills: ['React Native / Flutter', 'JavaScript / Dart', 'Mobile UI/UX', 'REST & GraphQL APIs', 'Native Device APIs (Camera, GPS)', 'App Store & Play Store Deployment'],
    popularity: 'Massive mobile-first consumer ecosystem'
  }
];

export const skillAssessmentCategories = [
  {
    name: 'Programming & Logic',
    iconName: 'Code',
    skills: [
      { id: 's_c', name: 'C / C++', description: 'Pointers, memory management, OOP concepts', defaultLevel: 'Intermediate' },
      { id: 's_py', name: 'Python', description: 'Syntax, data structures, scripting, OOP', defaultLevel: 'Intermediate' },
      { id: 's_js', name: 'JavaScript (ES6+)', description: 'Promises, Async/Await, Closures, DOM', defaultLevel: 'Beginner' },
    ]
  },
  {
    name: 'Web Development',
    iconName: 'Globe',
    skills: [
      { id: 's_html', name: 'HTML & CSS', description: 'Semantic markup, Flexbox, Grid, Responsive UI', defaultLevel: 'Advanced' },
      { id: 's_react', name: 'React.js', description: 'Components, Hooks, State management, Routing', defaultLevel: 'Beginner' },
      { id: 's_node', name: 'Node.js & Express', description: 'Server architecture, REST endpoints, Middleware', defaultLevel: 'Never Used' },
    ]
  },
  {
    name: 'Database & Storage',
    iconName: 'Database',
    skills: [
      { id: 's_sql', name: 'SQL & Relational DBs', description: 'Queries, Joins, Normalization, Indexing', defaultLevel: 'Intermediate' },
      { id: 's_nosql', name: 'MongoDB / NoSQL', description: 'Document models, Aggregations, Mongoose', defaultLevel: 'Never Used' },
    ]
  },
  {
    name: 'Tools & DevOps',
    iconName: 'Wrench',
    skills: [
      { id: 's_git', name: 'Git & GitHub', description: 'Branching, Pull Requests, Merge conflicts', defaultLevel: 'Intermediate' },
      { id: 's_api', name: 'REST APIs & Postman', description: 'HTTP verbs, JSON formats, Status codes', defaultLevel: 'Beginner' },
    ]
  },
  {
    name: 'Computer Science Core',
    iconName: 'Binary',
    skills: [
      { id: 's_dsa', name: 'Data Structures & Algorithms', description: 'Arrays, Trees, Graphs, Sorting, DP', defaultLevel: 'Intermediate' },
      { id: 's_cn', name: 'Computer Networks', description: 'OSI Model, TCP/IP, Routing, Protocols', defaultLevel: 'Intermediate' },
    ]
  }
];

export const initialFullStackRoadmap = {
  careerName: 'Full Stack Developer',
  overallProgress: 42,
  currentLevel: 'Intermediate',
  nextSkill: 'React Hooks & State Management',
  summary: 'Your personalized path from your current skill level (HTML/CSS & basic JS) to job-ready full-stack engineering with modern cloud deployment.',
  phases: [
    {
      id: 'phase-1',
      phaseNumber: 1,
      title: 'Phase 1: JavaScript Fundamentals & Modern ES6+',
      status: 'Completed', // Completed | In Progress | Locked
      progress: 100,
      description: 'Master core language mechanics, asynchronous event loop, and DOM manipulation.',
      topics: [
        { name: 'Variables (let/const), Data Types & Scopes', completed: true },
        { name: 'Arrow Functions, Higher-Order Functions (map/filter/reduce)', completed: true },
        { name: 'Objects, Arrays, Destructuring & Spread Syntax', completed: true },
        { name: 'DOM Manipulation & Event Listeners', completed: true },
        { name: 'Asynchronous JS: Callbacks, Promises, Async/Await', completed: true },
        { name: 'Fetch API & JSON handling', completed: true }
      ]
    },
    {
      id: 'phase-2',
      phaseNumber: 2,
      title: 'Phase 2: Modern Frontend with React.js',
      status: 'In Progress',
      progress: 40,
      isCurrent: true,
      description: 'Build component-driven single-page applications with declarative state and lifecycle hooks.',
      topics: [
        { name: 'JSX Syntax & Functional Components', completed: true },
        { name: 'Props, Component Reusability & Children', completed: true },
        { name: 'useState & Managing Reactive State', completed: false, isNext: true },
        { name: 'useEffect, Side Effects & API Fetching', completed: false },
        { name: 'React Router v6 for Navigation & Dynamic Routes', completed: false },
        { name: 'Context API for Global State Management', completed: false },
        { name: 'Tailwind CSS integration in React', completed: false }
      ]
    },
    {
      id: 'phase-3',
      phaseNumber: 3,
      title: 'Phase 3: Backend Development with Node.js & Express',
      status: 'Locked',
      progress: 0,
      description: 'Create production-ready server applications, robust REST APIs, and authentication flows.',
      topics: [
        { name: 'Node.js Runtime, Modules & NPM', completed: false },
        { name: 'Express.js Server, Routing & Middleware', completed: false },
        { name: 'RESTful API Design & Error Handling', completed: false },
        { name: 'User Authentication with JWT (JSON Web Tokens) & Bcrypt', completed: false },
        { name: 'Input Validation (Zod/Joi) & CORS Configuration', completed: false }
      ]
    },
    {
      id: 'phase-4',
      phaseNumber: 4,
      title: 'Phase 4: Database Modeling & ORM Integration',
      status: 'Locked',
      progress: 0,
      description: 'Store and query persistent data with relational SQL and NoSQL document databases.',
      topics: [
        { name: 'PostgreSQL Schema Design & Relational Tables', completed: false },
        { name: 'Complex SQL Queries, Foreign Keys & Transactions', completed: false },
        { name: 'Prisma ORM / Supabase Database Client', completed: false },
        { name: 'MongoDB & Mongoose Document Schemas', completed: false },
        { name: 'Database Indexing & Query Optimization', completed: false }
      ]
    },
    {
      id: 'phase-5',
      phaseNumber: 5,
      title: 'Phase 5: Full Stack Projects & Cloud Deployment',
      status: 'Locked',
      progress: 0,
      description: 'Combine frontend, backend, database, and cloud CI/CD into portfolio-ready applications.',
      topics: [
        { name: 'Connecting React Frontend with Node/Express Backend', completed: false },
        { name: 'File Uploads with Cloudinary / AWS S3', completed: false },
        { name: 'Dockerizing Full Stack Applications', completed: false },
        { name: 'Deployment on Vercel & Render / Railway', completed: false },
        { name: 'WebSockets for Real-Time Chat & Notifications', completed: false }
      ]
    }
  ],
  skillGaps: [
    { skill: 'HTML & Semantic Markup', currentPercentage: 95, targetPercentage: 100, status: 'Mastered' },
    { skill: 'CSS & Responsive Design', currentPercentage: 80, targetPercentage: 90, status: 'Good' },
    { skill: 'JavaScript (ES6+ / Async)', currentPercentage: 60, targetPercentage: 90, status: 'Priority Focus' },
    { skill: 'React.js & Hooks', currentPercentage: 40, targetPercentage: 85, status: 'Learning Now' },
    { skill: 'Node.js & Express APIs', currentPercentage: 20, targetPercentage: 85, status: 'Skill Gap' },
    { skill: 'MongoDB / PostgreSQL', currentPercentage: 15, targetPercentage: 80, status: 'Skill Gap' },
    { skill: 'Docker & Cloud Deployment', currentPercentage: 5, targetPercentage: 70, status: 'Skill Gap' },
  ],
  prioritySkills: [
    { rank: 1, name: 'JavaScript Deep Dive', reason: 'Critical foundation before mastering advanced React patterns.' },
    { rank: 2, name: 'React Hooks & State', reason: 'Your immediate next step in the frontend roadmap.' },
    { rank: 3, name: 'Node.js & Express REST APIs', reason: 'Needed to bridge frontend skills to complete full stack capability.' }
  ],
  recommendedNextStep: {
    title: 'Learn React Hooks (useState & useEffect)',
    why: 'You already understand JavaScript fundamentals and React JSX syntax. React Hooks are the essential building block for handling interactive state, form submissions, and asynchronous data fetching in modern web apps.',
    estimatedDuration: '3 Hours of practice',
    badge: 'Immediate Priority'
  },
  projectRecommendations: [
    {
      id: 'proj-1',
      title: 'Interactive Study Planner & Task Hub',
      difficulty: 'Beginner',
      skills: ['React', 'Tailwind CSS', 'LocalStorage', 'Lucide Icons'],
      estimatedTime: '2 - 3 Days',
      description: 'Build a productivity tool featuring task categorization, deadline countdowns, and completion metrics.',
      isRecommended: true
    },
    {
      id: 'proj-2',
      title: 'DevCollab: Technical Discussion & Snippet Platform',
      difficulty: 'Intermediate',
      skills: ['React', 'Node.js', 'Express', 'PostgreSQL', 'JWT Auth'],
      estimatedTime: '1 - 2 Weeks',
      description: 'Full stack community board where engineers post coding questions, upvote answers, and share syntax-highlighted snippets.',
      isRecommended: true
    },
    {
      id: 'proj-3',
      title: 'CampusMart: Student Marketplace with Image Uploads',
      difficulty: 'Intermediate',
      skills: ['React', 'Node/Express', 'MongoDB', 'Cloudinary', 'Stripe Mock'],
      estimatedTime: '2 Weeks',
      description: 'College marketplace for buying and selling second-hand textbooks, lab equipment, and notes with real-time filters.',
      isRecommended: false
    },
    {
      id: 'proj-4',
      title: 'SaaS AI Roadmap & Learning Tracker (Capstone Project)',
      difficulty: 'Advanced',
      skills: ['React', 'Node/Express', 'Supabase', 'AI API Integration', 'Docker'],
      estimatedTime: '3 - 4 Weeks',
      description: 'Full-fledged SaaS product with syllabus parsing, AI recommendations, streak tracking, and interactive timelines.',
      isRecommended: true
    }
  ]
};

export const notificationsList = [
  {
    id: 'n1',
    title: 'Computer Networks Progress',
    message: 'You completed 5 topics this week. You are on track to finish Unit 1!',
    time: '2 hours ago',
    read: false,
    type: 'success',
    link: '/study/cn-101'
  },
  {
    id: 'n2',
    title: 'Career Roadmap Recommendation',
    message: 'AI generated a new recommended next step: "Learn React Hooks" for your Full Stack roadmap.',
    time: '5 hours ago',
    read: false,
    type: 'ai',
    link: '/career/roadmap'
  },
  {
    id: 'n3',
    title: 'Streak Milestone 🔥',
    message: 'You have maintained a 7-day learning streak. Keep up the momentum!',
    time: '1 day ago',
    read: true,
    type: 'streak',
    link: '/progress'
  },
  {
    id: 'n4',
    title: 'New Syllabus Analyzed',
    message: 'Software Engineering syllabus was successfully organized into 4 units.',
    time: '2 days ago',
    read: true,
    type: 'info',
    link: '/study/se-104'
  }
];

export const weeklyActivityData = [
  { day: 'Mon', hours: 3.5, topics: 3 },
  { day: 'Tue', hours: 4.2, topics: 4 },
  { day: 'Wed', hours: 2.8, topics: 2 },
  { day: 'Thu', hours: 5.1, topics: 5 },
  { day: 'Fri', hours: 4.0, topics: 3 },
  { day: 'Sat', hours: 6.5, topics: 4 },
  { day: 'Sun', hours: 3.2, topics: 2 },
];
