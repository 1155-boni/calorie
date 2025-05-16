const foodForm = document.getElementById('food-form');
const foodList = document.getElementById('food-list');
const totalCaloriesEl = document.getElementById('total-calories');
const resetButton = document.getElementById('reset-button');

let foods = JSON.parse(localStorage.getItem('foods')) || [];
let editIndex = null;

function saveFoods() {
  localStorage.setItem('foods', JSON.stringify(foods));
}

function renderFoods() {
  foodList.innerHTML = '';
  let total = 0;

  foods.forEach((item, index) => {
    total += item.calories;

    const li = document.createElement('li');
    li.innerHTML = `
      <span>${item.name} - ${item.calories} cal</span>
      <span>
        <span class="edit-btn" onclick="editFood(${index})">✏️</span>
        <span class="delete-btn" onclick="deleteFood(${index})">&times;</span>
      </span>
    `;
    foodList.appendChild(li);
  });

  totalCaloriesEl.textContent = total;
}

function deleteFood(index) {
  foods.splice(index, 1);
  saveFoods();
  renderFoods();
}

function editFood(index) {
  const food = foods[index];
  document.getElementById('food-name').value = food.name;
  document.getElementById('calories').value = food.calories;
  editIndex = index;
}

foodForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('food-name').value.trim();
  const calories = parseInt(document.getElementById('calories').value);

  if (name && !isNaN(calories) && calories > 0) {
    if (editIndex !== null) {
      foods[editIndex] = { name, calories };
      editIndex = null;
    } else {
      foods.push({ name, calories });
    }

    saveFoods();
    renderFoods();
    foodForm.reset();
  } else {
    alert('Please enter a valid food name and calorie count.');
  }
});

resetButton.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset the calorie list?')) {
    foods = [];
    saveFoods();
    renderFoods();
  }
});

renderFoods();
