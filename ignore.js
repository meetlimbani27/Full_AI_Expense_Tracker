const CATEGORIES = [
  {
    "Housing": [
      "Rent",
      "Mortgage Payments",
      "Utility Bills (Electricity, Water, Heating)",
      "Maintenance and Repairs",
      "Property Taxes",
      "Home Decor and Furnishings"
    ]
  },
  {
    "Transportation": [
      "Fuel",
      "Public Transportation Costs",
      "Vehicle Maintenance",
      "Parking Fees",
      "Tolls"
    ]
  },
  {
    "Food": [
      "Groceries",
      "Dining Out",
      "Snacks and Beverages",
      "Takeout and Delivery"
    ]
  },
  {
    "Personal Care": [
      "Gym Memberships",
      "Toiletries",
      "Haircuts and Salon Services",
      "Spa Treatments"
    ]
  },
  {
    "Health and Medical": [
      "Health Care Expenses",
      "Medications"
    ]
  },
  {
    "Entertainment and Leisure": [
      "Movies, Concerts, and Shows",
      "Sports Events and Activities",
      "Hobbies and Crafts",
      "Subscriptions (Streaming Services, Magazines)",
      "Vacations and Travel"
    ]
  },
  {
    "Clothing and Laundry": [
      "Clothing Purchases",
      "Shoes",
      "Accessories",
      "Laundry"
    ]
  },
  {
    "Debt Payments": [
      "Credit Card Payments",
      "Loans (Personal, Student, etc.)",
      "Other Debt Repayments"
    ]
  },
  {
    "Savings and Investments": [
      "Contributions to Savings Accounts",
      "Stocks and Other Investments"
    ]
  },
  {
    "Education": [
      "Tuition Fees",
      "Books and Supplies",
      "Educational Courses and Workshops"
    ]
  },
  {
    "Insurance": [
      "Health Insurance",
      "Homeowners/Renters Insurance",
      "Life Insurance",
      "Auto Insurance"
    ]
  },
  {
    "Taxes and Legal Fees": [
      "Property Taxes",
      "Income Taxes",
      "Legal Fees"
    ]
  },
  {
    "Pet Care": [
      "Pet Food",
      "Veterinary Expenses",
      "Pet Supplies and Services"
    ]
  },
  {
    "Technology and Gadgets": [
      "Electronics Purchases",
      "Software Subscriptions",
      "Tech Accessories"
    ]
  },
  {
    "Gifts and Donations": [
      "Gifts for Others",
      "Charitable Donations"
    ]
  },
  {
    "Miscellaneous": [
      "Unexpected Expenses",
      "Other Expenses Not Categorized Above"
    ]
  }
];

// const test = JSON.stringify(CATEGORIES, null, 2);
test = `[${CATEGORIES.map(catObj => `'${Object.keys(catObj)[0]}'`).join(', ')}]`
console.log(test);
