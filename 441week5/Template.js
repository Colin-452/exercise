//Colin
// Global variable to store all countries data
let allCountries = [];

// Function to process and display data in the table
function processData(data) {
    const summary = document.getElementById('summary');
    const tableBody = document.querySelector('#data-table tbody');
    const countSpan = document.getElementById('count');

    // Update the count of retrieved countries
    countSpan.textContent = `${data.length} countries retrieved.`;

    // Clear existing table rows
    tableBody.innerHTML = '';

    // Loop through the data and create table rows
    data.forEach(country => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${country.flags.png}"></td>
            <td>${country.name.common}</td>
            <td>${country.capital?.[0] || 'N/A'}</td>
            <td>${country.population?.toLocaleString() || 'N/A'}</td>
            <td>${country.area?.toLocaleString() || 'N/A'}</td>
            <td>${country.currencies ? Object.values(country.currencies).map(c => c.name).join(', ') : 'N/A'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to apply filters based on user input
function applyFilters() {
    const population = parseInt(document.getElementById('populationFilter').value) || 0;
    const area = parseInt(document.getElementById('areaFilter').value) || 0;
    const region = document.getElementById('regionFilter').value.toLowerCase();

    // Filter the countries based on user input
    const filtered = allCountries.filter(country => {
        return country.population > population &&
               country.area > area &&
               country.region.toLowerCase().includes(region);
    });

    // Process and display the filtered data
    processData(filtered);
}

// Main function to fetch data from the API
async function main() {
    try {
        // Fetch data from the REST Countries API
        const response = await fetch('https://restcountries.com/v3.1/all');
        allCountries = await response.json();
        applyFilters(); // Apply filters on initial load
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Run the main function when the page loads
main();