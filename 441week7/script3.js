// Colin
const API_URL = 'https://Colin1202.pythonanywhere.com/api/books';
 
 
async function fetchBooks() {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = ''; // Clear existing list
 
    try {
        
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
 
        const books = await response.json();
 
        
        books.forEach(book => {
            const li = document.createElement('li');
 
            // Create HTML structure for the book
            li.innerHTML = `
                <strong>${book.title}</strong>
                <span>Author: ${book.author}</span>
                <span>Publisher: ${book.publisher || 'Not specified'}</span>
                <span>Description: ${book.description || 'No description available'}</span>
            `;
 
            bookList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching books:', error);
        bookList.innerHTML = '<li>Error loading books. Please try again later.</li>';
    }
}
 
 
document.addEventListener('DOMContentLoaded', fetchBooks);
