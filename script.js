// This is the Rule Library - the brain of your simulated AI.
const ruleLibrary = [
    // Rule 1: Pharmacogenomics (CYP2D6 and Codeine)
    {
        RuleID: "PGx-001",
        Condition_Gene: "CYP2D6",
        Condition_Allele: "Poor Metabolizer",
        Condition_Drug: "Codeine",
        Alert_Level: "CRITICAL",
        score_impact: 100, // Highest risk score
        Alert_Title: "Ineffective Analgesia & Toxicity Risk",
        Alert_Message: "This genotype prevents the conversion of **Codeine** to its active form (morphine). **ACTION:** Avoid use. Alternative non-opioid or non-CYP2D6 analgesics are recommended.",
        Citation_Source: "CPIC/PharmGKB Level 1A"
    },
    // Rule 2: Lifestyle Genomics (CYP1A2 and Caffeine)
    {
        RuleID: "WL-002",
        Condition_Gene: "CYP1A2",
        Condition_Allele: "Slow Metabolizer",
        Condition_Caffeine_mg: 200, // Trigger is 200mg or more
        Alert_Level: "HIGH_PRIORITY",
        score_impact: 50,
        Alert_Title: "Caffeine Metabolism & Sleep Risk",
        Alert_Message: "Your slow caffeine clearance ($CYP1A2$) allows high levels to linger in your system. This dramatically increases the risk of insomnia and anxiety. **ACTION:** Shift all caffeine intake (especially >200mg) to **before 12 PM.**",
        Citation_Source: "Journal of the American Medical Association, 2023"
    },
    // Rule 3: Wellness/Nutrigenomics (MTHFR)
    {
        RuleID: "WL-003",
        Condition_Gene: "MTHFR",
        Condition_Allele: "Reduced Function",
        Alert_Level: "LIFESTYLE_INSIGHT",
        score_impact: 25, // Lowest optimization score
        Alert_Title: "Folate Metabolism Support Required",
        Alert_Message: "Your reduced MTHFR enzyme function may affect B-vitamin processing. **ACTION:** Focus on a diet rich in natural folate (leafy greens, lentils) and discuss a bioavailable B-vitamin supplement (methylfolate) with your physician.",
        Citation_Source: "NIH/CDC Guidance on MTHFR Polymorphisms"
    },
    // Rule 4: Alcohol Genomics (ADH1B)
    {
        RuleID: "WL-004",
        Condition_Gene: "ADH1B",
        Condition_Allele: "Fast Metabolizer",
        Alert_Level: "HIGH_PRIORITY",
        score_impact: 50,
        Alert_Title: "Alcohol Flush & Discomfort Risk",
        Alert_Message: "Your genetics cause rapid breakdown of ethanol, leading to a quick buildup of toxic acetaldehyde. **ACTION:** Limit intake to 1 drink per sitting to avoid flush, nausea, and potential increased long-term risk.",
        Citation_Source: "NIAAA Guidelines on ADH1B Variants"
    }
];

// Main function that runs the entire analysis
function runAnalysis(event) {
    event.preventDefault(); // Prevents page reload

    // 1. Get all the input values from the HTML form:
    const cyp2d6_status = document.getElementById('cyp2d6_status').value;
    const current_meds = document.getElementById('current_meds').value.trim();
    const cyp1a2_status = document.getElementById('cyp1a2_status').value;
    const caffeine_post_12pm = parseInt(document.getElementById('caffeine_post_12pm').value);
    const mthfr_status = document.getElementById('mthfr_status').value;
    const adh1b_status = document.getElementById('adh1b_status').value; 
    
    const alertsContainer = document.getElementById('alerts-container');
    alertsContainer.innerHTML = ''; // Clear any old results
    document.getElementById('results-panel').style.display = 'block'; // Show the results box

    let alertsFound = false;
    let totalRiskScore = 0; 

    // 2. Loop through every rule and check the conditions:
    ruleLibrary.forEach(rule => {
        let conditionMet = false;

        // --- PGx-001 Check (Rule 1) ---
        if (rule.RuleID === "PGx-001" && 
            cyp2d6_status === rule.Condition_Allele && 
            current_meds.toLowerCase().includes(rule.Condition_Drug.toLowerCase())) {
            conditionMet = true;
        }

        // --- WL-002 Check (Rule 2) ---
        if (rule.RuleID === "WL-002" && 
            cyp1a2_status === rule.Condition_Allele && 
            caffeine_post_12pm >= rule.Condition_Caffeine_mg) {
            conditionMet = true;
        }

        // --- WL-003 Check (Rule 3) ---
        if (rule.RuleID === "WL-003" && 
            mthfr_status === rule.Condition_Allele) {
            conditionMet = true;
        }

        // --- WL-004 Check (Rule 4) ---
        if (rule.RuleID === "WL-004" && 
            adh1b_status === rule.Condition_Allele) {
            conditionMet = true;
        }

        // 3. If the condition is met, show the alert AND add to the score!
        if (conditionMet) {
            displayAlert(rule);
            totalRiskScore += rule.score_impact; // Add impact score
            alertsFound = true;
        }
    });

    // Display the Summary Panel based on the total score (The Fancy Upgrade)
    displaySummaryPanel(totalRiskScore, alertsFound);
}

