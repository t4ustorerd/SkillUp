// ========== WIZARD ENGINE ==========
(function () {
    const TOTAL_STEPS = 8;
    let currentStep = 0;
    let quizCurrentQ = 0;
    const quizAnswers = {};
    const traitScores = {};
    let analysisComplete = false;

    // Trait definitions
    const TRAITS = {
        leader: { icon: '👑', en: 'Natural Leader', es: 'Líder Natural', enDesc: 'You take initiative and inspire others to follow.', esDesc: 'Tomas la iniciativa e inspiras a otros.' },
        creative: { icon: '🎨', en: 'Creative Thinker', es: 'Pensador Creativo', enDesc: 'You see possibilities where others see obstacles.', esDesc: 'Ves posibilidades donde otros ven obstáculos.' },
        analytical: { icon: '🔬', en: 'Analytical Mind', es: 'Mente Analítica', enDesc: 'You love data, patterns, and solving complex problems.', esDesc: 'Te encantan los datos y resolver problemas complejos.' },
        collaborator: { icon: '🤝', en: 'Team Player', es: 'Jugador de Equipo', enDesc: 'You thrive in teams and bring people together.', esDesc: 'Prosperas en equipo y unes a las personas.' },
        decisive: { icon: '⚡', en: 'Decisive', es: 'Decisivo', enDesc: 'You make tough calls quickly and confidently.', esDesc: 'Tomas decisiones difíciles con confianza.' },
        innovator: { icon: '💡', en: 'Innovator', es: 'Innovador', enDesc: 'You push boundaries and think outside the box.', esDesc: 'Empujas límites y piensas fuera de la caja.' },
        empathetic: { icon: '💚', en: 'Empathetic', es: 'Empático', enDesc: 'You understand and connect deeply with others.', esDesc: 'Comprendes y conectas profundamente con otros.' },
        detail: { icon: '🎯', en: 'Detail-Oriented', es: 'Orientado al Detalle', enDesc: 'Nothing escapes your attention — precision is your strength.', esDesc: 'Nada escapa tu atención — la precisión es tu fortaleza.' }
    };

    // DOM refs
    const els = {
        progressFill: document.getElementById('stepProgressFill'),
        dots: document.querySelectorAll('#profile .step-dot'),
        steps: document.querySelectorAll('#profile .wizard-step'),
        btnBack: document.getElementById('wizardBack'),
        btnNext: document.getElementById('wizardNext'),
        quizContainer: document.getElementById('quizContainer'),
        aiOverlay: document.getElementById('aiAnalysisOverlay'),
        aiText: document.getElementById('aiAnalysisText'),
        aiProgress: document.getElementById('aiProgressFill'),
        traitResults: document.getElementById('traitResults'),
        traitCards: document.getElementById('traitCards'),
        // Step 4 visualizer
        profileProgress: document.getElementById('profileProgress'),
        scoreValue: document.getElementById('scoreValue'),
        scoreFeedback: document.getElementById('scoreFeedback'),
        livePreviewCard: document.getElementById('livePreviewCard'),
        previewName: document.getElementById('previewName'),
        previewGpa: document.getElementById('previewGpa'),
        previewRole: document.getElementById('previewRole'),
        previewAvail: document.getElementById('previewAvail'),
        previewTraits: document.getElementById('previewTraits'),
        previewTags: document.getElementById('previewTags'),
        // Step 5 final
        finalName: document.getElementById('finalName'),
        finalBadge: document.getElementById('finalBadge'),
        finalAvatar: document.getElementById('finalAvatar'),
        finalScoreVal: document.getElementById('finalScoreVal'),
        finalProgress: document.getElementById('finalProgress'),
        finalAiSummary: document.getElementById('finalAiSummary'),
        finalTraits: document.getElementById('finalTraits'),
        finalDetails: document.getElementById('finalDetails'),
        finalTags: document.getElementById('finalTags'),
        confetti: document.getElementById('confettiCanvas')
    };

    if (!els.btnNext) return; // Guard if wizard not on page

    // Profile state
    const profile = { name: '', age: '', gpa: '', level: '', field: '', role: '', avail: '', strengths: new Set(), weaknesses: new Set(), exp: '', traits: [] };

    // ========== STEP NAVIGATION ==========
    const stepToDotMap = [0, 0, 1, 1, 1, 2, 3, 4];

    function goToStep(idx) {
        if (idx < 0 || idx >= TOTAL_STEPS) return;
        const oldStep = els.steps[currentStep];
        const newStep = els.steps[idx];

        if (oldStep) {
            oldStep.classList.remove('active');
            oldStep.style.display = 'none';
        }

        if (newStep) {
            newStep.style.display = 'block';
            // Force reflow
            void newStep.offsetWidth;
            newStep.classList.add('active');
        }

        currentStep = idx;
        updateIndicator();
        updateNav();

        // Step-specific hooks
        if (idx === 6) updateScoreCard(); // Skills step
        if (idx === 7) buildFinalProfile(); // Complete step
    }

    function updateIndicator() {
        const pct = currentStep / (TOTAL_STEPS - 1) * 100;
        if (els.progressFill) els.progressFill.style.width = pct + '%';

        const activeDotIndex = stepToDotMap[currentStep] || 0;
        els.dots.forEach((dot, i) => {
            dot.classList.remove('active', 'completed');
            if (i < activeDotIndex) dot.classList.add('completed');
            if (i === activeDotIndex) dot.classList.add('active');
        });
    }

    function updateNav() {
        if (!els.btnBack || !els.btnNext) return;
        els.btnBack.classList.toggle('hidden', currentStep === 0);
        if (currentStep === TOTAL_STEPS - 1) {
            els.btnNext.style.display = 'none';
        } else {
            els.btnNext.style.display = '';
            const lang = getCurrentLang();
            if (currentStep === 5 && !analysisComplete) {
                els.btnNext.textContent = lang === 'es' ? 'Siguiente →' : 'Next →';
            } else {
                els.btnNext.textContent = lang === 'es' ? 'Siguiente →' : 'Next →';
            }
        }
    }

    function getCurrentLang() {
        const active = document.querySelector('.lang-btn.active');
        return active ? active.getAttribute('data-lang') : 'en';
    }

    // Next button logic
    els.btnNext.addEventListener('click', () => {
        // Collect data from current step
        collectStepData();

        // Special: quiz step — if quiz not done, don't proceed
        if (currentStep === 5 && !analysisComplete) {
            return; // quiz handles its own flow
        }
        goToStep(currentStep + 1);
    });

    els.btnBack.addEventListener('click', () => {
        goToStep(currentStep - 1);
    });

    // Handle Enter key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Don't auto-advance on quiz step unless analysis is complete
            if (currentStep === 5 && !analysisComplete) return;
            if (currentStep < TOTAL_STEPS - 1) els.btnNext.click();
        }
    });

    function collectStepData() {
        profile.name = (document.getElementById('wNameInput')?.value || '').trim();
        profile.age = document.getElementById('wAgeRange')?.value || '';
        profile.gpa = (document.getElementById('wGpaInput')?.value || '').trim();
        profile.level = document.getElementById('wSchoolLevel')?.value || '';
        profile.field = (document.getElementById('wFieldInput')?.value || '').trim();
        profile.role = (document.getElementById('wRoleInput')?.value || '').trim();
        profile.avail = (document.getElementById('wAvailInput')?.value || '').trim();
        profile.exp = (document.getElementById('wExpInput')?.value || '').trim();
    }

    // ========== QUIZ ENGINE ==========
    const quizQuestions = document.querySelectorAll('.quiz-question');
    const quizOptions = document.querySelectorAll('.quiz-option');

    quizOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            // Mark selected in current question
            const parent = opt.closest('.quiz-question');
            parent.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');

            const traits = opt.getAttribute('data-traits').split(',');
            quizAnswers[quizCurrentQ] = traits;

            // Auto-advance to next question after delay
            setTimeout(() => {
                if (quizCurrentQ < 3) {
                    quizQuestions[quizCurrentQ].classList.remove('active');
                    quizCurrentQ++;
                    quizQuestions[quizCurrentQ].classList.add('active');
                } else {
                    // All answered — run AI analysis
                    runAiAnalysis();
                }
            }, 400);
        });
    });

    function runAiAnalysis() {
        // Calculate trait scores
        Object.keys(TRAITS).forEach(t => traitScores[t] = 0);
        Object.values(quizAnswers).forEach(traits => {
            traits.forEach(t => { if (traitScores[t] !== undefined) traitScores[t]++; });
        });

        // Get top 3 traits
        const sorted = Object.entries(traitScores).sort((a, b) => b[1] - a[1]);
        profile.traits = sorted.slice(0, 3).filter(([, v]) => v > 0).map(([k]) => k);

        // Show AI overlay
        els.quizContainer.style.display = 'none';
        els.aiOverlay.classList.remove('hidden');

        const lang = getCurrentLang();
        const phases = lang === 'es'
            ? ['Analizando tus respuestas...', 'Mapeando rasgos de personalidad...', 'Construyendo tu perfil de ADN...', '¡Análisis completo!']
            : ['Analyzing your responses...', 'Mapping personality traits...', 'Building your profile DNA...', 'Analysis complete!'];

        let phase = 0;
        const interval = setInterval(() => {
            phase++;
            if (phase < phases.length) {
                els.aiText.textContent = phases[phase];
                els.aiProgress.style.width = (phase / (phases.length - 1) * 100) + '%';
            }
            if (phase >= phases.length) {
                clearInterval(interval);
                setTimeout(() => {
                    els.aiOverlay.classList.add('hidden');
                    showTraitResults();
                }, 600);
            }
        }, 1200);
    }

    function showTraitResults() {
        analysisComplete = true;
        const lang = getCurrentLang();
        els.traitResults.classList.remove('hidden');
        els.traitCards.innerHTML = '';

        profile.traits.forEach(key => {
            const t = TRAITS[key];
            const card = document.createElement('div');
            card.className = 'trait-card';
            card.innerHTML = `
                <div class="trait-card-icon">${t.icon}</div>
                <div class="trait-card-name">${lang === 'es' ? t.es : t.en}</div>
                <div class="trait-card-desc">${lang === 'es' ? t.esDesc : t.enDesc}</div>
            `;
            els.traitCards.appendChild(card);
        });

        updateNav();
    }

    // ========== STEP 4: SCORE & PREVIEW ==========
    const CIRC = 283;
    const interactiveTags = document.querySelectorAll('.interactive-tag');

    interactiveTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const isStrength = tag.classList.contains('strength-tag');
            const setRef = isStrength ? profile.strengths : profile.weaknesses;
            const limit = isStrength ? 3 : 2;
            const text = tag.textContent;

            if (tag.classList.contains('selected')) {
                tag.classList.remove('selected');
                setRef.delete(text);
            } else if (setRef.size < limit) {
                tag.classList.add('selected');
                setRef.add(text);
            } else {
                tag.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }], { duration: 300 });
                return;
            }
            updateScoreCard();
        });
    });

    // Input listeners for step 4
    ['wRoleInput', 'wAvailInput', 'wExpInput'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateScoreCard);
    });

    function updateScoreCard() {
        collectStepData();
        let score = 0;
        if (profile.name) score += 10;
        if (profile.gpa) score += 10;
        if (profile.role) score += 15;
        if (profile.avail) score += 10;
        if (profile.traits.length > 0) score += 10;
        score += Math.min(profile.strengths.size, 3) * 8;
        score += Math.min(profile.weaknesses.size, 1) * 7;
        if (profile.exp.length > 5) score += 14;

        score = Math.min(score, 100);
        if (els.scoreValue) els.scoreValue.textContent = score;
        if (els.profileProgress) {
            const offset = CIRC - (score / 100) * CIRC;
            els.profileProgress.style.strokeDashoffset = offset;
            els.profileProgress.classList.toggle('high-score', score >= 80);
        }

        const lang = getCurrentLang();
        if (els.scoreFeedback) {
            if (score === 0) els.scoreFeedback.textContent = lang === 'es' ? 'Comienza a construir tu perfil.' : 'Start building your profile.';
            else if (score < 40) els.scoreFeedback.textContent = lang === 'es' ? 'Buen comienzo. Agrega más detalles.' : 'Good start. Add more details.';
            else if (score < 80) els.scoreFeedback.textContent = lang === 'es' ? '¡Se ve genial! Casi completo.' : 'Looking great! Almost complete.';
            else els.scoreFeedback.textContent = lang === 'es' ? '¡Excelente! Listo para matches.' : 'Outstanding! Ready to be matched.';
        }

        renderLivePreview(score);
    }

    function renderLivePreview(score) {
        if (!els.previewName) return;
        if (score > 0 && els.livePreviewCard) els.livePreviewCard.classList.add('active');

        if (profile.name) {
            els.previewName.textContent = profile.name;
            els.previewName.classList.remove('skeleton-line', 'short');
            els.previewName.style.cssText = 'font-weight:600;font-size:1rem;color:#fff';
        } else {
            els.previewName.textContent = '';
            els.previewName.classList.add('skeleton-line', 'short');
            els.previewName.style.cssText = '';
        }

        if (profile.gpa) { els.previewGpa.textContent = profile.gpa; els.previewGpa.classList.remove('hidden'); }
        else els.previewGpa.classList.add('hidden');

        if (profile.role) { els.previewRole.textContent = profile.role; els.previewRole.classList.remove('skeleton-line'); els.previewRole.classList.add('preview-role-text'); }
        else { els.previewRole.textContent = ''; els.previewRole.classList.add('skeleton-line'); els.previewRole.classList.remove('preview-role-text'); }

        if (profile.avail) { els.previewAvail.textContent = profile.avail; els.previewAvail.classList.remove('skeleton-line', 'short'); els.previewAvail.classList.add('preview-avail-text'); }
        else { els.previewAvail.textContent = ''; els.previewAvail.classList.add('skeleton-line', 'short'); els.previewAvail.classList.remove('preview-avail-text'); }

        // Traits in preview
        if (els.previewTraits) {
            els.previewTraits.innerHTML = '';
            const lang = getCurrentLang();
            profile.traits.forEach(k => {
                const s = document.createElement('span');
                s.className = 'preview-trait-mini';
                s.textContent = TRAITS[k] ? (lang === 'es' ? TRAITS[k].es : TRAITS[k].en) : k;
                els.previewTraits.appendChild(s);
            });
        }

        // Tags
        if (els.previewTags) {
            els.previewTags.innerHTML = '';
            [...profile.strengths, ...profile.weaknesses].slice(0, 4).forEach(t => {
                const s = document.createElement('span');
                s.className = 'preview-tag-mini';
                s.textContent = t;
                els.previewTags.appendChild(s);
            });
        }
    }

    // ========== STEP 5: FINAL PROFILE ==========
    function buildFinalProfile() {
        collectStepData();
        const lang = getCurrentLang();
        const initial = profile.name ? profile.name.charAt(0).toUpperCase() : '?';

        if (els.finalAvatar) els.finalAvatar.textContent = initial;
        if (els.finalName) els.finalName.textContent = profile.name || '—';
        if (els.finalBadge) els.finalBadge.textContent = profile.role || (profile.field ? profile.field : '');

        // Score
        let score = 0;
        if (profile.name) score += 10;
        if (profile.gpa) score += 10;
        if (profile.role) score += 15;
        if (profile.avail) score += 10;
        if (profile.traits.length > 0) score += 10;
        score += Math.min(profile.strengths.size, 3) * 8;
        score += Math.min(profile.weaknesses.size, 1) * 7;
        if (profile.exp.length > 5) score += 14;
        score = Math.min(score, 100);

        if (els.finalScoreVal) els.finalScoreVal.textContent = score + '%';
        if (els.finalProgress) {
            const circ = 163.36;
            setTimeout(() => { els.finalProgress.style.strokeDashoffset = circ - (score / 100) * circ; }, 300);
        }

        // AI Summary
        if (els.finalAiSummary) {
            const traitNames = profile.traits.map(k => TRAITS[k] ? (lang === 'es' ? TRAITS[k].es : TRAITS[k].en) : k);
            const summary = lang === 'es'
                ? `${profile.name || 'Este estudiante'} es un perfil con rasgos de ${traitNames.join(', ')}${profile.field ? ', con interés en ' + profile.field : ''}${profile.role ? ', buscando un rol como ' + profile.role : ''}. Un candidato prometedor listo para oportunidades reales.`
                : `${profile.name || 'This student'} demonstrates traits of a ${traitNames.join(', ')}${profile.field ? ', with interest in ' + profile.field : ''}${profile.role ? ', seeking a role as ' + profile.role : ''}. A promising candidate ready for real-world opportunities.`;
            els.finalAiSummary.textContent = '✨ ' + summary;
        }

        // Traits
        if (els.finalTraits) {
            els.finalTraits.innerHTML = '';
            profile.traits.forEach(k => {
                const b = document.createElement('span');
                b.className = 'final-trait-badge';
                b.textContent = (TRAITS[k]?.icon || '') + ' ' + (lang === 'es' ? TRAITS[k]?.es : TRAITS[k]?.en);
                els.finalTraits.appendChild(b);
            });
        }

        // Details
        if (els.finalDetails) {
            els.finalDetails.innerHTML = '';
            const items = [];
            if (profile.field) items.push({ l: lang === 'es' ? 'Campo' : 'Field', v: profile.field });
            if (profile.level) items.push({ l: lang === 'es' ? 'Nivel' : 'Level', v: profile.level });
            if (profile.avail) items.push({ l: lang === 'es' ? 'Disponibilidad' : 'Availability', v: profile.avail });
            if (profile.age) items.push({ l: lang === 'es' ? 'Edad' : 'Age', v: profile.age });
            items.forEach(({ l, v }) => {
                const d = document.createElement('span');
                d.className = 'final-detail-item';
                d.innerHTML = `<strong>${l}:</strong> ${v}`;
                els.finalDetails.appendChild(d);
            });
        }

        // Tags
        if (els.finalTags) {
            els.finalTags.innerHTML = '';
            profile.strengths.forEach(t => {
                const s = document.createElement('span');
                s.className = 'final-tag strength';
                s.textContent = t;
                els.finalTags.appendChild(s);
            });
            profile.weaknesses.forEach(t => {
                const s = document.createElement('span');
                s.className = 'final-tag weakness';
                s.textContent = t;
                els.finalTags.appendChild(s);
            });
        }

        // Confetti!
        launchConfetti();
    }

    // ========== CONFETTI ==========
    function launchConfetti() {
        const canvas = els.confetti;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;

        const colors = ['#14b8a6', '#2563eb', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'];
        const particles = [];
        for (let i = 0; i < 80; i++) {
            particles.push({
                x: canvas.width / 2, y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 12 - 4,
                w: Math.random() * 8 + 4, h: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 10,
                life: 1
            });
        }

        let frame = 0;
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;
            particles.forEach(p => {
                if (p.life <= 0) return;
                alive = true;
                p.x += p.vx; p.y += p.vy; p.vy += 0.15;
                p.rot += p.rotV; p.life -= 0.008;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot * Math.PI / 180);
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });
            frame++;
            if (alive && frame < 200) requestAnimationFrame(animate);
            else ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        animate();
    }

    // Init
    updateIndicator();
    updateNav();
})();
