console.log("JS loaded");
function showMission() {
    let container = document.getElementById("mission-content");
    if (container) {
        container.innerHTML = "<p>To provide unforgettable travel experiences across Egypt while supporting local communities and preserving ancient heritage.</p>";
    }
}

function showStory() {
    let container = document.getElementById("story-content");
    if (container) {
        container.innerHTML = "<p>Founded in 2020, Egypt Tourism Hub started with a simple idea: make Egypt's wonders accessible to everyone. What began as a small team of local guides has grown into a full-service tourism platform serving thousands of happy travelers each year.</p>";
    }
}

function showValues() {
    let container = document.getElementById("values-list");
    if (container) {
        container.innerHTML = "<ul><li>Authenticity - Real Egyptian experiences</li><li>Quality - Premium service standards</li><li>Safety - Your wellbeing comes first</li><li>Sustainability - Protecting our heritage</li><li>Community - Supporting local economies</li></ul>";
    }
}

function showTeam() {
    let container = document.getElementById("team-list");
    if (container) {
        container.innerHTML = `
            <div class="team-card"><strong>Sarah Ahmed</strong><br>Founder & CEO<br>15 years experience</div>
            <div class="team-card"><strong>Mohamed Ali</strong><br>Head of Operations<br>10 years experience</div>
            <div class="team-card"><strong>Layla Hassan</strong><br>Customer Experience<br>8 years experience</div>
            <div class="team-card"><strong>Omar Farouk</strong><br>Tour Director<br>12 years experience</div>
        `;
    }
}

function showStats() {
    let container = document.getElementById("stats-container");
    if (container) {
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item"><h3>5000+</h3><p>Happy Travelers</p></div>
                <div class="stat-item"><h3>50+</h3><p>Expert Guides</p></div>
                <div class="stat-item"><h3>100+</h3><p>Destinations</p></div>
                <div class="stat-item"><h3>4.9</h3><p>Customer Rating</p></div>
            </div>
        `;
    }
}

showMission();
showStory();
showValues();
showTeam();
showStats();