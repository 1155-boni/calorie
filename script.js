// DOM Element References
const calorieForm = document.getElementById("calorie-form");
const foodNameInput = document.getElementById("food-name");
const totalCaloriesDisplay = document.getElementById("total-calories");
const foodList = document.getElementById("food-list");
const resetButton = document.getElementById("reset-button");
const emptyListMessage = document.getElementById("empty-list-message");

// Array to store food items
let foodItems = JSON.parse(localStorage.getItem("foodItems")) || [];
let totalCalories = 0;

// NEW API Key and Base URL for CalorieNinjas Nutrition API
const API_KEY = "EuQF1VpmoCrnxNZVfabKVwCrUFZNzjBeVv87dM6a"; // Your LATEST CalorieNinjas API Key
const API_BASE_URL = "https://api.calorieninjas.com/v1/nutrition?query="; // Correct CalorieNinjas API endpoint with query

// Function to update the total calories displayed and render items
function updateDisplay() {
  totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0);
  totalCaloriesDisplay.textContent = totalCalories;
  renderFoodItems();
}

// Function to render food items in the list
function renderFoodItems() {
  foodList.innerHTML = ""; // Clear existing list

  if (foodItems.length === 0) {
    // Show empty message if no items
    emptyListMessage.classList.remove("hidden"); // Ensure it's visible
  } else {
    // Hide empty message if there are items
    emptyListMessage.classList.add("hidden");

    foodItems.forEach((item, index) => {
      const listItem = document.createElement("li");
      listItem.className = "py-3 flex justify-between items-center"; // Tailwind classes for styling
      listItem.innerHTML = `
                <span class="text-gray-800 text-lg">${item.name} - <span class="font-semibold text-green-600">${item.calories}</span> calories</span>
                <button class="remove-item bg-red-400 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-200" data-index="${index}">Remove</button>
            `;
      foodList.appendChild(listItem);
    });
  }
  saveFoodItems();
}

// Function to save food items to localStorage
function saveFoodItems() {
  localStorage.setItem("foodItems", JSON.stringify(foodItems));
}

// Function to fetch calorie data from CalorieNinjas Nutrition API
async function fetchCalorieData(foodQuery) {
  if (!foodQuery) return null;

  // Construct the URL by appending the encoded food query to the base URL
  const url = `${API_BASE_URL}${encodeURIComponent(foodQuery)}`; // This is fine, since API_BASE_URL ends with ?query=

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": API_KEY, // Use X-Api-Key header as per CalorieNinjas docs
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
      // More specific alerts for common API errors
      if (response.status === 401 || response.status === 403) {
        alert(
          "Authentication failed. Please check your API key and ensure it is correct and active for CalorieNinjas."
        );
      } else if (response.status === 429) {
        alert(
          "Too many requests. You have hit the CalorieNinjas API rate limit. Please wait a moment and try again."
        );
      } else if (response.status >= 500) {
        alert(
          "Server error from the CalorieNinjas API. Please try again later."
        );
      } else {
        alert(
          `Error fetching calorie data: ${response.status} - ${errorText}. Please try a more specific food item or check your network.`
        );
      }
      return null;
    }

    const data = await response.json();
    console.log("CalorieNinjas API Response for:", foodQuery, data);

    // CalorieNinjas API response structure typically returns { "items": [{ ... }] }
    if (data && data.items && data.items.length > 0) {
      const calories = parseFloat(data.items[0].calories); // Access 'items' array
      return isNaN(calories) ? 0 : Math.round(calories);
    } else {
      console.log("No nutrition data found for:", foodQuery);
      return null;
    }
  } catch (error) {
    console.error("Network or parsing error:", error);
    alert(
      "Could not connect to calorie database. Please check your internet connection or try again later."
    );
    return null;
  }
}

// --- Event Listeners (Remain the same) ---

// Add event listener for form submission
calorieForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const foodName = foodNameInput.value.trim();

  if (!foodName) {
    alert("Please enter a food item.");
    return;
  }

  const addButton = calorieForm.querySelector('button[type="submit"]');
  const originalButtonText = addButton.textContent;
  addButton.textContent = "Adding...";
  addButton.disabled = true;
  addButton.classList.add("opacity-50", "cursor-not-allowed");

  try {
    const fetchedCalories = await fetchCalorieData(foodName);

    if (fetchedCalories !== null) {
      const newFoodItem = {
        name: foodName,
        calories: fetchedCalories,
      };
      foodItems.push(newFoodItem);
      updateDisplay();
      foodNameInput.value = "";
    } else {
      alert(
        `Could not find calorie data for "${foodName}". Please try a different name or be more specific (e.g., "1 large apple", "chicken breast 100g").`
      );
    }
  } catch (error) {
    console.error("Error adding food item:", error);
    alert("An unexpected error occurred while adding the food item.");
  } finally {
    addButton.textContent = originalButtonText;
    addButton.disabled = false;
    addButton.classList.remove("opacity-50", "cursor-not-allowed");
  }
});

// Add event listener for removing food items (using event delegation)
foodList.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-item")) {
    const indexToRemove = parseInt(e.target.dataset.index);
    foodItems.splice(indexToRemove, 1);
    updateDisplay();
  }
});

// Add event listener for reset button
resetButton.addEventListener("click", () => {
  if (
    confirm(
      "Are you sure you want to reset all daily calories? This action cannot be undone."
    )
  ) {
    foodItems = [];
    updateDisplay();
  }
});

// Initial display update when the page loads
updateDisplay();
