// Enhanced Autofill Engine V2 - Two-phase smart autofill
// Phase 1: Scan all fields and classify
// Phase 2: Fill all fields rapidly with progress feedback

class AutofillEngineV2 {
    constructor() {
        this.fields = [];
        this.classified = [];
        this.userData = null;
        this.totalFields = 0;
        this.filledCount = 0;
    }

    // Main entry point for autofill
    async performAutofill(userData) {
        this.userData = userData;
        this.fields = [];
        this.classified = [];
        this.filledCount = 0;

        console.log('[jobNinjas AutofillV2] Starting two-phase autofill...');

        // PHASE 1: Scan all fields
        await this.scanPhase();

        // Send scan results to extension panel
        chrome.runtime.sendMessage({
            type: 'AUTOFILL_SCAN_COMPLETE',
            total: this.classified.length,
            fields: this.classified.map(f => ({ label: f.label, type: f.type }))
        });

        // Small delay for better UX (shows scan results)
        await this.sleep(500);

        // PHASE 2: Fill all fields
        await this.fillPhase();

        console.log(`[jobNinjas AutofillV2] Completed! Filled ${this.filledCount}/${this.classified.length} fields`);

        return {
            total: this.classified.length,
            filled: this.filledCount,
            labels: this.classified.filter(f => f.filled).map(f => f.label)
        };
    }

    // PHASE 1: Scan and classify all form fields
    async scanPhase() {
        console.log('[jobNinjas AutofillV2] Phase 1: Scanning fields...');

        // Get all potential form fields
        const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea, [role="combobox"], [role="textbox"]');

        for (const input of inputs) {
            if (this.isVisible(input) && !input.disabled && !input.readOnly) {
                const context = this.getFieldContext(input);
                const type = this.classifyField(context, input);
                const label = this.extractLabel(input);

                this.classified.push({
                    element: input,
                    context,
                    type,
                    label: label || type || 'Unknown Field',
                    filled: false
                });
            }
        }

        console.log(`[jobNinjas AutofillV2] Scan complete: Found ${this.classified.length} fields`);
        this.totalFields = this.classified.length;
    }

    // PHASE 2: Fill all classified fields
    async fillPhase() {
        console.log('[jobNinjas AutofillV2] Phase 2: Filling fields...');

        for (const field of this.classified) {
            const value = this.getValueForField(field.type);

            if (value) {
                const success = await this.fillField(field.element, value, field.type);
                if (success) {
                    field.filled = true;
                    this.filledCount++;

                    // Send progress update
                    chrome.runtime.sendMessage({
                        type: 'FIELD_FILLED',
                        label: field.label,
                        progress: Math.round((this.filledCount / this.totalFields) * 100)
                    });

                    // Small delay between fields for smooth visual feedback
                    await this.sleep(80);
                }
            }
        }
    }

