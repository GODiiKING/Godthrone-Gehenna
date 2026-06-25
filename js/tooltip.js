// tooltip.js - Dynamic event delegation for skill hover descriptions

document.addEventListener('DOMContentLoaded', () => {
    const tooltip = document.getElementById('globalTooltip');
    
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('[data-tooltip]');
        
        if (target) {
            const tooltipText = target.getAttribute('data-tooltip');
            tooltip.innerHTML = tooltipText; 
            
            const rect = target.getBoundingClientRect();
            
            // Center exactly underneath the hovered button
            const x = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
            const y = rect.bottom + 12 + window.scrollY; // 12px below the button
            
            tooltip.style.left = `${Math.max(10, x)}px`;
            tooltip.style.top = `${y}px`;
            
            tooltip.classList.add('active');
        }
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('[data-tooltip]');
        if (target) {
            tooltip.classList.remove('active');
        }
    });

    // --- NEW FIX: Destroy ghost tooltips on click ---
    // If the player clicks an action, we immediately hide the tooltip.
    // This prevents it from getting stuck if the button is removed from the screen (e.g., player dies/wins).
    document.addEventListener('click', () => {
        if (tooltip.classList.contains('active')) {
            tooltip.classList.remove('active');
        }
    });
});