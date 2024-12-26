document.getElementById("searchBtn").addEventListener("click", async function () {
  console.log("Search button clicked");
  const categoryInput = document.getElementById("category");
  const category = categoryInput.value.trim().toLowerCase();
  console.log(`Category: ${category}`);
  const errorMessage = document.getElementById("error-message");

  // Check if category is empty
  if (!category) {
    console.log("Category is empty");
    errorMessage.classList.remove("d-none");
    categoryInput.classList.add("is-invalid");
    categoryInput.placeholder = "Please enter category!";
    return;
  }

  console.log("Category is valid");
  errorMessage.classList.add("d-none");
  categoryInput.classList.remove("is-invalid");
  categoryInput.placeholder = "Enter category, e.g., fantasy";

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p>Loading...</p>";

  const baseUrl = "https://openlibrary.org/subjects/";
  const url = `${baseUrl}${category}.json`;
  console.log(`Fetching books from: ${url}`);

  try {
    // Fetch books data from Open Library API
    const response = await axios.get(url);
    console.log("Books data fetched successfully");
    const books = response.data.works;
    if (!books || books.length === 0) {
      console.log("No books found");
      resultsDiv.innerHTML = "<p>No books found.</p>";
      return;
    }

    console.log(`Found ${books.length} books`);
    resultsDiv.innerHTML = "";
    books.forEach((book) => {
      console.log(`Processing book: ${book.title}`);
      const bookCard = document.createElement("div");
      bookCard.className = "col-md-4";

      // Set book cover image
      const bookCover = book.cover_id
        ? `<img src="https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg" class="card-img-top" alt="Book Cover">`
        : `<img src="https://placehold.co/150x200?text=No+Cover" class="card-img-top" alt="No Cover">`;
      bookCard.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${book.title}</h5>
                ${bookCover}
                <p class="card-text">${
                  book.authors[0]?.name || "Unknown Author"
                }</p>
                <button class="btn btn-primary btn-sm" onclick="fetchBookDetails('${
                  book.key
                }')">View Details</button>
            </div>
        </div>
    `;

      resultsDiv.appendChild(bookCard); // Append book card to the results div
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    resultsDiv.innerHTML =
      "<p>Failed to fetch books. Please try again later.</p>";
  }
});

// Event listener for input in the category textbox
document.getElementById("category").addEventListener("input", function () {
  console.log("Category input changed");
  const categoryInput = this;
  const errorMessage = document.getElementById("error-message");

  // Reset the input field to normal state
  errorMessage.classList.add("d-none");
  categoryInput.classList.remove("is-invalid");
  categoryInput.placeholder = "Enter category, e.g., fantasy";
});

// Fetch book details and display in modal
async function fetchBookDetails(key) {
  console.log(`Fetching book details for: ${key}`);
  const url = `https://openlibrary.org${key}.json`;

  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalImage = document.getElementById("modalImage");

  modalTitle.textContent = "Loading...";
  modalDescription.textContent = "Fetching book details...";
  modalImage.classList.add("d-none");

  const modal = new bootstrap.Modal(document.getElementById("bookModal"));
  modal.show();

  try {
    const response = await axios.get(url);
    console.log("Book details fetched successfully");
    const data = response.data;

    modalTitle.textContent = data.title || "No title available"; // Set book title

    // Set book description
    if (typeof data.description === "string") {
      modalDescription.textContent = data.description;
    } else if (
      data.description &&
      typeof data.description.value === "string"
    ) {
      modalDescription.textContent = data.description.value;
    } else {
      modalDescription.textContent = "No description available.";
    }

    // Set book cover image
    if (data.covers && data.covers.length > 0) {
      modalImage.src = `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`;
      modalImage.classList.remove("d-none");
    } else {
      modalImage.src = "";
      modalImage.classList.add("d-none");
    }
  } catch (error) {
    console.error("Error fetching book details:", error);
    modalTitle.textContent = "Error";
    modalDescription.textContent = "Failed to fetch book details.";
  }
}