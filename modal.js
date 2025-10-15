const modalContent = {
    speed: {
        title: "Lightning Fast Performance",
        content: `
            <div class="modal-section">
                <h4>Response Latency</h4>
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="stat-value">< 200ms</div>
                        <div class="stat-label">Average Response Time</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">99.9%</div>
                        <div class="stat-label">Uptime Guarantee</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">50K+</div>
                        <div class="stat-label">Requests/Second</div>
                    </div>
                </div>
            </div>
            <div class="modal-section">
                <h4>Technical Architecture</h4>
                <ul class="tech-list">
                    <li><strong>Neural Engine:</strong> Custom-built transformer architecture with 175B parameters</li>
                    <li><strong>Edge Computing:</strong> Distributed nodes across 15+ global regions</li>
                    <li><strong>Caching Layer:</strong> Redis-powered intelligent response caching</li>
                    <li><strong>Load Balancing:</strong> Dynamic traffic distribution for optimal performance</li>
                </ul>
            </div>
            <div class="modal-section">
                <h4>Performance Metrics</h4>
                <p>Our infrastructure is optimized for speed with multi-region deployment, ensuring users worldwide experience minimal latency. Real-time monitoring and auto-scaling guarantee consistent performance even during peak usage.</p>
            </div>
        `
    },
    security: {
        title: "Enterprise-Grade Security",
        content: `
            <div class="modal-section">
                <h4>Security Standards</h4>
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="stat-value">AES-256</div>
                        <div class="stat-label">Encryption Standard</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">SOC 2</div>
                        <div class="stat-label">Type II Certified</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">GDPR</div>
                        <div class="stat-label">Compliant</div>
                    </div>
                </div>
            </div>
            <div class="modal-section">
                <h4>Data Protection</h4>
                <ul class="tech-list">
                    <li><strong>End-to-End Encryption:</strong> All conversations encrypted in transit and at rest</li>
                    <li><strong>Zero-Knowledge Architecture:</strong> Your data is never used for training</li>
                    <li><strong>Private Deployment:</strong> Option for on-premise or VPC deployment</li>
                    <li><strong>Access Controls:</strong> Role-based permissions and SSO integration</li>
                </ul>
            </div>
            <div class="modal-section">
                <h4>Compliance & Auditing</h4>
                <p>Regular third-party security audits, penetration testing, and compliance certifications ensure your data remains protected. We maintain detailed audit logs and provide transparency reports on request.</p>
            </div>
        `
    },
    accuracy: {
        title: "Smart & Accurate AI",
        content: `
            <div class="modal-section">
                <h4>Model Performance</h4>
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="stat-value">96.8%</div>
                        <div class="stat-label">Accuracy Rate</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">128K</div>
                        <div class="stat-label">Context Window</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">50+</div>
                        <div class="stat-label">Languages Supported</div>
                    </div>
                </div>
            </div>
            <div class="modal-section">
                <h4>Intelligence Features</h4>
                <ul class="tech-list">
                    <li><strong>Context Awareness:</strong> Maintains conversation history for coherent responses</li>
                    <li><strong>Multi-Modal Understanding:</strong> Process text, code, and structured data</li>
                    <li><strong>Reasoning Engine:</strong> Advanced logic and problem-solving capabilities</li>
                    <li><strong>Continuous Learning:</strong> Regular model updates with latest knowledge</li>
                </ul>
            </div>
            <div class="modal-section">
                <h4>Quality Assurance</h4>
                <p>Our AI undergoes rigorous testing and validation across diverse scenarios. Human feedback loops and automated quality checks ensure responses remain accurate, relevant, and helpful across all use cases.</p>
            </div>
        `
    }
};

function openModal(type) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    const data = modalContent[type];
    
    modalBody.innerHTML = `
        <h2>${data.title}</h2>
        ${data.content}
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}
