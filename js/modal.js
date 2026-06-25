// modal.js - Handles Rock-Paper-Scissors Overlay Interface

document.addEventListener('DOMContentLoaded', () => {
    const rpsButton = document.getElementById('rpsButton');
    const rpsModal = document.getElementById('rpsModal');
    const closeModal = document.getElementById('closeModal');

    // Display the modal when the '?' button is clicked
    if (rpsButton && rpsModal) {
        rpsButton.addEventListener('click', () => {
            rpsModal.classList.add('active');
        });
    }

    // Close the modal when the 'X' button is clicked
    if (closeModal && rpsModal) {
        closeModal.addEventListener('click', () => {
            rpsModal.classList.remove('active');
        });
    }

    // Close the modal if the user clicks the dark background outside the image
    if (rpsModal) {
        rpsModal.addEventListener('click', (e) => {
            if (e.target === rpsModal) {
                rpsModal.classList.remove('active');
            }
        });
    }
});