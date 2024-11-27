/* This is Colin, my JS*/
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const queryInput = searchForm.querySelector('input[name="query"]');

    searchForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        const query = queryInput.value.trim().toLowerCase();
        if (query === '') return;

        const productSections = document.querySelectorAll('.product-details');
        let found = false;

        productSections.forEach(section => {
            const productName = section.querySelector('h1').textContent.toLowerCase();
            if (productName.includes(query)) {
                found = true;
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });

        if (!found) {
            alert('Product not found.');
        }

        queryInput.value = ''; // Clear the input field after search
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const product = urlParams.get('product');

    if (product) {
        const productSection = document.getElementById(product);
        if (productSection) {
            productSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('Product not found.');
        }
    }
});