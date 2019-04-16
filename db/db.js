var mysql = require('mysql');
const fs = require("fs");

var conn = mysql.createConnection({
	user: 'vlad_ovsienko',
	password: 'VLADbts140598',
	host: 'mysql.zzz.com.u',
	database: 'vlad_ovsienko'
});

conn.connect((err) => {
	if(err){
		console.log(err);
	}else{
        console.log("Connected to database!");
    }
});

//conn.query(fs.readFileSync("./db/chat_db.sql", {encoding: "utf-8"}));
module.exports = {
    //conn: conn,
    
    // CREATE
    addAuthor: (firstName, lastName, middleName, callback) => {
		conn.query('INSERT INTO authors(first_name, last_name, middle_name) VALUES(\''+firstName+'\', \''+lastName+'\', \''+middleName+'\')', callback);
    },
    addBook: (name, datePublishing, publisherId, headingId, callback) => {
		conn.query('INSERT INTO books(name, date_publishing, publisher_id, heading_id) VALUES(\''+name+'\', \''+datePublishing+'\', \''+publisherId+'\', \''+headingId+'\')', callback);
    },
    addHeading: (name, parentHeadingId, callback) => {
		conn.query('INSERT INTO headings(name, parent_heading_id) VALUES(\''+name+'\', '+parentHeadingId+')', callback);
    },
    addPublisher: (name, address, phone, callback) => {
		conn.query('INSERT INTO publishers(name, address, phone) VALUES(\''+name+'\', \''+address+'\', \''+phone+'\')', callback);
    },
    addPhoto: (base64, callback) => {
		conn.query('INSERT INTO photos(base64) VALUES(\''+base64+'\')', callback);
    },
    addIBookAuthor: (bookId, authorId, callback) => {
		conn.query('INSERT INTO books_authors(book_id, author_id) VALUES(\''+bookId+'\', \''+authorId+'\')', callback);
    },
    addIBookPhoto: (bookId, photoId, callback) => {
		conn.query('INSERT INTO books_photos(book_id, photo_id) VALUES(\''+bookId+'\', \''+photoId+'\')', callback);
    },
    // READ
    getAuthors: (callback) => {
        conn.query('SELECT * FROM authors', callback);
    },
    getAuthor: (id, callback) => {
      conn.query('SELECT * FROM authors WHERE id = ' + id, callback);
    },
    getPublishers: (callback) => {
		conn.query('SELECT * FROM publishers', callback);
    },
    getPublisher: (id, callback) => {
      conn.query('SELECT * FROM publishers WHERE id = ' + id, callback);
    },
    getHeadings: (callback) => {
		conn.query('SELECT * FROM headings', callback);
    },
    getHeading: (id, callback) => {
      conn.query('SELECT * FROM headings WHERE id = ' + id, callback);
    },
    getHeadingsWithoutParent: (callback) => {
		conn.query('SELECT * FROM headings WHERE parent_heading_id IS NULL', callback);
    },
    getHeadingsByParentId: (id, callback) => {
		conn.query('SELECT * FROM headings WHERE parent_heading_id = ' + id, callback);
    },
    getBooks: (callback) => {
		conn.query('SELECT * FROM books', callback);
    },
    getBooksByPublisher: (idPublisher, callback) => {
      conn.query('SELECT * FROM books WHERE publisher_id = ' + idPublisher, callback);
    },
    getBook: (id, callback) => {
      conn.query('SELECT * FROM books WHERE id = ' + id, callback);
    },
    getPhotos: (callback) => {
		conn.query('SELECT * FROM photos', callback);
    },
    getIBooksAuthors: (callback) => {
		conn.query('SELECT * FROM books_authors', callback);
    },
    getIBookPhotosOfBook: (idBook, callback) => {
      conn.query('SELECT * FROM books_photos WHERE book_id = ' + idBook, callback);
    },
    getIAuthorsOfBook: (id, callback) => {
      conn.query('select book_author.*, author.* '+
      'from books_authors as book_author '+
      'inner join authors as author on author.id = book_author.author_id WHERE book_id = ' + id, callback);
    },
    getIBooksPhotos: (callback) => {
		conn.query('SELECT * FROM books_photos', callback);
    },
    getIImagesOfBook: (id, callback) => {
      conn.query('select book_photo.*, photo.* '+
      'from books_photos as book_photo '+
      'inner join photos as photo on photo.id = book_photo.photo_id WHERE book_id = ' + id, callback);
    },
    // UPDATE
    updateAuthor: (id, firstName, lastName, middleName, callback) => {
        conn.query('UPDATE authors SET first_name = \''+firstName+'\', last_name = \''+lastName+'\', middle_name = \''+middleName+'\' WHERE id = ' + id, callback);
    },
    updatePublisher: (id, name, address, phone, callback) => {
        conn.query('UPDATE publishers SET name = \''+name+'\', address = \''+address+'\', phone = \''+phone+'\' WHERE id = ' + id, callback);
    },
    updateBook: (id, name, datePublishing, publisherId, headingId, callback) => {
        conn.query('UPDATE books SET name = \''+name+'\', date_publishing = \''+datePublishing+'\', publisher_id = \''+publisherId+'\', heading_id = \''+headingId+'\' WHERE id = ' + id, callback);
    },
    updateHeading: (id, name, parentHeadingId, callback) => {
        conn.query('UPDATE headings SET name = \''+name+'\', parent_heading_id = '+parentHeadingId+' WHERE id = ' + id, callback);
    },
    // DELETE
    deleteAuthor: (id, callback) => {
		conn.query('DELETE FROM authors WHERE id = '+id, callback);
    },
    deletePhoto: (id, callback) => {
      conn.query('DELETE FROM photos WHERE id = '+id, callback);
    },
    deleteBook: (id, callback) => {
		conn.query('DELETE FROM books WHERE id = '+id, callback);
    },
    deleteBooksByPublisher: (idPublisher, callback) => {
      conn.query('DELETE FROM books WHERE publisher_id = '+idPublisher, callback);
    },
    deleteBooksByHeading: (idHeading, callback) => {
      conn.query('DELETE FROM books WHERE heading_id = '+idHeading, callback);
    },
    deletePublisher: (id, callback) => {
		conn.query('DELETE FROM publishers WHERE id = '+id, callback);
    },
    deleteHeading: (id, callback) => {
		conn.query('DELETE FROM headings WHERE id = '+id, callback);
    },
    deleteIBookAuthor: (id, callback) => {
		conn.query('DELETE FROM books_authors WHERE id = '+id, callback);
    },
    deleteIBookPhotos: (id, callback) => {
		conn.query('DELETE FROM books_photos WHERE id = '+id, callback);
    },
    deleteIBookPhotosOfBook: (id, callback) => {
      conn.query('DELETE FROM books_photos WHERE book_id = '+id, callback);
    },
    deleteIBookAuthorOfBook: (id, callback) => {
      conn.query('DELETE FROM books_authors WHERE book_id = '+id, callback);
    }
};