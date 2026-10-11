# Library API Design

A REST API for a library's *books* resource. All paths start with /api.

## Endpoints

### 1. List all books
- *Method:* GET
- *Path:* /api/books
- *Description:* Returns every book in the library.
- *Request body:* none
- *Success status:* 200 OK

### 2. Get one book
- *Method:* GET
- *Path:* /api/books/{id}
- *Description:* Returns the single book with the given id.
- *Request body:* none
- *Success status:* 200 OK

### 3. Create a book
- *Method:* POST
- *Path:* /api/books
- *Description:* Adds a new book to the library.
- *Example request body:* {"title": "Things Fall Apart", "author": "Chinua Achebe", "year": 1958}
- *Success status:* 201 Created

### 4. Update a book
- *Method:* PUT
- *Path:* /api/books/{id}
- *Description:* Replaces the details of an existing book.
- *Example request body:* {"title": "Things Fall Apart", "author": "Chinua Achebe", "year": 1959}
- *Success status:* 200 OK

### 5. Delete a book
- *Method:* DELETE
- *Path:* /api/books/{id}
- *Description:* Removes the book with the given id.
- *Request body:* none
- *Success status:* 204 No Content

### 6. List books by an author
- *Method:* GET
- *Path:* /api/books?author=Chinua%20Achebe
- *Description:* Returns only the books written by the author given in the query parameter.
- *Request body:* none
- *Success status:* 200 OK

## Error codes

### 400 Bad Request
- The request is invalid, so the server cannot process it.
- *Example:* POST /api/books with a body that is missing the title, or where year is the text "nineteen" instead of a number.

### 404 Not Found
- The requested resource does not exist.
- *Example:* GET /api/books/9999 when no book has the id 9999. The same happens for PUT and DELETE on an id that does not exist.