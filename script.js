document.addEventListener('DOMContentLoaded', () => {
  const foodList = document.getElementById('food-list');
  const totalCaloriesDisplay = document.getElementById('total-calories');
  const addFoodForm = document.getElementById('add-food-form');
  const foodSelect = document.getElementById('food-select');
  const resetButton = document.getElementById('reset-button');

  let foods = JSON.parse(localStorage.getItem('foods')) || [];

  const foodData = {
    apple: 96,
    banana: 89,
    burger: 250,
    pizza: 250,
    salad: 200,
    sandwich: 300,
    soup: 150,
    steak: 320,
    chicken: 290,
    fries: 370
  };

  function renderFoods() {
    foodList.innerHTML = '';
    foods.forEach((food, index) => {
      const foodItem = document.createElement('li');
      foodItem.textContent = food.custom ? `${food.name}: ${food.calories} calories` : `${food}: ${foodData[food]} calories`;
      foodList.appendChild(foodItem);
    });
    updateTotalCalories();
  }

  function updateTotalCalories() {
    const totalCalories = foods.reduce((total, food) => total + (food.custom ? food.calories : foodData[food]), 0);
    totalCaloriesDisplay.textContent = totalCalories;
  }

  function saveFoods() {
    localStorage.setItem('foods', JSON.stringify(foods));
  }

  addFoodForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedFood = foodSelect.value;
    if (selectedFood === 'custom') {
      const customName = prompt("Enter the food name:");
      const customCalories = prompt("Enter the calories:");
      if (customName && !isNaN(customCalories)) {
        foods.push({ name: customName, calories: parseInt(customCalories), custom: true });
        saveFoods();
        renderFoods();
      }
    } else if (selectedFood) {
      foods.push(selectedFood);
      saveFoods();
      renderFoods();
    }
  });

  resetButton.addEventListener('click', () => {
    foods = [];
    saveFoods();
    renderFoods();
  });

  renderFoods();
});