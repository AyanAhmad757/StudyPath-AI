-- ==============================================================================
-- FRIDAY AI - SEED DATA
-- Description: Standard Career Paths & Core CSE Skills Catalog
-- ==============================================================================

-- 1. SEED CAREER PATHS
INSERT INTO public.career_paths (id, name, slug, description, icon, salary_range, badge)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Full Stack Developer', 'full-stack-developer', 'Build scalable client-side React apps and high-performance Node/Express APIs with modern databases.', 'Code2', '₹12 - 28 LPA', 'Top Track'),
    ('c0000000-0000-0000-0000-000000000002', 'Frontend Engineer', 'frontend-engineer', 'Master reactive UI architecture, state machines, web performance, and modern component systems.', 'Palette', '₹10 - 24 LPA', 'High Demand'),
    ('c0000000-0000-0000-0000-000000000003', 'Backend Engineer', 'backend-engineer', 'Design distributed microservices, message queues, relational database schemas, and robust REST/gRPC APIs.', 'Server', '₹12 - 30 LPA', 'Core Engineering'),
    ('c0000000-0000-0000-0000-000000000004', 'AI & Machine Learning Engineer', 'ai-ml-engineer', 'Train neural networks, fine-tune LLMs, integrate vector databases, and deploy inference pipelines.', 'Sparkles', '₹14 - 35 LPA', 'Trending'),
    ('c0000000-0000-0000-0000-000000000005', 'Data Analyst', 'data-analyst', 'Transform complex datasets into actionable business intelligence using SQL, Python, and interactive dashboards.', 'Database', '₹8 - 20 LPA', 'Popular'),
    ('c0000000-0000-0000-0000-000000000006', 'Cybersecurity Engineer', 'cybersecurity-engineer', 'Protect systems, audit network vulnerabilities, implement cryptography protocols, and secure cloud endpoints.', 'Shield', '₹12 - 32 LPA', 'Critical Role'),
    ('c0000000-0000-0000-0000-000000000007', 'Cloud & DevOps Engineer', 'cloud-devops-engineer', 'Automate CI/CD deployment pipelines, containerize applications with Docker, and orchestrate Kubernetes on AWS.', 'Cloud', '₹14 - 32 LPA', 'High Growth'),
    ('c0000000-0000-0000-0000-000000000008', 'Mobile App Developer', 'mobile-app-developer', 'Engineer smooth cross-platform mobile apps for iOS and Android using React Native and Flutter.', 'Smartphone', '₹10 - 25 LPA', 'Growing')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED CORE SKILLS CATALOG
INSERT INTO public.skills (name, category)
VALUES
    -- Category: Frontend Core
    ('HTML', 'Frontend Core'),
    ('CSS', 'Frontend Core'),
    ('JavaScript', 'Frontend Core'),
    ('React', 'Frontend Core'),
    ('REST APIs', 'Frontend Core'),

    -- Category: Backend & Runtime
    ('Node.js', 'Backend & Runtime'),
    ('Express', 'Backend & Runtime'),
    ('Python', 'Backend & Runtime'),
    ('Java', 'Backend & Runtime'),
    ('C++', 'Backend & Runtime'),

    -- Category: Databases & Cloud
    ('SQL', 'Databases & Cloud'),
    ('MongoDB', 'Databases & Cloud'),
    ('Cloud Computing', 'Databases & Cloud'),
    ('Docker', 'Databases & Cloud'),
    ('Linux', 'Databases & Cloud'),

    -- Category: CS Foundations & Applied
    ('Git/GitHub', 'CS Foundations'),
    ('Data Structures', 'CS Foundations'),
    ('Algorithms', 'CS Foundations'),
    ('Cybersecurity Fundamentals', 'CS Foundations'),
    ('Machine Learning', 'CS Foundations')
ON CONFLICT (name) DO NOTHING;
