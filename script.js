document.addEventListener("DOMContentLoaded", () => {

    // 1. Trigger initial load animations
    setTimeout(() => {
        const loadElems = document.querySelectorAll('.hidden-onload');
        loadElems.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, index * 200);
        });
    }, 100);

    // 2. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');

                if (entry.target.classList.contains('impact')) {
                    const counters = entry.target.querySelectorAll('.counter');
                    runCounters(counters);
                }

                // New cinematic reveal animation logic
                const revealChildren = entry.target.querySelectorAll('.reveal-item');
                revealChildren.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('is-visible');
                    }, index * 150);
                });

                const childrenToFade = entry.target.querySelectorAll('.fade-up, .fade-left, .fade-right');
                childrenToFade.forEach(child => child.classList.add('is-visible'));

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach(section => {
        scrollObserver.observe(section);
    });

    // 3. Counter Animation Logic
    function runCounters(counters) {
        counters.forEach(counter => {
            counter.innerText = '0';
            const updateCounter = () => {
                const target = +counter.getAttribute('data-target');
                const c = +counter.innerText;
                const increment = target / 50;
                if (c < target) {
                    counter.innerText = `${Math.ceil(c + increment)}`;
                    setTimeout(updateCounter, 30);
                } else {
                    counter.innerText = target;
                }
            };
            updateCounter();
        });
    }

    // 4. Parallax effect for Glow Orbs
    const orb1 = document.querySelector('.orb-1');
    const orb2 = document.querySelector('.orb-2');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (orb1 && orb2) {
            orb1.style.transform = `translateY(${scrolled * 0.1}px) translateX(${scrolled * -0.05}px)`;
            orb2.style.transform = `translateY(${scrolled * -0.1}px) translateX(${scrolled * 0.05}px)`;
        }
    });

    // 5. Interactive Phone Mockup Logic
    const matchCard = document.getElementById('matchCard');
    const btnReject = document.getElementById('btnReject');
    const btnAccept = document.getElementById('btnAccept');
    const matchSuccess = document.getElementById('matchSuccess');
    const btnReset = document.getElementById('btnReset');

    if (matchCard) {
        let isDragging = false;
        let startX = 0;
        let currentX = 0;

        const handleDragStart = (e) => {
            isDragging = true;
            startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            matchCard.style.transition = 'none';
        };

        const handleDragMove = (e) => {
            if (!isDragging) return;
            currentX = (e.type.includes('mouse') ? e.pageX : e.touches[0].clientX) - startX;
            const rotation = currentX * 0.1;
            matchCard.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;
            matchCard.style.opacity = `${1 - Math.abs(currentX) / 300}`;
        };

        const handleDragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            matchCard.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

            if (Math.abs(currentX) > 100) {
                const direction = currentX > 0 ? 1 : -1;
                matchCard.style.transform = `translateX(${direction * 400}px) rotate(${direction * 30}deg)`;
                matchCard.style.opacity = '0';
                if (direction === 1) setTimeout(showSuccess, 300);
            } else {
                matchCard.style.transform = 'translateX(0) rotate(0deg)';
                matchCard.style.opacity = '1';
            }
            currentX = 0;
        };

        matchCard.addEventListener('mousedown', handleDragStart);
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        matchCard.addEventListener('touchstart', handleDragStart, { passive: true });
        document.addEventListener('touchmove', handleDragMove, { passive: true });
        document.addEventListener('touchend', handleDragEnd);

        if (btnReject) {
            btnReject.addEventListener('click', () => {
                matchCard.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
                matchCard.style.transform = 'translateX(-400px) rotate(-30deg)';
                matchCard.style.opacity = '0';
                setTimeout(resetCard, 600);
            });
        }
        if (btnAccept) {
            btnAccept.addEventListener('click', () => {
                matchCard.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
                matchCard.style.transform = 'translateX(400px) rotate(30deg)';
                matchCard.style.opacity = '0';
                setTimeout(showSuccess, 400);
            });
        }

        btnReset.addEventListener('click', resetCard);

        function showSuccess() {
            matchSuccess.classList.add('active');
        }

        function resetCard() {
            matchSuccess.classList.remove('active');
            matchCard.style.transition = 'none';
            matchCard.style.transform = 'translateX(0) rotate(0deg)';
            matchCard.style.opacity = '1';
            void matchCard.offsetWidth;
            matchCard.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        }
    }

    // 6. Profile Builder Logic — now handled by wizard.js

    // 7. Language Switcher Logic
    const langBtns = document.querySelectorAll('.lang-btn');
    const translations = {
        en: {
            'nav.howItWorks': 'How It Works',
            'nav.whySkillup': 'Why SkillUp',
            'nav.impact': 'Impact',
            'nav.cta': 'Get Started',
            'hero.tagline': 'Experience Without Experience',
            'hero.title': 'Your First Opportunity<br>Starts Here.',
            'hero.subtitle': 'Connecting driven students with real-world experience &mdash; no prior experience required. Build your future today.',
            'hero.btnStudent': 'I\'m a Student',
            'hero.btnBusiness': 'I\'m a Business',
            'howItWorks.title': 'How It Works',
            'howItWorks.step1.title': '1. Create a Profile',
            'howItWorks.step1.desc': 'Students build a profile highlighting their drive, skills, and interests in minutes.',
            'howItWorks.step2.title': '2. Post Opportunities',
            'howItWorks.step2.desc': 'Businesses post internships and entry-level roles designed for motivated young talent.',
            'howItWorks.step3.title': '3. Smart Matching',
            'howItWorks.step3.desc': 'Our intelligent system connects the right students with the right businesses automatically.',
            'matching.card.name': 'Alex J., 17',
            'matching.card.role': 'Aspiring Developer',
            'matching.card.tag1': 'Frontend',
            'matching.card.tag2': 'Design',
            'matching.hint': 'Drag right to match',
            'matching.success.title': 'It\'s a Match!',
            'matching.success.desc': 'TechCorp wants to meet you.',
            'matching.success.btn': 'Continue',
            'matching.label': 'Smart Matching',
            'matching.title': 'Connect with a swipe.',
            'matching.subtitle': 'Our intuitive interface makes discovering opportunities and talent as simple as a swipe. Interact with the device to see how businesses find their ideal candidates instantly.',
            'matching.feature1': 'Algorithm-curated daily matches',
            'matching.feature2': 'Zero fluff, straight to the point',
            'matching.feature3': 'Instant connections via chat',
            'profile.label': 'Your Profile',
            'profile.title': 'Your story, beautifully told.',
            'profile.subtitle': 'Our AI-powered wizard builds your perfect profile in minutes. Answer a few questions and watch the magic happen.',
            'profile.group2.title': 'Core Strengths',
            'profile.group2.desc': 'Select up to 3',
            'profile.tags.strength1': 'Leadership',
            'profile.tags.strength2': 'Communication',
            'profile.tags.strength3': 'Problem Solving',
            'profile.tags.strength4': 'Creativity',
            'profile.tags.strength5': 'Adaptability',
            'profile.tags.strength6': 'Work Ethic',
            'profile.group3.title': 'Areas for Growth',
            'profile.tags.weakness1': 'Public Speaking',
            'profile.tags.weakness2': 'Time Management',
            'profile.tags.weakness3': 'Delegation',
            'profile.tags.weakness4': 'Patience',
            'profile.group5.title': 'Role & Availability',
            'profile.group5.role': 'e.g. Frontend Developer',
            'profile.group5.avail': 'e.g. 15 hrs/week, Summer',
            'profile.group4.title': 'Relevant Experience (Optional)',
            'profile.group4.exp': 'Mention any clubs, projects, or volunteer work...',
            'profile.visualizer.complete': 'Complete',
            'profile.visualizer.feedback.start': 'Start building your profile to unlock matches.',
            // Wizard-specific keys
            'wizard.step1': 'Welcome',
            'wizard.step2': 'Academics',
            'wizard.step3': 'Personality',
            'wizard.step4': 'Skills',
            'wizard.step5': 'Profile',
            'wizard.back': 'Back',
            'wizard.next': 'Next →',
            'wizard.welcome.title': 'Let\'s get to know you',
            'wizard.welcome.desc': 'We\'ll build your perfect profile together, one step at a time.',
            'wizard.welcome.namePh': 'What\'s your name?',
            'wizard.welcome.agePh': 'Your age range',
            'wizard.academics.title': 'Your academic journey',
            'wizard.academics.desc': 'Tell us about your education so we can find the best matches.',
            'wizard.academics.gpaPh': 'e.g. 3.8 GPA',
            'wizard.academics.levelPh': 'School level',
            'wizard.academics.hs': 'High School',
            'wizard.academics.college': 'College / University',
            'wizard.academics.vocational': 'Vocational / Trade',
            'wizard.academics.fieldPh': 'e.g. Computer Science, Design...',
            'wizard.quiz.title': 'AI Personality Analysis',
            'wizard.quiz.desc': 'Answer 4 quick scenarios. Our AI will map your personality traits.',
            'wizard.quiz.resultsTitle': 'Your AI Personality Profile',
            'wizard.quiz.q1.label': 'Scenario 1 of 4',
            'wizard.quiz.q1.text': 'You\'re assigned a group project with no clear leader. What do you do?',
            'wizard.quiz.q1.a': 'Take charge and organize the team',
            'wizard.quiz.q1.b': 'Brainstorm unique ideas and propose a creative direction',
            'wizard.quiz.q1.c': 'Research thoroughly and build a detailed plan',
            'wizard.quiz.q1.d': 'Check in with everyone and make sure all voices are heard',
            'wizard.quiz.q2.label': 'Scenario 2 of 4',
            'wizard.quiz.q2.text': 'You have a free Saturday. How do you spend it?',
            'wizard.quiz.q2.a': 'Working on a personal project or hobby',
            'wizard.quiz.q2.b': 'Hanging out with friends or meeting new people',
            'wizard.quiz.q2.c': 'Reading, learning something new, or taking an online course',
            'wizard.quiz.q2.d': 'Planning your goals and organizing your week ahead',
            'wizard.quiz.q3.label': 'Scenario 3 of 4',
            'wizard.quiz.q3.text': 'A teammate misses a deadline. How do you react?',
            'wizard.quiz.q3.a': 'Reassign tasks to keep the project on track',
            'wizard.quiz.q3.b': 'Talk to them privately and offer help',
            'wizard.quiz.q3.c': 'Analyze what went wrong and create a better system',
            'wizard.quiz.q3.d': 'Find a creative workaround to recover lost time',
            'wizard.quiz.q4.label': 'Scenario 4 of 4',
            'wizard.quiz.q4.text': 'You\'re given a chance to pitch an idea to a CEO. What\'s your approach?',
            'wizard.quiz.q4.a': 'Lead with a bold, confident vision',
            'wizard.quiz.q4.b': 'Present data-driven arguments with clear metrics',
            'wizard.quiz.q4.c': 'Design a visually stunning presentation that tells a story',
            'wizard.quiz.q4.d': 'Focus on how the idea will help people and build community',
            'wizard.skills.title': 'Skills & Experience',
            'wizard.complete.title': 'Your profile is ready!',
            'wizard.complete.desc': 'Here\'s what our AI built for you.',
            'why.student.label': 'For Students',
            'why.student.title': 'Gain experience early.',
            'why.student.list1': 'Build a real-world resume before graduating.',
            'why.student.list2': 'Discover career paths you\'ll actually love.',
            'why.student.list3': 'Connect with mentors and industry professionals.',
            'why.student.card.title': 'Student Success',
            'why.student.card.body': '\"SkillUp helped me land my first marketing internship when I was 16. It changed my trajectory entirely.\"',
            'why.business.label': 'For Businesses',
            'why.business.title': 'Discover motivated talent.',
            'why.business.list1': 'Access a fresh pool of young, driven candidates.',
            'why.business.list2': 'Build your talent pipeline early and reduce future hiring costs.',
            'why.business.list3': 'Bring fresh, innovative perspectives to your team.',
            'why.business.card.title': 'Business Impact',
            'why.business.card.body': '\"The students we found through SkillUp have been our most eager and dedicated interns.\"',
            'impact.title': 'Making a Real Impact',
            'impact.stat1': 'Students Matched',
            'impact.stat2': 'Partner Businesses',
            'impact.stat3': 'Success Rate',
            'cta.title': 'Start Building Your Future Today.',
            'cta.subtitle': 'Join the platform redefining early career opportunities.',
            'cta.btn': 'Create Your Account',
            'footer.desc': 'Empowering the next generation of talent.',
            'footer.links.platform': 'Platform',
            'footer.links.student': 'For Students',
            'footer.links.business': 'For Businesses',
            'footer.links.how': 'How it Works',
            'footer.links.company': 'Company',
            'footer.links.about': 'About Us',
            'footer.links.careers': 'Careers',
            'footer.links.contact': 'Contact',
            'footer.copyright': '&copy; 2026 SkillUp. All rights reserved.',
            // New sections from presentation
            'about.title': 'About Us',
            'about.desc': 'SkillUp is a digital platform that drives unexplored talent. Connecting adolescents and young people without work experience with companies, it facilitates access to employment opportunities through vocational test results, identifying skills, interests, and talents to create each profile.',
            'mission.title': 'Our Mission',
            'mission.text': 'Reduce youth unemployment by facilitating access to employment opportunities through the use of technology.',
            'vision.title': 'Our Vision',
            'vision.text': 'Contribute to the formation of a prepared generation that strengthens the country\'s economy.',
            'value.title': 'Value Proposition',
            'value.text': 'To combat youth unemployment, our platform connects young people with little or no work experience with companies seeking emerging talent. Unlike traditional platforms that prioritize previous experience, we focus on evaluating skills, qualities, and potential, and translate them into concrete opportunities. Depending on the result of each test, the user is recommended different available jobs in the companies that require them.',
            'relationships.title': 'Customer Relationships',
            'relationships.students.title': 'For Youth',
            'relationships.students.list': '• Digital self-service<br>• Automated AI support<br>• Personalized recommendations',
            'relationships.businesses.title': 'For Businesses',
            'relationships.businesses.list': '• B2B platform<br>• Automated candidate matching<br>• Monthly subscription',
            'social.title': 'Social Impact',
            'social.text': 'Our project reduces unemployment and develops youth training, thus strengthening our country\'s economy. At the same time, it contributes to SDG 8: Decent work and economic growth.',
            'social.ods': 'SDG 8: Decent Work & Economic Growth',
            // Business Finder
            'businessFinder.label': 'For Businesses',
            'businessFinder.title': 'Find Your Future Talent',
            'businessFinder.subtitle': 'Tell us what you\'re looking for, and we\'ll show you the students who match your vision.',
            'businessFinder.step1.label': 'Industry',
            'businessFinder.industry.tech': 'Technology',
            'businessFinder.industry.design': 'Design & Creative',
            'businessFinder.industry.marketing': 'Marketing',
            'businessFinder.industry.other': 'Other',
            'businessFinder.step2.q': 'Which qualities matter most?',
            'businessFinder.step2.desc': 'Select the primary character traits sought in your future team.',
            'businessFinder.step2.label': 'Qualities',
            'businessFinder.qualities.creative': 'Creativity',
            'businessFinder.qualities.technical': 'Technical Logic',
            'businessFinder.qualities.collaborative': 'Collaboration',
            'businessFinder.qualities.driven': 'High Drive',
            'businessFinder.step3.q': 'Type of engagement?',
            'businessFinder.step3.desc': 'Define the nature of the opportunity you are providing.',
            'businessFinder.step3.label': 'Engagement',
            'businessFinder.step3.internship': 'Internship',
            'businessFinder.step3.apprenticeship': 'Apprenticeship',
            'businessFinder.step3.project': 'Short-term Project',
            'businessFinder.step3.parttime': 'Part-time Job',
            'businessFinder.step4.q': 'Searching for matches...',
            'businessFinder.step4.label': 'Matches',
            'businessFinder.results.title': 'Top Student Matches',
            'businessFinder.results.restart': 'Change Criteria'
        },
        es: {
            'nav.howItWorks': 'Cómo Funciona',
            'nav.whySkillup': 'Por qué SkillUp',
            'nav.impact': 'Impacto',
            'nav.cta': 'Empezar',
            'hero.tagline': 'Experimenta Sin Experiencia',
            'hero.title': 'Tu Primera Oportunidad<br>Empieza Aquí.',
            'hero.subtitle': 'Conectando a estudiantes motivados con oportunidades en el mundo real &mdash; sin experiencia previa requerida. Construye tu futuro hoy.',
            'hero.btnStudent': 'Soy Estudiante',
            'hero.btnBusiness': 'Soy Empresa',
            'howItWorks.title': 'Cómo Funciona',
            'howItWorks.step1.title': '1. Crea un Perfil',
            'howItWorks.step1.desc': 'Los estudiantes construyen un perfil destacando su motivación, habilidades e intereses en minutos.',
            'howItWorks.step2.title': '2. Publica Oportunidades',
            'howItWorks.step2.desc': 'Las empresas publican pasantías y roles de nivel de entrada diseñados para talento joven motivado.',
            'howItWorks.step3.title': '3. Match Inteligente',
            'howItWorks.step3.desc': 'Nuestro sistema inteligente conecta a los estudiantes adecuados con las empresas adecuadas automáticamente.',
            'matching.card.name': 'Alex J., 17',
            'matching.card.role': 'Aspirante a Desarrollador',
            'matching.card.tag1': 'Frontend',
            'matching.card.tag2': 'Diseño',
            'matching.hint': 'Desliza para conectar',
            'matching.success.title': '¡Es un Match!',
            'matching.success.desc': 'TechCorp quiere conocerte.',
            'matching.success.btn': 'Continuar',
            'matching.label': 'Match Inteligente',
            'matching.title': 'Conecta con un deslizamiento.',
            'matching.subtitle': 'Nuestra interfaz intuitiva hace que descubrir oportunidades y talento sea tan simple como deslizar. Interactúa con el dispositivo para ver cómo las empresas encuentran a sus candidatos ideales al instante.',
            'matching.feature1': 'Emparejamientos diarios curados por algoritmos',
            'matching.feature2': 'Cero relleno, directo al grano',
            'matching.feature3': 'Conexiones instantáneas vía chat',
            'profile.label': 'Tu Perfil',
            'profile.title': 'Tu historia, hermosamente contada.',
            'profile.subtitle': 'Nuestro asistente con IA construye tu perfil perfecto en minutos. Responde unas preguntas y observa la magia.',
            'profile.group2.title': 'Fortalezas Principales',
            'profile.group2.desc': 'Selecciona hasta 3',
            'profile.tags.strength1': 'Liderazgo',
            'profile.tags.strength2': 'Comunicación',
            'profile.tags.strength3': 'Resolución de Problemas',
            'profile.tags.strength4': 'Creatividad',
            'profile.tags.strength5': 'Adaptabilidad',
            'profile.tags.strength6': 'Ética Laboral',
            'profile.group3.title': 'Áreas de Mejora',
            'profile.tags.weakness1': 'Hablar en Público',
            'profile.tags.weakness2': 'Gestión del Tiempo',
            'profile.tags.weakness3': 'Delegación',
            'profile.tags.weakness4': 'Patience',
            'profile.group5.title': 'Rol y Disponibilidad',
            'profile.group5.role': 'ej. Desarrollador Frontend',
            'profile.group5.avail': 'ej. 15 hrs/sem, Verano',
            'profile.group4.title': 'Experiencia Relevante (Opcional)',
            'profile.group4.exp': 'Menciona cualquier club, proyecto o voluntariado...',
            'profile.visualizer.complete': 'Completado',
            'profile.visualizer.feedback.start': 'Comienza a construir tu perfil para desbloquear matches.',
            // Wizard-specific keys
            'wizard.step1': 'Bienvenida',
            'wizard.step2': 'Estudios',
            'wizard.step3': 'Personalidad',
            'wizard.step4': 'Habilidades',
            'wizard.step5': 'Perfil',
            'wizard.back': 'Atrás',
            'wizard.next': 'Siguiente →',
            'wizard.welcome.title': 'Vamos a conocerte',
            'wizard.welcome.desc': 'Construiremos tu perfil perfecto juntos, paso a paso.',
            'wizard.welcome.namePh': '¿Cómo te llamas?',
            'wizard.welcome.agePh': 'Tu rango de edad',
            'wizard.academics.title': 'Tu trayectoria académica',
            'wizard.academics.desc': 'Cuéntanos sobre tu educación para encontrar las mejores oportunidades.',
            'wizard.academics.gpaPh': 'ej. 3.8 GPA',
            'wizard.academics.levelPh': 'Nivel escolar',
            'wizard.academics.hs': 'Preparatoria',
            'wizard.academics.college': 'Universidad',
            'wizard.academics.vocational': 'Técnico / Vocacional',
            'wizard.academics.fieldPh': 'ej. Ciencias de la Computación, Diseño...',
            'wizard.quiz.title': 'Análisis de Personalidad con IA',
            'wizard.quiz.desc': 'Responde 4 escenarios rápidos. Nuestra IA mapeará tus rasgos de personalidad.',
            'wizard.quiz.resultsTitle': 'Tu Perfil de Personalidad con IA',
            'wizard.quiz.q1.label': 'Escenario 1 de 4',
            'wizard.quiz.q1.text': 'Te asignan un proyecto grupal sin líder claro. ¿Qué haces?',
            'wizard.quiz.q1.a': 'Tomar el mando y organizar al equipo',
            'wizard.quiz.q1.b': 'Proponer ideas únicas y una dirección creativa',
            'wizard.quiz.q1.c': 'Investigar a fondo y hacer un plan detallado',
            'wizard.quiz.q1.d': 'Consultar con todos y asegurar que se escuchen todas las voces',
            'wizard.quiz.q2.label': 'Escenario 2 de 4',
            'wizard.quiz.q2.text': 'Tienes un sábado libre. ¿Cómo lo pasas?',
            'wizard.quiz.q2.a': 'Trabajando en un proyecto personal o hobby',
            'wizard.quiz.q2.b': 'Pasando tiempo con amigos o conociendo gente nueva',
            'wizard.quiz.q2.c': 'Leyendo, aprendiendo algo nuevo o tomando un curso',
            'wizard.quiz.q2.d': 'Planificando tus metas y organizando tu semana',
            'wizard.quiz.q3.label': 'Escenario 3 de 4',
            'wizard.quiz.q3.text': 'Un compañero no cumple con una fecha límite. ¿Cómo reaccionas?',
            'wizard.quiz.q3.a': 'Reasignar tareas para mantener el proyecto en orden',
            'wizard.quiz.q3.b': 'Hablar con esa persona en privado y ofrecer ayuda',
            'wizard.quiz.q3.c': 'Analizar qué salió mal y crear un mejor sistema',
            'wizard.quiz.q3.d': 'Encontrar una solución creativa para recuperar tiempo',
            'wizard.quiz.q4.label': 'Escenario 4 de 4',
            'wizard.quiz.q4.text': 'Tienes la oportunidad de presentar una idea a un CEO. ¿Cuál es tu enfoque?',
            'wizard.quiz.q4.a': 'Liderar con una visión audaz y segura',
            'wizard.quiz.q4.b': 'Presentar argumentos basados en datos con métricas claras',
            'wizard.quiz.q4.c': 'Diseñar una presentación visual impactante',
            'wizard.quiz.q4.d': 'Enfocarte en cómo la idea ayudará a las personas',
            'wizard.skills.title': 'Habilidades y Experiencia',
            'wizard.complete.title': '¡Tu perfil está listo!',
            'wizard.complete.desc': 'Esto es lo que nuestra IA construyó para ti.',
            'why.student.label': 'Para Estudiantes',
            'why.student.title': 'Gana experiencia temprano.',
            'why.student.list1': 'Construye un currículum real antes de graduarte.',
            'why.student.list2': 'Descubre trayectorias que realmente amarás.',
            'why.student.list3': 'Conecta con mentores y profesionales de la industria.',
            'why.student.card.title': 'Éxito Estudiantil',
            'why.student.card.body': '\"SkillUp me ayudó a conseguir mi primera pasantía en marketing a los 16. Cambió mi trayectoria por completo.\"',
            'why.business.label': 'Para Empresas',
            'why.business.title': 'Descubre talento motivado.',
            'why.business.list1': 'Accede a un grupo nuevo de candidatos jóvenes.',
            'why.business.list2': 'Construye tu talento temprano y reduce costos futuros.',
            'why.business.list3': 'Aporta perspectivas frescas e innovadoras a tu equipo.',
            'why.business.card.title': 'Impacto Empresarial',
            'why.business.card.body': '\"Los estudiantes que encontramos a través de SkillUp han sido nuestros pasantes más dedicados.\"',
            'impact.title': 'Creando un Impacto Real',
            'impact.stat1': 'Estudiantes Conectados',
            'impact.stat2': 'Empresas Asociadas',
            'impact.stat3': 'Tasa de Éxito',
            'cta.title': 'Empieza a Construir Tu Futuro Hoy.',
            'cta.subtitle': 'Únete a la plataforma que redefine las oportunidades tempranas.',
            'cta.btn': 'Crea Tu Cuenta',
            'footer.desc': 'Empoderando a la próxima generación de talento.',
            'footer.links.platform': 'Plataforma',
            'footer.links.student': 'Para Estudiantes',
            'footer.links.business': 'Para Empresas',
            'footer.links.how': 'Cómo Funciona',
            'footer.links.company': 'Empresa',
            'footer.links.about': 'Sobre Nosotros',
            'footer.links.careers': 'Empleos',
            'footer.links.contact': 'Contacto',
            'footer.copyright': '&copy; 2026 SkillUp. Todos los derechos reservados.',
            // New sections from presentation (ES)
            'about.title': 'Sobre Nosotros',
            'about.desc': 'SkillUp es una plataforma digital que impulsa el talento inexplorado. Conectando a adolescentes y jóvenes sin experiencia laboral con empresas, facilita el acceso a oportunidades de empleo mediante los resultados una prueba vocacional, que identifica habilidades, intereses y talentos para crear cada perfil.',
            'mission.title': 'Nuestra Misión',
            'mission.text': 'Reducir el desempleo juvenil facilitando el acceso a oportunidades laborales mediante el uso de la tecnología.',
            'vision.title': 'Nuestra Visión',
            'vision.text': 'Contribuir a la formación de una generación preparada que fortalezca la economía del país.',
            'value.title': 'Propuesta de Valor',
            'value.text': 'Para combatir el desempleo juvenil, nuestra plataforma conecta a jóvenes con poca o ninguna experiencia laboral con empresas que buscan talento emergente. A diferencia de las plataformas tradicionales que priorizan la experiencia previa, nos enfocamos en evaluar habilidades, cualidades y potencial, y lo traducimos en oportunidades concretas. Según el resultado de cada prueba, al usuario se le recomiendan diferentes empleos disponible en aquellas empresas que lo requieran.',
            'relationships.title': 'Relación con Clientes',
            'relationships.students.title': 'Jóvenes',
            'relationships.students.list': '• Autoservicio digital<br>• Acompañamiento automatizado (IA)<br>• Recomendaciones personalizadas',
            'relationships.businesses.title': 'Empresas',
            'relationships.businesses.list': '• Plataforma B2B<br>• Matching automatizado de candidatos<br>• Suscripción mensual',
            'social.title': 'Impacto Social',
            'social.text': 'Nuestro proyecto reduce el desempleo y desarrolla la formación de la juventud, así fortaleciendo la economía de nuestro país. Al mismo tiempo, contribuye al ODS 8: Trabajo decente y crecimiento económico.',
            'social.ods': 'ODS 8: Trabajo decente y crecimiento económico',
            // Business Finder
            'businessFinder.label': 'Para Empresas',
            'businessFinder.title': 'Encuentra tu Futuro Talento',
            'businessFinder.subtitle': 'Cuéntanos qué buscas y te mostraremos a los estudiantes que coinciden con tu visión.',
            'businessFinder.step1.q': '¿En qué industria te encuentras?',
            'businessFinder.step1.desc': 'Esto nos ayuda a filtrar candidatos con el perfil adecuado.',
            'businessFinder.step1.label': 'Industria',
            'businessFinder.industry.tech': 'Tecnología',
            'businessFinder.industry.design': 'Diseño y Creatividad',
            'businessFinder.industry.marketing': 'Marketing',
            'businessFinder.industry.other': 'Otro',
            'businessFinder.step2.q': '¿Qué cualidades importan más?',
            'businessFinder.step2.desc': 'Selecciona los rasgos de carácter principales que buscas.',
            'businessFinder.step2.label': 'Cualidades',
            'businessFinder.qualities.creative': 'Creatividad',
            'businessFinder.qualities.technical': 'Lógica Técnica',
            'businessFinder.qualities.collaborative': 'Colaboración',
            'businessFinder.qualities.driven': 'Gran Empuje',
            'businessFinder.step3.q': '¿Tipo de compromiso?',
            'businessFinder.step3.desc': 'Define el tipo de oportunidad que ofreces.',
            'businessFinder.step3.label': 'Compromiso',
            'businessFinder.step3.internship': 'Pasantía',
            'businessFinder.step3.apprenticeship': 'Aprendizaje',
            'businessFinder.step3.project': 'Proyecto Corto',
            'businessFinder.step3.parttime': 'Trabajo Part-time',
            'businessFinder.step4.q': 'Buscando coincidencias...',
            'businessFinder.step4.label': 'Matches',
            'businessFinder.results.title': 'Mejores Coincidencias',
            'businessFinder.results.restart': 'Cambiar Criterios'
        }

    };

    langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const lang = btn.getAttribute('data-lang');
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (translations[lang] && translations[lang][key]) {
                    el.innerHTML = translations[lang][key];
                }
            });

            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (translations[lang] && translations[lang][key]) {
                    el.setAttribute('placeholder', translations[lang][key]);
                }
            });
        });
    });
});