// NEW FUNCTION: Creates the visual summary and overall risk status
function displaySummaryPanel(score, alertsFound) {
    let riskStatus = '';
    let statusClass = '';
    let advice = '';

    // Define Risk Thresholds (Simple IF-THEN logic for the fancy result)
    if (score >= 100) {
        riskStatus = 'High Priority Action Required';
        statusClass = 'text-danger';
        advice = 'Immediate consultation with a specialist (Pharmacist/Genetic Counselor) is strongly recommended due to one or more critical interactions.';
    } else if (score >= 50) {
        riskStatus = 'Moderate Wellness Focus';
        statusClass = 'text-warning';
        advice = 'Take immediate action on the High Priority Alerts (e.g., lifestyle changes or medication review) to reduce health risks.';
    } else if (score > 0) {
        riskStatus = 'Low Risk, Optimization Recommended';
        statusClass = 'text-info';
        advice = 'Your profile is generally low-risk, but follow the specific lifestyle insights to optimize long-term wellness.';
    } else {
        riskStatus = 'Nominal Risk Profile';
        statusClass = 'text-success';
        advice = 'No major genetic risks or interactions were flagged. Maintain excellent current habits.';
    }

    // Max theoretical score is 225
    const MAX_SCORE = 225; 
    const riskPercentage = Math.min(100, Math.round((score / MAX_SCORE) * 100));
    
    // Circumference calculation for the SVG Gauge
    const CIRCUMFERENCE = 283; 
    const offset = CIRCUMFERENCE - (riskPercentage / 100) * CIRCUMFERENCE;
    
    // Set the color for the SVG gauge based on the score
    let strokeColor = '#28a745'; // Default: Success (Green)
    if (score >= 100) {
        strokeColor = '#dc3545'; // Danger (Red)
    } else if (score >= 50) {
        strokeColor = '#ffc107'; // Warning (Yellow/Orange)
    } else if (score > 0) {
        strokeColor = '#007bff'; // Info (Blue)
    }

    // --- 2. Update the Dynamic Risk Gauge (The Ultra Graphical Part) ---
    const gaugeCircle = document.getElementById('risk-gauge-circle');
    const gaugeScoreText = document.getElementById('risk-gauge-score');
    const gaugePercentageText = document.querySelector('.risk-circle-svg text:nth-child(4)');

    // Apply the animated changes
    gaugeCircle.style.strokeDashoffset = offset; // Use strokeDashoffset for correct offset
    gaugeCircle.style.strokeDasharray = `${CIRCUMFERENCE}, ${CIRCUMFERENCE}`; // Ensure the dasharray is fixed for a clean circle
    gaugeCircle.setAttribute('stroke', strokeColor);
    
    // Update text
    gaugeScoreText.textContent = score;
    gaugePercentageText.textContent = `Risk Score (${riskPercentage}%)`;


    // --- 3. Build and Insert the Text Summary Panel ---
    const summaryHtml = `
        <div class="card bg-light mb-4 border-primary">
            <div class="card-body">
                <h4 class="card-title text-center mb-3">Overall Precision Wellness Status (AI Summary)</h4>
                <div class="text-center">
                    <h1 class="${statusClass} fw-bold display-4">${riskStatus}</h1>
                    <p class="lead">${advice}</p>
                </div>
                ${alertsFound ? '' : '<hr><p class="text-muted text-center small">No specific alerts were triggered, leading to a nominal risk profile.</p>'}
            </div>
        </div>
    `;

    // Insert the Summary Panel at the very top of the alerts container
    document.getElementById('alerts-container').insertAdjacentHTML('afterbegin', summaryHtml);
}


// This helper function styles and inserts the final alert card.
function displayAlert(rule) {
    let alertClass = '';
    let icon = '';

    // Choose Bootstrap class and icon based on the alert level
    if (rule.Alert_Level === 'CRITICAL') {
        alertClass = 'alert-danger'; // Red color
        icon = '⚠️';
    } else if (rule.Alert_Level === 'HIGH_PRIORITY') {
        alertClass = 'alert-warning'; // Yellow/Orange color
        icon = '🚨';
    } else if (rule.Alert_Level === 'LIFESTYLE_INSIGHT') {
        alertClass = 'alert-info'; // Blue color
        icon = '💡';
    }

    const alertHtml = `
        <div class="alert ${alertClass} shadow-sm mb-4" role="alert">
            <h4 class="alert-heading">${icon} ${rule.Alert_Title} (${rule.RuleID})</h4>
            <p>**${rule.Alert_Message}**</p>
            <hr>
            <p class="mb-0 small text-muted">
                **Background Support:** ${rule.Citation_Source}
            </p>
        </div>
    `;
    document.getElementById('alerts-container').insertAdjacentHTML('beforeend', alertHtml);
}

// FINAL STEP: Link the function to the form submission button
document.getElementById('advisor-form').addEventListener('submit', runAnalysis);