import { fetchProducts } from "./api.js";

const productsContainer = document.getElementById("products");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const sortSelect = document.getElementById("sort");
const statusMessage = document.getElementById("status");
const errorMessage = document.getElementById("error");
const cartCount = document.getElementById("cart-count");
const resetButton = document.getElementById("reset");

let products = [];

let cart = JSON.parse(
    localStorage.getItem("productCart") || "[]"
);

function updateCartCount() {
    cartCount.textContent = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );
}

function saveCart() {
    localStorage.setItem("productCart", JSON.stringify(cart));
    updateCartCount();
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
}

function createProductCard(product) {
    const card = document.createElement("article");
    card.className = "product";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.title;
    image.loading = "lazy";

    const title = document.createElement("h2");
    title.textContent = product.title;

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = `$${product.price.toFixed(2)}`;

    const category = document.createElement("p");
    category.className = "category-name";
    category.textContent = product.category;

    const button = document.createElement("button");
    button.textContent = "Add to Cart";

    button.addEventListener("click", () => {
        const existingItem = cart.find(
            item => item.id === product.id
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                quantity: 1
            });
        }

        saveCart();
        button.textContent = "Added ✓";

        setTimeout(() => {
            button.textContent = "Add to Cart";
        }, 1000);
    });

    card.append(image, title, price, category, button);

    return card;
}

function renderProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categorySelect.value;
    const sortValue = sortSelect.value;

    let filteredProducts = products.filter(product => {
        const matchesSearch = product.title
            .toLowerCase()
            .includes(searchTerm);

        const matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    if (sortValue === "low-high") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === "high-low") {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortValue === "name") {
        filteredProducts.sort((a, b) =>
            a.title.localeCompare(b.title)
        );
    }

    productsContainer.replaceChildren();

    if (filteredProducts.length === 0) {
        statusMessage.textContent = "No matching products found.";
        return;
    }

    statusMessage.textContent =
        `${filteredProducts.length} products found.`;

    filteredProducts.forEach(product => {
        productsContainer.appendChild(createProductCard(product));
    });
}

function loadCategories() {
    const categories = [
        ...new Set(products.map(product => product.category))
    ];

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

async function initializeApp() {
    statusMessage.textContent = "Loading products...";
    errorMessage.hidden = true;

    try {
        products = await fetchProducts();

        loadCategories();
        renderProducts();
    } catch (error) {
        statusMessage.textContent = "";
        showError(
            "Products could not be loaded. Please check your internet connection and try again."
        );
    }
}

searchInput.addEventListener("input", renderProducts);
categorySelect.addEventListener("change", renderProducts);
sortSelect.addEventListener("change", renderProducts);

resetButton.addEventListener("click", () => {
    searchInput.value = "";
    categorySelect.value = "all";
    sortSelect.value = "default";
    renderProducts();
});

updateCartCount();
initializeApp();
