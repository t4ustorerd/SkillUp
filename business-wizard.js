
document.addEventListener('DOMContentLoaded', () => {
    const bizWizard = document.getElementById('businessWizardContainer');
    if (!bizWizard) return;

    const bizSteps = bizWizard.querySelectorAll('.wizard-step');
    const bizDots = document.querySelectorAll('#bizStepIndicator .step-dot');
    const bizProgressBar = document.getElementById('bizProgressFill');
    const resultsView = document.getElementById('studentResultsView');
    const studentGrid = document.getElementById('studentMatchGrid');
    const restartBtn = document.getElementById('restartBizWizard');

    let currentStep = 0;
    let selectedIndustry = '';

    // Mock Student Data
    const mockStudents = [
        { name: "Sofia M.", age: 17, role: "UI/UX Designer", match: 98, bio: "Passionate about clean interfaces and user behavior.", industry: "design" },
        { name: "Lucas T.", age: 19, role: "Fullstack Developer", match: 95, bio: "Built 3 production apps using React and Node.", industry: "tech" },
        { name: "Emma G.", age: 18, role: "Content Specialist", match: 92, bio: "Storyteller with 50k followers on TikTok.", industry: "marketing" },
        { name: "David K.", age: 20, role: "Data Enthusiast", match: 89, bio: "Python expert with a focus on predictive modeling.", industry: "tech" }
    ];

    function showStep(stepIndex) {
        // Handle Step transition animations
        const oldStep = bizSteps[currentStep];
        const newStep = bizSteps[stepIndex];

        if (oldStep && oldStep !== newStep) {
            oldStep.classList.remove('active');
            // Give time for exit animation if any
            setTimeout(() => {
                oldStep.style.display = 'none';
                newStep.style.display = 'block';
                void newStep.offsetWidth; // Force reflow
                newStep.classList.add('active');
            }, 50);
        } else {
            bizSteps.forEach((s, i) => {
                s.style.display = i === stepIndex ? 'block' : 'none';
                s.classList.toggle('active', i === stepIndex);
            });
        }

        // Update Dots & Progress
        const totalSteps = bizSteps.length;
        const progress = (stepIndex / (totalSteps - 1)) * 100;
        if (bizProgressBar) bizProgressBar.style.width = `${progress}%`;

        bizDots.forEach((dot, idx) => {
            dot.classList.remove('active', 'completed');
            if (idx < stepIndex) dot.classList.add('completed');
            if (idx === stepIndex) dot.classList.add('active');
        });

        currentStep = stepIndex;

        if (stepIndex === 3) {
            // Loading step: Start automatic transition to results
            setTimeout(() => {
                showResults();
            }, 3000);
        }
    }

    function showResults() {
        bizWizard.closest('.builder-showcase').classList.add('hidden');
        resultsView.classList.remove('hidden');
        renderStudents();
        // Scroll to results
        resultsView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderStudents() {
        studentGrid.innerHTML = '';
        const filtered = mockStudents; // Could be filtered by selectedIndustry

        filtered.forEach((student, index) => {
            const card = document.createElement('div');
            card.className = 'student-result-card glass-card reveal-item';
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <div class="match-badge">${student.match}% Match</div>
                <div class="student-avatar-placeholder"></div>
                <div class="student-info">
                    <h4>${student.name}, ${student.age}</h4>
                    <p class="student-role">${student.role}</p>
                    <p class="student-bio">${student.bio}</p>
                    <button class="btn btn-primary btn-sm request-btn w-100 mt-3">Send Request</button>
                </div>
            `;

            const btn = card.querySelector('.request-btn');
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                btn.textContent = 'Request Sent!';
                btn.classList.add('glow-pulse');
                btn.style.background = 'rgba(255,255,255,0.1)';
                btn.style.border = '1px solid var(--accent-teal)';
                btn.disabled = true;
            });

            studentGrid.appendChild(card);
            setTimeout(() => card.classList.add('is-visible'), 100 + (index * 100));
        });
    }

    // Event Listeners for Options
    bizWizard.querySelectorAll('.option-card').forEach(option => {
        option.addEventListener('click', () => {
            // Add click visual feedback
            option.style.transform = 'scale(0.95)';
            setTimeout(() => option.style.transform = '', 100);

            if (currentStep === 0) selectedIndustry = option.dataset.val;

            if (currentStep < bizSteps.length - 1) {
                showStep(currentStep + 1);
            }
        });
    });

    restartBtn.addEventListener('click', () => {
        currentStep = 0;
        resultsView.classList.add('hidden');
        bizWizard.closest('.builder-showcase').classList.remove('hidden');
        showStep(0);
    });

    // Initialize
    showStep(0);
});