    // Classify field based on context and attributes
    classifyField(context, element) {
        const ctx = context.toLowerCase();
        const tagName = element.tagName.toLowerCase();
        const type = element.type?.toLowerCase();

        // Personal Information
        if (this.matchesKeywords(ctx, ['first name', 'given name', 'firstname', 'fname', 'legalnamefirstname'])) return 'firstName';
        if (this.matchesKeywords(ctx, ['middle name', 'middlename', 'mname'])) return 'middleName';
        if (this.matchesKeywords(ctx, ['last name', 'surname', 'lastname', 'lname', 'family name', 'legalnamelastname'])) return 'lastName';
        if (this.matchesKeywords(ctx, ['full name', 'your name', 'applicant name']) && !ctx.includes('first') && !ctx.includes('last')) return 'fullName';

        // Contact
        if (this.matchesKeywords(ctx, ['email', 'e-mail', 'emailaddress', 'email address'])) return 'email';
        if (this.matchesKeywords(ctx, ['phone', 'mobile', 'telephone', 'cell', 'contact number', 'phonenumber'])) return 'phone';

        // Address
        if (this.matchesKeywords(ctx, ['address line 1', 'street address', 'address1', 'addressline1', 'mailing address'])) return 'addressLine1';
        if (this.matchesKeywords(ctx, ['address line 2', 'address2', 'addressline2', 'apt', 'suite', 'unit'])) return 'addressLine2';
        if (this.matchesKeywords(ctx, ['city', 'town', 'municipality'])) return 'city';
        if (this.matchesKeywords(ctx, ['state', 'province', 'region'])) return 'state';
        if (this.matchesKeywords(ctx, ['zip', 'postal', 'zipcode', 'postcode', 'postal code'])) return 'zip';
        if (this.matchesKeywords(ctx, ['country'])) return 'country';

        // Professional URLs
        if (this.matchesKeywords(ctx, ['linkedin', 'linked-in', 'linkedin url', 'linkedin profile'])) return 'linkedin';
        if (this.matchesKeywords(ctx, ['github', 'git hub', 'github url', 'github profile'])) return 'github';
        if (this.matchesKeywords(ctx, ['portfolio', 'website', 'personal website', 'portfolio url'])) return 'portfolio';

        // Work Authorization
        if (this.matchesKeywords(ctx, ['authorized', 'authorization', 'legally authorized', 'work authorization'])) return 'workAuthorization';
        if (this.matchesKeywords(ctx, ['sponsorship', 'visa sponsorship', 'require sponsorship'])) return 'sponsorship';
        if (this.matchesKeywords(ctx, ['sponsorship future', 'future sponsorship'])) return 'sponsorshipFuture';

        // Education
        if (this.matchesKeywords(ctx, ['university', 'college', 'school name', 'institution'])) return 'school';
        if (this.matchesKeywords(ctx, ['degree', 'education level'])) return 'degree';
        if (this.matchesKeywords(ctx, ['major', 'field of study', 'area of study'])) return 'major';
        if (this.matchesKeywords(ctx, ['gpa', 'grade point'])) return 'gpa';
        if (this.matchesKeywords(ctx, ['graduation', 'graduation date', 'completion date'])) return 'graduationDate';

        // Employment
        if (this.matchesKeywords(ctx, ['current company', 'employer', 'current employer'])) return 'currentCompany';
        if (this.matchesKeywords(ctx, ['job title', 'current title', 'position'])) return 'currentTitle';
        if (this.matchesKeywords(ctx, ['years of experience', 'experience years', 'total experience'])) return 'yearsExperience';

        // Resume/Cover Letter
        if (type === 'file' && this.matchesKeywords(ctx, ['resume', 'cv', 'curriculum vitae'])) return 'resumeUpload';
        if (type === 'file' && this.matchesKeywords(ctx, ['cover letter'])) return 'coverLetterUpload';

        // Long text fields
        if (tagName === 'textarea') {
            if (this.matchesKeywords(ctx, ['summary', 'about', 'bio', 'professional summary'])) return 'summary';
            if (this.matchesKeywords(ctx, ['cover letter', 'additional information'])) return 'coverLetter';
        }

        // EEO fields
        if (this.matchesKeywords(ctx, ['gender', 'sex'])) return 'gender';
        if (this.matchesKeywords(ctx, ['race', 'ethnicity'])) return 'race';
        if (this.matchesKeywords(ctx, ['veteran', 'military'])) return 'veteran';
        if (this.matchesKeywords(ctx, ['disability', 'disabled'])) return 'disability';

        return 'unknown';
    }

    // Get value from userData for a specific field type
    getValueForField(type) {
        const u = this.userData;
        if (!u) return null;

        const mapping = {
            firstName: u.person?.firstName || u.firstName || this.splitName(u).first,
            middleName: u.person?.middleName || u.middleName,
            lastName: u.person?.lastName || u.lastName || this.splitName(u).last,
            fullName: u.person?.fullName || u.fullName || u.name,
            email: u.person?.email || u.email,
            phone: u.person?.phone || u.phone,
            addressLine1: u.address?.line1 || u.line1 || u.address,
            addressLine2: u.address?.line2 || u.line2,
            city: u.address?.city || u.city,
            state: u.address?.state || u.state,
            zip: u.address?.zip || u.zip || u.postalCode,
            country: u.address?.country || u.country || 'United States',
            linkedin: u.person?.linkedinUrl || u.linkedinUrl || u.linkedin,
            github: u.person?.githubUrl || u.githubUrl || u.github,
            portfolio: u.person?.portfolioUrl || u.portfolioUrl || u.portfolio,
            workAuthorization: u.work_authorization?.authorized_to_work || 'Yes',
            sponsorship: u.work_authorization?.requires_sponsorship_now || 'No',
            sponsorshipFuture: u.work_authorization?.requires_sponsorship_future || 'No',
            school: u.education?.[0]?.school || u.school,
            degree: u.education?.[0]?.degree || u.degree,
            major: u.education?.[0]?.major || u.major,
            gpa: u.education?.[0]?.gpa || u.gpa,
            graduationDate: u.education?.[0]?.graduation_date || u.graduationDate,
            currentCompany: u.employment_history?.[0]?.company || u.currentCompany,
            currentTitle: u.employment_history?.[0]?.title || u.currentTitle,
            yearsExperience: u.years_experience || u.yearsExperience,
            summary: u.summary || u.professional_summary,
            gender: u.sensitive?.gender || 'Prefer not to say',
            race: u.sensitive?.race || 'Prefer not to say',
            veteran: u.sensitive?.veteran || 'No',
            disability: u.sensitive?.disability || 'No'
        };

        return mapping[type] || null;
    }

    // Fill a single field with value
    async fillField(element, value, type) {
        if (!value || !element) return false;

        const tagName = element.tagName.toLowerCase();
        const inputType = element.type?.toLowerCase();

        try {
            // Handle select dropdowns
            if (tagName === 'select') {
                return this.fillSelect(element, value);
            }

            // Handle checkboxes and radios
            if (inputType === 'checkbox' || inputType === 'radio') {
                return this.fillCheckboxRadio(element, value);
            }

            // Handle file inputs (special case)
            if (inputType === 'file') {
                // Cannot autofill file inputs for security reasons
                console.log('[jobNinjas] Skipping file input:', type);
                return false;
            }

            // Handle text inputs and textareas
            element.value = String(value);
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('blur', { bubbles: true }));

            return true;
        } catch (error) {
            console.error('[jobNinjas] Error filling field:', error);
            return false;
        }
    }

    // Fill select dropdown
    fillSelect(select, value) {
        const valueStr = String(value).toLowerCase();

        // Try exact match first
        for (let i = 0; i < select.options.length; i++) {
            const option = select.options[i];
            const optionText = option.text.toLowerCase();
            const optionValue = option.value.toLowerCase();

            if (optionText === valueStr || optionValue === valueStr) {
                select.selectedIndex = i;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
            }
        }

        // Try partial match
        for (let i = 0; i < select.options.length; i++) {
            const option = select.options[i];
            const optionText = option.text.toLowerCase();
            const optionValue = option.value.toLowerCase();

            if (optionText.includes(valueStr) || valueStr.includes(optionText) ||
                optionValue.includes(valueStr) || valueStr.includes(optionValue)) {
                select.selectedIndex = i;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
            }
        }

        return false;
    }

    // Fill checkbox or radio
    fillCheckboxRadio(element, value) {
        const valueStr = String(value).toLowerCase();
        const context = this.getFieldContext(element).toLowerCase();

        // For "Yes/No" questions
        if (valueStr === 'yes' || valueStr === 'true') {
            if (context.includes('yes') || element.value.toLowerCase() === 'yes') {
                element.checked = true;
                element.click();
                return true;
            }
        } else if (valueStr === 'no' || valueStr === 'false') {
            if (context.includes('no') || element.value.toLowerCase() === 'no') {
                element.checked = true;
                element.click();
                return true;
            }
        }

        // For other values, match by context
        if (context.includes(valueStr) || valueStr.includes(context)) {
            element.checked = true;
            element.click();
            return true;
        }

        return false;
    }

    // Helper: Get field context (all text associated with field)
    getFieldContext(element) {
        const parts = [];

        // Label
        const label = this.extractLabel(element);
        if (label) parts.push(label);

        // Attributes
        parts.push(element.name || '');
        parts.push(element.id || '');
        parts.push(element.placeholder || '');
        parts.push(element.getAttribute('aria-label') || '');
        parts.push(element.getAttribute('data-automation-id') || '');
        parts.push(element.title || '');

        return parts.join(' ').trim();
    }

    // Helper: Extract label text for field
    extractLabel(element) {
        // Try explicit label
        if (element.id) {
            const label = document.querySelector(`label[for="${element.id}"]`);
            if (label) return label.textContent.trim();
        }

        // Try wrapped label
        const parentLabel = element.closest('label');
        if (parentLabel) return parentLabel.textContent.trim();

        // Try aria-labelledby
        const labelledBy = element.getAttribute('aria-labelledby');
        if (labelledBy) {
            const labelEl = document.getElementById(labelledBy);
            if (labelEl) return labelEl.textContent.trim();
        }

        // Try sibling label
        const container = element.parentElement;
        if (container) {
            const prevSibling = container.previousElementSibling;
            if (prevSibling && (prevSibling.tagName === 'LABEL' || prevSibling.textContent.length < 100)) {
                return prevSibling.textContent.trim();
            }
        }

        return '';
    }

    // Helper: Check if element is visible
    isVisible(element) {
        return element.offsetParent !== null &&
            window.getComputedStyle(element).visibility !== 'hidden' &&
            window.getComputedStyle(element).display !== 'none';
    }

    // Helper: Match keywords
    matchesKeywords(text, keywords) {
        return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    }

    // Helper: Split full name into first/last
    splitName(userData) {
        const fullName = userData.person?.fullName || userData.fullName || userData.name || '';
        const parts = fullName.trim().split(/\s+/);
        return {
            first: parts[0] || '',
            last: parts.slice(1).join(' ') || ''
        };
    }

    // Helper: Sleep utility
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in content.js
window.AutofillEngineV2 = AutofillEngineV2;
